import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSelector } from "react-redux";

import { apiRequest } from "../../src/api/api";

type Booking = {
  _id: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | string;
};

type RootState = any;

export default function ProfileScreen() {
  const token = useSelector(
    (state: RootState) => state.auth?.token
  );

  const [totalBookings, setTotalBookings] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const openPersonalDetails = () => {
    router.push("/profile/personal-details");
  };

  // =========================================================
  // LOAD BOOKING STATS
  // =========================================================

  useEffect(() => {
    const loadProfileStats = async () => {
      if (!token) {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);

        const response = await apiRequest("/bookings", {
          method: "GET",
          token,
        });

        const bookings: Booking[] =
          response?.bookings ||
          response?.data?.bookings ||
          response?.data ||
          [];

        if (!Array.isArray(bookings)) {
          setTotalBookings(0);
          setTotalVisits(0);
          return;
        }

        // Total bookings
        setTotalBookings(bookings.length);

        // Completed bookings = actual visits
        const completedBookings = bookings.filter(
          (booking) =>
            String(booking?.status || "").toUpperCase() ===
            "COMPLETED"
        );

        setTotalVisits(completedBookings.length);
      } catch (error: any) {
        console.error(
          "PROFILE BOOKING STATS ERROR:",
          error
        );

        setTotalBookings(0);
        setTotalVisits(0);
      } finally {
        setLoadingStats(false);
      }
    };

    loadProfileStats();
  }, [token]);

  // =========================================================
  // STATS
  // =========================================================

  const visitsText = loadingStats
    ? "..."
    : String(totalVisits);

  const bookingsText = loadingStats
    ? "..."
    : String(totalBookings);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <View style={styles.header}>
            <Pressable
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.brand}>
                GLOW SALON
              </Text>

              <Text style={styles.title}>
                Profile
              </Text>
            </View>

            <Pressable
              style={styles.headerButton}
              onPress={() =>
                Alert.alert(
                  "Settings",
                  "Profile settings will be available here."
                )
              }
            >
              <Text style={styles.settings}>
                ⚙
              </Text>
            </Pressable>
          </View>

          {/* =================================================
              PROFILE CARD
          ================================================= */}

          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  G
                </Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.welcome}>
                  WELCOME BACK
                </Text>

                <Text style={styles.name}>
                  Glow Guest
                </Text>

                <Text style={styles.email}>
                  Your beauty journey starts here
                </Text>
              </View>

              <Pressable
                style={styles.editButton}
                onPress={openPersonalDetails}
                hitSlop={12}
              >
                <Text style={styles.editIcon}>
                  ✎
                </Text>
              </Pressable>
            </View>

            <View style={styles.divider} />

            {/* =================================================
                REAL BACKEND STATS
            ================================================= */}

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {visitsText}
                </Text>

                <Text style={styles.statLabel}>
                  VISITS
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {bookingsText}
                </Text>

                <Text style={styles.statLabel}>
                  BOOKINGS
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  0
                </Text>

                <Text style={styles.statLabel}>
                  FAVOURITES
                </Text>
              </View>
            </View>
          </View>

          {/* =================================================
              QUICK BOOK
          ================================================= */}

          <Pressable
            style={styles.bookCard}
            onPress={() => router.push("/services")}
          >
            <View style={styles.bookLeft}>
              <View style={styles.bookIcon}>
                <Text style={styles.bookIconText}>
                  ✦
                </Text>
              </View>

              <View>
                <Text style={styles.bookSmall}>
                  READY FOR A LITTLE
                </Text>

                <Text style={styles.bookTitle}>
                  Self-care time?
                </Text>

                <Text style={styles.bookSubtitle}>
                  Explore our services
                </Text>
              </View>
            </View>

            <Text style={styles.bookArrow}>
              →
            </Text>
          </Pressable>

          {/* =================================================
              ACCOUNT
          ================================================= */}

          <Text style={styles.sectionTitle}>
            ACCOUNT
          </Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="▣"
              title="My Bookings"
              subtitle="View your appointments"
              onPress={() =>
                router.push("/bookings")
              }
            />

            <View style={styles.menuDivider} />

            <MenuItem
              icon="♡"
              title="Favourite Services"
              subtitle="Your saved beauty services"
              onPress={() => {
                Alert.alert(
                  "Favourite Services",
                  "Favourite services will be available here."
                );
              }}
            />

            <View style={styles.menuDivider} />

            <MenuItem
              icon="♙"
              title="Personal Details"
              subtitle="Manage your profile information"
              onPress={openPersonalDetails}
            />
          </View>

          {/* =================================================
              PREFERENCES
          ================================================= */}

          <Text style={styles.sectionTitle}>
            PREFERENCES
          </Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="♧"
              title="Notifications"
              subtitle="Manage appointment updates"
              rightText="ON"
              onPress={() => {}}
            />

            <View style={styles.menuDivider} />

            <MenuItem
              icon="◐"
              title="Language"
              subtitle="Choose your preferred language"
              rightText="English"
              onPress={() =>
                router.push("/notifications")
              }
            />
          </View>

          {/* =================================================
              SUPPORT
          ================================================= */}

          <Text style={styles.sectionTitle}>
            SUPPORT
          </Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="?"
              title="Help & Support"
              subtitle="Need help? We're here for you"
              onPress={() =>
                router.push("/help-support")
              }
            />

            <View style={styles.menuDivider} />

            <MenuItem
              icon="i"
              title="About Glow Salon"
              subtitle="Learn more about us"
              onPress={() => {}}
            />

            <View style={styles.menuDivider} />

            <MenuItem
              icon="⌕"
              title="Privacy Policy"
              subtitle="Your privacy matters to us"
              onPress={() => {}}
            />
          </View>

          {/* =================================================
              LOGIN
          ================================================= */}

          <Pressable
            style={styles.loginButton}
            onPress={() =>
              Alert.alert(
                "Account",
                "Login and account management will be connected here."
              )
            }
          >
            <Text style={styles.loginText}>
              Login / Create Account
            </Text>

            <Text style={styles.loginArrow}>
              →
            </Text>
          </Pressable>

          <Text style={styles.version}>
            GLOW SALON • CLIENT APP
          </Text>

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* =================================================
            BOTTOM NAV
        ================================================= */}

        <View style={styles.bottomNav}>
          <NavItem
            icon="⌂"
            label="Home"
            onPress={() => router.push("/")}
          />

          <NavItem
            icon="✦"
            label="Services"
            onPress={() =>
              router.push("/services")
            }
          />

          <NavItem
            icon="▣"
            label="Bookings"
            onPress={() =>
              router.push("/bookings")
            }
          />

          <NavItem
            icon="◯"
            label="Profile"
            active
            onPress={() =>
              router.push("/profile")
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

/* =========================================================
   MENU ITEM
========================================================= */

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  rightText,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  rightText?: string;
}) {
  return (
    <Pressable
      style={styles.menuItem}
      onPress={onPress}
      android_ripple={{
        color: "#F1E5E2",
      }}
    >
      <View style={styles.menuIcon}>
        <Text style={styles.menuIconText}>
          {icon}
        </Text>
      </View>

      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      {rightText ? (
        <Text style={styles.rightText}>
          {rightText}
        </Text>
      ) : (
        <Text style={styles.menuArrow}>
          ›
        </Text>
      )}
    </Pressable>
  );
}

/* =========================================================
   NAV ITEM
========================================================= */

function NavItem({
  icon,
  label,
  active = false,
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
          styles.navIcon,
          active && styles.navIconActive,
        ]}
      >
        <Text
          style={[
            styles.navIconText,
            active && styles.navIconTextActive,
          ]}
        >
          {icon}
        </Text>
      </View>

      <Text
        style={[
          styles.navText,
          active && styles.navTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   STYLES
========================================================= */

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

  header: {
    height: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
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
    marginTop: -5,
  },

  settings: {
    color: "#70253B",
    fontSize: 18,
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

  title: {
    color: "#30272A",
    fontSize: 20,
    fontFamily: "serif",
    fontWeight: "600",
    marginTop: 2,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 18,
    marginTop: 5,
    elevation: 3,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: "#70253B",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "serif",
    fontWeight: "700",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },

  welcome: {
    color: "#A18E94",
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  name: {
    color: "#352B2F",
    fontSize: 19,
    fontFamily: "serif",
    fontWeight: "600",
    marginTop: 3,
  },

  email: {
    color: "#9A8D91",
    fontSize: 8,
    marginTop: 3,
  },

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#F8EFEC",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    elevation: 5,
  },

  editIcon: {
    color: "#70253B",
    fontSize: 18,
  },

  divider: {
    height: 1,
    backgroundColor: "#F0E8E5",
    marginVertical: 17,
  },

  stats: {
    flexDirection: "row",
    alignItems: "center",
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    color: "#70253B",
    fontSize: 18,
    fontWeight: "800",
  },

  statLabel: {
    color: "#A09398",
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 3,
  },

  statDivider: {
    width: 1,
    height: 27,
    backgroundColor: "#EEE5E2",
  },

  bookCard: {
    marginTop: 15,
    backgroundColor: "#70253B",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  bookLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  bookIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  bookIconText: {
    color: "#FFFFFF",
    fontSize: 17,
  },

  bookSmall: {
    color: "#E9D9DD",
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  bookTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "serif",
    fontWeight: "600",
    marginTop: 2,
  },

  bookSubtitle: {
    color: "#E3D1D6",
    fontSize: 8,
    marginTop: 2,
  },

  bookArrow: {
    color: "#FFFFFF",
    fontSize: 20,
  },

  sectionTitle: {
    color: "#9B8A90",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginTop: 22,
    marginBottom: 9,
    marginLeft: 3,
  },

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 6,
    elevation: 2,
  },

  menuItem: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FAF2EF",
    alignItems: "center",
    justifyContent: "center",
  },

  menuIconText: {
    color: "#70253B",
    fontSize: 17,
  },

  menuContent: {
    flex: 1,
    marginLeft: 11,
  },

  menuTitle: {
    color: "#3C3236",
    fontSize: 10,
    fontWeight: "800",
  },

  menuSubtitle: {
    color: "#A09297",
    fontSize: 7.5,
    marginTop: 3,
  },

  menuArrow: {
    color: "#B4A5AA",
    fontSize: 23,
  },

  rightText: {
    color: "#70253B",
    fontSize: 7,
    fontWeight: "900",
    marginRight: 8,
  },

  menuDivider: {
    height: 1,
    backgroundColor: "#F1EAE7",
    marginHorizontal: 10,
  },

  loginButton: {
    height: 54,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#DCCBC8",
    marginTop: 20,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  loginText: {
    color: "#70253B",
    fontSize: 9,
    fontWeight: "900",
  },

  loginArrow: {
    color: "#70253B",
    fontSize: 18,
  },

  version: {
    color: "#B1A4A8",
    fontSize: 6,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 15,
  },

  bottomSpace: {
    height: 20,
  },

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

  navIconActive: {
    backgroundColor: "#F4E5E2",
  },

  navIconText: {
    color: "#A99A9F",
    fontSize: 17,
  },

  navIconTextActive: {
    color: "#70253B",
  },

  navText: {
    color: "#A99A9F",
    fontSize: 6.5,
    fontWeight: "800",
    marginTop: 2,
  },

  navTextActive: {
    color: "#70253B",
  },
});