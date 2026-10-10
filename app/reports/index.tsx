
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// ========================================
// COLORS
// ========================================

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

// ========================================
// TYPES
// ========================================

type Period =
  | "Today"
  | "7 Days"
  | "This Month"
  | "This Year";

type RevenueResponse = {
  success?: boolean;
  period?: string;
  totalRevenue?: number;
  totalBills?: number;
  from?: string;
  to?: string;
  message?: string;
};

type ExpenseItem = {
  _id?: string;
  category?: string;
  amount?: number;
  title?: string;
  description?: string;
  expenseDate?: string;
  date?: string;
};

type ExpenseResponse = {
  success?: boolean;
  expenses?: ExpenseItem[];
  data?: ExpenseItem[];
  totalExpense?: number;
  totalExpenses?: number;
  message?: string;
};

// ========================================
// API URL
// ========================================

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://salon-backend-49vk.onrender.com/api";

// ========================================
// HELPERS
// ========================================

const money = (value: number) =>
  `₹${Math.max(
    0,
    Number(value || 0)
  ).toLocaleString("en-IN")}`;

// ========================================
// AUTH HEADERS
// ========================================

const getAuthHeaders = async () => {
  const token =
    await AsyncStorage.getItem("token");

  console.log(
    "REPORT AUTH TOKEN:",
    token ? "FOUND" : "MISSING"
  );

  return {
    Accept: "application/json",
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

// ========================================
// PERIOD PARAM
// ========================================

const getPeriodParam = (
  period: Period
) => {
  switch (period) {
    case "Today":
      return "today";

    case "7 Days":
      return "week";

    case "This Year":
      return "year";

    case "This Month":
    default:
      return "today";
  }
};

// ========================================
// DATE RANGE
// ========================================

const getDateRange = (
  period: Period
) => {
  const now = new Date();

  const to = new Date(now);

  let from = new Date(now);

  if (period === "Today") {
    from.setHours(
      0,
      0,
      0,
      0
    );
  } else if (period === "7 Days") {
    from.setDate(
      from.getDate() - 6
    );

    from.setHours(
      0,
      0,
      0,
      0
    );
  } else if (period === "This Year") {
    from = new Date(
      now.getFullYear(),
      0,
      1
    );
  } else {
    from = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  }

  return {
    from,
    to,
  };
};

// ========================================
// SUMMARY CARD
// ========================================


function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={color}
        />
      </View>

      <Text style={styles.smallLabel}>
        {title}
      </Text>

      <Text
        style={[
          styles.summaryValue,
          { color },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>

      <Text style={styles.muted}>
        {subtitle}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.summaryCard}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.summaryCard}>
      {content}
    </View>
  );
}


// ========================================
// ROW
// ========================================

function Row({
  icon,
  label,
  value,
  color = COLORS.textDark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Ionicons
            name={icon}
            size={17}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.rowLabel}>
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.rowValue,
          { color },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ========================================
// REPORT SCREEN
// ========================================

export default function ReportsScreen() {
  const [
    period,
    setPeriod,
  ] = useState<Period>(
    "This Month"
  );

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    revenue,
    setRevenue,
  ] = useState(0);

  const [
    totalBills,
    setTotalBills,
  ] = useState(0);

  const [
    expenses,
    setExpenses,
  ] = useState<ExpenseItem[]>([]);

  const [
    expenseTotal,
    setExpenseTotal,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ========================================
  // LOAD REPORT
  // ========================================

  const loadReport =
    useCallback(async () => {
      try {
        setError("");

        const periodParam =
          getPeriodParam(period);

        // ========================================
        // AUTH HEADERS
        // ========================================

        const headers =
          await getAuthHeaders();

        // ========================================
        // REVENUE
        // ========================================

        const revenueUrl =
          `${API_URL}/bills/revenue?period=${periodParam}`;

        console.log(
          "REPORT REVENUE REQUEST:",
          revenueUrl
        );

        const revenueResponse =
          await fetch(
            revenueUrl,
            {
              method: "GET",
              headers,
            }
          );

        const revenueData: RevenueResponse =
          await revenueResponse
            .json()
            .catch(() => ({}));

        if (!revenueResponse.ok) {
          throw new Error(
            revenueData?.message ||
              "Failed to load revenue"
          );
        }

        const realRevenue =
          Number(
            revenueData?.totalRevenue ||
              0
          );

        const realBills =
          Number(
            revenueData?.totalBills ||
              0
          );

        setRevenue(realRevenue);
        setTotalBills(realBills);

        // ========================================
        // EXPENSES
        // ========================================

        const range =
          getDateRange(period);

        const expenseUrl =
          `${API_URL}/expenses` +
          `?from=${encodeURIComponent(
            range.from.toISOString()
          )}` +
          `&to=${encodeURIComponent(
            range.to.toISOString()
          )}`;

        console.log(
          "REPORT EXPENSE REQUEST:",
          expenseUrl
        );

        const expenseResponse =
          await fetch(
            expenseUrl,
            {
              method: "GET",
              headers,
            }
          );

        const expenseData: ExpenseResponse =
          await expenseResponse
            .json()
            .catch(() => ({}));

        if (!expenseResponse.ok) {
          /*
           * Expense API fail hone par
           * revenue report ko break nahi karenge.
           */
          console.log(
            "REPORT EXPENSE API:",
            expenseData?.message ||
              "Expense API unavailable"
          );

          setExpenses([]);
          setExpenseTotal(0);
        } else {
          const expenseList =
            Array.isArray(
              expenseData?.expenses
            )
              ? expenseData.expenses
              : Array.isArray(
                  expenseData?.data
                )
              ? expenseData.data
              : [];

          const backendTotal =
            Number(
              expenseData?.totalExpense
            ) ||
            Number(
              expenseData?.totalExpenses
            ) ||
            0;

          const calculatedTotal =
            expenseList.reduce(
              (sum, item) =>
                sum +
                Number(
                  item?.amount || 0
                ),
              0
            );

          setExpenses(
            expenseList
          );

          setExpenseTotal(
            backendTotal > 0
              ? backendTotal
              : calculatedTotal
          );
        }
      } catch (err: any) {
        console.error(
          "REPORT ERROR:",
          err
        );

        setError(
          err?.message ||
            "Unable to load report data"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [period]);

  // ========================================
  // LOAD ON PERIOD CHANGE
  // ========================================

  useEffect(() => {
    setLoading(true);
    loadReport();
  }, [loadReport]);

  // ========================================
  // REFRESH
  // ========================================

  const onRefresh =
    async () => {
      setRefreshing(true);
      await loadReport();
    };

  // ========================================
  // CALCULATIONS
  // ========================================

  const netProfit =
    Math.max(
      0,
      revenue - expenseTotal
    );

  const profitMargin =
    revenue > 0
      ? (netProfit / revenue) *
        100
      : 0;

  const averageBill =
    totalBills > 0
      ? revenue / totalBills
      : 0;

  // ========================================
  // EXPENSE CATEGORY SUMMARY
  // ========================================

  const expenseCategories =
    useMemo(() => {
      const map: Record<
        string,
        number
      > = {};

      expenses.forEach(
        (item) => {
          const category =
            item?.category ||
            "Other";

          map[category] =
            (map[category] || 0) +
            Number(
              item?.amount || 0
            );
        }
      );

      return Object.entries(map)
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .slice(0, 6);
    }, [expenses]);

  // ========================================
  // REVENUE ITEMS
  // ========================================

  const revenueItems = [
    {
      icon:
        "cut-outline" as keyof typeof Ionicons.glyphMap,
      label:
        "Salon Revenue",
      value: revenue,
    },
  ];

  // ========================================
  // PERIOD TEXT
  // ========================================

  const periodText =
    period === "Today"
      ? "today"
      : period === "7 Days"
      ? "last 7 days"
      : period === "This Year"
      ? "this year"
      : "this month";

  // ========================================
  // UI
  // ========================================

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.back}
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.textDark}
            />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={styles.title}
            >
              Reports Summary
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Complete salon business
              overview
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.refreshButton
            }
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color={
                  COLORS.primary
                }
              />
            ) : (
              <Ionicons
                name="refresh-outline"
                size={21}
                color={
                  COLORS.primary
                }
              />
            )}
          </TouchableOpacity>
        </View>

        {/* PERIOD */}

        <Text
          style={styles.filterLabel}
        >
          REPORT PERIOD
        </Text>

        <TouchableOpacity
          style={styles.period}
          onPress={() =>
            setOpen(
              (value) =>
                !value
            )
          }
        >
          <View
            style={
              styles.periodLeft
            }
          >
            <Ionicons
              name="time-outline"
              size={17}
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.periodText
              }
            >
              {period}
            </Text>
          </View>

          <Ionicons
            name={
              open
                ? "chevron-up"
                : "chevron-down"
            }
            size={18}
            color={
              COLORS.primary
            }
          />
        </TouchableOpacity>

        {open && (
          <View
            style={
              styles.dropdown
            }
          >
            {(
              [
                "Today",
                "7 Days",
                "This Month",
                "This Year",
              ] as Period[]
            ).map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.dropItem,
                    item ===
                      period &&
                      styles.dropActive,
                  ]}
                  onPress={() => {
                    setPeriod(
                      item
                    );
                    setOpen(
                      false
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.dropText,
                      item ===
                        period &&
                        styles.dropTextActive,
                    ]}
                  >
                    {item}
                  </Text>

                  {item ===
                    period && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={
                        COLORS.primary
                      }
                    />
                  )}
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* ERROR */}

        {!!error && (
          <View
            style={
              styles.errorBox
            }
          >
            <Ionicons
              name="warning-outline"
              size={19}
              color={
                COLORS.danger
              }
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

        {/* LOADING */}

        {loading ? (
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
              Loading report...
            </Text>
          </View>
        ) : (
          <>
            {/* FINANCIAL SUMMARY */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Financial Summary
            </Text>

            <Text
              style={
                styles.sectionSub
              }
            >
              Revenue, expenses and actual
              profit
            </Text>

            <View
              style={styles.grid}
            >
             
<SummaryCard
  icon="trending-up-outline"
  title="Total Revenue"
  value={money(revenue)}
  subtitle={`${totalBills} bills generated`}
  color={COLORS.primary}
  onPress={() => router.push("/reports/staff-service-revenue")}
/>

              <SummaryCard
                icon="wallet-outline"
                title="Total Expenses"
                value={money(
                  expenseTotal
                )}
                subtitle="Business expenses"
                color={
                  COLORS.warning
                }
              />

              <SummaryCard
                icon="cash-outline"
                title="Net Profit"
                value={money(
                  netProfit
                )}
                subtitle="Revenue - expenses"
                color={
                  COLORS.success
                }
              />

              <SummaryCard
                icon="pie-chart-outline"
                title="Profit Margin"
                value={`${profitMargin.toFixed(
                  2
                )}%`}
                subtitle="Business margin"
                color={
                  COLORS.success
                }
              />
            </View>

            {/* BUSINESS SUMMARY */}

            <View
              style={styles.card}
            >
              <View
                style={
                  styles.cardHead
                }
              >
                <View
                  style={
                    styles.headIcon
                  }
                >
                  <Ionicons
                    name="analytics-outline"
                    size={19}
                    color={
                      COLORS.primary
                    }
                  />
                </View>

                <View>
                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    Business Summary
                  </Text>

                  <Text
                    style={
                      styles.cardSub
                    }
                  >
                    Key numbers for{" "}
                    {periodText}
                  </Text>
                </View>
              </View>

              <Row
                icon="receipt-outline"
                label="Total Bills"
                value={
                  totalBills
                }
              />

              <Row
                icon="cash-outline"
                label="Average Bill"
                value={money(
                  averageBill
                )}
                color={
                  COLORS.primary
                }
              />

              <View
                style={
                  styles.divider
                }
              />

              <Row
                icon="trending-up-outline"
                label="Total Revenue"
                value={money(
                  revenue
                )}
                color={
                  COLORS.primary
                }
              />

              <Row
                icon="arrow-down-outline"
                label="Total Expenses"
                value={money(
                  expenseTotal
                )}
                color={
                  COLORS.warning
                }
              />

              <Row
                icon="stats-chart-outline"
                label="Net Profit"
                value={money(
                  netProfit
                )}
                color={
                  COLORS.success
                }
              />

              <View
                style={
                  styles.divider
                }
              />

              <Row
                icon="pie-chart-outline"
                label="Profit Margin"
                value={`${profitMargin.toFixed(
                  2
                )}%`}
                color={
                  COLORS.success
                }
              />
            </View>

            {/* REVENUE + EXPENSE */}

            <View
              style={styles.twoCol}
            >
              {/* REVENUE */}

              <View
                style={[
                  styles.card,
                  styles.half,
                ]}
              >
                <View
                  style={
                    styles.cardHead
                  }
                >
                  <View
                    style={[
                      styles.headIcon,
                      {
                        backgroundColor:
                          COLORS.successSoft,
                      },
                    ]}
                  >
                    <Ionicons
                      name="arrow-up-outline"
                      size={19}
                      color={
                        COLORS.success
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={
                        styles.cardTitle
                      }
                    >
                      Revenue
                    </Text>

                    <Text
                      style={
                        styles.cardSub
                      }
                    >
                      Money received
                    </Text>
                  </View>
                </View>

                <Text
                  style={
                    styles.total
                  }
                >
                  {money(
                    revenue
                  )}
                </Text>

                {revenueItems.map(
                  (item) => (
                    <View
                      key={
                        item.label
                      }
                      style={
                        styles.breakRow
                      }
                    >
                      <View
                        style={
                          styles.breakName
                        }
                      >
                        <Ionicons
                          name={
                            item.icon
                          }
                          size={15}
                          color={
                            COLORS.primary
                          }
                        />

                        <Text
                          style={
                            styles.breakText
                          }
                        >
                          {
                            item.label
                          }
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.breakValue
                        }
                      >
                        {money(
                          item.value
                        )}
                      </Text>
                    </View>
                  )
                )}
              </View>

              {/* EXPENSES */}

              <View
                style={[
                  styles.card,
                  styles.half,
                ]}
              >
                <View
                  style={
                    styles.cardHead
                  }
                >
                  <View
                    style={[
                      styles.headIcon,
                      {
                        backgroundColor:
                          COLORS.warningSoft,
                      },
                    ]}
                  >
                    <Ionicons
                      name="arrow-down-outline"
                      size={19}
                      color={
                        COLORS.warning
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={
                        styles.cardTitle
                      }
                    >
                      Expenses
                    </Text>

                    <Text
                      style={
                        styles.cardSub
                      }
                    >
                      Money spent
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.total,
                    {
                      color:
                        COLORS.warning,
                    },
                  ]}
                >
                  {money(
                    expenseTotal
                  )}
                </Text>

                {expenseCategories.length ===
                0 ? (
                  <View
                    style={
                      styles.emptySmall
                    }
                  >
                    <Ionicons
                      name="receipt-outline"
                      size={19}
                      color={
                        COLORS.textLight
                      }
                    />

                    <Text
                      style={
                        styles.emptyText
                      }
                    >
                      No expenses
                    </Text>
                  </View>
                ) : (
                  expenseCategories.map(
                    ([
                      category,
                      value,
                    ]) => (
                      <View
                        key={
                          category
                        }
                        style={
                          styles.breakRow
                        }
                      >
                        <View
                          style={
                            styles.breakName
                          }
                        >
                          <Ionicons
                            name="wallet-outline"
                            size={15}
                            color={
                              COLORS.primary
                            }
                          />

                          <Text
                            style={
                              styles.breakText
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {
                              category
                            }
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.breakValue
                          }
                        >
                          {money(
                            value
                          )}
                        </Text>
                      </View>
                    )
                  )
                )}
              </View>
            </View>

            {/* PROFIT CARD */}

            <View
              style={
                styles.profitCard
              }
            >
              <View
                style={
                  styles.profitIcon
                }
              >
                <Ionicons
                  name="stats-chart-outline"
                  size={24}
                  color={
                    COLORS.success
                  }
                />
              </View>

              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.profitTitle
                  }
                >
                  Net Profit
                </Text>

                <Text
                  style={
                    styles.profitSub
                  }
                >
                  Revenue minus all recorded
                  expenses
                </Text>
              </View>

              <Text
                style={
                  styles.profit
                }
              >
                {money(
                  netProfit
                )}
              </Text>
            </View>

            {/* EXPENSE DETAIL */}

            <View
              style={styles.card}
            >
              <View
                style={
                  styles.cardHead
                }
              >
                <View
                  style={[
                    styles.headIcon,
                    {
                      backgroundColor:
                        COLORS.warningSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name="list-outline"
                    size={19}
                    color={
                      COLORS.warning
                    }
                  />
                </View>

                <View>
                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    Expense Details
                  </Text>

                  <Text
                    style={
                      styles.cardSub
                    }
                  >
                    Recorded salon expenses
                  </Text>
                </View>
              </View>

              {expenses.length ===
              0 ? (
                <View
                  style={
                    styles.empty
                  }
                >
                  <View
                    style={
                      styles.emptyIcon
                    }
                  >
                    <Ionicons
                      name="receipt-outline"
                      size={25}
                      color={
                        COLORS.textLight
                      }
                    />
                  </View>

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    No expenses recorded
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    Add expenses from the Expenses
                    section to see them here.
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.expenseButton
                    }
                    onPress={() =>
                      router.push(
                        "/expenses"
                      )
                    }
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color={
                        COLORS.white
                      }
                    />

                    <Text
                      style={
                        styles.expenseButtonText
                      }
                    >
                      Add Expense
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                expenses
                  .slice(0, 8)
                  .map(
                    (
                      item,
                      index
                    ) => {
                      const amount =
                        Number(
                          item?.amount ||
                            0
                        );

                      const category =
                        item?.category ||
                        "Other";

                      const title =
                        item?.title ||
                        item?.description ||
                        category;

                      return (
                        <View
                          key={
                            item?._id ||
                            `${category}-${index}`
                          }
                          style={
                            styles.expenseDetailRow
                          }
                        >
                          <View
                            style={
                              styles.expenseDetailLeft
                            }
                          >
                            <View
                              style={
                                styles.expenseCircle
                              }
                            >
                              <Ionicons
                                name="wallet-outline"
                                size={17}
                                color={
                                  COLORS.warning
                                }
                              />
                            </View>

                            <View
                              style={{
                                flex: 1,
                              }}
                            >
                              <Text
                                style={
                                  styles.expenseTitle
                                }
                                numberOfLines={
                                  1
                                }
                              >
                                {title}
                              </Text>

                              <Text
                                style={
                                  styles.expenseCategory
                                }
                              >
                                {category}
                              </Text>
                            </View>
                          </View>

                          <Text
                            style={
                              styles.expenseAmount
                            }
                          >
                            -
                            {money(
                              amount
                            )}
                          </Text>
                        </View>
                      );
                    }
                  )
              )}
            </View>

            {/* INFO */}

            <View
              style={styles.note}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={
                  COLORS.textMuted
                }
              />

              <Text
                style={
                  styles.noteText
                }
              >
                Report data is calculated from
                your salon revenue and recorded
                expenses.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  content: {
    padding: 18,
    paddingBottom: 45,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 35,
  },

  back: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      COLORS.card,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },

  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 3,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  filterLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 7,
  },

  period: {
    height: 48,
    backgroundColor:
      COLORS.card,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 18,
  },

  periodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  periodText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: "700",
  },

  dropdown: {
    backgroundColor:
      COLORS.card,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 13,
    marginTop: -12,
    marginBottom: 18,
    overflow: "hidden",
    elevation: 6,
  },

  dropItem: {
    height: 46,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.divider,
  },

  dropActive: {
    backgroundColor:
      COLORS.primaryVerySoft,
  },

  dropText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: "600",
  },

  dropTextActive: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  errorBox: {
    backgroundColor:
      COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: "#F1C8C3",
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },

  loadingBox: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "800",
  },

  sectionSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 3,
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
  },

  summaryCard: {
    width: "48.4%",
    backgroundColor:
      COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 15,
    marginBottom: 12,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  smallLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },

  muted: {
    color: COLORS.textLight,
    fontSize: 10.5,
    marginTop: 5,
  },

  card: {
    backgroundColor:
      COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 17,
    marginBottom: 16,
  },

  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  headIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor:
      COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },

  cardSub: {
    color: COLORS.textMuted,
    fontSize: 10.5,
    marginTop: 2,
  },

  row: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  rowIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor:
      COLORS.primaryVerySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  rowLabel: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: "600",
  },

  rowValue: {
    fontSize: 14,
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor:
      COLORS.divider,
    marginVertical: 4,
  },

  twoCol: {
    flexDirection: "row",
    justifyContent:
      "space-between",
  },

  half: {
    width: "48.4%",
  },

  total: {
    color: COLORS.success,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 8,
  },

  breakRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    borderTopWidth: 1,
    borderTopColor:
      COLORS.divider,
  },

  breakName: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 7,
  },

  breakText: {
    color: COLORS.textDark,
    fontSize: 11.5,
    fontWeight: "600",
    flexShrink: 1,
  },

  breakValue: {
    color: COLORS.textDark,
    fontSize: 11.5,
    fontWeight: "800",
    marginLeft: 5,
  },

  profitCard: {
    backgroundColor:
      COLORS.successSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D5EBDD",
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  profitIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor:
      COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  profitTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  profitSub: {
    color: COLORS.textMuted,
    fontSize: 10.5,
    marginTop: 3,
  },

  profit: {
    color: COLORS.success,
    fontSize: 19,
    fontWeight: "900",
  },

  empty: {
    alignItems: "center",
    paddingVertical: 20,
  },

  emptySmall: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor:
      COLORS.primaryVerySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  emptyTitle: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: "800",
  },

  emptyText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },

  expenseButton: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor:
      COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "center",
    marginTop: 13,
  },

  expenseButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },

  expenseDetailRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    borderTopWidth: 1,
    borderTopColor:
      COLORS.divider,
  },

  expenseDetailLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  expenseCircle: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor:
      COLORS.warningSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  expenseTitle: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: "700",
  },

  expenseCategory: {
    color: COLORS.textMuted,
    fontSize: 10.5,
    marginTop: 2,
  },

  expenseAmount: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 8,
  },

  note: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },

  noteText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginLeft: 6,
    textAlign: "center",
    flex: 1,
  },
});