import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Fine, useApp } from "@/context/AppContext";

interface FineCardProps {
  fine: Fine;
  onEdit?: (fine: Fine) => void;
  onViewMedia?: (fine: Fine) => void;
}

interface RowProps {
  label: string;
  value: string;
}

function Row({ label, value }: RowProps) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export function FineCard({ fine, onEdit, onViewMedia }: FineCardProps) {
  const colors = useColors();
  const { isAdmin, removeFine } = useApp();
  const router = useRouter();

  const odenilenMebleg = fine.cerime - fine.endirim;

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Cərimi sil",
      `${fine.protokol} protokollu cərimi silmək istəyirsiniz?`,
      [
        { text: "Ləğv et", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            removeFine(fine.id);
          },
        },
      ]
    );
  };

  const handlePayOnline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/payment", params: { fineId: fine.id } });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {isAdmin && (
        <View style={styles.adminActions}>
          <TouchableOpacity
            onPress={() => onEdit?.(fine)}
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

      <Row label="Protokol" value={fine.protokol} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="Avtomobilin nömrəsi" value={fine.avtomobil} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="Cərimə olunan" value={fine.cerimelenan} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="Cərimə" value={`${fine.cerime} AZN`} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="Endirim" value={`${fine.endirim} AZN`} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="Ödəniləcək məbləğ" value={`${odenilenMebleg} AZN`} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="Status" value={fine.status} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="Sürət həddi" value={`${fine.suretHeddi} km/saat`} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="Aşdığınız sürət" value={`${fine.asdiqinizSuret} km/saat`} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="Qərar vurulma tarixi" value={fine.qerarTarix} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="Tarix" value={fine.tarix} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Row label="Qeydə alınma yeri" value={fine.qeydAlınmaYeri} />

      {fine.ixmNote ? (
        <Text style={[styles.ixmNote, { color: colors.mutedForeground }]}>{fine.ixmNote}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.mediaBtn, { borderColor: colors.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onViewMedia?.(fine);
        }}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="image-multiple-outline" size={18} color={colors.primary} />
        <Text style={[styles.mediaBtnText, { color: colors.primary }]}>
          Şəkil və ya videoya bax →
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.payBtn, { backgroundColor: colors.primary }]}
        onPress={handlePayOnline}
        activeOpacity={0.85}
      >
        <Text style={[styles.payBtnText, { color: colors.primaryForeground }]}>
          Onlayn ödə
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 12,
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
  rowLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
  },
  rowValueBold: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    opacity: 0.6,
  },
  ixmNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 12,
    lineHeight: 18,
  },
  mediaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  mediaBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  payBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 10,
  },
  payBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
