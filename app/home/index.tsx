

import React, {
  useCallback,
  useEffect,
  useMemo,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDispatch, useSelector } from "react-redux";
import { apiRequest } from "../../src/api/api";

// =========================================================
// REDUX
// =========================================================

import { getBookings } from "../../src/features/booking/bookingSlice";
import { fetchClients } from "../../src/features/clients/clientsSlice";
import { getBills } from "../../src/features/bills/billsSlice";

// =========================================================
// TYPES
// =========================================================

type RootState = any;
type AppDispatch = any;

type Booking = {
  _id?: string;

  client?: any;
  customer?: any;

  service?: any;
  services?: any[];

  date?: string;
  bookingDate?: string;
  appointmentDate?: string;

  time?: string;
  startTime?: string;
  appointmentTime?: string;

  status?: string;

  totalAmount?: number;
  amount?: number;
  price?: number;

  createdAt?: string;
};

type Bill = {
  _id?: string;

  client?: any;
  customer?: any;

  totalAmount?: number;
  grandTotal?: number;
  total?: number;
  amount?: number;
  payableAmount?: number;

  paidAmount?: number;
  pendingAmount?: number;
  dueAmount?: number;

  paymentStatus?: string;
  status?: string;

  createdAt?: string;
  billDate?: string;
  date?: string;
};

type Client = {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
};

// =========================================================
// HELPERS
// =========================================================

const normalizeDate = (value: any) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const isToday = (value: any) => {
  const date = normalizeDate(value);

  if (!date) return false;

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const formatCurrency = (value: number) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN")}`;
};

const getClientName = (item: any) => {
  if (!item) return "Client";

  if (typeof item === "string") {
    return item;
  }

  return (
    item.name ||
    item.fullName ||
    item.clientName ||
    item.customerName ||
    "Client"
  );
};

const getServiceName = (booking: Booking) => {
  if (booking.service) {
    if (typeof booking.service === "string") {
      return booking.service;
    }

    return (
      booking.service.name ||
      booking.service.serviceName ||
      "Salon Service"
    );
  }

  if (Array.isArray(booking.services)) {
    const names = booking.services
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return (
          item?.name ||
          item?.serviceName ||
          item?.service?.name
        );
      })
      .filter(Boolean);

    if (names.length) {
      return names.join(", ");
    }
  }

  return (
    (booking as any).serviceName ||
    "Salon Service"
  );
};

const getBookingClient = (booking: Booking) => {
  return (
    booking.client ||
    booking.customer ||
    (booking as any).clientId ||
    null
  );
};

const getBookingDate = (booking: Booking) => {
  return (
    booking.date ||
    booking.bookingDate ||
    booking.appointmentDate ||
    booking.createdAt
  );
};

const getBookingTime = (booking: Booking) => {
  const raw =
    booking.time ||
    booking.startTime ||
    booking.appointmentTime;

  if (!raw) {
    return "--";
  }

  // Already formatted
  if (
    typeof raw === "string" &&
    /am|pm/i.test(raw)
  ) {
    return raw;
  }

  // HH:mm
  if (
    typeof raw === "string" &&
    /^\d{1,2}:\d{2}$/.test(raw)
  ) {
    const [hourString, minuteString] =
      raw.split(":");

    let hour = Number(hourString);
    const minuteValue = Number(minuteString);

    const suffix = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${String(minuteValue).padStart(
      2,
      "0"
    )} ${suffix}`;
  }

  return String(raw);
};

const getBillTotal = (bill: Bill) => {
  return Number(
    bill.totalAmount ??
      bill.grandTotal ??
      bill.total ??
      bill.payableAmount ??
      bill.amount ??
      0
  );
};

const getBillPending = (bill: Bill) => {
  const explicitPending =
    bill.pendingAmount ??
    bill.dueAmount;

  if (
    explicitPending !== undefined &&
    explicitPending !== null
  ) {
    return Number(explicitPending || 0);
  }

  const total = getBillTotal(bill);

  const paid = Number(
    bill.paidAmount || 0
  );

  if (paid > 0) {
    return Math.max(total - paid, 0);
  }

  const status = String(
    bill.paymentStatus ||
      bill.status ||
      ""
  ).toLowerCase();

  if (
    status.includes("paid") ||
    status === "completed"
  ) {
    return 0;
  }

  return total;
};

const getBillPaymentStatus = (bill: Bill) => {
  return String(
    bill.paymentStatus ||
      bill.status ||
      ""
  ).toLowerCase();
};

// =========================================================
// MAIN SCREEN
// =========================================================

export default function HomeScreen() {
  const dispatch =
    useDispatch<AppDispatch>();

  // =======================================================
  // REDUX STATE
  // =======================================================

  const bookings = useSelector(
    (state: RootState) =>
      state.booking?.bookings || []
  );

  const bookingLoading = useSelector(
    (state: RootState) =>
      state.booking?.loading || false
  );

  const bookingError = useSelector(
    (state: RootState) =>
      state.booking?.error || null
  );

  const clients = useSelector(
    (state: RootState) =>
      state.clients?.clients || []
  );

  const clientsTotal = useSelector(
    (state: RootState) =>
      state.clients?.total || 0
  );

  const clientLoading = useSelector(
    (state: RootState) =>
      state.clients?.loading || false
  );

  const clientError = useSelector(
    (state: RootState) =>
      state.clients?.error || null
  );

  const bills = useSelector(
    (state: RootState) =>
      state.billing?.bills || []
  );

  const billingLoading = useSelector(
    (state: RootState) =>
      state.billing?.loading || false
  );

  const billingError = useSelector(
    (state: RootState) =>
      state.billing?.error || null
  );

  // =======================================================
  // FETCH ALL DASHBOARD DATA
  // =======================================================

  const loadDashboard = useCallback(async () => {
    await Promise.allSettled([
      dispatch(getBookings()),
      dispatch(
        fetchClients({
          page: 1,
          limit: 100,
        })
      ),
      dispatch(
        getBills({
          page: 1,
          limit: 100,
        })
      ),
    ]);
  }, [dispatch]);

  // Load dashboard once when this screen mounts.
  // Do not depend on Redux loading state, otherwise a state change can
  // trigger another request and create a refresh/fetch loop.
  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================================================
  // LIVE TOTAL REVENUE
  // Always comes from backend /api/bills/revenue.
  // This is NOT calculated from the Redux bills array.
  // =======================================================
  const token = useSelector(
    (state: RootState) => state.auth?.token
  );

  type DashboardRevenuePeriod =
    | "today"
    | "week"
    | "month"
    | "quarter"
    | "year"
    | "overall";

  const [totalRevenue, setTotalRevenue] =
    React.useState(0);
  const [totalRevenueBills, setTotalRevenueBills] =
    React.useState(0);
  const [revenuePeriod, setRevenuePeriod] =
    React.useState<DashboardRevenuePeriod>("month");
  const [revenueLoading, setRevenueLoading] =
    React.useState(false);

  const loadRevenue = useCallback(async (period: DashboardRevenuePeriod = revenuePeriod) => {
    if (!token) return;

    try {
      setRevenueLoading(true);

      const response = await apiRequest(
        `/bills/revenue?period=${encodeURIComponent(period)}`,
        {
          method: "GET",
          token,
        }
      );

      if (response?.success) {
        setTotalRevenue(
          Number(response.totalRevenue || 0)
        );

        setTotalRevenueBills(
          Number(response.totalBills || 0)
        );
      }
    } catch (error) {
      console.error(
        "REVENUE FETCH ERROR:",
        error
      );
    } finally {
      setRevenueLoading(false);
    }
  }, [token, revenuePeriod]);

  // Fetch immediately when Home opens and whenever
  // the screen becomes active again.
  useFocusEffect(
    useCallback(() => {
      loadRevenue();
      return undefined;
    }, [loadRevenue])
  );

  // Keep revenue fresh while Home remains open.
  // A new bill will normally appear within 15 seconds.
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      loadRevenue();
    }, 15000);

    return () => clearInterval(interval);
  }, [token, loadRevenue]);


  // =======================================================
  // REFRESH
  // =======================================================

  const [manualRefreshing, setManualRefreshing] =
    React.useState(false);

  const refreshing = manualRefreshing;

  const onRefresh = useCallback(async () => {
    if (manualRefreshing) return;

    try {
      setManualRefreshing(true);
      await Promise.all([
        loadDashboard(),
        loadRevenue(),
      ]);
    } finally {
      setManualRefreshing(false);
    }
  }, [manualRefreshing, loadDashboard, loadRevenue]);

  // =======================================================
  // TODAY'S BOOKINGS
  // =======================================================

  const todaysBookings =
    useMemo(() => {
      return bookings
        .filter((booking: Booking) =>
          isToday(
            getBookingDate(booking)
          )
        )
        .sort((a: Booking, b: Booking) => {
          const aDate =
            normalizeDate(
              getBookingDate(a)
            );

          const bDate =
            normalizeDate(
              getBookingDate(b)
            );

          if (!aDate || !bDate) {
            return 0;
          }

          return (
            aDate.getTime() -
            bDate.getTime()
          );
        });
    }, [bookings]);

  // =======================================================
  // PENDING PAYMENTS
  // =======================================================

  const pendingBills =
    useMemo(() => {
      return bills.filter(
        (bill: Bill) => {
          const pending =
            getBillPending(bill);

          const status =
            getBillPaymentStatus(bill);

          if (
            status.includes("cancel")
          ) {
            return false;
          }

          return pending > 0;
        }
      );
    }, [bills]);

  const pendingPaymentCount =
    pendingBills.length;

  const pendingPaymentAmount =
    pendingBills.reduce(
      (sum: number, bill: Bill) =>
        sum + getBillPending(bill),
      0
    );

  // =======================================================
  // RECENT APPOINTMENTS
  // =======================================================

  const displayAppointments =
    useMemo(() => {
      return todaysBookings.slice(
        0,
        5
      );
    }, [todaysBookings]);

  // Hero stats
  const totalClients =
    clientsTotal || clients.length;

  // =======================================================
  // RECENT ACTIVITIES
  // =======================================================

  const recentActivities =
    useMemo(() => {
      const activities: {
        icon: string;
        title: string;
        subtitle: string;
        time: string;
      }[] = [];

      const recentBookings = [
        ...bookings,
      ]
        .sort((a: Booking, b: Booking) => {
          const aDate =
            normalizeDate(
              a.createdAt ||
                getBookingDate(a)
            );

          const bDate =
            normalizeDate(
              b.createdAt ||
                getBookingDate(b)
            );

          return (
            (bDate?.getTime() || 0) -
            (aDate?.getTime() || 0)
          );
        })
        .slice(0, 3);

      recentBookings.forEach(
        (booking: Booking) => {
          activities.push({
            icon: "◷",
            title:
              "Booking activity",
            subtitle:
              `${getClientName(
                getBookingClient(
                  booking
                )
              )} • ${getServiceName(
                booking
              )}`,
            time: formatRelativeTime(
              booking.createdAt ||
                getBookingDate(
                  booking
                )
            ),
          });
        }
      );

      const recentBills = [
        ...bills,
      ]
        .sort((a: Bill, b: Bill) => {
          const aDate =
            normalizeDate(
              a.createdAt ||
                a.billDate ||
                a.date
            );

          const bDate =
            normalizeDate(
              b.createdAt ||
                b.billDate ||
                b.date
            );

          return (
            (bDate?.getTime() || 0) -
            (aDate?.getTime() || 0)
          );
        })
        .slice(0, 3);

      recentBills.forEach(
        (bill: Bill) => {
          activities.push({
            icon: "₹",
            title:
              "Bill activity",
            subtitle:
              `${formatCurrency(
                getBillTotal(
                  bill
                )
              )} • ${
                bill.paymentStatus ||
                bill.status ||
                "Created"
              }`,
            time: formatRelativeTime(
              bill.createdAt ||
                bill.billDate ||
                bill.date
            ),
          });
        }
      );

      return activities
        .sort((a, b) => {
          return (
            parseRelativeTime(
              a.time
            ) -
            parseRelativeTime(
              b.time
            )
          );
        })
        .slice(0, 6);
    }, [bookings, bills]);

  // =======================================================
  // FOLLOW UPS
  // =======================================================

  const followUps =
    useMemo(() => {
      const result: {
        name: string;
        text: string;
        initial: string;
      }[] = [];

      clients
        .slice(0, 5)
        .forEach((client: Client) => {
          if (!client?.name) {
            return;
          }

          result.push({
            name: client.name,
            text: "Client follow-up",
            initial:
              client.name
                .charAt(0)
                .toUpperCase(),
          });
        });

      return result.slice(0, 3);
    }, [clients]);

  // =======================================================
  // ERROR MESSAGE
  // =======================================================

  const dashboardError =
    bookingError ||
    clientError ||
    billingError;

  // =======================================================
  // UI
  // =======================================================

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView
        style={styles.safeArea}
        edges={[
          "top",
          "left",
          "right",
        ]}
      >
        <FlatList
          data={[]}
          renderItem={() => null}
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7A263A"
            />
          }
          contentContainerStyle={
            styles.content
          }
          ListHeaderComponent={
            <>
              {/* =================================================
                  HEADER
              ================================================= */}

              <View
                style={styles.header}
              >
                <View>
                  <Text
                    style={
                      styles.smallText
                    }
                  >
                    ADMIN DASHBOARD
                  </Text>

                  <Text
                    style={styles.logo}
                  >
                    Glow Salon
                  </Text>
                </View>

                <Pressable
                  style={
                    styles.profileButton
                  }
                  onPress={() =>
                    router.push(
                      "/profile"
                    )
                  }
                >
                  <Text
                    style={
                      styles.profileInitial
                    }
                  >
                    G
                  </Text>
                </Pressable>
              </View>

              {/* =================================================
                  ERROR
              ================================================= */}

              {dashboardError ? (
                <View
                  style={
                    styles.errorCard
                  }
                >
                  <Text
                    style={
                      styles.errorTitle
                    }
                  >
                    Unable to load some data
                  </Text>

                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    {String(
                      dashboardError
                    )}
                  </Text>

                  <Pressable
                    style={
                      styles.retryButton
                    }
                    onPress={
                      onRefresh
                    }
                  >
                    <Text
                      style={
                        styles.retryText
                      }
                    >
                      Retry
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {/* =================================================
                  HERO
              ================================================= */}
<View style={styles.hero}>
  <Image
    source={require("../../src/assets/images/hero.jpg")}
    style={styles.heroImage}
    resizeMode="cover"
  />

  <View style={styles.heroOverlay} />

  <View style={styles.heroBrand}>
    <View style={styles.heroBrandIcon}>
      <Text style={styles.heroBrandIconText}>✦</Text>
    </View>

    <View>
      <Text style={styles.heroBrandName}>
        GLOW SALON
      </Text>

      <Text style={styles.heroBrandSub}>
        BEAUTY • STYLE • CARE
      </Text>
    </View>
  </View>

  <View style={styles.heroBottom}>
    <View style={styles.heroWelcome}>
      <Text style={styles.heroWelcomeSmall}>
        WELCOME BACK
      </Text>

      <Text style={styles.heroTitle}>
        Make today{"\n"}
        <Text style={styles.heroTitleAccent}>
          beautiful.
        </Text>
      </Text>

      <Text style={styles.heroDescription}>
        Everything you need to manage
        your salon in one place.
      </Text>
    </View>

    <View style={styles.heroInfoCard}>
      <View style={styles.heroInfoItem}>
        <Text style={styles.heroInfoValue}>
          {revenueLoading ? "..." : formatCurrency(totalRevenue)}
        </Text>

        <Text style={styles.heroInfoLabel}>
          Total{"\n"}Revenue
        </Text>
      </View>

      <View style={styles.heroInfoDivider} />

      <View style={styles.heroInfoItem}>
        <Text style={styles.heroInfoValue}>
          {totalClients}
        </Text>

        <Text style={styles.heroInfoLabel}>
          Total{"\n"}Clients
        </Text>
      </View>
    </View>
  </View>
</View>

              {/* =================================================
                  REVENUE OVERVIEW
              ================================================= */}

              <RevenueOverviewCard
                bills={bills}
                revenue={totalRevenue}
                totalBills={totalRevenueBills}
                loading={revenueLoading}
                period={revenuePeriod}
                onPeriodChange={(selectedPeriod) => {
                  setRevenuePeriod(selectedPeriod);
                  loadRevenue(selectedPeriod);
                }}
                onPress={() => router.push("/billing")}
              />

              {/* =================================================
                  OVERVIEW
              ================================================= */}

              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Today's Overview
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Keep track of your salon
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.overviewGrid
                }
              >
                <OverviewCard
                  icon="♙"
                  title="Clients"
                  value={String(
                    clientsTotal ||
                      clients.length
                  )}
                  subtitle="Total"
                  onPress={() =>
                    router.push(
                      "/clients"
                    )
                  }
                />

                <OverviewCard
                  icon="◷"
                  title="Pending"
                  value={String(
                    pendingPaymentCount
                  )}
                  subtitle={
                    pendingPaymentAmount >
                    0
                      ? formatCurrency(
                          pendingPaymentAmount
                        )
                      : "Payments"
                  }
                  onPress={() =>
                    router.push(
                      "/billing"
                    )
                  }
                />

                <QuickAction
                  icon="✓"
                  title="Attendance"
                  subtitle="Manage staff attendance"
                  onPress={() =>
                    router.push("/attendance")
                  }
                />
              </View>

              {/* =================================================
                  QUICK ACTIONS
              ================================================= */}

              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Quick Actions
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Manage your salon faster
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.quickGrid
                }
              >
                <QuickAction
                  icon="+"
                  title="New Bill"
                  subtitle="Create invoice"
                  onPress={() =>
                    router.push(
                      "/billing"
                    )
                  }
                />

                <QuickAction
                  icon="◷"
                  title="Appointments"
                  subtitle="View bookings"
                  onPress={() =>
                    router.push(
                      "/bookings"
                    )
                  }
                />

                <QuickAction
                  icon="♙"
                  title="Add Client"
                  subtitle="New customer"
                  onPress={() =>
                    router.push(
                      "/clients/add-client"
                    )
                  }
                />

                <QuickAction
                  icon="✦"
                  title="Services"
                  subtitle="Manage services"
                  onPress={() =>
                    router.push(
                      "/services"
                    )
                  }
                />
              </View>

              {/* =================================================
                  APPOINTMENTS
              ================================================= */}

              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Today's Appointments
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Upcoming appointments
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    router.push(
                      "/bookings"
                    )
                  }
                >
                  <Text
                    style={
                      styles.viewAll
                    }
                  >
                    View all
                  </Text>
                </Pressable>
              </View>

              {bookingLoading &&
              !todaysBookings.length ? (
                <LoadingCard />
              ) : displayAppointments.length >
                0 ? (
                displayAppointments.map(
                  (
                    booking: Booking,
                    index: number
                  ) => (
                    <AppointmentCard
                      key={
                        booking._id ||
                        `booking-${index}`
                      }
                      name={getClientName(
                        getBookingClient(
                          booking
                        )
                      )}
                      service={getServiceName(
                        booking
                      )}
                      time={getBookingTime(
                        booking
                      )}
                      status={String(
                        booking.status ||
                          "PENDING"
                      ).toUpperCase()}
                      initial={getClientName(
                        getBookingClient(
                          booking
                        )
                      )
                        .charAt(0)
                        .toUpperCase()}
                    />
                  )
                )
              ) : (
                <EmptyCard
                  title="No appointments today"
                  subtitle="New appointments will appear here."
                />
              )}

              {/* =================================================
                  FOLLOW UPS
              ================================================= */}

              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Client Follow-ups
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Stay connected with your clients
                  </Text>
                </View>
              </View>

              {followUps.length >
              0 ? (
                followUps.map(
                  (
                    item,
                    index
                  ) => (
                    <FollowUpCard
                      key={`${item.name}-${index}`}
                      name={
                        item.name
                      }
                      text={
                        item.text
                      }
                      action="Contact"
                      initial={
                        item.initial
                      }
                    />
                  )
                )
              ) : (
                <EmptyCard
                  title="No follow-ups"
                  subtitle="Client follow-up information will appear here."
                />
              )}

              {/* =================================================
                  RECENT ACTIVITY
              ================================================= */}

              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Recent Activity
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Latest salon updates
                  </Text>
                </View>
              </View>

              {recentActivities.length >
              0 ? (
                recentActivities.map(
                  (
                    activity,
                    index
                  ) => (
                    <ActivityRow
                      key={`activity-${index}`}
                      icon={
                        activity.icon
                      }
                      title={
                        activity.title
                      }
                      subtitle={
                        activity.subtitle
                      }
                      time={
                        activity.time
                      }
                    />
                  )
                )
              ) : (
                <EmptyCard
                  title="No recent activity"
                  subtitle="Your latest bookings and bills will appear here."
                />
              )}

              {/* =================================================
                  BOTTOM SPACE
              ================================================= */}

              <View
                style={
                  styles.bottomSpace
                }
              />
            </>
          }
        />
      </SafeAreaView>
    </View>
  );
}

// =========================================================
// RELATIVE TIME
// =========================================================

function formatRelativeTime(
  value: any
) {
  const date =
    normalizeDate(value);

  if (!date) {
    return "";
  }

  const diff =
    Date.now() -
    date.getTime();

  const minutes = Math.floor(
    diff / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
}

function parseRelativeTime(
  value: string
) {
  if (!value) {
    return 999999999;
  }

  if (value === "Just now") {
    return 0;
  }

  const match =
    value.match(
      /(\d+)([mhd])/
    );

  if (!match) {
    return 999999999;
  }

  const amount =
    Number(match[1]);

  const unit =
    match[2];

  if (unit === "m") {
    return amount;
  }

  if (unit === "h") {
    return amount * 60;
  }

  return amount * 1440;
}


// =========================================================
// REVENUE OVERVIEW
// =========================================================

type RevenuePeriod =
  | "today"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "overall";

function RevenueOverviewCard({
  bills,
  revenue,
  totalBills,
  loading,
  period,
  onPeriodChange,
  onPress,
}: {
  bills: Bill[];
  revenue: number;
  totalBills: number;
  loading: boolean;
  period: RevenuePeriod;
  onPeriodChange: (period: RevenuePeriod) => void;
  onPress: () => void;
}) {
  type RevenuePeriod =
    | "today"
    | "week"
    | "month"
    | "quarter"
    | "year"
    | "overall";

  const [menuVisible, setMenuVisible] =
    React.useState(false);

  const periodLabels: Record<RevenuePeriod, string> = {
    today: "Today",
    week: "Last 7 Days",
    month: "This Month",
    quarter: "Last 3 Months",
    year: "This Year",
    overall: "Overall",
  };

  const getBillDate = (bill: Bill) =>
    normalizeDate(
      bill.billDate ||
        bill.createdAt ||
        bill.date
    );

  const isRevenueBill = (bill: Bill) => {
    const status = getBillPaymentStatus(bill);

    if (status.includes("cancel")) {
      return false;
    }

    // Current backend may not always send paymentStatus.
    // In that case, keep the bill included.
    if (!status) {
      return true;
    }

    return (
      status.includes("paid") ||
      status.includes("complete") ||
      status.includes("success")
    );
  };

  const isInPeriod = (
    bill: Bill,
    selected: RevenuePeriod
  ) => {
    if (selected === "overall") {
      return true;
    }

    const date = getBillDate(bill);

    if (!date) {
      return false;
    }

    const now = new Date();
    const start = new Date(now);

    if (selected === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (selected === "week") {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else if (selected === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else if (selected === "quarter") {
      start.setMonth(now.getMonth() - 2, 1);
      start.setHours(0, 0, 0, 0);
    } else if (selected === "year") {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
    }

    return date >= start && date <= now;
  };

  const filteredBills = useMemo(() => {
    return bills.filter(
      (bill) =>
        isRevenueBill(bill) &&
        isInPeriod(bill, period)
    );
  }, [bills, period]);

  const chartData = useMemo(() => {
    const now = new Date();

    // Today -> 6 four-hour buckets
    if (period === "today") {
      return Array.from({ length: 6 }, (_, index) => {
        const start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          index * 4,
          0,
          0,
          0
        );

        const end = new Date(start);
        end.setHours(start.getHours() + 4);

        return {
          label: `${index * 4}h`,
          value: filteredBills
            .filter((bill) => {
              const date = getBillDate(bill);
              return date && date >= start && date < end;
            })
            .reduce(
              (sum, bill) => sum + getBillTotal(bill),
              0
            ),
        };
      });
    }

    // Last 7 days
    if (period === "week") {
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (6 - index));
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        return {
          label: date.toLocaleDateString("en-IN", {
            weekday: "short",
          }),
          value: filteredBills
            .filter((bill) => {
              const billDate = getBillDate(bill);
              return (
                billDate &&
                billDate >= date &&
                billDate < nextDate
              );
            })
            .reduce(
              (sum, bill) => sum + getBillTotal(bill),
              0
            ),
        };
      });
    }

    // Current month -> 6 date ranges
    if (period === "month") {
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();

      const step = Math.ceil(daysInMonth / 6);

      return Array.from({ length: 6 }, (_, index) => {
        const startDay = index * step + 1;
        const endDay = Math.min(
          (index + 1) * step,
          daysInMonth
        );

        return {
          label: `${startDay}-${endDay}`,
          value: filteredBills
            .filter((bill) => {
              const date = getBillDate(bill);

              return (
                date &&
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth() &&
                date.getDate() >= startDay &&
                date.getDate() <= endDay
              );
            })
            .reduce(
              (sum, bill) => sum + getBillTotal(bill),
              0
            ),
        };
      });
    }

    // Last 3 months
    if (period === "quarter") {
      return Array.from({ length: 3 }, (_, index) => {
        const targetDate = new Date(
          now.getFullYear(),
          now.getMonth() - (2 - index),
          1
        );

        return {
          label: targetDate.toLocaleDateString("en-IN", {
            month: "short",
          }),
          value: filteredBills
            .filter((bill) => {
              const date = getBillDate(bill);

              return (
                date &&
                date.getFullYear() ===
                  targetDate.getFullYear() &&
                date.getMonth() ===
                  targetDate.getMonth()
              );
            })
            .reduce(
              (sum, bill) => sum + getBillTotal(bill),
              0
            ),
        };
      });
    }

    // Current year -> 12 months
    if (period === "year") {
      return Array.from({ length: 12 }, (_, monthIndex) => {
        const monthDate = new Date(
          now.getFullYear(),
          monthIndex,
          1
        );

        return {
          label: monthDate.toLocaleDateString("en-IN", {
            month: "short",
          }),
          value: filteredBills
            .filter((bill) => {
              const date = getBillDate(bill);

              return (
                date &&
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === monthIndex
              );
            })
            .reduce(
              (sum, bill) => sum + getBillTotal(bill),
              0
            ),
        };
      });
    }

    // Overall -> last 6 months for visual trend.
    // The headline value still comes from the backend total.
    return Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1
      );

      const nextMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        1
      );

      return {
        label: monthDate.toLocaleDateString("en-IN", {
          month: "short",
        }),
        value: bills
          .filter((bill) => {
            const date = getBillDate(bill);

            return (
              isRevenueBill(bill) &&
              date &&
              date >= monthDate &&
              date < nextMonth
            );
          })
          .reduce(
            (sum, bill) => sum + getBillTotal(bill),
            0
          ),
      };
    });
  }, [filteredBills, bills, period]);

  const maxValue = Math.max(
    ...chartData.map((item) => item.value),
    1
  );

  return (
    <View style={styles.revenueCard}>
      <View style={styles.revenueCardHeader}>
        <View style={styles.revenueHeaderLeft}>
          <View style={styles.revenueTitleIcon}>
            <Text style={styles.revenueTitleIconText}>
              ₹
            </Text>
          </View>

          <View style={styles.revenueHeaderText}>
            <Text style={styles.revenueCardTitle}>
              Revenue Overview
            </Text>

            <Text style={styles.revenueCardSubtitle}>
              Track your salon earnings
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.revenueFilterButton,
            pressed && styles.pressed,
          ]}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={styles.revenueCalendarIcon}>
            ▣
          </Text>

          <Text
            numberOfLines={1}
            style={styles.revenueFilterText}
          >
            {periodLabels[period]}
          </Text>

          <Text style={styles.revenueChevron}>
            ▾
          </Text>
        </Pressable>
      </View>

      <View style={styles.revenueAmountRow}>
        <View>
          <Text style={styles.revenueAmount}>
            {loading
              ? "..."
              : formatCurrency(revenue)}
          </Text>

          <Text style={styles.revenueAmountLabel}>
            Total Revenue • {loading ? "..." : totalBills} Bills
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.revenueDetailsButton,
            pressed && styles.pressed,
          ]}
          onPress={onPress}
        >
          <Text style={styles.revenueDetailsText}>
            View bills
          </Text>

          <Text style={styles.revenueArrow}>
            →
          </Text>
        </Pressable>
      </View>

      <View style={styles.revenueChartHeader}>
        <Text style={styles.revenueChartTitle}>
          Revenue trend
        </Text>

        <Text style={styles.revenueChartPeriod}>
          {periodLabels[period]}
        </Text>
      </View>

      <View style={styles.revenueChart}>
        {chartData.map((item, index) => {
          const height =
            item.value > 0
              ? Math.max(
                  10,
                  (item.value / maxValue) * 105
                )
              : 5;

          return (
            <View
              key={`${item.label}-${index}`}
              style={styles.chartColumn}
            >
              <View style={styles.chartValueWrap}>
                {item.value > 0 ? (
                  <Text style={styles.chartValue}>
                    {item.value >= 100000
                      ? `₹${(
                          item.value / 100000
                        ).toFixed(1)}L`
                      : item.value >= 1000
                        ? `₹${(
                            item.value / 1000
                          ).toFixed(1)}K`
                        : `₹${Math.round(
                            item.value
                          )}`}
                  </Text>
                ) : null}
              </View>

              <View style={styles.chartTrack}>
                <View
                  style={[
                    styles.chartBar,
                    { height },
                  ]}
                />
              </View>

              <Text style={styles.chartLabel}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.revenueBottomLink,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        <Text style={styles.revenueBottomText}>
          Open billing & revenue details
        </Text>

        <Text style={styles.revenueBottomArrow}>
          →
        </Text>
      </Pressable>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.revenueModalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.revenuePeriodMenu}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View style={styles.revenueMenuHeader}>
              <View>
                <Text style={styles.revenueMenuTitle}>
                  Revenue Period
                </Text>

                <Text style={styles.revenueMenuSubtitle}>
                  Choose the time range
                </Text>
              </View>

              <Pressable
                style={styles.revenueMenuClose}
                onPress={() =>
                  setMenuVisible(false)
                }
              >
                <Text style={styles.revenueMenuCloseText}>
                  ×
                </Text>
              </Pressable>
            </View>

            {(
              Object.keys(periodLabels) as RevenuePeriod[]
            ).map((key) => (
              <Pressable
                key={key}
                style={[
                  styles.revenuePeriodItem,
                  period === key &&
                    styles.revenuePeriodItemActive,
                ]}
                onPress={() => {
                  setMenuVisible(false);
                  onPeriodChange(key);
                }}
              >
                <View style={styles.revenuePeriodLeft}>
                  <Text
                    style={[
                      styles.revenuePeriodIcon,
                      period === key &&
                        styles.revenuePeriodIconActive,
                    ]}
                  >
                    {key === "today"
                      ? "◷"
                      : key === "week"
                        ? "7"
                        : key === "month"
                          ? "M"
                          : key === "quarter"
                            ? "3"
                            : key === "year"
                              ? "Y"
                              : "∞"}
                  </Text>

                  <Text
                    style={[
                      styles.revenuePeriodText,
                      period === key &&
                        styles.revenuePeriodTextActive,
                    ]}
                  >
                    {periodLabels[key]}
                  </Text>
                </View>

                {period === key ? (
                  <Text style={styles.revenueCheck}>
                    ✓
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// =========================================================
// OVERVIEW CARD
// =========================================================

function OverviewCard({
  icon,
  title,
  value,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.overviewCard,
        pressed &&
          styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={
          styles.overviewIcon
        }
      >
        <Text
          style={
            styles.overviewIconText
          }
        >
          {icon}
        </Text>
      </View>

      <Text
        style={
          styles.overviewTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.overviewValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.overviewSubtitle
        }
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}

// =========================================================
// QUICK ACTION
// =========================================================

function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickCard,
        pressed &&
          styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={
          styles.quickIcon
        }
      >
        <Text
          style={
            styles.quickIconText
          }
        >
          {icon}
        </Text>
      </View>

      <View
        style={
          styles.quickTextContainer
        }
      >
        <Text
          style={
            styles.quickTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.quickSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

// =========================================================
// APPOINTMENT CARD
// =========================================================

function AppointmentCard({
  name,
  service,
  time,
  status,
  initial,
}: {
  name: string;
  service: string;
  time: string;
  status: string;
  initial: string;
}) {
  const normalizedStatus =
    status.toUpperCase();

  const isPending =
    normalizedStatus ===
      "PENDING" ||
    normalizedStatus ===
      "PENDING_CONFIRMATION";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.appointmentCard,
        pressed &&
          styles.pressed,
      ]}
      onPress={() =>
        router.push(
          "/bookings"
        )
      }
    >
      <View
        style={styles.avatar}
      >
        <Text
          style={
            styles.avatarText
          }
        >
          {initial}
        </Text>
      </View>

      <View
        style={
          styles.appointmentInfo
        }
      >
        <Text
          numberOfLines={1}
          style={
            styles.appointmentName
          }
        >
          {name}
        </Text>

        <Text
          numberOfLines={1}
          style={
            styles.appointmentService
          }
        >
          {service}
        </Text>
      </View>

      <View
        style={
          styles.appointmentRight
        }
      >
        <Text
          style={
            styles.appointmentTime
          }
        >
          {time}
        </Text>

        <View
          style={[
            styles.statusBadge,
            isPending &&
              styles.pendingBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isPending &&
                styles.pendingText,
            ]}
          >
            {normalizedStatus}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// =========================================================
// FOLLOW UP
// =========================================================

function FollowUpCard({
  name,
  text,
  action,
  initial,
}: {
  name: string;
  text: string;
  action: string;
  initial: string;
}) {
  return (
    <View
      style={
        styles.followCard
      }
    >
      <View
        style={styles.avatar}
      >
        <Text
          style={
            styles.avatarText
          }
        >
          {initial}
        </Text>
      </View>

      <View
        style={
          styles.followInfo
        }
      >
        <Text
          style={
            styles.followName
          }
        >
          {name}
        </Text>

        <Text
          style={
            styles.followText
          }
        >
          {text}
        </Text>
      </View>

      <Pressable
        style={
          styles.contactButton
        }
      >
        <Text
          style={
            styles.contactText
          }
        >
          {action}
        </Text>
      </Pressable>
    </View>
  );
}

// =========================================================
// ACTIVITY
// =========================================================

function ActivityRow({
  icon,
  title,
  subtitle,
  time,
}: {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
}) {
  return (
    <View
      style={
        styles.activityRow
      }
    >
      <View
        style={
          styles.activityIcon
        }
      >
        <Text
          style={
            styles.activityIconText
          }
        >
          {icon}
        </Text>
      </View>

      <View
        style={
          styles.activityInfo
        }
      >
        <Text
          numberOfLines={1}
          style={
            styles.activityTitle
          }
        >
          {title}
        </Text>

        <Text
          numberOfLines={2}
          style={
            styles.activitySubtitle
          }
        >
          {subtitle}
        </Text>
      </View>

      <Text
        style={
          styles.activityTime
        }
      >
        {time}
      </Text>
    </View>
  );
}

// =========================================================
// LOADING
// =========================================================

function LoadingCard() {
  return (
    <View
      style={
        styles.loadingCard
      }
    >
      <ActivityIndicator
        size="small"
        color="#7A263A"
      />

      <Text
        style={
          styles.loadingText
        }
      >
        Loading appointments...
      </Text>
    </View>
  );
}

// =========================================================
// EMPTY
// =========================================================

function EmptyCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View
      style={
        styles.emptyCard
      }
    >
      <Text
        style={
          styles.emptyTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.emptySubtitle
        }
      >
        {subtitle}
      </Text>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF7F4",
  },

  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  // =======================================================
  // HEADER
  // =======================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingTop: 10,
    paddingBottom: 20,
  },

  smallText: {
    fontSize: 11,
    letterSpacing: 2,
    color: "#8C7770",
    fontWeight: "700",
  },

  logo: {
    marginTop: 4,
    fontSize: 27,
    color: "#4E1D29",
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      "#7A263A",
    alignItems: "center",
    justifyContent:
      "center",
  },

  profileInitial: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  // =======================================================
  // ERROR
  // =======================================================

  errorCard: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#E7B7B7",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },

  errorTitle: {
    color: "#8D2020",
    fontWeight: "800",
    fontSize: 14,
  },

  errorText: {
    color: "#8D5555",
    marginTop: 5,
    fontSize: 12,
  },

  retryButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#7A263A",
    borderRadius: 10,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // =======================================================
  // HERO
  // =======================================================

hero: {
  width: "100%",
  height: 265,
  borderRadius: 28,
  overflow: "hidden",
  position: "relative",
  marginBottom: 22,
  backgroundColor: "#7A263A",
},

heroImage: {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
},

heroOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(38, 10, 20, 0.32)",
},

heroBrand: {
  position: "absolute",
  top: 18,
  left: 18,
  flexDirection: "row",
  alignItems: "center",
},

heroBrandIcon: {
  width: 38,
  height: 38,
  borderRadius: 13,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.92)",
  marginRight: 10,
},

heroBrandIconText: {
  fontSize: 18,
  fontWeight: "700",
  color: "#7A263A",
},

heroBrandName: {
  fontSize: 13,
  fontWeight: "900",
  letterSpacing: 1.8,
  color: "#FFFFFF",
},

heroBrandSub: {
  fontSize: 7,
  fontWeight: "700",
  letterSpacing: 1.2,
  color: "rgba(255,255,255,0.72)",
  marginTop: 2,
},

heroBottom: {
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 17,
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
},

heroWelcome: {
  flex: 1,
  paddingRight: 12,
},

heroWelcomeSmall: {
  fontSize: 9,
  fontWeight: "800",
  letterSpacing: 1.5,
  color: "rgba(255,255,255,0.75)",
  marginBottom: 5,
},

heroTitle: {
  fontSize: 28,
  lineHeight: 31,
  fontWeight: "800",
  color: "#FFFFFF",
},

heroTitleAccent: {
  color: "#F6C9A9",
},

heroDescription: {
  fontSize: 10,
  lineHeight: 15,
  color: "rgba(255,255,255,0.78)",
  marginTop: 7,
  maxWidth: 190,
},

heroInfoCard: {
  width: 145,
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 13,
  paddingHorizontal: 12,
  borderRadius: 18,
  backgroundColor: "rgba(255,255,255,0.94)",
},

heroInfoItem: {
  flex: 1,
},

heroInfoValue: {
  fontSize: 20,
  fontWeight: "900",
  color: "#7A263A",
},

heroInfoLabel: {
  fontSize: 8,
  lineHeight: 11,
  fontWeight: "600",
  color: "#777",
  marginTop: 2,
},

heroInfoDivider: {
  width: 1,
  height: 38,
  backgroundColor: "#E6D6DA",
  marginHorizontal: 8,
},
  // =======================================================
  // SECTION
  // =======================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginTop: 10,
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#4E1D29",
  },

  sectionSubtitle: {
    marginTop: 3,
    color: "#927C76",
    fontSize: 12,
  },

  viewAll: {
    color: "#7A263A",
    fontWeight: "800",
    fontSize: 12,
  },

  // =======================================================
  // REVENUE OVERVIEW
  // =======================================================

  revenueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#F1E6E2",
    shadowColor: "#4E1D29",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },

  revenueCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  revenueHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },

  revenueTitleIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
  },

  revenueTitleIconText: {
    color: "#7A263A",
    fontSize: 18,
    fontWeight: "900",
  },

  revenueHeaderText: {
    flex: 1,
    marginLeft: 10,
  },

  revenueCardTitle: {
    color: "#4E1D29",
    fontSize: 18,
    fontWeight: "900",
  },

  revenueCardSubtitle: {
    color: "#9A8580",
    fontSize: 11,
    marginTop: 4,
  },

  revenueFilterButton: {
    minHeight: 38,
    maxWidth: 145,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#FBF2EF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1E2DE",
  },

  revenueCalendarIcon: {
    color: "#7A263A",
    fontSize: 16,
    fontWeight: "800",
    marginRight: 5,
  },

  revenueFilterText: {
    color: "#7A263A",
    fontSize: 10,
    fontWeight: "800",
    flexShrink: 1,
  },

  revenueChevron: {
    color: "#7A263A",
    fontSize: 12,
    marginLeft: 5,
  },

  revenueAmountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  revenueAmount: {
    color: "#4E1D29",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  revenueAmountLabel: {
    color: "#9A8580",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  revenueDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F8E9E6",
  },

  revenueDetailsText: {
    color: "#7A263A",
    fontSize: 10,
    fontWeight: "800",
  },

  revenueArrow: {
    color: "#7A263A",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 4,
  },

  revenueChartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  revenueChartTitle: {
    color: "#5E4943",
    fontSize: 11,
    fontWeight: "800",
  },

  revenueChartPeriod: {
    color: "#AA9790",
    fontSize: 9,
    fontWeight: "700",
  },

  revenueChart: {
    height: 160,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 8,
  },

  chartColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 2,
  },

  chartValueWrap: {
    height: 20,
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
  },

  chartValue: {
    color: "#8A7069",
    fontSize: 7,
    fontWeight: "800",
  },

  chartTrack: {
    width: "68%",
    height: 110,
    borderRadius: 8,
    justifyContent: "flex-end",
    backgroundColor: "#FBF3F0",
    overflow: "hidden",
  },

  chartBar: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#7A263A",
  },

  chartLabel: {
    color: "#A08D87",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 7,
  },

  revenueBottomLink: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1E6E2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  revenueBottomText: {
    color: "#7A263A",
    fontSize: 10,
    fontWeight: "800",
  },

  revenueBottomArrow: {
    color: "#7A263A",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 5,
  },

  revenueModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(36, 17, 23, 0.28)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  revenuePeriodMenu: {
    width: "88%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0E2DE",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },

  revenueMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 8,
  },

  revenueMenuTitle: {
    color: "#4E1D29",
    fontSize: 14,
    fontWeight: "900",
    paddingHorizontal: 6,
    paddingTop: 4,
  },

  revenueMenuSubtitle: {
    color: "#9A8580",
    fontSize: 10,
    marginTop: 2,
    paddingHorizontal: 6,
  },

  revenueMenuClose: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
  },

  revenueMenuCloseText: {
    color: "#7A263A",
    fontSize: 22,
    lineHeight: 22,
    fontWeight: "600",
  },

  revenuePeriodItem: {
    minHeight: 46,
    paddingHorizontal: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  revenuePeriodLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  revenuePeriodIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#FBF2EF",
    color: "#7A263A",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 10,
  },

  revenuePeriodIconActive: {
    backgroundColor: "#F8E1DC",
  },

  revenuePeriodItemActive: {
    backgroundColor: "#FBF0ED",
  },

  revenuePeriodText: {
    color: "#6F5A54",
    fontSize: 12,
    fontWeight: "600",
  },

  revenuePeriodTextActive: {
    color: "#7A263A",
    fontWeight: "900",
  },

  revenueCheck: {
    color: "#7A263A",
    fontSize: 15,
    fontWeight: "900",
  },

  // =======================================================
  // OVERVIEW
  // =======================================================

  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
    marginBottom: 20,
  },

  overviewCard: {
    width: "48.2%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1E6E2",
  },

  overviewIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent:
      "center",
    marginBottom: 11,
  },

  overviewIconText: {
    color: "#7A263A",
    fontSize: 17,
    fontWeight: "800",
  },

  overviewTitle: {
    color: "#806E68",
    fontSize: 12,
    fontWeight: "600",
  },

  overviewValue: {
    color: "#4E1D29",
    fontSize: 23,
    fontWeight: "800",
    marginTop: 4,
  },

  overviewSubtitle: {
    color: "#A18D87",
    fontSize: 11,
    marginTop: 2,
  },

  // =======================================================
  // QUICK ACTION
  // =======================================================

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
    marginBottom: 20,
  },

  quickCard: {
    width: "48.2%",
    minHeight: 92,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1E6E2",
  },

  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent:
      "center",
  },

  quickIconText: {
    color: "#7A263A",
    fontSize: 20,
    fontWeight: "700",
  },

  quickTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  quickTitle: {
    color: "#4E1D29",
    fontWeight: "800",
    fontSize: 13,
  },

  quickSubtitle: {
    color: "#9B8780",
    fontSize: 10,
    marginTop: 3,
  },

  // =======================================================
  // APPOINTMENTS
  // =======================================================

  appointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1E6E2",
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#F0DCD9",
    alignItems: "center",
    justifyContent:
      "center",
  },

  avatarText: {
    color: "#7A263A",
    fontWeight: "800",
    fontSize: 16,
  },

  appointmentInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  appointmentName: {
    color: "#4E1D29",
    fontSize: 14,
    fontWeight: "800",
  },

  appointmentService: {
    color: "#96817A",
    fontSize: 11,
    marginTop: 4,
  },

  appointmentRight: {
    alignItems: "flex-end",
  },

  appointmentTime: {
    color: "#5E4943",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },

  statusBadge: {
    backgroundColor: "#E6F3E9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  pendingBadge: {
    backgroundColor: "#FFF0D8",
  },

  statusText: {
    color: "#367045",
    fontSize: 8,
    fontWeight: "900",
  },

  pendingText: {
    color: "#9A6500",
  },

  // =======================================================
  // FOLLOW UP
  // =======================================================

  followCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1E6E2",
  },

  followInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  followName: {
    color: "#4E1D29",
    fontSize: 14,
    fontWeight: "800",
  },

  followText: {
    color: "#96817A",
    fontSize: 11,
    marginTop: 4,
  },

  contactButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F8E9E6",
    borderRadius: 10,
  },

  contactText: {
    color: "#7A263A",
    fontSize: 10,
    fontWeight: "800",
  },

  // =======================================================
  // PAYMENT
  // =======================================================

  // =======================================================
  // ACTIVITY
  // =======================================================

  activityRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1E6E2",
  },

  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent:
      "center",
  },

  activityIconText: {
    color: "#7A263A",
    fontSize: 17,
    fontWeight: "800",
  },

  activityInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  activityTitle: {
    color: "#4E1D29",
    fontSize: 13,
    fontWeight: "800",
  },

  activitySubtitle: {
    color: "#958079",
    fontSize: 10,
    marginTop: 4,
  },

  activityTime: {
    color: "#AA9790",
    fontSize: 9,
  },

  // =======================================================
  // EMPTY / LOADING
  // =======================================================

  loadingCard: {
    backgroundColor: "#FFFFFF",
    minHeight: 80,
    borderRadius: 18,
    alignItems: "center",
    justifyContent:
      "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1E6E2",
  },

  loadingText: {
    color: "#8E7A74",
    fontSize: 11,
    marginTop: 8,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    justifyContent:
      "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1E6E2",
  },

  emptyTitle: {
    color: "#604A44",
    fontSize: 13,
    fontWeight: "800",
  },

  emptySubtitle: {
    color: "#9C8982",
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  bottomSpace: {
    height: 40,
  },
});