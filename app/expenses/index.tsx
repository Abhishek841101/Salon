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
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import DateTimePicker from "@react-native-community/datetimepicker";

import { router } from "expo-router";

import { useDispatch, useSelector } from "react-redux";

import type {
  AppDispatch,
  RootState,
} from "../../src/store";

import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  fetchExpenseSummary,
  updateExpense,
} from "../../src/features/expense/expenseSlice";

import type {
  Expense,
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpensePeriod,
  ExpenseStatus,
} from "../../src/features/expense/expenseSlice";

// ======================================================
// COLORS
// ======================================================

const COLORS = {
  background: "#F8F2EF",
  card: "#FFFFFF",
  primary: "#8A243B",
  primaryDark: "#702038",
  primarySoft: "#F8E8E6",
  primaryVerySoft: "#FFF7F5",
  text: "#33282C",
  textDark: "#403337",
  textMuted: "#95868B",
  textLight: "#A4979B",
  border: "#E7DAD7",
  divider: "#EFE5E2",
  success: "#2E8B57",
  successSoft: "#EAF6EF",
  warning: "#C77700",
  warningSoft: "#FFF4E3",
  danger: "#C0392B",
  dangerSoft: "#FDECEA",
  white: "#FFFFFF",
};

// ======================================================
// OPTIONS
// ======================================================

const CATEGORIES: ExpenseCategory[] = [
  "Staff Salary",
  "Product Purchase",
  "Rent",
  "Electricity",
  "Maintenance",
  "Marketing",
  "Water",
  "Internet",
  "Equipment",
  "Other",
];

const PAYMENT_METHODS: ExpensePaymentMethod[] = [
  "Cash",
  "UPI",
  "Card",
  "Bank Transfer",
  "Other",
];

const STATUS_OPTIONS: ExpenseStatus[] = [
  "Paid",
  "Pending",
];

type FilterPeriod =
  | "today"
  | "7days"
  | "month"
  | "year";

// ======================================================
// HELPERS
// ======================================================

const formatCurrency = (value: number) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const formatDate = (date?: string) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toDateInput = (date: Date) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getPeriodLabel = (
  period: FilterPeriod
) => {
  switch (period) {
    case "today":
      return "Today";

    case "7days":
      return "Last 7 Days";

    case "month":
      return "This Month";

    case "year":
      return "This Year";

    default:
      return "This Month";
  }
};

const getCategoryIcon = (
  category: string
): keyof typeof Ionicons.glyphMap => {
  switch (category) {
    case "Staff Salary":
      return "people-outline";

    case "Product Purchase":
      return "cube-outline";

    case "Rent":
      return "home-outline";

    case "Electricity":
      return "flash-outline";

    case "Maintenance":
      return "construct-outline";

    case "Marketing":
      return "megaphone-outline";

    case "Water":
      return "water-outline";

    case "Internet":
      return "wifi-outline";

    case "Equipment":
      return "hardware-chip-outline";

    default:
      return "receipt-outline";
  }
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function ExpensesScreen() {
  const dispatch =
    useDispatch<AppDispatch>();

  // ====================================================
  // REDUX STATE
  // ====================================================

  const expenses = useSelector(
    (state: RootState) =>
      state.expense?.expenses || []
  );

  const summary = useSelector(
    (state: RootState) =>
      state.expense?.summary || null
  );

  const loading = useSelector(
    (state: RootState) =>
      state.expense?.loading || false
  );

  const creating = useSelector(
    (state: RootState) =>
      state.expense?.creating || false
  );

  const updating = useSelector(
    (state: RootState) =>
      state.expense?.updating || false
  );

  const deleting = useSelector(
    (state: RootState) =>
      state.expense?.deleting || false
  );

  const summaryLoading =
    useSelector(
      (state: RootState) =>
        state.expense?.summaryLoading ||
        false
    );

  const error = useSelector(
    (state: RootState) =>
      state.expense?.error || null
  );

  const summaryError =
    useSelector(
      (state: RootState) =>
        state.expense?.summaryError ||
        null
    );

  // ====================================================
  // LOCAL STATE
  // ====================================================

  const [period, setPeriod] =
    useState<FilterPeriod>("month");

  const [periodMenu, setPeriodMenu] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingExpense, setEditingExpense] =
    useState<Expense | null>(null);

  const [categoryMenu, setCategoryMenu] =
    useState(false);

  const [paymentMenu, setPaymentMenu] =
    useState(false);

  const [statusMenu, setStatusMenu] =
    useState(false);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  // ====================================================
  // FORM STATE
  // ====================================================

  const [title, setTitle] =
    useState("");

  const [category, setCategory] =
    useState<ExpenseCategory>(
      "Other"
    );

  const [amount, setAmount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<ExpensePaymentMethod>(
      "Cash"
    );

  const [paidTo, setPaidTo] =
    useState("");

  const [expenseDate, setExpenseDate] =
    useState(new Date());

  const [notes, setNotes] =
    useState("");

  const [status, setStatus] =
    useState<ExpenseStatus>("Paid");

  // ====================================================
  // LOAD DATA
  // ====================================================

  const loadData = useCallback(
    async (
      selectedPeriod: FilterPeriod = period
    ) => {
      await Promise.all([
        dispatch(
          fetchExpenses({
            active: true,
            limit: 100,
          })
        ),

        dispatch(
          fetchExpenseSummary({
            period: selectedPeriod,
          })
        ),
      ]);
    },
    [dispatch, period]
  );

  useEffect(() => {
    loadData(period);
  }, []);

  // ====================================================
  // PERIOD CHANGE
  // ====================================================

  const handlePeriodChange = async (
    value: FilterPeriod
  ) => {
    setPeriod(value);

    setPeriodMenu(false);

    await dispatch(
      fetchExpenseSummary({
        period: value,
      })
    );
  };

  // ====================================================
  // REFRESH
  // ====================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadData(period);

    setRefreshing(false);
  };

  // ====================================================
  // FILTERED LIST
  // ====================================================

  const filteredExpenses = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return expenses;
    }

    return expenses.filter((item) => {
      return (
        item.title
          ?.toLowerCase()
          .includes(query) ||
        item.category
          ?.toLowerCase()
          .includes(query) ||
        item.paidTo
          ?.toLowerCase()
          .includes(query) ||
        item.paymentMethod
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [expenses, search]);

  // ====================================================
  // FORM RESET
  // ====================================================

  const resetForm = () => {
    setTitle("");

    setCategory("Other");

    setAmount("");

    setPaymentMethod("Cash");

    setPaidTo("");

    setExpenseDate(new Date());

    setNotes("");

    setStatus("Paid");

    setEditingExpense(null);

    setCategoryMenu(false);

    setPaymentMenu(false);

    setStatusMenu(false);
  };

  // ====================================================
  // OPEN CREATE
  // ====================================================

  const openCreateForm = () => {
    resetForm();

    setShowForm(true);
  };

  // ====================================================
  // OPEN EDIT
  // ====================================================

  const openEditForm = (
    expense: Expense
  ) => {
    setEditingExpense(expense);

    setTitle(expense.title);

    setCategory(expense.category);

    setAmount(
      String(expense.amount ?? "")
    );

    setPaymentMethod(
      expense.paymentMethod
    );

    setPaidTo(
      expense.paidTo || ""
    );

    setExpenseDate(
      expense.expenseDate
        ? new Date(expense.expenseDate)
        : new Date()
    );

    setNotes(
      expense.notes || ""
    );

    setStatus(
      expense.status || "Paid"
    );

    setShowForm(true);
  };

  // ====================================================
  // SAVE EXPENSE
  // ====================================================

  const handleSave = async () => {
    const cleanTitle =
      title.trim();

    const numericAmount =
      Number(amount);

    if (!cleanTitle) {
      Alert.alert(
        "Required",
        "Please enter expense title."
      );

      return;
    }

    if (
      !amount.trim() ||
      Number.isNaN(numericAmount) ||
      numericAmount < 0
    ) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid expense amount."
      );

      return;
    }

    if (editingExpense) {
      const result = await dispatch(
        updateExpense({
          id: editingExpense._id,

          data: {
            title: cleanTitle,

            category,

            amount: numericAmount,

            paymentMethod,

            paidTo: paidTo.trim(),

            expenseDate:
              expenseDate.toISOString(),

            notes: notes.trim(),

            status,
          },
        })
      );

      if (
        updateExpense.fulfilled.match(
          result
        )
      ) {
        setShowForm(false);

        resetForm();

        await loadData(period);

        Alert.alert(
          "Success",
          "Expense updated successfully."
        );
      } else {
        Alert.alert(
          "Error",
          String(
            result.payload ||
              "Failed to update expense"
          )
        );
      }

      return;
    }

    const result = await dispatch(
      createExpense({
        title: cleanTitle,

        category,

        amount: numericAmount,

        paymentMethod,

        paidTo: paidTo.trim(),

        expenseDate:
          expenseDate.toISOString(),

        notes: notes.trim(),

        status,
      })
    );

    if (
      createExpense.fulfilled.match(
        result
      )
    ) {
      setShowForm(false);

      resetForm();

      await loadData(period);

      Alert.alert(
        "Success",
        "Expense added successfully."
      );
    } else {
      Alert.alert(
        "Error",
        String(
          result.payload ||
            "Failed to create expense"
        )
      );
    }
  };

  // ====================================================
  // DELETE
  // ====================================================

  const handleDelete = (
    expense: Expense
  ) => {
    Alert.alert(
      "Delete Expense",
      `Delete "${expense.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            const result =
              await dispatch(
                deleteExpense(
                  expense._id
                )
              );

            if (
              deleteExpense.fulfilled.match(
                result
              )
            ) {
              await loadData(period);
            } else {
              Alert.alert(
                "Error",
                String(
                  result.payload ||
                    "Failed to delete expense"
                )
              );
            }
          },
        },
      ]
    );
  };

  // ====================================================
  // SUMMARY VALUES
  // ====================================================

  const totalExpense =
    Number(
      summary?.totalExpense || 0
    );

  const paidExpense =
    Number(
      summary?.paidExpense || 0
    );

  const pendingExpense =
    Number(
      summary?.pendingExpense || 0
    );

  const expenseCount =
    Number(
      summary?.totalExpenses || 0
    );

  // ====================================================
  // CATEGORY SUMMARY
  // ====================================================

  const categorySummary =
    summary?.byCategory || [];

  // ====================================================
  // RENDER EXPENSE
  // ====================================================

  const renderExpense = ({
    item,
  }: {
    item: Expense;
  }) => {
    const isPending =
      item.status === "Pending";

    return (
      <View style={styles.expenseCard}>
        <View style={styles.expenseIcon}>
          <Ionicons
            name={getCategoryIcon(
              item.category
            )}
            size={21}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.expenseMiddle}>
          <Text
            style={styles.expenseTitle}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            style={styles.expenseCategory}
          >
            {item.category}
          </Text>

          <View style={styles.expenseMeta}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={COLORS.textMuted}
            />

            <Text
              style={styles.expenseMetaText}
            >
              {formatDate(
                item.expenseDate
              )}
            </Text>

            {!!item.paidTo && (
              <>
                <View
                  style={
                    styles.metaDot
                  }
                />

                <Ionicons
                  name="person-outline"
                  size={13}
                  color={
                    COLORS.textMuted
                  }
                />

                <Text
                  style={
                    styles.expenseMetaText
                  }
                  numberOfLines={1}
                >
                  {item.paidTo}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.expenseRight}>
          <Text
            style={styles.expenseAmount}
          >
            {formatCurrency(
              item.amount
            )}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  isPending
                    ? COLORS.warningSoft
                    : COLORS.successSoft,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    isPending
                      ? COLORS.warning
                      : COLORS.success,
                },
              ]}
            >
              {item.status}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={styles.smallAction}
              onPress={() =>
                openEditForm(item)
              }
            >
              <Ionicons
                name="create-outline"
                size={17}
                color={COLORS.primary}
              />
            </Pressable>

            <Pressable
              style={styles.smallAction}
              onPress={() =>
                handleDelete(item)
              }
            >
              <Ionicons
                name="trash-outline"
                size={17}
                color={COLORS.danger}
              />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  // ====================================================
  // EMPTY
  // ====================================================

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyBox}>
        <View
          style={styles.emptyIcon}
        >
          <Ionicons
            name="receipt-outline"
            size={30}
            color={COLORS.primary}
          />
        </View>

        <Text
          style={styles.emptyTitle}
        >
          No expenses found
        </Text>

        <Text
          style={styles.emptyText}
        >
          Add your first salon expense
          to start tracking your
          business spending.
        </Text>

        <Pressable
          style={styles.emptyButton}
          onPress={openCreateForm}
        >
          <Ionicons
            name="add"
            size={18}
            color={COLORS.white}
          />

          <Text
            style={
              styles.emptyButtonText
            }
          >
            Add Expense
          </Text>
        </Pressable>
      </View>
    );
  };

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View style={styles.container}>
        {/* ==========================================
            HEADER
        ========================================== */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              style={styles.backButton}
              onPress={() =>
                router.back()
              }
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={COLORS.textDark}
              />
            </Pressable>

            <View>
              <Text
                style={styles.headerTitle}
              >
                Expenses
              </Text>

              <Text
                style={styles.headerSubtitle}
              >
                Track your salon spending
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={openCreateForm}
          >
            <Ionicons
              name="add"
              size={21}
              color={COLORS.white}
            />

            <Text
              style={styles.addButtonText}
            >
              Add
            </Text>
          </Pressable>
        </View>

        {/* ==========================================
            PERIOD FILTER
        ========================================== */}

        <View style={styles.filterRow}>
          <Pressable
            style={styles.periodButton}
            onPress={() =>
              setPeriodMenu(
                !periodMenu
              )
            }
          >
            <Ionicons
              name="calendar-outline"
              size={17}
              color={COLORS.primary}
            />

            <Text
              style={
                styles.periodButtonText
              }
            >
              {getPeriodLabel(
                period
              )}
            </Text>

            <Ionicons
              name={
                periodMenu
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={16}
              color={COLORS.textMuted}
            />
          </Pressable>
        </View>

        {periodMenu && (
          <View
            style={styles.periodMenu}
          >
            {(
              [
                ["today", "Today"],
                [
                  "7days",
                  "Last 7 Days",
                ],
                [
                  "month",
                  "This Month",
                ],
                [
                  "year",
                  "This Year",
                ],
              ] as [
                FilterPeriod,
                string
              ][]
            ).map(
              (option) => {
                const selected =
                  period ===
                  option[0];

                return (
                  <Pressable
                    key={
                      option[0]
                    }
                    style={[
                      styles.periodOption,
                      selected &&
                        styles.periodOptionSelected,
                    ]}
                    onPress={() =>
                      handlePeriodChange(
                        option[0]
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.periodOptionText,
                        selected &&
                          styles.periodOptionTextSelected,
                      ]}
                    >
                      {option[1]}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={
                          COLORS.primary
                        }
                      />
                    )}
                  </Pressable>
                );
              }
            )}
          </View>
        )}

        {/* ==========================================
            SUMMARY CARDS
        ========================================== */}

        <View style={styles.summaryGrid}>
          <View
            style={[
              styles.summaryCard,
              styles.summaryCardPrimary,
            ]}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    "rgba(255,255,255,0.16)",
                },
              ]}
            >
              <Ionicons
                name="trending-down-outline"
                size={22}
                color={COLORS.white}
              />
            </View>

            <Text
              style={
                styles.summaryLabelPrimary
              }
            >
              Total Expense
            </Text>

            {summaryLoading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.white}
              />
            ) : (
              <Text
                style={
                  styles.summaryValuePrimary
                }
              >
                {formatCurrency(
                  totalExpense
                )}
              </Text>
            )}

            <Text
              style={
                styles.summaryPeriodPrimary
              }
            >
              {getPeriodLabel(
                period
              )}
            </Text>
          </View>

          <View
            style={styles.summaryCard}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    COLORS.successSoft,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color={
                  COLORS.success
                }
              />
            </View>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Paid
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {formatCurrency(
                paidExpense
              )}
            </Text>

            <Text
              style={
                styles.summarySmall
              }
            >
              Completed
            </Text>
          </View>

          <View
            style={styles.summaryCard}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    COLORS.warningSoft,
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={22}
                color={
                  COLORS.warning
                }
              />
            </View>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Pending
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {formatCurrency(
                pendingExpense
              )}
            </Text>

            <Text
              style={
                styles.summarySmall
              }
            >
              To be paid
            </Text>
          </View>

          <View
            style={styles.summaryCard}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    COLORS.primarySoft,
                },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={22}
                color={
                  COLORS.primary
                }
              />
            </View>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Entries
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {expenseCount}
            </Text>

            <Text
              style={
                styles.summarySmall
              }
            >
              Expenses
            </Text>
          </View>
        </View>

        {/* ==========================================
            CATEGORY BREAKDOWN
        ========================================== */}

        {categorySummary.length >
          0 && (
          <View
            style={
              styles.breakdownCard
            }
          >
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
                  Expense Breakdown
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  By category
                </Text>
              </View>

              <Ionicons
                name="pie-chart-outline"
                size={21}
                color={
                  COLORS.primary
                }
              />
            </View>

            {categorySummary
              .slice(0, 5)
              .map((item) => {
                const percentage =
                  totalExpense >
                  0
                    ? Math.round(
                        (item.total /
                          totalExpense) *
                          100
                      )
                    : 0;

                return (
                  <View
                    key={
                      item.category
                    }
                    style={
                      styles.categoryRow
                    }
                  >
                    <View
                      style={
                        styles.categoryLeft
                      }
                    >
                      <View
                        style={
                          styles.categoryIcon
                        }
                      >
                        <Ionicons
                          name={getCategoryIcon(
                            item.category
                          )}
                          size={16}
                          color={
                            COLORS.primary
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.categoryInfo
                        }
                      >
                        <Text
                          style={
                            styles.categoryName
                          }
                        >
                          {
                            item.category
                          }
                        </Text>

                        <View
                          style={
                            styles.progressBackground
                          }
                        >
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${Math.min(
                                  percentage,
                                  100
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>

                    <View
                      style={
                        styles.categoryRight
                      }
                    >
                      <Text
                        style={
                          styles.categoryAmount
                        }
                      >
                        {formatCurrency(
                          item.total
                        )}
                      </Text>

                      <Text
                        style={
                          styles.categoryPercentage
                        }
                      >
                        {percentage}%
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>
        )}

        {/* ==========================================
            SEARCH
        ========================================== */}

        <View
          style={styles.searchBox}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={COLORS.textMuted}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search expenses..."
            placeholderTextColor={
              COLORS.textLight
            }
            style={
              styles.searchInput
            }
          />

          {search.length >
            0 && (
            <Pressable
              onPress={() =>
                setSearch("")
              }
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={
                  COLORS.textLight
                }
              />
            </Pressable>
          )}
        </View>

        {/* ==========================================
            ERROR
        ========================================== */}

        {(error ||
          summaryError) && (
          <View
            style={
              styles.errorBox
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color={COLORS.danger}
            />

            <Text
              style={
                styles.errorText
              }
            >
              {error ||
                summaryError}
            </Text>
          </View>
        )}

        {/* ==========================================
            LIST HEADER
        ========================================== */}

        <View
          style={
            styles.listHeader
          }
        >
          <View>
            <Text
              style={
                styles.listTitle
              }
            >
              Expense History
            </Text>

            <Text
              style={
                styles.listSubtitle
              }
            >
              {filteredExpenses.length}{" "}
              expense
              {filteredExpenses.length !==
              1
                ? "s"
                : ""}
            </Text>
          </View>

          <Pressable
            style={
              styles.refreshButton
            }
            onPress={
              handleRefresh
            }
          >
            <Ionicons
              name="refresh-outline"
              size={19}
              color={
                COLORS.primary
              }
            />
          </Pressable>
        </View>

        {/* ==========================================
            EXPENSE LIST
        ========================================== */}

        <FlatList
          data={
            filteredExpenses
          }
          keyExtractor={(
            item
          ) => item._id}
          renderItem={
            renderExpense
          }
          ListEmptyComponent={
            renderEmpty
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            filteredExpenses.length ===
            0
              ? styles.emptyList
              : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
              tintColor={
                COLORS.primary
            }
            />
          }
        />

        {/* ==========================================
            ADD / EDIT MODAL
        ========================================== */}

        <Modal
          visible={showForm}
          transparent
          animationType="slide"
          onRequestClose={() =>
            setShowForm(false)
          }
        >
          <KeyboardAvoidingView
            style={
              styles.modalOverlay
            }
            behavior={
              Platform.OS ===
              "ios"
                ? "padding"
                : undefined
            }
          >
            <View
              style={
                styles.modalCard
              }
            >
              {/* Modal Header */}

              <View
                style={
                  styles.modalHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    {editingExpense
                      ? "Edit Expense"
                      : "Add Expense"}
                  </Text>

                  <Text
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Record salon business
                    spending
                  </Text>
                </View>

                <Pressable
                  style={
                    styles.modalClose
                  }
                  onPress={() => {
                    setShowForm(
                      false
                    );

                    resetForm();
                  }}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={
                      COLORS.textDark
                    }
                  />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                  styles.formContent
                }
              >
                {/* Title */}

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  Expense Title *
                </Text>

                <View
                  style={
                    styles.inputBox
                  }
                >
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={
                      COLORS.textMuted
                    }
                  />

                  <TextInput
                    value={title}
                    onChangeText={
                      setTitle
                    }
                    placeholder="e.g. Electricity Bill"
                    placeholderTextColor={
                      COLORS.textLight
                    }
                    style={
                      styles.input
                    }
                  />
                </View>

                {/* Amount */}

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  Amount *
                </Text>

                <View
                  style={
                    styles.inputBox
                  }
                >
                  <Text
                    style={
                      styles.rupeeSymbol
                    }
                  >
                    ₹
                  </Text>

                  <TextInput
                    value={
                      amount
                    }
                    onChangeText={
                      setAmount
                    }
                    placeholder="0"
                    placeholderTextColor={
                      COLORS.textLight
                    }
                    keyboardType="decimal-pad"
                    style={
                      styles.input
                    }
                  />
                </View>

                {/* Category */}

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  Category *
                </Text>

                <Pressable
                  style={
                    styles.selectBox
                  }
                  onPress={() =>
                    setCategoryMenu(
                      !categoryMenu
                    )
                  }
                >
                  <View
                    style={
                      styles.selectLeft
                    }
                  >
                    <Ionicons
                      name={getCategoryIcon(
                        category
                      )}
                      size={19}
                      color={
                        COLORS.primary
                      }
                    />

                    <Text
                      style={
                        styles.selectText
                      }
                    >
                      {category}
                    </Text>
                  </View>

                  <Ionicons
                    name={
                      categoryMenu
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={18}
                    color={
                      COLORS.textMuted
                    }
                  />
                </Pressable>

                {categoryMenu && (
                  <View
                    style={
                      styles.dropdown
                    }
                  >
                    {CATEGORIES.map(
                      (item) => (
                        <Pressable
                          key={item}
                          style={
                            styles.dropdownItem
                          }
                          onPress={() => {
                            setCategory(
                              item
                            );

                            setCategoryMenu(
                              false
                            );
                          }}
                        >
                          <Ionicons
                            name={getCategoryIcon(
                              item
                            )}
                            size={18}
                            color={
                              COLORS.primary
                            }
                          />

                          <Text
                            style={
                              styles.dropdownText
                            }
                          >
                            {item}
                          </Text>

                          {category ===
                            item && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color={
                                COLORS.primary
                              }
                            />
                          )}
                        </Pressable>
                      )
                    )}
                  </View>
                )}

                {/* Payment */}

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  Payment Method
                </Text>

                <Pressable
                  style={
                    styles.selectBox
                  }
                  onPress={() =>
                    setPaymentMenu(
                      !paymentMenu
                    )
                  }
                >
                  <View
                    style={
                      styles.selectLeft
                    }
                  >
                    <Ionicons
                      name="card-outline"
                      size={19}
                      color={
                        COLORS.primary
                      }
                    />

                    <Text
                      style={
                        styles.selectText
                      }
                    >
                      {
                        paymentMethod
                      }
                    </Text>
                  </View>

                  <Ionicons
                    name={
                      paymentMenu
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={18}
                    color={
                      COLORS.textMuted
                    }
                  />
                </Pressable>

                {paymentMenu && (
                  <View
                    style={
                      styles.dropdown
                    }
                  >
                    {PAYMENT_METHODS.map(
                      (item) => (
                        <Pressable
                          key={item}
                          style={
                            styles.dropdownItem
                          }
                          onPress={() => {
                            setPaymentMethod(
                              item
                            );

                            setPaymentMenu(
                              false
                            );
                          }}
                        >
                          <Text
                            style={
                              styles.dropdownText
                            }
                          >
                            {item}
                          </Text>

                          {paymentMethod ===
                            item && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color={
                                COLORS.primary
                              }
                            />
                          )}
                        </Pressable>
                      )
                    )}
                  </View>
                )}

                {/* Paid To */}

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  Paid To / Vendor
                </Text>

                <View
                  style={
                    styles.inputBox
                  }
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={
                      COLORS.textMuted
                    }
                  />

                  <TextInput
                    value={paidTo}
                    onChangeText={
                      setPaidTo
                    }
                    placeholder="Vendor or person name"
                    placeholderTextColor={
                      COLORS.textLight
                    }
                    style={
                      styles.input
                    }
                  />
                </View>

                {/* Date */}

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  Expense Date
                </Text>

                <Pressable
                  style={
                    styles.selectBox
                  }
                  onPress={() =>
                    setShowDatePicker(
                      true
                    )
                  }
                >
                  <View
                    style={
                      styles.selectLeft
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={19}
                      color={
                        COLORS.primary
                      }
                    />

                    <Text
                      style={
                        styles.selectText
                      }
                    >
                      {formatDate(
                        expenseDate.toISOString()
                      )}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={
                      COLORS.textMuted
                    }
                  />
                </Pressable>

                {showDatePicker && (
                  <DateTimePicker
                    value={
                      expenseDate
                    }
                    mode="date"
                    display={
                      Platform.OS ===
                      "ios"
                        ? "spinner"
                        : "default"
                    }
                    onChange={(
                      _event,
                      selectedDate
                    ) => {
                      setShowDatePicker(
                        Platform.OS ===
                          "ios"
                      );

                      if (
                        selectedDate
                      ) {
                        setExpenseDate(
                          selectedDate
                        );
                      }
                    }}
                  />
                )}

                {/* Status */}

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  Payment Status
                </Text>

                <View
                  style={
                    styles.statusSelector
                  }
                >
                  {STATUS_OPTIONS.map(
                    (item) => {
                      const selected =
                        status ===
                        item;

                      return (
                        <Pressable
                          key={item}
                          style={[
                            styles.statusOption,
                            selected &&
                              styles.statusOptionSelected,
                          ]}
                          onPress={() =>
                            setStatus(
                              item
                            )
                          }
                        >
                          <Ionicons
                            name={
                              item ===
                              "Paid"
                                ? "checkmark-circle-outline"
                                : "time-outline"
                            }
                            size={17}
                            color={
                              selected
                                ? COLORS.white
                                : item ===
                                    "Paid"
                                  ? COLORS.success
                                  : COLORS.warning
                            }
                          />

                          <Text
                            style={[
                              styles.statusOptionText,
                              selected &&
                                styles.statusOptionTextSelected,
                            ]}
                          >
                            {item}
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </View>

                {/* Notes */}

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  Notes
                </Text>

                <View
                  style={[
                    styles.inputBox,
                    styles.notesBox,
                  ]}
                >
                  <TextInput
                    value={notes}
                    onChangeText={
                      setNotes
                    }
                    placeholder="Add any notes..."
                    placeholderTextColor={
                      COLORS.textLight
                    }
                    multiline
                    textAlignVertical="top"
                    style={[
                      styles.input,
                      styles.notesInput,
                    ]}
                  />
                </View>

                {/* Save */}

                <Pressable
                  style={[
                    styles.saveButton,
                    (creating ||
                      updating) &&
                      styles.disabledButton,
                  ]}
                  disabled={
                    creating ||
                    updating
                  }
                  onPress={
                    handleSave
                  }
                >
                  {creating ||
                  updating ? (
                    <ActivityIndicator
                      color={
                        COLORS.white
                    }
                    size="small"
                  />
                  ) : (
                    <Ionicons
                      name={
                        editingExpense
                          ? "checkmark-circle-outline"
                          : "add-circle-outline"
                      }
                      size={21}
                      color={
                        COLORS.white
                      }
                    />
                  )}

                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    {creating
                      ? "Adding..."
                      : updating
                        ? "Updating..."
                        : editingExpense
                          ? "Update Expense"
                          : "Save Expense"}
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* DELETE LOADING */}

        {deleting && (
          <View
            style={
              styles.loadingOverlay
            }
          >
            <View
              style={
                styles.loadingBox
              }
            >
              <ActivityIndicator
                size="large"
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Deleting...
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,

    backgroundColor:
      COLORS.background,
  },

  container: {
    flex: 1,

    backgroundColor:
      COLORS.background,

    paddingHorizontal: 16,
  },

  // ================================================
  // HEADER
  // ================================================

  header: {
    minHeight: 72,

    flexDirection: "row",
    paddingTop: 40,
    alignItems: "center",

    justifyContent:
      "space-between",

    paddingVertical: 10,
  },

  headerLeft: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  backButton: {
    width: 42,

    height: 42,

    borderRadius: 13,

    backgroundColor:
      COLORS.card,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 11,

    borderWidth: 1,

    borderColor:
      COLORS.border,
  },

  headerTitle: {
    color: COLORS.textDark,

    fontSize: 22,

    fontWeight: "800",
  },

  headerSubtitle: {
    color: COLORS.textMuted,

    fontSize: 12,

    marginTop: 2,
  },

  addButton: {
    height: 42,

    paddingHorizontal: 14,

    borderRadius: 12,

    backgroundColor:
      COLORS.primary,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 5,
  },

  addButtonText: {
    color: COLORS.white,

    fontSize: 14,

    fontWeight: "800",
  },

  // ================================================
  // FILTER
  // ================================================

  filterRow: {
    marginBottom: 8,
  },

  periodButton: {
    alignSelf: "flex-start",

    minHeight: 42,

    paddingHorizontal: 13,

    borderRadius: 12,

    backgroundColor:
      COLORS.card,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    flexDirection: "row",

    alignItems: "center",

    gap: 8,
  },

  periodButtonText: {
    color: COLORS.textDark,

    fontSize: 13,

    fontWeight: "700",
  },

  periodMenu: {
    backgroundColor:
      COLORS.card,

    borderRadius: 14,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    marginBottom: 10,

    overflow: "hidden",

    elevation: 3,
  },

  periodOption: {
    minHeight: 45,

    paddingHorizontal: 15,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.divider,
  },

  periodOptionSelected: {
    backgroundColor:
      COLORS.primaryVerySoft,
  },

  periodOptionText: {
    color: COLORS.text,

    fontSize: 13,

    fontWeight: "600",
  },

  periodOptionTextSelected: {
    color: COLORS.primary,

    fontWeight: "800",
  },

  // ================================================
  // SUMMARY
  // ================================================

  summaryGrid: {
    flexDirection: "row",

    flexWrap: "wrap",

    gap: 10,

    marginBottom: 12,
  },

  summaryCard: {
    width: "48.2%",

    minHeight: 125,

    backgroundColor:
      COLORS.card,

    borderRadius: 17,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    padding: 14,
  },

  summaryCardPrimary: {
    backgroundColor:
      COLORS.primary,

    borderColor:
      COLORS.primary,
  },

  summaryIcon: {
    width: 38,

    height: 38,

    borderRadius: 12,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 8,
  },

  summaryLabel: {
    color: COLORS.textMuted,

    fontSize: 12,

    fontWeight: "600",
  },

  summaryLabelPrimary: {
    color:
      "rgba(255,255,255,0.82)",

    fontSize: 12,

    fontWeight: "600",
  },

  summaryValue: {
    color: COLORS.textDark,

    fontSize: 19,

    fontWeight: "800",

    marginTop: 3,
  },

  summaryValuePrimary: {
    color: COLORS.white,

    fontSize: 20,

    fontWeight: "800",

    marginTop: 3,
  },

  summarySmall: {
    color: COLORS.textLight,

    fontSize: 10,

    marginTop: 3,
  },

  summaryPeriodPrimary: {
    color:
      "rgba(255,255,255,0.65)",

    fontSize: 10,

    marginTop: 3,
  },

  // ================================================
  // BREAKDOWN
  // ================================================

  breakdownCard: {
    backgroundColor:
      COLORS.card,

    borderRadius: 18,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    padding: 15,

    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 14,
  },

  sectionTitle: {
    color: COLORS.textDark,

    fontSize: 16,

    fontWeight: "800",
  },

  sectionSubtitle: {
    color: COLORS.textMuted,

    fontSize: 11,

    marginTop: 2,
  },

  categoryRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    marginBottom: 13,
  },

  categoryLeft: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",

    marginRight: 10,
  },

  categoryIcon: {
    width: 32,

    height: 32,

    borderRadius: 10,

    backgroundColor:
      COLORS.primarySoft,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 9,
  },

  categoryInfo: {
    flex: 1,
  },

  categoryName: {
    color: COLORS.text,

    fontSize: 12,

    fontWeight: "700",

    marginBottom: 5,
  },

  progressBackground: {
    height: 5,

    width: "100%",

    backgroundColor:
      COLORS.divider,

    borderRadius: 5,

    overflow: "hidden",
  },

  progressFill: {
    height: "100%",

    backgroundColor:
      COLORS.primary,

    borderRadius: 5,
  },

  categoryRight: {
    alignItems: "flex-end",
  },

  categoryAmount: {
    color: COLORS.textDark,

    fontSize: 12,

    fontWeight: "800",
  },

  categoryPercentage: {
    color: COLORS.textMuted,

    fontSize: 10,

    marginTop: 2,
  },

  // ================================================
  // SEARCH
  // ================================================

  searchBox: {
    minHeight: 46,

    borderRadius: 13,

    backgroundColor:
      COLORS.card,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    paddingHorizontal: 13,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 13,
  },

  searchInput: {
    flex: 1,

    color: COLORS.text,

    fontSize: 13,

    paddingVertical: 8,

    marginLeft: 8,
  },

  // ================================================
  // ERROR
  // ================================================

  errorBox: {
    minHeight: 42,

    borderRadius: 12,

    backgroundColor:
      COLORS.dangerSoft,

    borderWidth: 1,

    borderColor:
      "#F3C5C0",

    paddingHorizontal: 12,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 10,
  },

  errorText: {
    color: COLORS.danger,

    fontSize: 12,

    fontWeight: "600",

    flex: 1,

    marginLeft: 8,
  },

  // ================================================
  // LIST
  // ================================================

  listHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    marginBottom: 9,
  },

  listTitle: {
    color: COLORS.textDark,

    fontSize: 16,

    fontWeight: "800",
  },

  listSubtitle: {
    color: COLORS.textMuted,

    fontSize: 11,

    marginTop: 2,
  },

  refreshButton: {
    width: 38,

    height: 38,

    borderRadius: 11,

    backgroundColor:
      COLORS.card,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    alignItems: "center",

    justifyContent: "center",
  },

  listContent: {
    paddingBottom: 25,

    gap: 9,
  },

  emptyList: {
    flexGrow: 1,

    paddingBottom: 25,
  },

  // ================================================
  // EXPENSE CARD
  // ================================================

  expenseCard: {
    backgroundColor:
      COLORS.card,

    borderRadius: 16,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    padding: 12,

    flexDirection: "row",

    alignItems: "center",
  },

  expenseIcon: {
    width: 42,

    height: 42,

    borderRadius: 13,

    backgroundColor:
      COLORS.primarySoft,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 10,
  },

  expenseMiddle: {
    flex: 1,

    minWidth: 0,
  },

  expenseTitle: {
    color: COLORS.textDark,

    fontSize: 13,

    fontWeight: "800",
  },

  expenseCategory: {
    color: COLORS.primary,

    fontSize: 10,

    fontWeight: "700",

    marginTop: 2,
  },

  expenseMeta: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 5,

    flexWrap: "nowrap",
  },

  expenseMetaText: {
    color: COLORS.textMuted,

    fontSize: 9,

    marginLeft: 3,

    maxWidth: 80,
  },

  metaDot: {
    width: 3,

    height: 3,

    borderRadius: 2,

    backgroundColor:
      COLORS.textLight,

    marginHorizontal: 5,
  },

  expenseRight: {
    alignItems: "flex-end",

    marginLeft: 8,
  },

  expenseAmount: {
    color: COLORS.textDark,

    fontSize: 14,

    fontWeight: "800",
  },

  statusBadge: {
    paddingHorizontal: 7,

    paddingVertical: 3,

    borderRadius: 7,

    marginTop: 4,
  },

  statusText: {
    fontSize: 9,

    fontWeight: "800",
  },

  actionRow: {
    flexDirection: "row",

    marginTop: 5,

    gap: 4,
  },

  smallAction: {
    width: 27,

    height: 27,

    borderRadius: 8,

    backgroundColor:
      COLORS.primaryVerySoft,

    alignItems: "center",

    justifyContent: "center",
  },

  // ================================================
  // EMPTY
  // ================================================

  emptyBox: {
    backgroundColor:
      COLORS.card,

    borderRadius: 18,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    padding: 25,

    alignItems: "center",

    justifyContent: "center",

    marginTop: 8,
  },

  emptyIcon: {
    width: 62,

    height: 62,

    borderRadius: 20,

    backgroundColor:
      COLORS.primarySoft,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 12,
  },

  emptyTitle: {
    color: COLORS.textDark,

    fontSize: 16,

    fontWeight: "800",
  },

  emptyText: {
    color: COLORS.textMuted,

    fontSize: 12,

    textAlign: "center",

    lineHeight: 18,

    marginTop: 5,

    maxWidth: 270,
  },

  emptyButton: {
    height: 42,

    paddingHorizontal: 16,

    borderRadius: 11,

    backgroundColor:
      COLORS.primary,

    flexDirection: "row",

    alignItems: "center",

    gap: 5,

    marginTop: 15,
  },

  emptyButtonText: {
    color: COLORS.white,

    fontSize: 12,

    fontWeight: "800",
  },

  // ================================================
  // MODAL
  // ================================================

  modalOverlay: {
    flex: 1,

    backgroundColor:
      "rgba(51,40,44,0.48)",

    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor:
      COLORS.background,

    borderTopLeftRadius: 26,

    borderTopRightRadius: 26,

    maxHeight: "94%",

    paddingTop: 5,
  },

  modalHeader: {
    minHeight: 72,

    paddingHorizontal: 18,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.divider,
  },

  modalTitle: {
    color: COLORS.textDark,

    fontSize: 19,

    fontWeight: "800",
  },

  modalSubtitle: {
    color: COLORS.textMuted,

    fontSize: 11,

    marginTop: 2,
  },

  modalClose: {
    width: 38,

    height: 38,

    borderRadius: 12,

    backgroundColor:
      COLORS.card,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    alignItems: "center",

    justifyContent: "center",
  },

  formContent: {
    paddingHorizontal: 18,

    paddingTop: 14,

    paddingBottom: 35,
  },

  fieldLabel: {
    color: COLORS.textDark,

    fontSize: 12,

    fontWeight: "800",

    marginBottom: 7,

    marginTop: 10,
  },

  inputBox: {
    minHeight: 48,

    borderRadius: 12,

    backgroundColor:
      COLORS.card,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    paddingHorizontal: 12,

    flexDirection: "row",

    alignItems: "center",
  },

  input: {
    flex: 1,

    color: COLORS.text,

    fontSize: 13,

    marginLeft: 8,

    paddingVertical: 8,
  },

  rupeeSymbol: {
    color: COLORS.primary,

    fontSize: 18,

    fontWeight: "800",
  },

  selectBox: {
    minHeight: 48,

    borderRadius: 12,

    backgroundColor:
      COLORS.card,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    paddingHorizontal: 12,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",
  },

  selectLeft: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  selectText: {
    color: COLORS.text,

    fontSize: 13,

    fontWeight: "600",

    marginLeft: 9,
  },

  dropdown: {
    backgroundColor:
      COLORS.card,

    borderRadius: 12,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    marginTop: 5,

    overflow: "hidden",

    elevation: 4,
  },

  dropdownItem: {
    minHeight: 44,

    paddingHorizontal: 12,

    flexDirection: "row",

    alignItems: "center",

    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.divider,
  },

  dropdownText: {
    color: COLORS.text,

    fontSize: 12,

    fontWeight: "600",

    flex: 1,

    marginLeft: 8,
  },

  notesBox: {
    alignItems: "flex-start",

    minHeight: 85,

    paddingTop: 8,
  },

  notesInput: {
    marginLeft: 0,

    width: "100%",

    minHeight: 68,
  },

  // ================================================
  // STATUS
  // ================================================

  statusSelector: {
    flexDirection: "row",

    gap: 8,
  },

  statusOption: {
    flex: 1,

    minHeight: 43,

    borderRadius: 11,

    backgroundColor:
      COLORS.card,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 5,
  },

  statusOptionSelected: {
    backgroundColor:
      COLORS.primary,

    borderColor:
      COLORS.primary,
  },

  statusOptionText: {
    color: COLORS.textDark,

    fontSize: 12,

    fontWeight: "700",
  },

  statusOptionTextSelected: {
    color: COLORS.white,
  },

  // ================================================
  // SAVE
  // ================================================

  saveButton: {
    height: 52,

    borderRadius: 14,

    backgroundColor:
      COLORS.primary,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,

    marginTop: 22,
  },

  disabledButton: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: COLORS.white,

    fontSize: 14,

    fontWeight: "800",
  },

  // ================================================
  // DELETE LOADING
  // ================================================

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      "rgba(51,40,44,0.25)",

    alignItems: "center",

    justifyContent: "center",
  },

  loadingBox: {
    minWidth: 130,

    minHeight: 110,

    borderRadius: 18,

    backgroundColor:
      COLORS.card,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,

    borderColor:
      COLORS.border,

    elevation: 5,
  },

  loadingText: {
    color: COLORS.textDark,

    fontSize: 12,

    fontWeight: "700",

    marginTop: 9,
  },
});