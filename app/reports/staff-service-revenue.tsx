
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://salon-backend-49vk.onrender.com/api";

const COLORS = {
  background: "#F8F2EF",
  card: "#FFFFFF",
  primary: "#8A243B",
  text: "#33282C",
  muted: "#95868B",
  border: "#E7DAD7",
  success: "#2E8B57",
  danger: "#C0392B",
};

type Period = "today" | "week" | "month" | "year" | "overall";

type ServiceRevenue = {
  serviceId: string;
  serviceName: string;
  quantity: number;
  billCount: number;
  revenue: number;
};

type StaffRevenue = {
  staffId: string;
  staffName: string;
  totalRevenue: number;
  totalBills: number;
  services: ServiceRevenue[];
};

type ReportData = {
  success?: boolean;
  period?: string;
  totalRevenue?: number;
  totalBills?: number;
  totalServicesSold?: number;
  services?: ServiceRevenue[];
  staff?: StaffRevenue[];
  message?: string;
};

const PERIODS: { label: string; value: Period }[] = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "Overall", value: "overall" },
];

const money = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

export default function StaffServiceRevenueScreen() {
  const router = useRouter();

  const [period, setPeriod] = useState<Period>("today");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    try {
      setError("");

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/bills/staff-service-revenue?period=${period}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data: ReportData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to load revenue report.");
      }

      setReport(data);
    } catch (e: any) {
      setError(e?.message || "Unable to load revenue report.");
      setReport(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    loadReport();
  }, [loadReport]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReport();
  };

  const services = Array.isArray(report?.services) ? report.services : [];
  const staffList = Array.isArray(report?.staff) ? report.staff : [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Staff & Service Revenue</Text>
          <Text style={styles.headerSubtitle}>Revenue analytics</Text>
        </View>

        <TouchableOpacity onPress={onRefresh} style={styles.backButton}>
          <Ionicons name="refresh-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Select Period</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.periodRow}>
            {PERIODS.map((item) => {
              const selected = period === item.value;

              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setPeriod(item.value)}
                  style={[styles.periodButton, selected && styles.periodSelected]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      selected && styles.periodTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.muted}>Loading revenue report...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={28} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.totalCard}>
              <View style={styles.totalIcon}>
                <Ionicons name="trending-up-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.totalLabel}>Total Revenue</Text>
              <Text style={styles.totalAmount}>
                {money(Number(report?.totalRevenue || 0))}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{report?.totalBills || 0}</Text>
                  <Text style={styles.statLabel}>Total Bills</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {report?.totalServicesSold || 0}
                  </Text>
                  <Text style={styles.statLabel}>Services Sold</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="cut-outline" size={19} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Service-wise Revenue</Text>
                <Text style={styles.sectionSubtitle}>
                  Revenue and bill count for each service
                </Text>
              </View>
            </View>

            {services.length === 0 ? (
              <Text style={styles.emptyText}>No service bills for this period.</Text>
            ) : (
              services.map((service, index) => (
                <View
                  key={`${service.serviceId}-${index}`}
                  style={styles.itemCard}
                >
                  <View style={styles.itemTop}>
                    <View style={styles.numberBadge}>
                      <Text style={styles.numberText}>{index + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{service.serviceName}</Text>
                      <Text style={styles.itemSubtitle}>
                        {service.quantity} sold · {service.billCount} bills
                      </Text>
                    </View>
                    <Text style={styles.itemAmount}>{money(service.revenue)}</Text>
                  </View>
                </View>
              ))
            )}

            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <View style={styles.sectionIcon}>
                <Ionicons name="people-outline" size={19} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Staff-wise Revenue</Text>
                <Text style={styles.sectionSubtitle}>
                  Staff total with individual service breakdown
                </Text>
              </View>
            </View>

            {staffList.length === 0 ? (
              <Text style={styles.emptyText}>No staff revenue for this period.</Text>
            ) : (
              staffList.map((staff) => (
                <View key={staff.staffId} style={styles.staffCard}>
                  <View style={styles.staffHeader}>
                    <View style={styles.staffAvatar}>
                      <Ionicons name="person-outline" size={22} color={COLORS.primary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.staffName}>{staff.staffName}</Text>
                      <Text style={styles.itemSubtitle}>
                        {staff.totalBills} bills
                      </Text>
                    </View>

                    <Text style={styles.staffAmount}>
                      {money(staff.totalRevenue)}
                    </Text>
                  </View>

                  <View style={styles.separator} />

                  {staff.services.map((service, index) => (
                    <View
                      key={`${staff.staffId}-${service.serviceId}-${index}`}
                      style={styles.serviceRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.serviceName}>{service.serviceName}</Text>
                        <Text style={styles.itemSubtitle}>
                          {service.quantity} sold · {service.billCount} bills
                        </Text>
                      </View>
                      <Text style={styles.serviceAmount}>
                        {money(service.revenue)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            )}

            <Text style={styles.footerNote}>
              Staff totals use final bill amounts. Service totals use the saved
              service item amounts; discounts can make these totals differ.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    paddingTop: 40,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  headerSubtitle: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  content: { padding: 16, paddingBottom: 36 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  periodRow: { flexDirection: "row", gap: 8, paddingVertical: 14 },
  periodButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  periodText: { color: COLORS.text, fontSize: 12, fontWeight: "700" },
  periodTextSelected: { color: "#FFFFFF" },
  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    padding: 20,
    marginTop: 6,
  },
  totalIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF25",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  totalLabel: { color: "#F7DDE4", fontSize: 13, fontWeight: "600" },
  totalAmount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 7,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF35",
  },
  statBox: { flex: 1, gap: 5 },
  statValue: { color: "#FFFFFF", fontSize: 19, fontWeight: "800" },
  statLabel: { color: "#F7DDE4", fontSize: 12 },
  statDivider: { width: 1, backgroundColor: "#FFFFFF35", marginHorizontal: 18 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 25,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F1E2E5",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionSubtitle: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  itemCard: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 9,
  },
  itemTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#F8E8E6",
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: { color: COLORS.primary, fontWeight: "800" },
  itemTitle: { fontSize: 14, fontWeight: "800", color: COLORS.text },
  itemSubtitle: { color: COLORS.muted, fontSize: 11, marginTop: 5 },
  itemAmount: { color: COLORS.success, fontSize: 14, fontWeight: "800" },
  staffCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 12,
  },
  staffHeader: { flexDirection: "row", alignItems: "center", gap: 11 },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F8E8E6",
    alignItems: "center",
    justifyContent: "center",
  },
  staffName: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  staffAmount: { fontSize: 16, fontWeight: "900", color: COLORS.success },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    gap: 10,
  },
  serviceName: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  serviceAmount: { fontSize: 13, fontWeight: "800", color: COLORS.text },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    backgroundColor: COLORS.card,
    padding: 22,
    borderRadius: 14,
  },
  center: { alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
  muted: { color: COLORS.muted, fontSize: 13 },
  errorCard: {
    backgroundColor: COLORS.card,
    padding: 22,
    borderRadius: 18,
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  errorText: { color: COLORS.danger, textAlign: "center", fontSize: 13 },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 11,
  },
  retryText: { color: "#FFFFFF", fontWeight: "800" },
  footerNote: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
  },
});
