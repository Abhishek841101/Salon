
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import { StatusBar } from "expo-status-bar";
import { useSelector } from "react-redux";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://salon-backend-49vk.onrender.com/api";

type Salon = {
  salonId: string;
  salonName: string;
  ownerName: string;
  email: string;
  phone: string;
  salonActive: boolean;
  adminId: string | null;
  subscription: {
    status: string;
    plan: string | null;
    trialStartDate: string | null;
    trialEndDate: string | null;
    startDate: string | null;
    endDate: string | null;
    amount: number;
  };
};

type Filter =
  | "all"
  | "active"
  | "trial"
  | "expired";

export default function AllSalonsScreen() {
  const { token } = useSelector(
    (state: any) => state.auth
  );

  const params = useLocalSearchParams<{
    filter?: string;
  }>();

  const initialFilter: Filter =
    params.filter === "active" ||
    params.filter === "trial" ||
    params.filter === "expired"
      ? params.filter
      : "all";

  const [salons, setSalons] = useState<Salon[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<Filter>(initialFilter);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const fetchSalons = async (
    showLoader = true
  ) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await fetch(
        `${API_URL}/superadmin/salons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load salons"
        );
      }

      const rawList =
        data?.data ||
        data?.salons ||
        [];

      const mapped: Salon[] = rawList.map(
        (salon: any) => ({
          salonId:
            salon.id ||
            salon._id,

          salonName:
            salon.name ||
            salon.salonName ||
            "Salon",

          ownerName:
            salon.ownerName || "",

          email:
            salon.email || "",

          phone:
            salon.phone || "",

          salonActive:
            salon.isActive !== false,

          adminId:
            salon.admin?.id ||
            salon.admin?._id ||
            null,

          subscription: {
            status:
              salon.subscription?.status ||
              "expired",

            plan:
              salon.subscription?.plan ||
              null,

            trialStartDate:
              salon.subscription
                ?.trialStartDate ||
              null,

            trialEndDate:
              salon.subscription
                ?.trialEndDate ||
              null,

            startDate:
              salon.subscription
                ?.startDate ||
              null,

            endDate:
              salon.subscription
                ?.endDate ||
              null,

            amount: Number(
              salon.subscription?.amount ||
                0
            ),
          },
        })
      );

      setSalons(mapped);
    } catch (error) {
      console.error(
        "SALONS FETCH ERROR:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSalons();
    }, [token])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSalons(false);
  };

  const filteredSalons = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return salons.filter((salon) => {
      const status =
        salon.subscription.status;

      const matchesFilter =
        filter === "all" ||
        status === filter;

      const matchesSearch =
        !query ||
        salon.salonName
          .toLowerCase()
          .includes(query) ||
        salon.ownerName
          .toLowerCase()
          .includes(query) ||
        salon.email
          .toLowerCase()
          .includes(query) ||
        salon.phone.includes(query);

      return (
        matchesFilter &&
        matchesSearch
      );
    });
  }, [salons, search, filter]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading salons...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.eyebrow}>
              MANAGEMENT
            </Text>

            <Text style={styles.title}>
              All Salons
            </Text>
          </View>

          <View style={styles.countCircle}>
            <Text style={styles.countText}>
              {salons.length}
            </Text>
          </View>
        </View>

        {/* SEARCH */}

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>
            ⌕
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search salon, owner, phone..."
            placeholderTextColor="#A79A9E"
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        {/* FILTER */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filterRow
          }
        >
          <FilterButton
            label="All"
            active={filter === "all"}
            count={salons.length}
            onPress={() =>
              setFilter("all")
            }
          />

          <FilterButton
            label="Active"
            active={filter === "active"}
            count={
              salons.filter(
                (x) =>
                  x.subscription.status ===
                  "active"
              ).length
            }
            onPress={() =>
              setFilter("active")
            }
          />

          <FilterButton
            label="Trial"
            active={filter === "trial"}
            count={
              salons.filter(
                (x) =>
                  x.subscription.status ===
                  "trial"
              ).length
            }
            onPress={() =>
              setFilter("trial")
            }
          />

          <FilterButton
            label="Expired"
            active={filter === "expired"}
            count={
              salons.filter(
                (x) =>
                  x.subscription.status ===
                  "expired"
              ).length
            }
            onPress={() =>
              setFilter("expired")
            }
          />
        </ScrollView>

        {/* RESULT HEADER */}

        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>
            {filteredSalons.length} salons
          </Text>

          <Text style={styles.resultSubtitle}>
            {filter === "all"
              ? "All accounts"
              : `${filter} accounts`}
          </Text>
        </View>

        {/* LIST */}

        {filteredSalons.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Text>⌕</Text>
            </View>

            <Text style={styles.emptyTitle}>
              No salons found
            </Text>

            <Text style={styles.emptyText}>
              Try another search or filter.
            </Text>
          </View>
        ) : (
          filteredSalons.map((salon) => (
            <SalonCard
              key={salon.salonId}
              salon={salon}
            />
          ))
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

function SalonCard({
  salon,
}: {
  salon: Salon;
}) {
  const status =
    salon.subscription.status;

  const plan =
    salon.subscription.plan;

  const remaining = getRemainingDays(
    salon.subscription.endDate ||
      salon.subscription.trialEndDate
  );

  const statusInfo =
    getStatusInfo(status);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.salonCard,
        pressed && styles.pressed,
      ]}
      onPress={() =>
        router.push({
          pathname:
            "/superadmin/salon-details",
          params: {
            id: salon.salonId,
          },
        })
      }
    >
      {/* TOP */}

      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {salon.salonName
              ?.charAt(0)
              ?.toUpperCase() || "S"}
          </Text>
        </View>

        <View style={styles.salonInfo}>
          <Text
            style={styles.salonName}
            numberOfLines={1}
          >
            {salon.salonName}
          </Text>

          <Text
            style={styles.owner}
            numberOfLines={1}
          >
            {salon.ownerName || "Owner"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusInfo.background,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  statusInfo.color,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color:
                  statusInfo.color,
              },
            ]}
          >
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* CONTACT */}

      <View style={styles.contactRow}>
        <Text
          style={styles.contactText}
          numberOfLines={1}
        >
          {salon.email}
        </Text>

        <Text style={styles.contactText}>
          {salon.phone}
        </Text>
      </View>

      {/* SUBSCRIPTION */}

      <View style={styles.subscriptionBox}>
        <View style={styles.subscriptionTop}>
          <View>
            <Text style={styles.smallLabel}>
              CURRENT PLAN
            </Text>

            <Text style={styles.planName}>
              {plan
                ? capitalize(plan)
                : status === "trial"
                ? "Free Trial"
                : "No Active Plan"}
            </Text>
          </View>

          {salon.subscription.amount >
            0 && (
            <Text style={styles.amount}>
              ₹
              {salon.subscription.amount.toLocaleString(
                "en-IN"
              )}
            </Text>
          )}
        </View>

        {status === "active" &&
        salon.subscription.endDate ? (
          <>
            <View style={styles.dateRow}>
              <View>
                <Text
                  style={styles.dateLabel}
                >
                  Started
                </Text>

                <Text
                  style={styles.dateValue}
                >
                  {formatDate(
                    salon.subscription
                      .startDate
                  )}
                </Text>
              </View>

              <View>
                <Text
                  style={styles.dateLabel}
                >
                  Expires
                </Text>

                <Text
                  style={styles.dateValue}
                >
                  {formatDate(
                    salon.subscription
                      .endDate
                  )}
                </Text>
              </View>

              <View style={styles.remainingBox}>
                <Text
                  style={
                    styles.remainingNumber
                  }
                >
                  {remaining}
                </Text>

                <Text
                  style={
                    styles.remainingLabel
                  }
                >
                  DAYS LEFT
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progress,
                  {
                    width: `${getProgress(
                      salon.subscription
                        .startDate,
                      salon.subscription
                        .endDate
                    )}%`,
                  },
                ]}
              />
            </View>
          </>
        ) : status === "trial" ? (
          <View style={styles.trialRow}>
            <Text style={styles.trialText}>
              Trial ends{" "}
              {formatDate(
                salon.subscription
                  .trialEndDate
              )}
            </Text>

            <Text
              style={styles.trialRemaining}
            >
              {remaining} days left
            </Text>
          </View>
        ) : (
          <Text style={styles.expiredText}>
            Subscription requires attention
          </Text>
        )}
      </View>

      {/* ACTION */}

      <View style={styles.viewRow}>
        <Text style={styles.viewText}>
          View details & manage plan
        </Text>

        <Text style={styles.viewArrow}>
          →
        </Text>
      </View>
    </Pressable>
  );
}

function FilterButton({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.filterButton,
        active && styles.filterButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterText,
          active && styles.filterTextActive,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.filterCount,
          active && styles.filterCountActive,
        ]}
      >
        {count}
      </Text>
    </Pressable>
  );
}

function getStatusInfo(status: string) {
  if (status === "active") {
    return {
      label: "ACTIVE",
      color: "#24884B",
      background: "#E7F6EC",
    };
  }

  if (status === "trial") {
    return {
      label: "TRIAL",
      color: "#A36A00",
      background: "#FFF3D7",
    };
  }

  return {
    label: "EXPIRED",
    color: "#B23A3A",
    background: "#FCEAEA",
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(date?: string | null) {
  if (!date) return "--";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getRemainingDays(
  endDate?: string | null
) {
  if (!endDate) return 0;

  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (end <= now) return 0;

  return Math.ceil(
    (end - now) /
      (1000 * 60 * 60 * 24)
  );
}

function getProgress(
  startDate?: string | null,
  endDate?: string | null
) {
  if (!startDate || !endDate) return 0;

  const start =
    new Date(startDate).getTime();

  const end =
    new Date(endDate).getTime();

  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;

  return Math.min(
    100,
    Math.max(
      0,
      ((now - start) /
        (end - start)) *
        100
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5F2",
  },

  scrollContent: {
    padding: 20,
    paddingTop: 25,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F5F2",
  },

  loadingText: {
    marginTop: 12,
    color: "#817478",
    fontSize: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 21,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#ECE2DE",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 30,
    color: "#70243A",
    marginTop: -3,
  },

  headerCenter: {
    flex: 1,
    marginLeft: 13,
  },

  eyebrow: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: "#A17B61",
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#30282B",
    marginTop: 3,
  },

  countCircle: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 9,
    borderRadius: 20,
    backgroundColor: "#70243A",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
  },

  searchBox: {
    height: 51,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9DFDA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  searchIcon: {
    fontSize: 23,
    color: "#8C7C82",
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    color: "#30282B",
    fontSize: 12,
  },

  filterRow: {
    gap: 8,
    paddingBottom: 5,
  },

  filterButton: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E8DED9",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  filterButtonActive: {
    backgroundColor: "#70243A",
    borderColor: "#70243A",
  },

  filterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#706368",
  },

  filterTextActive: {
    color: "#FFF",
  },

  filterCount: {
    fontSize: 9,
    fontWeight: "800",
    color: "#A29699",
  },

  filterCountActive: {
    color: "#F4DDE3",
  },

  resultHeader: {
    marginTop: 22,
    marginBottom: 12,
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#30282B",
  },

  resultSubtitle: {
    fontSize: 10,
    color: "#988B8F",
    marginTop: 3,
  },

  salonCard: {
    backgroundColor: "#FFF",
    borderRadius: 21,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#ECE2DD",
  },

  pressed: {
    opacity: 0.72,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: "#F2DFE2",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#70243A",
    fontSize: 18,
    fontWeight: "800",
  },

  salonInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 7,
  },

  salonName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#30282B",
  },

  owner: {
    fontSize: 10,
    color: "#918488",
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 8,
    fontWeight: "900",
  },

  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0E9E5",
  },

  contactText: {
    flex: 1,
    fontSize: 9,
    color: "#7D7075",
  },

  subscriptionBox: {
    backgroundColor: "#FAF7F5",
    borderRadius: 15,
    padding: 13,
    marginTop: 13,
  },

  subscriptionTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  smallLabel: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#A3979A",
  },

  planName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#70243A",
    marginTop: 3,
  },

  amount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#30282B",
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  dateLabel: {
    fontSize: 8,
    color: "#A09598",
  },

  dateValue: {
    fontSize: 10,
    fontWeight: "700",
    color: "#51464A",
    marginTop: 3,
  },

  remainingBox: {
    alignItems: "flex-end",
  },

  remainingNumber: {
    fontSize: 14,
    fontWeight: "900",
    color: "#24884B",
  },

  remainingLabel: {
    fontSize: 7,
    color: "#8C7F83",
    marginTop: 1,
  },

  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E9DFDB",
    marginTop: 12,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#70243A",
  },

  trialRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  trialText: {
    fontSize: 9,
    color: "#8B7D72",
  },

  trialRemaining: {
    fontSize: 9,
    fontWeight: "800",
    color: "#A36A00",
  },

  expiredText: {
    fontSize: 9,
    color: "#B23A3A",
    marginTop: 10,
    fontWeight: "600",
  },

  viewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
  },

  viewText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#70243A",
  },

  viewArrow: {
    fontSize: 18,
    color: "#70243A",
  },

  empty: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 45,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F5E7E3",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "800",
    color: "#30282B",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 10,
    color: "#96898D",
  },

  bottomSpace: {
    height: 30,
  },
});
