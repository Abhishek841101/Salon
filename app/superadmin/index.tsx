
// import React, { useCallback, useState } from "react";

// import {
//   ActivityIndicator,
//   Alert,
//   Pressable,
//   RefreshControl,
//   ScrollView,Image,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";

// import { router, useFocusEffect } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useDispatch, useSelector } from "react-redux";

// import { logoutUser } from "../../src/features/auth/authSlice";
// import Logo from "../../assets/images/logo.png";
// const API_URL =
//   process.env.EXPO_PUBLIC_API_URL ||
//   "https://salon-backend-49vk.onrender.com/api";

// export default function SuperAdminDashboard() {
//   const dispatch = useDispatch<any>();

//   const { token, admin } = useSelector(
//     (state: any) => state.auth
//   );

//   const [dashboard, setDashboard] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchDashboard = async (showLoader = true) => {
//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     try {
//       if (showLoader) {
//         setLoading(true);
//       }

//       const response = await fetch(
//         `${API_URL}/superadmin/dashboard`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.status === 401) {
//         router.replace("/auth/login");
//         return;
//       }

//       if (!response.ok) {
//         throw new Error(
//           data?.message || "Failed to load dashboard"
//         );
//       }

//       setDashboard(data);
//     } catch (error: any) {
//       console.error("DASHBOARD ERROR:", error);

//       Alert.alert(
//         "Error",
//         error?.message || "Unable to load dashboard."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       if (token) {
//         fetchDashboard();
//       }
//     }, [token])
//   );

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchDashboard(false);
//   };

//   const logout = () => {
//     Alert.alert(
//       "Logout",
//       "Are you sure you want to logout?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Logout",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await dispatch(logoutUser()).unwrap();
//             } finally {
//               router.replace("/auth/login");
//             }
//           },
//         },
//       ]
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <StatusBar style="dark" />

//         <View style={styles.loadingLogo}>
//           <Text style={styles.loadingLogoText}>S</Text>
//         </View>

//         <Text style={styles.loadingTitle}>
//           Salon Admin
//         </Text>

//         <Text style={styles.loadingText}>
//           Loading your dashboard...
//         </Text>

//         <ActivityIndicator
//           size="small"
//           style={{ marginTop: 20 }}
//         />
//       </View>
//     );
//   }

//   if (admin?.role !== "superadmin") {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.accessDenied}>
//           Access Denied
//         </Text>

//         <Pressable
//           style={styles.loginButton}
//           onPress={() =>
//             router.replace("/auth/login")
//           }
//         >
//           <Text style={styles.loginButtonText}>
//             Go to Login
//           </Text>
//         </Pressable>
//       </View>
//     );
//   }

//   const stats =
//     dashboard?.dashboard ||
//     dashboard?.stats ||
//     dashboard ||
//     {};

//   const totalSalons = Number(
//     stats.totalSalons ?? 0
//   );

//   const activeSalons = Number(
//     stats.activeSalons ?? 0
//   );

//   const trialSalons = Number(
//     stats.trialSalons ?? 0
//   );

//   const expiredSalons = Number(
//     stats.expiredSalons ?? 0
//   );

//   const totalRevenue = Number(
//     stats.totalRevenue ?? 0
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar style="dark" />

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//           />
//         }
//         contentContainerStyle={
//           styles.scrollContent
//         }
//       >
//         {/* HEADER */}

//        <View style={styles.header}>
//   <View>
//     <Text style={styles.eyebrow}>
//       GLOW SALON
//     </Text>

//     <Text style={styles.title}>
//       Super Admin
//     </Text>

//     <Text style={styles.subtitle}>
//       Manage your salon network
//     </Text>
//   </View>

//   <Pressable
//     style={styles.profileButton}
//     onPress={logout}
//   >
//     <Image
//       source={Logo}
//       style={styles.profileLogo}
//       resizeMode="contain"
//     />
//   </Pressable>
// </View>

//         {/* REVENUE */}

//         <View style={styles.revenueCard}>
//           <View style={styles.revenueTop}>
//             <View>
//               <Text style={styles.revenueLabel}>
//                 TOTAL REVENUE
//               </Text>

//               <Text style={styles.revenueValue}>
//                 ₹
//                 {totalRevenue.toLocaleString(
//                   "en-IN"
//                 )}
//               </Text>
//             </View>

//             <View style={styles.revenueIcon}>
//               <Text style={styles.revenueIconText}>
//                 ₹
//               </Text>
//             </View>
//           </View>

//           <Text style={styles.revenueBottom}>
//             Subscription revenue across all salons
//           </Text>
//         </View>

//         {/* STATS */}

//         <Text style={styles.sectionTitle}>
//           Overview
//         </Text>

//         <View style={styles.statsGrid}>
//           <DashboardCard
//             icon="🏢"
//             title="Total Salons"
//             value={totalSalons}
//             subtitle="View all salons"
//             onPress={() =>
//               router.push("/superadmin/salons")
//             }
//           />

//           <DashboardCard
//             icon="✓"
//             title="Active"
//             value={activeSalons}
//             subtitle="Currently subscribed"
//             onPress={() =>
//               router.push({
//                 pathname: "/superadmin/salons",
//                 params: { filter: "active" },
//               })
//             }
//           />

//           <DashboardCard
//             icon="◷"
//             title="Trial"
//             value={trialSalons}
//             subtitle="Free trial salons"
//             onPress={() =>
//               router.push({
//                 pathname: "/superadmin/salons",
//                 params: { filter: "trial" },
//               })
//             }
//           />

//           <DashboardCard
//             icon="!"
//             title="Expired"
//             value={expiredSalons}
//             subtitle="Needs attention"
//             onPress={() =>
//               router.push({
//                 pathname: "/superadmin/salons",
//                 params: { filter: "expired" },
//               })
//             }
//           />
//         </View>

//         {/* QUICK ACTION */}

//         <Text style={styles.sectionTitle}>
//           Management
//         </Text>

//         <Pressable
//           style={({ pressed }) => [
//             styles.managementCard,
//             pressed && styles.pressed,
//           ]}
//           onPress={() =>
//             router.push("/superadmin/salons")
//           }
//         >
//           <View style={styles.managementIcon}>
//             <Text style={styles.managementIconText}>
//               🏢
//             </Text>
//           </View>

//           <View style={styles.managementContent}>
//             <Text style={styles.managementTitle}>
//               All Salons
//             </Text>

//             <Text style={styles.managementSubtitle}>
//               Search salons, check subscriptions
//               and manage plans
//             </Text>
//           </View>

//           <Text style={styles.arrow}>
//             →
//           </Text>
//         </Pressable>

//         <Pressable
//           style={({ pressed }) => [
//             styles.managementCard,
//             pressed && styles.pressed,
//           ]}
//           onPress={() =>
//             router.push({
//               pathname: "/superadmin/salons",
//               params: { filter: "expired" },
//             })
//           }
//         >
//           <View
//             style={[
//               styles.managementIcon,
//               styles.warningIcon,
//             ]}
//           >
//             <Text style={styles.managementIconText}>
//               !
//             </Text>
//           </View>

//           <View style={styles.managementContent}>
//             <Text style={styles.managementTitle}>
//               Expired Subscriptions
//             </Text>

//             <Text style={styles.managementSubtitle}>
//               Review salons that need a new plan
//             </Text>
//           </View>

//           <Text style={styles.arrow}>
//             →
//           </Text>
//         </Pressable>

//         {/* FOOTER */}

//         <Text style={styles.footer}>
//           Salon Management Platform
//         </Text>

//         <View style={styles.bottomSpace} />
//       </ScrollView>
//     </View>
//   );
// }

// function DashboardCard({
//   icon,
//   title,
//   value,
//   subtitle,
//   onPress,
// }: {
//   icon: string;
//   title: string;
//   value: number;
//   subtitle: string;
//   onPress: () => void;
// }) {
//   return (
//     <Pressable
//       style={({ pressed }) => [
//         styles.statCard,
//         pressed && styles.pressed,
//       ]}
//       onPress={onPress}
//     >
//       <View style={styles.statTop}>
//         <View style={styles.statIcon}>
//           <Text style={styles.statIconText}>
//             {icon}
//           </Text>
//         </View>

//         <Text style={styles.cardArrow}>
//           →
//         </Text>
//       </View>

//       <Text style={styles.statValue}>
//         {value}
//       </Text>

//       <Text style={styles.statTitle}>
//         {title}
//       </Text>

//       <Text style={styles.statSubtitle}>
//         {subtitle}
//       </Text>
//     </Pressable>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8F5F2",
//   },

//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingTop: 28,
//   },

//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "#F8F5F2",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   loadingLogo: {
//     width: 62,
//     height: 62,
//     borderRadius: 21,
//     backgroundColor: "#70243A",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   loadingLogoText: {
//     color: "#FFF",
//     fontSize: 28,
//     fontWeight: "700",
//     fontFamily: "serif",
//   },

//   loadingTitle: {
//     marginTop: 15,
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#292326",
//   },

//   loadingText: {
//     marginTop: 6,
//     fontSize: 12,
//     color: "#918589",
//   },

//   accessDenied: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#222",
//     marginBottom: 20,
//   },

//   loginButton: {
//     backgroundColor: "#70243A",
//     paddingHorizontal: 25,
//     paddingVertical: 14,
//     borderRadius: 12,
//   },

//   loginButtonText: {
//     color: "#FFF",
//     fontWeight: "700",
//   },

//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 22,
//   },

//   eyebrow: {
//     fontSize: 9,
//     fontWeight: "800",
//     letterSpacing: 2.4,
//     color: "#A17B61",
//     marginBottom: 5,
//   },

//   title: {
//     fontSize: 29,
//     fontWeight: "800",
//     color: "#292326",
//   },

//   subtitle: {
//     marginTop: 5,
//     fontSize: 12,
//     color: "#918589",
//   },

//   profileButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 15,
//     backgroundColor: "#70243A",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   profileLetter: {
//     color: "#FFF",
//     fontSize: 16,
//     fontWeight: "800",
//   },

//   revenueCard: {
//     backgroundColor: "#70243A",
//     borderRadius: 23,
//     padding: 21,
//     marginBottom: 27,
//   },

//   revenueTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   revenueLabel: {
//     color: "#EBCFD7",
//     fontSize: 9,
//     fontWeight: "800",
//     letterSpacing: 1.3,
//   },

//   revenueValue: {
//     color: "#FFF",
//     fontSize: 31,
//     fontWeight: "800",
//     marginTop: 5,
//   },

//   revenueIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 17,
//     backgroundColor: "rgba(255,255,255,0.12)",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   revenueIconText: {
//     color: "#FFF",
//     fontSize: 21,
//     fontWeight: "800",
//   },

//   revenueBottom: {
//     color: "#E7C8D1",
//     fontSize: 10,
//     marginTop: 15,
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#30282B",
//     marginBottom: 12,
//   },

//   statsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginBottom: 27,
//   },

//   statCard: {
//     width: "48.2%",
//     backgroundColor: "#FFF",
//     borderRadius: 19,
//     padding: 16,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ECE3DE",
//   },

//   statTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   statIcon: {
//     width: 37,
//     height: 37,
//     borderRadius: 12,
//     backgroundColor: "#F5E7E3",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   statIconText: {
//     fontSize: 16,
//   },

//   cardArrow: {
//     color: "#A18E94",
//     fontSize: 17,
//   },

//   statValue: {
//     marginTop: 18,
//     fontSize: 27,
//     fontWeight: "800",
//     color: "#30282B",
//   },

//   statTitle: {
//     marginTop: 2,
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#504448",
//   },

//   statSubtitle: {
//     marginTop: 4,
//     fontSize: 9,
//     color: "#9B8D91",
//   },

//   managementCard: {
//     backgroundColor: "#FFF",
//     borderRadius: 19,
//     padding: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 11,
//     borderWidth: 1,
//     borderColor: "#ECE3DE",
//   },

//   managementIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 14,
//     backgroundColor: "#F5E7E3",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   warningIcon: {
//     backgroundColor: "#FFF1D8",
//   },

//   managementIconText: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#70243A",
//   },

//   managementContent: {
//     flex: 1,
//     marginLeft: 13,
//   },

//   managementTitle: {
//     fontSize: 14,
//     fontWeight: "800",
//     color: "#30282B",
//   },

//   managementSubtitle: {
//     marginTop: 4,
//     fontSize: 10,
//     color: "#94878B",
//     lineHeight: 15,
//   },
// profileLogo: {
//   width: 42,
//   height: 42,
//   borderRadius: 21,
// },
//   arrow: {
//     fontSize: 20,
//     color: "#70243A",
//     marginLeft: 8,
//   },

//   pressed: {
//     opacity: 0.72,
//   },

//   footer: {
//     textAlign: "center",
//     marginTop: 20,
//     fontSize: 9,
//     color: "#B0A3A7",
//   },

//   bottomSpace: {
//     height: 35,
//   },
// });






import React, { useCallback, useState } from "react";

import {

  ActivityIndicator,

  Alert,

  Pressable,

  RefreshControl,

  ScrollView,Image,

  StyleSheet,

  Text,

  View,

} from "react-native";

import { router, useFocusEffect } from "expo-router";

import { StatusBar } from "expo-status-bar";

import { useDispatch, useSelector } from "react-redux";

import { logoutUser } from "../../src/features/auth/authSlice";

import Logo from "../../assets/images/logo.png";

const API_URL =

  process.env.EXPO_PUBLIC_API_URL ||

  "https://salon-backend-49vk.onrender.com/api";

export default function SuperAdminDashboard() {

  const dispatch = useDispatch<any>();

  const { token, admin } = useSelector(

    (state: any) => state.auth

  );

  const [dashboard, setDashboard] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (showLoader = true) => {

    if (!token) {

      setLoading(false);

      return;

    }

    try {

      if (showLoader) {

        setLoading(true);

      }

      const response = await fetch(

        `${API_URL}/superadmin/dashboard`,

        {

          headers: {

            Authorization: `Bearer ${token}`,

            "Content-Type": "application/json",

          },

        }

      );

      const data = await response.json();

      if (response.status === 401) {

        router.replace("/auth/login");

        return;

      }

      if (!response.ok) {

        throw new Error(

          data?.message || "Failed to load dashboard"

        );

      }

      setDashboard(data);

    } catch (error: any) {

      console.error("DASHBOARD ERROR:", error);

      Alert.alert(

        "Error",

        error?.message || "Unable to load dashboard."

      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };

  useFocusEffect(

    useCallback(() => {

      if (token) {

        fetchDashboard();

      }

    }, [token])

  );

  const onRefresh = async () => {

    setRefreshing(true);

    await fetchDashboard(false);

  };

  const logout = () => {

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

          onPress: async () => {

            try {

              await dispatch(logoutUser()).unwrap();

            } finally {

              router.replace("/auth/login");

            }

          },

        },

      ]

    );

  };

  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <StatusBar style="dark" />

        <View style={styles.loadingLogo}>

          <Text style={styles.loadingLogoText}>S</Text>

        </View>

        <Text style={styles.loadingTitle}>

          Salon Admin

        </Text>

        <Text style={styles.loadingText}>

          Loading your dashboard...

        </Text>

        <ActivityIndicator

          size="small"

          style={{ marginTop: 20 }}

        />

      </View>

    );

  }

  if (admin?.role !== "superadmin") {

    return (

      <View style={styles.loadingContainer}>

        <Text style={styles.accessDenied}>

          Access Denied

        </Text>

        <Pressable

          style={styles.loginButton}

          onPress={() =>

            router.replace("/auth/login")

          }

        >

          <Text style={styles.loginButtonText}>

            Go to Login

          </Text>

        </Pressable>

      </View>

    );

  }

  const stats =

    dashboard?.dashboard ||

    dashboard?.stats ||

    dashboard ||

    {};

  const totalSalons = Number(

    stats.totalSalons ?? 0

  );

  const activeSalons = Number(

    stats.activeSalons ?? 0

  );

  const trialSalons = Number(

    stats.trialSalons ?? 0

  );

  const expiredSalons = Number(

    stats.expiredSalons ?? 0

  );

  const totalRevenue = Number(

    stats.totalRevenue ?? 0

  );

  return (

    <View style={styles.container}>

      <StatusBar style="dark" />

      <ScrollView

        showsVerticalScrollIndicator={false}

        refreshControl={

          <RefreshControl

            refreshing={refreshing}

            onRefresh={onRefresh}

          />

        }

        contentContainerStyle={

          styles.scrollContent

        }

      >

        {/* HEADER */}

       <View style={styles.header}>

  <View>

    <Text style={styles.eyebrow}>

      GLOW SALON

    </Text>

    <Text style={styles.title}>

      Super Admin

    </Text>

    <Text style={styles.subtitle}>

      Manage your salon network

    </Text>

  </View>

  <Pressable

    style={styles.profileButton}

    onPress={logout}

  >

    <Image

      source={Logo}

      style={styles.profileLogo}

      resizeMode="contain"

    />

  </Pressable>

</View>

        {/* REVENUE */}

        <View style={styles.revenueCard}>

          <View style={styles.revenueTop}>

            <View>

              <Text style={styles.revenueLabel}>

                TOTAL REVENUE

              </Text>

              <Text style={styles.revenueValue}>

                ₹

                {totalRevenue.toLocaleString(

                  "en-IN"

                )}

              </Text>

            </View>

            <View style={styles.revenueIcon}>

              <Text style={styles.revenueIconText}>

                ₹

              </Text>

            </View>

          </View>

          <Text style={styles.revenueBottom}>

            Subscription revenue across all salons

          </Text>

        </View>

        {/* STATS */}

        <Text style={styles.sectionTitle}>

          Overview

        </Text>

        <View style={styles.statsGrid}>

          <DashboardCard

            icon="🏢"

            title="Total Salons"

            value={totalSalons}

            subtitle="View all salons"

            onPress={() =>

              router.push("/superadmin/salons")

            }

          />

          <DashboardCard

            icon="✓"

            title="Active"

            value={activeSalons}

            subtitle="Currently subscribed"

            onPress={() =>

              router.push({

                pathname: "/superadmin/salons",

                params: { filter: "active" },

              })

            }

          />

          <DashboardCard

            icon="◷"

            title="Trial"

            value={trialSalons}

            subtitle="Free trial salons"

            onPress={() =>

              router.push({

                pathname: "/superadmin/salons",

                params: { filter: "trial" },

              })

            }

          />

          <DashboardCard

            icon="!"

            title="Expired"

            value={expiredSalons}

            subtitle="Needs attention"

            onPress={() =>

              router.push({

                pathname: "/superadmin/salons",

                params: { filter: "expired" },

              })

            }

          />

        </View>

        {/* QUICK ACTION */}

        <Text style={styles.sectionTitle}>

          Management

        </Text>

        <Pressable

          style={({ pressed }) => [

            styles.managementCard,

            pressed && styles.pressed,

          ]}

          onPress={() =>

            router.push("/superadmin/salons")

          }

        >

          <View style={styles.managementIcon}>

            <Text style={styles.managementIconText}>

              🏢

            </Text>

          </View>

          <View style={styles.managementContent}>

            <Text style={styles.managementTitle}>

              All Salons

            </Text>

            <Text style={styles.managementSubtitle}>

              Search salons, check subscriptions

              and manage plans

            </Text>

          </View>

          <Text style={styles.arrow}>

            →

          </Text>

        </Pressable>

        <Pressable

          style={({ pressed }) => [

            styles.managementCard,

            pressed && styles.pressed,

          ]}

          onPress={() =>

            router.push({

              pathname: "/superadmin/salons",

              params: { filter: "expired" },

            })

          }

        >

          <View

            style={[

              styles.managementIcon,

              styles.warningIcon,

            ]}

          >

            <Text style={styles.managementIconText}>

              !

            </Text>

          </View>

          <View style={styles.managementContent}>

            <Text style={styles.managementTitle}>

              Expired Subscriptions

            </Text>

            <Text style={styles.managementSubtitle}>

              Review salons that need a new plan

            </Text>

          </View>

          <Text style={styles.arrow}>

            →

          </Text>

        </Pressable>

        {/* PAYMENT APPROVALS */}
        <Pressable
          style={({ pressed }) => [
            styles.managementCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/superadmin-payments")}
        >
          <View style={[styles.managementIcon, styles.paymentIcon]}>
            <Text style={styles.managementIconText}>₹</Text>
          </View>

          <View style={styles.managementContent}>
            <Text style={styles.managementTitle}>Payment Approvals</Text>
            <Text style={styles.managementSubtitle}>
              Review UPI payment proofs and approve or reject subscription payments
            </Text>
          </View>

          <Text style={styles.arrow}>→</Text>
        </Pressable>

        {/* FOOTER */}

        <Text style={styles.footer}>

          Salon Management Platform

        </Text>

        <View style={styles.bottomSpace} />

      </ScrollView>

    </View>

  );

}

function DashboardCard({

  icon,

  title,

  value,

  subtitle,

  onPress,

}: {

  icon: string;

  title: string;

  value: number;

  subtitle: string;

  onPress: () => void;

}) {

  return (

    <Pressable

      style={({ pressed }) => [

        styles.statCard,

        pressed && styles.pressed,

      ]}

      onPress={onPress}

    >

      <View style={styles.statTop}>

        <View style={styles.statIcon}>

          <Text style={styles.statIconText}>

            {icon}

          </Text>

        </View>

        <Text style={styles.cardArrow}>

          →

        </Text>

      </View>

      <Text style={styles.statValue}>

        {value}

      </Text>

      <Text style={styles.statTitle}>

        {title}

      </Text>

      <Text style={styles.statSubtitle}>

        {subtitle}

      </Text>

    </Pressable>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: "#F8F5F2",

  },

  scrollContent: {

    paddingHorizontal: 20,

    paddingTop: 28,

  },

  loadingContainer: {

    flex: 1,

    backgroundColor: "#F8F5F2",

    alignItems: "center",

    justifyContent: "center",

  },

  loadingLogo: {

    width: 62,

    height: 62,

    borderRadius: 21,

    backgroundColor: "#70243A",

    alignItems: "center",

    justifyContent: "center",

  },

  loadingLogoText: {

    color: "#FFF",

    fontSize: 28,

    fontWeight: "700",

    fontFamily: "serif",

  },

  loadingTitle: {

    marginTop: 15,

    fontSize: 20,

    fontWeight: "700",

    color: "#292326",

  },

  loadingText: {

    marginTop: 6,

    fontSize: 12,

    color: "#918589",

  },

  accessDenied: {

    fontSize: 24,

    fontWeight: "700",

    color: "#222",

    marginBottom: 20,

  },

  loginButton: {

    backgroundColor: "#70243A",

    paddingHorizontal: 25,

    paddingVertical: 14,

    borderRadius: 12,

  },

  loginButtonText: {

    color: "#FFF",

    fontWeight: "700",

  },

  header: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 22,

  },

  eyebrow: {

    fontSize: 9,

    fontWeight: "800",

    letterSpacing: 2.4,

    color: "#A17B61",

    marginBottom: 5,

  },

  title: {

    fontSize: 29,

    fontWeight: "800",

    color: "#292326",

  },

  subtitle: {

    marginTop: 5,

    fontSize: 12,

    color: "#918589",

  },

  profileButton: {

    width: 44,

    height: 44,

    borderRadius: 15,

    backgroundColor: "#70243A",

    alignItems: "center",

    justifyContent: "center",

  },

  profileLetter: {

    color: "#FFF",

    fontSize: 16,

    fontWeight: "800",

  },

  revenueCard: {

    backgroundColor: "#70243A",

    borderRadius: 23,

    padding: 21,

    marginBottom: 27,

  },

  revenueTop: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  revenueLabel: {

    color: "#EBCFD7",

    fontSize: 9,

    fontWeight: "800",

    letterSpacing: 1.3,

  },

  revenueValue: {

    color: "#FFF",

    fontSize: 31,

    fontWeight: "800",

    marginTop: 5,

  },

  revenueIcon: {

    width: 48,

    height: 48,

    borderRadius: 17,

    backgroundColor: "rgba(255,255,255,0.12)",

    alignItems: "center",

    justifyContent: "center",

  },

  revenueIconText: {

    color: "#FFF",

    fontSize: 21,

    fontWeight: "800",

  },

  revenueBottom: {

    color: "#E7C8D1",

    fontSize: 10,

    marginTop: 15,

  },

  sectionTitle: {

    fontSize: 18,

    fontWeight: "800",

    color: "#30282B",

    marginBottom: 12,

  },

  statsGrid: {

    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

    marginBottom: 27,

  },

  statCard: {

    width: "48.2%",

    backgroundColor: "#FFF",

    borderRadius: 19,

    padding: 16,

    marginBottom: 10,

    borderWidth: 1,

    borderColor: "#ECE3DE",

  },

  statTop: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  statIcon: {

    width: 37,

    height: 37,

    borderRadius: 12,

    backgroundColor: "#F5E7E3",

    alignItems: "center",

    justifyContent: "center",

  },

  statIconText: {

    fontSize: 16,

  },

  cardArrow: {

    color: "#A18E94",

    fontSize: 17,

  },

  statValue: {

    marginTop: 18,

    fontSize: 27,

    fontWeight: "800",

    color: "#30282B",

  },

  statTitle: {

    marginTop: 2,

    fontSize: 13,

    fontWeight: "700",

    color: "#504448",

  },

  statSubtitle: {

    marginTop: 4,

    fontSize: 9,

    color: "#9B8D91",

  },

  managementCard: {

    backgroundColor: "#FFF",

    borderRadius: 19,

    padding: 16,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 11,

    borderWidth: 1,

    borderColor: "#ECE3DE",

  },

  managementIcon: {

    width: 44,

    height: 44,

    borderRadius: 14,

    backgroundColor: "#F5E7E3",

    alignItems: "center",

    justifyContent: "center",

  },

  paymentIcon: {
    backgroundColor: "#E5F5E9",
  },

  warningIcon: {

    backgroundColor: "#FFF1D8",

  },

  managementIconText: {

    fontSize: 18,

    fontWeight: "800",

    color: "#70243A",

  },

  managementContent: {

    flex: 1,

    marginLeft: 13,

  },

  managementTitle: {

    fontSize: 14,

    fontWeight: "800",

    color: "#30282B",

  },

  managementSubtitle: {

    marginTop: 4,

    fontSize: 10,

    color: "#94878B",

    lineHeight: 15,

  },

profileLogo: {

  width: 42,

  height: 42,

  borderRadius: 21,

},

  arrow: {

    fontSize: 20,

    color: "#70243A",

    marginLeft: 8,

  },

  pressed: {

    opacity: 0.72,

  },

  footer: {

    textAlign: "center",

    marginTop: 20,

    fontSize: 9,

    color: "#B0A3A7",

  },

  bottomSpace: {

    height: 35,

  },

});