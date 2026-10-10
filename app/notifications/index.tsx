import React, {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useFocusEffect,
  useRouter,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import {
  fetchUnreadNotifications,
  generateUpcomingNotifications,
  markNotificationAsRead,
  type SalonNotification,
} from "../../src/features/notification/notificationSlice";

const MAROON = "#A93650";
const DARK = "#3A1821";
const CREAM = "#F8F7F8";
const WHITE = "#FFFFFF";
const MUTED = "#777777";
const BORDER = "#EEEEEE";

type RootState = any;

const NotificationsScreen = () => {
  const router = useRouter();

  const dispatch = useDispatch<any>();

  const {
    unreadNotifications = [],
    unreadCount = 0,
    loading = false,
    markingRead = false,
    error = null,
  } = useSelector(
    (state: RootState) =>
      state.notifications || {}
  );

  const [refreshing, setRefreshing] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadNotifications = async () => {
        try {
          await dispatch(
            generateUpcomingNotifications()
          ).unwrap();

          await dispatch(
            fetchUnreadNotifications()
          ).unwrap();
        } catch (error) {
          console.log(
            "NOTIFICATION LOAD ERROR:",
            error
          );
        }
      };

      loadNotifications();
    }, [dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await dispatch(
        generateUpcomingNotifications()
      ).unwrap();

      await dispatch(
        fetchUnreadNotifications()
      ).unwrap();
    } catch (error) {
      console.log(
        "NOTIFICATION REFRESH ERROR:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (
    notification: SalonNotification
  ) => {
    try {
      await dispatch(
        markNotificationAsRead(
          notification._id
        )
      ).unwrap();
    } catch (error: any) {
      console.log(
        "MARK NOTIFICATION READ ERROR:",
        error
      );

      Alert.alert(
        "Error",
        typeof error === "string"
          ? error
          : "Unable to mark notification as read."
      );
    }
  };

  const getClient = (
    notification: SalonNotification
  ) => {
    if (
      !notification.client ||
      typeof notification.client === "string"
    ) {
      return {
        name: "Client",
        phone: "",
      };
    }

    return notification.client;
  };

  const openWhatsApp = async (
    notification: SalonNotification
  ) => {
    const client = getClient(notification);

    if (!client.phone) {
      Alert.alert(
        "Phone number not available",
        "This client does not have a phone number."
      );
      return;
    }

    const phone = String(client.phone).replace(
      /\D/g,
      ""
    );

    const whatsappNumber =
      phone.length === 10
        ? `91${phone}`
        : phone;

    const message =
      notification.type === "birthday"
        ? `Hello ${client.name}, GLOW Salon wishes you a very Happy Birthday!`
        : `Hello ${client.name},  GLOW Salon wishes you a very Happy Anniversary!`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log(
        "WHATSAPP ERROR:",
        error
      );

      Alert.alert(
        "WhatsApp Error",
        "Unable to open WhatsApp."
      );
    }
  };

  const callClient = async (
    notification: SalonNotification
  ) => {
    const client = getClient(notification);

    if (!client.phone) {
      Alert.alert(
        "Phone number not available",
        "This client does not have a phone number."
      );
      return;
    }

    const phone = String(client.phone).replace(
      /\D/g,
      ""
    );

    try {
      await Linking.openURL(
        `tel:${phone}`
      );
    } catch (error) {
      console.log(
        "CALL ERROR:",
        error
      );

      Alert.alert(
        "Call Error",
        "Unable to open phone dialer."
      );
    }
  };

  const formatDate = (
    dateString?: string
  ) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
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

  const getEventLabel = (
    type: string
  ) => {
    return type === "birthday"
      ? "Birthday"
      : "Anniversary";
  };

  const getIcon = (
    type: string
  ) => {
    return type === "birthday"
      ? "gift-outline"
      : "heart-outline";
  };

  if (
    loading &&
    unreadNotifications.length === 0
  ) {
    return (
      <View style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={CREAM}
        />

        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color={MAROON}
          />

          <Text
            style={styles.loadingText}
          >
            Loading notifications...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={CREAM}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={DARK}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            style={styles.headerTitle}
          >
            Notifications
          </Text>

          {unreadCount > 0 && (
            <Text
              style={styles.headerSubtitle}
            >
              {unreadCount} unread notification
              {unreadCount > 1
                ? "s"
                : ""}
            </Text>
          )}
        </View>

        <View
          style={styles.headerBadge}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={MAROON}
          />

          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text
                style={styles.badgeText}
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          unreadNotifications.length === 0
            ? styles.emptyContent
            : styles.content
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={MAROON}
            colors={[MAROON]}
          />
        }
      >
        {error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#C62828"
            />

            <Text
              style={styles.errorText}
            >
              {String(error)}
            </Text>
          </View>
        )}

        {unreadNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={styles.emptyIcon}
            >
              <Ionicons
                name="notifications-off-outline"
                size={42}
                color={MAROON}
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              No new notifications
            </Text>

            <Text
              style={styles.emptyText}
            >
              You are all caught up. Birthday
              and anniversary reminders will
              appear here 3 days before the event.
            </Text>
          </View>
        ) : (
          <>
            <View
              style={styles.sectionHeader}
            >
              <Text
                style={styles.sectionTitle}
              >
                Upcoming
              </Text>

              <Text
                style={styles.sectionCount}
              >
                {unreadCount}
              </Text>
            </View>

            {unreadNotifications.map(
              (
                notification: SalonNotification
              ) => {
                const client =
                  getClient(notification);

                const isBirthday =
                  notification.type ===
                  "birthday";

                return (
                  <View
                    key={notification._id}
                    style={
                      styles.notificationCard
                    }
                  >
                    <View
                      style={styles.cardTop}
                    >
                      <View
                        style={[
                          styles.eventIcon,
                          isBirthday
                            ? styles.birthdayIcon
                            : styles.anniversaryIcon,
                        ]}
                      >
                        <Ionicons
                          name={
                            getIcon(
                              notification.type
                            ) as any
                          }
                          size={25}
                          color={MAROON}
                        />
                      </View>

                      <View
                        style={
                          styles.cardTitleArea
                        }
                      >
                        <Text
                          style={
                            styles.notificationTitle
                          }
                        >
                          {notification.title}
                        </Text>

                        <View
                          style={
                            styles.eventBadge
                          }
                        >
                          <Text
                            style={
                              styles.eventBadgeText
                            }
                          >
                            {getEventLabel(
                              notification.type
                            )}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.unreadDot
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.clientSection
                      }
                    >
                      <Text
                        style={
                          styles.clientName
                        }
                      >
                        {client.name ||
                          "Client"}
                      </Text>

                      <Text
                        style={
                          styles.notificationMessage
                        }
                      >
                        {notification.message}
                      </Text>

                      <View
                        style={
                          styles.dateRow
                        }
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={15}
                          color={MUTED}
                        />

                        <Text
                          style={
                            styles.dateText
                          }
                        >
                          Event:{" "}
                          {formatDate(
                            notification.eventDate
                          )}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={styles.actions}
                    >
                      <TouchableOpacity
                        style={
                          styles.whatsappButton
                        }
                        onPress={() =>
                          openWhatsApp(
                            notification
                          )
                        }
                        activeOpacity={0.85}
                      >
                        <Ionicons
                          name="logo-whatsapp"
                          size={18}
                          color={WHITE}
                        />

                        <Text
                          style={
                            styles.whatsappText
                          }
                        >
                          WhatsApp
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={
                          styles.callButton
                        }
                        onPress={() =>
                          callClient(
                            notification
                          )
                        }
                        activeOpacity={0.85}
                      >
                        <Ionicons
                          name="call-outline"
                          size={18}
                          color={DARK}
                        />

                        <Text
                          style={
                            styles.callText
                          }
                        >
                          Call
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={
                        styles.markReadButton
                      }
                      onPress={() =>
                        handleMarkAsRead(
                          notification
                        )
                      }
                      disabled={markingRead}
                      activeOpacity={0.8}
                    >
                      {markingRead ? (
                        <ActivityIndicator
                          size="small"
                          color={MAROON}
                        />
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={19}
                            color={MAROON}
                          />

                          <Text
                            style={
                              styles.markReadText
                            }
                          >
                            Mark as Read
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }
            )}
          </>
        )}

        <View
          style={{ height: 30 }}
        />
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CREAM,
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight || 0
        : 0,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  header: {
    height: 76,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CREAM,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },

  headerCenter: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: DARK,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: MUTED,
  },

  headerBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: MAROON,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: WHITE,
    fontSize: 9,
    fontWeight: "800",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#FFD5D5",
    marginBottom: 15,
  },

  errorText: {
    flex: 1,
    color: "#C62828",
    fontSize: 13,
    fontWeight: "500",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK,
  },

  sectionCount: {
    marginLeft: 8,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    backgroundColor: "#F2DCE1",
    color: MAROON,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    textAlignVertical: "center",
  },

  notificationCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F0E5E8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  eventIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  birthdayIcon: {
    backgroundColor: "#FFF1F4",
  },

  anniversaryIcon: {
    backgroundColor: "#F8EDF0",
  },

  cardTitleArea: {
    flex: 1,
    marginLeft: 12,
  },

  notificationTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: DARK,
  },

  eventBadge: {
    alignSelf: "flex-start",
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#F7ECEF",
  },

  eventBadgeText: {
    color: MAROON,
    fontSize: 10,
    fontWeight: "700",
  },

  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: MAROON,
  },

  clientSection: {
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  clientName: {
    fontSize: 17,
    fontWeight: "800",
    color: DARK,
  },

  notificationMessage: {
    marginTop: 5,
    color: "#555555",
    fontSize: 13,
    lineHeight: 20,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
    gap: 6,
  },

  dateText: {
    color: MUTED,
    fontSize: 12,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },

  whatsappButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#25D366",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  whatsappText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "700",
  },

  callButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F6EEF0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  callText: {
    color: DARK,
    fontSize: 13,
    fontWeight: "700",
  },

  markReadButton: {
    height: 44,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#E4C8CF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  markReadText: {
    color: MAROON,
    fontSize: 13,
    fontWeight: "700",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F4E5E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: DARK,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    color: MUTED,
    fontSize: 13,
  },
});