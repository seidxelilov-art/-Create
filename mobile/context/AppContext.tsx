import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Car {
  id: string;
  plate: string;
  status: "Aktiv" | "Deaktiv";
  createdAt: string;
  texnikiPasport?: string;
  qeydiyyatTarixi?: string;
  markaModel?: string;
  buraxilisIli?: string;
  mehdudiyyetHebs?: string;
  texnikiBaxisBitme?: string;
  smsradarBitme?: string;
}

export interface Fine {
  id: string;
  carId: string;
  protokol: string;
  avtomobil: string;
  cerimelenan: string;
  cerime: number;
  endirim: number;
  status: string;
  suretHeddi: number;
  asdiqinizSuret: number;
  qerarTarix: string;
  tarix: string;
  qeydAlınmaYeri: string;
  ixmNote: string;
  mediaUri?: string;
  mediaUri2?: string;
}

export interface PaymentRecord extends Fine {
  odenisTarixi: string;
  total: number;
  maskedCard?: string;
  qebzNomresi?: string;
}

export interface AppNotification {
  id: string;
  type: "cerime" | "odenis";
  plate: string;
  message: string;
  link?: string;
  createdAt: string;
  timeText: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  avatarUri?: string;
}

interface AppContextType {
  cars: Car[];
  fines: Fine[];
  paymentHistory: PaymentRecord[];
  notifications: AppNotification[];
  profile: UserProfile;
  isAdmin: boolean;
  addCar: (plate: string) => void;
  removeCar: (id: string) => void;
  addFine: (fine: Omit<Fine, "id">) => void;
  updateFine: (id: string, fine: Partial<Fine>) => void;
  removeFine: (id: string) => void;
  markFinePaid: (
    fineId: string,
    maskedCard: string,
    total: number,
    qebzNomresi: string
  ) => void;
  removePaymentRecord: (id: string) => void;
  updatePaymentRecord: (id: string, data: Partial<PaymentRecord>) => void;
  addPaymentRecord: (record: Omit<PaymentRecord, "id">) => void;
  clearNotifications: () => void;
  setIsAdmin: (val: boolean) => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  getFinesForCar: (carId: string) => Fine[];
  getPaymentHistoryForCar: (carId: string) => PaymentRecord[];
}

const AppContext = createContext<AppContextType | null>(null);

const K = {
  cars: "@smsradar_cars",
  fines: "@smsradar_fines",
  paymentHistory: "@smsradar_payhistory",
  notifications: "@smsradar_notifs",
  profile: "@smsradar_profile",
  isAdmin: "@smsradar_isAdmin",
  seeded: "@smsradar_seeded_v6",
};

const LEGACY_KEYS = [
  { from: "@smsradar_cars_v2", to: K.cars },
  { from: "@smsradar_cars_v3", to: K.cars },
  { from: "@smsradar_fines_v3", to: K.fines },
  { from: "@smsradar_fines", to: null },
  { from: "@smsradar_payment_history_v3", to: K.paymentHistory },
  { from: "@smsradar_notifications_v3", to: K.notifications },
];

// Sizin əsl maşınlarınız — həmişə burada olacaq, cərimələr boş başlayır
const MY_CARS: Car[] = [
  {
    id: "car1",
    plate: "10AZ503",
    status: "Aktiv",
    createdAt: new Date().toISOString(),
    texnikiPasport: "BB890556",
    qeydiyyatTarixi: "2026-04-22 17:39:18",
    markaModel: "MERCEDES BENZ E300 DE HİBRİD MİNİK",
    buraxilisIli: "2022",
    mehdudiyyetHebs: "Yoxdur",
    texnikiBaxisBitme: "2027-12-11",
    smsradarBitme: "2026-06-21",
  },
  {
    id: "car2",
    plate: "10AA134",
    status: "Aktiv",
    createdAt: new Date().toISOString(),
    texnikiPasport: "BB226822",
    qeydiyyatTarixi: "2026-04-19 19:40:24",
    markaModel: "MERCEDES BENZ S500 MİNİK",
    buraxilisIli: "2020",
    mehdudiyyetHebs: "Yoxdur",
    texnikiBaxisBitme: "2027-12-30",
    smsradarBitme: "2026-06-19",
  },
];

// Ödənilmiş cərimələrin tarixçəsi — screenshotlardan əlavə edilib
const MY_PAYMENT_HISTORY: PaymentRecord[] = [
  // ── 10AZ503 (car1) — 4 ödəniş ─────────────────────────────
  {
    id: "mypaid_az503_1",
    carId: "car1",
    protokol: "EQ36203962",
    avtomobil: "10AZ503",
    cerimelenan: "RİLEY COLE NATHANİEL",
    cerime: 40,
    endirim: 4,
    status: "Ödənilib",
    suretHeddi: 0,
    asdiqinizSuret: 0,
    qerarTarix: "20.05.2026",
    tarix: "19.05.2026 18:17:04",
    qeydAlınmaYeri: "Babək pr, Arzu şadlıq sarayının qarşısı mərkəz istiqaməti TŞ4-010",
    ixmNote: "İXM:329.1. Təhlükəsizlik kəmərini bağlamadan nəqliyyat vasitəsini idarə etməyə görə",
    odenisTarixi: "2026-06-01 12:06:27",
    total: 37.30,
    maskedCard: "****",
    qebzNomresi: "3601226427",
  },
  {
    id: "mypaid_az503_2",
    carId: "car1",
    protokol: "EQ36238987",
    avtomobil: "10AZ503",
    cerimelenan: "RİLEY COLE NATHANİEL",
    cerime: 50,
    endirim: 5,
    status: "Ödənilib",
    suretHeddi: 60,
    asdiqinizSuret: 81,
    qerarTarix: "21.05.2026",
    tarix: "21.05.2026 20:20:00",
    qeydAlınmaYeri: "Səbail rayonu Salyan şossesi Bibiheybət məscidinin yaxınlığı Bayraq Meydanı ist",
    ixmNote: "İXM:328.2. Yolda müəyyən edilmiş hərəkət sürətini 21-40 km/saat həddində aşmağa görə",
    odenisTarixi: "2026-06-01 12:05:33",
    total: 46.30,
    maskedCard: "****",
    qebzNomresi: "3601238987",
  },
  {
    id: "mypaid_az503_3",
    carId: "car1",
    protokol: "EQ36232005",
    avtomobil: "10AZ503",
    cerimelenan: "RİLEY COLE NATHANİEL",
    cerime: 50,
    endirim: 5,
    status: "Ödənilib",
    suretHeddi: 60,
    asdiqinizSuret: 84,
    qerarTarix: "21.05.2026",
    tarix: "21.05.2026 15:42:27",
    qeydAlınmaYeri: "Səbail rayonu Salyan şossesi Bayraq Meydanının yaxınlığı Bayıl ist1",
    ixmNote: "İXM:328.2. Yolda müəyyən edilmiş hərəkət sürətini 21-40 km/saat həddində aşmağa görə",
    odenisTarixi: "2026-06-01 12:05:50",
    total: 46.30,
    maskedCard: "****",
    qebzNomresi: "3601232005",
  },
  {
    id: "mypaid_az503_4",
    carId: "car1",
    protokol: "EQ36239077",
    avtomobil: "10AZ503",
    cerimelenan: "RİLEY COLE NATHANİEL",
    cerime: 50,
    endirim: 5,
    status: "Ödənilib",
    suretHeddi: 60,
    asdiqinizSuret: 90,
    qerarTarix: "21.05.2026",
    tarix: "21.05.2026 20:24:42",
    qeydAlınmaYeri: "Səbail rayonu Salyan şossesi Bayraq Meydanının yaxınlığı Azneft meydanı ist2",
    ixmNote: "İXM:328.2. Yolda müəyyən edilmiş hərəkət sürətini 21-40 km/saat həddində aşmağa görə",
    odenisTarixi: "2026-06-01 12:05:17",
    total: 46.30,
    maskedCard: "****",
    qebzNomresi: "3601239077",
  },
  // ── 10AA134 (car2) — 7 ödəniş ─────────────────────────────
  {
    id: "mypaid_aa134_1",
    carId: "car2",
    protokol: "EQ35880128",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 50,
    endirim: 5,
    status: "Ödənilib",
    suretHeddi: 70,
    asdiqinizSuret: 104,
    qerarTarix: "07.05.2026",
    tarix: "07.05.2026 12:17:23",
    qeydAlınmaYeri: "Bakı-Qazax yolu 29.5-ci km Bakı ist",
    ixmNote: "İXM:328.1. Yolda müəyyən edilmiş hərəkət sürətini 21-40 km/saat həddində aşmağa görə",
    odenisTarixi: "2026-06-01 12:08:29",
    total: 46.30,
    maskedCard: "****",
    qebzNomresi: "3601880128",
  },
  {
    id: "mypaid_aa134_2",
    carId: "car2",
    protokol: "EQ28207494",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 100,
    endirim: 10,
    status: "Ödənilib",
    suretHeddi: 0,
    asdiqinizSuret: 0,
    qerarTarix: "07.05.2026",
    tarix: "07.05.2026 18:22:52",
    qeydAlınmaYeri: "Neftçilər prospekti Dəniz vağzalının qarşısı",
    ixmNote: "İXM:327.1-1. 5.9, 5.10.1 – 5.10.3 nişanları ilə işarələnmiş, ümumi istifadədə olan nəqliyyat vasitələri üçün nəzərdə tutulmuş hərəkət zolağı olan yollarda hərəkət edən digər nəqliyyat vasitələrinin həmin zolaqda hərəkət etməsinə görə",
    odenisTarixi: "2026-06-01 12:08:15",
    total: 91.30,
    maskedCard: "****",
    qebzNomresi: "3602820749",
  },
  {
    id: "mypaid_aa134_3",
    carId: "car2",
    protokol: "EQ30570401",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 100,
    endirim: 10,
    status: "Ödənilib",
    suretHeddi: 0,
    asdiqinizSuret: 0,
    qerarTarix: "07.05.2026",
    tarix: "07.05.2026 18:27:52",
    qeydAlınmaYeri: "Y.Səfərov küçəsi",
    ixmNote: "İXM:327.1-1. 5.9, 5.10.1 – 5.10.3 nişanları ilə işarələnmiş, ümumi istifadədə olan nəqliyyat vasitələri üçün nəzərdə tutulmuş hərəkət zolağı olan yollarda hərəkət edən digər nəqliyyat vasitələrinin həmin zolaqda hərəkət etməsinə görə",
    odenisTarixi: "2026-06-01 12:07:59",
    total: 91.30,
    maskedCard: "****",
    qebzNomresi: "3603057040",
  },
  {
    id: "mypaid_aa134_4",
    carId: "car2",
    protokol: "EQ35903807",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 100,
    endirim: 10,
    status: "Ödənilib",
    suretHeddi: 0,
    asdiqinizSuret: 0,
    qerarTarix: "08.05.2026",
    tarix: "07.05.2026 18:42:52",
    qeydAlınmaYeri: "Yusif Səfərov küçəsi",
    ixmNote: "İXM:327.1-1. 5.9, 5.10.1 – 5.10.3 nişanları ilə işarələnmiş, ümumi istifadədə olan nəqliyyat vasitələri üçün nəzərdə tutulmuş hərəkət zolağı olan yollarda hərəkət edən digər nəqliyyat vasitələrinin həmin zolaqda hərəkət etməsinə görə",
    odenisTarixi: "2026-06-01 12:07:41",
    total: 91.30,
    maskedCard: "****",
    qebzNomresi: "3603590380",
  },
  {
    id: "mypaid_aa134_5",
    carId: "car2",
    protokol: "EQ35955745",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 200,
    endirim: 20,
    status: "Ödənilib",
    suretHeddi: 110,
    asdiqinizSuret: 162,
    qerarTarix: "10.05.2026",
    tarix: "10.05.2026 09:39:50",
    qeydAlınmaYeri: "",
    ixmNote: "İXM:328.3 - Yolda müəyyən edilmiş hərəkət sürətini 41-60 km/saat həddində aşmağa görə",
    odenisTarixi: "2026-06-01 12:07:22",
    total: 181.30,
    maskedCard: "****",
    qebzNomresi: "3603595574",
  },
  {
    id: "mypaid_aa134_6",
    carId: "car2",
    protokol: "EQ36283718",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 50,
    endirim: 5,
    status: "Ödənilib",
    suretHeddi: 90,
    asdiqinizSuret: 114,
    qerarTarix: "23.05.2026",
    tarix: "23.05.2026 15:11:00",
    qeydAlınmaYeri: "Hava limanı yolu Komsomol körpüsü Hava Limanı ist 1",
    ixmNote: "İXM:328.1. Yolda müəyyən edilmiş hərəkət sürətini 21-40 km/saat həddində aşmağa görə",
    odenisTarixi: "2026-06-01 12:07:06",
    total: 46.30,
    maskedCard: "****",
    qebzNomresi: "3603628371",
  },
  {
    id: "mypaid_aa134_7",
    carId: "car2",
    protokol: "EQ36334803",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 20,
    endirim: 2,
    status: "Ödənilib",
    suretHeddi: 0,
    asdiqinizSuret: 0,
    qerarTarix: "25.05.2026",
    tarix: "25.05.2026 00:00:00",
    qeydAlınmaYeri: "D.Aliyeva küç. va F.Omirov küç.",
    ixmNote: "İXM:346.1. Bu Məcəllənin 346.2-346.9-cu maddələrində nəzərdə tutulmuş hallar istisna olmaqla, dayanma qaydalarını pozmağa görə",
    odenisTarixi: "2026-06-01 12:06:48",
    total: 19.30,
    maskedCard: "****",
    qebzNomresi: "3603633480",
  },
];

const genId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const DEVICE_ID =
  (process.env.EXPO_PUBLIC_REPL_ID ?? "smsradar_dev") + "_smsradar";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : null;

interface ServerSnapshot {
  cars?: Car[];
  fines?: Fine[];
  paymentHistory?: PaymentRecord[];
  notifications?: AppNotification[];
  profile?: UserProfile;
  isAdmin?: boolean;
}

function fetchWithTimeout(url: string, options: RequestInit, ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}

async function loadFromServer(): Promise<ServerSnapshot | null> {
  if (!API_BASE || Platform.OS === "web") return null;
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/storage/${DEVICE_ID}`,
      {},
      5000
    );
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as ServerSnapshot) ?? null;
  } catch (_) {
    return null;
  }
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleServerSync(snapshot: ServerSnapshot) {
  if (!API_BASE || Platform.OS === "web") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    fetchWithTimeout(
      `${API_BASE}/storage/${DEVICE_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      },
      8000
    ).catch(() => {});
  }, 500);
}

const DATA_DIR = FileSystem.documentDirectory
  ? FileSystem.documentDirectory + "smsradar_data/"
  : null;

function keyToFilename(key: string): string {
  return key.replace(/[^a-z0-9_]/gi, "_") + ".json";
}

async function ensureDir() {
  if (!DATA_DIR) return;
  try {
    const info = await FileSystem.getInfoAsync(DATA_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(DATA_DIR, { intermediates: true });
    }
  } catch (_) {}
}

async function save(key: string, value: unknown) {
  const json = JSON.stringify(value);
  if (DATA_DIR && Platform.OS !== "web") {
    try {
      await ensureDir();
      await FileSystem.writeAsStringAsync(DATA_DIR + keyToFilename(key), json);
    } catch (_) {}
  }
  try {
    await AsyncStorage.setItem(key, json);
  } catch (_) {}
}

async function load<T>(key: string): Promise<T | null> {
  if (DATA_DIR && Platform.OS !== "web") {
    try {
      const path = DATA_DIR + keyToFilename(key);
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        const raw = await FileSystem.readAsStringAsync(path);
        if (raw) return JSON.parse(raw) as T;
      }
    } catch (_) {}
  }
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (_) {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: "İstifadəçi",
    phone: "055 622 44 44",
  });
  const [isAdmin, setIsAdminState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const serverSnap = await loadFromServer();

        const [c, f, p, n, pr, admin] = await Promise.all([
          load<Car[]>(K.cars),
          load<Fine[]>(K.fines),
          load<PaymentRecord[]>(K.paymentHistory),
          load<AppNotification[]>(K.notifications),
          load<UserProfile>(K.profile),
          load<boolean>(K.isAdmin),
        ]);

        const sc = (serverSnap?.cars?.length ?? 0) > 0 ? serverSnap!.cars! : c;
        const sf = (serverSnap?.fines?.length ?? 0) > 0 ? serverSnap!.fines! : f;
        const sp = (serverSnap?.paymentHistory?.length ?? 0) > 0 ? serverSnap!.paymentHistory! : p;
        const sn = (serverSnap?.notifications?.length ?? 0) > 0 ? serverSnap!.notifications! : n;
        const spr = serverSnap?.profile ?? pr;
        const sadmin = serverSnap?.isAdmin ?? admin;

        const seededFile = await load<string>(K.seeded);
        const seededAsync = await AsyncStorage.getItem(K.seeded);
        const seeded = seededFile || seededAsync || serverSnap !== null;

        if (!seeded) {
          const legacyCars = await (async () => {
            for (const { from, to } of LEGACY_KEYS) {
              if (!to || to !== K.cars) continue;
              const v = await load<Car[]>(from);
              if (v && v.length) return v;
            }
            return null;
          })();

          const legacyFines = await (async () => {
            for (const { from, to } of LEGACY_KEYS) {
              if (!to || to !== K.fines) continue;
              const v = await load<Fine[]>(from);
              if (v && v.length) return v;
            }
            return null;
          })();

          const legacyPay = await (async () => {
            for (const { from, to } of LEGACY_KEYS) {
              if (!to || to !== K.paymentHistory) continue;
              const v = await load<PaymentRecord[]>(from);
              if (v && v.length) return v;
            }
            return null;
          })();

          const legacyNotifs = await (async () => {
            for (const { from, to } of LEGACY_KEYS) {
              if (!to || to !== K.notifications) continue;
              const v = await load<AppNotification[]>(from);
              if (v && v.length) return v;
            }
            return null;
          })();

          const initCars = legacyCars ?? MY_CARS;
          const initFines = legacyFines ?? [];
          const initPay = legacyPay ?? MY_PAYMENT_HISTORY;
          const initNotifs = legacyNotifs ?? [];

          await Promise.all([
            save(K.cars, initCars),
            save(K.fines, initFines),
            save(K.paymentHistory, initPay),
            save(K.notifications, initNotifs),
            save(K.seeded, "1"),
            AsyncStorage.setItem(K.seeded, "1"),
          ]);

          setCars(initCars);
          setFines(initFines);
          setPaymentHistory(initPay);
          setNotifications(initNotifs);

          scheduleServerSync({
            cars: initCars,
            fines: initFines,
            paymentHistory: initPay,
            notifications: initNotifs,
          });
        } else {
          const effectiveCars = (sc && sc.length > 0) ? sc : (c && c.length > 0 ? c : MY_CARS);
          const effectiveFines = (sf && sf.length > 0) ? sf : (f ?? []);
          const effectivePay = (sp && sp.length > 0) ? sp : (p && p.length > 0 ? p : MY_PAYMENT_HISTORY);
          const effectiveNotifs = (sn && sn.length > 0) ? sn : (n ?? []);

          save(K.cars, effectiveCars);
          save(K.fines, effectiveFines);
          save(K.paymentHistory, effectivePay);
          save(K.notifications, effectiveNotifs);
          save(K.seeded, "1");
          AsyncStorage.setItem(K.seeded, "1");

          setCars(effectiveCars);
          setFines(effectiveFines);
          setPaymentHistory(effectivePay);
          setNotifications(effectiveNotifs);
          if (spr) setProfile(spr);
          if (sadmin !== null) setIsAdminState(sadmin ?? false);
        }
      } catch (e) {
        console.warn("[AppContext] init error:", e);
      }
      setLoaded(true);
    })();
  }, []);

  const carsRef = React.useRef(cars);
  const finesRef = React.useRef(fines);
  const payRef = React.useRef(paymentHistory);
  const notifsRef = React.useRef(notifications);
  const profileRef = React.useRef(profile);
  const adminRef = React.useRef(isAdmin);

  useEffect(() => {
    if (!loaded) return;
    carsRef.current = cars;
    save(K.cars, cars);
    scheduleServerSync({
      cars,
      fines: finesRef.current,
      paymentHistory: payRef.current,
      notifications: notifsRef.current,
      profile: profileRef.current,
      isAdmin: adminRef.current,
    });
  }, [cars, loaded]);

  useEffect(() => {
    if (!loaded) return;
    finesRef.current = fines;
    save(K.fines, fines);
    scheduleServerSync({
      cars: carsRef.current,
      fines,
      paymentHistory: payRef.current,
      notifications: notifsRef.current,
      profile: profileRef.current,
      isAdmin: adminRef.current,
    });
  }, [fines, loaded]);

  useEffect(() => {
    if (!loaded) return;
    payRef.current = paymentHistory;
    save(K.paymentHistory, paymentHistory);
    scheduleServerSync({
      cars: carsRef.current,
      fines: finesRef.current,
      paymentHistory,
      notifications: notifsRef.current,
      profile: profileRef.current,
      isAdmin: adminRef.current,
    });
  }, [paymentHistory, loaded]);

  useEffect(() => {
    if (!loaded) return;
    notifsRef.current = notifications;
    save(K.notifications, notifications);
    scheduleServerSync({
      cars: carsRef.current,
      fines: finesRef.current,
      paymentHistory: payRef.current,
      notifications,
      profile: profileRef.current,
      isAdmin: adminRef.current,
    });
  }, [notifications, loaded]);

  useEffect(() => {
    if (!loaded) return;
    profileRef.current = profile;
    save(K.profile, profile);
    scheduleServerSync({
      cars: carsRef.current,
      fines: finesRef.current,
      paymentHistory: payRef.current,
      notifications: notifsRef.current,
      profile,
      isAdmin: adminRef.current,
    });
  }, [profile, loaded]);

  useEffect(() => {
    if (!loaded) return;
    adminRef.current = isAdmin;
    save(K.isAdmin, isAdmin);
  }, [isAdmin, loaded]);

  const addCar = useCallback((plate: string) => {
    const car: Car = {
      id: genId(),
      plate: plate.toUpperCase(),
      status: "Aktiv",
      createdAt: new Date().toISOString(),
    };
    setCars((prev) => {
      const next = [...prev, car];
      save(K.cars, next);
      return next;
    });
  }, []);

  const removeCar = useCallback((id: string) => {
    setCars((prev) => {
      const next = prev.filter((c) => c.id !== id);
      save(K.cars, next);
      return next;
    });
    setFines((prev) => {
      const next = prev.filter((f) => f.carId !== id);
      save(K.fines, next);
      return next;
    });
  }, []);

  const addFine = useCallback((fine: Omit<Fine, "id">) => {
    const newFine = { ...fine, id: genId() };
    const now = new Date();
    const ixmCode = fine.ixmNote?.match(/İXM:(\d+\.\d+)/)?.[1] ?? "";
    const tarixShort = fine.tarix.slice(0, 16);
    const notif: AppNotification = {
      id: genId(),
      type: "cerime",
      plate: fine.avtomobil,
      message: `${fine.avtomobil} nomreli avtomobil ${fine.cerime} azn cerime edilmisdir . Endirim: ${fine.endirim} AZN. Tarix: ${tarixShort},Madde: ${ixmCode}.. odeme linki: `,
      link: `https://web.api.az/${fine.protokol}`,
      createdAt: now.toISOString(),
      timeText: `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`,
    };
    setFines((prev) => {
      const next = [...prev, newFine];
      save(K.fines, next);
      return next;
    });
    setNotifications((prev) => {
      const next = [notif, ...prev];
      save(K.notifications, next);
      return next;
    });
  }, []);

  const updateFine = useCallback((id: string, updates: Partial<Fine>) => {
    setFines((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...updates } : f));
      save(K.fines, next);
      return next;
    });
  }, []);

  const removeFine = useCallback((id: string) => {
    setFines((prev) => {
      const next = prev.filter((f) => f.id !== id);
      save(K.fines, next);
      return next;
    });
  }, []);

  const markFinePaid = useCallback(
    (
      fineId: string,
      maskedCard: string,
      total: number,
      qebzNomresi: string
    ) => {
      const prevFines = finesRef.current;
      const fine = prevFines.find((f) => f.id === fineId);
      if (!fine) return;

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const odenisTarixi = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const record: PaymentRecord = {
        ...fine,
        status: "Ödənilib",
        odenisTarixi,
        total,
        maskedCard,
        qebzNomresi,
      };

      const notif: AppNotification = {
        id: genId(),
        type: "odenis",
        plate: fine.avtomobil,
        message: `${fine.protokol} ödəndi. Məbləğ: ${total.toFixed(2)} AZN. Kart: ${maskedCard}`,
        createdAt: now.toISOString(),
        timeText: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      };

      const nextFines = prevFines.filter((f) => f.id !== fineId);
      save(K.fines, nextFines);
      setFines(nextFines);

      setPaymentHistory((prev) => {
        const next = [record, ...prev];
        save(K.paymentHistory, next);
        return next;
      });

      setNotifications((prev) => {
        const next = [notif, ...prev];
        save(K.notifications, next);
        return next;
      });
    },
    []
  );

  const removePaymentRecord = useCallback((id: string) => {
    setPaymentHistory((prev) => {
      const next = prev.filter((r) => r.id !== id);
      save(K.paymentHistory, next);
      return next;
    });
  }, []);

  const updatePaymentRecord = useCallback(
    (id: string, data: Partial<PaymentRecord>) => {
      setPaymentHistory((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, ...data } : r));
        save(K.paymentHistory, next);
        return next;
      });
    },
    []
  );

  const addPaymentRecord = useCallback(
    (record: Omit<PaymentRecord, "id">) => {
      const newRecord: PaymentRecord = { ...record, id: genId() };
      setPaymentHistory((prev) => {
        const next = [newRecord, ...prev];
        save(K.paymentHistory, next);
        return next;
      });
    },
    []
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    save(K.notifications, []);
  }, []);

  const setIsAdmin = useCallback((val: boolean) => {
    setIsAdminState(val);
    save(K.isAdmin, val);
  }, []);

  const updateProfile = useCallback((p: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...p };
      save(K.profile, next);
      return next;
    });
  }, []);

  const getFinesForCar = useCallback(
    (carId: string) => fines.filter((f) => f.carId === carId),
    [fines]
  );

  const getPaymentHistoryForCar = useCallback(
    (carId: string) => paymentHistory.filter((r) => r.carId === carId),
    [paymentHistory]
  );

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        cars,
        fines,
        paymentHistory,
        notifications,
        profile,
        isAdmin,
        addCar,
        removeCar,
        addFine,
        updateFine,
        removeFine,
        markFinePaid,
        removePaymentRecord,
        updatePaymentRecord,
        addPaymentRecord,
        clearNotifications,
        setIsAdmin,
        updateProfile,
        getFinesForCar,
        getPaymentHistoryForCar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
