import { Stack } from "expo-router";
import React from "react";
import { useColors } from "@/hooks/useColors";

export default function AvtomobillerimLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
        headerShadowVisible: false,
        headerBackTitle: "Geri",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Avtomobillərim" }} />
      <Stack.Screen name="[carId]" options={{ title: "" }} />
      <Stack.Screen name="odenis-tarixcesi" options={{ title: "Ödəniş tarixçəsi" }} />
    </Stack>
  );
}
