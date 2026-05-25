import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const COMMISSION = 1.3;

function genQebz() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}

function maskCard(card: string) {
  const digits = card.replace(/\s/g, "");
  if (digits.length < 12) return digits;
  return digits.slice(0, 6) + "******" + digits.slice(-4);
}

export default function PaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { fineId } = useLocalSearchParams<{ fineId: string }>();
  const { fines } = useApp();

  const fine = fines.find((f) => f.id === fineId);
  const odenilenMebleg = fine ? fine.cerime - fine.endirim : 0;
  const total = odenilenMebleg + COMMISSION;

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [cardError, setCardError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvvError, setCvvError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const expiryRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);

  if (!fine) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 40 }}>
          Cərimə tapılmadı
        </Text>
      </View>
    );
  }

  const handleCardChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    setCardError("");
    if (formatted.replace(/\s/g, "").length === 16) {
      expiryRef.current?.focus();
    }
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiry(text);
    setExpiry(formatted);
    setExpiryError("");
    if (formatted.length === 5) {
      cvvRef.current?.focus();
    }
  };

  const handlePayPress = () => {
    const digits = cardNumber.replace(/\s/g, "");
    let valid = true;
    if (digits.length !== 16) {
      setCardError("16 rəqəmli kart nömrəsi daxil edin");
      valid = false;
    }
    const expiryParts = expiry.split("/");
    if (expiry.length !== 5 || !expiryParts[0] || !expiryParts[1]) {
      setExpiryError("Düzgün tarix daxil edin (AY/İL)");
      valid = false;
    }
    if (cvv.length < 3) {
      setCvvError("CVV/CVC daxil edin");
      valid = false;
    }
    if (!valid) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    const masked = maskCard(cardNumber);
    const qebzNomresi = genQebz();
    const delay = 3000 + Math.random() * 1000; // 3-4 seconds

    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/payment-success",
        params: {
          fineId: fine.id,
          maskedCard: masked,
          total: total.toFixed(2),
          qebzNomresi,
        },
      });
    }, delay);
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: "Onlayn ödəniş",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
          headerShadowVisible: false,
          headerBackTitle: "Geri",
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.foreground }]}>
              Ödəniş emal edilir...
            </Text>
            <Text style={[styles.loadingSubText, { color: colors.mutedForeground }]}>
              Zəhmət olmasa gözləyin
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isLoading}
      >
        {/* Header card */}
        <View style={[styles.headerCard, { backgroundColor: "#00b16a" }]}>
          <Text style={styles.headerTitle}>Ödənişi tamamlayın</Text>
          <View style={styles.amountBadge}>
            <Text style={styles.amountBadgeText}>{total.toFixed(2)} AZN</Text>
          </View>
        </View>

        {/* Fine summary */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SRow label="Protokol" value={fine.protokol} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SRow label="Qəbul edən" value="BDYPİ (Cərimə)" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SRow label="Müştəri" value={fine.cerimelenan} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SRow label="Məbləğ" value={`${odenilenMebleg.toFixed(2)} AZN`} />
          <Text style={[styles.ixmShort, { color: colors.mutedForeground }]}>
            {fine.ixmNote.replace("İXM:", "").trim()}
          </Text>
        </View>

        {/* Commission info */}
        <View style={[styles.commissionRow, { backgroundColor: colors.green50, borderColor: colors.green100 }]}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.primary} />
          <Text style={[styles.commissionText, { color: colors.green600 }]}>
            Komissiya: <Text style={{ fontFamily: "Inter_700Bold" }}>1.30 AZN</Text>
          </Text>
          <Text style={[styles.commissionTotal, { color: colors.primary }]}>
            Cəmi: {total.toFixed(2)} AZN
          </Text>
        </View>

        {/* Card inputs */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardSectionTitle, { color: colors.foreground }]}>
            Kartın üzərində olan 16 rəqəmli nömrəsi
          </Text>
          <TextInput
            style={[
              styles.cardInput,
              {
                borderColor: cardError ? colors.destructive : colors.border,
                color: colors.foreground,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={colors.mutedForeground}
            value={cardNumber}
            onChangeText={handleCardChange}
            keyboardType="numeric"
            maxLength={19}
            returnKeyType="next"
            onSubmitEditing={() => expiryRef.current?.focus()}
            editable={!isLoading}
          />
          {cardError ? (
            <Text style={[styles.fieldError, { color: colors.destructive }]}>{cardError}</Text>
          ) : null}

          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Kartın bitmə tarixi
              </Text>
              <TextInput
                ref={expiryRef}
                style={[
                  styles.cardInput,
                  {
                    borderColor: expiryError ? colors.destructive : colors.border,
                    color: colors.foreground,
                    backgroundColor: colors.background,
                  },
                ]}
                placeholder="AY/İL"
                placeholderTextColor={colors.mutedForeground}
                value={expiry}
                onChangeText={handleExpiryChange}
                keyboardType="numeric"
                maxLength={5}
                returnKeyType="next"
                onSubmitEditing={() => cvvRef.current?.focus()}
                editable={!isLoading}
              />
              {expiryError ? (
                <Text style={[styles.fieldError, { color: colors.destructive }]}>{expiryError}</Text>
              ) : null}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                CVV2/CVC2
              </Text>
              <TextInput
                ref={cvvRef}
                style={[
                  styles.cardInput,
                  {
                    borderColor: cvvError ? colors.destructive : colors.border,
                    color: colors.foreground,
                    backgroundColor: colors.background,
                  },
                ]}
                placeholder="123"
                placeholderTextColor={colors.mutedForeground}
                value={cvv}
                onChangeText={(t) => {
                  setCvv(t.replace(/\D/g, "").slice(0, 3));
                  setCvvError("");
                }}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
                returnKeyType="done"
                editable={!isLoading}
              />
              {cvvError ? (
                <Text style={[styles.fieldError, { color: colors.destructive }]}>{cvvError}</Text>
              ) : null}
            </View>
          </View>

          {/* Save card */}
          <TouchableOpacity
            style={styles.saveCardRow}
            onPress={() => setSaveCard((v) => !v)}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: saveCard ? colors.primary : colors.border,
                  backgroundColor: saveCard ? colors.primary : "transparent",
                },
              ]}
            >
              {saveCard && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={[styles.saveCardText, { color: colors.foreground }]}>
              Kartı yadda saxla
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pay button */}
        <TouchableOpacity
          style={[styles.payBtn, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
          onPress={handlePayPress}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          <Text style={styles.payBtnText}>Ödəniş et</Text>
        </TouchableOpacity>

        {/* Apple Pay (cosmetic) */}
        <TouchableOpacity
          style={[styles.applePayBtn, { backgroundColor: "#1c1c1e" }]}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          <Ionicons name="logo-apple" size={18} color="#fff" />
          <Text style={styles.applePayText}>Pay ilə ödə</Text>
        </TouchableOpacity>

        {/* Commission badge */}
        <View style={[styles.commissionBadge, { backgroundColor: "#fef9e7", borderColor: "#f5e642" }]}>
          <Text style={[styles.commissionBadgeText, { color: "#92790a" }]}>
            Komissiya {COMMISSION.toFixed(1)} AZN
          </Text>
        </View>

        {/* Card logos */}
        <View style={styles.cardLogos}>
          <Text style={[styles.cardLogoText, { color: colors.mutedForeground }]}>
            MasterCard · VISA · Millikart
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.sRow}>
      <Text style={[styles.sRowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.sRowValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 0 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    minWidth: 200,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  loadingSubText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#ffffff" },
  amountBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  amountBadgeText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#ffffff" },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  sRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
  },
  sRowLabel: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  sRowValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "right" },
  divider: { height: 1, opacity: 0.5 },
  ixmShort: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8, lineHeight: 18 },
  commissionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  commissionText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  commissionTotal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  cardSectionTitle: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 10 },
  cardInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
    letterSpacing: 1,
  },
  fieldError: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 6 },
  row2: { flexDirection: "row", gap: 10, marginTop: 8 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
  saveCardRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  saveCardText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  payBtn: {
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  payBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  applePayBtn: {
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 10,
  },
  applePayText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  commissionBadge: {
    marginHorizontal: 16,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 16,
  },
  commissionBadgeText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  cardLogos: { alignItems: "center", marginBottom: 8 },
  cardLogoText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
