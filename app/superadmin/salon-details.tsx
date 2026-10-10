
// import React, {
//   useCallback,
//   useState,
// } from "react";

// import {
//   ActivityIndicator,
//   Alert,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from "react-native";

// import {
//   router,
//   useFocusEffect,
//   useLocalSearchParams,
// } from "expo-router";

// import { StatusBar } from "expo-status-bar";
// import { useSelector } from "react-redux";

// const API_URL =
//   process.env.EXPO_PUBLIC_API_URL ||
//   "https://salon-backend-49vk.onrender.com/api";

// type Plan =
//   | "basic"
//   | "professional"
//   | "premium";

// const PLAN_OPTIONS = [
//   {
//     label: "Basic",
//     value: "basic" as Plan,
//     amount: "499",
//     description: "Essential salon tools",
//   },
//   {
//     label: "Professional",
//     value: "professional" as Plan,
//     amount: "999",
//     description: "For growing salons",
//   },
//   {
//     label: "Premium",
//     value: "premium" as Plan,
//     amount: "1999",
//     description: "Complete salon management",
//   },
// ];

// export default function SalonDetailsScreen() {
//   const { id } =
//     useLocalSearchParams<{
//       id: string;
//     }>();

//   const { token } = useSelector(
//     (state: any) => state.auth
//   );

//   const [salon, setSalon] =
//     useState<any>(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [selectedPlan, setSelectedPlan] =
//     useState<Plan>("basic");

//   const [amount, setAmount] =
//     useState("499");

//   const [duration, setDuration] =
//     useState("30");

//   const [activating, setActivating] =
//     useState(false);

//   const fetchSalon = async () => {
//     if (!token || !id) {
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await fetch(
//         `${API_URL}/superadmin/salons`,
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
//           data?.message ||
//             "Failed to load salon"
//         );
//       }

//       const rawList =
//         data?.data ||
//         data?.salons ||
//         [];

//       const found = rawList.find(
//         (item: any) =>
//           String(
//             item.id || item._id
//           ) === String(id)
//       );

//       if (!found) {
//         throw new Error(
//           "Salon not found"
//         );
//       }

//       const mapped = {
//         salonId:
//           found.id ||
//           found._id,

//         salonName:
//           found.name ||
//           found.salonName ||
//           "Salon",

//         ownerName:
//           found.ownerName || "",

//         email:
//           found.email || "",

//         phone:
//           found.phone || "",

//         salonActive:
//           found.isActive !== false,

//         subscription: {
//           status:
//             found.subscription?.status ||
//             "expired",

//           plan:
//             found.subscription?.plan ||
//             null,

//           trialStartDate:
//             found.subscription
//               ?.trialStartDate ||
//             null,

//           trialEndDate:
//             found.subscription
//               ?.trialEndDate ||
//             null,

//           startDate:
//             found.subscription
//               ?.startDate ||
//             null,

//           endDate:
//             found.subscription
//               ?.endDate ||
//             null,

//           amount: Number(
//             found.subscription?.amount ||
//               0
//           ),
//         },
//       };

//       setSalon(mapped);

//       if (
//         mapped.subscription.plan ===
//           "basic" ||
//         mapped.subscription.plan ===
//           "professional" ||
//         mapped.subscription.plan ===
//           "premium"
//       ) {
//         setSelectedPlan(
//           mapped.subscription.plan
//         );
//       }

//       if (
//         mapped.subscription.amount > 0
//       ) {
//         setAmount(
//           String(
//             mapped.subscription.amount
//           )
//         );
//       }
//     } catch (error: any) {
//       console.error(
//         "SALON DETAILS ERROR:",
//         error
//       );

//       Alert.alert(
//         "Error",
//         error?.message ||
//           "Unable to load salon."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchSalon();
//     }, [token, id])
//   );

//   const changePlan = (plan: Plan) => {
//     setSelectedPlan(plan);

//     const selected =
//       PLAN_OPTIONS.find(
//         (item) =>
//           item.value === plan
//       );

//     if (selected) {
//       setAmount(selected.amount);
//     }
//   };

//   const activatePlan = async () => {
//     if (!salon || !token) return;

//     const finalAmount =
//       Number(amount);

//     const finalDuration =
//       Number(duration);

//     if (
//       !finalAmount ||
//       finalAmount <= 0
//     ) {
//       Alert.alert(
//         "Invalid Amount",
//         "Please enter a valid amount."
//       );
//       return;
//     }

//     if (
//       !finalDuration ||
//       finalDuration <= 0
//     ) {
//       Alert.alert(
//         "Invalid Duration",
//         "Please enter valid duration days."
//       );
//       return;
//     }

//     Alert.alert(
//       "Confirm Plan",
//       `Activate ${capitalize(
//         selectedPlan
//       )} for ${salon.salonName}?\n\nAmount: ₹${finalAmount}\nDuration: ${finalDuration} days`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Activate",
//           onPress: async () => {
//             try {
//               setActivating(true);

//               const response =
//                 await fetch(
//                   `${API_URL}/superadmin/salons/${salon.salonId}/activate-plan`,
//                   {
//                     method: "PATCH",
//                     headers: {
//                       Authorization: `Bearer ${token}`,
//                       "Content-Type":
//                         "application/json",
//                     },
//                     body: JSON.stringify({
//                       plan: selectedPlan,
//                       amount:
//                         finalAmount,
//                       durationDays:
//                         finalDuration,
//                     }),
//                   }
//                 );

//               const data =
//                 await response.json();

//               if (!response.ok) {
//                 throw new Error(
//                   data?.message ||
//                     "Failed to activate plan"
//                 );
//               }

//               Alert.alert(
//                 "Plan Activated",
//                 `${salon.salonName} is now on the ${capitalize(
//                   selectedPlan
//                 )} plan.`,
//                 [
//                   {
//                     text: "Done",
//                     onPress:
//                       fetchSalon,
//                   },
//                 ]
//               );
//             } catch (error: any) {
//               console.error(
//                 "ACTIVATE PLAN ERROR:",
//                 error
//               );

//               Alert.alert(
//                 "Activation Failed",
//                 error?.message ||
//                   "Unable to activate plan."
//               );
//             } finally {
//               setActivating(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loading}>
//         <ActivityIndicator size="large" />

//         <Text style={styles.loadingText}>
//           Loading salon...
//         </Text>
//       </View>
//     );
//   }

//   if (!salon) {
//     return (
//       <View style={styles.loading}>
//         <Text style={styles.notFound}>
//           Salon not found
//         </Text>

//         <Pressable
//           style={styles.backButtonLarge}
//           onPress={() => router.back()}
//         >
//           <Text
//             style={styles.backButtonText}
//           >
//             Go Back
//           </Text>
//         </Pressable>
//       </View>
//     );
//   }

//   const status =
//     salon.subscription.status;

//   const remaining =
//     getRemainingDays(
//       salon.subscription.endDate ||
//         salon.subscription
//           .trialEndDate
//     );

//   const progress =
//     getProgress(
//       salon.subscription.startDate,
//       salon.subscription.endDate
//     );

//   const statusInfo =
//     getStatusInfo(status);

//   return (
//     <View style={styles.container}>
//       <StatusBar style="dark" />

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={
//           styles.scrollContent
//         }
//       >
//         {/* HEADER */}

//         <View style={styles.header}>
//           <Pressable
//             style={styles.backButton}
//             onPress={() => router.back()}
//           >
//             <Text style={styles.backText}>
//               ‹
//             </Text>
//           </Pressable>

//           <View style={styles.headerText}>
//             <Text style={styles.eyebrow}>
//               SALON DETAILS
//             </Text>

//             <Text style={styles.headerTitle}>
//               {salon.salonName}
//             </Text>
//           </View>
//         </View>

//         {/* PROFILE */}

//         <View style={styles.profileCard}>
//           <View style={styles.profileTop}>
//             <View style={styles.avatar}>
//               <Text style={styles.avatarText}>
//                 {salon.salonName
//                   ?.charAt(0)
//                   ?.toUpperCase() || "S"}
//               </Text>
//             </View>

//             <View style={styles.profileInfo}>
//               <Text style={styles.salonName}>
//                 {salon.salonName}
//               </Text>

//               <Text style={styles.owner}>
//                 {salon.ownerName}
//               </Text>
//             </View>

//             <View
//               style={[
//                 styles.statusBadge,
//                 {
//                   backgroundColor:
//                     statusInfo.background,
//                 },
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.statusText,
//                   {
//                     color:
//                       statusInfo.color,
//                   },
//                 ]}
//               >
//                 {statusInfo.label}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.contactArea}>
//             <View style={styles.contactItem}>
//               <Text style={styles.contactLabel}>
//                 EMAIL
//               </Text>

//               <Text style={styles.contactValue}>
//                 {salon.email || "--"}
//               </Text>
//             </View>

//             <View style={styles.contactItem}>
//               <Text style={styles.contactLabel}>
//                 PHONE
//               </Text>

//               <Text style={styles.contactValue}>
//                 {salon.phone || "--"}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* SUBSCRIPTION */}

//         <Text style={styles.sectionTitle}>
//           Current Subscription
//         </Text>

//         <View style={styles.subscriptionCard}>
//           <View style={styles.subscriptionTop}>
//             <View>
//               <Text style={styles.planLabel}>
//                 CURRENT PLAN
//               </Text>

//               <Text style={styles.planTitle}>
//                 {salon.subscription.plan
//                   ? capitalize(
//                       salon.subscription
//                         .plan
//                     )
//                   : status === "trial"
//                   ? "Free Trial"
//                   : "No Active Plan"}
//               </Text>
//             </View>

//             <View style={styles.priceBox}>
//               <Text style={styles.price}>
//                 ₹
//                 {Number(
//                   salon.subscription
//                     .amount || 0
//                 ).toLocaleString("en-IN")}
//               </Text>

//               <Text style={styles.priceUnit}>
//                 {status === "trial"
//                   ? "FREE"
//                   : "PLAN"}
//               </Text>
//             </View>
//           </View>

//           {/* ACTIVE */}

//           {status === "active" ? (
//             <>
//               <View style={styles.dateGrid}>
//                 <InfoBox
//                   label="START DATE"
//                   value={formatDate(
//                     salon.subscription
//                       .startDate
//                   )}
//                 />

//                 <InfoBox
//                   label="EXPIRY DATE"
//                   value={formatDate(
//                     salon.subscription
//                       .endDate
//                   )}
//                 />

//                 <InfoBox
//                   label="DAYS LEFT"
//                   value={`${remaining}`}
//                   highlight
//                 />
//               </View>

//               <View style={styles.progressHeader}>
//                 <Text
//                   style={styles.progressLabel}
//                 >
//                   Subscription progress
//                 </Text>

//                 <Text
//                   style={styles.progressPercent}
//                 >
//                   {Math.round(progress)}%
//                 </Text>
//               </View>

//               <View
//                 style={styles.progressTrack}
//               >
//                 <View
//                   style={[
//                     styles.progress,
//                     {
//                       width: `${progress}%`,
//                     },
//                   ]}
//                 />
//               </View>
//             </>
//           ) : status === "trial" ? (
//             <View style={styles.trialBox}>
//               <View>
//                 <Text style={styles.trialLabel}>
//                   TRIAL ENDS
//                 </Text>

//                 <Text
//                   style={styles.trialDate}
//                 >
//                   {formatDate(
//                     salon.subscription
//                       .trialEndDate
//                   )}
//                 </Text>
//               </View>

//               <Text
//                 style={styles.trialDays}
//               >
//                 {remaining} days left
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.expiredBox}>
//               <Text style={styles.expiredTitle}>
//                 Subscription expired
//               </Text>

//               <Text style={styles.expiredText}>
//                 Assign a new plan to reactivate
//                 this salon.
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* PLAN MANAGEMENT */}

//         <Text style={styles.sectionTitle}>
//           Plan Management
//         </Text>

//         <View style={styles.managementCard}>
//           <Text style={styles.manageTitle}>
//             Select a plan
//           </Text>

//           <Text style={styles.manageSubtitle}>
//             Choose the plan and duration for
//             this salon.
//           </Text>

//           {/* PLAN OPTIONS */}

//           {PLAN_OPTIONS.map((item) => {
//             const selected =
//               selectedPlan === item.value;

//             return (
//               <Pressable
//                 key={item.value}
//                 style={[
//                   styles.planOption,
//                   selected &&
//                     styles.planOptionSelected,
//                 ]}
//                 onPress={() =>
//                   changePlan(item.value)
//                 }
//               >
//                 <View
//                   style={[
//                     styles.radio,
//                     selected &&
//                       styles.radioSelected,
//                   ]}
//                 >
//                   {selected && (
//                     <View
//                       style={
//                         styles.radioInner
//                       }
//                     />
//                   )}
//                 </View>

//                 <View
//                   style={styles.planInfo}
//                 >
//                   <Text
//                     style={[
//                       styles.optionTitle,
//                       selected &&
//                         styles.optionTitleSelected,
//                     ]}
//                   >
//                     {item.label}
//                   </Text>

//                   <Text
//                     style={[
//                       styles.optionDescription,
//                       selected &&
//                         styles.optionDescriptionSelected,
//                     ]}
//                   >
//                     {item.description}
//                   </Text>
//                 </View>

//                 <Text
//                   style={[
//                     styles.optionPrice,
//                     selected &&
//                       styles.optionPriceSelected,
//                   ]}
//                 >
//                   ₹{item.amount}
//                 </Text>
//               </Pressable>
//             );
//           })}

//           {/* AMOUNT + DAYS */}

//           <View style={styles.inputRow}>
//             <View style={styles.inputWrapper}>
//               <Text style={styles.inputLabel}>
//                 Amount
//               </Text>

//               <View
//                 style={styles.inputContainer}
//               >
//                 <Text style={styles.rupee}>
//                   ₹
//                 </Text>

//                 <TextInput
//                   value={amount}
//                   onChangeText={setAmount}
//                   keyboardType="numeric"
//                   style={styles.input}
//                   placeholder="Amount"
//                   placeholderTextColor="#A79B9F"
//                 />
//               </View>
//             </View>

//             <View style={styles.inputWrapper}>
//               <Text style={styles.inputLabel}>
//                 Duration
//               </Text>

//               <View
//                 style={styles.inputContainer}
//               >
//                 <TextInput
//                   value={duration}
//                   onChangeText={setDuration}
//                   keyboardType="numeric"
//                   style={styles.input}
//                   placeholder="Days"
//                   placeholderTextColor="#A79B9F"
//                 />

//                 <Text style={styles.days}>
//                   days
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* ACTIVATE */}

//           <Pressable
//             disabled={activating}
//             style={({ pressed }) => [
//               styles.activateButton,
//               pressed &&
//                 styles.buttonPressed,
//               activating &&
//                 styles.buttonDisabled,
//             ]}
//             onPress={activatePlan}
//           >
//             {activating ? (
//               <ActivityIndicator
//                 color="#FFF"
//               />
//             ) : (
//               <>
//                 <Text
//                   style={
//                     styles.activateText
//                   }
//                 >
//                   {status === "active"
//                     ? "Renew / Update Plan"
//                     : "Activate Plan"}
//                 </Text>

//                 <Text
//                   style={styles.activateArrow}
//                 >
//                   →
//                 </Text>
//               </>
//             )}
//           </Pressable>
//         </View>

//         <Text style={styles.footer}>
//           Salon ID: {salon.salonId}
//         </Text>

//         <View style={styles.bottomSpace} />
//       </ScrollView>
//     </View>
//   );
// }

// function InfoBox({
//   label,
//   value,
//   highlight = false,
// }: {
//   label: string;
//   value: string;
//   highlight?: boolean;
// }) {
//   return (
//     <View
//       style={[
//         styles.infoBox,
//         highlight && styles.infoBoxHighlight,
//       ]}
//     >
//       <Text style={styles.infoLabel}>
//         {label}
//       </Text>

//       <Text
//         style={[
//           styles.infoValue,
//           highlight &&
//             styles.infoValueHighlight,
//         ]}
//       >
//         {value}
//       </Text>
//     </View>
//   );
// }

// function getStatusInfo(status: string) {
//   if (status === "active") {
//     return {
//       label: "ACTIVE",
//       color: "#24884B",
//       background: "#E7F6EC",
//     };
//   }

//   if (status === "trial") {
//     return {
//       label: "TRIAL",
//       color: "#A36A00",
//       background: "#FFF3D7",
//     };
//   }

//   return {
//     label: "EXPIRED",
//     color: "#B23A3A",
//     background: "#FCEAEA",
//   };
// }

// function capitalize(value: string) {
//   return (
//     value.charAt(0).toUpperCase() +
//     value.slice(1)
//   );
// }

// function formatDate(
//   date?: string | null
// ) {
//   if (!date) return "--";

//   return new Date(date).toLocaleDateString(
//     "en-IN",
//     {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     }
//   );
// }

// function getRemainingDays(
//   endDate?: string | null
// ) {
//   if (!endDate) return 0;

//   const end =
//     new Date(endDate).getTime();

//   const now = Date.now();

//   if (end <= now) return 0;

//   return Math.ceil(
//     (end - now) /
//       (1000 * 60 * 60 * 24)
//   );
// }

// function getProgress(
//   startDate?: string | null,
//   endDate?: string | null
// ) {
//   if (!startDate || !endDate) return 0;

//   const start =
//     new Date(startDate).getTime();

//   const end =
//     new Date(endDate).getTime();

//   const now = Date.now();

//   if (now <= start) return 0;

//   if (now >= end) return 100;

//   return Math.min(
//     100,
//     Math.max(
//       0,
//       ((now - start) /
//         (end - start)) *
//         100
//     )
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8F5F2",
//   },

//   scrollContent: {
//     padding: 20,
//     paddingTop: 25,
//   },

//   loading: {
//     flex: 1,
//     backgroundColor: "#F8F5F2",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   loadingText: {
//     marginTop: 12,
//     color: "#8D8084",
//     fontSize: 12,
//   },

//   notFound: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#30282B",
//     marginBottom: 20,
//   },

//   backButtonLarge: {
//     backgroundColor: "#70243A",
//     paddingHorizontal: 22,
//     paddingVertical: 13,
//     borderRadius: 13,
//   },

//   backButtonText: {
//     color: "#FFF",
//     fontWeight: "700",
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//   },

//   backButton: {
//     width: 43,
//     height: 43,
//     borderRadius: 14,
//     backgroundColor: "#FFF",
//     borderWidth: 1,
//     borderColor: "#ECE2DE",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   backText: {
//     color: "#70243A",
//     fontSize: 30,
//     marginTop: -3,
//   },

//   headerText: {
//     flex: 1,
//     marginLeft: 13,
//   },

//   eyebrow: {
//     fontSize: 8,
//     fontWeight: "800",
//     letterSpacing: 1.8,
//     color: "#A17B61",
//   },

//   headerTitle: {
//     marginTop: 3,
//     fontSize: 24,
//     fontWeight: "800",
//     color: "#30282B",
//   },

//   profileCard: {
//     backgroundColor: "#FFF",
//     borderRadius: 22,
//     padding: 17,
//     borderWidth: 1,
//     borderColor: "#ECE2DD",
//   },

//   profileTop: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   avatar: {
//     width: 56,
//     height: 56,
//     borderRadius: 18,
//     backgroundColor: "#F2DFE2",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   avatarText: {
//     color: "#70243A",
//     fontSize: 22,
//     fontWeight: "900",
//   },

//   profileInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   salonName: {
//     fontSize: 17,
//     fontWeight: "800",
//     color: "#30282B",
//   },

//   owner: {
//     fontSize: 10,
//     color: "#93868A",
//     marginTop: 4,
//   },

//   statusBadge: {
//     paddingHorizontal: 9,
//     paddingVertical: 7,
//     borderRadius: 9,
//   },

//   statusText: {
//     fontSize: 8,
//     fontWeight: "900",
//   },

//   contactArea: {
//     flexDirection: "row",
//     borderTopWidth: 1,
//     borderTopColor: "#F0E8E4",
//     marginTop: 15,
//     paddingTop: 14,
//   },

//   contactItem: {
//     flex: 1,
//   },

//   contactLabel: {
//     fontSize: 7,
//     fontWeight: "800",
//     letterSpacing: 1,
//     color: "#A2989B",
//   },

//   contactValue: {
//     fontSize: 10,
//     color: "#51464A",
//     marginTop: 4,
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#30282B",
//     marginTop: 25,
//     marginBottom: 11,
//   },

//   subscriptionCard: {
//     backgroundColor: "#70243A",
//     borderRadius: 22,
//     padding: 18,
//   },

//   subscriptionTop: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   planLabel: {
//     fontSize: 8,
//     fontWeight: "800",
//     letterSpacing: 1.3,
//     color: "#E8C9D2",
//   },

//   planTitle: {
//     fontSize: 23,
//     fontWeight: "900",
//     color: "#FFF",
//     marginTop: 4,
//   },

//   priceBox: {
//     alignItems: "flex-end",
//   },

//   price: {
//     fontSize: 20,
//     fontWeight: "900",
//     color: "#FFF",
//   },

//   priceUnit: {
//     color: "#E8C9D2",
//     fontSize: 7,
//     fontWeight: "800",
//     marginTop: 2,
//   },

//   dateGrid: {
//     flexDirection: "row",
//     marginTop: 22,
//     gap: 8,
//   },

//   infoBox: {
//     flex: 1,
//     backgroundColor:
//       "rgba(255,255,255,0.10)",
//     borderRadius: 12,
//     padding: 11,
//   },

//   infoBoxHighlight: {
//     backgroundColor:
//       "rgba(255,255,255,0.17)",
//   },

//   infoLabel: {
//     fontSize: 7,
//     color: "#DDBFC8",
//     fontWeight: "800",
//   },

//   infoValue: {
//     fontSize: 10,
//     color: "#FFF",
//     fontWeight: "700",
//     marginTop: 5,
//   },

//   infoValueHighlight: {
//     color: "#FFF",
//     fontSize: 15,
//     fontWeight: "900",
//   },

//   progressHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 17,
//   },

//   progressLabel: {
//     fontSize: 8,
//     color: "#E4C7CF",
//   },

//   progressPercent: {
//     fontSize: 8,
//     fontWeight: "800",
//     color: "#FFF",
//   },

//   progressTrack: {
//     height: 6,
//     borderRadius: 3,
//     backgroundColor:
//       "rgba(255,255,255,0.16)",
//     overflow: "hidden",
//     marginTop: 7,
//   },

//   progress: {
//     height: "100%",
//     backgroundColor: "#FFF",
//     borderRadius: 3,
//   },

//   trialBox: {
//     marginTop: 18,
//     padding: 13,
//     borderRadius: 13,
//     backgroundColor:
//       "rgba(255,255,255,0.10)",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   trialLabel: {
//     fontSize: 7,
//     color: "#E3C4CD",
//     fontWeight: "800",
//   },

//   trialDate: {
//     color: "#FFF",
//     fontSize: 11,
//     fontWeight: "700",
//     marginTop: 3,
//   },

//   trialDays: {
//     color: "#FFF",
//     fontSize: 12,
//     fontWeight: "900",
//   },

//   expiredBox: {
//     marginTop: 18,
//     padding: 13,
//     borderRadius: 13,
//     backgroundColor:
//       "rgba(255,255,255,0.10)",
//   },

//   expiredTitle: {
//     color: "#FFF",
//     fontSize: 12,
//     fontWeight: "800",
//   },

//   expiredText: {
//     color: "#E3C4CD",
//     fontSize: 9,
//     marginTop: 4,
//   },

//   managementCard: {
//     backgroundColor: "#FFF",
//     borderRadius: 22,
//     padding: 17,
//     borderWidth: 1,
//     borderColor: "#ECE2DD",
//   },

//   manageTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#30282B",
//   },

//   manageSubtitle: {
//     fontSize: 10,
//     color: "#978A8E",
//     marginTop: 4,
//     marginBottom: 15,
//   },

//   planOption: {
//     minHeight: 68,
//     borderWidth: 1,
//     borderColor: "#E5DCD7",
//     borderRadius: 15,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     marginBottom: 9,
//   },

//   planOptionSelected: {
//     borderColor: "#70243A",
//     backgroundColor: "#FBF1F3",
//   },

//   radio: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 1.5,
//     borderColor: "#CFC3C7",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   radioSelected: {
//     borderColor: "#70243A",
//   },

//   radioInner: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#70243A",
//   },

//   planInfo: {
//     flex: 1,
//     marginLeft: 11,
//   },

//   optionTitle: {
//     fontSize: 12,
//     fontWeight: "800",
//     color: "#504448",
//   },

//   optionTitleSelected: {
//     color: "#70243A",
//   },

//   optionDescription: {
//     fontSize: 8,
//     color: "#A09699",
//     marginTop: 3,
//   },

//   optionDescriptionSelected: {
//     color: "#99727D",
//   },

//   optionPrice: {
//     fontSize: 14,
//     fontWeight: "900",
//     color: "#51464A",
//   },

//   optionPriceSelected: {
//     color: "#70243A",
//   },

//   inputRow: {
//     flexDirection: "row",
//     gap: 10,
//     marginTop: 6,
//   },

//   inputWrapper: {
//     flex: 1,
//   },

//   inputLabel: {
//     fontSize: 9,
//     fontWeight: "800",
//     color: "#65595D",
//     marginBottom: 7,
//   },

//   inputContainer: {
//     height: 47,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E3D9D4",
//     backgroundColor: "#FBF9F8",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 11,
//   },

//   rupee: {
//     fontSize: 14,
//     color: "#817478",
//     marginRight: 4,
//   },

//   input: {
//     flex: 1,
//     height: "100%",
//     fontSize: 12,
//     color: "#30282B",
//   },

//   days: {
//     color: "#8D8185",
//     fontSize: 9,
//   },

//   activateButton: {
//     height: 53,
//     borderRadius: 15,
//     backgroundColor: "#70243A",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 17,
//   },

//   activateText: {
//     color: "#FFF",
//     fontSize: 12,
//     fontWeight: "800",
//   },

//   activateArrow: {
//     color: "#FFF",
//     fontSize: 19,
//     marginLeft: 9,
//   },

//   buttonPressed: {
//     opacity: 0.75,
//   },

//   buttonDisabled: {
//     opacity: 0.6,
//   },

//   footer: {
//     textAlign: "center",
//     color: "#B0A3A7",
//     fontSize: 8,
//     marginTop: 18,
//   },

//   bottomSpace: {
//     height: 30,
//   },
// });




import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSelector } from "react-redux";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://salon-backend-49vk.onrender.com/api";

type Plan = "basic" | "professional" | "premium";

const PLAN_OPTIONS: { label: string; value: Plan; description: string }[] = [
  { label: "Basic", value: "basic", description: "Essential salon tools" },
  { label: "Professional", value: "professional", description: "For growing salons" },
  { label: "Premium", value: "premium", description: "Complete salon management" },
];

type Salon = {
  salonId: string;
  salonName: string;
  ownerName: string;
  email: string;
  phone: string;
  subscription: {
    status: string;
    plan: Plan | null;
    trialStartDate: string | null;
    trialEndDate: string | null;
    startDate: string | null;
    endDate: string | null;
    amount: number;
  };
};

export default function SalonDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useSelector((state: any) => state.auth);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("basic");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("30");
  const [creatingOffer, setCreatingOffer] = useState(false);

  const fetchSalon = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/superadmin/salons`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }
      if (!response.ok) throw new Error(data?.message || "Failed to load salon");
      const list = data?.data || data?.salons || [];
      const found = list.find((item: any) => String(item.id || item._id) === String(id));
      if (!found) throw new Error("Salon not found");
      const mapped: Salon = {
        salonId: String(found.id || found._id),
        salonName: found.name || found.salonName || "Salon",
        ownerName: found.ownerName || "",
        email: found.email || "",
        phone: found.phone || "",
        subscription: {
          status: found.subscription?.status || "expired",
          plan: found.subscription?.plan || null,
          trialStartDate: found.subscription?.trialStartDate || null,
          trialEndDate: found.subscription?.trialEndDate || null,
          startDate: found.subscription?.startDate || null,
          endDate: found.subscription?.endDate || null,
          amount: Number(found.subscription?.amount || 0),
        },
      };
      setSalon(mapped);
      if (mapped.subscription.plan) setSelectedPlan(mapped.subscription.plan);
      setAmount(mapped.subscription.amount > 0 ? String(mapped.subscription.amount) : "");
    } catch (error: any) {
      console.error("SALON DETAILS ERROR:", error);
      Alert.alert("Error", error?.message || "Unable to load salon.");
      setSalon(null);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useFocusEffect(useCallback(() => { fetchSalon(); }, [fetchSalon]));

  const createPaymentOffer = () => {
    if (!salon || !token) return;
    const finalAmount = Number(amount);
    const finalDuration = Number(duration);
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      Alert.alert("Invalid amount", "Enter an amount greater than ₹0.");
      return;
    }
    if (!Number.isInteger(finalDuration) || finalDuration <= 0 || finalDuration > 3650) {
      Alert.alert("Invalid duration", "Enter a valid duration in days (1–3650).");
      return;
    }
    Alert.alert(
      "Create payment offer?",
      `Salon: ${salon.salonName}\nPlan: ${capitalize(selectedPlan)}\nAmount: ₹${finalAmount.toLocaleString("en-IN")}\nDuration: ${finalDuration} days\n\nThis will NOT activate the subscription. The salon must pay and Super Admin must approve the payment.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create Offer",
          onPress: async () => {
            try {
              setCreatingOffer(true);
              const response = await fetch(
                `${API_URL}/payments/superadmin/salons/${encodeURIComponent(salon.salonId)}/offer`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ plan: selectedPlan, amount: finalAmount, durationDays: finalDuration }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (response.status === 401) {
                router.replace("/auth/login");
                return;
              }
              if (!response.ok) throw new Error(data?.message || "Could not create payment offer");
              Alert.alert(
                "Offer created",
                `Payment offer created for ${salon.salonName}. The subscription remains unchanged until payment is verified and approved.`,
                [{ text: "OK", onPress: fetchSalon }]
              );
            } catch (error: any) {
              console.error("CREATE PAYMENT OFFER ERROR:", error);
              Alert.alert("Offer failed", error?.message || "Unable to create payment offer.");
            } finally {
              setCreatingOffer(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#70243A" /><Text style={styles.muted}>Loading salon...</Text></View>;
  }
  if (!salon) {
    return <View style={styles.loading}><Text style={styles.notFound}>Salon not found</Text><Pressable style={styles.primaryButton} onPress={() => router.back()}><Text style={styles.primaryButtonText}>Go Back</Text></Pressable></View>;
  }

  const status = salon.subscription.status;
  const statusInfo = getStatusInfo(status);
  const remaining = getRemainingDays(salon.subscription.endDate || salon.subscription.trialEndDate);
  const progress = getProgress(salon.subscription.startDate, salon.subscription.endDate);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}><Text style={styles.backText}>‹</Text></Pressable>
          <View style={styles.headerText}><Text style={styles.eyebrow}>SALON DETAILS</Text><Text style={styles.headerTitle}>{salon.salonName}</Text></View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{salon.salonName.charAt(0).toUpperCase() || "S"}</Text></View>
            <View style={styles.profileInfo}><Text style={styles.salonName}>{salon.salonName}</Text><Text style={styles.owner}>{salon.ownerName || "Salon owner"}</Text></View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.background }]}><Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text></View>
          </View>
          <View style={styles.contactArea}>
            <View style={styles.contactItem}><Text style={styles.contactLabel}>EMAIL</Text><Text style={styles.contactValue}>{salon.email || "--"}</Text></View>
            <View style={styles.contactItem}><Text style={styles.contactLabel}>PHONE</Text><Text style={styles.contactValue}>{salon.phone || "--"}</Text></View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Current Subscription</Text>
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionTop}>
            <View><Text style={styles.planLabel}>CURRENT PLAN</Text><Text style={styles.planTitle}>{salon.subscription.plan ? capitalize(salon.subscription.plan) : status === "trial" ? "Free Trial" : "No Active Plan"}</Text></View>
            <View style={styles.priceBox}><Text style={styles.price}>₹{Number(salon.subscription.amount || 0).toLocaleString("en-IN")}</Text><Text style={styles.priceUnit}>{status === "trial" ? "FREE" : "PLAN"}</Text></View>
          </View>
          {status === "active" ? <>
            <View style={styles.dateGrid}><InfoBox label="START DATE" value={formatDate(salon.subscription.startDate)} /><InfoBox label="EXPIRY DATE" value={formatDate(salon.subscription.endDate)} /><InfoBox label="DAYS LEFT" value={String(remaining)} highlight /></View>
            <View style={styles.progressHeader}><Text style={styles.progressLabel}>Subscription progress</Text><Text style={styles.progressPercent}>{Math.round(progress)}%</Text></View>
            <View style={styles.progressTrack}><View style={[styles.progress, { width: `${progress}%` }]} /></View>
          </> : status === "trial" ? <View style={styles.trialBox}><View><Text style={styles.trialLabel}>TRIAL ENDS</Text><Text style={styles.trialDate}>{formatDate(salon.subscription.trialEndDate)}</Text></View><Text style={styles.trialDays}>{remaining} days left</Text></View> : <View style={styles.expiredBox}><Text style={styles.expiredTitle}>Subscription expired</Text><Text style={styles.expiredText}>Create a payment offer. The subscription will activate only after the payment is verified and approved.</Text></View>}
        </View>

        <Text style={styles.sectionTitle}>Create Payment Offer</Text>
        <View style={styles.managementCard}>
          <Text style={styles.manageTitle}>Set negotiated plan</Text>
          <Text style={styles.manageSubtitle}>Choose a plan and enter the agreed amount and duration. Creating an offer does not activate the subscription.</Text>
          {PLAN_OPTIONS.map((item) => {
            const selected = selectedPlan === item.value;
            return <Pressable key={item.value} style={[styles.planOption, selected && styles.planOptionSelected]} onPress={() => setSelectedPlan(item.value)}>
              <View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioInner} />}</View>
              <View style={styles.planInfo}><Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{item.label}</Text><Text style={[styles.optionDescription, selected && styles.optionDescriptionSelected]}>{item.description}</Text></View>
              <Text style={[styles.optionPrice, selected && styles.optionPriceSelected]}>Custom pricing</Text>
            </Pressable>;
          })}
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}><Text style={styles.inputLabel}>AGREED AMOUNT</Text><View style={styles.inputContainer}><Text style={styles.rupee}>₹</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} placeholder="Enter amount" placeholderTextColor="#A79B9F" /></View></View>
            <View style={styles.inputWrapper}><Text style={styles.inputLabel}>DURATION</Text><View style={styles.inputContainer}><TextInput value={duration} onChangeText={setDuration} keyboardType="numeric" style={styles.input} placeholder="Days" placeholderTextColor="#A79B9F" /><Text style={styles.days}>days</Text></View></View>
          </View>
          <Pressable disabled={creatingOffer} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, creatingOffer && styles.buttonDisabled]} onPress={createPaymentOffer}>
            {creatingOffer ? <ActivityIndicator color="#FFF" /> : <><Text style={styles.primaryButtonText}>Create Payment Offer</Text><Text style={styles.activateArrow}>→</Text></>}
          </Pressable>
          <Text style={styles.warningText}>Important: Never approve a payment based only on a screenshot. Verify the credit in the bank/UPI account first.</Text>
        </View>
        <Text style={styles.footer}>Salon ID: {salon.salonId}</Text>
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

function InfoBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <View style={[styles.infoBox, highlight && styles.infoBoxHighlight]}><Text style={styles.infoLabel}>{label}</Text><Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text></View>;
}
function getStatusInfo(status: string) {
  if (status === "active") return { label: "ACTIVE", color: "#24884B", background: "#E7F6EC" };
  if (status === "trial") return { label: "TRIAL", color: "#A36A00", background: "#FFF3D7" };
  return { label: "EXPIRED", color: "#B23A3A", background: "#FCEAEA" };
}
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
function formatDate(date?: string | null) {
  if (!date) return "--";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "--";
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function getRemainingDays(endDate?: string | null) {
  if (!endDate) return 0;
  const end = new Date(endDate).getTime();
  if (!Number.isFinite(end) || end <= Date.now()) return 0;
  return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
}
function getProgress(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F5F2" },
  scrollContent: { padding: 20, paddingTop: 25 },
  loading: { flex: 1, backgroundColor: "#F8F5F2", alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { marginTop: 12, color: "#8D8084", fontSize: 12 },
  notFound: { fontSize: 20, fontWeight: "800", color: "#30282B", marginBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backButton: { width: 43, height: 43, borderRadius: 14, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#ECE2DE", alignItems: "center", justifyContent: "center" },
  backText: { color: "#70243A", fontSize: 30, marginTop: -3 },
  headerText: { flex: 1, marginLeft: 13 },
  eyebrow: { fontSize: 8, fontWeight: "800", letterSpacing: 1.8, color: "#A17B61" },
  headerTitle: { marginTop: 3, fontSize: 24, fontWeight: "800", color: "#30282B" },
  profileCard: { backgroundColor: "#FFF", borderRadius: 22, padding: 17, borderWidth: 1, borderColor: "#ECE2DD" },
  profileTop: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: "#F2DFE2", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#70243A", fontSize: 22, fontWeight: "900" },
  profileInfo: { flex: 1, marginLeft: 12 },
  salonName: { fontSize: 17, fontWeight: "800", color: "#30282B" },
  owner: { fontSize: 10, color: "#93868A", marginTop: 4 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9 },
  statusText: { fontSize: 8, fontWeight: "900" },
  contactArea: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#F0E8E4", marginTop: 15, paddingTop: 14 },
  contactItem: { flex: 1, paddingRight: 6 },
  contactLabel: { fontSize: 7, fontWeight: "800", letterSpacing: 1, color: "#A2989B" },
  contactValue: { fontSize: 10, color: "#51464A", marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#30282B", marginTop: 25, marginBottom: 11 },
  subscriptionCard: { backgroundColor: "#70243A", borderRadius: 22, padding: 18 },
  subscriptionTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planLabel: { fontSize: 8, fontWeight: "800", letterSpacing: 1.3, color: "#E8C9D2" },
  planTitle: { fontSize: 23, fontWeight: "900", color: "#FFF", marginTop: 4 },
  priceBox: { alignItems: "flex-end" },
  price: { fontSize: 20, fontWeight: "900", color: "#FFF" },
  priceUnit: { color: "#E8C9D2", fontSize: 7, fontWeight: "800", marginTop: 2 },
  dateGrid: { flexDirection: "row", marginTop: 22, gap: 8 },
  infoBox: { flex: 1, backgroundColor: "rgba(255,255,255,0.10)", borderRadius: 12, padding: 11 },
  infoBoxHighlight: { backgroundColor: "rgba(255,255,255,0.17)" },
  infoLabel: { fontSize: 7, color: "#DDBFC8", fontWeight: "800" },
  infoValue: { fontSize: 10, color: "#FFF", fontWeight: "700", marginTop: 5 },
  infoValueHighlight: { color: "#FFF", fontSize: 15, fontWeight: "900" },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: 17 },
  progressLabel: { fontSize: 8, color: "#E4C7CF" },
  progressPercent: { fontSize: 8, fontWeight: "800", color: "#FFF" },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.16)", overflow: "hidden", marginTop: 7 },
  progress: { height: "100%", backgroundColor: "#FFF", borderRadius: 3 },
  trialBox: { marginTop: 18, padding: 13, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.10)", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trialLabel: { fontSize: 7, color: "#E3C4CD", fontWeight: "800" },
  trialDate: { color: "#FFF", fontSize: 11, fontWeight: "700", marginTop: 3 },
  trialDays: { color: "#FFF", fontSize: 12, fontWeight: "900" },
  expiredBox: { marginTop: 18, padding: 13, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.10)" },
  expiredTitle: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  expiredText: { color: "#E3C4CD", fontSize: 10, marginTop: 4, lineHeight: 15 },
  managementCard: { backgroundColor: "#FFF", borderRadius: 22, padding: 17, borderWidth: 1, borderColor: "#ECE2DD" },
  manageTitle: { fontSize: 16, fontWeight: "800", color: "#30282B" },
  manageSubtitle: { fontSize: 10, color: "#978A8E", marginTop: 4, marginBottom: 15, lineHeight: 15 },
  planOption: { minHeight: 68, borderWidth: 1, borderColor: "#E5DCD7", borderRadius: 15, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 9 },
  planOptionSelected: { borderColor: "#70243A", backgroundColor: "#FBF1F3" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: "#CFC3C7", alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: "#70243A" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#70243A" },
  planInfo: { flex: 1, marginLeft: 11 },
  optionTitle: { fontSize: 12, fontWeight: "800", color: "#504448" },
  optionTitleSelected: { color: "#70243A" },
  optionDescription: { fontSize: 8, color: "#A09699", marginTop: 3 },
  optionDescriptionSelected: { color: "#99727D" },
  optionPrice: { fontSize: 10, fontWeight: "800", color: "#51464A" },
  optionPriceSelected: { color: "#70243A" },
  inputRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  inputWrapper: { flex: 1 },
  inputLabel: { fontSize: 9, fontWeight: "800", color: "#65595D", marginBottom: 7 },
  inputContainer: { height: 47, borderRadius: 12, borderWidth: 1, borderColor: "#E3D9D4", backgroundColor: "#FBF9F8", flexDirection: "row", alignItems: "center", paddingHorizontal: 11 },
  rupee: { fontSize: 14, color: "#817478", marginRight: 4 },
  input: { flex: 1, height: "100%", fontSize: 12, color: "#30282B" },
  days: { color: "#8D8185", fontSize: 9 },
  primaryButton: { minHeight: 53, borderRadius: 15, backgroundColor: "#70243A", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 17, paddingHorizontal: 16 },
  primaryButtonText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  activateArrow: { color: "#FFF", fontSize: 19, marginLeft: 9 },
  buttonPressed: { opacity: 0.75 },
  buttonDisabled: { opacity: 0.6 },
  warningText: { color: "#9A5A28", fontSize: 10, lineHeight: 15, marginTop: 13 },
  footer: { textAlign: "center", color: "#B0A3A7", fontSize: 8, marginTop: 18 },
  bottomSpace: { height: 30 },
});
