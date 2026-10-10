import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSelector } from "react-redux";
// Keep the QR image at: assets/images/GLOW_salon_upi_qr.png
import PaymentQR from "../assets/images/glow_salon_upi_qr.png";
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://salon-backend-49vk.onrender.com/api";
const UPI_ID = "9955607199@ybl";
const PAYMENT_AMOUNT = 299;
type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};
export default function SubscriptionPaymentScreen() {
  const { token } = useSelector((state: any) => state.auth);
  const [transactionId, setTransactionId] = useState("");
  const [paymentImage, setPaymentImage] = useState<SelectedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const openWhatsApp = async () => {
    const message = encodeURIComponent(
      "Hello GLOW Salon Super Admin, I have a question about my ₹299 subscription payment."
    );
    try {
      await Linking.openURL(`https://wa.me/?text=${message}`);
    } catch {
      Alert.alert(
        "WhatsApp unavailable",
        "Please install WhatsApp or contact the Super Admin directly."
      );
    }
  };
  const openUPI = async () => {
    const url =
      `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
      `&pn=${encodeURIComponent("GLOW Salon")}` +
      `&am=${PAYMENT_AMOUNT}&cu=INR&tn=${encodeURIComponent("GLOW Salon Subscription")}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "UPI app not found",
        `Open your UPI app and pay ₹${PAYMENT_AMOUNT} to ${UPI_ID}.`
      );
    }
  };
  const chooseScreenshot = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Allow photo access to attach your payment screenshot."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setPaymentImage({
      uri: asset.uri,
      name: asset.fileName || `payment-proof-${Date.now()}.jpg`,
      type: asset.mimeType || "image/jpeg",
    });
  };
  const submitPaymentRequest = async () => {
    if (!token) {
      Alert.alert("Login required", "Please log in again to submit your payment request.");
      router.replace("/auth/login");
      return;
    }
    if (!transactionId.trim()) {
      Alert.alert("Transaction ID required", "Enter the UPI transaction/reference ID.");
      return;
    }
    if (!paymentImage) {
      Alert.alert("Screenshot required", "Attach a screenshot of your completed ₹299 payment.");
      return;
    }
    try {
      setSubmitting(true);
      // Expo SDK 57: use Expo File + expo/fetch instead of
      // appending { uri, name, type } to React Native FormData.
      const formData = new FormData();
      formData.append("amount", String(PAYMENT_AMOUNT));
      formData.append("transactionId", transactionId.trim());

      const screenshotFile = new File(paymentImage.uri);
      formData.append("screenshot", screenshotFile, paymentImage.name);

      const response = await expoFetch(`${API_URL}/payments/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Unable to submit payment request.");
      }
      Alert.alert(
        "Request sent to Super Admin",
        "Your ₹299 payment proof has been submitted. Super Admin will verify the transaction and approve it. Your subscription will activate only after approval.",
        [
          {
            text: "Done",
            onPress: () => {
              setTransactionId("");
              setPaymentImage(null);
              router.replace("/subscription-expired");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("PAYMENT REQUEST ERROR:", error);
      Alert.alert("Submission failed", error?.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.brand}>GLOW SALON</Text>
            <Text style={styles.headerCaption}>SUBSCRIPTION PAYMENT</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>₹</Text>
          </View>
          <Text style={styles.title}>One simple plan</Text>
          <Text style={styles.subtitle}>
            Get access to GLOW Salon for just ₹299.
          </Text>
        </View>
        <View style={styles.priceCard}>
          <Text style={styles.priceEyebrow}>GLOW SALON SUBSCRIPTION</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currency}>₹</Text>
            <Text style={styles.price}>299</Text>
          </View>
          <Text style={styles.priceCaption}>ONE FIXED PAYMENT</Text>
          <View style={styles.priceDivider} />
          <View style={styles.includedRow}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.includedText}>One simple subscription plan</Text>
          </View>
          <View style={styles.includedRow}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.includedText}>Pay using UPI or scan the QR code</Text>
          </View>
          <View style={styles.includedRow}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.includedText}>Manual payment verification for safety</Text>
          </View>
        </View>
        <View style={styles.paymentCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Scan & Pay ₹299</Text>
              <Text style={styles.cardSubtitle}>
                Scan this QR using any UPI app
              </Text>
            </View>
            <View style={styles.upiBadge}>
              <Text style={styles.upiBadgeText}>UPI</Text>
            </View>
          </View>
          <View style={styles.qrFrame}>
            <Image source={PaymentQR} style={styles.qrImage} resizeMode="contain" />
          </View>
          <Text style={styles.qrCaption}>GLOW SALON · OFFICIAL PAYMENT QR</Text>
          <Text style={styles.upiLabel}>PAYMENT UPI ID</Text>
          <View style={styles.upiRow}>
            <Text selectable style={styles.upiValue}>{UPI_ID}</Text>
            <Pressable style={styles.copyUpiButton} onPress={openUPI}>
              <Text style={styles.copyUpiText}>Pay ₹299</Text>
            </Pressable>
          </View>
          <View style={styles.safetyBox}>
            <Text style={styles.safetyCheck}>✓</Text>
            <Text style={styles.safetyText}>
              Complete the payment in your UPI app. Keep your transaction ID and payment screenshot ready.
            </Text>
          </View>
        </View>
        <View style={styles.proofCard}>
          <Text style={styles.cardTitle}>Submit payment proof</Text>
          <Text style={styles.cardSubtitle}>
            After paying ₹299, enter your UPI transaction ID and attach the payment screenshot. This sends a request to Super Admin.
          </Text>
          <Text style={styles.inputLabel}>UPI transaction / reference ID</Text>
          <TextInput
            value={transactionId}
            onChangeText={setTransactionId}
            style={styles.input}
            placeholder="Enter transaction ID"
            placeholderTextColor="#A49A9B"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <Text style={styles.inputLabel}>Payment screenshot</Text>
          <Pressable style={styles.uploadButton} onPress={chooseScreenshot}>
            <Text style={styles.uploadIcon}>＋</Text>
            <View style={styles.uploadCopy}>
              <Text style={styles.uploadTitle}>
                {paymentImage ? "Screenshot selected" : "Upload payment screenshot"}
              </Text>
              <Text style={styles.uploadSubtitle}>
                {paymentImage ? paymentImage.name : "Choose an image from your gallery"}
              </Text>
            </View>
            <Text style={styles.uploadArrow}>›</Text>
          </Pressable>
          {paymentImage && (
            <View style={styles.previewWrap}>
              <Image source={{ uri: paymentImage.uri }} style={styles.previewImage} resizeMode="cover" />
              <Pressable onPress={() => setPaymentImage(null)} style={styles.removeImageButton}>
                <Text style={styles.removeImageText}>Remove image</Text>
              </Pressable>
            </View>
          )}
          <Pressable
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.pressed,
              submitting && styles.disabledButton,
            ]}
            onPress={submitPaymentRequest}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit ₹299 Payment Request →</Text>
            )}
          </Pressable>
          <Text style={styles.requestFootnote}>
            Your subscription will activate only after Super Admin verifies the payment and approves your request.
          </Text>
        </View>
        <Pressable style={styles.whatsappButton} onPress={openWhatsApp}>
          <Text style={styles.whatsappIcon}>◉</Text>
          <Text style={styles.whatsappText}>Need help? Contact Super Admin on WhatsApp</Text>
          <Text style={styles.whatsappArrow}>↗</Text>
        </Pressable>
        <Text style={styles.footerNote}>
          Fixed price: ₹299. Please verify the UPI recipient name before confirming payment.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F5F2" },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 36 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE0DC", alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 32, lineHeight: 35, color: "#30282B", marginTop: -3 },
  headerCenter: { flex: 1, alignItems: "center" },
  brand: { color: "#70243A", fontSize: 13, fontWeight: "900", letterSpacing: 2.5 },
  headerCaption: { marginTop: 4, color: "#9B8E90", fontSize: 8, fontWeight: "800", letterSpacing: 1.2 },
  headerSpacer: { width: 42 },
  hero: { alignItems: "center", paddingVertical: 8, marginBottom: 20 },
  heroIcon: { width: 56, height: 56, borderRadius: 19, backgroundColor: "#F0DDE2", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  heroIconText: { fontSize: 28, color: "#70243A", fontWeight: "900" },
  title: { fontSize: 26, fontWeight: "900", color: "#30282B", textAlign: "center" },
  subtitle: { color: "#817579", fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 8 },
  priceCard: { backgroundColor: "#70243A", borderRadius: 22, padding: 21, marginBottom: 18 },
  priceEyebrow: { color: "#E8C7D0", fontSize: 9, fontWeight: "900", letterSpacing: 1.4, textAlign: "center" },
  priceRow: { flexDirection: "row", justifyContent: "center", alignItems: "flex-start", marginTop: 8 },
  currency: { color: "#FFFFFF", fontSize: 25, fontWeight: "800", marginTop: 7, marginRight: 3 },
  price: { color: "#FFFFFF", fontSize: 55, lineHeight: 63, fontWeight: "900" },
  priceCaption: { color: "#E8C7D0", fontSize: 9, fontWeight: "900", letterSpacing: 1.5, textAlign: "center", marginTop: 1 },
  priceDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 17 },
  includedRow: { flexDirection: "row", alignItems: "center", marginTop: 9 },
  check: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", marginRight: 10 },
  includedText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600", flex: 1 },
  paymentCard: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#EAE0DC", padding: 18, marginBottom: 15 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { color: "#30282B", fontSize: 17, fontWeight: "900" },
  cardSubtitle: { color: "#8B7F83", fontSize: 11, lineHeight: 17, marginTop: 5, marginBottom: 15 },
  upiBadge: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: "#F3E4E8" },
  upiBadgeText: { color: "#70243A", fontSize: 11, fontWeight: "900" },
  qrFrame: { alignSelf: "center", width: 238, height: 238, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EAE0DC", padding: 10, alignItems: "center", justifyContent: "center", marginTop: 4 },
  qrImage: { width: "100%", height: "100%" },
  qrCaption: { color: "#9B7B5E", fontSize: 9, fontWeight: "900", letterSpacing: 1.3, textAlign: "center", marginTop: 14 },
  upiLabel: { color: "#9A8E91", fontSize: 9, fontWeight: "900", letterSpacing: 1.1, marginTop: 18 },
  upiRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6, borderWidth: 1, borderColor: "#EAE0DC", borderRadius: 12, paddingLeft: 12, paddingRight: 6, minHeight: 47 },
  upiValue: { color: "#30282B", fontSize: 13, fontWeight: "800" },
  copyUpiButton: { backgroundColor: "#F3E4E8", borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9 },
  copyUpiText: { color: "#70243A", fontSize: 10, fontWeight: "900" },
  safetyBox: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#F1F8F2", borderRadius: 12, padding: 11, marginTop: 15 },
  safetyCheck: { color: "#27834D", fontWeight: "900", fontSize: 14, marginRight: 8 },
  safetyText: { flex: 1, color: "#52745C", fontSize: 10, lineHeight: 16 },
  proofCard: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#EAE0DC", padding: 18 },
  inputLabel: { color: "#51464A", fontSize: 11, fontWeight: "900", marginBottom: 7, marginTop: 6 },
  input: { minHeight: 48, borderWidth: 1, borderColor: "#E3D9D4", borderRadius: 12, paddingHorizontal: 13, color: "#30282B", backgroundColor: "#FBF9F8", marginBottom: 13 },
  uploadButton: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderStyle: "dashed", borderColor: "#CDB9BE", borderRadius: 13, padding: 13, minHeight: 65, marginBottom: 15 },
  uploadIcon: { width: 34, height: 34, borderRadius: 11, overflow: "hidden", textAlign: "center", textAlignVertical: "center", backgroundColor: "#F3E4E8", color: "#70243A", fontSize: 23, marginRight: 11 },
  uploadCopy: { flex: 1 },
  uploadTitle: { color: "#30282B", fontSize: 11, fontWeight: "900" },
  uploadSubtitle: { color: "#95888C", fontSize: 9, marginTop: 4 },
  uploadArrow: { color: "#70243A", fontSize: 23 },
  previewWrap: { marginBottom: 14 },
  previewImage: { width: "100%", height: 180, borderRadius: 12, backgroundColor: "#F8F5F2" },
  removeImageButton: { alignSelf: "flex-end", paddingVertical: 7 },
  removeImageText: { color: "#B23A3A", fontSize: 11, fontWeight: "800" },
  submitButton: { minHeight: 52, borderRadius: 13, backgroundColor: "#70243A", alignItems: "center", justifyContent: "center", paddingHorizontal: 12, marginTop: 4 },
  submitButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  disabledButton: { opacity: 0.65 },
  requestFootnote: { color: "#8B7F83", fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 11 },
  whatsappButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#188653", borderRadius: 15, padding: 15, marginTop: 14 },
  whatsappIcon: { color: "#FFFFFF", fontSize: 20, marginRight: 10 },
  whatsappText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900", flex: 1 },
  whatsappArrow: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  footerNote: { color: "#95888C", fontSize: 10, lineHeight: 16, textAlign: "center", marginTop: 17, paddingHorizontal: 8 },
  pressed: { opacity: 0.78 },
});
