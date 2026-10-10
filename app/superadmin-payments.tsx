
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Linking,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type PaymentStatus = "pending" | "approved" | "rejected" | "offered";

type Payment = {
  _id: string;
  salonId?: {
    _id?: string;
    name?: string;
    salonName?: string;
    email?: string;
    phone?: string;
    ownerName?: string;
  } | string;
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | string;
  plan: string;
  amount: number;
  durationDays: number;
  status: PaymentStatus;
  transactionId?: string;
  screenshotUrl?: string;
  rejectionReason?: string;
  createdAt?: string;
};

type ApiResult<T> = {
  success?: boolean;
  message?: string;
  count?: number;
  data?: T;
};

async function getAuthToken(): Promise<string | null> {
  const directKeys = ["accessToken", "token", "authToken"];

  for (const key of directKeys) {
    const value = await AsyncStorage.getItem(key);
    if (value) return value;
  }

  const objectKeys = ["auth", "user", "authState"];

  for (const key of objectKeys) {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const token =
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.user?.token ||
        parsed?.user?.accessToken;

      if (typeof token === "string" && token.length > 0) {
        return token;
      }
    } catch {
      // This key does not contain a serialized auth object.
    }
  }

  return null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured.");
  }

  const token = await getAuthToken();

  if (!token) {
    throw new Error(
      "Login token not found. Connect this screen to your existing Super Admin authentication storage."
    );
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result?.message || `Request failed (${response.status}).`
    );
  }

  return result as ApiResult<T>;
}

function getSalonName(payment: Payment): string {
  const salon = payment.salonId;

  if (salon && typeof salon === "object") {
    return (
      salon.salonName ||
      salon.name ||
      salon.ownerName ||
      salon.email ||
      "Salon"
    );
  }

  return "Salon";
}

function getAdminName(payment: Payment): string {
  const user = payment.userId;

  if (user && typeof user === "object") {
    return user.name || user.email || user.phone || "Salon Admin";
  }

  return "Salon Admin";
}

function getAdminContact(payment: Payment): string {
  const user = payment.userId;

  if (user && typeof user === "object") {
    return user.email || user.phone || "";
  }

  return "";
}

function formatDate(value?: string): string {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SuperAdminPaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [rejectingPayment, setRejectingPayment] =
    useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadPayments = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const result = await request<Payment[]>(
        "/payments/superadmin?status=pending"
      );

      if (result.success === false) {
        throw new Error(result.message || "Could not load payments.");
      }

      setPayments(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load pending payments."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const approvePayment = (payment: Payment) => {
    Alert.alert(
      "Verify and approve payment",
      `Salon: ${getSalonName(payment)}\n` +
        `Plan: ${payment.plan}\n` +
        `Amount: ₹${payment.amount}\n` +
        `Transaction ID: ${payment.transactionId || "Not provided"}\n\n` +
        "First verify that this exact payment has been credited to your bank/UPI account. Approval activates the subscription.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Approve",
          onPress: () => {
            void confirmApproval(payment);
          },
        },
      ]
    );
  };

  const confirmApproval = async (payment: Payment) => {
    setBusyId(payment._id);

    try {
      const result = await request<unknown>(
        `/payments/superadmin/${payment._id}/approve`,
        { method: "PATCH" }
      );

      if (result.success === false) {
        throw new Error(result.message || "Approval failed.");
      }

      setPayments((current) =>
        current.filter((item) => item._id !== payment._id)
      );

      Alert.alert(
        "Payment approved",
        "The payment was approved and the subscription activation request completed."
      );
    } catch (err) {
      Alert.alert(
        "Approval failed",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setBusyId(null);
    }
  };

  const openRejectModal = (payment: Payment) => {
    setRejectingPayment(payment);
    setRejectReason("");
  };

  const rejectPayment = async () => {
    if (!rejectingPayment) return;

    const payment = rejectingPayment;
    const reason = rejectReason.trim();

    if (!reason) {
      Alert.alert(
        "Reason required",
        "Enter a reason so the salon admin knows why the payment was rejected."
      );
      return;
    }

    setBusyId(payment._id);

    try {
      const result = await request<Payment>(
        `/payments/superadmin/${payment._id}/reject`,
        {
          method: "PATCH",
          body: JSON.stringify({ reason }),
        }
      );

      if (result.success === false) {
        throw new Error(result.message || "Rejection failed.");
      }

      setPayments((current) =>
        current.filter((item) => item._id !== payment._id)
      );

      setRejectingPayment(null);
      setRejectReason("");

      Alert.alert(
        "Payment rejected",
        "The payment was rejected. The salon admin can contact you for clarification."
      );
    } catch (err) {
      Alert.alert(
        "Rejection failed",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setBusyId(null);
    }
  };

  const openScreenshot = async (url?: string) => {
    if (!url) {
      Alert.alert(
        "Screenshot unavailable",
        "No screenshot URL is available for this payment."
      );
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to open screenshot",
        "Check the screenshot URL and your internet connection."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F4" />

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.brand}>GLOW SALON</Text>
          <Text style={styles.headerTitle}>Payment Approvals</Text>
        </View>

        <Pressable
          style={styles.refreshButton}
          onPress={() => void loadPayments(true)}
          disabled={refreshing}
        >
          <Text style={styles.refreshIcon}>
            {refreshing ? "…" : "↻"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Pending payments</Text>
          <Text style={styles.summaryNumber}>{payments.length}</Text>
        </View>

        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>NEEDS REVIEW</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#9B7B5E" />
          <Text style={styles.mutedText}>Loading pending payments...</Text>
        </View>
      ) : error ? (
        <View style={styles.messageCard}>
          <Text style={styles.errorTitle}>Could not load payments</Text>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => void loadPayments()}
          >
            <Text style={styles.primaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadPayments(true)}
              tintColor="#9B7B5E"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {payments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>✓</Text>
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptyText}>
                There are no pending payments right now. Pull down to refresh.
              </Text>
            </View>
          ) : (
            payments.map((payment) => {
              const isBusy = busyId === payment._id;

              return (
                <View key={payment._id} style={styles.paymentCard}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.salonIcon}>
                      <Text style={styles.salonIconText}>G</Text>
                    </View>

                    <View style={styles.salonInfo}>
                      <Text style={styles.salonName}>
                        {getSalonName(payment)}
                      </Text>
                      <Text style={styles.adminName}>
                        {getAdminName(payment)}
                      </Text>
                      {!!getAdminContact(payment) && (
                        <Text style={styles.adminContact}>
                          {getAdminContact(payment)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>PENDING</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Plan</Text>
                    <Text style={styles.detailValue}>
                      {payment.plan.charAt(0).toUpperCase() +
                        payment.plan.slice(1)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.amountValue}>
                      ₹{Number(payment.amount).toLocaleString("en-IN")}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>
                      {payment.durationDays} days
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Transaction ID</Text>
                    <Text style={styles.transactionValue}>
                      {payment.transactionId || "Not provided"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submitted</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(payment.createdAt)}
                    </Text>
                  </View>

                  {payment.screenshotUrl ? (
                    <Pressable
                      style={styles.screenshotButton}
                      onPress={() =>
                        void openScreenshot(payment.screenshotUrl)
                      }
                    >
                      <Text style={styles.screenshotButtonText}>
                        View payment screenshot ↗
                      </Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.noScreenshot}>
                      Screenshot URL is missing.
                    </Text>
                  )}

                  <Text style={styles.verificationNote}>
                    Verify the credited amount and transaction reference
                    in your bank/UPI account before approving. A screenshot
                    alone does not confirm receipt of funds.
                  </Text>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={[
                        styles.rejectButton,
                        isBusy && styles.disabledButton,
                      ]}
                      disabled={isBusy}
                      onPress={() => openRejectModal(payment)}
                    >
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.approveButton,
                        isBusy && styles.disabledButton,
                      ]}
                      disabled={isBusy}
                      onPress={() => approvePayment(payment)}
                    >
                      {isBusy ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.approveButtonText}>
                          Approve Payment
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal
        visible={!!rejectingPayment}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectingPayment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject payment</Text>
            <Text style={styles.modalSubtitle}>
              {rejectingPayment
                ? getSalonName(rejectingPayment)
                : "Payment"}
            </Text>

            <Text style={styles.inputLabel}>Reason for rejection</Text>
            <TextInput
              style={styles.reasonInput}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="e.g. Payment not received"
              placeholderTextColor="#999999"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            <View style={styles.actionRow}>
              <Pressable
                style={styles.rejectButton}
                onPress={() => {
                  setRejectingPayment(null);
                  setRejectReason("");
                }}
                disabled={!!busyId}
              >
                <Text style={styles.rejectButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.approveButton,
                  !!busyId && styles.disabledButton,
                ]}
                onPress={() => void rejectPayment()}
                disabled={!!busyId}
              >
                {busyId ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.approveButtonText}>
                    Confirm Reject
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7F4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE5DF",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 32,
    color: "#252525",
    lineHeight: 36,
  },
  headerText: {
    flex: 1,
  },
  brand: {
    color: "#9B7B5E",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  headerTitle: {
    color: "#252525",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 3,
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE5DF",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshIcon: {
    fontSize: 26,
    color: "#9B7B5E",
  },
  summaryCard: {
    marginHorizontal: 18,
    marginBottom: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE5DF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: "#777777",
    fontSize: 13,
  },
  summaryNumber: {
    color: "#252525",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 4,
  },
  pendingBadge: {
    backgroundColor: "#FFF3D9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  pendingBadgeText: {
    color: "#8B641E",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  mutedText: {
    color: "#777777",
    fontSize: 13,
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 36,
    flexGrow: 1,
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE5DF",
    padding: 16,
    marginBottom: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  salonIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#F1ECE6",
    alignItems: "center",
    justifyContent: "center",
  },
  salonIconText: {
    color: "#9B7B5E",
    fontSize: 20,
    fontWeight: "800",
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    color: "#252525",
    fontSize: 15,
    fontWeight: "700",
  },
  adminName: {
    color: "#555555",
    fontSize: 12,
    marginTop: 3,
  },
  adminContact: {
    color: "#777777",
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: "#FFF3D9",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  statusBadgeText: {
    color: "#8B641E",
    fontSize: 9,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE8E2",
    marginVertical: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  detailLabel: {
    color: "#777777",
    fontSize: 12,
    flex: 1,
  },
  detailValue: {
    color: "#252525",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  amountValue: {
    color: "#26734D",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right",
  },
  transactionValue: {
    color: "#252525",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    flex: 1.5,
  },
  dateValue: {
    color: "#555555",
    fontSize: 11,
    textAlign: "right",
    flex: 1.5,
  },
  screenshotButton: {
    minHeight: 45,
    backgroundColor: "#F5EEE7",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  screenshotButtonText: {
    color: "#5D4532",
    fontSize: 13,
    fontWeight: "700",
  },
  noScreenshot: {
    color: "#B42318",
    fontSize: 12,
    marginTop: 6,
  },
  verificationNote: {
    color: "#8A5B27",
    backgroundColor: "#FFF8E8",
    borderRadius: 9,
    padding: 10,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  rejectButton: {
    flex: 1,
    minHeight: 47,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9B8B3",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  rejectButtonText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "700",
  },
  approveButton: {
    flex: 1.5,
    minHeight: 47,
    borderRadius: 12,
    backgroundColor: "#9B7B5E",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  approveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.55,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE5DF",
    padding: 24,
    alignItems: "center",
    marginTop: 8,
  },
  emptyIcon: {
    color: "#26734D",
    fontSize: 35,
    fontWeight: "700",
  },
  emptyTitle: {
    color: "#252525",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyText: {
    color: "#777777",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  messageCard: {
    marginHorizontal: 18,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE5DF",
  },
  errorTitle: {
    color: "#B42318",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#8A332D",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  primaryButton: {
    minHeight: 46,
    backgroundColor: "#9B7B5E",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    color: "#252525",
    fontSize: 20,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: "#777777",
    fontSize: 13,
    marginTop: 5,
    marginBottom: 20,
  },
  inputLabel: {
    color: "#555555",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
  },
  reasonInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#E5DED6",
    borderRadius: 11,
    padding: 12,
    color: "#252525",
    fontSize: 14,
    backgroundColor: "#FFFFFF",
  },
});
