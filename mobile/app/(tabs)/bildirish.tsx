import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppNotification, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const TABS = ["Hamısı", "SMS Radar", "Elanlar"] as const;
type TabType = (typeof TABS)[number];

function formatDateGroup(iso: string): string {
  const d = new Date(iso);
  const months = [
    "Yan", "Fev", "Mar", "Apr", "May", "İyn",
    "İyl", "Avq", "Sen", "Okt", "Noy", "Dek",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function groupByDate(notifications: AppNotification[]) {
  const groups: { date: string; items: AppNotification[] }[] = [];
  const seen = new Set<string>();

  for (const n of notifications) {
    const dateKey = formatDateGroup(n.createdAt);
    if (!seen.has(dateKey)) {
      seen.add(dateKey);
      groups.push({ date: dateKey, items: [] });
    }
    groups[groups.length - 1].items.push(n);
  }
  return groups;
}

function NotificationItem({ item }: { item: AppNotification }) {
  const colors = useColors();

  const handleLinkPress = () => {
    if (item.link) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL("https://web.api.az");
    }
  };

  const isPaid = item.type === "odenis";

  return (
    <View style={[styles.notifItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.notifIcon, { backgroundColor: isPaid ? colors.green50 : colors.green50 }]}>
        <MaterialCommunityIcons
          name={isPaid ? "check-circle" : "radar"}
          size={24}
          color={colors.primary}
        />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifText, { color: colors.foreground }]}>
          {item.message}
          {item.link ? (
            <Text
              style={[styles.linkText, { color: "#2563eb" }]}
              onPress={handleLinkPress}
            >
              {item.link}
            </Text>
          ) : null}
        </Text>
        <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>
          {item.timeText}
        </Text>
      </View>
    </View>
  );
}

export default function BildirishScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, clearNotifications } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>("SMS Radar");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const filtered =
    activeTab === "Elanlar"
      ? []
      : notifications.filter((n) =>
          activeTab === "Hamısı" ? true : n.type === "cerime" || n.type === "odenis"
        );

  const grouped = groupByDate(filtered);

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Bildirişləri sil", "Bütün bildirişlər silinsin?", [
      { text: "Ləğv et", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => clearNotifications(),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Bildirişlər</Text>
        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="trash-outline" size={22} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                isActive && { backgroundColor: colors.primary, borderRadius: 8 },
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? "#fff" : colors.mutedForeground },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notifications list */}
      <FlatList
        data={grouped}
        keyExtractor={(item) => item.date}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: group }) => (
          <View>
            <Text style={[styles.dateGroup, { color: colors.mutedForeground }]}>
              {group.date}
            </Text>
            {group.items.map((n) => (
              <NotificationItem key={n.id} item={n} />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {activeTab === "Elanlar" ? "Elan yoxdur" : "Bildiriş yoxdur"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  heading: { fontSize: 28, fontFamily: "Inter_700Bold" },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  dateGroup: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginTop: 12,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notifItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: { flex: 1, gap: 4 },
  notifText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  linkText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  notifTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
