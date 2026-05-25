import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddCarModal } from "@/components/AddCarModal";
import { Car, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function CerimelerimScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cars, removeCar, isAdmin } = useApp();
  const [search, setSearch] = useState("");
  const [showAddCar, setShowAddCar] = useState(false);
  const [loading, setLoading] = useState(true);
  const canGoBack = router.canGoBack();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = cars.filter((c) =>
    c.plate.toLowerCase().includes(search.toLowerCase())
  );

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLongPress = (car: Car) => {
    if (!isAdmin) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Avtomobili sil",
      `${car.plate} nömrəli avtomobili silmək istəyirsiniz?`,
      [
        { text: "Ləğv et", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            removeCar(car.id);
          },
        },
      ]
    );
  };

  const backButton = canGoBack ? (
    <TouchableOpacity
      onPress={() => router.back()}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{ marginLeft: Platform.OS === "ios" ? -6 : 0 }}
    >
      <Ionicons name="chevron-back" size={26} color={colors.foreground} />
    </TouchableOpacity>
  ) : undefined;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerLeft: () => backButton }} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Yüklənir...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerLeft: () => backButton }} />
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Axtar (min. 5 simvol)"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        scrollEnabled={!!filtered.length}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPad + 100 },
        ]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.carRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/cerimelerim/${item.id}`)}
            onLongPress={() => handleLongPress(item)}
            activeOpacity={0.8}
          >
            <Text style={[styles.carPlate, { color: colors.foreground }]}>{item.plate}</Text>
            <Text style={[styles.carStatus, { color: colors.primary }]}>{item.status}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Avtomobil tapılmadı
            </Text>
          </View>
        }
      />

      <View style={[styles.footer, { paddingBottom: bottomPad + 16, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.addCarBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddCar(true);
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.addCarBtnText, { color: colors.primaryForeground }]}>
            Avtomobil əlavə edin
          </Text>
        </TouchableOpacity>
      </View>

      <AddCarModal visible={showAddCar} onClose={() => setShowAddCar(false)} />
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
  loadingText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  container: { flex: 1 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  carRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  carPlate: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  carStatus: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  addCarBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  addCarBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
