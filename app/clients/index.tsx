import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image as RNImage,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchClients,
  clearClientError,
  bulkImportClients,
} from "../../src/features/clients/clientsSlice";
import { File } from "expo-file-system";
// import { router } from "expo-router";
type Client = {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  gender?: string;
  address?: string;
  isActive?: boolean;
  profileImage?: {
    url?: string;
    publicId?: string;
  };
};

type Pagination = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type ClientsState = {
  clients?: Client[];
  pagination?: Pagination;
  loading?: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  pages?: number;
};

type RootState = {
  clients: ClientsState;
  auth: {
    token: string | null;
  };
};

export default function ClientsScreen() {
  const dispatch = useDispatch<any>();

  const clientsState = useSelector(
    (state: RootState) => state.clients
  );

  const token = useSelector(
    (state: RootState) => state.auth.token
  );

  const clients = Array.isArray(clientsState?.clients)
    ? clientsState.clients
    : [];

  const pagination = clientsState?.pagination || {
    total: clientsState?.total,
    page: clientsState?.page,
    totalPages: clientsState?.pages,
  };

  const loading = Boolean(clientsState?.loading);
  const error = clientsState?.error || null;

  const totalClients =
    typeof pagination.total === "number"
      ? pagination.total
      : clients.length;

  const currentPage =
    typeof pagination.page === "number"
      ? pagination.page
      : 1;

  const totalPages =
    typeof pagination.totalPages === "number" &&
    pagination.totalPages > 0
      ? pagination.totalPages
      : 1;

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);

  const loadClients = useCallback(
    async (searchText = "", page = 1) => {
      if (!token) return;

      try {
        await dispatch(
          fetchClients({
            token,
            search: searchText,
            page,
            limit: 20,
          })
        );
      } catch (err) {
        console.log("LOAD CLIENTS ERROR:", err);
      }
    },
    [dispatch, token]
  );

  useFocusEffect(
    useCallback(() => {
      if (token) {
        loadClients(search, 1);
      }
    }, [token, loadClients])
  );

  const handleRefresh = async () => {
    if (!token) return;

    setRefreshing(true);

    try {
      await loadClients(search.trim(), 1);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    loadClients(search.trim(), 1);
  };

  const clearSearch = () => {
    setSearch("");
    loadClients("", 1);
  };

  const handleBulkImport = async () => {
    if (bulkImporting) return;

    setBulkImporting(true);

    try {
      const result = await dispatch(bulkImportClients());

      if (bulkImportClients.fulfilled.match(result)) {
        const payload = result.payload || {};
        const summary = payload.summary || {};

        const imported =
          summary.imported ??
          payload.imported ??
          payload.created ??
          0;

        const skipped =
          summary.skipped ??
          payload.skipped ??
          payload.duplicates ??
          0;

        const totalRows =
          summary.totalRows ??
          payload.totalRows ??
          imported + skipped;

        Alert.alert(
          "Bulk Import Complete",
          `Total rows: ${totalRows}\nImported: ${imported}\nSkipped: ${skipped}`,
          [
            {
              text: "OK",
              onPress: () => {
                loadClients(search.trim(), 1);
              },
            },
          ]
        );
      } else {
        const message =
          result.payload ||
          result.error?.message ||
          "Unable to import clients.";

        if (message !== "FILE_PICKER_CANCELLED") {
          Alert.alert("Bulk Import Failed", String(message));
        }
      }
    } catch (err: any) {
      Alert.alert(
        "Bulk Import Failed",
        err?.message || "Unable to import clients."
      );
    } finally {
      setBulkImporting(false);
    }
  };

  useEffect(() => {
    if (!error) return;

    Alert.alert("Error", error);
    dispatch(clearClientError());
  }, [error, dispatch]);

  const getInitials = (name?: string) => {
    if (!name?.trim()) return "CL";

    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0][0] + parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const renderClient = ({ item }: { item: Client }) => {
    const initials = getInitials(item.name);

    const imageUrl =
      typeof item.profileImage?.url === "string"
        ? item.profileImage.url.trim()
        : "";

    return (
      <Pressable
        onPress={() => router.push(`/clients/${item._id}`)}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.avatarWrapper}>
          {imageUrl ? (
            <RNImage
              source={{ uri: imageUrl }}
              style={styles.profileImage}
              resizeMode="cover"
              onError={() =>
                console.log("CLIENT IMAGE LOAD ERROR:", imageUrl)
              }
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
        </View>

        <View style={styles.clientInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.clientName} numberOfLines={1}>
              {item.name?.trim() || "Unknown Client"}
            </Text>
          </View>

          {item.phone ? (
            <View style={styles.infoRow}>
              <Ionicons
                name="call-outline"
                size={14}
                color="#8C6870"
              />
              <Text style={styles.phone} numberOfLines={1}>
                {item.phone}
              </Text>
            </View>
          ) : null}

          {item.email ? (
            <View style={styles.infoRow}>
              <Ionicons
                name="mail-outline"
                size={14}
                color="#8C6870"
              />
              <Text style={styles.email} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
          ) : null}

          {item.address ? (
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color="#8C6870"
              />
              <Text style={styles.address} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.rightSide}>
          <View
            style={[
              styles.status,
              item.isActive
                ? styles.activeStatus
                : styles.inactiveStatus,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                item.isActive
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                item.isActive
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {item.isActive ? "Active" : "Inactive"}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#B99BA2"
          />
        </View>
      </Pressable>
    );
  };
    const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name={search.trim() ? "search-outline" : "people-outline"}
            size={38}
            color="#A93650"
          />
        </View>

        <Text style={styles.emptyTitle}>
          {search.trim() ? "No Clients Found" : "No Clients Yet"}
        </Text>

        <Text style={styles.emptyText}>
          {search.trim()
            ? "Try searching with another name, phone number or email."
            : "Start building your salon client database by adding your first client."}
        </Text>

        {search.trim() ? (
          <Pressable
            onPress={clearSearch}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>Clear Search</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push("/clients/add-client")}
            style={styles.emptyButton}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>Add Client</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.heading}>Clients</Text>

          <View style={styles.countRow}>
            <View style={styles.countDot} />
            <Text style={styles.subHeading}>
              {totalClients} {totalClients === 1 ? "client" : "clients"}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={handleBulkImport}
            disabled={bulkImporting}
            style={({ pressed }) => [
              styles.importButton,
              pressed && styles.buttonPressed,
              bulkImporting && styles.disabledButton,
            ]}
          >
            {bulkImporting ? (
              <ActivityIndicator size="small" color="#A93650" />
            ) : (
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color="#A93650"
              />
            )}

            <Text style={styles.importButtonText}>
              {bulkImporting ? "Importing" : "Import"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/clients/add-client")}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
          >
            <Ionicons name="add" size={21} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#9D7D85"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          placeholder="Search name, phone or email..."
          placeholderTextColor="#B9A2A8"
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {search.length > 0 && (
          <Pressable
            onPress={clearSearch}
            hitSlop={8}
            style={styles.clearSearchButton}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#A98B93"
            />
          </Pressable>
        )}

        <Pressable
          onPress={handleSearch}
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.searchButtonPressed,
          ]}
        >
          <Ionicons name="search" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* CLIENT LIST */}
      {loading && clients.length === 0 ? (
        <View style={styles.loader}>
          <View style={styles.loaderCircle}>
            <ActivityIndicator size="large" color="#A93650" />
          </View>

          <Text style={styles.loadingText}>Loading clients...</Text>
          <Text style={styles.loadingSubText}>Please wait</Text>
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item, index) => item?._id || `client-${index}`}
          renderItem={renderClient}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.list,
            clients.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#A93650"
              colors={["#A93650"]}
            />
          }
        />
      )}

      {/* PAGINATION */}
      {clients.length > 0 && (
        <View style={styles.pagination}>
          <View style={styles.paginationInner}>
            <Ionicons
              name="people-outline"
              size={14}
              color="#A93650"
            />
            <Text style={styles.paginationText}>
              Page {currentPage} of {totalPages}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F7",
  },

  // HEADER
  header: {
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  headerLeft: {
    flex: 1,
    minWidth: 0,
  },

  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#351B23",
    letterSpacing: -0.7,
  },

  countRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  countDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#A93650",
    marginRight: 7,
  },

  subHeading: {
    fontSize: 13,
    color: "#94747C",
    fontWeight: "500",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  importButton: {
    minHeight: 44,
    paddingHorizontal: 11,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7C6CE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  importButtonText: {
    color: "#A93650",
    fontSize: 12,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },

  addButton: {
    minHeight: 44,
    paddingHorizontal: 13,
    borderRadius: 24,
    backgroundColor: "#A93650",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#A93650",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.22,
    shadowRadius: 9,
    elevation: 5,
  },

  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  // SEARCH
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    height: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEDDE1",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 5,
    shadowColor: "#3D1B25",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.045,
    shadowRadius: 8,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 9,
    color: "#351B23",
    fontSize: 14,
  },

  clearSearchButton: {
    padding: 5,
    marginRight: 2,
  },

  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#A93650",
    alignItems: "center",
    justifyContent: "center",
  },

  searchButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },

  // LIST
  list: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 95,
  },

  emptyList: {
    flexGrow: 1,
  },

  // CLIENT CARD
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0E2E5",
    shadowColor: "#3D1B25",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.055,
    shadowRadius: 9,
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  // AVATAR
  avatarWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
    marginRight: 13,
    backgroundColor: "#F8DDE2",
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  avatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F8DDE2",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#8E2F48",
    fontSize: 17,
    fontWeight: "800",
  },

  // CLIENT INFO
  clientInfo: {
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  clientName: {
    color: "#351B23",
    fontSize: 16,
    fontWeight: "750",
    flex: 1,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 3,
    minWidth: 0,
  },

  phone: {
    color: "#70545C",
    fontSize: 13,
    flexShrink: 1,
  },

  email: {
    color: "#967B82",
    fontSize: 12,
    flexShrink: 1,
  },

  address: {
    color: "#967B82",
    fontSize: 12,
    flexShrink: 1,
  },

  // RIGHT SIDE
  rightSide: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 9,
    marginLeft: 7,
  },

  status: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  activeStatus: {
    backgroundColor: "#E8F7EE",
  },

  inactiveStatus: {
    backgroundColor: "#F3E9EB",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  activeDot: {
    backgroundColor: "#267A45",
  },

  inactiveDot: {
    backgroundColor: "#87616B",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  activeText: {
    color: "#267A45",
  },

  inactiveText: {
    color: "#87616B",
  },

  // LOADING
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loaderCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F9E3E7",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 14,
    color: "#70545C",
    fontSize: 15,
    fontWeight: "700",
  },

  loadingSubText: {
    marginTop: 4,
    color: "#B49BA2",
    fontSize: 12,
  },

  // EMPTY STATE
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 38,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#F9E3E7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#351B23",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    color: "#967B82",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 21,
    backgroundColor: "#A93650",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    shadowColor: "#A93650",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  // PAGINATION
  pagination: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0E2E5",
    shadowColor: "#3D1B25",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  paginationInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  paginationText: {
    color: "#896D75",
    fontSize: 11,
    fontWeight: "700",
  },
});