





import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchStylists,
  deleteStylist,
  updateStylist,
  type Stylist,
} from "../../src/features/stylist/stylistSlice";

type RootState = any;
type AppDispatch = any;

export default function StaffScreen() {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    stylists = [],
    loading = false,
    deleting = false,
    error = null,
  } = useSelector(
    (state: RootState) =>
      state.stylists || {}
  );

  const [search, setSearch] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  const loadStaff = useCallback(
    async () => {
      try {
        await dispatch(
          fetchStylists({
            search: search.trim(),
          })
        ).unwrap();
      } catch (err) {
        console.log(
          "LOAD STAFF ERROR:",
          err
        );
      }
    },
    [dispatch, search]
  );

  useFocusEffect(
    useCallback(() => {
      loadStaff();
    }, [loadStaff])
  );

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadStaff();
    } finally {
      setRefreshing(false);
    }
  };

  const displayedStaff =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return stylists;
      }

      return stylists.filter(
        (staff: Stylist) =>
          staff.name
            ?.toLowerCase()
            .includes(value) ||
          staff.phone
            ?.toLowerCase()
            .includes(value) ||
          staff.email
            ?.toLowerCase()
            .includes(value) ||
          staff.specialization
            ?.toLowerCase()
            .includes(value)
      );
    }, [stylists, search]);

  const confirmDelete = (
    staff: Stylist
  ) => {
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
          onPress: async () => {
            try {
              await dispatch(
                deleteStylist(staff._id)
              ).unwrap();

              await loadStaff();
            } catch (err: any) {
              Alert.alert(
                "Error",
                String(
                  err ||
                    "Failed to delete staff"
                )
              );
            }
          },
        },
      ]
    );
  };

  const toggleStatus = (
    staff: Stylist
  ) => {
    const newStatus =
      staff.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    Alert.alert(
      newStatus === "ACTIVE"
        ? "Activate Staff"
        : "Deactivate Staff",
      `${staff.name} will be marked ${newStatus.toLowerCase()}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await dispatch(
                updateStylist({
                  id: staff._id,
                  status: newStatus,
                })
              ).unwrap();

              await loadStaff();
            } catch (err: any) {
              Alert.alert(
                "Error",
                String(
                  err ||
                    "Failed to update status"
                )
              );
            }
          },
        },
      ]
    );
  };

  const renderStaff = ({
    item,
  }: {
    item: Stylist;
  }) => {
    const active =
      item.status === "ACTIVE";

    const initial =
      item.name
        ?.charAt(0)
        ?.toUpperCase() || "S";

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && {
            opacity: 0.94,
          },
        ]}
        onPress={() =>
          router.push(
            `/staff/${item._id}`
          )
        }
      >
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initial}
            </Text>
          </View>

          <View style={styles.main}>
            <View style={styles.nameRow}>
              <Text
                style={styles.name}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <View
                style={[
                  styles.badge,
                  active
                    ? styles.activeBadge
                    : styles.inactiveBadge,
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    active
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />

                <Text
                  style={[
                    styles.badgeText,
                    active
                      ? styles.activeText
                      : styles.inactiveText,
                  ]}
                >
                  {active
                    ? "ACTIVE"
                    : "INACTIVE"}
                </Text>
              </View>
            </View>

            <Text
              style={styles.specialization}
            >
              {item.specialization ||
                "Beauty Professional"}
            </Text>

            <Text style={styles.phone}>
              {item.phone}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.salaryRow}>
          <View>
            <Text style={styles.smallLabel}>
              MONTHLY
            </Text>

            <Text style={styles.salary}>
              ₹
              {Number(
                item.monthlySalary || 0
              ).toLocaleString("en-IN")}
            </Text>
          </View>

          <View>
            <Text style={styles.smallLabel}>
              8H BASIC
            </Text>

            <Text style={styles.salary}>
              ₹
              {Number(
                item.basicSalary8h || 0
              ).toLocaleString("en-IN")}
            </Text>
          </View>

          <View>
            <Text style={styles.smallLabel}>
              OT / HOUR
            </Text>

            <Text style={styles.salary}>
              ₹
              {Number(
                item.overtimeRatePerHour ||
                  0
              ).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actions}>
          <Pressable
            style={styles.viewButton}
            onPress={() =>
              router.push(
                `/staff/${item._id}`
              )
            }
          >
            <Text style={styles.viewText}>
              View Profile
            </Text>
          </Pressable>

          <Pressable
            style={styles.editButton}
            onPress={() =>
              router.push(
                `/staff/add?id=${item._id}`
              )
            }
          >
            <Text style={styles.editText}>
              Edit
            </Text>
          </Pressable>

          <Pressable
            style={styles.statusButton}
            onPress={() =>
              toggleStatus(item)
            }
          >
            <Text style={styles.statusButtonText}>
              {active
                ? "Deactivate"
                : "Activate"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            disabled={deleting}
            onPress={() =>
              confirmDelete(item)
            }
          >
            <Text
              style={
                styles.deleteButtonText
              }
            >
              Delete
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F2EF"
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            SALON TEAM
          </Text>

          <Text style={styles.title}>
            Staff & Stylists
          </Text>

          <Text style={styles.subtitle}>
            Manage staff, salary and attendance
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            router.push("/staff/add")
          }
        >
          <Text style={styles.addPlus}>
            +
          </Text>

          <Text style={styles.addText}>
            Add Staff
          </Text>
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>
          ⌕
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, phone or email..."
          placeholderTextColor="#9B8F94"
          style={styles.searchInput}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() =>
              setSearch("")
            }
          >
            <Text style={styles.clear}>
              ×
            </Text>
          </Pressable>
        )}
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {String(error)}
          </Text>
        </View>
      )}

      <FlatList
        data={displayedStaff}
        keyExtractor={(item) =>
          item._id
        }
        renderItem={renderStaff}
        contentContainerStyle={
          styles.list
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#7E243A"]}
            tintColor="#7E243A"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <>
                <ActivityIndicator
                  size="large"
                  color="#7E243A"
                />

                <Text style={styles.emptyText}>
                  Loading staff...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyIcon}>
                  ♙
                </Text>

                <Text style={styles.emptyTitle}>
                  No Staff Found
                </Text>

                <Text style={styles.emptyText}>
                  {search
                    ? "Try another search."
                    : "Add your first staff member."}
                </Text>

                {!search && (
                  <Pressable
                    style={styles.emptyButton}
                    onPress={() =>
                      router.push(
                        "/staff/add"
                      )
                    }
                  >
                    <Text
                      style={
                        styles.emptyButtonText
                      }
                    >
                      + Add Staff
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F2EF",
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#9A6B78",
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#38252C",
    marginTop: 2,
  },

  subtitle: {
    color: "#887980",
    fontSize: 12,
    marginTop: 3,
  },

  addButton: {
    backgroundColor: "#7E243A",
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  addPlus: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginRight: 4,
  },

  addText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  searchBox: {
    marginHorizontal: 18,
    marginBottom: 12,
    height: 49,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8DCDA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  searchIcon: {
    fontSize: 22,
    color: "#7E243A",
    marginRight: 7,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#3D2930",
  },

  clear: {
    fontSize: 25,
    color: "#8C7B82",
  },

  errorBox: {
    marginHorizontal: 18,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#E5BDBD",
  },

  errorText: {
    color: "#9D3434",
    fontSize: 12,
    fontWeight: "600",
  },

  list: {
    paddingHorizontal: 18,
    paddingBottom: 35,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#EEE3E0",
  },

  cardTop: {
    flexDirection: "row",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#F5E5EA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#7E243A",
    fontSize: 24,
    fontWeight: "900",
  },

  main: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    flex: 1,
    color: "#39282E",
    fontSize: 17,
    fontWeight: "900",
    marginRight: 7,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#EAF7EF",
  },

  inactiveBadge: {
    backgroundColor: "#F4EAEA",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  activeDot: {
    backgroundColor: "#2F9B57",
  },

  inactiveDot: {
    backgroundColor: "#A45B5B",
  },

  badgeText: {
    fontSize: 8,
    fontWeight: "900",
  },

  activeText: {
    color: "#2F8050",
  },

  inactiveText: {
    color: "#955151",
  },

  specialization: {
    color: "#7E243A",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },

  phone: {
    color: "#81737A",
    fontSize: 12,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#F0E8E6",
    marginVertical: 14,
  },

  salaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  smallLabel: {
    fontSize: 8,
    color: "#A09298",
    fontWeight: "900",
    marginBottom: 3,
  },

  salary: {
    color: "#4B2933",
    fontSize: 13,
    fontWeight: "900",
  },

  actions: {
    flexDirection: "row",
    gap: 7,
  },

  viewButton: {
    flex: 1,
    backgroundColor: "#7E243A",
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: "center",
  },

  viewText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  editButton: {
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#F5E7EB",
  },

  editText: {
    color: "#7E243A",
    fontSize: 10,
    fontWeight: "800",
  },

  statusButton: {
    paddingHorizontal: 9,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#F2EEE9",
  },

  statusButtonText: {
    color: "#62545A",
    fontSize: 9,
    fontWeight: "800",
  },

  deleteButton: {
    paddingHorizontal: 9,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#FFF0F0",
  },

  deleteButtonText: {
    color: "#A33F3F",
    fontSize: 9,
    fontWeight: "800",
  },

  empty: {
    paddingTop: 80,
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 42,
    color: "#7E243A",
  },

  emptyTitle: {
    color: "#3D2930",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 12,
  },

  emptyText: {
    color: "#8C7E84",
    fontSize: 12,
    marginTop: 7,
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: "#7E243A",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 13,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});