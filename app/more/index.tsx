import React from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F2EF"
      />

      <View style={styles.container}>
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>
         
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* =====================================================
              PROFILE CARD
          ===================================================== */}

          <Pressable
            style={styles.profileCard}
            onPress={() => router.push("/profile")}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>S</Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                Salon Admin
              </Text>

              <Text style={styles.profileRole}>
                Owner • Glow Salon
              </Text>
            </View>

            <View style={styles.profileArrow}>
              <Text style={styles.profileArrowText}>›</Text>
            </View>
          </Pressable>

          {/* =====================================================
              QUICK ACCESS
          ===================================================== */}

          <Text style={styles.sectionTitle}>
            QUICK ACCESS
          </Text>

          <View style={styles.quickGrid}>
            <QuickCard
              icon="▣"
              title="Bookings"
              subtitle="Manage"
              onPress={() => router.push("/bookings")}
            />

            <QuickCard
              icon="₹"
              title="Billing"
              subtitle="Invoices"
              onPress={() => router.push("/billing")}
            />

            <QuickCard
              icon="♙"
              title="Clients"
              subtitle="Customers"
              onPress={() => router.push("/clients")}
            />

            <QuickCard
              icon="✦"
              title="Services"
              subtitle="Manage"
              onPress={() => router.push("/services")}
            />
          </View>

          {/* =====================================================
              MANAGEMENT
          ===================================================== */}

          <Text style={styles.sectionTitle}>
            MANAGEMENT
          </Text>

          <View style={styles.menuCard}>
  <MenuItem
    icon="♙"
    title="Staff & Stylists"
    subtitle="Manage your salon team"
    onPress={() => router.push("/staff")}
  />

  <Divider />

  <MenuItem
    icon="✦"
    title="Services"
    subtitle="Add, edit and manage services"
    onPress={() => router.push("/services")}
  />

  <Divider />

  <MenuItem
    icon="♙"
    title="Clients"
    subtitle="Manage customer profiles"
    onPress={() => router.push("/clients")}
  />

  <Divider />

  <MenuItem
    icon="▣"
    title="Bookings"
    subtitle="Appointments and booking status"
    onPress={() => router.push("/bookings")}
  />
</View>

          {/* =====================================================
              BUSINESS
          ===================================================== */}

          <Text style={styles.sectionTitle}>
            BUSINESS
          </Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="₹"
              title="Billing & Invoices"
              subtitle="View bills and invoices"
              onPress={() => router.push("/billing")}
            />

            <Divider />

            <MenuItem
              icon="▤"
              title="Reports"
              subtitle="Sales and salon performance"
              onPress={() =>
                Alert.alert(
                  "Reports",
                  "Reports dashboard will be added here."
                )
              }
            />

            <Divider />

            <MenuItem
              icon="⌁"
              title="Salon Information"
              subtitle="Business details and contact"
              onPress={() =>
                Alert.alert(
                  "Salon Information",
                  "Salon information settings will be added here."
                )
              }
            />
          </View>

          {/* =====================================================
              SETTINGS
          ===================================================== */}

          <Text style={styles.sectionTitle}>
            SETTINGS
          </Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="⚙"
              title="Salon Settings"
              subtitle="Working hours and preferences"
              onPress={() =>
                Alert.alert(
                  "Salon Settings",
                  "Salon settings will be connected here."
                )
              }
            />

            <Divider />

            <MenuItem
              icon="⌕"
              title="Notifications"
              subtitle="Manage app notifications"
              onPress={() =>
                Alert.alert(
                  "Notifications",
                  "Notification settings will be added here."
                )
              }
            />

            <Divider />

            <MenuItem
              icon="🔐"
              title="Security"
              subtitle="Password and account security"
              onPress={() =>
                Alert.alert(
                  "Security",
                  "Security settings will be connected here."
                )
              }
            />
          </View>

          {/* =====================================================
              SUPPORT
          ===================================================== */}

          <Text style={styles.sectionTitle}>
            SUPPORT
          </Text>

          <View style={styles.supportCard}>
            <View style={styles.supportIcon}>
              <Text style={styles.supportIconText}>?</Text>
            </View>

            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>
                Need help?
              </Text>

              <Text style={styles.supportText}>
                Get help with your salon app
              </Text>
            </View>

            <Pressable
              style={styles.helpButton}
              onPress={() =>
                Alert.alert(
                  "Help & Support",
                  "Support section will be connected here."
                )
              }
            >
              <Text style={styles.helpButtonText}>
                Help
              </Text>
            </Pressable>
          </View>

          {/* =====================================================
              APP VERSION
          ===================================================== */}

          <View style={styles.versionBox}>
            <Text style={styles.versionText}>
              Glow Salon
            </Text>

            <Text style={styles.versionNumber}>
              Admin App • v1.0.0
            </Text>
          </View>

          {/* =====================================================
              LOGOUT
          ===================================================== */}

          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                "Logout",
                "Are you sure you want to logout?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Logout",
                    style: "destructive",
                    onPress: () => {
                      router.replace("/login");
                    },
                  },
                ]
              );
            }}
          >
            <View style={styles.logoutIconBox}>
              <Text style={styles.logoutIcon}>↪</Text>
            </View>

            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>

          <View style={{ height: 105 }} />
        </ScrollView>

        {/* =====================================================
            BOTTOM NAVIGATION
        ===================================================== */}

        <View style={styles.bottomNav}>
          <NavItem
            icon="⌂"
            label="Home"
            onPress={() => router.push("/")}
          />

          <NavItem
            icon="♙"
            label="Clients"
            onPress={() => router.push("/clients")}
          />

          <NavItem
            icon="▣"
            label="Billing"
            onPress={() => router.push("/billing")}
          />

          <NavItem
            icon="✦"
            label="Services"
            onPress={() => router.push("/services")}
          />

          <NavItem
            icon="•••"
            label="More"
            active
            onPress={() => {}}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   QUICK CARD
========================================================= */

function QuickCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickCard,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.quickIcon}>
        <Text style={styles.quickIconText}>
          {icon}
        </Text>
      </View>

      <Text style={styles.quickTitle}>
        {title}
      </Text>

      <Text style={styles.quickSubtitle}>
        {subtitle}
      </Text>
    </Pressable>
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
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
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

      <View style={styles.arrowCircle}>
        <Text style={styles.arrow}>
          ›
        </Text>
      </View>
    </Pressable>
  );
}

/* =========================================================
   DIVIDER
========================================================= */

function Divider() {
  return <View style={styles.divider} />;
}

/* =========================================================
   NAV ITEM
========================================================= */

function NavItem({
  icon,
  label,
  active,
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
          styles.navIconBox,
          active && styles.navIconBoxActive,
        ]}
      >
        <Text
          style={[
            styles.navIcon,
            active && styles.navIconActive,
          ]}
        >
          {icon}
        </Text>
      </View>

      <Text
        style={[
          styles.navLabel,
          active && styles.navLabelActive,
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
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F2EF",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8F2EF",
  },

  /* HEADER */

  header: {
    height: 72,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  eyebrow: {
    color: "#A39599",
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  title: {
    color: "#33282C",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 3,
  },

  headerProfile: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#7E243A",
    alignItems: "center",
    justifyContent: "center",
  },

  headerProfileText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  /* CONTENT */

  content: {
    paddingHorizontal: 15,
    paddingBottom: 25,
  },

  /* PROFILE */

  profileCard: {
    minHeight: 78,
    borderRadius: 16,
    backgroundColor: "#7E243A",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#7E243A",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  profileAvatar: {
    width: 51,
    height: 51,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  profileAvatarText: {
    color: "#7E243A",
    fontSize: 20,
    fontWeight: "900",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 11,
  },

  profileName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  profileRole: {
    color: "#F3DDE1",
    fontSize: 7,
    marginTop: 4,
  },

  profileArrow: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  profileArrowText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "300",
    marginTop: -2,
  },

  /* SECTION */

  sectionTitle: {
    color: "#9B8A90",
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginTop: 18,
    marginBottom: 8,
  },

  /* QUICK GRID */

  quickGrid: {
    flexDirection: "row",
    gap: 7,
  },

  quickCard: {
    flex: 1,
    minHeight: 91,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8DCD8",
    padding: 9,
    justifyContent: "center",
  },

  quickIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  quickIconText: {
    color: "#7E243A",
    fontSize: 11,
    fontWeight: "900",
  },

  quickTitle: {
    color: "#403337",
    fontSize: 8,
    fontWeight: "900",
  },

  quickSubtitle: {
    color: "#A4979B",
    fontSize: 5.5,
    marginTop: 3,
  },

  /* MENU CARD */

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E8DCD8",
    overflow: "hidden",
  },

  menuItem: {
    minHeight: 68,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
  },

  menuIconText: {
    color: "#7E243A",
    fontSize: 13,
    fontWeight: "900",
  },

  menuContent: {
    flex: 1,
    marginLeft: 11,
  },

  menuTitle: {
    color: "#403337",
    fontSize: 8.5,
    fontWeight: "900",
  },

  menuSubtitle: {
    color: "#A4979B",
    fontSize: 6,
    marginTop: 3,
  },

  arrowCircle: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: "#F9F3F1",
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    color: "#8A243B",
    fontSize: 18,
    fontWeight: "400",
    marginTop: -2,
  },

  divider: {
    height: 1,
    backgroundColor: "#F0E8E5",
    marginLeft: 58,
  },

  /* SUPPORT */

  supportCard: {
    minHeight: 70,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8DCD8",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  supportIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
  },

  supportIconText: {
    color: "#7E243A",
    fontSize: 15,
    fontWeight: "900",
  },

  supportContent: {
    flex: 1,
    marginLeft: 10,
  },

  supportTitle: {
    color: "#403337",
    fontSize: 8,
    fontWeight: "900",
  },

  supportText: {
    color: "#A4979B",
    fontSize: 6,
    marginTop: 3,
  },

  helpButton: {
    height: 29,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: "#7E243A",
    alignItems: "center",
    justifyContent: "center",
  },

  helpButtonText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "900",
  },

  /* VERSION */

  versionBox: {
    alignItems: "center",
    marginTop: 18,
  },

  versionText: {
    color: "#9B8A90",
    fontSize: 7,
    fontWeight: "800",
  },

  versionNumber: {
    color: "#B4A6AA",
    fontSize: 5.5,
    marginTop: 3,
  },

  /* LOGOUT */

  logoutButton: {
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E8D8D5",
    backgroundColor: "#FFFFFF",
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutIconBox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  logoutIcon: {
    color: "#8A243B",
    fontSize: 13,
    fontWeight: "900",
  },

  logoutText: {
    color: "#8A243B",
    fontSize: 8,
    fontWeight: "900",
  },

  /* PRESS */

  pressed: {
    opacity: 0.72,
  },

  /* BOTTOM NAV */

  bottomNav: {
    position: "absolute",
    left: 9,
    right: 9,
    bottom: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8DEDB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 8,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconBoxActive: {
    backgroundColor: "#8A243B",
  },

  navIcon: {
    color: "#9C8D92",
    fontSize: 10,
    fontWeight: "800",
  },

  navIconActive: {
    color: "#FFFFFF",
  },

  navLabel: {
    color: "#9C8D92",
    fontSize: 5,
    marginTop: 2,
  },

  navLabelActive: {
    color: "#8A243B",
    fontWeight: "800",
  },
});