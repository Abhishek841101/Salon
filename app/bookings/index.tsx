
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";

import {
  getBookings,
  confirmBooking,
  completeBooking,
  cancelBooking,
} from "../../src/features/booking/bookingSlice";

/* =========================================================
   TYPES
========================================================= */

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

type FilterType =
  | "ALL"
  | "PENDING"
  | "UPCOMING"
  | "COMPLETED"
  | "CANCELLED";

type Booking = {
  _id?: string;
  id?: string;
  bookingId?: string;

  clientName: string;
  phone: string;

  service: string;

  date: string;

  time: string;
  endTime: string;

  price: number;

  status: BookingStatus;

  duration: string;

  stylist: string;
};

/* =========================================================
   STATUS
========================================================= */

const normalizeStatus = (
  status: unknown
): BookingStatus => {
  const value = String(
    status || "PENDING"
  ).toUpperCase();

  if (
    value === "PENDING" ||
    value === "CONFIRMED" ||
    value === "COMPLETED" ||
    value === "CANCELLED"
  ) {
    return value;
  }

  return "PENDING";
};

/* =========================================================
   DATE HELPERS
========================================================= */

/*
  IMPORTANT:

  Backend sends:

  2026-09-21T18:30:00.000Z

  India timezone:
  2026-09-22 12:00 AM

  So we MUST parse the Date and use local
  getFullYear/getMonth/getDate.

  Do NOT take the first 10 chars directly.
*/

const getDateValue = (
  booking: any
): string => {
  const value =
    booking?.date ||
    booking?.appointmentDate ||
    booking?.bookingDate ||
    booking?.scheduledDate;

  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =========================================================
   TIME FORMAT
========================================================= */

const formatTime = (
  value: unknown
): string => {
  if (!value) {
    return "--";
  }

  const raw = String(value).trim();

  if (!raw) {
    return "--";
  }

  // Already formatted:
  // 10:30 AM
  // 03:00 PM
  if (/[AP]M/i.test(raw)) {
    return raw;
  }

  const match = raw.match(
    /(\d{1,2}):(\d{2})/
  );

  if (!match) {
    return raw;
  }

  const hours = Number(match[1]);
  const minutes = match[2];

  const suffix =
    hours >= 12 ? "PM" : "AM";

  const displayHour =
    hours % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
};

/* =========================================================
   BOOKING MAPPER
========================================================= */

const mapBooking = (
  item: any
): Booking => {
  const client =
    item?.client ||
    item?.customer ||
    item?.user ||
    item?.clientId ||
    {};

  const service =
    item?.service ||
    item?.serviceDetails ||
    item?.serviceId ||
    {};

  const stylist =
    item?.stylist ||
    item?.staff ||
    item?.stylistDetails ||
    {};

  const clientName =
    item?.clientName ||
    item?.customerName ||
    client?.name ||
    `${client?.firstName || ""} ${
      client?.lastName || ""
    }`.trim() ||
    "Unknown Client";

  const phone =
    item?.phone ||
    item?.clientPhone ||
    item?.customerPhone ||
    client?.phone ||
    client?.mobile ||
    "";

  const serviceName =
    item?.serviceName ||
    service?.name ||
    service?.title ||
    "Salon Service";

  const price = Number(
    item?.price ??
      item?.totalAmount ??
      item?.amount ??
      service?.price ??
      0
  );

  const duration =
    item?.duration ??
    item?.serviceDuration ??
    service?.duration ??
    "—";

  const startTime =
    item?.startTime ||
    item?.time ||
    item?.appointmentTime ||
    item?.bookingTime ||
    item?.scheduledTime ||
    "";

  const endTime =
    item?.endTime || "";

  const stylistName =
    stylist?.name ||
    stylist?.fullName ||
    "Not assigned";

  return {
    ...item,

    _id: item?._id,

    id:
      item?.id ||
      item?._id ||
      item?.bookingId,

    bookingId:
      item?.bookingId,

    clientName,

    phone: String(phone),

    service: serviceName,

    /*
      FIXED DATE HANDLING
    */
    date: getDateValue(item),

    time: formatTime(startTime),

    endTime: formatTime(endTime),

    price:
      Number.isFinite(price)
        ? price
        : 0,

    status:
      normalizeStatus(
        item?.status
      ),

    duration: String(duration),

    stylist: String(
      stylistName
    ),
  };
};

/* =========================================================
   CALENDAR HELPERS
========================================================= */

const getDateKey = (
  date: Date
): string => {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (
  date: Date
): string => {
  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const getDayName = (
  date: Date
): string => {
  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
    }
  );
};

const createCalendarDates = () => {
  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  return Array.from(
    { length: 14 },
    (_, index) => {
      const date =
        new Date(today);

      date.setDate(
        today.getDate() +
          index
      );

      return date;
    }
  );
};

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function BookingsScreen() {
  const dispatch =
    useDispatch<any>();

  /* =======================================================
     REDUX
  ======================================================= */

  const bookingsFromStore =
    useSelector(
      (state: any) =>
        state.booking?.bookings || []
    );

  const loading =
    useSelector(
      (state: any) =>
        state.booking?.loading ||
        false
    );

  const error =
    useSelector(
      (state: any) =>
        state.booking?.error ||
        null
    );

  const confirming =
    useSelector(
      (state: any) =>
        state.booking?.confirming ||
        false
    );

  const completing =
    useSelector(
      (state: any) =>
        state.booking?.completing ||
        false
    );

  const cancelling =
    useSelector(
      (state: any) =>
        state.booking?.cancelling ||
        false
    );

  /* =======================================================
     LOCAL STATE
  ======================================================= */

  const calendarDates =
    useMemo(
      () =>
        createCalendarDates(),
      []
    );

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    getDateKey(today)
  );

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<FilterType>(
      "ALL"
    );

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  /* =======================================================
     MAP REAL BACKEND DATA
  ======================================================= */

  const localBookings =
    useMemo(() => {
      if (
        !Array.isArray(
          bookingsFromStore
        )
      ) {
        return [];
      }

      return bookingsFromStore.map(
        mapBooking
      );
    }, [bookingsFromStore]);

  /* =======================================================
     LOAD BOOKINGS
  ======================================================= */

  const loadBookings =
    useCallback(
      async () => {
        try {
          await dispatch(
            getBookings()
          ).unwrap();
        } catch (error) {
          console.error(
            "LOAD BOOKINGS ERROR:",
            error
          );
        }
      },
      [dispatch]
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(
      async () => {
        try {
          setRefreshing(true);

          await dispatch(
            getBookings()
          ).unwrap();
        } catch (error) {
          console.error(
            "REFRESH BOOKINGS ERROR:",
            error
          );
        } finally {
          setRefreshing(false);
        }
      },
      [dispatch]
    );

  /* =======================================================
     SELECTED DATE BOOKINGS
  ======================================================= */

  const selectedDateBookings =
    useMemo(() => {
      return localBookings.filter(
        (booking) =>
          booking.date ===
          selectedDate
      );
    }, [
      localBookings,
      selectedDate,
    ]);

  /* =======================================================
     FILTERED BOOKINGS
  ======================================================= */

  const visibleBookings =
    useMemo(() => {
      switch (activeFilter) {
        case "PENDING":
          return selectedDateBookings.filter(
            (booking) =>
              booking.status ===
              "PENDING"
          );

        case "UPCOMING":
          return selectedDateBookings.filter(
            (booking) =>
              booking.status ===
              "CONFIRMED"
          );

        case "COMPLETED":
          return selectedDateBookings.filter(
            (booking) =>
              booking.status ===
              "COMPLETED"
          );

        case "CANCELLED":
          return selectedDateBookings.filter(
            (booking) =>
              booking.status ===
              "CANCELLED"
          );

        default:
          return selectedDateBookings;
      }
    }, [
      activeFilter,
      selectedDateBookings,
    ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const pendingCount =
    selectedDateBookings.filter(
      (booking) =>
        booking.status ===
        "PENDING"
    ).length;

  const upcomingCount =
    selectedDateBookings.filter(
      (booking) =>
        booking.status ===
        "CONFIRMED"
    ).length;

  const completedCount =
    selectedDateBookings.filter(
      (booking) =>
        booking.status ===
        "COMPLETED"
    ).length;

  const cancelledCount =
    selectedDateBookings.filter(
      (booking) =>
        booking.status ===
        "CANCELLED"
    ).length;

  /* =======================================================
     BOOKING ID
  ======================================================= */

  const getBookingId =
    (booking: Booking) =>
      booking._id ||
      booking.id ||
      booking.bookingId ||
      "";

  /* =======================================================
     CONFIRM
  ======================================================= */

  const handleConfirm =
    async (
      booking: Booking
    ) => {
      const bookingId =
        getBookingId(booking);

      if (!bookingId) {
        Alert.alert(
          "Error",
          "Booking ID is missing."
        );

        return;
      }

      try {
        await dispatch(
          confirmBooking(
            bookingId
          )
        ).unwrap();

        await loadBookings();

        Alert.alert(
          "Confirmed",
          "Appointment confirmed successfully."
        );
      } catch (actionError) {
        Alert.alert(
          "Confirm failed",
          String(
            actionError ||
              "Unable to confirm appointment."
          )
        );
      }
    };

  /* =======================================================
     COMPLETE
  ======================================================= */

  const handleComplete =
    async (
      booking: Booking
    ) => {
      const bookingId =
        getBookingId(booking);

      if (!bookingId) {
        Alert.alert(
          "Error",
          "Booking ID is missing."
        );

        return;
      }

      try {
        await dispatch(
          completeBooking(
            bookingId
          )
        ).unwrap();

        await loadBookings();

        Alert.alert(
          "Completed",
          "Appointment marked as completed."
        );
      } catch (actionError) {
        Alert.alert(
          "Complete failed",
          String(
            actionError ||
              "Unable to complete appointment."
          )
        );
      }
    };

  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancel =
    (
      booking: Booking
    ) => {
      const bookingId =
        getBookingId(booking);

      if (!bookingId) {
        Alert.alert(
          "Error",
          "Booking ID is missing."
        );

        return;
      }

      Alert.alert(
        "Cancel Appointment",
        "Are you sure you want to cancel this appointment?",
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Cancel Appointment",
            style: "destructive",

            onPress:
              async () => {
                try {
                  await dispatch(
                    cancelBooking({
                      bookingId,
                      reason:
                        "Cancelled by admin",
                    })
                  ).unwrap();

                  await loadBookings();

                  Alert.alert(
                    "Cancelled",
                    "Appointment cancelled successfully."
                  );
                } catch (
                  actionError
                ) {
                  Alert.alert(
                    "Cancel failed",
                    String(
                      actionError ||
                        "Unable to cancel appointment."
                    )
                  );
                }
              },
          },
        ]
      );
    };

  const isActionLoading =
    confirming ||
    completing ||
    cancelling;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View
      style={styles.container}
    >
      <StatusBar
        style="dark"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
          />
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={styles.header}
        >
          <View>
            

            <Text
              style={
                styles.headerTitle
              }
            >
              Appointments
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Manage your salon
              bookings
            </Text>
          </View>

          <Pressable
            style={
              styles.newBookingButton
            }
            onPress={() =>
              router.push(
                "/booking"
              )
            }
          >
            <Text
              style={
                styles.newBookingPlus
              }
            >
              +
            </Text>

            <Text
              style={
                styles.newBookingText
              }
            >
              New
            </Text>
          </Pressable>
        </View>

        {/* =================================================
            CALENDAR
        ================================================= */}

        <View
          style={
            styles.dateSectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Calendar
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              {formatDate(
                new Date(
                  `${selectedDate}T00:00:00`
                )
              )}
            </Text>
          </View>

          <View
            style={
              styles.todayBadge
            }
          >
            <Text
              style={
                styles.todayBadgeText
              }
            >
              TODAY
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.dateList
          }
        >
          {calendarDates.map(
            (date) => {
              const dateKey =
                getDateKey(date);

              const active =
                dateKey ===
                selectedDate;

              const appointmentCount =
                localBookings.filter(
                  (booking) =>
                    booking.date ===
                      dateKey &&
                    booking.status !==
                      "CANCELLED"
                ).length;

              return (
                <Pressable
                  key={dateKey}
                  onPress={() => {
                    setSelectedDate(
                      dateKey
                    );

                    setActiveFilter(
                      "ALL"
                    );
                  }}
                  style={[
                    styles.dateCard,
                    active &&
                      styles.dateCardActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      active &&
                        styles.dateDayActive,
                    ]}
                  >
                    {getDayName(
                      date
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.dateNumber,
                      active &&
                        styles.dateNumberActive,
                    ]}
                  >
                    {date.getDate()}
                  </Text>

                  <Text
                    style={[
                      styles.dateMonth,
                      active &&
                        styles.dateMonthActive,
                    ]}
                  >
                    {date.toLocaleDateString(
                      "en-IN",
                      {
                        month:
                          "short",
                      }
                    )}
                  </Text>

                  {appointmentCount >
                    0 && (
                    <View
                      style={[
                        styles.dateDot,
                        active &&
                          styles.dateDotActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateDotText,
                          active &&
                            styles.dateDotTextActive,
                        ]}
                      >
                        {
                          appointmentCount
                        }
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            }
          )}
        </ScrollView>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <View
          style={
            styles.summaryRow
          }
        >
          <SummaryCard
            value={String(
              selectedDateBookings.length
            )}
            label="Total"
            icon="▣"
          />

          <SummaryCard
            value={String(
              pendingCount
            )}
            label="Pending"
            icon="◷"
          />

          <SummaryCard
            value={String(
              upcomingCount
            )}
            label="Upcoming"
            icon="✓"
          />

          <SummaryCard
            value={String(
              completedCount
            )}
            label="Done"
            icon="★"
          />
        </View>

        {/* =================================================
            TODAY / SELECTED DATE
        ================================================= */}

        <View
          style={
            styles.filterHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Appointments
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              {visibleBookings.length}{" "}
              appointment
              {visibleBookings.length ===
              1
                ? ""
                : "s"}
            </Text>
          </View>
        </View>

        {/* =================================================
            FILTERS
        ================================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filterList
          }
        >
          <FilterButton
            title={`All ${selectedDateBookings.length}`}
            active={
              activeFilter ===
              "ALL"
            }
            onPress={() =>
              setActiveFilter(
                "ALL"
              )
            }
          />

          <FilterButton
            title={`Pending ${pendingCount}`}
            active={
              activeFilter ===
              "PENDING"
            }
            onPress={() =>
              setActiveFilter(
                "PENDING"
              )
            }
          />

          <FilterButton
            title={`Upcoming ${upcomingCount}`}
            active={
              activeFilter ===
              "UPCOMING"
            }
            onPress={() =>
              setActiveFilter(
                "UPCOMING"
              )
            }
          />

          <FilterButton
            title={`Completed ${completedCount}`}
            active={
              activeFilter ===
              "COMPLETED"
            }
            onPress={() =>
              setActiveFilter(
                "COMPLETED"
              )
            }
          />

          <FilterButton
            title={`Cancelled ${cancelledCount}`}
            active={
              activeFilter ===
              "CANCELLED"
            }
            onPress={() =>
              setActiveFilter(
                "CANCELLED"
              )
            }
          />
        </ScrollView>

        {/* =================================================
            CONTENT
        ================================================= */}

        {loading &&
        localBookings.length ===
          0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <ActivityIndicator
              size="small"
              color="#70253B"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              Loading appointments...
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Fetching the latest
              bookings from the
              server.
            </Text>
          </View>
        ) : error &&
          localBookings.length ===
            0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Text
                style={
                  styles.emptyIconText
                }
              >
                !
              </Text>
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Unable to load
              bookings
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              {String(error)}
            </Text>

            <Pressable
              style={
                styles.emptyButton
              }
              onPress={
                loadBookings
              }
            >
              <Text
                style={
                  styles.emptyButtonText
                }
              >
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : visibleBookings.length >
          0 ? (
          <View
            style={
              styles.bookingList
            }
          >
            {visibleBookings.map(
              (booking) => (
                <BookingCard
                  key={getBookingId(
                    booking
                  )}
                  booking={
                    booking
                  }
                  actionLoading={
                    isActionLoading
                  }
                  onConfirm={() =>
                    handleConfirm(
                      booking
                    )
                  }
                  onComplete={() =>
                    handleComplete(
                      booking
                    )
                  }
                  onCancel={() =>
                    handleCancel(
                      booking
                    )
                  }
                />
              )
            )}
          </View>
        ) : (
          <EmptyState
            onCreate={() =>
              router.push(
                "/booking"
              )
            }
          />
        )}

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </View>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: string;
}) {
  return (
    <View
      style={
        styles.summaryCard
      }
    >
      <View
        style={
          styles.summaryIcon
        }
      >
        <Text
          style={
            styles.summaryIconText
          }
        >
          {icon}
        </Text>
      </View>

      <Text
        style={
          styles.summaryValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.summaryLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterButton,
        active &&
          styles.filterButtonActive,
      ]}
    >
      <Text
        style={[
          styles.filterText,
          active &&
            styles.filterTextActive,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   BOOKING CARD
========================================================= */

function BookingCard({
  booking,
  onConfirm,
  onComplete,
  onCancel,
  actionLoading,
}: {
  booking: Booking;
  onConfirm: () => void;
  onComplete: () => void;
  onCancel: () => void;
  actionLoading: boolean;
}) {
  const getStatus =
    () => {
      switch (
        booking.status
      ) {
        case "CONFIRMED":
          return {
            bg: "#E5F0E8",
            text: "#477053",
            label:
              "CONFIRMED",
          };

        case "COMPLETED":
          return {
            bg: "#E5EAF4",
            text: "#536A95",
            label:
              "COMPLETED",
          };

        case "CANCELLED":
          return {
            bg: "#F3E4E3",
            text: "#A15E5E",
            label:
              "CANCELLED",
          };

        default:
          return {
            bg: "#F7E9D9",
            text: "#9A684A",
            label:
              "PENDING",
          };
      }
    };

  const status =
    getStatus();

  return (
    <View
      style={
        styles.bookingCard
      }
    >
      {/* TOP */}

      <View
        style={
          styles.bookingTop
        }
      >
        <View
          style={
            styles.clientAvatar
          }
        >
          <Text
            style={
              styles.clientAvatarText
            }
          >
            {booking.clientName
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View
          style={
            styles.clientInfo
          }
        >
          <Text
            style={
              styles.clientName
            }
          >
            {booking.clientName}
          </Text>

          <Text
            style={
              styles.phone
            }
          >
            {booking.phone ||
              "No phone"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                status.bg,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  status.text,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color:
                  status.text,
              },
            ]}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.divider
        }
      />

      {/* SERVICE */}

      <View
        style={
          styles.serviceRow
        }
      >
        <View
          style={
            styles.serviceIcon
          }
        >
          <Text
            style={
              styles.serviceIconText
            }
          >
            ✦
          </Text>
        </View>

        <View
          style={
            styles.serviceInfo
          }
        >
          <Text
            style={
              styles.serviceLabel
            }
          >
            SERVICE
          </Text>

          <Text
            style={
              styles.serviceName
            }
          >
            {booking.service}
          </Text>
        </View>

        <Text
          style={
            styles.price
          }
        >
          ₹{booking.price}
        </Text>
      </View>

      {/* DATE / TIME */}

      <View
        style={
          styles.detailsRow
        }
      >
        <View
          style={
            styles.detailItem
          }
        >
          <Text
            style={
              styles.detailIcon
            }
          >
            ◷
          </Text>

          <View>
            <Text
              style={
                styles.detailLabel
              }
            >
              TIME
            </Text>

            <Text
              style={
                styles.detailValue
              }
            >
              {booking.time}
              {booking.endTime !==
                "--" &&
                booking.endTime
                  ? ` - ${booking.endTime}`
                  : ""}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.detailItem
          }
        >
          <Text
            style={
              styles.detailIcon
            }
          >
            ⏱
          </Text>

          <View>
            <Text
              style={
                styles.detailLabel
              }
            >
              DURATION
            </Text>

            <Text
              style={
                styles.detailValue
              }
            >
              {booking.duration}
              {booking.duration !==
                "—"
                ? " min"
                : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* STYLIST */}

      <View
        style={
          styles.stylistRow
        }
      >
        <Text
          style={
            styles.detailLabel
          }
        >
          STYLIST
        </Text>

        <Text
          style={
            styles.stylistValue
          }
        >
          {booking.stylist}
        </Text>
      </View>

      {/* BOOKING ID */}

      <View
        style={
          styles.bookingIdRow
        }
      >
        <Text
          style={
            styles.bookingIdLabel
          }
        >
          BOOKING ID
        </Text>

        <Text
          style={
            styles.bookingId
          }
        >
          {booking.id}
        </Text>
      </View>

      {/* ACTIONS */}

      {booking.status ===
        "PENDING" && (
        <View
          style={
            styles.actionRow
          }
        >
          <Pressable
            style={[
              styles.cancelButton,
              actionLoading &&
                {
                  opacity: 0.5,
                },
            ]}
            onPress={
              onCancel
            }
            disabled={
              actionLoading
            }
          >
            <Text
              style={
                styles.cancelButtonText
              }
            >
              Cancel
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.confirmButton,
              actionLoading &&
                {
                  opacity: 0.5,
                },
            ]}
            onPress={
              onConfirm
            }
            disabled={
              actionLoading
            }
          >
            <Text
              style={
                styles.confirmButtonText
              }
            >
              Confirm Appointment
            </Text>
          </Pressable>
        </View>
      )}

      {booking.status ===
        "CONFIRMED" && (
        <View
          style={
            styles.actionRow
          }
        >
          <Pressable
            style={[
              styles.cancelButton,
              actionLoading &&
                {
                  opacity: 0.5,
                },
            ]}
            onPress={
              onCancel
            }
            disabled={
              actionLoading
            }
          >
            <Text
              style={
                styles.cancelButtonText
              }
            >
              Cancel
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.completeButton,
              actionLoading &&
                {
                  opacity: 0.5,
                },
            ]}
            onPress={
              onComplete
            }
            disabled={
              actionLoading
            }
          >
            <Text
              style={
                styles.completeButtonText
              }
            >
              ✓ Mark Completed
            </Text>
          </Pressable>
        </View>
      )}

      {booking.status ===
        "COMPLETED" && (
        <Pressable
          style={
            styles.billButton
          }
          onPress={() =>
            router.push(
              "/billing"
            )
          }
        >
          <Text
            style={
              styles.billButtonIcon
            }
          >
            ₹
          </Text>

          <View
            style={
              styles.billButtonInfo
            }
          >
            <Text
              style={
                styles.billButtonTitle
              }
            >
              Service Completed
            </Text>

            <Text
              style={
                styles.billButtonSubtitle
              }
            >
              Generate bill &
              send invoice
            </Text>
          </View>

          <Text
            style={
              styles.billArrow
            }
          >
            →
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <View
      style={
        styles.emptyCard
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <Text
          style={
            styles.emptyIconText
          }
        >
          ◷
        </Text>
      </View>

      <Text
        style={
          styles.emptyTitle
        }
      >
        No appointments
      </Text>

      <Text
        style={
          styles.emptyText
        }
      >
        There are no appointments
        matching this date and
        filter.
      </Text>

      <Pressable
        style={
          styles.emptyButton
        }
        onPress={onCreate}
      >
        <Text
          style={
            styles.emptyButtonText
          }
        >
          + New Booking
        </Text>
      </Pressable>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FCF7F4",
    },

    content: {
      paddingHorizontal: 19,
      paddingTop: 40,
      paddingBottom: 30,
    },

    /* HEADER */

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 22,
    },

    headerSmall: {
      color: "#A18E94",
      fontSize: 7,
      fontWeight: "900",
      letterSpacing: 2,
    },

    headerTitle: {
      color: "#30272A",
      fontSize: 29,
      fontFamily: "serif",
      fontWeight: "600",
      marginTop: 3,
    },

    headerSubtitle: {
      color: "#95878B",
      fontSize: 9,
      marginTop: 3,
    },

    newBookingButton: {
      height: 46,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor:
        "#70253B",
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    newBookingPlus: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "400",
    },

    newBookingText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "800",
    },

    /* SECTION */

    dateSectionHeader: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent:
        "space-between",
      marginBottom: 12,
    },

    sectionTitle: {
      color: "#30272A",
      fontSize: 21,
      fontFamily: "serif",
      fontWeight: "600",
    },

    sectionSubtitle: {
      color: "#978A8E",
      fontSize: 8,
      marginTop: 3,
    },

    todayBadge: {
      backgroundColor:
        "#F0DFDC",
      borderRadius: 10,
      paddingHorizontal: 9,
      paddingVertical: 5,
    },

    todayBadgeText: {
      color: "#70253B",
      fontSize: 6.5,
      fontWeight: "900",
      letterSpacing: 0.8,
    },

    /* DATES */

    dateList: {
      paddingBottom: 8,
      gap: 8,
    },

    dateCard: {
      width: 64,
      height: 91,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        "#F0E6E3",
    },

    dateCardActive: {
      backgroundColor:
        "#70253B",
      borderColor:
        "#70253B",
    },

    dateDay: {
      color: "#A19598",
      fontSize: 7,
      fontWeight: "800",
      textTransform:
        "uppercase",
    },

    dateDayActive: {
      color: "#E8C8CE",
    },

    dateNumber: {
      color: "#332A2D",
      fontSize: 24,
      fontWeight: "800",
      marginTop: 2,
    },

    dateNumberActive: {
      color: "#FFFFFF",
    },

    dateMonth: {
      color: "#A19598",
      fontSize: 7,
      fontWeight: "700",
    },

    dateMonthActive: {
      color: "#E8C8CE",
    },

    dateDot: {
      minWidth: 17,
      height: 17,
      borderRadius: 9,
      paddingHorizontal: 4,
      backgroundColor:
        "#F0E1DD",
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 4,
    },

    dateDotActive: {
      backgroundColor:
        "rgba(255,255,255,0.18)",
    },

    dateDotText: {
      color: "#70253B",
      fontSize: 7,
      fontWeight: "900",
    },

    dateDotTextActive: {
      color: "#FFFFFF",
    },

    /* SUMMARY */

    summaryRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginTop: 18,
      marginBottom: 25,
    },

    summaryCard: {
      width: "23.5%",
      minHeight: 94,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 17,
      padding: 9,
      justifyContent:
        "center",
    },

    summaryIcon: {
      width: 27,
      height: 27,
      borderRadius: 9,
      backgroundColor:
        "#F5E6E3",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 5,
    },

    summaryIconText: {
      color: "#70253B",
      fontSize: 12,
      fontWeight: "800",
    },

    summaryValue: {
      color: "#352A2E",
      fontSize: 20,
      fontWeight: "900",
    },

    summaryLabel: {
      color: "#9A8D91",
      fontSize: 7,
      marginTop: 1,
    },

    /* FILTER */

    filterHeader: {
      marginBottom: 10,
    },

    filterList: {
      gap: 7,
      paddingBottom: 14,
    },

    filterButton: {
      height: 34,
      paddingHorizontal: 13,
      borderRadius: 12,
      backgroundColor:
        "#F1E6E3",
      justifyContent:
        "center",
    },

    filterButtonActive: {
      backgroundColor:
        "#70253B",
    },

    filterText: {
      color: "#88797E",
      fontSize: 8,
      fontWeight: "800",
    },

    filterTextActive: {
      color: "#FFFFFF",
    },

    /* LIST */

    bookingList: {
      gap: 14,
    },

    /* CARD */

    bookingCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 23,
      padding: 16,
      elevation: 3,
      shadowColor:
        "#3D2029",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.05,
      shadowRadius: 9,
    },

    bookingTop: {
      flexDirection: "row",
      alignItems: "center",
    },

    clientAvatar: {
      width: 49,
      height: 49,
      borderRadius: 17,
      backgroundColor:
        "#F1DEDB",
      alignItems: "center",
      justifyContent:
        "center",
    },

    clientAvatarText: {
      color: "#70253B",
      fontSize: 17,
      fontWeight: "900",
    },

    clientInfo: {
      flex: 1,
      marginLeft: 11,
    },

    clientName: {
      color: "#332A2D",
      fontSize: 13,
      fontWeight: "900",
    },

    phone: {
      color: "#988A8E",
      fontSize: 8,
      marginTop: 4,
    },

    statusBadge: {
      height: 25,
      borderRadius: 13,
      paddingHorizontal: 8,
      flexDirection: "row",
      alignItems: "center",
    },

    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      marginRight: 5,
    },

    statusText: {
      fontSize: 6.5,
      fontWeight: "900",
      letterSpacing: 0.5,
    },

    divider: {
      height: 1,
      backgroundColor:
        "#EEE6E3",
      marginVertical: 15,
    },

    serviceRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    serviceIcon: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor:
        "#F6E8E5",
      alignItems: "center",
      justifyContent:
        "center",
    },

    serviceIconText: {
      color: "#70253B",
      fontSize: 16,
    },

    serviceInfo: {
      flex: 1,
      marginLeft: 10,
    },

    serviceLabel: {
      color: "#A3989B",
      fontSize: 6.5,
      fontWeight: "900",
      letterSpacing: 1,
    },

    serviceName: {
      color: "#403437",
      fontSize: 11,
      fontWeight: "800",
      marginTop: 3,
    },

    price: {
      color: "#70253B",
      fontSize: 14,
      fontWeight: "900",
    },

    detailsRow: {
      flexDirection: "row",
      marginTop: 15,
      gap: 20,
    },

    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    detailIcon: {
      color: "#70253B",
      fontSize: 14,
      marginRight: 7,
    },

    detailLabel: {
      color: "#A3979A",
      fontSize: 6,
      fontWeight: "900",
      letterSpacing: 0.8,
    },

    detailValue: {
      color: "#4B3D41",
      fontSize: 9,
      fontWeight: "800",
      marginTop: 2,
    },

    stylistRow: {
      marginTop: 13,
      paddingTop: 11,
      borderTopWidth: 1,
      borderTopColor:
        "#EEE6E3",
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    stylistValue: {
      color: "#4B3D41",
      fontSize: 8,
      fontWeight: "800",
    },

    bookingIdRow: {
      marginTop: 14,
      paddingTop: 11,
      borderTopWidth: 1,
      borderTopColor:
        "#EEE6E3",
      flexDirection: "row",
      justifyContent:
        "space-between",
    },

    bookingIdLabel: {
      color: "#A59A9D",
      fontSize: 6,
      fontWeight: "900",
      letterSpacing: 0.8,
    },

    bookingId: {
      color: "#716266",
      fontSize: 7,
      fontWeight: "800",
      maxWidth: 180,
    },

    /* ACTIONS */

    actionRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 13,
    },

    cancelButton: {
      flex: 0.8,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#F5EAEA",
      alignItems: "center",
      justifyContent:
        "center",
    },

    cancelButtonText: {
      color: "#9A5E5E",
      fontSize: 8,
      fontWeight: "800",
    },

    confirmButton: {
      flex: 1.6,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#70253B",
      alignItems: "center",
      justifyContent:
        "center",
    },

    confirmButtonText: {
      color: "#FFFFFF",
      fontSize: 8,
      fontWeight: "800",
    },

    completeButton: {
      flex: 1.6,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#52745D",
      alignItems: "center",
      justifyContent:
        "center",
    },

    completeButtonText: {
      color: "#FFFFFF",
      fontSize: 8,
      fontWeight: "800",
    },

    /* BILL */

    billButton: {
      marginTop: 13,
      minHeight: 58,
      borderRadius: 17,
      backgroundColor:
        "#F2E3E0",
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
    },

    billButtonIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor:
        "#70253B",
      color: "#FFFFFF",
      textAlign: "center",
      textAlignVertical:
        "center",
      fontSize: 16,
      fontWeight: "900",
    },

    billButtonInfo: {
      flex: 1,
      marginLeft: 9,
    },

    billButtonTitle: {
      color: "#70253B",
      fontSize: 9,
      fontWeight: "900",
    },

    billButtonSubtitle: {
      color: "#927D82",
      fontSize: 7,
      marginTop: 3,
    },

    billArrow: {
      color: "#70253B",
      fontSize: 18,
      fontWeight: "700",
    },

    /* EMPTY */

    emptyCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 23,
      paddingHorizontal: 25,
      paddingVertical: 38,
      alignItems: "center",
    },

    emptyIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor:
        "#F3E3E0",
      alignItems: "center",
      justifyContent:
        "center",
    },

    emptyIconText: {
      color: "#70253B",
      fontSize: 24,
    },

    emptyTitle: {
      color: "#382D31",
      fontSize: 18,
      fontFamily: "serif",
      fontWeight: "600",
      marginTop: 14,
      textAlign: "center",
    },

    emptyText: {
      color: "#95878B",
      fontSize: 9,
      lineHeight: 15,
      textAlign: "center",
      marginTop: 6,
      maxWidth: 280,
    },

    emptyButton: {
      marginTop: 16,
      backgroundColor:
        "#70253B",
      borderRadius: 14,
      paddingHorizontal: 17,
      paddingVertical: 10,
    },

    emptyButtonText: {
      color: "#FFFFFF",
      fontSize: 8,
      fontWeight: "800",
    },

    bottomSpace: {
      height: 20,
    },
  });