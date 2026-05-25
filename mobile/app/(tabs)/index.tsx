import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdBanner } from "@/components/AdBanner";
import { GridMenuItem } from "@/components/GridMenuItem";
import { useColors } from "@/hooks/useColors";

const MENU_ITEMS = [
  {
    label: "Cərimələrim",
    iconName: "car-emergency" as const,
    iconColor: "#00b16a",
    bgColor: "#e8f8f0",
    route: "/cerimelerim" as const,
  },
  {
    label: "Avtomobillərim",
    iconName: "car" as const,
    iconColor: "#f59e0b",
    bgColor: "#fef3c7",
    route: "/avtomobillerim" as const,
  },
  {
    label: "Sürücülük vəsiqələrim",
    iconName: "card-account-details" as const,
    iconColor: "#3b82f6",
    bgColor: "#dbeafe",
    route: "/suruculuk-vesiqelerim" as const,
  },
  {
    label: "SMSRadar Premium",
    iconName: "crown" as const,
    iconColor: "#ec4899",
    bgColor: "#fce7f3",
    route: null,
    badge: true,
  },
  {
    label: "eTravel",
    iconName: "web" as const,
    iconColor: "#0ea5e9",
    bgColor: "#e0f2fe",
    route: null,
    badge: true,
  },
  {
    label: "Kartlarım",
    iconName: "credit-card" as const,
    iconColor: "#f97316",
    bgColor: "#ffedd5",
    route: null,
  },
  {
    label: "Avtomobil elanları",
    iconName: "car-multiple" as const,
    iconColor: "#ef4444",
    bgColor: "#fee2e2",
    route: null,
  },
  {
    label: "Sual Cavab",
    iconName: "chat-question" as const,
    iconColor: "#00b16a",
    bgColor: "#e8f8f0",
    route: null,
  },
  {
    label: "Avtomobil Hesabatı",
    iconName: "car-cog" as const,
    iconColor: "#ef4444",
    bgColor: "#fee2e2",
    route: null,
  },
  {
    label: "Onlayn imtahan",
    iconName: "steering" as const,
    iconColor: "#6b7280",
    bgColor: "#f3f4f6",
    route: null,
  },
  {
    label: "Cərimə ödənişləri",
    iconName: "credit-card-check" as const,
    iconColor: "#00b16a",
    bgColor: "#e8f8f0",
    route: null,
  },
  {
    label: "Sığorta xidməti",
    iconName: "shield-car" as const,
    iconColor: "#f59e0b",
    bgColor: "#fef3c7",
    route: null,
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const rows: (typeof MENU_ITEMS)[] = [];
  for (let i = 0; i < MENU_ITEMS.length; i += 3) {
    rows.push(MENU_ITEMS.slice(i, i + 3));
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 12,
          paddingBottom:
            Platform.OS === "web" ? 34 + 84 : insets.bottom + 84,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <AdBanner />

      <View style={styles.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((item) => (
              <GridMenuItem
                key={item.label}
                label={item.label}
                iconName={item.iconName}
                iconColor={item.iconColor}
                bgColor={item.bgColor}
                badge={item.badge}
                onPress={() => {
                  if (item.route) router.push(item.route);
                }}
              />
            ))}
            {row.length < 3 &&
              Array.from({ length: 3 - row.length }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.emptyCell} />
              ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
  },
  grid: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 0,
  },
  emptyCell: {
    flex: 1,
  },
});
