import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
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

interface MenuRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
}

function MenuRow({ icon, label, value, onPress }: MenuRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.menuRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuRowLeft}>
        {icon}
        <Text style={[styles.menuRowLabel, { color: colors.foreground }]}>{label}</Text>
      </View>
      <View style={styles.menuRowRight}>
        {value ? (
          <Text style={[styles.menuRowValue, { color: colors.mutedForeground }]}>{value}</Text>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

function MenuSection({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

export default function ProfilScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const pickAvatar = async () => {
    if (Platform.OS === "web") return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateProfile({ avatarUri: result.assets[0].uri });
    }
  };

  const iconColor = colors.primary;
  const iconSize = 22;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.foreground }]}>Profil</Text>

      <MenuSection>
        <TouchableOpacity
          style={[styles.profileRow, { borderBottomColor: colors.border }]}
          onPress={pickAvatar}
          activeOpacity={0.85}
        >
          <View style={[styles.avatarContainer, { borderColor: colors.border }]}>
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.green50 }]}>
                <Ionicons name="person" size={28} color={colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.mutedForeground }]}>
              {profile.name}
            </Text>
            <Text style={[styles.profilePhone, { color: colors.foreground }]}>
              {profile.phone}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </MenuSection>

      <MenuSection>
        <MenuRow
          icon={<MaterialCommunityIcons name="crown-outline" size={iconSize} color={iconColor} style={styles.menuIcon} />}
          label="Hesabı premium et"
        />
        <MenuRow
          icon={<MaterialCommunityIcons name="credit-card-outline" size={iconSize} color={iconColor} style={styles.menuIcon} />}
          label="Kartlarım"
        />
        <MenuRow
          icon={<MaterialCommunityIcons name="cash-plus" size={iconSize} color={iconColor} style={styles.menuIcon} />}
          label="Balansı artır"
          value="0 AZN"
        />
        <MenuRow
          icon={<MaterialCommunityIcons name="bee" size={iconSize} color={iconColor} style={styles.menuIcon} />}
          label="Balı yoxla"
        />
      </MenuSection>

      <MenuSection>
        <MenuRow
          icon={<MaterialCommunityIcons name="car-side" size={iconSize} color={iconColor} style={styles.menuIcon} />}
          label="Satış elanları"
        />
        <MenuRow
          icon={<MaterialCommunityIcons name="car-key" size={iconSize} color={iconColor} style={styles.menuIcon} />}
          label="İcarə elanları"
        />
        <MenuRow
          icon={<MaterialCommunityIcons name="store" size={iconSize} color={iconColor} style={styles.menuIcon} />}
          label="Avtosalonlar"
        />
        <MenuRow
          icon={<MaterialCommunityIcons name="history" size={iconSize} color={iconColor} style={styles.menuIcon} />}
          label="Əməliyyat tarixçəsi"
        />
      </MenuSection>

      <MenuSection>
        <MenuRow
          icon={<Ionicons name="notifications-outline" size={iconSize} color={iconColor} style={styles.menuIcon} />}
          label="Bildiriş ayarları"
        />
        <MenuRow
          icon={<MaterialCommunityIcons name="scale-balance" size={iconSize} color={iconColor} style={styles.menuIcon} />}
          label="Qanunvericilik"
          onPress={() => router.push("/qanunvericilik")}
        />
      </MenuSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  menuSection: {
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 0,
    gap: 12,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 24,
  },
  menuRowLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  menuRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  menuRowValue: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
