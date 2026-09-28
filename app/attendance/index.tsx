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
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchStylists,
  getStylistAttendance,
  markStylistAttendance,
  type AttendanceStatus,
  type Stylist,
  type StylistAttendance,
} from "../../src/features/stylist/stylistSlice";

type RootState = any;

const STATUS_OPTIONS: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "HALF_DAY",
  "LEAVE",
];

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

const formatTime = (
  value?: string | null
) => {
  if (!value) {
    return "";
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

const statusLabel = (
  status: AttendanceStatus
) => {
  if (status === "HALF_DAY") {
    return "Half Day";
  }

  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
};

export default function AttendanceScreen() {
  const dispatch =
    useDispatch<any>();

  const token = useSelector(
    (state: RootState) =>
      state.auth?.token
  );

  const stylistState =
    useSelector(
      (state: RootState) =>
        state.stylists || {}
    );

  const stylists: Stylist[] =
    stylistState.stylists || [];

  const attendance: StylistAttendance[] =
    stylistState.attendance || [];

  const loading =
    stylistState.loading ||
    stylistState.attendanceLoading;

  const saving =
    stylistState.attendanceSaving;

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [selectedStaffId, setSelectedStaffId] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  const [showStaff, setShowStaff] =
    useState(false);

  const dateKey = useMemo(
    () =>
      formatDateKey(
        selectedDate
      ),
    [selectedDate]
  );

  const formattedDate =
    selectedDate.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  // =====================================================
  // LOAD STAFF
  // =====================================================

  const loadStaff =
    useCallback(async () => {
      if (!token) return;

      try {
        await dispatch(
          fetchStylists()
        ).unwrap();
      } catch (error: any) {
        Alert.alert(
          "Error",
          String(
            error ||
              "Failed to load staff"
          )
        );
      }
    }, [
      dispatch,
      token,
    ]);

  // =====================================================
  // LOAD TODAY ATTENDANCE
  // =====================================================

  const loadAttendance =
    useCallback(async () => {
      if (!token) return;

      try {
        await Promise.all(
          stylists.map((staff) =>
            dispatch(
              getStylistAttendance({
                stylistId:
                  staff._id,
                startDate:
                  dateKey,
                endDate:
                  dateKey,
              })
            )
          )
        );
      } catch (error) {
        console.log(
          "ATTENDANCE LOAD ERROR",
          error
        );
      }
    }, [
      dispatch,
      token,
      stylists,
      dateKey,
    ]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    if (
      stylists.length > 0 &&
      !selectedStaffId
    ) {
      setSelectedStaffId(
        stylists[0]._id
      );
    }
  }, [
    stylists,
    selectedStaffId,
  ]);

  // =====================================================
  // GET ATTENDANCE FOR SELECTED STAFF
  // =====================================================

  const selectedStaff =
    stylists.find(
      (item) =>
        item._id ===
        selectedStaffId
    );

  const selectedAttendance =
    attendance.find(
      (item) => {
        const itemDate =
          new Date(item.date);

        return (
          item.stylist ===
            selectedStaffId &&
          formatDateKey(
            itemDate
          ) === dateKey
        );
      }
    );

  // =====================================================
  // LOAD SELECTED STAFF ATTENDANCE
  // =====================================================

  useEffect(() => {
    if (
      !token ||
      !selectedStaffId
    ) {
      return;
    }

    dispatch(
      getStylistAttendance({
        stylistId:
          selectedStaffId,
        startDate:
          dateKey,
        endDate:
          dateKey,
      })
    );
  }, [
    dispatch,
    token,
    selectedStaffId,
    dateKey,
  ]);

  // =====================================================
  // STATUS
  // =====================================================

  const markStatus =
    async (
      status: AttendanceStatus
    ) => {
      if (
        !selectedStaffId
      ) {
        Alert.alert(
          "Select Staff",
          "Please select a staff member."
        );

        return;
      }

      try {
        await dispatch(
          markStylistAttendance({
            stylistId:
              selectedStaffId,

            date: dateKey,

            status,

            checkIn:
              selectedAttendance
                ?.checkIn ||
              null,

            checkOut:
              selectedAttendance
                ?.checkOut ||
              null,

            workedHours:
              selectedAttendance
                ?.workedHours ||
              0,
          })
        ).unwrap();

        Alert.alert(
          "Success",
          `${selectedStaff?.name} marked ${statusLabel(
            status
          )}.`
        );
      } catch (error: any) {
        Alert.alert(
          "Attendance Error",
          String(
            error ||
              "Failed to save attendance"
          )
        );
      }
    };

  // =====================================================
  // CHECK IN
  // =====================================================

  const handleCheckIn =
    async () => {
      if (
        !selectedStaffId
      ) {
        Alert.alert(
          "Select Staff",
          "Please select a staff member."
        );

        return;
      }

      if (
        selectedAttendance
          ?.checkIn
      ) {
        Alert.alert(
          "Already Checked In",
          "This staff member has already checked in."
        );

        return;
      }

      try {
        const now =
          new Date();

        await dispatch(
          markStylistAttendance({
            stylistId:
              selectedStaffId,

            date: dateKey,

            status: "PRESENT",

            checkIn:
              now.toISOString(),

            checkOut: null,

            workedHours: 0,
          })
        ).unwrap();

        Alert.alert(
          "Checked In",
          `${selectedStaff?.name} checked in at ${formatTime(
            now.toISOString()
          )}.`
        );
      } catch (error: any) {
        Alert.alert(
          "Check In Error",
          String(
            error ||
              "Failed to check in"
          )
        );
      }
    };

  // =====================================================
  // CHECK OUT
  // =====================================================

  const handleCheckOut =
    async () => {
      if (
        !selectedStaffId
      ) {
        return;
      }

      if (
        !selectedAttendance
          ?.checkIn
      ) {
        Alert.alert(
          "Check In Required",
          "Please check in first."
        );

        return;
      }

      if (
        selectedAttendance
          ?.checkOut
      ) {
        Alert.alert(
          "Already Checked Out",
          "This staff member has already checked out."
        );

        return;
      }

      try {
        const now =
          new Date();

        await dispatch(
          markStylistAttendance({
            stylistId:
              selectedStaffId,

            date: dateKey,

            status: "PRESENT",

            checkIn:
              selectedAttendance.checkIn,

            checkOut:
              now.toISOString(),

            workedHours: 0,
          })
        ).unwrap();

        Alert.alert(
          "Checked Out",
          `${selectedStaff?.name} checked out at ${formatTime(
            now.toISOString()
          )}.`
        );
      } catch (error: any) {
        Alert.alert(
          "Check Out Error",
          String(
            error ||
              "Failed to check out"
          )
        );
      }
    };

  // =====================================================
  // DATE
  // =====================================================

  const changeDate = (
    days: number
  ) => {
    const next =
      new Date(
        selectedDate
      );

    next.setDate(
      next.getDate() + days
    );

    setSelectedDate(next);
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const refresh =
    async () => {
      try {
        setRefreshing(true);

        await loadStaff();

        if (
          selectedStaffId
        ) {
          await dispatch(
            getStylistAttendance({
              stylistId:
                selectedStaffId,
              startDate:
                dateKey,
              endDate:
                dateKey,
            })
          ).unwrap();
        }
      } finally {
        setRefreshing(false);
      }
    };

  // =====================================================
  // COUNTS
  // =====================================================

  const presentCount =
    attendance.filter(
      (item) =>
        item.status ===
        "PRESENT"
    ).length;

  const absentCount =
    attendance.filter(
      (item) =>
        item.status ===
        "ABSENT"
    ).length;

  const halfDayCount =
    attendance.filter(
      (item) =>
        item.status ===
        "HALF_DAY"
    ).length;

  const leaveCount =
    attendance.filter(
      (item) =>
        item.status ===
        "LEAVE"
    ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F2EF"
      />

      <View
        style={styles.container}
      >
        {/* HEADER */}

        <View
          style={styles.header}
        >
          <Pressable
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={styles.back}
            >
              ‹
            </Text>
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              STAFF MANAGEMENT
            </Text>

            <Text
              style={styles.title}
            >
              Attendance
            </Text>
          </View>

          <View
            style={
              styles.headerIcon
            }
          >
            <Text
              style={
                styles.headerIconText
              }
            >
              ✓
            </Text>
          </View>
        </View>

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
          {/* DATE */}

          <View
            style={styles.dateCard}
          >
            <Pressable
              style={
                styles.dateArrow
              }
              onPress={() =>
                changeDate(-1)
              }
            >
              <Text
                style={
                  styles.arrowText
                }
              >
                ‹
              </Text>
            </Pressable>

            <View
              style={
                styles.dateCenter
              }
            >
              <Text
                style={
                  styles.dateLabel
                }
              >
                ATTENDANCE DATE
              </Text>

              <Text
                style={
                  styles.dateValue
                }
              >
                {formattedDate}
              </Text>
            </View>

            <Pressable
              style={
                styles.dateArrow
              }
              onPress={() =>
                changeDate(1)
              }
            >
              <Text
                style={
                  styles.arrowText
                }
              >
                ›
              </Text>
            </Pressable>
          </View>

          {/* SUMMARY */}

          <View
            style={
              styles.summaryGrid
            }
          >
            <SummaryCard
              label="Present"
              value={
                presentCount
              }
            />

            <SummaryCard
              label="Absent"
              value={
                absentCount
              }
            />

            <SummaryCard
              label="Half Day"
              value={
                halfDayCount
              }
            />

            <SummaryCard
              label="Leave"
              value={
                leaveCount
              }
            />
          </View>

          {/* STAFF SELECT */}

          <View
            style={styles.card}
          >
            <Text
              style={
                styles.sectionLabel
              }
            >
              SELECT STAFF
            </Text>

            <Pressable
              style={
                styles.selector
              }
              onPress={() =>
                setShowStaff(
                  !showStaff
                )
              }
            >
              <View>
                <Text
                  style={
                    styles.staffName
                  }
                >
                  {selectedStaff
                    ?.name ||
                    "Select staff"}
                </Text>

                <Text
                  style={
                    styles.staffSub
                  }
                >
                  {selectedStaff
                    ?.specialization ||
                    "Staff member"}
                </Text>
              </View>

              <Text
                style={
                  styles.selectorArrow
                }
              >
                {showStaff
                  ? "⌃"
                  : "⌄"}
              </Text>
            </Pressable>

            {showStaff && (
              <View
                style={
                  styles.dropdown
                }
              >
                {stylistState.loading ? (
                  <ActivityIndicator
                    color="#7E243A"
                  />
                ) : stylists.length ===
                  0 ? (
                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    No active staff found
                  </Text>
                ) : (
                  stylists.map(
                    (staff) => (
                      <Pressable
                        key={
                          staff._id
                        }
                        style={
                          styles.staffItem
                        }
                        onPress={() => {
                          setSelectedStaffId(
                            staff._id
                          );

                          setShowStaff(
                            false
                          );
                        }}
                      >
                        <View
                          style={
                            styles.avatar
                          }
                        >
                          <Text
                            style={
                              styles.avatarText
                            }
                          >
                            {staff.name
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase()}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.staffItemInfo
                          }
                        >
                          <Text
                            style={
                              styles.staffItemName
                            }
                          >
                            {staff.name}
                          </Text>

                          <Text
                            style={
                              styles.staffItemSub
                            }
                          >
                            {staff.specialization ||
                              "Staff"}
                          </Text>
                        </View>
                      </Pressable>
                    )
                  )
                )}
              </View>
            )}

            {/* TODAY STATUS */}

            <Text
              style={
                styles.sectionLabelSmall
              }
            >
              TODAY'S STATUS
            </Text>

            <View
              style={
                styles.statusGrid
              }
            >
              {STATUS_OPTIONS.map(
                (status) => {
                  const active =
                    selectedAttendance
                      ?.status ===
                    status;

                  return (
                    <Pressable
                      key={
                        status
                      }
                      style={[
                        styles.statusButton,
                        active &&
                          styles.statusButtonActive,
                      ]}
                      onPress={() =>
                        markStatus(
                          status
                        )
                      }
                      disabled={
                        saving
                      }
                    >
                      <Text
                        style={[
                          styles.statusText,
                          active &&
                            styles.statusTextActive,
                        ]}
                      >
                        {statusLabel(
                          status
                        )}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>
          </View>

          {/* CHECK IN / OUT CARD */}

          <View
            style={styles.card}
          >
            <Text
              style={
                styles.sectionLabel
              }
            >
              TODAY'S SHIFT
            </Text>

            <View
              style={
                styles.shiftCard
              }
            >
              <View>
                <Text
                  style={
                    styles.shiftLabel
                  }
                >
                  STATUS
                </Text>

                <Text
                  style={
                    styles.shiftValue
                  }
                >
                  {selectedAttendance
                    ?.status
                    ? statusLabel(
                        selectedAttendance.status
                      )
                    : "Not Marked"}
                </Text>
              </View>

              <View
                style={
                  styles.shiftTimes
                }
              >
                <View
                  style={
                    styles.timeBox
                  }
                >
                  <Text
                    style={
                      styles.shiftLabel
                    }
                  >
                    CHECK IN
                  </Text>

                  <Text
                    style={
                      styles.timeValue
                    }
                  >
                    {formatTime(
                      selectedAttendance
                        ?.checkIn
                    ) ||
                      "--:--"}
                  </Text>
                </View>

                <View
                  style={
                    styles.timeBox
                  }
                >
                  <Text
                    style={
                      styles.shiftLabel
                    }
                  >
                    CHECK OUT
                  </Text>

                  <Text
                    style={
                      styles.timeValue
                    }
                  >
                    {formatTime(
                      selectedAttendance
                        ?.checkOut
                    ) ||
                      "--:--"}
                  </Text>
                </View>
              </View>

              {selectedAttendance
                ?.checkIn &&
                !selectedAttendance
                  ?.checkOut && (
                  <View
                    style={
                      styles.workingBadge
                    }
                  >
                    <View
                      style={
                        styles.liveDot
                      }
                    />

                    <Text
                      style={
                        styles.workingText
                      }
                    >
                      Currently Working
                    </Text>
                  </View>
                )}
            </View>

            {!selectedAttendance
              ?.checkIn && (
              <Pressable
                style={
                  styles.checkInButton
                }
                onPress={
                  handleCheckIn
                }
                disabled={
                  saving
                }
              >
                {saving ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    CHECK IN
                  </Text>
                )}
              </Pressable>
            )}

            {selectedAttendance
              ?.checkIn &&
              !selectedAttendance
                ?.checkOut && (
                <Pressable
                  style={
                    styles.checkOutButton
                  }
                  onPress={
                    handleCheckOut
                  }
                  disabled={
                    saving
                  }
                >
                  {saving ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      CHECK OUT
                    </Text>
                  )}
                </Pressable>
              )}

            {selectedAttendance
              ?.checkIn &&
              selectedAttendance
                ?.checkOut && (
                <View
                  style={
                    styles.completedBox
                  }
                >
                  <Text
                    style={
                      styles.completedText
                    }
                  >
                    ✓ Shift Completed
                  </Text>

                  <Text
                    style={
                      styles.hoursText
                    }
                  >
                    Worked{" "}
                    {Number(
                      selectedAttendance
                        .workedHours ||
                        0
                    ).toFixed(2)}
                    h
                    {"  •  "}
                    OT{" "}
                    {Number(
                      selectedAttendance
                        .overtimeHours ||
                        0
                    ).toFixed(2)}
                    h
                  </Text>

                  <Text
                    style={
                      styles.salaryText
                    }
                  >
                    Earned ₹
                    {Number(
                      selectedAttendance
                        .totalSalaryEarned ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </Text>
                </View>
              )}
          </View>

          {/* TODAY RECORDS */}

          <View
            style={
              styles.historyHeader
            }
          >
            <Text
              style={
                styles.historyTitle
              }
            >
              Today's Records
            </Text>

            <Text
              style={
                styles.historyCount
              }
            >
              {attendance.length} Records
            </Text>
          </View>

          {attendance.length ===
          0 ? (
            <View
              style={
                styles.emptyCard
              }
            >
              <Text
                style={
                  styles.emptyIcon
                }
              >
                ✓
              </Text>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No attendance records
              </Text>

              <Text
                style={
                  styles.emptySub
                }
              >
                Mark attendance for
                your staff.
              </Text>
            </View>
          ) : (
            attendance.map(
              (item) => {
                const staffItem =
                  stylists.find(
                    (s) =>
                      s._id ===
                      item.stylist
                  );

                return (
                  <View
                    key={
                      item._id
                    }
                    style={
                      styles.record
                    }
                  >
                    <View
                      style={
                        styles.avatar
                      }
                    >
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {staffItem?.name
                          ?.charAt(
                            0
                          )
                          ?.toUpperCase() ||
                          "S"}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.recordInfo
                      }
                    >
                      <Text
                        style={
                          styles.recordName
                        }
                      >
                        {staffItem
                          ?.name ||
                          "Staff"}
                      </Text>

                      <Text
                        style={
                          styles.recordTime
                        }
                      >
                        {item.checkIn
                          ? `In ${formatTime(
                              item.checkIn
                            )}`
                          : "No check-in"}

                        {item.checkOut
                          ? `  •  Out ${formatTime(
                              item.checkOut
                            )}`
                          : ""}
                      </Text>

                      {item.checkOut && (
                        <Text
                          style={
                            styles.recordHours
                          }
                        >
                          Worked{" "}
                          {Number(
                            item.workedHours ||
                              0
                          ).toFixed(
                            2
                          )}
                          h
                          {"  •  "}
                          OT{" "}
                          {Number(
                            item.overtimeHours ||
                              0
                          ).toFixed(
                            2
                          )}
                          h
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.badge,
                        item.status ===
                          "PRESENT" &&
                          styles.present,
                        item.status ===
                          "ABSENT" &&
                          styles.absent,
                        item.status ===
                          "HALF_DAY" &&
                          styles.halfDay,
                        item.status ===
                          "LEAVE" &&
                          styles.leave,
                      ]}
                    >
                      <Text
                        style={
                          styles.badgeText
                        }
                      >
                        {statusLabel(
                          item.status
                        )}
                      </Text>
                    </View>
                  </View>
                );
              }
            )
          )}

          <View
            style={{
              height: 110,
            }}
          />
        </ScrollView>

        {/* BOTTOM NAV */}

        <View
          style={
            styles.bottomNav
          }
        >
          <NavItem
            icon="⌂"
            label="Home"
            onPress={() =>
              router.push("/")
            }
          />

          <NavItem
            icon="♙"
            label="Clients"
            onPress={() =>
              router.push(
                "/clients"
              )
            }
          />

          <NavItem
            icon="▣"
            label="Billing"
            onPress={() =>
              router.push(
                "/billing"
              )
            }
          />

          <NavItem
            icon="✦"
            label="Services"
            onPress={() =>
              router.push(
                "/services"
              )
            }
          />

          <NavItem
            icon="•••"
            label="More"
            active
            onPress={() =>
              router.push(
                "/more"
              )
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// =====================================================
// SUMMARY
// =====================================================

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View
      style={
        styles.summaryCard
      }
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
// NAV
// =====================================================

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.navItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.navIconBox,
          active &&
            styles.navIconBoxActive,
        ]}
      >
        <Text
          style={[
            styles.navIcon,
            active &&
              styles.navIconActive,
          ]}
        >
          {icon}
        </Text>
      </View>

      <Text
        style={[
          styles.navLabel,
          active &&
            styles.navLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
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

    container: {
      flex: 1,
      backgroundColor:
        "#F8F2EF",
    },

    header: {
      height: 72,
      paddingHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
    },

    backButton: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        "#E7DCD8",
    },

    back: {
      fontSize: 28,
      color: "#7E243A",
      lineHeight: 31,
    },

    headerText: {
      flex: 1,
      marginLeft: 11,
    },

    eyebrow: {
      fontSize: 9,
      letterSpacing: 1.5,
      color: "#A4979B",
      fontWeight: "700",
    },

    title: {
      marginTop: 2,
      fontSize: 24,
      fontWeight: "800",
      color: "#2D2427",
    },

    headerIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "#7E243A",
      alignItems: "center",
      justifyContent:
        "center",
    },

    headerIconText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
    },

    content: {
      padding: 15,
    },

    dateCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#E9DEDA",
      marginBottom: 14,
    },

    dateArrow: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        "#F8F2EF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    arrowText: {
      fontSize: 28,
      color: "#7E243A",
    },

    dateCenter: {
      flex: 1,
      alignItems:
        "center",
    },

    dateLabel: {
      fontSize: 8,
      letterSpacing: 1.2,
      color: "#A39599",
      fontWeight: "700",
    },

    dateValue: {
      marginTop: 4,
      fontSize: 16,
      fontWeight: "800",
      color: "#2D2427",
    },

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent:
        "space-between",
      marginBottom: 14,
    },

    summaryCard: {
      width: "48%",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        "#E9DEDA",
    },

    summaryValue: {
      fontSize: 24,
      fontWeight: "800",
      color: "#7E243A",
    },

    summaryLabel: {
      marginTop: 4,
      fontSize: 12,
      color: "#8F8186",
    },

    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 16,
      marginBottom: 15,
      borderWidth: 1,
      borderColor:
        "#E9DEDA",
    },

    sectionLabel: {
      fontSize: 10,
      letterSpacing: 1.3,
      fontWeight: "800",
      color: "#9B8E93",
      marginBottom: 10,
    },

    sectionLabelSmall: {
      fontSize: 10,
      letterSpacing: 1.2,
      fontWeight: "800",
      color: "#9B8E93",
      marginTop: 18,
      marginBottom: 10,
    },

    selector: {
      minHeight: 62,
      borderRadius: 15,
      backgroundColor:
        "#F9F5F3",
      borderWidth: 1,
      borderColor:
        "#E8DCD8",
      paddingHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    staffName: {
      fontSize: 16,
      fontWeight: "800",
      color: "#30272A",
    },

    staffSub: {
      marginTop: 3,
      fontSize: 12,
      color: "#95888D",
    },

    selectorArrow: {
      fontSize: 22,
      color: "#7E243A",
    },

    dropdown: {
      marginTop: 8,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        "#E8DCD8",
      backgroundColor:
        "#FFFFFF",
      overflow: "hidden",
    },

    staffItem: {
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F0E9E6",
    },

    avatar: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#F1E0E4",
      alignItems: "center",
      justifyContent:
        "center",
    },

    avatarText: {
      color: "#7E243A",
      fontSize: 17,
      fontWeight: "800",
    },

    staffItemInfo: {
      marginLeft: 11,
      flex: 1,
    },

    staffItemName: {
      fontSize: 14,
      fontWeight: "800",
      color: "#30272A",
    },

    staffItemSub: {
      marginTop: 2,
      fontSize: 11,
      color: "#95888D",
    },

    emptyText: {
      padding: 18,
      textAlign: "center",
      color: "#8F8186",
    },

    statusGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent:
        "space-between",
    },

    statusButton: {
      width: "48%",
      paddingVertical: 13,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#E5D9D5",
      alignItems: "center",
      marginBottom: 9,
      backgroundColor:
        "#FFFFFF",
    },

    statusButtonActive: {
      backgroundColor:
        "#7E243A",
      borderColor:
        "#7E243A",
    },

    statusText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#65575C",
    },

    statusTextActive: {
      color: "#FFFFFF",
    },

    shiftCard: {
      backgroundColor:
        "#F9F5F3",
      borderRadius: 16,
      padding: 15,
    },

    shiftLabel: {
      fontSize: 9,
      color: "#9B8E93",
      fontWeight: "800",
      letterSpacing: 1,
    },

    shiftValue: {
      marginTop: 4,
      fontSize: 17,
      fontWeight: "800",
      color: "#30272A",
    },

    shiftTimes: {
      flexDirection: "row",
      marginTop: 16,
      gap: 10,
    },

    timeBox: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 13,
      padding: 12,
    },

    timeValue: {
      marginTop: 5,
      fontSize: 16,
      fontWeight: "800",
      color: "#7E243A",
    },

    workingBadge: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 13,
    },

    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 8,
      backgroundColor:
        "#2F9B62",
      marginRight: 7,
    },

    workingText: {
      fontSize: 12,
      color: "#2F7E56",
      fontWeight: "700",
    },

    checkInButton: {
      marginTop: 14,
      height: 52,
      borderRadius: 15,
      backgroundColor:
        "#7E243A",
      alignItems: "center",
      justifyContent:
        "center",
    },

    checkOutButton: {
      marginTop: 14,
      height: 52,
      borderRadius: 15,
      backgroundColor:
        "#A13C55",
      alignItems: "center",
      justifyContent:
        "center",
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: 1,
    },

    completedBox: {
      marginTop: 14,
      backgroundColor:
        "#EEF8F2",
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor:
        "#CBE7D6",
    },

    completedText: {
      color: "#28784F",
      fontSize: 14,
      fontWeight: "800",
    },

    hoursText: {
      marginTop: 5,
      color: "#547362",
      fontSize: 12,
    },

    salaryText: {
      marginTop: 5,
      color: "#28784F",
      fontSize: 13,
      fontWeight: "800",
    },

    historyHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },

    historyTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#30272A",
    },

    historyCount: {
      fontSize: 11,
      color: "#988B90",
    },

    record: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 13,
      marginBottom: 9,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#E9DEDA",
    },

    recordInfo: {
      flex: 1,
      marginLeft: 10,
    },

    recordName: {
      fontSize: 14,
      fontWeight: "800",
      color: "#30272A",
    },

    recordTime: {
      marginTop: 3,
      fontSize: 11,
      color: "#8E8085",
    },

    recordHours: {
      marginTop: 3,
      fontSize: 10,
      color: "#7E243A",
      fontWeight: "700",
    },

    badge: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
    },

    present: {
      backgroundColor:
        "#E8F6EE",
    },

    absent: {
      backgroundColor:
        "#FCEAEC",
    },

    halfDay: {
      backgroundColor:
        "#FFF4DD",
    },

    leave: {
      backgroundColor:
        "#EEEAFB",
    },

    badgeText: {
      fontSize: 9,
      fontWeight: "800",
      color: "#5B4F54",
    },

    emptyCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      padding: 25,
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#E9DEDA",
    },

    emptyIcon: {
      fontSize: 28,
      color: "#7E243A",
    },

    emptyTitle: {
      marginTop: 8,
      fontSize: 16,
      fontWeight: "800",
      color: "#30272A",
    },

    emptySub: {
      marginTop: 4,
      fontSize: 12,
      color: "#988B90",
    },

    bottomNav: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 76,
      backgroundColor:
        "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor:
        "#E9DEDA",
      flexDirection: "row",
      justifyContent:
        "space-around",
      alignItems: "center",
      paddingBottom: 5,
    },

    navItem: {
      alignItems: "center",
      justifyContent:
        "center",
      width: 62,
    },

    navIconBox: {
      width: 34,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent:
        "center",
    },

    navIconBoxActive: {
      backgroundColor:
        "#F1E0E4",
    },

    navIcon: {
      fontSize: 17,
      color: "#8F8186",
    },

    navIconActive: {
      color: "#7E243A",
    },

    navLabel: {
      marginTop: 2,
      fontSize: 9,
      color: "#8F8186",
    },

    navLabelActive: {
      color: "#7E243A",
      fontWeight: "800",
    },
  });