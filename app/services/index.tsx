// import React from "react";
// import {
//   Pressable,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { router } from "expo-router";
// import { StatusBar } from "expo-status-bar";

// const services = [
//   {
//     id: "1",
//     name: "Hair Cut & Style",
//     category: "Hair",
//     price: "₹300",
//     duration: "45 min",
//     icon: "✂",
//   },
//   {
//     id: "2",
//     name: "Hair Spa",
//     category: "Hair Care",
//     price: "₹800",
//     duration: "60 min",
//     icon: "✦",
//   },
//   {
//     id: "3",
//     name: "Hair Coloring",
//     category: "Hair",
//     price: "₹1,200",
//     duration: "90 min",
//     icon: "◈",
//   },
//   {
//     id: "4",
//     name: "Facial",
//     category: "Skin Care",
//     price: "₹700",
//     duration: "60 min",
//     icon: "✧",
//   },
//   {
//     id: "5",
//     name: "Manicure",
//     category: "Nails",
//     price: "₹450",
//     duration: "45 min",
//     icon: "♡",
//   },
//   {
//     id: "6",
//     name: "Pedicure",
//     category: "Nails",
//     price: "₹550",
//     duration: "50 min",
//     icon: "✦",
//   },
// ];

// export default function ServicesScreen() {
//   const openAddService = () => {
//     router.push("/services/add-service");
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar style="dark" />

//       <SafeAreaView style={styles.safeArea}>
//         {/* HEADER */}

//         <View style={styles.header}>
//           <View style={styles.headerLeft}>
//             <Text style={styles.eyebrow}>
//               SALON MANAGEMENT
//             </Text>

//             <Text style={styles.title}>
//               Services
//             </Text>

//             <Text style={styles.subtitle}>
//               Manage your salon services
//             </Text>
//           </View>

//           {/* ADD BUTTON */}

//           <Pressable
//             style={styles.addButton}
//             onPress={openAddService}
//           >
//             <Text style={styles.addIcon}>
//               +
//             </Text>

//             <Text style={styles.addText}>
//               Add
//             </Text>
//           </Pressable>
//         </View>

//         {/* PAGE CONTENT */}

//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.content}
//         >
//           {/* SUMMARY CARD */}

//           <View style={styles.summaryCard}>
//             <View style={styles.summaryIconBox}>
//               <Text style={styles.summaryIcon}>
//                 ✦
//               </Text>
//             </View>

//             <View style={styles.summaryInfo}>
//               <Text style={styles.summaryNumber}>
//                 {services.length}
//               </Text>

//               <Text style={styles.summaryLabel}>
//                 Active Services
//               </Text>
//             </View>

//             <View style={styles.summaryDivider} />

//             <View style={styles.summaryInfo}>
//               <Text style={styles.summaryNumber}>
//                 ₹300+
//               </Text>

//               <Text style={styles.summaryLabel}>
//                 Starting Price
//               </Text>
//             </View>
//           </View>

//           {/* SECTION HEADER */}

//           <View style={styles.sectionHeader}>
//             <View>
//               <Text style={styles.sectionTitle}>
//                 All Services
//               </Text>

//               <Text style={styles.sectionSubtitle}>
//                 Your salon service menu
//               </Text>
//             </View>

//             <View style={styles.countBadge}>
//               <Text style={styles.countText}>
//                 {services.length}
//               </Text>
//             </View>
//           </View>

//           {/* SERVICE LIST */}

//           {services.map((service) => (
//             <Pressable
//               key={service.id}
//               style={styles.serviceCard}
//               onPress={() => {
//                 // Service details next step
//               }}
//             >
//               <View style={styles.serviceIconBox}>
//                 <Text style={styles.serviceIcon}>
//                   {service.icon}
//                 </Text>
//               </View>

//               <View style={styles.serviceInfo}>
//                 <Text style={styles.serviceName}>
//                   {service.name}
//                 </Text>

//                 <Text style={styles.serviceCategory}>
//                   {service.category}
//                 </Text>

//                 <View style={styles.metaRow}>
//                   <Text style={styles.durationIcon}>
//                     ◷
//                   </Text>

//                   <Text style={styles.durationText}>
//                     {service.duration}
//                   </Text>

//                   <View style={styles.activeBadge}>
//                     <View style={styles.activeDot} />

//                     <Text style={styles.activeText}>
//                       Active
//                     </Text>
//                   </View>
//                 </View>
//               </View>

//               <View style={styles.priceContainer}>
//                 <Text style={styles.price}>
//                   {service.price}
//                 </Text>

//                 <Text style={styles.arrow}>
//                   ›
//                 </Text>
//               </View>
//             </Pressable>
//           ))}

//           <View style={styles.bottomSpace} />
//         </ScrollView>

//         {/* ==============================
//             BOTTOM NAVIGATION
//         ============================== */}

//         <View style={styles.bottomNav}>
//           {/* HOME */}

//           <Pressable
//             style={styles.navItem}
//             onPress={() => router.push("/")}
//           >
//             <View style={styles.navIconBox}>
//               <Text style={styles.navIcon}>
//                 ⌂
//               </Text>
//             </View>

//             <Text style={styles.navText}>
//               Home
//             </Text>
//           </Pressable>

//           {/* CLIENTS */}

//           <Pressable
//             style={styles.navItem}
//             onPress={() => router.push("/clients")}
//           >
//             <View style={styles.navIconBox}>
//               <Text style={styles.navIcon}>
//                 ♙
//               </Text>
//             </View>

//             <Text style={styles.navText}>
//               Clients
//             </Text>
//           </Pressable>

//           {/* BILLING */}

//           <Pressable
//             style={styles.navItem}
//             onPress={() => router.push("/billing")}
//           >
//             <View style={styles.navIconBox}>
//               <Text style={styles.navIcon}>
//                 ▣
//               </Text>
//             </View>

//             <Text style={styles.navText}>
//               Billing
//             </Text>
//           </Pressable>

//           {/* SERVICES ACTIVE */}

//           <Pressable
//             style={styles.navItem}
//             onPress={() => router.push("/services")}
//           >
//             <View
//               style={[
//                 styles.navIconBox,
//                 styles.navIconBoxActive,
//               ]}
//             >
//               <Text style={styles.navIconActive}>
//                 ✦
//               </Text>
//             </View>

//             <Text style={styles.navActive}>
//               Services
//             </Text>
//           </Pressable>

//           {/* PROFILE */}

//           <Pressable
//             style={styles.navItem}
//             onPress={() => router.push("/profile")}
//           >
//             <View style={styles.navIconBox}>
//               <Text style={styles.navIcon}>
//                 ♙
//               </Text>
//             </View>

//             <Text style={styles.navText}>
//               Profile
//             </Text>
//           </Pressable>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FCF7F4",
//   },

//   safeArea: {
//     flex: 1,
//   },

//   header: {
//     minHeight: 94,
//     paddingHorizontal: 18,
//     paddingTop: 13,
//     paddingBottom: 13,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0E5E2",
//   },

//   headerLeft: {
//     flex: 1,
//   },

//   eyebrow: {
//     color: "#A09195",
//     fontSize: 7,
//     fontWeight: "800",
//     letterSpacing: 1.5,
//   },

//   title: {
//     color: "#602032",
//     fontSize: 26,
//     fontWeight: "600",
//     fontFamily: "serif",
//     marginTop: 2,
//   },

//   subtitle: {
//     color: "#9B8E91",
//     fontSize: 9,
//     marginTop: 2,
//   },

//   addButton: {
//     height: 43,
//     minWidth: 75,
//     paddingHorizontal: 14,
//     borderRadius: 14,
//     backgroundColor: "#70243A",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//   },

//   addIcon: {
//     color: "#FFFFFF",
//     fontSize: 20,
//     lineHeight: 20,
//   },

//   addText: {
//     color: "#FFFFFF",
//     fontSize: 10,
//     fontWeight: "800",
//   },

//   content: {
//     paddingHorizontal: 17,
//     paddingTop: 17,
//     paddingBottom: 15,
//   },

//   summaryCard: {
//     minHeight: 94,
//     borderRadius: 22,
//     padding: 16,
//     backgroundColor: "#70243A",
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 21,
//   },

//   summaryIconBox: {
//     width: 52,
//     height: 52,
//     borderRadius: 18,
//     backgroundColor: "#F0D9D7",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   summaryIcon: {
//     color: "#76253A",
//     fontSize: 21,
//   },

//   summaryInfo: {
//     flex: 1,
//     paddingLeft: 12,
//   },

//   summaryNumber: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "800",
//   },

//   summaryLabel: {
//     color: "#EBD4D5",
//     fontSize: 8,
//     marginTop: 2,
//   },

//   summaryDivider: {
//     width: 1,
//     height: 42,
//     backgroundColor: "#A66575",
//     marginHorizontal: 12,
//   },

//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 11,
//   },

//   sectionTitle: {
//     color: "#33292C",
//     fontSize: 20,
//     fontFamily: "serif",
//     fontWeight: "600",
//   },

//   sectionSubtitle: {
//     color: "#9B8E91",
//     fontSize: 8,
//     marginTop: 3,
//   },

//   countBadge: {
//     minWidth: 29,
//     height: 25,
//     paddingHorizontal: 8,
//     borderRadius: 9,
//     backgroundColor: "#F2E3E0",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   countText: {
//     color: "#76253A",
//     fontSize: 8,
//     fontWeight: "800",
//   },

//   serviceCard: {
//     minHeight: 91,
//     borderRadius: 19,
//     padding: 12,
//     marginBottom: 10,
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#F0E5E2",
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   serviceIconBox: {
//     width: 56,
//     height: 56,
//     borderRadius: 18,
//     backgroundColor: "#F8E9E6",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   serviceIcon: {
//     color: "#76253A",
//     fontSize: 22,
//   },

//   serviceInfo: {
//     flex: 1,
//     paddingLeft: 12,
//   },

//   serviceName: {
//     color: "#342A2D",
//     fontSize: 12,
//     fontWeight: "800",
//   },

//   serviceCategory: {
//     color: "#9A8C90",
//     fontSize: 8,
//     marginTop: 3,
//   },

//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//   },

//   durationIcon: {
//     color: "#9C8E91",
//     fontSize: 10,
//   },

//   durationText: {
//     color: "#8E8084",
//     fontSize: 8,
//     marginLeft: 3,
//   },

//   activeBadge: {
//     marginLeft: 9,
//     paddingHorizontal: 6,
//     paddingVertical: 3,
//     borderRadius: 7,
//     backgroundColor: "#F2F8F2",
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   activeDot: {
//     width: 5,
//     height: 5,
//     borderRadius: 3,
//     backgroundColor: "#5B9A67",
//     marginRight: 4,
//   },

//   activeText: {
//     color: "#5C8864",
//     fontSize: 7,
//     fontWeight: "800",
//   },

//   priceContainer: {
//     alignItems: "flex-end",
//     justifyContent: "center",
//     paddingLeft: 5,
//   },

//   price: {
//     color: "#70243A",
//     fontSize: 12,
//     fontWeight: "900",
//   },

//   arrow: {
//     color: "#B4A7AA",
//     fontSize: 21,
//     marginTop: 2,
//   },

//   bottomSpace: {
//     height: 80,
//   },

//   /* ==============================
//      BOTTOM NAV
//   ============================== */

//   bottomNav: {
//     position: "absolute",
//     left: 15,
//     right: 15,
//     bottom: 10,
//     height: 68,
//     borderRadius: 25,
//     backgroundColor: "#FFFFFF",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-around",

//     shadowColor: "#32141E",
//     shadowOffset: {
//       width: 0,
//       height: 5,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 15,

//     elevation: 8,
//   },

//   navItem: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   navIconBox: {
//     width: 28,
//     height: 28,
//     borderRadius: 9,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   navIconBoxActive: {
//     backgroundColor: "#76253A",
//   },

//   navIcon: {
//     color: "#9D9193",
//     fontSize: 17,
//     fontWeight: "700",
//   },

//   navIconActive: {
//     color: "#FFFFFF",
//     fontSize: 17,
//     fontWeight: "700",
//   },

//   navText: {
//     color: "#9D9193",
//     fontSize: 8,
//     marginTop: 3,
//   },

//   navActive: {
//     color: "#76253A",
//     fontSize: 8,
//     fontWeight: "700",
//     marginTop: 3,
//   },
// });


import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import API_URL from "../../src/config/api";

type Service = {
  _id: string;
  name: string;
  category?: string;
  price: number;
  duration: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ServicesResponse = {
  success: boolean;
  services?: Service[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  message?: string;
};

type RootState = {
  auth?: {
    token?: string | null;
  };
};

const getCategoryIcon = (category?: string) => {
  const value = String(category || "").toLowerCase();

  if (
    value.includes("hair") ||
    value.includes("cut") ||
    value.includes("color")
  ) {
    return "✂";
  }

  if (
    value.includes("skin") ||
    value.includes("facial") ||
    value.includes("face")
  ) {
    return "✧";
  }

  if (
    value.includes("nail") ||
    value.includes("manicure") ||
    value.includes("pedicure")
  ) {
    return "♡";
  }

  if (
    value.includes("spa") ||
    value.includes("massage")
  ) {
    return "✦";
  }

  return "✦";
};

const formatPrice = (price: number) => {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "₹0";
  }

  return `₹${numericPrice.toLocaleString("en-IN")}`;
};

const formatDuration = (duration: number) => {
  const numericDuration = Number(duration);

  if (!Number.isFinite(numericDuration)) {
    return "30 min";
  }

  if (numericDuration >= 60) {
    const hours = Math.floor(numericDuration / 60);
    const minutes = numericDuration % 60;

    if (minutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${minutes} min`;
  }

  return `${numericDuration} min`;
};

export default function ServicesScreen() {
  const token = useSelector(
    (state: RootState) => state.auth?.token
  );

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setError("");

      if (!token) {
        console.log("FETCH SERVICES: TOKEN MISSING");

        setServices([]);
        setError("Authentication token missing");
        return;
      }

      const url =
        `${API_URL}/services` +
        "?status=active&page=1&limit=100";

      console.log("========================================");
      console.log("FETCH SERVICES");
      console.log("URL:", url);
      console.log("TOKEN:", !!token);
      console.log("========================================");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const rawText = await response.text();

      let data: ServicesResponse;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Invalid server response (${response.status})`
        );
      }

      console.log(
        "SERVICES RESPONSE:",
        response.status,
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Failed to fetch services (${response.status})`
        );
      }

      const serverServices = Array.isArray(
        data.services
      )
        ? data.services
        : [];

      setServices(serverServices);
      setError("");
    } catch (err: any) {
      console.log(
        "========================================"
      );
      console.log("FETCH SERVICES ERROR:", err);
      console.log(
        "========================================"
      );

      setServices([]);

      setError(
        err?.message ||
          "Unable to connect to server"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [fetchServices])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
  };

  const openAddService = () => {
    router.push("/services/add-service");
  };

  const handleServicePress = (service: Service) => {
    if (!service?._id) {
      Alert.alert(
        "Error",
        "Service ID is missing"
      );
      return;
    }

    router.push({
      pathname: "/services/[id]",
      params: {
        id: service._id,
      },
    });
  };
const handleEditService = (service: Service) => {
  if (!service?._id) {
    Alert.alert("Error", "Service ID is missing");
    return;
  }

  router.push({
    pathname: "/services/edit-service",
    params: {
      id: service._id,
    },
  });
};
  const renderService = ({
    item,
  }: {
    item: Service;
  }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.serviceCard,
          pressed && styles.serviceCardPressed,
        ]}
        onPress={() =>
          handleServicePress(item)
        }
      >
        <View style={styles.serviceIconBox}>
          <Text style={styles.serviceIcon}>
            {getCategoryIcon(item.category)}
          </Text>
        </View>

        <View style={styles.serviceInfo}>
          <Text
            style={styles.serviceName}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text
            style={styles.serviceCategory}
            numberOfLines={1}
          >
            {item.category || "General"}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.durationIcon}>
              ◷
            </Text>

            <Text style={styles.durationText}>
              {formatDuration(item.duration)}
            </Text>

            {item.isActive && (
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />

                <Text style={styles.activeText}>
                  Active
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.priceContainer}>
  <Text style={styles.price}>
    {formatPrice(item.price)}
  </Text>
  <Pressable
    style={styles.editButton}
    onPress={(event) => {
      event.stopPropagation();
      handleEditService(item);
    }}
  >
    <Text style={styles.editButtonText}>
      Edit
    </Text>
  </Pressable>
</View>
      </Pressable>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator
            size="large"
            color="#70243A"
          />

          <Text style={styles.loadingText}>
            Loading services...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBox}>
            <Text style={styles.emptyIcon}>
              !
            </Text>
          </View>

          <Text style={styles.emptyTitle}>
            Unable to load services
          </Text>

          <Text style={styles.emptySubtitle}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={fetchServices}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconBox}>
          <Text style={styles.emptyIcon}>
            ✦
          </Text>
        </View>

        <Text style={styles.emptyTitle}>
          No services yet
        </Text>

        <Text style={styles.emptySubtitle}>
          Add your first salon service to
          get started.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={openAddService}
        >
          <Text style={styles.retryText}>
            Add Service
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.eyebrow}>
              SALON MANAGEMENT
            </Text>

            <Text style={styles.title}>
              Services
            </Text>

            <Text style={styles.subtitle}>
              Manage your salon services
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={openAddService}
          >
            <Text style={styles.addIcon}>
              +
            </Text>

            <Text style={styles.addText}>
              Add
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={services}
          keyExtractor={(item, index) =>
            item?._id || `service-${index}`
          }
          renderItem={renderService}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#70243A"
            />
          }
          contentContainerStyle={[
            styles.content,
            services.length === 0 &&
              styles.emptyListContent,
          ]}
          ListHeaderComponent={
            services.length > 0 ? (
              <>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryIconBox}>
                    <Text style={styles.summaryIcon}>
                      ✦
                    </Text>
                  </View>

                  <View style={styles.summaryInfo}>
                    <Text style={styles.summaryNumber}>
                      {services.length}
                    </Text>

                    <Text style={styles.summaryLabel}>
                      ACTIVE SERVICES
                    </Text>
                  </View>

                  <View
                    style={styles.summaryDivider}
                  />

                  <View style={styles.summaryInfo}>
                    <Text style={styles.summaryNumber}>
                      ₹
                    </Text>

                    <Text style={styles.summaryLabel}>
                      SERVICE MENU
                    </Text>
                  </View>
                </View>

                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      Your Services
                    </Text>

                    <Text
                      style={styles.sectionSubtitle}
                    >
                      Your salon service menu
                    </Text>
                  </View>

                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {services.length}
                    </Text>
                  </View>
                </View>
              </>
            ) : null
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={
            <View style={styles.bottomSpace} />
          }
        />

        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/")}
          >
            <View style={styles.navIconBox}>
              <Text style={styles.navIcon}>
                ⌂
              </Text>
            </View>

            <Text style={styles.navText}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/clients")
            }
          >
            <View style={styles.navIconBox}>
              <Text style={styles.navIcon}>
                ♙
              </Text>
            </View>

            <Text style={styles.navText}>
              Clients
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/billing")
            }
          >
            <View style={styles.navIconBox}>
              <Text style={styles.navIcon}>
                ▣
              </Text>
            </View>

            <Text style={styles.navText}>
              Billing
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/services")
            }
          >
            <View
              style={[
                styles.navIconBox,
                styles.navIconBoxActive,
              ]}
            >
              <Text style={styles.navIconActive}>
                ✦
              </Text>
            </View>

            <Text style={styles.navActive}>
              Services
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/profile")
            }
          >
            <View style={styles.navIconBox}>
              <Text style={styles.navIcon}>
                ♙
              </Text>
            </View>

            <Text style={styles.navText}>
              Profile
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF7F4",
  },

  safeArea: {
    flex: 1,
  },

  header: {
    minHeight: 94,
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0E5E2",
  },

  headerLeft: {
    flex: 1,
  },

  eyebrow: {
    color: "#A09195",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  title: {
    color: "#602032",
    fontSize: 26,
    fontWeight: "600",
    fontFamily: "serif",
    marginTop: 2,
  },

  subtitle: {
    color: "#9B8E91",
    fontSize: 9,
    marginTop: 2,
  },

  addButton: {
    height: 43,
    minWidth: 75,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#70243A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  addIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 20,
  },

  addText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  content: {
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 15,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  summaryCard: {
    minHeight: 94,
    borderRadius: 22,
    padding: 16,
    backgroundColor: "#70243A",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 21,
  },

  summaryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F0D9D7",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryIcon: {
    color: "#76253A",
    fontSize: 21,
  },

  summaryInfo: {
    flex: 1,
    paddingLeft: 12,
  },

  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  summaryLabel: {
    color: "#EBD4D5",
    fontSize: 8,
    marginTop: 2,
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#A66575",
    marginHorizontal: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },

  sectionTitle: {
    color: "#33292C",
    fontSize: 20,
    fontFamily: "serif",
    fontWeight: "600",
  },

  sectionSubtitle: {
    color: "#9B8E91",
    fontSize: 8,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 29,
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: "#F2E3E0",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: "#76253A",
    fontSize: 8,
    fontWeight: "800",
  },

  serviceCard: {
    minHeight: 91,
    borderRadius: 19,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0E5E2",
    flexDirection: "row",
    alignItems: "center",
  },

  serviceCardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  serviceIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
  },

  serviceIcon: {
    color: "#76253A",
    fontSize: 22,
  },

  serviceInfo: {
    flex: 1,
    paddingLeft: 12,
  },

  serviceName: {
    color: "#342A2D",
    fontSize: 12,
    fontWeight: "800",
  },

  serviceCategory: {
    color: "#9A8C90",
    fontSize: 8,
    marginTop: 3,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  durationIcon: {
    color: "#9C8E91",
    fontSize: 10,
  },

  durationText: {
    color: "#8E8084",
    fontSize: 8,
    marginLeft: 3,
  },

  activeBadge: {
    marginLeft: 9,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#F2F8F2",
    flexDirection: "row",
    alignItems: "center",
  },

  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#5B9A67",
    marginRight: 4,
  },

  activeText: {
    color: "#5C8864",
    fontSize: 7,
    fontWeight: "800",
  },

  priceContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingLeft: 5,
  },

  price: {
    color: "#70243A",
    fontSize: 12,
    fontWeight: "900",
  },

  arrow: {
    color: "#B4A7AA",
    fontSize: 21,
    marginTop: 2,
  },

  centerBox: {
    flex: 1,
    minHeight: 250,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#8E8084",
    fontSize: 10,
    marginTop: 10,
  },

  emptyCard: {
    minHeight: 280,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0E5E2",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  emptyIconBox: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyIcon: {
    color: "#76253A",
    fontSize: 25,
    fontWeight: "800",
  },

  emptyTitle: {
    color: "#342A2D",
    fontSize: 16,
    fontWeight: "800",
  },

  emptySubtitle: {
    color: "#9A8C90",
    fontSize: 10,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 16,
  },

  retryButton: {
    marginTop: 17,
    minWidth: 110,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#70243A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 90,
  },

  bottomNav: {
    position: "absolute",
    left: 15,
    right: 15,
    bottom: 10,
    height: 68,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#32141E",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconBoxActive: {
    backgroundColor: "#76253A",
  },

  navIcon: {
    color: "#9D9193",
    fontSize: 17,
    fontWeight: "700",
  },

  navIconActive: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  navText: {
    color: "#9D9193",
    fontSize: 8,
    marginTop: 3,
  },

  navActive: {
    color: "#76253A",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 3,
  },
  editButton: {
  marginTop: 7,
  paddingHorizontal: 10,
  height: 27,
  borderRadius: 9,
  backgroundColor: "#F2E3E0",
  alignItems: "center",
  justifyContent: "center",
},
editButtonText: {
  color: "#76253A",
  fontSize: 8,
  fontWeight: "800",
},
});