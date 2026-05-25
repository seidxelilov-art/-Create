import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PaymentRecord, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ─── Field component ───────────────────────────────────────────
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={fStyles.container}>
      <Text style={[fStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[
          fStyles.input,
          {
            borderColor: colors.border,
            color: colors.foreground,
            backgroundColor: colors.background,
            fontFamily: "Inter_400Regular",
            height: multiline ? 64 : undefined,
            textAlignVertical: multiline ? "top" : undefined,
          },
        ]}
        placeholder={placeholder ?? label}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        multiline={multiline}
      />
    </View>
  );
}

const fStyles = StyleSheet.create({
  container: { marginBottom: 10 },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
});

// ─── Edit/Add modal ────────────────────────────────────────────
function PaymentEditModal({
  visible,
  onClose,
  record,
  carId,
  carPlate,
}: {
  visible: boolean;
  onClose: () => void;
  record: PaymentRecord | null;
  carId: string;
  carPlate: string;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updatePaymentRecord, addPaymentRecord } = useApp();

  const [protokol, setProtokol] = useState("");
  const [cerimelenan, setCerimelenan] = useState("");
  const [cerime, setCerime] = useState("");
  const [endirim, setEndirim] = useState("0");
  const [suretHeddi, setSuretHeddi] = useState("");
  const [asdiqinizSuret, setAsdiqinizSuret] = useState("");
  const [qerarTarix, setQerarTarix] = useState("");
  const [tarix, setTarix] = useState("");
  const [qeydAlınmaYeri, setQeydAlınmaYeri] = useState("");
  const [ixmNote, setIxmNote] = useState("");
  const [odenisTarixi, setOdenisTarixi] = useState("");

  useEffect(() => {
    if (record) {
      setProtokol(record.protokol);
      setCerimelenan(record.cerimelenan);
      setCerime(String(record.cerime));
      setEndirim(String(record.endirim));
      setSuretHeddi(String(record.suretHeddi));
      setAsdiqinizSuret(String(record.asdiqinizSuret));
      setQerarTarix(record.qerarTarix);
      setTarix(record.tarix);
      setQeydAlınmaYeri(record.qeydAlınmaYeri);
      setIxmNote(record.ixmNote);
      setOdenisTarixi(record.odenisTarixi);
    } else {
      setProtokol("");
      setCerimelenan("");
      setCerime("");
      setEndirim("0");
      setSuretHeddi("0");
      setAsdiqinizSuret("0");
      setQerarTarix("");
      setTarix(new Date().toLocaleDateString("az-AZ"));
      setQeydAlınmaYeri("");
      setIxmNote("");
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      setOdenisTarixi(
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      );
    }
  }, [record, visible]);

  const handleSave = () => {
    if (!protokol.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const data = {
      protokol: protokol.trim(),
      cerimelenan: cerimelenan.trim(),
      cerime: parseFloat(cerime) || 0,
      endirim: parseFloat(endirim) || 0,
      suretHeddi: parseFloat(suretHeddi) || 0,
      asdiqinizSuret: parseFloat(asdiqinizSuret) || 0,
      qerarTarix,
      tarix,
      qeydAlınmaYeri,
      ixmNote,
      odenisTarixi,
    };
    if (record) {
      updatePaymentRecord(record.id, data);
    } else {
      addPaymentRecord({
        ...data,
        carId,
        avtomobil: carPlate,
        status: "Ödənilib",
        total: parseFloat(cerime) - parseFloat(endirim) || 0,
      });
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={eStyles.overlay}>
        <View
          style={[
            eStyles.sheet,
            { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={eStyles.header}>
            <View style={[eStyles.handle, { backgroundColor: colors.border }]} />
            <Text style={[eStyles.title, { color: colors.foreground }]}>
              {record ? "Qeydi redaktə et" : "Yeni ödəniş əlavə et"}
            </Text>
            <TouchableOpacity onPress={onClose} style={eStyles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={eStyles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Field label="Protokol" value={protokol} onChangeText={setProtokol} />
            <Field label="Cərimə olunan" value={cerimelenan} onChangeText={setCerimelenan} />
            <Field label="Cərimə (AZN)" value={cerime} onChangeText={setCerime} keyboardType="numeric" />
            <Field label="Endirim (AZN)" value={endirim} onChangeText={setEndirim} keyboardType="numeric" />
            <Field label="Sürət həddi" value={suretHeddi} onChangeText={setSuretHeddi} keyboardType="numeric" />
            <Field label="Aşdığınız sürət" value={asdiqinizSuret} onChangeText={setAsdiqinizSuret} keyboardType="numeric" />
            <Field label="Qərar tarixi" value={qerarTarix} onChangeText={setQerarTarix} placeholder="DD.MM.YYYY" />
            <Field label="Tarix" value={tarix} onChangeText={setTarix} placeholder="DD.MM.YYYY HH:mm" />
            <Field label="Qeydə alınma yeri" value={qeydAlınmaYeri} onChangeText={setQeydAlınmaYeri} multiline />
            <Field label="İXM qeydi" value={ixmNote} onChangeText={setIxmNote} multiline />
            <Field label="Ödəniş tarixi" value={odenisTarixi} onChangeText={setOdenisTarixi} placeholder="YYYY-MM-DD HH:mm:ss" />
            <TouchableOpacity
              style={[eStyles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={[eStyles.saveBtnText, { color: "#fff" }]}>
                {record ? "Yenilə" : "Əlavə et"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const eStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 24,
    padding: 4,
  },
  scroll: { paddingHorizontal: 24, paddingTop: 4 },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});

// ─── PaymentCard ───────────────────────────────────────────────
function PaymentCard({
  record,
  onEdit,
}: {
  record: PaymentRecord;
  onEdit: (r: PaymentRecord) => void;
}) {
  const colors = useColors();
  const { isAdmin, removePaymentRecord } = useApp();

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Qeydi sil", "Bu ödəniş qeydi silinsin?", [
      { text: "Ləğv et", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          removePaymentRecord(record.id);
        },
      },
    ]);
  };

  const odenilenMebleg = record.cerime - record.endirim;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {isAdmin && (
        <View style={styles.adminActions}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onEdit(record);
            }}
            style={[styles.adminBtn, { backgroundColor: colors.green50 }]}
          >
            <Ionicons name="pencil" size={15} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.adminBtn, { backgroundColor: "#fff0f0" }]}
          >
            <Ionicons name="trash-outline" size={15} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      )}
      <Row label="Protokol" value={record.protokol} />
      <Divider />
      <Row label="Avtomobilin nömrəsi" value={record.avtomobil} />
      <Divider />
      <Row label="Cərimə olunan" value={record.cerimelenan} />
      <Divider />
      <Row label="Cərimə" value={`${record.cerime} AZN`} />
      <Divider />
      <Row label="Endirim" value={`${record.endirim} AZN`} />
      <Divider />
      <Row label="Ödəniləcək məbləğ" value={`${odenilenMebleg} AZN`} />
      <Divider />
      <Row label="Status" value={record.status} />
      {record.suretHeddi > 0 && (
        <>
          <Divider />
          <Row label="Sürət həddi" value={`${record.suretHeddi} km/saat`} />
          <Divider />
          <Row label="Aşdığınız sürət" value={`${record.asdiqinizSuret} km/saat`} />
        </>
      )}
      <Divider />
      <Row label="Qərar vurulma tarixi" value={record.qerarTarix} />
      <Divider />
      <Row label="Tarix" value={record.tarix} />
      <Divider />
      <Row label="Qeydə alınma yeri" value={record.qeydAlınmaYeri} />
      <Divider />
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>Ödəniş tarixi</Text>
        <Text style={[styles.odenisTarixValue, { color: "#ef4444" }]}>{record.odenisTarixi}</Text>
      </View>
      {record.ixmNote ? (
        <Text style={[styles.ixmNote, { color: colors.mutedForeground }]}>{record.ixmNote}</Text>
      ) : null}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

// ─── Main screen ───────────────────────────────────────────────
export default function OdenisTarixcesiScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const { getPaymentHistoryForCar, cars, isAdmin } = useApp();
  const [loading, setLoading] = useState(true);
  const [editRecord, setEditRecord] = useState<PaymentRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const records = getPaymentHistoryForCar(carId ?? "");
  const car = cars.find((c) => c.id === carId);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const openEdit = (r: PaymentRecord) => {
    setEditRecord(r);
    setShowModal(true);
  };

  const openAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditRecord(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Yüklənir...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        scrollEnabled={!!records.length}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPad + (isAdmin ? 90 : 20) },
        ]}
        ListHeaderComponent={
          car ? (
            <View style={styles.listHeader}>
              <Text style={[styles.carBadge, { color: colors.primary, backgroundColor: colors.green50 }]}>
                {car.plate}
              </Text>
              <Text style={[styles.recordCount, { color: colors.mutedForeground }]}>
                {records.length} ödəniş
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <PaymentCard record={item} onEdit={openEdit} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Ödəniş yoxdur</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Bu avtomobil üçün ödəniş tarixçəsi mövcud deyil
            </Text>
          </View>
        }
      />

      {isAdmin && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={openAdd}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <PaymentEditModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditRecord(null);
        }}
        record={editRecord}
        carId={carId ?? ""}
        carPlate={car?.plate ?? ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loadingText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  container: { flex: 1 },
  list: { paddingTop: 12 },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  carBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  recordCount: { fontSize: 14, fontFamily: "Inter_400Regular" },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  adminActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 10,
  },
  adminBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    gap: 8,
  },
  rowLabel: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  rowValue: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1, textAlign: "right" },
  odenisTarixValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "right" },
  divider: { height: 1, opacity: 0.5 },
  ixmNote: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 10, lineHeight: 18 },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00b16a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
