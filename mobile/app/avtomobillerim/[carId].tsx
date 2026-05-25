import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
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

function DetailRow({
  label,
  value,
  valueColor,
  valueExtra,
}: {
  label: string;
  value: string;
  valueColor?: string;
  valueExtra?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.detailValueRow}>
        <Text style={[styles.detailValue, { color: valueColor ?? colors.foreground }]}>
          {value}
        </Text>
        {valueExtra}
      </View>
    </View>
  );
}

export default function CarDetailScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cars, isAdmin, removeCar } = useApp();

  const car = cars.find((c) => c.id === carId);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!car) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 40 }}>
          Avtomobil tapılmadı
        </Text>
      </View>
    );
  }

  const handleDeactivate = () => {
    Alert.alert("Avtomobili deaktiv et", `${car.plate} deaktiv edilsin?`, [
      { text: "Ləğv et", style: "cancel" },
      {
        text: "Deaktiv et",
        style: "destructive",
        onPress: () => {
          removeCar(car.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: car.plate }} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Car header card */}
        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.carIconCircle, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="car" size={24} color="#fff" />
            </View>
            <Text style={[styles.plateText, { color: colors.foreground }]}>{car.plate}</Text>
          </View>
          <TouchableOpacity
            style={[styles.cerimelerBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/cerimelerim/${car.id}`)}
            activeOpacity={0.85}
          >
            <Text style={styles.cerimelerBtnText}>Cərimələr</Text>
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <DetailRow label="Texniki pasport" value={car.texnikiPasport ?? "—"} />
          <Divider />
          <DetailRow label="Qeydiyyat tarixi" value={car.qeydiyyatTarixi ?? "—"} />
          <Divider />
          <DetailRow label="Marka/Model" value={car.markaModel ?? "—"} />
          <Divider />
          <DetailRow label="Buraxılış ili" value={car.buraxilisIli ?? "—"} />
          <Divider />
          <DetailRow
            label="Məhdudiyyət\n(Həbs)"
            value={car.mehdudiyyetHebs ?? "Yoxdur"}
            valueExtra={
              <TouchableOpacity style={styles.yenileBtn}>
                <Text style={[styles.yenileText, { color: colors.primary }]}>Yenilə</Text>
              </TouchableOpacity>
            }
          />
          <Divider />
          <DetailRow label="Texniki baxışın bitmə vaxtı" value={car.texnikiBaxisBitme ?? "—"} />
          <Divider />
          <DetailRow
            label="SMSRadarin bitmə vaxtı"
            value={car.smsradarBitme ?? "—"}
            valueExtra={
              <TouchableOpacity style={styles.yenileBtn}>
                <Text style={[styles.yenileText, { color: colors.primary }]}>Yenilə</Text>
              </TouchableOpacity>
            }
          />
          <Divider />
          <DetailRow label="Status" value={car.status} valueColor={colors.primary} />
        </View>

        {/* Action buttons */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>Texniki nasazlıqları</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtnOutline, { borderColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.actionBtnOutlineText, { color: colors.primary }]}>
            Məlumatları yeniləyin
          </Text>
        </TouchableOpacity>

        {/* Insurance section */}
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>İcbari sığortası</Text>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: colors.primary }]}>Göstər</Text>
            </TouchableOpacity>
          </View>
          <Divider />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>İcbari sığortanı</Text>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: colors.primary }]}>Bizdən al</Text>
            </TouchableOpacity>
          </View>
          <Divider />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>İcbari sığorta müqaviləsini</Text>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: colors.primary }]}>Yüklə</Text>
            </TouchableOpacity>
          </View>
          <Divider />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
              İcbari sığortanın bitmə vaxtı
            </Text>
            <TouchableOpacity
              style={[styles.dateBadge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.dateBadgeText}>0000-00-00</Text>
              <Ionicons name="chevron-forward" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 12, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.bottomBtn, { backgroundColor: "#f59e0b" }]}
          onPress={() => router.push({ pathname: "/avtomobillerim/odenis-tarixcesi", params: { carId: car.id } })}
          activeOpacity={0.85}
        >
          <Text style={styles.bottomBtnText}>Ödəniş tarixçəsi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomBtn, { backgroundColor: "#ef4444" }]}
          onPress={handleDeactivate}
          activeOpacity={0.85}
        >
          <Text style={styles.bottomBtnText}>Deaktiv et</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 0 },
  headerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  carIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  plateText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  cerimelerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cerimelerBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  detailCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  detailValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "flex-end",
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  yenileBtn: {},
  yenileText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  linkText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dateBadgeText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, opacity: 0.5 },
  actionBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  actionBtnOutline: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    marginBottom: 12,
  },
  actionBtnOutlineText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  bottomBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bottomBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  bottomBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
