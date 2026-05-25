import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function PaymentSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { fineId, maskedCard, total, qebzNomresi } = useLocalSearchParams<{
    fineId: string;
    maskedCard: string;
    total: string;
    qebzNomresi: string;
  }>();
  const { markFinePaid } = useApp();
  const markedRef = useRef(false);

  const totalNum = parseFloat(total ?? "0");
  const rrn = useRef("0006" + Math.floor(10000000 + Math.random() * 90000000).toString()).current;
  const now = new Date();
  const tarix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (fineId) {
      markFinePaid(fineId, maskedCard ?? "—", totalNum, qebzNomresi ?? "");
    }
  }, []);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Green top section */}
        <View style={[styles.successHeader, { backgroundColor: "#00b16a" }]}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={36} color="#00b16a" />
          </View>
          <Text style={styles.successTitle}>Ödəniş uğurla tamamlandı</Text>
          <Text style={styles.successAmount}>{totalNum.toFixed(2)} AZN</Text>
        </View>

        {/* Receipt card */}
        <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ReceiptRow label="Qəbz Nömrəsi" value={qebzNomresi ?? "—"} valueColor="#2563eb" />
          <Divider />
          <ReceiptRow label="Protokol" value="—" />
          <Divider />
          <ReceiptRow label="Məbləğ" value={`${totalNum.toFixed(2)} AZN`} />
          <Divider />
          <ReceiptRow label="Tarix" value={tarix} />
          <Divider />
          <ReceiptRow label="RRN" value={rrn} valueColor="#2563eb" />
          <Divider />
          <ReceiptRow label="Kart vasitəsilə" value={maskedCard ?? "—"} />
          <Divider />
          <ReceiptRow label="Komissiya" value="1.30 AZN" />
          <Divider />
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>Status</Text>
            <View style={[styles.successBadge, { backgroundColor: colors.green50 }]}>
              <Text style={[styles.successBadgeText, { color: colors.primary }]}>Uğurlu</Text>
            </View>
          </View>
        </View>

        {/* Print receipt (cosmetic) */}
        <TouchableOpacity
          style={[styles.printBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="printer-outline" size={18} color={colors.foreground} />
          <Text style={[styles.printBtnText, { color: colors.foreground }]}>Qəbzi çap et</Text>
        </TouchableOpacity>

        {/* Done button */}
        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.dismissAll()}
          activeOpacity={0.85}
        >
          <Text style={styles.doneBtnText}>Əsas səhifəyə qayıt</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ReceiptRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.receiptRow}>
      <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.receiptValue, { color: valueColor ?? colors.foreground }]}>{value}</Text>
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {},
  successHeader: {
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 36,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  successAmount: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#ffffff" },
  receiptCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  receiptLabel: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  receiptValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "right", flex: 1 },
  divider: { height: 1, opacity: 0.5 },
  successBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  successBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  printBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    marginBottom: 12,
  },
  printBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  doneBtn: {
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
