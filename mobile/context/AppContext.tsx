import AsyncStorage from "@react-native-async-storage/async-storage";
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

// Stable keys — never change these after first release
const K = {
  cars: "@smsradar_cars",
  fines: "@smsradar_fines",
  paymentHistory: "@smsradar_payhistory",
  notifications: "@smsradar_notifs",
  profile: "@smsradar_profile",
  isAdmin: "@smsradar_isAdmin",
  seeded: "@smsradar_seeded_v5", // bump version to force re-seed with updated fines
};

// Legacy keys to migrate from
const LEGACY_KEYS = [
  { from: "@smsradar_cars_v2", to: K.cars },
  { from: "@smsradar_cars_v3", to: K.cars },
  { from: "@smsradar_fines_v3", to: K.fines },
  { from: "@smsradar_fines", to: null }, // already target
  { from: "@smsradar_payment_history_v3", to: K.paymentHistory },
  { from: "@smsradar_notifications_v3", to: K.notifications },
];

const SAMPLE_CARS: Car[] = [
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

const SAMPLE_FINES: Fine[] = [
  // ── 10AZ503 (car1) ──────────────────────────────────────────
  {
    id: "fine_az503_1",
    carId: "car1",
    protokol: "EQ36239077",
    avtomobil: "10AZ503",
    cerimelenan: "RİLEY COLE NATHANİEL",
    cerime: 50,
    endirim: 5,
    status: "Qərarlı",
    suretHeddi: 60,
    asdiqinizSuret: 90,
    qerarTarix: "21.05.2026",
    tarix: "21.05.2026 20:24:42",
    qeydAlınmaYeri:
      "Səbail rayonu Salyan şossesi Bayraq Meydanının yaxınlığı Azneft meydanı ist2",
    ixmNote:
      "İXM:328.2. Yolda müəyyən edilmiş hərəkət sürətini 21-40 km/saat həddində aşmağa görə",
  },
  {
    id: "fine_az503_2",
    carId: "car1",
    protokol: "EQ36238987",
    avtomobil: "10AZ503",
    cerimelenan: "RİLEY COLE NATHANİEL",
    cerime: 50,
    endirim: 5,
    status: "Qərarlı",
    suretHeddi: 60,
    asdiqinizSuret: 81,
    qerarTarix: "21.05.2026",
    tarix: "21.05.2026 20:20:00",
    qeydAlınmaYeri:
      "Səbail rayonu Salyan şossesi Bibiheybət məscidinin yaxınlığı Bayraq Meydanı ist",
    ixmNote:
      "İXM:328.2. Yolda müəyyən edilmiş hərəkət sürətini 21-40 km/saat həddində aşmağa görə",
  },
  {
    id: "fine_az503_3",
    carId: "car1",
    protokol: "EQ36232005",
    avtomobil: "10AZ503",
    cerimelenan: "RİLEY COLE NATHANİEL",
    cerime: 50,
    endirim: 5,
    status: "Qərarlı",
    suretHeddi: 60,
    asdiqinizSuret: 84,
    qerarTarix: "21.05.2026",
    tarix: "21.05.2026 15:42:27",
    qeydAlınmaYeri:
      "Səbail rayonu Salyan şossesi Bayraq Meydanının yaxınlığı Bayıl ist1",
    ixmNote:
      "İXM:328.2. Yolda müəyyən edilmiş hərəkət sürətini 21-40 km/saat həddində aşmağa görə",
  },
  {
    id: "fine_az503_4",
    carId: "car1",
    protokol: "EQ36203962",
    avtomobil: "10AZ503",
    cerimelenan: "RİLEY COLE NATHANİEL",
    cerime: 40,
    endirim: 4,
    status: "Qərarlı",
    suretHeddi: 0,
    asdiqinizSuret: 0,
    qerarTarix: "20.05.2026",
    tarix: "19.05.2026 18:17:04",
    qeydAlınmaYeri:
      "Babək pr, Arzu şadlıq sarayının qarşısı mərkəz istiqaməti TŞ4-010",
    ixmNote:
      "İXM:329.1. Təhlükəsizlik kəmərini bağlamadan nəqliyyat vasitəsini idarə etməyə görə",
  },
  // ── 10AA134 (car2) ──────────────────────────────────────────
  {
    id: "fine_aa134_5",
    carId: "car2",
    protokol: "EQ28207494",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 100,
    endirim: 10,
    status: "2 bal",
    suretHeddi: 0,
    asdiqinizSuret: 0,
    qerarTarix: "07.05.2026",
    tarix: "07.05.2026 18:22:52",
    qeydAlınmaYeri: "Neftçilər prospekti Dəniz vağzalının qarşısı",
    ixmNote:
      "İXM:327.1-1. 5.9, 5.10.1 – 5.10.3 nişanları ilə işarələnmiş, ümumi istifadədə olan nəqliyyat vasitələri üçün nəzərdə tutulmuş hərəkət zolağı olan yollarda hərəkət edən digər nəqliyyat vasitələrinin həmin zolaqda hərəkət etməsinə görə",
  },
  {
    id: "fine_aa134_6",
    carId: "car2",
    protokol: "EQ30570401",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 100,
    endirim: 10,
    status: "2 bal",
    suretHeddi: 0,
    asdiqinizSuret: 0,
    qerarTarix: "07.05.2026",
    tarix: "07.05.2026 18:27:52",
    qeydAlınmaYeri: "Y.Səfərov küçəsi",
    ixmNote:
      "İXM:327.1-1. 5.9, 5.10.1 – 5.10.3 nişanları ilə işarələnmiş, ümumi istifadədə olan nəqliyyat vasitələri üçün nəzərdə tutulmuş hərəkət zolağı olan yollarda hərəkət edən digər nəqliyyat vasitələrinin həmin zolaqda hərəkət etməsinə görə",
  },
  {
    id: "fine_aa134_1",
    carId: "car2",
    protokol: "EQ36283718",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 10,
    endirim: 1,
    status: "Qərarlı",
    suretHeddi: 90,
    asdiqinizSuret: 104,
    qerarTarix: "23.05.2026",
    tarix: "23.05.2026 15:11:00",
    qeydAlınmaYeri:
      "Hava limanı yolu Komsomol körpüsü Hava Limanı ist 1",
    ixmNote:
      "İXM:328.1. Yolda müəyyən edilmiş hərəkət sürətini 10-20 km/saat həddində aşmağa görə",
  },
  {
    id: "fine_aa134_2",
    carId: "car2",
    protokol: "EQ35955745",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 200,
    endirim: 20,
    status: "Qərarlı",
    suretHeddi: 110,
    asdiqinizSuret: 162,
    qerarTarix: "10.05.2026",
    tarix: "10.05.2026 09:39:50",
    qeydAlınmaYeri: "",
    ixmNote:
      "İXM:328.3 - Yolda müəyyən edilmiş hərəkət sürətini 41-60 km/saat həddində aşmağa görə",
  },
  {
    id: "fine_aa134_3",
    carId: "car2",
    protokol: "EQ35903807",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 100,
    endirim: 10,
    status: "Qərarlı",
    suretHeddi: 0,
    asdiqinizSuret: 0,
    qerarTarix: "08.05.2026",
    tarix: "07.05.2026 18:42:52",
    qeydAlınmaYeri: "Yusif Səfərov küçəsi",
    ixmNote:
      "İXM:327.1-1. 5.9, 5.10.1 – 5.10.3 nişanları ilə işarələnmiş, ümumi istifadədə olan nəqliyyat vasitələri üçün nəzərdə tutulmuş hərəkət zolağı olan yollarda hərəkət edən digər nəqliyyat vasitələrinin həmin zolaqda hərəkət etməsinə görə",
  },
  {
    id: "fine_aa134_4",
    carId: "car2",
    protokol: "EQ35880128",
    avtomobil: "10AA134",
    cerimelenan: "ÖZDEMİR MEHMET .",
    cerime: 10,
    endirim: 1,
    status: "Qərarlı",
    suretHeddi: 70,
    asdiqinizSuret: 87,
    qerarTarix: "07.05.2026",
    tarix: "07.05.2026 12:17:23",
    qeydAlınmaYeri: "Bakı-Qazax yolu 29.5-ci km Bakı ist",
    ixmNote:
      "İXM:328.1. Yolda müəyyən edilmiş hərəkət sürətini 10-20 km/saat həddində aşmağa görə",
  },
];

const SAMPLE_PAYMENT_HISTORY: PaymentRecord[] = [
  {
    id: "paid1",
    carId: "car1",
    protokol: "EQ35708702",
    avtomobil: "10AZ503",
    cerimelenan: "RILEY COLE NATHANIEL",
    cerime: 40,
    endirim: 4,
    status: "Ödənilib",
    suretHeddi: 0,
    asdiqinizSuret: 0,
    qerarTarix: "29.04.2026",
    tarix: "29.04.2026 09:18:51",
    qeydAlınmaYeri:
      "Metbuat pr. - Ebdulrehim bey Haqverdiyev kuch. kesishmesi",
    ixmNote:
      "İXM:327.1. yol nişanlarının tələblərinə riayət edilməməsi",
    odenisTarixi: "2026-05-01 16:34:53",
    total: 37.3,
    maskedCard: "454667******7691",
    qebzNomresi: "1992022415",
  },
  {
    id: "paid2",
    carId: "car1",
    protokol: "EQ35330641",
    avtomobil: "10AZ503",
    cerimelenan: "RILEY COLE NATHANIEL",
    cerime: 10,
    endirim: 1,
    status: "Ödənilib",
    suretHeddi: 90,
    asdiqinizSuret: 101,
    qerarTarix: "13.04.2026",
    tarix: "13.04.2026 08:30:00",
    qeydAlınmaYeri: "Nizami küçəsi, 45",
    ixmNote:
      "İXM:328.1. Yolda müəyyən edilmiş hərəkət sürətini 10-20 km/saat həddində aşmağa görə",
    odenisTarixi: "2026-04-15 11:22:30",
    total: 10.3,
    maskedCard: "454667******7691",
    qebzNomresi: "1881033512",
  },
];

const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif1",
    type: "cerime",
    plate: "10AA134",
    message:
      "10AA134 nomreli avtomobil 10 azn cerime edilmisdir . Endirim: 1 AZN. Tarix: 23.05.2026 15:11,Madde: 328.1.. odeme linki: ",
    link: "https://web.api.az/EQ36283718",
    createdAt: "2026-05-23T16:11:00.000Z",
    timeText: "16:11",
  },
  {
    id: "notif2",
    type: "cerime",
    plate: "10AA134",
    message:
      "10AA134 nomreli avtomobil 200 azn cerime edilmisdir . Endirim: 20 AZN. Tarix: 20.05.2026 09:45,Madde: 328.2.. odeme linki: ",
    link: "https://web.api.az/EQ35955745",
    createdAt: "2026-05-20T10:00:00.000Z",
    timeText: "10:00",
  },
  {
    id: "notif3",
    type: "cerime",
    plate: "10AZ503",
    message:
      "10AZ503 nomreli avtomobil 40 azn cerime edilmisdir . Endirim: 4 AZN. Tarix: 29.04.2026 09:18,Madde: 327.1.. odeme linki: ",
    link: "https://web.api.az/EQ35708702",
    createdAt: "2026-04-29T09:18:00.000Z",
    timeText: "09:18",
  },
];

const genId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

async function save(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

async function load<T>(key: string): Promise<T | null> {
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
        // Check if this is the first ever run (never seeded)
        const seeded = await AsyncStorage.getItem(K.seeded);

        if (!seeded) {
          // First time: migrate any legacy data or seed with sample data
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

          const initCars = legacyCars ?? SAMPLE_CARS;
          const initFines = legacyFines ?? SAMPLE_FINES;
          const initPay = legacyPay ?? SAMPLE_PAYMENT_HISTORY;
          const initNotifs = legacyNotifs ?? SAMPLE_NOTIFICATIONS;

          await Promise.all([
            save(K.cars, initCars),
            save(K.fines, initFines),
            save(K.paymentHistory, initPay),
            save(K.notifications, initNotifs),
            AsyncStorage.setItem(K.seeded, "1"),
          ]);

          setCars(initCars);
          setFines(initFines);
          setPaymentHistory(initPay);
          setNotifications(initNotifs);
        } else {
          // Normal load — always read from stable keys
          const [c, f, p, n, pr, admin] = await Promise.all([
            load<Car[]>(K.cars),
            load<Fine[]>(K.fines),
            load<PaymentRecord[]>(K.paymentHistory),
            load<AppNotification[]>(K.notifications),
            load<UserProfile>(K.profile),
            load<boolean>(K.isAdmin),
          ]);

          // Always merge missing sample cars (by id)
          const existingCars = c ?? SAMPLE_CARS;
          const mergedCars = [...existingCars];
          let carsMerged = false;
          for (const sc of SAMPLE_CARS) {
            if (!mergedCars.some((x) => x.id === sc.id)) {
              mergedCars.push(sc);
              carsMerged = true;
            }
          }
          if (carsMerged) save(K.cars, mergedCars);
          setCars(mergedCars);

          // Always merge missing sample fines (by protokol) — preserves user photos
          const existingFines = f ?? [];
          const mergedFines = [...existingFines];
          let finesMerged = false;
          for (const sf of SAMPLE_FINES) {
            if (!mergedFines.some((x) => x.protokol === sf.protokol)) {
              mergedFines.push(sf);
              finesMerged = true;
            }
          }
          if (finesMerged) save(K.fines, mergedFines);
          setFines(mergedFines);

          setPaymentHistory(p ?? SAMPLE_PAYMENT_HISTORY);
          setNotifications(n ?? SAMPLE_NOTIFICATIONS);
          if (pr) setProfile(pr);
          if (admin !== null) setIsAdminState(admin);
        }
      } catch (_) {}
      setLoaded(true);
    })();
  }, []);

  // Persist every change immediately
  useEffect(() => {
    if (!loaded) return;
    save(K.cars, cars);
  }, [cars, loaded]);

  useEffect(() => {
    if (!loaded) return;
    save(K.fines, fines);
  }, [fines, loaded]);

  useEffect(() => {
    if (!loaded) return;
    save(K.paymentHistory, paymentHistory);
  }, [paymentHistory, loaded]);

  useEffect(() => {
    if (!loaded) return;
    save(K.notifications, notifications);
  }, [notifications, loaded]);

  useEffect(() => {
    if (!loaded) return;
    save(K.profile, profile);
  }, [profile, loaded]);

  useEffect(() => {
    if (!loaded) return;
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
      setFines((prevFines) => {
        const fine = prevFines.find((f) => f.id === fineId);
        if (!fine) return prevFines;

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

        const nextFines = prevFines.filter((f) => f.id !== fineId);
        save(K.fines, nextFines);
        return nextFines;
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
