import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

export default function AvtomobillerimScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cars, removeCar, isAdmin } = useApp();
  const [search, setSearch] = useState("");
  const [showAddCar, setShowAddCar] = useState(false);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = cars.filter((c) =>
    c.plate.toLowerCase().includes(search.toLowerCase())
  );

  const handleLongPress = (car: Car) => {
    if (!isAdmin) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Avtomobili sil", `${car.plate} nömrəli avtomobili silmək istəyirsiniz?`, [
      { text: "Ləğv et", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => removeCar(car.id),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.carRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/avtomobillerim/${item.id}`)}
            onLongPress={() => handleLongPress(item)}
            activeOpacity={0.8}
          >
            <View style={[styles.carIcon, { backgroundColor: colors.green50 }]}>
              <Ionicons name="car" size={22} color={colors.primary} />
            </View>
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
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddCar(true);
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.addBtnText, { color: "#fff" }]}>Avtomobil əlavə edin</Text>
        </TouchableOpacity>
      </View>

      <AddCarModal visible={showAddCar} onClose={() => setShowAddCar(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  carRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  carIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  carPlate: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold" },
  carStatus: { fontSize: 14, fontFamily: "Inter_500Medium" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  addBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  addBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
