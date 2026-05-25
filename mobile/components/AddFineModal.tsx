import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Fine, useApp } from "@/context/AppContext";

interface AddFineModalProps {
  visible: boolean;
  onClose: () => void;
  carId: string;
  carPlate: string;
  editFine?: Fine | null;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={fieldStyles.container}>
      <Text style={[fieldStyles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <TextInput
        style={[
          fieldStyles.input,
          {
            borderColor: colors.border,
            color: colors.foreground,
            backgroundColor: colors.background,
            fontFamily: "Inter_400Regular",
            height: multiline ? 70 : undefined,
            textAlignVertical: multiline ? "top" : undefined,
          },
        ]}
        placeholder={placeholder ?? label}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        multiline={multiline}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});

export function AddFineModal({
  visible,
  onClose,
  carId,
  carPlate,
  editFine,
}: AddFineModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addFine, updateFine } = useApp();

  const [protokol, setProtokol] = useState("");
  const [cerimelenan, setCerimelenan] = useState("");
  const [cerime, setCerime] = useState("");
  const [endirim, setEndirim] = useState("0");
  const [status, setStatus] = useState("Qərarlı");
  const [suretHeddi, setSuretHeddi] = useState("");
  const [asdiqinizSuret, setAsdiqinizSuret] = useState("");
  const [qerarTarix, setQerarTarix] = useState("");
  const [tarix, setTarix] = useState("");
  const [qeydAlınmaYeri, setQeydAlınmaYeri] = useState("");
  const [ixmNote, setIxmNote] = useState("");
  const [mediaUri, setMediaUri] = useState<string | undefined>(undefined);
  const [mediaUri2, setMediaUri2] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (editFine) {
      setProtokol(editFine.protokol);
      setCerimelenan(editFine.cerimelenan);
      setCerime(String(editFine.cerime));
      setEndirim(String(editFine.endirim));
      setStatus(editFine.status);
      setSuretHeddi(String(editFine.suretHeddi));
      setAsdiqinizSuret(String(editFine.asdiqinizSuret));
      setQerarTarix(editFine.qerarTarix);
      setTarix(editFine.tarix);
      setQeydAlınmaYeri(editFine.qeydAlınmaYeri);
      setIxmNote(editFine.ixmNote);
      setMediaUri(editFine.mediaUri);
      setMediaUri2(editFine.mediaUri2);
    } else {
      setProtokol("");
      setCerimelenan("");
      setCerime("");
      setEndirim("0");
      setStatus("Qərarlı");
      setSuretHeddi("");
      setAsdiqinizSuret("");
      setQerarTarix("");
      setTarix(new Date().toLocaleDateString("az-AZ"));
      setQeydAlınmaYeri("");
      setIxmNote("");
      setMediaUri(undefined);
      setMediaUri2(undefined);
    }
  }, [editFine, visible]);

  const copyToPermanent = async (uri: string): Promise<string> => {
    try {
      if (Platform.OS === "web") return uri;
      const dir = FileSystem.documentDirectory + "fine_images/";
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const ext = uri.split(".").pop()?.split("?")[0] ?? "jpg";
      const dest = dir + Date.now() + "_" + Math.random().toString(36).slice(2) + "." + ext;
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch {
      return uri;
    }
  };

  const pickMedia = async (slot: 1 | 2) => {
    const { status: perm } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const permanent = await copyToPermanent(result.assets[0].uri);
      if (slot === 1) setMediaUri(permanent);
      else setMediaUri2(permanent);
    }
  };

  const handleSave = () => {
    if (!protokol.trim()) return;
    const fineData = {
      carId,
      protokol: protokol.trim(),
      avtomobil: carPlate,
      cerimelenan: cerimelenan.trim(),
      cerime: parseFloat(cerime) || 0,
      endirim: parseFloat(endirim) || 0,
      status,
      suretHeddi: parseFloat(suretHeddi) || 0,
      asdiqinizSuret: parseFloat(asdiqinizSuret) || 0,
      qerarTarix,
      tarix,
      qeydAlınmaYeri,
      ixmNote,
      mediaUri,
      mediaUri2,
    };

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (editFine) {
      updateFine(editFine.id, fineData);
    } else {
      addFine(fineData);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.sheetHeader}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.title, { color: colors.foreground }]}>
              {editFine ? "Cərimi redaktə et" : "Yeni cərimə əlavə et"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Field label="Protokol" value={protokol} onChangeText={setProtokol} />
            <Field label="Cərimə olunan" value={cerimelenan} onChangeText={setCerimelenan} />
            <Field label="Cərimə (AZN)" value={cerime} onChangeText={setCerime} keyboardType="numeric" />
            <Field label="Endirim (AZN)" value={endirim} onChangeText={setEndirim} keyboardType="numeric" />
            <Field label="Status" value={status} onChangeText={setStatus} />
            <Field label="Sürət həddi (km/saat)" value={suretHeddi} onChangeText={setSuretHeddi} keyboardType="numeric" />
            <Field label="Aşdığınız sürət (km/saat)" value={asdiqinizSuret} onChangeText={setAsdiqinizSuret} keyboardType="numeric" />
            <Field label="Qərar tarixi" value={qerarTarix} onChangeText={setQerarTarix} placeholder="DD.MM.YYYY" />
            <Field label="Tarix" value={tarix} onChangeText={setTarix} placeholder="DD.MM.YYYY HH:mm" />
            <Field label="Qeydə alınma yeri" value={qeydAlınmaYeri} onChangeText={setQeydAlınmaYeri} multiline />
            <Field label="İXM qeydi" value={ixmNote} onChangeText={setIxmNote} multiline />

            <View style={styles.mediaRow}>
              {([1, 2] as const).map((slot) => {
                const uri = slot === 1 ? mediaUri : mediaUri2;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.mediaPickBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                    onPress={() => pickMedia(slot)}
                    activeOpacity={0.8}
                  >
                    {uri ? (
                      <Image source={{ uri }} style={styles.mediaPreview} />
                    ) : (
                      <>
                        <Ionicons name="image-outline" size={22} color={colors.mutedForeground} />
                        <Text style={[styles.mediaPickText, { color: colors.mutedForeground }]}>
                          Şəkil {slot}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
                {editFine ? "Yenilə" : "Əlavə et"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: "92%",
  },
  sheetHeader: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 24,
    padding: 4,
  },
  scrollView: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  mediaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  mediaPickBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    overflow: "hidden",
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  mediaPickText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
