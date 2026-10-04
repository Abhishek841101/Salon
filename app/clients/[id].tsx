import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";

import { getClientById } from "../../src/features/clients/clientsSlice";

export default function ClientDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const dispatch = useDispatch<any>();

  const { client, loading, error } = useSelector(
    (state: any) => state.clients
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    if (!id) return;

    try {
      await dispatch(getClientById(String(id))).unwrap();
    } catch (err) {
      console.log("GET CLIENT ERROR:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await loadClient();
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (value: any) => {
    if (!value) return "Not available";

    try {
      return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Not available";
    }
  };

  const formatAmount = (value: any) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getInitial = () => {
    if (!client?.name) return "?";

    return client.name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  const imageUrl =
    client?.profileImage?.url ||
    client?.profileImage?.secure_url ||
    "";

  if (loading && !client) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#A93650" />
          <Text style={styles.loadingText}>
            Loading client...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!client) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#111827"
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Client Details
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="person-outline"
              size={42}
              color="#A93650"
            />
          </View>

          <Text style={styles.errorTitle}>
            Client not found
          </Text>

          <Text style={styles.errorText}>
            {error || "Unable to load this client."}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={loadClient}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />
        </Pressable>

        <Text
          style={styles.headerTitle}
          numberOfLines={1}
        >
          Client Details
        </Text>

        <Pressable
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(
              "Client",
              "Choose an action",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Edit",
                  onPress: () => {
                    router.push({
                      pathname: "/clients/edit-client",
                      params: {
                        id: String(client._id),
                      },
                    });
                  },
                },
              ]
            );
          }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color="#111827"
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#A93650"
          />
        }
        contentContainerStyle={styles.container}
      >
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageWrapper}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitial()}
                </Text>
              </View>
            )}

            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: client.isActive
                    ? "#22C55E"
                    : "#9CA3AF",
                },
              ]}
            />
          </View>

          <Text style={styles.clientName}>
            {client.name || "Unnamed Client"}
          </Text>

          <View style={styles.activeBadge}>
            <View
              style={[
                styles.badgeDot,
                {
                  backgroundColor: client.isActive
                    ? "#16A34A"
                    : "#6B7280",
                },
              ]}
            />

            <Text style={styles.activeText}>
              {client.isActive ? "Active Client" : "Inactive"}
            </Text>
          </View>

          {!!client.phone && (
            <Pressable
              onPress={() => {
                // Intentionally no direct phone integration.
              }}
              style={styles.phoneRow}
            >
              <Ionicons
                name="call-outline"
                size={17}
                color="#A93650"
              />

              <Text style={styles.phoneText}>
                {client.phone}
              </Text>
            </Pressable>
          )}
        </View>

        {/* QUICK STATS */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons
                name="calendar-outline"
                size={21}
                color="#A93650"
              />
            </View>

            <Text style={styles.statValue}>
              {client.totalVisits ?? 0}
            </Text>

            <Text style={styles.statLabel}>
              Total Visits
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons
                name="wallet-outline"
                size={21}
                color="#A93650"
              />
            </View>

            <Text style={styles.statValue}>
              {formatAmount(client.totalSpent)}
            </Text>

            <Text style={styles.statLabel}>
              Total Spent
            </Text>
          </View>
        </View>

        {/* PERSONAL INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="mail-outline"
              label="Email"
              value={client.email || "Not provided"}
            />

            <InfoRow
              icon="person-outline"
              label="Gender"
              value={client.gender || "Not provided"}
            />

            <InfoRow
              icon="calendar-outline"
              label="Date of Birth"
              value={formatDate(client.dateOfBirth)}
            />
            <InfoRow
  icon="heart-outline"
  label="Anniversary Date"
  value={formatDate(client.anniversaryDate)}
/>


            <InfoRow
              icon="location-outline"
              label="Address"
              value={client.address || "Not provided"}
              last
            />
          </View>
        </View>

        {/* NOTES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Notes
          </Text>

          <View style={styles.notesCard}>
            <Ionicons
              name="document-text-outline"
              size={21}
              color="#A93650"
            />

            <Text style={styles.notesText}>
              {client.notes?.trim()
                ? client.notes
                : "No notes added for this client."}
            </Text>
          </View>
        </View>

        {/* VISIT INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Visit Information
          </Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="time-outline"
              label="Last Visit"
              value={formatDate(client.lastVisitAt)}
            />

            <InfoRow
              icon="calendar-outline"
              label="Client Since"
              value={formatDate(client.createdAt)}
            />

            <InfoRow
              icon="refresh-outline"
              label="Last Updated"
              value={formatDate(client.updatedAt)}
              last
            />
          </View>
        </View>

        {/* CLIENT ID */}
        <View style={styles.idCard}>
          <Text style={styles.idLabel}>
            Client ID
          </Text>

          <Text style={styles.idValue}>
            {client._id || "N/A"}
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        !last && styles.infoRowBorder,
      ]}
    >
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#A93650"
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F7F8",
  },

  header: {
    height: 58,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEF",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSpacer: {
    width: 40,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  container: {
    padding: 16,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  profileImageWrapper: {
    position: "relative",
    marginBottom: 14,
  },

  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F1F1F3",
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F9E7EC",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 42,
    fontWeight: "800",
    color: "#A93650",
  },

  statusDot: {
    position: "absolute",
    right: 4,
    bottom: 8,
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  clientName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginTop: 9,
  },

  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  activeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
  },

  phoneText: {
    marginLeft: 7,
    fontSize: 15,
    fontWeight: "600",
    color: "#A93650",
  },

  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    minHeight: 105,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FCECEF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 55,
    backgroundColor: "#E5E7EB",
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
    marginLeft: 3,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 15,
  },

  infoRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEF0",
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FCECEF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: "#8A8F98",
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },

  notesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  notesText: {
    flex: 1,
    marginLeft: 11,
    fontSize: 14,
    lineHeight: 21,
    color: "#4B5563",
  },

  idCard: {
    backgroundColor: "#F1F2F4",
    borderRadius: 14,
    padding: 14,
  },

  idLabel: {
    fontSize: 11,
    color: "#8A8F98",
    marginBottom: 4,
  },

  idValue: {
    fontSize: 12,
    color: "#6B7280",
  },

  bottomSpace: {
    height: 30,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },

  errorIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FCECEF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 7,
  },

  errorText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: "#A93650",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});