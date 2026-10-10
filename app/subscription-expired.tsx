
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../src/features/auth/authSlice";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type AdminContact = {
  name?: string;
  phone?: string;
  whatsapp?: string;
};

export default function SubscriptionExpiredScreen() {
  const dispatch = useDispatch<any>();
  const { user, token } = useSelector((state: any) => state.auth);

  const subscription = user?.subscription;

  const [adminContact, setAdminContact] =
    useState<AdminContact | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [contactError, setContactError] = useState("");

  const isTrialExpired =
    subscription?.status === "expired" && !subscription?.plan;

  useEffect(() => {
    let mounted = true;

    const fetchContact = async () => {
      if (!API_URL) {
        setContactError("API URL is not configured.");
        return;
      }

      setLoadingContact(true);
      setContactError("");

      try {
        const response = await fetch(
          `${API_URL}/superadmin/contact`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message || "Could not load Super Admin contact."
          );
        }

        const contact =
          result?.contact ?? result?.data ?? result;

        if (mounted) {
          setAdminContact({
            name: contact?.name ?? contact?.fullName,
            phone: contact?.phone ?? contact?.phoneNumber,
            whatsapp:
              contact?.whatsapp ?? contact?.whatsappNumber,
          });
        }
      } catch (error: any) {
        if (mounted) {
          setContactError(
            error?.message || "Could not load contact details."
          );
        }
      } finally {
        if (mounted) setLoadingContact(false);
      }
    };

    fetchContact();

    return () => {
      mounted = false;
    };
  }, [token]);

  const formatDate = (date?: string) => {
    if (!date) return "";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const openCall = async () => {
    const phone = adminContact?.phone || adminContact?.whatsapp;

    if (!phone) {
      Alert.alert(
        "Contact unavailable",
        contactError || "Super Admin contact number is unavailable."
      );
      return;
    }

    try {
      await Linking.openURL(`tel:${phone.replace(/[^\d+]/g, "")}`);
    } catch {
      Alert.alert("Error", "Could not open the phone dialer.");
    }
  };

  const openWhatsApp = async () => {
    const phone = adminContact?.whatsapp || adminContact?.phone;

    if (!phone) {
      Alert.alert(
        "Contact unavailable",
        contactError || "Super Admin WhatsApp number is unavailable."
      );
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hello Super Admin, my GLOW Salon subscription has expired. Please help me renew my subscription.`
    );

    try {
      await Linking.openURL(
        `https://wa.me/${cleanPhone}?text=${message}`
      );
    } catch {
      Alert.alert("Error", "Could not open WhatsApp.");
    }
  };

  const handleRenew = () => {
    // This opens the separate Expo Router payment screen.
    router.push("/subscription-payment");
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      router.replace("/auth/login");
    } catch {
      Alert.alert("Error", "Could not logout. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>!</Text>
          </View>

          <Text style={styles.brand}>GLOW SALON</Text>

          <Text style={styles.title}>
            {isTrialExpired
              ? "Your Free Trial Has Expired"
              : "Subscription Expired"}
          </Text>

          <Text style={styles.message}>
            Your access to the salon management system is currently inactive.
          </Text>

          <Text style={styles.subMessage}>
            Please contact the Super Admin to discuss your plan and payment.
            Once your plan is confirmed, continue to renewal.
          </Text>

          {subscription?.endDate ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Subscription Ended</Text>
              <Text style={styles.infoValue}>
                {formatDate(subscription.endDate)}
              </Text>
            </View>
          ) : null}

          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Contact Super Admin</Text>

            {loadingContact ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#9B7B5E" />
                <Text style={styles.contactText}>
                  Loading contact details...
                </Text>
              </View>
            ) : adminContact?.phone || adminContact?.whatsapp ? (
              <>
                {adminContact.name ? (
                  <Text style={styles.adminName}>
                    {adminContact.name}
                  </Text>
                ) : null}

                <Text style={styles.phoneText}>
                  {adminContact.phone || adminContact.whatsapp}
                </Text>

                <View style={styles.contactButtons}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.callButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={openCall}
                  >
                    <Text style={styles.callButtonText}>Call Admin</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.whatsappButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={openWhatsApp}
                  >
                    <Text style={styles.whatsappButtonText}>WhatsApp</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Text style={styles.contactText}>
                {contactError ||
                  "Super Admin contact details are not available."}
              </Text>
            )}
          </View>

          <View style={styles.renewInfoCard}>
            <Text style={styles.renewInfoTitle}>
              Ready to renew?
            </Text>
            <Text style={styles.renewInfoText}>
              Discuss the plan and amount with the Super Admin first.
              Then continue to the payment page.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.renewButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleRenew}
          >
            <Text style={styles.renewButtonText}>
              Renew Subscription
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7F4",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F3E7E7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
    fontWeight: "700",
    color: "#A94442",
  },
  brand: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#9B7B5E",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#252525",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    lineHeight: 23,
    color: "#555555",
    textAlign: "center",
    maxWidth: 340,
  },
  subMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: "#777777",
    textAlign: "center",
    marginTop: 10,
    maxWidth: 340,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    marginTop: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAE5DF",
  },
  infoLabel: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333333",
  },
  contactCard: {
    width: "100%",
    backgroundColor: "#F1ECE6",
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B342E",
    marginBottom: 8,
  },
  adminName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B342E",
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    color: "#6F665F",
    marginBottom: 14,
  },
  contactText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6F665F",
    flexShrink: 1,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contactButtons: {
    flexDirection: "row",
    gap: 10,
  },
  callButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  callButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  whatsappButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: "#E2F0E5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  whatsappButtonText: {
    color: "#27673B",
    fontSize: 13,
    fontWeight: "600",
  },
  renewInfoCard: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE5DF",
  },
  renewInfoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#252525",
    marginBottom: 6,
  },
  renewInfoText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#777777",
  },
  renewButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#9B7B5E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingHorizontal: 12,
  },
  renewButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  logoutButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
