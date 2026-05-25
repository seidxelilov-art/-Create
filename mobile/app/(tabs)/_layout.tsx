import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          elevation: 0,
          height: isWeb ? 84 : 60,
          paddingBottom: isWeb ? 34 : 0,
        },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 10, marginBottom: 4 },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBar }]} />
          ) : null,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Əsas səhifə", tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} /> }} />
      <Tabs.Screen name="elanlar" options={{ title: "Elanlar", tabBarIcon: ({ color }) => <Ionicons name="megaphone-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="rentacar" options={{ title: "Rent a Car", tabBarIcon: ({ color }) => <Ionicons name="car-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="bildirish" options={{ title: "Bildirişlər", tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={22} color={color} /> }} />
      <Tabs.Screen name="profil" options={{ title: "Profil", tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} /> }} />
    </Tabs>
  );
}
