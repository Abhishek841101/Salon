import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";

import { Ionicons } from "@expo/vector-icons";

import type {
  AppDispatch,
  RootState,
} from "../../src/store";

import {
  createSalary,
  fetchSalaries,
  markSalaryPaid,
  markSalaryPending,
  setSearch,
  setSelectedMonth,
  setStatus,
  type PaymentMethod,
  type Salary,
} from "../../src/features/salary/salarySlice";

import {
  fetchStylists,
  type Stylist,
} from "../../src/features/stylist/stylistSlice";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "BANK_TRANSFER",
  "UPI",
  "OTHER",
];

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type SalaryRow = {
  key: string;

  _id?: string;

  stylist: Stylist;

  month: string;

  basicSalary: number;
  overtimeSalary: number;

  commission: number;
  bonus: number;

  advance: number;
  deduction: number;

  grossSalary: number;
  netSalary: number;

  paymentStatus: "PENDING" | "PAID";

  paymentDate: string | null;

  paymentMethod: PaymentMethod;

  notes?: string;

  attendance?: Salary["attendance"];

  generated: boolean;
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const formatMoney = (
  value: number = 0
) => {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

const getMonthLabel = (
  month: string
) => {
  if (!month) return "";

  const [year, monthNumber] =
    month.split("-");

  const index =
    Number(monthNumber) - 1;

  if (
    index < 0 ||
    index > 11
  ) {
    return month;
  }

  return `${MONTH_NAMES[index]} ${year}`;
};

const getPreviousMonth = (
  month: string
) => {
  const [year, monthNumber] =
    month.split("-").map(Number);

  const date = new Date(
    year,
    monthNumber - 2,
    1
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getNextMonth = (
  month: string
) => {
  const [year, monthNumber] =
    month.split("-").map(Number);

  const date = new Date(
    year,
    monthNumber,
    1
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getInitials = (
  name: string = ""
) => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("") || "ST"
  );
};

/*
|--------------------------------------------------------------------------
| MAIN SCREEN
|--------------------------------------------------------------------------
*/

export default function SalaryScreen() {
  const dispatch =
    useDispatch<AppDispatch>();

  const salaryState =
    useSelector(
      (state: RootState) =>
        state.salary
    );

  const stylistState =
    useSelector(
      (state: RootState) =>
        state.stylists
    );

  const {
    salaries,
    totals,
    loading,
    generating,
    paying,
    error,
    selectedMonth,
    search,
    status,
  } = salaryState;

  const {
    stylists,
    loading: stylistsLoading,
  } = stylistState;

  /*
  |--------------------------------------------------------------------------
  | MODALS
  |--------------------------------------------------------------------------
  */

  const [
    showMonthPicker,
    setShowMonthPicker,
  ] = useState(false);

  const [
    showGenerateModal,
    setShowGenerateModal,
  ] = useState(false);

  const [
    showPaymentModal,
    setShowPaymentModal,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | SELECTED
  |--------------------------------------------------------------------------
  */

  const [
    selectedSalary,
    setSelectedSalary,
  ] = useState<SalaryRow | null>(
    null
  );

  const [
    selectedPaymentMethod,
    setSelectedPaymentMethod,
  ] =
    useState<PaymentMethod>(
      "CASH"
    );

  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  const [
    commission,
    setCommission,
  ] = useState("");

  const [
    bonus,
    setBonus,
  ] = useState("");

  const [
    advance,
    setAdvance,
  ] = useState("");

  const [
    deduction,
    setDeduction,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  const loadData =
    useCallback(async () => {
      await Promise.all([
        dispatch(
          fetchStylists({
            status: "ACTIVE",
          })
        ),

        dispatch(
          fetchSalaries({
            month: selectedMonth,
            search: "",
            status: "",
          })
        ),
      ]);
    }, [
      dispatch,
      selectedMonth,
    ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /*
  |--------------------------------------------------------------------------
  | MERGE STAFF + SALARY
  |--------------------------------------------------------------------------
  */

  const mergedRows =
    useMemo<SalaryRow[]>(() => {
      const salaryMap =
        new Map<string, Salary>();

      salaries.forEach(
        (salary) => {
          const stylistId =
            typeof salary.stylist ===
            "object"
              ? salary.stylist?._id
              : "";

          if (stylistId) {
            salaryMap.set(
              String(stylistId),
              salary
            );
          }
        }
      );

      return stylists
        .filter(
          (stylist) =>
            stylist.status !==
            "INACTIVE"
        )
        .map((stylist) => {
          const salary =
            salaryMap.get(
              String(stylist._id)
            );

          if (salary) {
            return {
              key: `${stylist._id}-${selectedMonth}`,

              _id: salary._id,

              stylist,

              month:
                salary.month,

              basicSalary:
                Number(
                  salary.basicSalary ||
                    0
                ),

              overtimeSalary:
                Number(
                  salary.overtimeSalary ||
                    0
                ),

              commission:
                Number(
                  salary.commission ||
                    0
                ),

              bonus:
                Number(
                  salary.bonus ||
                    0
                ),

              advance:
                Number(
                  salary.advance ||
                    0
                ),

              deduction:
                Number(
                  salary.deduction ||
                    0
                ),

              grossSalary:
                Number(
                  salary.grossSalary ||
                    0
                ),

              netSalary:
                Number(
                  salary.netSalary ||
                    0
                ),

              paymentStatus:
                salary.paymentStatus ||
                "PENDING",

              paymentDate:
                salary.paymentDate ||
                null,

              paymentMethod:
                salary.paymentMethod ||
                "CASH",

              notes:
                salary.notes || "",

              attendance:
                salary.attendance,

              generated: true,
            };
          }

          /*
          |--------------------------------------------------------------------------
          | NO SALARY GENERATED YET
          |--------------------------------------------------------------------------
          */

          const monthlySalary =
            Number(
              stylist.monthlySalary ||
                0
            );

          return {
            key: `${stylist._id}-${selectedMonth}`,

            _id: undefined,

            stylist,

            month:
              selectedMonth,

            /*
            |--------------------------------------------------------------------------
            | Basic salary preview
            |
            | Monthly salary is divided by
            | 26 working days only for display.
            | Actual generated salary comes
            | from backend attendance calculation.
            |--------------------------------------------------------------------------
            */

            basicSalary:
              stylist.salaryType ===
              "DAILY"
                ? Number(
                    stylist.basicSalary8h ||
                      0
                  )
                : monthlySalary,

            overtimeSalary: 0,

            commission: 0,

            bonus: 0,

            advance: 0,

            deduction: 0,

            grossSalary:
              stylist.salaryType ===
              "DAILY"
                ? Number(
                    stylist.basicSalary8h ||
                      0
                  )
                : monthlySalary,

            netSalary:
              stylist.salaryType ===
              "DAILY"
                ? Number(
                    stylist.basicSalary8h ||
                      0
                  )
                : monthlySalary,

            paymentStatus:
              "PENDING",

            paymentDate: null,

            paymentMethod:
              "CASH",

            notes: "",

            attendance: undefined,

            generated: false,
          };
        });
    }, [
      stylists,
      salaries,
      selectedMonth,
    ]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH + STATUS FILTER
  |--------------------------------------------------------------------------
  */

  const filteredRows =
    useMemo(() => {
      let rows =
        mergedRows;

      const searchText =
        search
          .trim()
          .toLowerCase();

      if (searchText) {
        rows = rows.filter(
          (row) => {
            const name =
              row.stylist.name
                ?.toLowerCase() ||
              "";

            const phone =
              row.stylist.phone
                ?.toLowerCase() ||
              "";

            return (
              name.includes(
                searchText
              ) ||
              phone.includes(
                searchText
              )
            );
          }
        );
      }

      if (status) {
        rows = rows.filter(
          (row) =>
            row.paymentStatus ===
            status
        );
      }

      return rows;
    }, [
      mergedRows,
      search,
      status,
    ]);

  /*
  |--------------------------------------------------------------------------
  | COUNTS
  |--------------------------------------------------------------------------
  */

  const staffCount =
    stylists.filter(
      (stylist) =>
        stylist.status !==
        "INACTIVE"
    ).length;

  const paidCount =
    mergedRows.filter(
      (row) =>
        row.paymentStatus ===
        "PAID"
    ).length;

  const pendingCount =
    mergedRows.filter(
      (row) =>
        row.paymentStatus ===
        "PENDING"
    ).length;

  /*
  |--------------------------------------------------------------------------
  | TOTALS
  |--------------------------------------------------------------------------
  |
  | Backend totals only include generated
  | salary records. This is intentional.
  |
  */

  const totalNet =
    mergedRows.reduce(
      (sum, row) =>
        sum +
        Number(
          row.generated
            ? row.netSalary
            : 0
        ),
      0
    );

  const totalPaid =
    mergedRows.reduce(
      (sum, row) =>
        sum +
        Number(
          row.generated &&
          row.paymentStatus ===
            "PAID"
            ? row.netSalary
            : 0
        ),
      0
    );

  const totalPending =
    mergedRows.reduce(
      (sum, row) =>
        sum +
        Number(
          row.generated &&
          row.paymentStatus ===
            "PENDING"
            ? row.netSalary
            : 0
        ),
      0
    );

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const onRefresh =
    useCallback(async () => {
      setRefreshing(true);

      await loadData();

      setRefreshing(false);
    }, [loadData]);

  /*
  |--------------------------------------------------------------------------
  | MONTH
  |--------------------------------------------------------------------------
  */

  const changeMonth = (
    direction:
      | "prev"
      | "next"
  ) => {
    const newMonth =
      direction === "prev"
        ? getPreviousMonth(
            selectedMonth
          )
        : getNextMonth(
            selectedMonth
          );

    dispatch(
      setSelectedMonth(
        newMonth
      )
    );

    setShowMonthPicker(false);
  };

  /*
  |--------------------------------------------------------------------------
  | GENERATE / EDIT
  |--------------------------------------------------------------------------
  */

  const openGenerateModal = (
    row: SalaryRow
  ) => {
    setSelectedSalary(row);

    setCommission(
      String(
        row.commission || ""
      )
    );

    setBonus(
      String(row.bonus || "")
    );

    setAdvance(
      String(row.advance || "")
    );

    setDeduction(
      String(
        row.deduction || ""
      )
    );

    setNotes(
      row.notes || ""
    );

    setShowGenerateModal(true);
  };

  const closeGenerateModal =
    () => {
      if (generating) return;

      setShowGenerateModal(
        false
      );

      setSelectedSalary(null);

      setCommission("");
      setBonus("");
      setAdvance("");
      setDeduction("");
      setNotes("");
    };

  const handleGenerateSalary =
    async () => {
      if (
        !selectedSalary
          ?.stylist?._id
      ) {
        Alert.alert(
          "Error",
          "Stylist information is missing."
        );
        return;
      }

      const result =
        await dispatch(
          createSalary({
            stylist:
              selectedSalary
                .stylist._id,

            month:
              selectedMonth,

            commission:
              Number(
                commission
              ) || 0,

            bonus:
              Number(bonus) || 0,

            advance:
              Number(advance) || 0,

            deduction:
              Number(
                deduction
              ) || 0,

            paymentMethod:
              selectedSalary
                .paymentMethod ||
              "CASH",

            notes:
              notes.trim(),
          })
        );

      if (
        createSalary.fulfilled.match(
          result
        )
      ) {
        setShowGenerateModal(
          false
        );

        Alert.alert(
          "Salary Updated",
          `${selectedSalary.stylist.name}'s salary has been generated successfully.`
        );

        setSelectedSalary(null);

        setCommission("");
        setBonus("");
        setAdvance("");
        setDeduction("");
        setNotes("");

        await loadData();
      } else {
        Alert.alert(
          "Error",
          result.payload ||
            "Failed to generate salary."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | PAYMENT
  |--------------------------------------------------------------------------
  */

  const openPaymentModal = (
    row: SalaryRow
  ) => {
    if (!row._id) {
      Alert.alert(
        "Generate Salary First",
        "Please generate this staff member's salary before marking it as paid."
      );
      return;
    }

    setSelectedSalary(row);

    setSelectedPaymentMethod(
      row.paymentMethod ||
        "CASH"
    );

    setShowPaymentModal(true);
  };

  const closePaymentModal =
    () => {
      if (paying) return;

      setShowPaymentModal(
        false
      );

      setSelectedSalary(null);
    };

  const handleMarkPaid =
    async () => {
      if (
        !selectedSalary?._id
      ) {
        return;
      }

      const result =
        await dispatch(
          markSalaryPaid({
            id: selectedSalary._id,

            paymentMethod:
              selectedPaymentMethod,

            paymentDate:
              new Date().toISOString(),
          })
        );

      if (
        markSalaryPaid.fulfilled.match(
          result
        )
      ) {
        setShowPaymentModal(
          false
        );

        setSelectedSalary(null);

        Alert.alert(
          "Payment Successful",
          "Salary has been marked as paid."
        );

        await loadData();
      } else {
        Alert.alert(
          "Payment Failed",
          result.payload ||
            "Unable to mark salary as paid."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | MARK PENDING
  |--------------------------------------------------------------------------
  */

  const handleMarkPending = (
    row: SalaryRow
  ) => {
    if (!row._id) return;

    Alert.alert(
      "Mark as Pending",
      `Are you sure you want to mark ${row.stylist.name}'s salary as pending?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Yes",
          onPress: async () => {
            const result =
              await dispatch(
                markSalaryPending(
                  row._id as string
                )
              );

            if (
              markSalaryPending.fulfilled.match(
                result
              )
            ) {
              await loadData();
            } else {
              Alert.alert(
                "Error",
                result.payload ||
                  "Unable to update salary status."
              );
            }
          },
        },
      ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER SALARY CARD
  |--------------------------------------------------------------------------
  */

  const renderSalary = ({
    item,
  }: {
    item: SalaryRow;
  }) => {
    const stylist =
      item.stylist;

    const isPaid =
      item.paymentStatus ===
      "PAID";

    return (
      <View
        style={
          styles.salaryCard
        }
      >
        {/* TOP */}

        <View
          style={
            styles.salaryTopRow
          }
        >
          <View
            style={
              styles.staffInfo
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
                {getInitials(
                  stylist.name
                )}
              </Text>
            </View>

            <View
              style={
                styles.staffTextContainer
              }
            >
              <Text
                style={
                  styles.staffName
                }
                numberOfLines={1}
              >
                {stylist.name}
              </Text>

              <Text
                style={
                  styles.staffSpecialization
                }
                numberOfLines={1}
              >
                {stylist.specialization ||
                  "Salon Staff"}
              </Text>

              {!!stylist.phone && (
                <Text
                  style={
                    styles.staffPhone
                  }
                >
                  {stylist.phone}
                </Text>
              )}
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              isPaid
                ? styles.paidBadge
                : styles.pendingBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isPaid
                  ? styles.paidDot
                  : styles.pendingDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                isPaid
                  ? styles.paidText
                  : styles.pendingText,
              ]}
            >
              {item.generated
                ? isPaid
                  ? "PAID"
                  : "PENDING"
                : "NOT GENERATED"}
            </Text>
          </View>
        </View>

        <View
          style={styles.divider}
        />

        {/* SALARY GRID */}

        <View
          style={styles.salaryGrid}
        >
          <SalaryAmount
            label="Basic"
            value={
              item.basicSalary
            }
          />

          <SalaryAmount
            label="Overtime"
            value={
              item.overtimeSalary
            }
          />

          <SalaryAmount
            label="Bonus"
            value={item.bonus}
          />

          <SalaryAmount
            label="Commission"
            value={
              item.commission
            }
          />
        </View>

        {/* SECONDARY */}

        <View
          style={
            styles.secondaryRow
          }
        >
          <View
            style={
              styles.secondaryItem
            }
          >
            <Text
              style={
                styles.secondaryLabel
              }
            >
              Advance
            </Text>

            <Text
              style={
                styles.deductionValue
              }
            >
              -{formatMoney(
                item.advance
              )}
            </Text>
          </View>

          <View
            style={
              styles.secondaryItem
            }
          >
            <Text
              style={
                styles.secondaryLabel
              }
            >
              Deduction
            </Text>

            <Text
              style={
                styles.deductionValue
              }
            >
              -{formatMoney(
                item.deduction
              )}
            </Text>
          </View>

          <View
            style={
              styles.secondaryItem
            }
          >
            <Text
              style={
                styles.secondaryLabel
              }
            >
              Gross
            </Text>

            <Text
              style={
                styles.grossValue
              }
            >
              {formatMoney(
                item.grossSalary
              )}
            </Text>
          </View>
        </View>

        {/* NET */}

        <View
          style={
            styles.netSalaryRow
          }
        >
          <View>
            <Text
              style={
                styles.netLabel
              }
            >
              Net Salary
            </Text>

            <Text
              style={
                styles.netSubText
              }
            >
              {item.generated
                ? item.attendance
                  ? `${
                      item.attendance
                        .presentDays ||
                      0
                    } present • ${Number(
                      item.attendance
                        .overtimeHours ||
                        0
                    ).toFixed(1)}h OT`
                  : "Salary generated"
                : "Salary not generated yet"}
            </Text>
          </View>

          <Text
            style={
              styles.netSalary
            }
          >
            {formatMoney(
              item.netSalary
            )}
          </Text>
        </View>

        {/* ACTIONS */}

        <View
          style={styles.actionRow}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={
              styles.editButton
            }
            onPress={() =>
              openGenerateModal(
                item
              )
            }
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#111827"
            />

            <Text
              style={
                styles.editButtonText
              }
            >
              {item.generated
                ? "Edit Salary"
                : "Generate Salary"}
            </Text>
          </TouchableOpacity>

          {item.generated &&
            (isPaid ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.pendingButton
                }
                onPress={() =>
                  handleMarkPending(
                    item
                  )
                }
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color="#92400E"
                />

                <Text
                  style={
                    styles.pendingButtonText
                  }
                >
                  Mark Pending
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.payButton
                }
                onPress={() =>
                  openPaymentModal(
                    item
                  )
                }
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.payButtonText
                  }
                >
                  Mark Paid
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | EMPTY
  |--------------------------------------------------------------------------
  */

  const renderEmpty = () => {
    if (
      loading ||
      stylistsLoading
    ) {
      return (
        <View
          style={
            styles.emptyContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#111827"
          />

          <Text
            style={
              styles.emptyTitle
            }
          >
            Loading staff...
          </Text>
        </View>
      );
    }

    return (
      <View
        style={
          styles.emptyContainer
        }
      >
        <View
          style={
            styles.emptyIcon
          }
        >
          <Ionicons
            name="people-outline"
            size={36}
            color="#9CA3AF"
          />
        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          No staff found
        </Text>

        <Text
          style={
            styles.emptyDescription
          }
        >
          No active staff members
          are available.
        </Text>
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | HEADER
  |--------------------------------------------------------------------------
  */

  const header = (
    <>
      <View
        style={styles.header}
      >
        <View>
          <Text
            style={
              styles.headerTitle
            }
          >
            Salary
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Staff salary management
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles.headerIconButton
          }
          activeOpacity={0.8}
          onPress={onRefresh}
        >
          <Ionicons
            name="refresh-outline"
            size={22}
            color="#111827"
          />
        </TouchableOpacity>
      </View>

      {/* MONTH */}

      <View
        style={
          styles.monthSelector
        }
      >
        <TouchableOpacity
          style={
            styles.monthArrow
          }
          onPress={() =>
            changeMonth("prev")
          }
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color="#111827"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.monthCenter
          }
          onPress={() =>
            setShowMonthPicker(
              true
            )
          }
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#111827"
          />

          <Text
            style={
              styles.monthText
            }
          >
            {getMonthLabel(
              selectedMonth
            )}
          </Text>

          <Ionicons
            name="chevron-down"
            size={16}
            color="#6B7280"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.monthArrow
          }
          onPress={() =>
            changeMonth("next")
          }
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#111827"
          />
        </TouchableOpacity>
      </View>

      {/* SUMMARY */}

      <View
        style={
          styles.summaryGrid
        }
      >
        <SummaryCard
          icon="people-outline"
          label="Staff"
          value={String(
            staffCount
          )}
        />

        <SummaryCard
          icon="wallet-outline"
          label="Total"
          value={formatMoney(
            totalNet
          )}
        />

        <SummaryCard
          icon="checkmark-circle-outline"
          label="Paid"
          value={formatMoney(
            totalPaid
          )}
        />

        <SummaryCard
          icon="time-outline"
          label="Pending"
          value={formatMoney(
            totalPending
          )}
        />
      </View>

      {/* SEARCH */}

      <View
        style={
          styles.searchContainer
        }
      >
        <Ionicons
          name="search-outline"
          size={20}
          color="#9CA3AF"
        />

        <TextInput
          value={search}
          onChangeText={(value) =>
            dispatch(
              setSearch(value)
            )
          }
          placeholder="Search staff by name or phone"
          placeholderTextColor="#9CA3AF"
          style={
            styles.searchInput
          }
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              dispatch(
                setSearch("")
              )
            }
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTER */}

      <View
        style={styles.filterRow}
      >
        <FilterButton
          label="All"
          active={status === ""}
          onPress={() =>
            dispatch(
              setStatus("")
            )
          }
        />

        <FilterButton
          label={`Pending ${pendingCount}`}
          active={
            status === "PENDING"
          }
          onPress={() =>
            dispatch(
              setStatus(
                "PENDING"
              )
            )
          }
        />

        <FilterButton
          label={`Paid ${paidCount}`}
          active={
            status === "PAID"
          }
          onPress={() =>
            dispatch(
              setStatus("PAID")
            )
          }
        />
      </View>

      {error && (
        <View
          style={
            styles.errorBox
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color="#B91C1C"
          />

          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>
        </View>
      )}

      <Text
        style={
          styles.sectionTitle
        }
      >
        Salary Details
      </Text>
    </>
  );

  /*
  |--------------------------------------------------------------------------
  | RETURN
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <FlatList
        data={filteredRows}
        keyExtractor={(item) =>
          item.key
        }
        renderItem={
          renderSalary
        }
        ListHeaderComponent={
          header
        }
        ListEmptyComponent={
          renderEmpty
        }
        contentContainerStyle={[
          styles.listContent,
          filteredRows.length ===
            0 &&
            styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor="#111827"
          />
        }
        showsVerticalScrollIndicator={
          false
        }
      />

      {/* =====================================================
          MONTH MODAL
      ===================================================== */}

      <Modal
        visible={
          showMonthPicker
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowMonthPicker(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setShowMonthPicker(
              false
            )
          }
        >
          <Pressable
            style={
              styles.monthModal
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              Select Month
            </Text>

            <Text
              style={
                styles.modalSubtitle
              }
            >
              Choose salary month
            </Text>

            <View
              style={
                styles.monthModalGrid
              }
            >
              {MONTH_NAMES.map(
                (
                  monthName,
                  index
                ) => {
                  const year =
                    Number(
                      selectedMonth.split(
                        "-"
                      )[0]
                    ) ||
                    new Date().getFullYear();

                  const monthValue =
                    `${year}-${String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}`;

                  const active =
                    monthValue ===
                    selectedMonth;

                  return (
                    <TouchableOpacity
                      key={
                        monthValue
                      }
                      style={[
                        styles.monthOption,
                        active &&
                          styles.monthOptionActive,
                      ]}
                      onPress={() => {
                        dispatch(
                          setSelectedMonth(
                            monthValue
                          )
                        );

                        setShowMonthPicker(
                          false
                        );
                      }}
                    >
                      <Text
                        style={[
                          styles.monthOptionText,
                          active &&
                            styles.monthOptionTextActive,
                        ]}
                      >
                        {monthName.slice(
                          0,
                          3
                        )}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            <TouchableOpacity
              style={
                styles.closeModalButton
              }
              onPress={() =>
                setShowMonthPicker(
                  false
                )
              }
            >
              <Text
                style={
                  styles.closeModalText
                }
              >
                Close
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* =====================================================
          GENERATE / EDIT SALARY MODAL
      ===================================================== */}

      <Modal
        visible={
          showGenerateModal
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeGenerateModal
        }
      >
        <View
          style={
            styles.bottomModalOverlay
          }
        >
          <View
            style={
              styles.bottomModal
            }
          >
            <View
              style={
                styles.modalHandle
              }
            />

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={
                  styles.modalHeaderRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    {selectedSalary
                      ?.generated
                      ? "Edit Salary"
                      : "Generate Salary"}
                  </Text>

                  <Text
                    style={
                      styles.modalSubtitle
                    }
                  >
                    {selectedSalary
                      ?.stylist
                      ?.name ||
                      "Staff"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={
                    closeGenerateModal
                  }
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={28}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {/* BASIC */}

              <View
                style={
                  styles.readOnlySalaryBox
                }
              >
                <View>
                  <Text
                    style={
                      styles.readOnlyLabel
                    }
                  >
                    Basic Salary
                  </Text>

                  <Text
                    style={
                      styles.readOnlyValue
                    }
                  >
                    {formatMoney(
                      selectedSalary
                        ?.basicSalary
                    )}
                  </Text>
                </View>

                <View>
                  <Text
                    style={
                      styles.readOnlyLabel
                    }
                  >
                    Monthly Salary
                  </Text>

                  <Text
                    style={
                      styles.readOnlyValue
                    }
                  >
                    {formatMoney(
                      selectedSalary
                        ?.stylist
                        ?.monthlySalary
                    )}
                  </Text>
                </View>
              </View>

              <SalaryInput
                label="Commission"
                value={
                  commission
                }
                onChangeText={
                  setCommission
                }
                placeholder="0"
              />

              <SalaryInput
                label="Bonus"
                value={bonus}
                onChangeText={
                  setBonus
                }
                placeholder="0"
              />

              <SalaryInput
                label="Advance"
                value={
                  advance
                }
                onChangeText={
                  setAdvance
                }
                placeholder="0"
              />

              <SalaryInput
                label="Deduction"
                value={
                  deduction
                }
                onChangeText={
                  setDeduction
                }
                placeholder="0"
              />

              <Text
                style={
                  styles.inputLabel
                }
              >
                Notes
              </Text>

              <TextInput
                value={notes}
                onChangeText={
                  setNotes
                }
                placeholder="Optional notes"
                placeholderTextColor="#9CA3AF"
                multiline
                style={
                  styles.notesInput
                }
              />

              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.generateButton
                }
                onPress={
                  handleGenerateSalary
                }
                disabled={
                  generating
                }
              >
                {generating ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="calculator-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.generateButtonText
                      }
                    >
                      {selectedSalary
                        ?.generated
                        ? "Update Salary"
                        : "Generate Salary"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          PAYMENT MODAL
      ===================================================== */}

      <Modal
        visible={
          showPaymentModal
        }
        transparent
        animationType="slide"
        onRequestClose={
          closePaymentModal
        }
      >
        <View
          style={
            styles.bottomModalOverlay
          }
        >
          <View
            style={
              styles.paymentModal
            }
          >
            <View
              style={
                styles.modalHandle
              }
            />

            <View
              style={
                styles.modalHeaderRow
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Mark Salary Paid
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {selectedSalary
                    ?.stylist
                    ?.name ||
                    "Staff"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={
                  closePaymentModal
                }
              >
                <Ionicons
                  name="close-circle-outline"
                  size={28}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.paymentAmountBox
              }
            >
              <Text
                style={
                  styles.paymentAmountLabel
                }
              >
                Net Salary
              </Text>

              <Text
                style={
                  styles.paymentAmount
                }
              >
                {formatMoney(
                  selectedSalary
                    ?.netSalary
                )}
              </Text>
            </View>

            <Text
              style={
                styles.inputLabel
              }
            >
              Payment Method
            </Text>

            <View
              style={
                styles.paymentMethods
              }
            >
              {PAYMENT_METHODS.map(
                (method) => {
                  const active =
                    selectedPaymentMethod ===
                    method;

                  return (
                    <TouchableOpacity
                      key={
                        method
                      }
                      style={[
                        styles.paymentMethodButton,
                        active &&
                          styles.paymentMethodActive,
                      ]}
                      onPress={() =>
                        setSelectedPaymentMethod(
                          method
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.paymentMethodText,
                          active &&
                            styles.paymentMethodTextActive,
                        ]}
                      >
                        {method.replace(
                          "_",
                          " "
                        )}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={
                styles.payConfirmButton
              }
              onPress={
                handleMarkPaid
              }
              disabled={paying}
            >
              {paying ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.payConfirmText
                    }
                  >
                    Confirm Payment
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| COMPONENTS
|--------------------------------------------------------------------------
*/

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
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
        <Ionicons
          name={icon}
          size={19}
          color="#111827"
        />
      </View>

      <Text
        style={
          styles.summaryLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.summaryValue
        }
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function SalaryAmount({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View
      style={
        styles.salaryAmount
      }
    >
      <Text
        style={
          styles.salaryAmountLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.salaryAmountValue
        }
      >
        {formatMoney(value)}
      </Text>
    </View>
  );
}

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        active &&
          styles.filterButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          active &&
            styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SalaryInput({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (
    value: string
  ) => void;
  placeholder: string;
}) {
  return (
    <View>
      <Text
        style={
          styles.inputLabel
        }
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        placeholder={
          placeholder
        }
        placeholderTextColor="#9CA3AF"
        keyboardType="numeric"
        style={
          styles.textInput
        }
      />
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    listContent: {
      padding: 16,
      paddingBottom: 40,
    },

    emptyListContent: {
      flexGrow: 1,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 16,
    },

    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: "#111827",
    },

    headerSubtitle: {
      marginTop: 3,
      fontSize: 13,
      color: "#6B7280",
    },

    headerIconButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
    },

    monthSelector: {
      height: 52,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 14,
    },

    monthArrow: {
      width: 52,
      height: 52,
      alignItems: "center",
      justifyContent:
        "center",
    },

    monthCenter: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
    },

    monthText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#111827",
    },

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 14,
    },

    summaryCard: {
      width: "48%",
      minHeight: 106,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
    },

    summaryIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor:
        "#F3F4F6",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 8,
    },

    summaryLabel: {
      fontSize: 12,
      color: "#6B7280",
    },

    summaryValue: {
      marginTop: 4,
      fontSize: 18,
      fontWeight: "800",
      color: "#111827",
    },

    searchContainer: {
      height: 50,
      borderRadius: 15,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      marginBottom: 12,
    },

    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 14,
      color: "#111827",
    },

    filterRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 18,
    },

    filterButton: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
    },

    filterButtonActive: {
      backgroundColor:
        "#111827",
      borderColor:
        "#111827",
    },

    filterButtonText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#6B7280",
    },

    filterButtonTextActive: {
      color: "#FFFFFF",
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#111827",
      marginBottom: 12,
    },

    salaryCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
    },

    salaryTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    staffInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: 10,
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor:
        "#F3F4F6",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    avatarText: {
      fontSize: 15,
      fontWeight: "800",
      color: "#111827",
    },

    staffTextContainer: {
      flex: 1,
    },

    staffName: {
      fontSize: 15,
      fontWeight: "800",
      color: "#111827",
    },

    staffSpecialization: {
      marginTop: 3,
      fontSize: 12,
      color: "#6B7280",
    },

    staffPhone: {
      marginTop: 2,
      fontSize: 11,
      color: "#9CA3AF",
    },

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 20,
    },

    paidBadge: {
      backgroundColor:
        "#ECFDF5",
    },

    pendingBadge: {
      backgroundColor:
        "#FFFBEB",
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginRight: 5,
    },

    paidDot: {
      backgroundColor:
        "#10B981",
    },

    pendingDot: {
      backgroundColor:
        "#F59E0B",
    },

    statusText: {
      fontSize: 9,
      fontWeight: "800",
    },

    paidText: {
      color: "#047857",
    },

    pendingText: {
      color: "#92400E",
    },

    divider: {
      height: 1,
      backgroundColor:
        "#F1F5F9",
      marginVertical: 14,
    },

    salaryGrid: {
      flexDirection: "row",
      justifyContent:
        "space-between",
    },

    salaryAmount: {
      flex: 1,
    },

    salaryAmountLabel: {
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 4,
    },

    salaryAmountValue: {
      fontSize: 13,
      fontWeight: "700",
      color: "#111827",
    },

    secondaryRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginTop: 16,
    },

    secondaryItem: {
      flex: 1,
    },

    secondaryLabel: {
      fontSize: 11,
      color: "#9CA3AF",
      marginBottom: 4,
    },

    deductionValue: {
      fontSize: 12,
      fontWeight: "700",
      color: "#DC2626",
    },

    grossValue: {
      fontSize: 12,
      fontWeight: "800",
      color: "#111827",
    },

    netSalaryRow: {
      marginTop: 16,
      padding: 14,
      borderRadius: 15,
      backgroundColor:
        "#F8FAFC",
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    netLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: "#111827",
    },

    netSubText: {
      marginTop: 3,
      fontSize: 10,
      color: "#9CA3AF",
    },

    netSalary: {
      fontSize: 19,
      fontWeight: "900",
      color: "#111827",
    },

    actionRow: {
      flexDirection: "row",
      gap: 9,
      marginTop: 14,
    },

    editButton: {
      flex: 1,
      height: 44,
      borderRadius: 13,
      backgroundColor:
        "#F3F4F6",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
    },

    editButtonText: {
      fontSize: 12,
      fontWeight: "800",
      color: "#111827",
    },

    payButton: {
      flex: 1,
      height: 44,
      borderRadius: 13,
      backgroundColor:
        "#111827",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
    },

    payButtonText: {
      fontSize: 12,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    pendingButton: {
      flex: 1,
      height: 44,
      borderRadius: 13,
      backgroundColor:
        "#FEF3C7",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
    },

    pendingButtonText: {
      fontSize: 12,
      fontWeight: "800",
      color: "#92400E",
    },

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingVertical: 80,
    },

    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 24,
      backgroundColor:
        "#F3F4F6",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 14,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: "#111827",
    },

    emptyDescription: {
      marginTop: 6,
      fontSize: 13,
      color: "#9CA3AF",
      textAlign: "center",
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#FEF2F2",
      borderRadius: 13,
      padding: 12,
      marginBottom: 14,
      gap: 8,
    },

    errorText: {
      flex: 1,
      color: "#B91C1C",
      fontSize: 12,
      fontWeight: "600",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent:
        "center",
      padding: 20,
    },

    monthModal: {
      width: "100%",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 24,
      padding: 20,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#111827",
    },

    modalSubtitle: {
      marginTop: 4,
      fontSize: 12,
      color: "#9CA3AF",
    },

    monthModalGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 20,
    },

    monthOption: {
      width: "22%",
      paddingVertical: 13,
      borderRadius: 12,
      backgroundColor:
        "#F3F4F6",
      alignItems: "center",
    },

    monthOptionActive: {
      backgroundColor:
        "#111827",
    },

    monthOptionText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#374151",
    },

    monthOptionTextActive: {
      color: "#FFFFFF",
    },

    closeModalButton: {
      height: 46,
      borderRadius: 13,
      backgroundColor:
        "#F3F4F6",
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 18,
    },

    closeModalText: {
      fontSize: 13,
      fontWeight: "800",
      color: "#111827",
    },

    bottomModalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor:
        "rgba(0,0,0,0.35)",
    },

    bottomModal: {
      maxHeight: "88%",
      backgroundColor:
        "#FFFFFF",
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      padding: 20,
      paddingBottom: 30,
    },

    paymentModal: {
      backgroundColor:
        "#FFFFFF",
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      padding: 20,
      paddingBottom: 30,
    },

    modalHandle: {
      width: 42,
      height: 5,
      borderRadius: 4,
      backgroundColor:
        "#D1D5DB",
      alignSelf: "center",
      marginBottom: 18,
    },

    modalHeaderRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 20,
    },

    readOnlySalaryBox: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      backgroundColor:
        "#F8FAFC",
      padding: 15,
      borderRadius: 15,
      marginBottom: 18,
    },

    readOnlyLabel: {
      fontSize: 11,
      color: "#9CA3AF",
    },

    readOnlyValue: {
      marginTop: 4,
      fontSize: 16,
      fontWeight: "800",
      color: "#111827",
    },

    inputLabel: {
      fontSize: 12,
      fontWeight: "800",
      color: "#374151",
      marginBottom: 7,
      marginTop: 5,
    },

    textInput: {
      height: 48,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      paddingHorizontal: 14,
      fontSize: 14,
      color: "#111827",
      marginBottom: 10,
      backgroundColor:
        "#FFFFFF",
    },

    notesInput: {
      minHeight: 85,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: "#111827",
      textAlignVertical: "top",
      marginBottom: 15,
    },

    generateButton: {
      height: 50,
      borderRadius: 14,
      backgroundColor:
        "#111827",
      alignItems: "center",
      justifyContent:
        "center",
      flexDirection: "row",
      gap: 8,
      marginTop: 5,
    },

    generateButtonText: {
      fontSize: 14,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    paymentAmountBox: {
      backgroundColor:
        "#F8FAFC",
      borderRadius: 16,
      padding: 18,
      alignItems: "center",
      marginBottom: 20,
    },

    paymentAmountLabel: {
      fontSize: 12,
      color: "#6B7280",
    },

    paymentAmount: {
      marginTop: 4,
      fontSize: 28,
      fontWeight: "900",
      color: "#111827",
    },

    paymentMethods: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 9,
      marginBottom: 18,
    },

    paymentMethodButton: {
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 12,
      backgroundColor:
        "#F3F4F6",
    },

    paymentMethodActive: {
      backgroundColor:
        "#111827",
    },

    paymentMethodText: {
      fontSize: 11,
      fontWeight: "800",
      color: "#6B7280",
    },

    paymentMethodTextActive: {
      color: "#FFFFFF",
    },

    payConfirmButton: {
      height: 50,
      borderRadius: 14,
      backgroundColor:
        "#111827",
      alignItems: "center",
      justifyContent:
        "center",
      flexDirection: "row",
      gap: 8,
    },

    payConfirmText: {
      fontSize: 14,
      fontWeight: "800",
      color: "#FFFFFF",
    },
  });