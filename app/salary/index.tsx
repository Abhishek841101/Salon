import React, { useCallback, useEffect, useMemo, useState } from "react";
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

import type { AppDispatch, RootState } from "../../src/store";

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

const formatMoney = (value: number = 0) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

const getMonthLabel = (month: string) => {
  if (!month) return "";

  const [year, monthNumber] = month.split("-");

  const index = Number(monthNumber) - 1;

  if (index < 0 || index > 11) {
    return month;
  }

  return `${MONTH_NAMES[index]} ${year}`;
};

const getCurrentMonth = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getPreviousMonth = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);

  const date = new Date(year, monthNumber - 2, 1);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getNextMonth = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);

  const date = new Date(year, monthNumber, 1);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getInitials = (name: string = "") => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ST"
  );
};

export default function SalaryScreen() {
  const dispatch = useDispatch<AppDispatch>();

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
  } = useSelector((state: RootState) => state.salary);

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedSalary, setSelectedSalary] =
    useState<Salary | null>(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("CASH");

  const [commission, setCommission] = useState("");
  const [bonus, setBonus] = useState("");
  const [advance, setAdvance] = useState("");
  const [deduction, setDeduction] = useState("");
  const [notes, setNotes] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Salary
  |--------------------------------------------------------------------------
  */

  const loadSalary = useCallback(async () => {
    await dispatch(
      fetchSalaries({
        month: selectedMonth,
        search,
        status,
      })
    );
  }, [dispatch, selectedMonth, search, status]);

  useEffect(() => {
    loadSalary();
  }, [loadSalary]);

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await loadSalary();

    setRefreshing(false);
  }, [loadSalary]);

  /*
  |--------------------------------------------------------------------------
  | Local Stats
  |--------------------------------------------------------------------------
  */

  const staffCount = salaries.length;

  const paidCount = salaries.filter(
    (item) => item.paymentStatus === "PAID"
  ).length;

  const pendingCount = salaries.filter(
    (item) => item.paymentStatus === "PENDING"
  ).length;

  /*
  |--------------------------------------------------------------------------
  | Generate Salary
  |--------------------------------------------------------------------------
  */

  const openGenerateModal = (salary: Salary) => {
    setSelectedSalary(salary);

    setCommission(String(salary.commission || ""));
    setBonus(String(salary.bonus || ""));
    setAdvance(String(salary.advance || ""));
    setDeduction(String(salary.deduction || ""));
    setNotes(salary.notes || "");

    setShowGenerateModal(true);
  };

  const closeGenerateModal = () => {
    if (generating) return;

    setShowGenerateModal(false);
    setSelectedSalary(null);

    setCommission("");
    setBonus("");
    setAdvance("");
    setDeduction("");
    setNotes("");
  };

  const handleGenerateSalary = async () => {
    if (!selectedSalary?.stylist?._id) {
      Alert.alert("Error", "Stylist information is missing.");
      return;
    }

    const result = await dispatch(
      createSalary({
        stylist: selectedSalary.stylist._id,
        month: selectedMonth,

        commission: Number(commission) || 0,
        bonus: Number(bonus) || 0,

        advance: Number(advance) || 0,
        deduction: Number(deduction) || 0,

        paymentMethod:
          selectedSalary.paymentMethod || "CASH",

        notes: notes.trim(),
      })
    );

    if (createSalary.fulfilled.match(result)) {
      setShowGenerateModal(false);

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

      await loadSalary();
    } else {
      Alert.alert(
        "Error",
        result.payload || "Failed to generate salary."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Payment
  |--------------------------------------------------------------------------
  */

  const openPaymentModal = (salary: Salary) => {
    setSelectedSalary(salary);

    setSelectedPaymentMethod(
      salary.paymentMethod || "CASH"
    );

    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    if (paying) return;

    setShowPaymentModal(false);
    setSelectedSalary(null);
  };

  const handleMarkPaid = async () => {
    if (!selectedSalary?._id) return;

    const result = await dispatch(
      markSalaryPaid({
        id: selectedSalary._id,
        paymentMethod: selectedPaymentMethod,
        paymentDate: new Date().toISOString(),
      })
    );

    if (markSalaryPaid.fulfilled.match(result)) {
      setShowPaymentModal(false);
      setSelectedSalary(null);

      Alert.alert(
        "Payment Successful",
        "Salary has been marked as paid."
      );

      await loadSalary();
    } else {
      Alert.alert(
        "Payment Failed",
        result.payload || "Unable to mark salary as paid."
      );
    }
  };

  const handleMarkPending = (salary: Salary) => {
    Alert.alert(
      "Mark as Pending",
      `Are you sure you want to mark ${salary.stylist?.name}'s salary as pending?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            const result = await dispatch(
              markSalaryPending(salary._id)
            );

            if (markSalaryPending.fulfilled.match(result)) {
              await loadSalary();
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
  | Month Change
  |--------------------------------------------------------------------------
  */

  const changeMonth = (direction: "prev" | "next") => {
    const newMonth =
      direction === "prev"
        ? getPreviousMonth(selectedMonth)
        : getNextMonth(selectedMonth);

    dispatch(setSelectedMonth(newMonth));

    setShowMonthPicker(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Salary List
  |--------------------------------------------------------------------------
  */

  const renderSalary = ({
    item,
  }: {
    item: Salary;
  }) => {
    const stylist = item.stylist;

    const isPaid = item.paymentStatus === "PAID";

    return (
      <View style={styles.salaryCard}>
        <View style={styles.salaryTopRow}>
          <View style={styles.staffInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(stylist?.name)}
              </Text>
            </View>

            <View style={styles.staffTextContainer}>
              <Text
                style={styles.staffName}
                numberOfLines={1}
              >
                {stylist?.name || "Unknown Staff"}
              </Text>

              <Text
                style={styles.staffSpecialization}
                numberOfLines={1}
              >
                {stylist?.specialization ||
                  "Salon Staff"}
              </Text>

              {!!stylist?.phone && (
                <Text style={styles.staffPhone}>
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
              {isPaid ? "PAID" : "PENDING"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.salaryGrid}>
          <SalaryAmount
            label="Basic"
            value={item.basicSalary}
          />

          <SalaryAmount
            label="Overtime"
            value={item.overtimeSalary}
          />

          <SalaryAmount
            label="Bonus"
            value={item.bonus}
          />

          <SalaryAmount
            label="Commission"
            value={item.commission}
          />
        </View>

        <View style={styles.secondaryRow}>
          <View style={styles.secondaryItem}>
            <Text style={styles.secondaryLabel}>
              Advance
            </Text>

            <Text style={styles.deductionValue}>
              -{formatMoney(item.advance)}
            </Text>
          </View>

          <View style={styles.secondaryItem}>
            <Text style={styles.secondaryLabel}>
              Deduction
            </Text>

            <Text style={styles.deductionValue}>
              -{formatMoney(item.deduction)}
            </Text>
          </View>

          <View style={styles.secondaryItem}>
            <Text style={styles.secondaryLabel}>
              Gross
            </Text>

            <Text style={styles.grossValue}>
              {formatMoney(item.grossSalary)}
            </Text>
          </View>
        </View>

        <View style={styles.netSalaryRow}>
          <View>
            <Text style={styles.netLabel}>
              Net Salary
            </Text>

            <Text style={styles.netSubText}>
              {item.attendance
                ? `${item.attendance.presentDays || 0} present • ${Number(
                    item.attendance.overtimeHours || 0
                  ).toFixed(1)}h OT`
                : "Salary generated"}
            </Text>
          </View>

          <Text style={styles.netSalary}>
            {formatMoney(item.netSalary)}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.editButton}
            onPress={() => openGenerateModal(item)}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#111827"
            />

            <Text style={styles.editButtonText}>
              Edit Salary
            </Text>
          </TouchableOpacity>

          {isPaid ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.pendingButton}
              onPress={() =>
                handleMarkPending(item)
              }
            >
              <Ionicons
                name="time-outline"
                size={18}
                color="#92400E"
              />

              <Text style={styles.pendingButtonText}>
                Mark Pending
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.payButton}
              onPress={() => openPaymentModal(item)}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.payButtonText}>
                Mark Paid
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Empty
  |--------------------------------------------------------------------------
  */

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator
            size="large"
            color="#111827"
          />

          <Text style={styles.emptyTitle}>
            Loading salary...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="wallet-outline"
            size={36}
            color="#9CA3AF"
          />
        </View>

        <Text style={styles.emptyTitle}>
          No salary records
        </Text>

        <Text style={styles.emptyDescription}>
          No salary has been generated for{" "}
          {getMonthLabel(selectedMonth)}.
        </Text>
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Header
  |--------------------------------------------------------------------------
  */

  const header = useMemo(
    () => (
      <>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              Salary
            </Text>

            <Text style={styles.headerSubtitle}>
              Staff salary management
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerIconButton}
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

        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={styles.monthArrow}
            onPress={() => changeMonth("prev")}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color="#111827"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthCenter}
            onPress={() =>
              setShowMonthPicker(true)
            }
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#111827"
            />

            <Text style={styles.monthText}>
              {getMonthLabel(selectedMonth)}
            </Text>

            <Ionicons
              name="chevron-down"
              size={16}
              color="#6B7280"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthArrow}
            onPress={() => changeMonth("next")}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#111827"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="people-outline"
            label="Staff"
            value={String(staffCount)}
          />

          <SummaryCard
            icon="wallet-outline"
            label="Total"
            value={formatMoney(totals.netSalary)}
          />

          <SummaryCard
            icon="checkmark-circle-outline"
            label="Paid"
            value={formatMoney(totals.paid)}
          />

          <SummaryCard
            icon="time-outline"
            label="Pending"
            value={formatMoney(totals.pending)}
          />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#9CA3AF"
          />

          <TextInput
            value={search}
            onChangeText={(value) =>
              dispatch(setSearch(value))
            }
            placeholder="Search staff by name or phone"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => dispatch(setSearch(""))}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <FilterButton
            label="All"
            active={status === ""}
            onPress={() => dispatch(setStatus(""))}
          />

          <FilterButton
            label={`Pending ${pendingCount}`}
            active={status === "PENDING"}
            onPress={() =>
              dispatch(setStatus("PENDING"))
            }
          />

          <FilterButton
            label={`Paid ${paidCount}`}
            active={status === "PAID"}
            onPress={() =>
              dispatch(setStatus("PAID"))
            }
          />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#B91C1C"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Salary Details
        </Text>
      </>
    ),
    [
      selectedMonth,
      staffCount,
      totals,
      search,
      status,
      pendingCount,
      paidCount,
      error,
      loading,
      onRefresh,
    ]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <FlatList
        data={salaries}
        keyExtractor={(item) => item._id}
        renderItem={renderSalary}
        ListHeaderComponent={header}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          salaries.length === 0 &&
            styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#111827"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Month Picker */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowMonthPicker(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setShowMonthPicker(false)
          }
        >
          <Pressable
            style={styles.monthModal}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text style={styles.modalTitle}>
              Select Month
            </Text>

            <Text style={styles.modalSubtitle}>
              Choose salary month
            </Text>

            <View style={styles.monthModalGrid}>
              {MONTH_NAMES.map(
                (monthName, index) => {
                  const currentYear =
                    Number(
                      selectedMonth.split("-")[0]
                    ) || new Date().getFullYear();

                  const monthValue = `${currentYear}-${String(
                    index + 1
                  ).padStart(2, "0")}`;

                  const active =
                    monthValue === selectedMonth;

                  return (
                    <TouchableOpacity
                      key={monthValue}
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

                        setShowMonthPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.monthOptionText,
                          active &&
                            styles.monthOptionTextActive,
                        ]}
                      >
                        {monthName.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() =>
                setShowMonthPicker(false)
              }
            >
              <Text style={styles.closeModalText}>
                Close
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Generate / Edit Salary */}
      <Modal
        visible={showGenerateModal}
        transparent
        animationType="slide"
        onRequestClose={closeGenerateModal}
      >
        <View style={styles.bottomModalOverlay}>
          <View style={styles.bottomModal}>
            <View style={styles.modalHandle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={styles.modalTitle}>
                    Salary Details
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    {selectedSalary?.stylist?.name ||
                      "Staff"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={closeGenerateModal}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={28}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.readOnlySalaryBox}>
                <View>
                  <Text style={styles.readOnlyLabel}>
                    Basic Salary
                  </Text>

                  <Text style={styles.readOnlyValue}>
                    {formatMoney(
                      selectedSalary?.basicSalary
                    )}
                  </Text>
                </View>

                <View>
                  <Text style={styles.readOnlyLabel}>
                    Overtime
                  </Text>

                  <Text style={styles.readOnlyValue}>
                    {formatMoney(
                      selectedSalary?.overtimeSalary
                    )}
                  </Text>
                </View>
              </View>

              <InputField
                label="Commission"
                value={commission}
                onChangeText={setCommission}
                placeholder="0"
                keyboardType="numeric"
              />

              <InputField
                label="Bonus"
                value={bonus}
                onChangeText={setBonus}
                placeholder="0"
                keyboardType="numeric"
              />

              <InputField
                label="Advance"
                value={advance}
                onChangeText={setAdvance}
                placeholder="0"
                keyboardType="numeric"
              />

              <InputField
                label="Deduction"
                value={deduction}
                onChangeText={setDeduction}
                placeholder="0"
                keyboardType="numeric"
              />

              <InputField
                label="Notes"
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional notes"
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.primaryModalButton,
                  generating &&
                    styles.disabledButton,
                ]}
                disabled={generating}
                onPress={handleGenerateSalary}
              >
                {generating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="save-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.primaryModalButtonText
                      }
                    >
                      Generate Salary
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={closeGenerateModal}
              >
                <Text style={styles.cancelModalText}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={closePaymentModal}
      >
        <View style={styles.bottomModalOverlay}>
          <View style={styles.bottomModal}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>
                  Confirm Payment
                </Text>

                <Text style={styles.modalSubtitle}>
                  {selectedSalary?.stylist?.name}
                </Text>
              </View>

              <TouchableOpacity
                onPress={closePaymentModal}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={28}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentAmountBox}>
              <Text style={styles.paymentAmountLabel}>
                Net Salary
              </Text>

              <Text style={styles.paymentAmount}>
                {formatMoney(
                  selectedSalary?.netSalary
                )}
              </Text>
            </View>

            <Text style={styles.inputLabel}>
              Payment Method
            </Text>

            <View style={styles.paymentMethodGrid}>
              {PAYMENT_METHODS.map((method) => {
                const active =
                  selectedPaymentMethod === method;

                return (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentMethod,
                      active &&
                        styles.paymentMethodActive,
                    ]}
                    onPress={() =>
                      setSelectedPaymentMethod(
                        method
                      )
                    }
                  >
                    <Ionicons
                      name={
                        method === "CASH"
                          ? "cash-outline"
                          : method === "UPI"
                          ? "phone-portrait-outline"
                          : method ===
                            "BANK_TRANSFER"
                          ? "business-outline"
                          : "card-outline"
                      }
                      size={20}
                      color={
                        active
                          ? "#FFFFFF"
                          : "#374151"
                      }
                    />

                    <Text
                      style={[
                        styles.paymentMethodText,
                        active &&
                          styles.paymentMethodTextActive,
                      ]}
                    >
                      {method === "BANK_TRANSFER"
                        ? "Bank"
                        : method}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryModalButton,
                paying && styles.disabledButton,
              ]}
              disabled={paying}
              onPress={handleMarkPaid}
            >
              {paying ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryModalButtonText
                    }
                  >
                    Confirm Payment
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={closePaymentModal}
            >
              <Text style={styles.cancelModalText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| Components
|--------------------------------------------------------------------------
*/

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#111827"
        />
      </View>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text
        style={styles.summaryValue}
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
    <View style={styles.salaryAmount}>
      <Text style={styles.amountLabel}>
        {label}
      </Text>

      <Text style={styles.amountValue}>
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
        active && styles.filterButtonActive,
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

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  multiline?: boolean;
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType || "default"}
        multiline={multiline}
        textAlignVertical={
          multiline ? "top" : "center"
        }
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
      />
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
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
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    overflow: "hidden",
  },

  monthArrow: {
    width: 48,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  monthCenter: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  monthText: {
    fontSize: 16,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 3,
  },

  summaryValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  searchContainer: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  filterButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  filterButtonTextActive: {
    color: "#FFFFFF",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },

  errorText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 13,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },

  salaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  salaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  staffInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  staffSpecialization: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  staffPhone: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },

  paidBadge: {
    backgroundColor: "#ECFDF5",
  },

  pendingBadge: {
    backgroundColor: "#FFFBEB",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  paidDot: {
    backgroundColor: "#059669",
  },

  pendingDot: {
    backgroundColor: "#D97706",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  paidText: {
    color: "#047857",
  },

  pendingText: {
    color: "#B45309",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },

  salaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  salaryAmount: {
    flex: 1,
  },

  amountLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
  },

  amountValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  secondaryRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },

  secondaryItem: {
    flex: 1,
  },

  secondaryLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 3,
  },

  deductionValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },

  grossValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  netSalaryRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  netLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  netSubText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 3,
  },

  netSalary: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  editButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  editButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },

  payButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  payButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  pendingButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  pendingButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  emptyDescription: {
    textAlign: "center",
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 6,
    paddingHorizontal: 30,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },

  monthModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  monthModalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 20,
  },

  monthOption: {
    width: "30%",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  monthOptionActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  monthOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  monthOptionTextActive: {
    color: "#FFFFFF",
  },

  closeModalButton: {
    marginTop: 18,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  closeModalText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  bottomModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  bottomModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    maxHeight: "90%",
  },

  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 18,
  },

  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  readOnlySalaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
  },

  readOnlyLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
  },

  readOnlyValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  inputContainer: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
    fontSize: 14,
  },

  multilineInput: {
    height: 90,
    paddingTop: 13,
  },

  primaryModalButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },

  primaryModalButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },

  cancelModalButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  cancelModalText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
  },

  paymentAmountBox: {
    backgroundColor: "#F8FAFC",
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
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    marginTop: 4,
  },

  paymentMethodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },

  paymentMethod: {
    width: "48%",
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  paymentMethodActive: {
    backgroundColor: "#111827",
  },

  paymentMethodText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  paymentMethodTextActive: {
    color: "#FFFFFF",
  },
});