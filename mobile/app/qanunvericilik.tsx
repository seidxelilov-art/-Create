import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function QanunvericiliqScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAdmin, setIsAdmin } = useApp();

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleToggle = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAdmin(val);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
    >
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionRow}>
          <View style={styles.sectionLeft}>
            <View style={[styles.iconWrap, { backgroundColor: colors.green50 }]}>
              <MaterialCommunityIcons
                name="shield-account"
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={styles.sectionText}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                Admin rejimi
              </Text>
              <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
                Cərimə əlavə etmək, redaktə etmək və silmək
              </Text>
            </View>
          </View>
          <Switch
            value={isAdmin}
            onValueChange={handleToggle}
            trackColor={{
              false: colors.border,
              true: colors.primary,
            }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.green50, borderColor: colors.green100 }]}>
        <MaterialCommunityIcons
          name={isAdmin ? "lock-open-variant" : "lock"}
          size={20}
          color={colors.primary}
        />
        <Text style={[styles.infoText, { color: colors.green600 }]}>
          {isAdmin
            ? "Admin rejimi aktiv. Cərimələri əlavə etmək, redaktə etmək və silmək mümkündür."
            : "Admin rejimi deaktiv. Yalnız baxmaq mümkündür."}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Yol hərəkəti qaydaları
        </Text>
        {LAWS.map((law, i) => (
          <View key={i}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            <View style={styles.lawRow}>
              <Text style={[styles.lawCode, { color: colors.primary }]}>{law.code}</Text>
              <Text style={[styles.lawText, { color: colors.foreground }]}>{law.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const LAWS = [
  {
    code: "YHQ 328.1",
    text: "Yolda müəyyən edilmiş hərəkət sürətini 10-20 km/saat həddində aşmağa görə — 10 AZN",
  },
  {
    code: "YHQ 328.2",
    text: "Yolda müəyyən edilmiş hərəkət sürətini 20-40 km/saat həddində aşmağa görə — 40 AZN",
  },
  {
    code: "YHQ 328.3",
    text: "Yolda müəyyən edilmiş hərəkət sürətini 40 km/saat-dan artıq aşmağa görə — 200 AZN",
  },
  {
    code: "YHQ 329",
    text: "Qırmızı işıqda keçməyə görə — 40 AZN, yaxud sürücülük vəsiqəsinin 6 aya qədər əlindən alınması",
  },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionText: { flex: 1 },
  sectionLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  sectionDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  lawRow: {
    paddingVertical: 10,
    gap: 4,
  },
  lawCode: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  lawText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  divider: {
    height: 1,
  },
});
