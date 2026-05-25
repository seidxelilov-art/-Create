import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

interface AddCarModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddCarModal({ visible, onClose }: AddCarModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addCar } = useApp();
  const [plate, setPlate] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = plate.trim().toUpperCase();
    if (!trimmed) {
      setError("Avtomobil nömrəsini daxil edin");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addCar(trimmed);
    setPlate("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setPlate("");
    setError("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.foreground }]}>
            Avtomobil əlavə edin
          </Text>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Dövlət nömrəsi
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: error ? colors.destructive : colors.border,
                color: colors.foreground,
                backgroundColor: colors.background,
                fontFamily: "Inter_500Medium",
              },
            ]}
            placeholder="10AZ503"
            placeholderTextColor={colors.mutedForeground}
            value={plate}
            onChangeText={(t) => {
              setPlate(t);
              setError("");
            }}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {error ? (
            <Text style={[styles.error, { color: colors.destructive }]}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={handleAdd}
            activeOpacity={0.85}
          >
            <Text style={[styles.addBtnText, { color: colors.primaryForeground }]}>
              Əlavə et
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
              Ləğv et
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 4,
  },
  error: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  addBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  addBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});
