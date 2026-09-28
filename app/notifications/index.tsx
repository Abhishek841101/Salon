import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

type NotificationItem = {
  id: string;
  type: "booking" | "offer" | "reminder" | "system";
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "booking",
    title: "Booking confirmed",
    message:
      "Your salon appointment has been confirmed successfully.",
    time: "Today, 10:30 AM",
    unread: true,
  },
  {
    id: "2",
    type: "reminder",
    title: "Appointment reminder",
    message:
      "Your appointment is scheduled for tomorrow. We look forward to seeing you.",
    time: "Today, 09:15 AM",
    unread: true,
  },
  {
    id: "3",
    type: "offer",
    title: "A little self-care?",
    message:
      "Explore our latest salon services and exclusive offers.",
    time: "Yesterday",
    unread: true,
  },
  {
    id: "4",
    type: "system",
    title: "Welcome to Glow Salon",
    message:
      "Your beauty journey starts here. Discover services made for you.",
    time: "2 days ago",
    unread: false,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(
    (item) => item.unread
  ).length;

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        unread: false,
      }))
    );
  };

  const markRead = (id: string) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, unread: false }
          : item
      )
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.brand}>
              GLOW SALON
            </Text>

            <Text style={styles.headerTitle}>
              Notifications
            </Text>
          </View>

          <Pressable
            style={styles.checkButton}
            onPress={markAllRead}
          >
            <Text style={styles.checkIcon}>✓</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* INTRO */}

          <View style={styles.introRow}>
            <View style={styles.introTextContainer}>
              <Text style={styles.eyebrow}>
                STAY IN THE LOOP
              </Text>

              <Text style={styles.pageTitle}>
                What's new?
              </Text>

              <Text style={styles.pageSubtitle}>
                Appointment updates, reminders and
                special moments from Glow Salon.
              </Text>
            </View>

            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadNumber}>
                  {unreadCount}
                </Text>
                <Text style={styles.unreadLabel}>
                  NEW
                </Text>
              </View>
            )}
          </View>

          {/* MARK ALL */}

          {unreadCount > 0 && (
            <Pressable
              style={styles.markReadButton}
              onPress={markAllRead}
            >
              <Text style={styles.markReadText}>
                Mark all as read
              </Text>

              <Text style={styles.markReadArrow}>
                ✓
              </Text>
            </Pressable>
          )}

          {/* TODAY */}

          <Text style={styles.sectionTitle}>
            RECENT
          </Text>

          <View style={styles.notificationCard}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <NotificationRow
                  notification={notification}
                  onPress={() =>
                    markRead(notification.id)
                  }
                />

                {index <
                  notifications.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* EMPTY MESSAGE */}

          {notifications.length === 0 && (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  ♡
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                You're all caught up
              </Text>

              <Text style={styles.emptyText}>
                There are no new notifications right now.
              </Text>
            </View>
          )}

          {/* INFO */}

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>
                i
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Important updates
              </Text>

              <Text style={styles.infoText}>
                We'll notify you about booking
                confirmations, appointment reminders
                and important salon updates.
              </Text>
            </View>
          </View>

          <Text style={styles.footerText}>
            GLOW SALON • BEAUTY & WELLNESS
          </Text>

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* BOTTOM NAV */}

        <View style={styles.bottomNav}>
          <NavItem
            icon="⌂"
            label="Home"
            onPress={() => router.push("/")}
          />

          <NavItem
            icon="✦"
            label="Services"
            onPress={() => router.push("/services")}
          />

          <NavItem
            icon="▣"
            label="Bookings"
            onPress={() => router.push("/bookings")}
          />

          <NavItem
            icon="◯"
            label="Profile"
            onPress={() => router.push("/profile")}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

/* =====================================================
   NOTIFICATION ROW
===================================================== */

function NotificationRow({
  notification,
  onPress,
}: {
  notification: NotificationItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.notificationRow,
        notification.unread &&
          styles.notificationUnread,
      ]}
      onPress={onPress}
    >
      <NotificationIcon type={notification.type} />

      <View style={styles.notificationContent}>
        <View style={styles.titleRow}>
          <Text style={styles.notificationTitle}>
            {notification.title}
          </Text>

          {notification.unread && (
            <View style={styles.unreadDot} />
          )}
        </View>

        <Text
          style={styles.notificationMessage}
          numberOfLines={2}
        >
          {notification.message}
        </Text>

        <Text style={styles.notificationTime}>
          {notification.time}
        </Text>
      </View>

      <Text style={styles.rowArrow}>›</Text>
    </Pressable>
  );
}

/* =====================================================
   NOTIFICATION ICON
===================================================== */

function NotificationIcon({
  type,
}: {
  type: NotificationItem["type"];
}) {
  let icon = "i";

  if (type === "booking") {
    icon = "✓";
  }

  if (type === "offer") {
    icon = "✦";
  }

  if (type === "reminder") {
    icon = "◷";
  }

  if (type === "system") {
    icon = "♡";
  }

  return (
    <View style={styles.notificationIcon}>
      <Text style={styles.notificationIconText}>
        {icon}
      </Text>
    </View>
  );
}

/* =====================================================
   NAV ITEM
===================================================== */

function NavItem({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.navItem}
      onPress={onPress}
    >
      <View style={styles.navIcon}>
        <Text style={styles.navIconText}>
          {icon}
        </Text>
      </View>

      <Text style={styles.navText}>
        {label}
      </Text>
    </Pressable>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF7F4",
  },

  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 19,
    paddingBottom: 110,
  },

  /* HEADER */

  header: {
    height: 76,
    paddingHorizontal: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#F1E1DE",
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    color: "#70253B",
    fontSize: 32,
    lineHeight: 35,
    marginTop: -5,
  },

  headerCenter: {
    alignItems: "center",
  },

  brand: {
    color: "#A18E94",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 2,
  },

  headerTitle: {
    color: "#30272A",
    fontSize: 20,
    fontFamily: "serif",
    fontWeight: "600",
    marginTop: 2,
  },

  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#F1E1DE",
    alignItems: "center",
    justifyContent: "center",
  },

  checkIcon: {
    color: "#70253B",
    fontSize: 18,
    fontWeight: "900",
  },

  /* INTRO */

  introRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 9,
  },

  introTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  eyebrow: {
    color: "#A07983",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.7,
  },

  pageTitle: {
    color: "#31282B",
    fontSize: 30,
    fontFamily: "serif",
    fontWeight: "600",
    marginTop: 4,
  },

  pageSubtitle: {
    color: "#93868A",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },

  unreadBadge: {
    width: 53,
    height: 53,
    borderRadius: 19,
    backgroundColor: "#70253B",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },

  unreadNumber: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  unreadLabel: {
    color: "#EEDFE2",
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 1,
  },

  /* MARK READ */

  markReadButton: {
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    marginTop: 15,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EEE3E0",
  },

  markReadText: {
    color: "#70253B",
    fontSize: 8,
    fontWeight: "900",
  },

  markReadArrow: {
    color: "#70253B",
    fontSize: 14,
    fontWeight: "900",
  },

  /* SECTION */

  sectionTitle: {
    color: "#9B8A90",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginTop: 21,
    marginBottom: 9,
    marginLeft: 3,
  },

  /* NOTIFICATION CARD */

  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    paddingHorizontal: 6,
    elevation: 2,
  },

  notificationRow: {
    minHeight: 93,
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  notificationUnread: {
    backgroundColor: "#FFFCFB",
  },

  notificationIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: "#F8EBE8",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationIconText: {
    color: "#70253B",
    fontSize: 17,
    fontWeight: "800",
  },

  notificationContent: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 5,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationTitle: {
    color: "#3C3236",
    fontSize: 10,
    fontWeight: "900",
    flexShrink: 1,
  },

  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#70253B",
    marginLeft: 6,
  },

  notificationMessage: {
    color: "#94878B",
    fontSize: 7.5,
    lineHeight: 12,
    marginTop: 4,
  },

  notificationTime: {
    color: "#B1A3A7",
    fontSize: 6.5,
    marginTop: 5,
  },

  rowArrow: {
    color: "#B6A8AC",
    fontSize: 22,
    marginLeft: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1E9E6",
    marginHorizontal: 10,
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 30,
    alignItems: "center",
    marginTop: 10,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: "#F8EBE8",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIconText: {
    color: "#70253B",
    fontSize: 25,
  },

  emptyTitle: {
    color: "#403337",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 13,
  },

  emptyText: {
    color: "#9B8E92",
    fontSize: 8,
    textAlign: "center",
    marginTop: 5,
  },

  /* INFO */

  infoCard: {
    marginTop: 18,
    backgroundColor: "#F4E8E5",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  infoIconText: {
    color: "#70253B",
    fontSize: 15,
    fontWeight: "900",
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    color: "#70253B",
    fontSize: 8.5,
    fontWeight: "900",
  },

  infoText: {
    color: "#8F7E83",
    fontSize: 7.5,
    lineHeight: 12,
    marginTop: 3,
  },

  footerText: {
    color: "#B0A1A6",
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 18,
  },

  bottomSpace: {
    height: 20,
  },

  /* BOTTOM NAV */

  bottomNav: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    height: 68,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 10,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconText: {
    color: "#A99A9F",
    fontSize: 17,
  },

  navText: {
    color: "#A99A9F",
    fontSize: 6.5,
    fontWeight: "800",
    marginTop: 2,
  },
});