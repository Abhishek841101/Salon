


import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import { useDispatch } from "react-redux";

import {
  deleteStylist,
  getStylistProfile,
  getStylistAttendance,
  getAttendanceSummary,

  type Stylist,
  type StylistProfile,
  type StylistAttendance,
  type AttendanceSummary,
} from "../../src/features/stylist/stylistSlice";

type AppDispatch = any;

const money = (
  value: any
) => {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN")}`;
};

const formatTime = (
  value?: string | null
) => {
  if (!value) {
    return "--:--";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
};

const formatDate = (
  value?: string
) => {
  if (!value) {
    return "--";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export default function StaffProfileScreen() {
  const dispatch =
    useDispatch<AppDispatch>();

  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const id = Array.isArray(
    params.id
  )
    ? params.id[0]
    : params.id;

  const [staff, setStaff] =
    useState<Stylist | null>(
      null
    );

  const [profile, setProfile] =
    useState<StylistProfile | null>(
      null
    );

  const [attendance, setAttendance] =
    useState<StylistAttendance[]>(
      []
    );

  const [summary, setSummary] =
    useState<AttendanceSummary | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  // =====================================================
  // DATE
  // =====================================================

  const formatDateKey = (
    date: Date
  ) => {
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

  const today =
    formatDateKey(
      new Date()
    );

  const firstDayOfMonth =
    formatDateKey(
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
    );

  // =====================================================
  // LOAD
  // =====================================================

  const loadProfile =
    useCallback(async () => {
      if (!id) {
        setLoading(false);

        Alert.alert(
          "Error",
          "Staff ID is missing."
        );

        return;
      }

      try {
        setLoading(true);

        const profileResult =
          await dispatch(
            getStylistProfile({
              id,
              period: "month",
            })
          ).unwrap();

        const loadedProfile =
          profileResult
            ?.data ||
          profileResult;

        setProfile(
          loadedProfile
        );

        setStaff(
          loadedProfile
            ?.stylist ||
            null
        );

        // ================================================
        // ATTENDANCE HISTORY
        // ================================================

        const attendanceResult =
          await dispatch(
            getStylistAttendance({
              stylistId: id,
              startDate:
                firstDayOfMonth,
              endDate: today,
            })
          ).unwrap();

        setAttendance(
          attendanceResult
            ?.attendance ||
            []
        );

        // ================================================
        // ATTENDANCE SUMMARY
        // ================================================

        const summaryResult =
          await dispatch(
            getAttendanceSummary({
              stylistId: id,
              startDate:
                firstDayOfMonth,
              endDate: today,
            })
          ).unwrap();

        setSummary(
          summaryResult?.summary ||
            null
        );
      } catch (error: any) {
        console.log(
          "STAFF PROFILE ERROR:",
          error
        );

        Alert.alert(
          "Error",
          String(
            error ||
              "Failed to load staff profile"
          )
        );
      } finally {
        setLoading(false);
      }
    }, [
      dispatch,
      id,
      firstDayOfMonth,
      today,
    ]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  // =====================================================
  // REFRESH
  // =====================================================

  const refresh =
    async () => {
      try {
        setRefreshing(true);

        await loadProfile();
      } finally {
        setRefreshing(false);
      }
    };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete =
    () => {
      if (!staff?._id) {
        return;
      }

      Alert.alert(
        "Delete Staff",
        `Are you sure you want to delete ${staff.name}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },

          {
            text: "Delete",
            style: "destructive",

            onPress:
              async () => {
                try {
                  await dispatch(
                    deleteStylist(
                      staff._id
                    )
                  ).unwrap();

                  router.replace(
                    "/staff"
                  );
                } catch (
                  error: any
                ) {
                  Alert.alert(
                    "Error",
                    String(
                      error ||
                        "Failed to delete staff"
                    )
                  );
                }
              },
          },
        ]
      );
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading &&
    !staff
  ) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F8F2EF"
        />

        <View
          style={
            styles.loader
          }
        >
          <ActivityIndicator
            size="large"
            color="#7E243A"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading staff profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // EMPTY
  // =====================================================

  if (!staff) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={styles.empty}
        >
          <Text
            style={
              styles.emptyTitle
            }
          >
            Staff not found
          </Text>

          <Pressable
            style={
              styles.primaryButton
            }
            onPress={() =>
              router.replace(
                "/staff"
              )
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Back to Staff
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const stats =
    profile?.stats;

  const salary =
    profile?.salary;

  const active =
    staff.status ===
    "ACTIVE";

  const experience =
    Number(
      staff.experience || 0
    );

  const initial =
    staff.name
      ?.charAt(0)
      ?.toUpperCase() ||
    "S";

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#7E243A"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              refresh
            }
            colors={[
              "#7E243A",
            ]}
          />
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* =================================================
            HERO
        ================================================= */}

        <View
          style={styles.hero}
        >
          <Pressable
            style={
              styles.heroBack
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.heroBackText
              }
            >
              ‹
            </Text>
          </Pressable>

          <View
            style={
              styles.heroAvatar
            }
          >
            <Text
              style={
                styles.heroAvatarText
              }
            >
              {initial}
            </Text>
          </View>

          <Text
            style={
              styles.heroName
            }
          >
            {staff.name}
          </Text>

          <Text
            style={
              styles.heroSpecialization
            }
          >
            {staff.specialization ||
              "Beauty Professional"}
          </Text>

          <View
            style={[
              styles.heroStatus,
              active
                ? styles.heroActive
                : styles.heroInactive,
            ]}
          >
            <Text
              style={
                styles.heroStatusText
              }
            >
              {active
                ? "ACTIVE"
                : "INACTIVE"}
            </Text>
          </View>
        </View>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <View
          style={styles.actionRow}
        >
          <Pressable
            style={
              styles.editButton
            }
            onPress={() =>
              router.push(
                `/staff/add?id=${staff._id}`
              )
            }
          >
            <Text
              style={
                styles.editText
              }
            >
              Edit Staff
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.deleteButton
            }
            onPress={
              handleDelete
            }
          >
            <Text
              style={
                styles.deleteText
              }
            >
              Delete
            </Text>
          </Pressable>
        </View>

        {/* =================================================
            QUICK STATS
        ================================================= */}

        <View
          style={styles.grid}
        >
          <StatCard
            label="Experience"
            value={`${experience} yr`}
          />

          <StatCard
            label="Services"
            value={String(
              stats
                ?.completedServices ||
                0
            )}
          />

          <StatCard
            label="Clients"
            value={String(
              stats
                ?.totalClients ||
                0
            )}
          />

          <StatCard
            label="Revenue"
            value={money(
              stats
                ?.totalRevenue
            )}
          />
        </View>

        {/* =================================================
            SALARY SETTINGS
        ================================================= */}

        <Section
          title="Salary Settings"
        >
          <InfoRow
            label="Salary Type"
            value={
              staff.salaryType ||
              "MONTHLY"
            }
          />

          <InfoRow
            label="Monthly Salary"
            value={money(
              salary
                ?.monthlySalary ??
                staff.monthlySalary
            )}
          />

          <InfoRow
            label="Basic Salary — 8 Hours"
            value={money(
              salary
                ?.basicSalary8h ??
                staff.basicSalary8h
            )}
          />

          <InfoRow
            label="Overtime / Hour"
            value={money(
              salary
                ?.overtimeRatePerHour ??
                staff.overtimeRatePerHour
            )}
          />

          <InfoRow
            label="Standard Hours"
            value={`${Number(
              salary
                ?.standardWorkingHours ??
                staff.standardWorkingHours ??
                8
            )} hours`}
          />
        </Section>

        {/* =================================================
            THIS MONTH
        ================================================= */}

        <Section
          title="This Month"
        >
          <View
            style={
              styles.summaryGrid
            }
          >
            <SummaryBox
              label="Present"
              value={String(
                summary
                  ?.presentDays ||
                  0
              )}
            />

            <SummaryBox
              label="Absent"
              value={String(
                summary
                  ?.absentDays ||
                  0
              )}
            />

            <SummaryBox
              label="Half Day"
              value={String(
                summary
                  ?.halfDays ||
                  0
              )}
            />

            <SummaryBox
              label="Leave"
              value={String(
                summary
                  ?.leaveDays ||
                  0
              )}
            />
          </View>

          <InfoRow
            label="Worked Hours"
            value={`${Number(
              summary
                ?.totalWorkedHours ||
                0
            ).toFixed(2)} h`}
          />

          <InfoRow
            label="Overtime Hours"
            value={`${Number(
              summary
                ?.totalOvertimeHours ||
                0
            ).toFixed(2)} h`}
          />

          <InfoRow
            label="Basic Salary Earned"
            value={money(
              summary
                ?.basicSalaryEarned
            )}
          />

          <InfoRow
            label="Overtime Salary"
            value={money(
              summary
                ?.overtimeSalary
            )}
          />

          <View
            style={
              styles.totalBox
            }
          >
            <Text
              style={
                styles.totalLabel
              }
            >
              TOTAL SALARY EARNED
            </Text>

            <Text
              style={
                styles.totalValue
              }
            >
              {money(
                summary
                  ?.totalSalaryEarned
              )}
            </Text>
          </View>
        </Section>

        {/* =================================================
            ATTENDANCE HISTORY
        ================================================= */}

        <Section
          title="Attendance History"
        >
          {attendance.length ===
          0 ? (
            <Text
              style={
                styles.noAttendance
              }
            >
              No attendance records
              for this month.
            </Text>
          ) : (
            attendance.map(
              (item) => (
                <AttendanceRow
                  key={
                    item._id
                  }
                  item={
                    item
                  }
                />
              )
            )
          )}
        </Section>

        {/* =================================================
            SERVICES & REVENUE
        ================================================= */}

        <Section
          title="Service & Revenue"
        >
          <InfoRow
            label="Total Appointments"
            value={String(
              stats
                ?.totalAppointments ||
                0
            )}
          />

          <InfoRow
            label="Completed Services"
            value={String(
              stats
                ?.completedServices ||
                0
            )}
          />

          <InfoRow
            label="This Month Services"
            value={String(
              stats
                ?.periodCompletedServices ||
                0
            )}
          />

          <InfoRow
            label="Total Bills"
            value={String(
              stats
                ?.totalBills ||
                0
            )}
          />

          <InfoRow
            label="Total Revenue"
            value={money(
              stats
                ?.totalRevenue
            )}
          />

          <InfoRow
            label="This Month Revenue"
            value={money(
              stats
                ?.periodRevenue
            )}
          />

          <InfoRow
            label="Average Service Value"
            value={money(
              stats
                ?.averageServiceValue
            )}
          />

          <InfoRow
            label="Pending Amount"
            value={money(
              stats
                ?.pendingAmount
            )}
          />
        </Section>

        {/* =================================================
            RECENT SERVICES
        ================================================= */}

        <Section
          title="Recent Services"
        >
          {profile
              ?.recentBookings
              ?.length ? (
            profile.recentBookings.map(
              (
                booking: any
              ) => (
                <View
                  key={
                    booking._id
                  }
                  style={
                    styles.bookingRow
                  }
                >
                  <View
                    style={
                      styles.bookingIcon
                    }
                  >
                    <Text
                      style={
                        styles.bookingIconText
                      }
                    >
                      ✓
                    </Text>
                  </View>

                  <View
                    style={
                      styles.bookingInfo
                    }
                  >
                    <Text
                      style={
                        styles.bookingService
                      }
                    >
                      {booking
                        ?.service
                        ?.name ||
                        "Service"}
                    </Text>

                    <Text
                      style={
                        styles.bookingClient
                      }
                    >
                      {booking
                        ?.client
                        ?.name ||
                        "Client"}
                    </Text>

                    <Text
                      style={
                        styles.bookingDate
                      }
                    >
                      {formatDate(
                        booking.bookingDate
                      )}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.bookingPrice
                    }
                  >
                    {money(
                      booking.price
                    )}
                  </Text>
                </View>
              )
            )
          ) : (
            <Text
              style={
                styles.noAttendance
              }
            >
              No services found.
            </Text>
          )}
        </Section>

        <View
          style={{
            height: 50,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// SECTION
// =====================================================

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={styles.section}
    >
      <Text
        style={
          styles.sectionTitle
        }
      >
        {title}
      </Text>

      {children}
    </View>
  );
}

// =====================================================
// INFO ROW
// =====================================================

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.infoRow}
    >
      <Text
        style={
          styles.infoLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.infoValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

// =====================================================
// STAT
// =====================================================

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.statCard}
    >
      <Text
        style={
          styles.statValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.statLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}

// =====================================================
// SUMMARY
// =====================================================

function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.summaryBox}
    >
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

// =====================================================
// ATTENDANCE ROW
// =====================================================

function AttendanceRow({
  item,
}: {
  item: StylistAttendance;
}) {
  const status =
    item.status;

  return (
    <View
      style={
        styles.attendanceRow
      }
    >
      <View
        style={
          styles.attendanceDate
        }
      >
        <Text
          style={
            styles.attendanceDateText
          }
        >
          {formatDate(
            item.date
          )}
        </Text>
      </View>

      <View
        style={
          styles.attendanceDetails
        }
      >
        <View
          style={
            styles.attendanceTimes
          }
        >
          <Text
            style={
              styles.attendanceTime
            }
          >
            In:{" "}
            {formatTime(
              item.checkIn
            )}
          </Text>

          <Text
            style={
              styles.attendanceTime
            }
          >
            Out:{" "}
            {formatTime(
              item.checkOut
            )}
          </Text>
        </View>

        <Text
          style={
            styles.attendanceHours
          }
        >
          Worked{" "}
          {Number(
            item.workedHours ||
              0
          ).toFixed(2)}
          h
          {"  •  "}
          OT{" "}
          {Number(
            item.overtimeHours ||
              0
          ).toFixed(2)}
          h
        </Text>
      </View>

      <View
        style={[
          styles.attendanceBadge,
          status ===
            "PRESENT" &&
            styles.badgePresent,
          status ===
            "ABSENT" &&
            styles.badgeAbsent,
          status ===
            "HALF_DAY" &&
            styles.badgeHalf,
          status ===
            "LEAVE" &&
            styles.badgeLeave,
        ]}
      >
        <Text
          style={
            styles.attendanceBadgeText
          }
        >
          {status ===
          "HALF_DAY"
            ? "HALF DAY"
            : status}
        </Text>
      </View>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        "#F8F2EF",
    },

    content: {
      paddingBottom: 30,
    },

    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,
      color: "#7E243A",
      fontSize: 13,
    },

    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      padding: 20,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#30272A",
      marginBottom: 15,
    },

    primaryButton: {
      backgroundColor:
        "#7E243A",
      borderRadius: 14,
      paddingHorizontal: 25,
      paddingVertical: 13,
    },

    primaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "800",
    },

    hero: {
      backgroundColor:
        "#7E243A",
      paddingTop: 18,
      paddingBottom: 28,
      alignItems: "center",
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },

    heroBack: {
      position: "absolute",
      left: 15,
      top: 15,
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent:
        "center",
    },

    heroBackText: {
      color: "#FFFFFF",
      fontSize: 28,
    },

    heroAvatar: {
      width: 76,
      height: 76,
      borderRadius: 25,
      backgroundColor:
        "#F4DDE3",
      alignItems: "center",
      justifyContent:
        "center",
    },

    heroAvatarText: {
      color: "#7E243A",
      fontSize: 31,
      fontWeight: "900",
    },

    heroName: {
      marginTop: 12,
      color: "#FFFFFF",
      fontSize: 25,
      fontWeight: "900",
    },

    heroSpecialization: {
      marginTop: 3,
      color:
        "rgba(255,255,255,0.75)",
      fontSize: 12,
    },

    heroStatus: {
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
    },

    heroActive: {
      backgroundColor:
        "rgba(255,255,255,0.18)",
    },

    heroInactive: {
      backgroundColor:
        "rgba(0,0,0,0.15)",
    },

    heroStatusText: {
      color: "#FFFFFF",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1,
    },

    actionRow: {
      flexDirection: "row",
      padding: 15,
      gap: 10,
    },

    editButton: {
      flex: 1,
      height: 46,
      borderRadius: 13,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#7E243A",
      alignItems: "center",
      justifyContent:
        "center",
    },

    editText: {
      color: "#7E243A",
      fontWeight: "800",
    },

    deleteButton: {
      width: 100,
      height: 46,
      borderRadius: 13,
      backgroundColor:
        "#FCEAEC",
      alignItems: "center",
      justifyContent:
        "center",
    },

    deleteText: {
      color: "#A3314C",
      fontWeight: "800",
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent:
        "space-between",
      paddingHorizontal: 15,
    },

    statCard: {
      width: "48%",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 17,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        "#E9DEDA",
    },

    statValue: {
      fontSize: 21,
      fontWeight: "900",
      color: "#7E243A",
    },

    statLabel: {
      marginTop: 5,
      fontSize: 11,
      color: "#918389",
    },

    section: {
      marginHorizontal: 15,
      marginTop: 5,
      marginBottom: 10,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 17,
      borderWidth: 1,
      borderColor:
        "#E9DEDA",
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "900",
      color: "#30272A",
      marginBottom: 12,
    },

    infoRow: {
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F2ECE9",
    },

    infoLabel: {
      flex: 1,
      fontSize: 12,
      color: "#8C7E84",
    },

    infoValue: {
      maxWidth: "55%",
      fontSize: 13,
      fontWeight: "800",
      color: "#30272A",
      textAlign: "right",
    },

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },

    summaryBox: {
      width: "48%",
      backgroundColor:
        "#F9F5F3",
      borderRadius: 14,
      padding: 13,
      marginBottom: 9,
    },

    summaryValue: {
      fontSize: 21,
      fontWeight: "900",
      color: "#7E243A",
    },

    summaryLabel: {
      marginTop: 3,
      fontSize: 10,
      color: "#8E8186",
    },

    totalBox: {
      marginTop: 15,
      backgroundColor:
        "#7E243A",
      borderRadius: 16,
      padding: 17,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    totalLabel: {
      color:
        "rgba(255,255,255,0.75)",
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
    },

    totalValue: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "900",
    },

    noAttendance: {
      color: "#978A8F",
      fontSize: 12,
      textAlign: "center",
      paddingVertical: 10,
    },

    attendanceRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 11,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1EBE8",
    },

    attendanceDate: {
      width: 72,
    },

    attendanceDateText: {
      fontSize: 11,
      fontWeight: "800",
      color: "#30272A",
    },

    attendanceDetails: {
      flex: 1,
      marginLeft: 8,
    },

    attendanceTimes: {
      flexDirection: "row",
      gap: 10,
    },

    attendanceTime: {
      fontSize: 10,
      color: "#74666C",
    },

    attendanceHours: {
      marginTop: 4,
      fontSize: 10,
      color: "#7E243A",
      fontWeight: "700",
    },

    attendanceBadge: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 9,
    },

    badgePresent: {
      backgroundColor:
        "#E7F5EC",
    },

    badgeAbsent: {
      backgroundColor:
        "#FCEAEC",
    },

    badgeHalf: {
      backgroundColor:
        "#FFF3DB",
    },

    badgeLeave: {
      backgroundColor:
        "#ECE9F9",
    },

    attendanceBadgeText: {
      fontSize: 8,
      fontWeight: "900",
      color: "#5E5157",
    },

    bookingRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1EBE8",
    },

    bookingIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "#F1E0E4",
      alignItems: "center",
      justifyContent:
        "center",
    },

    bookingIconText: {
      color: "#7E243A",
      fontWeight: "900",
    },

    bookingInfo: {
      flex: 1,
      marginLeft: 10,
    },

    bookingService: {
      fontSize: 13,
      fontWeight: "800",
      color: "#30272A",
    },

    bookingClient: {
      marginTop: 2,
      fontSize: 10,
      color: "#84777D",
    },

    bookingDate: {
      marginTop: 2,
      fontSize: 9,
      color: "#A09599",
    },

    bookingPrice: {
      fontSize: 13,
      fontWeight: "900",
      color: "#7E243A",
    },
  });