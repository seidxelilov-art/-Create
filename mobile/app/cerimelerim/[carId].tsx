import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddFineModal } from "@/components/AddFineModal";
import { FineCard } from "@/components/FineCard";
import { MediaViewerModal } from "@/components/MediaViewerModal";
import { Fine, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function CarFinesScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cars, getFinesForCar, isAdmin } = useApp();

  const [showAddFine, setShowAddFine] = useState(false);
  const [editFine, setEditFine] = useState<Fine | null>(null);
  const [viewMediaFine, setViewMediaFine] = useState<Fine | null>(null);

  const car = cars.find((c) => c.id === carId);
  const rawFines = getFinesForCar(carId ?? "");

  const parseTarix = (s: string) => {
    const [date, time] = s.split(" ");
    const [d, m, y] = (date ?? "").split(".");
    return new Date(`${y}-${m}-${d}T${time ?? "00:00:00"}`).getTime();
  };

  const fines = [...rawFines].sort((a, b) => parseTarix(b.tarix) - parseTarix(a.tarix));
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!car) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>
          Avtomobil tapılmadı
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: car.plate }} />

      <FlatList
        data={fines}
        keyExtractor={(item) => item.id}
        scrollEnabled={!!fines.length}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPad + (isAdmin ? 80 : 20) },
        ]}
        renderItem={({ item }) => (
          <FineCard
            fine={item}
            onEdit={(f) => {
              setEditFine(f);
              setShowAddFine(true);
            }}
            onViewMedia={(f) => setViewMediaFine(f)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={[styles.badge, { backgroundColor: colors.green50 }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {car.plate}
              </Text>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {car.status}
              </Text>
            </View>
            <Text style={[styles.fineCount, { color: colors.mutedForeground }]}>
              {fines.length} cərimə
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={56} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Cərimə yoxdur
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Bu avtomobil üçün heç bir cərimə qeydə alınmayıb
            </Text>
          </View>
        }
      />

      {isAdmin && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setEditFine(null);
            setShowAddFine(true);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <AddFineModal
        visible={showAddFine}
        onClose={() => {
          setShowAddFine(false);
          setEditFine(null);
        }}
        carId={car.id}
        carPlate={car.plate}
        editFine={editFine}
      />

      <MediaViewerModal
        visible={!!viewMediaFine}
        fine={viewMediaFine}
        onClose={() => setViewMediaFine(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingTop: 12 },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  fineCount: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
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
  notFound: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 40,
  },
});
