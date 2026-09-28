// import React, {
//   useEffect,
//   useState,
// } from "react";

// import {
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from "react-native";

// import {
//   router,
//   useLocalSearchParams,
// } from "expo-router";

// import {
//   useDispatch,
//   useSelector,
// } from "react-redux";

// import {
//   createStylist,
//   fetchStylistById,
//   updateStylist,
//   type Stylist,
// } from "../../src/features/stylist/stylistSlice";

// type AppDispatch = any;
// type RootState = any;

// export default function AddStaffScreen() {
//   const dispatch = useDispatch<AppDispatch>();

//   const params =
//     useLocalSearchParams<{
//       id?: string;
//     }>();

//   const staffId = params.id;

//   const editing = Boolean(staffId);

//   const [loading, setLoading] =
//     useState(false);

//   const [name, setName] =
//     useState("");

//   const [phone, setPhone] =
//     useState("");

//   const [email, setEmail] =
//     useState("");

//   const [specialization, setSpecialization] =
//     useState("");

//   const [experience, setExperience] =
//     useState("");

//   const [status, setStatus] =
//     useState<"ACTIVE" | "INACTIVE">(
//       "ACTIVE"
//     );

//   useEffect(() => {
//     if (!staffId) return;

//     loadStaff();
//   }, [staffId]);

//   const loadStaff = async () => {
//     try {
//       setLoading(true);

//       const result = await dispatch(
//         fetchStylistById(staffId)
//       ).unwrap();

//       const staff: Stylist =
//         result?.stylist || result;

//       setName(staff.name || "");
//       setPhone(staff.phone || "");
//       setEmail(staff.email || "");
//       setSpecialization(
//         staff.specialization || ""
//       );
//       setExperience(
//         String(staff.experience ?? "")
//       );
//       setStatus(
//         staff.status || "ACTIVE"
//       );
//     } catch (err: any) {
//       Alert.alert(
//         "Error",
//         String(
//           err ||
//             "Failed to load staff"
//         )
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validate = () => {
//     if (!name.trim()) {
//       Alert.alert(
//         "Required",
//         "Please enter staff name."
//       );
//       return false;
//     }

//     if (!phone.trim()) {
//       Alert.alert(
//         "Required",
//         "Please enter phone number."
//       );
//       return false;
//     }

//     if (
//       experience.trim() &&
//       Number(experience) < 0
//     ) {
//       Alert.alert(
//         "Invalid",
//         "Experience cannot be negative."
//       );
//       return false;
//     }

//     return true;
//   };

//   const saveStaff = async () => {
//     if (!validate()) return;

//     try {
//       setLoading(true);

//       if (editing) {
//         await dispatch(
//           updateStylist({
//             id: staffId,
//             name: name.trim(),
//             phone: phone.trim(),
//             email: email.trim(),
//             specialization:
//               specialization.trim(),
//             experience:
//               Number(experience) || 0,
//             status,
//           })
//         ).unwrap();

//         Alert.alert(
//           "Success",
//           "Staff updated successfully.",
//           [
//             {
//               text: "OK",
//               onPress: () =>
//                 router.replace(
//                   `/staff/${staffId}`
//                 ),
//             },
//           ]
//         );
//       } else {
//         const result =
//           await dispatch(
//             createStylist({
//               name: name.trim(),
//               phone: phone.trim(),
//               email: email.trim(),
//               specialization:
//                 specialization.trim(),
//               experience:
//                 Number(experience) || 0,
//               status,
//             })
//           ).unwrap();

//         const created =
//           result?.stylist || result;

//         Alert.alert(
//           "Success",
//           "Staff added successfully.",
//           [
//             {
//               text: "View Profile",
//               onPress: () => {
//                 if (created?._id) {
//                   router.replace(
//                     `/staff/${created._id}`
//                   );
//                 } else {
//                   router.replace(
//                     "/staff"
//                   );
//                 }
//               },
//             },
//           ]
//         );
//       }
//     } catch (err: any) {
//       Alert.alert(
//         "Error",
//         String(
//           err ||
//             "Failed to save staff."
//         )
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && editing && !name) {
//     return (
//       <SafeAreaView style={styles.safe}>
//         <View style={styles.loader}>
//           <ActivityIndicator
//             size="large"
//             color="#7E243A"
//           />

//           <Text style={styles.loadingText}>
//             Loading staff...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="#F8F2EF"
//       />

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={
//           Platform.OS === "ios"
//             ? "padding"
//             : undefined
//         }
//       >
//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={
//             styles.content
//           }
//         >
//           {/* HEADER */}
//           <View style={styles.header}>
//             <Pressable
//               style={styles.backButton}
//               onPress={() => router.back()}
//             >
//               <Text style={styles.back}>
//                 ‹
//               </Text>
//             </Pressable>

//             <View>
//               <Text style={styles.eyebrow}>
//                 SALON TEAM
//               </Text>

//               <Text style={styles.title}>
//                 {editing
//                   ? "Edit Staff"
//                   : "Add Staff"}
//               </Text>

//               <Text
//                 style={styles.subtitle}
//               >
//                 {editing
//                   ? "Update staff information"
//                   : "Create a new team member"}
//               </Text>
//             </View>
//           </View>

//           {/* PROFILE HEADER */}
//           <View style={styles.profileCard}>
//             <View style={styles.avatar}>
//               <Text style={styles.avatarText}>
//                 {name
//                   ? name
//                       .charAt(0)
//                       .toUpperCase()
//                   : "S"}
//               </Text>
//             </View>

//             <View>
//               <Text style={styles.profileTitle}>
//                 {name ||
//                   "New Staff Member"}
//               </Text>

//               <Text
//                 style={
//                   styles.profileSubtitle
//                 }
//               >
//                 {specialization ||
//                   "Beauty Professional"}
//               </Text>
//             </View>
//           </View>

//           {/* BASIC INFO */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>
//               Basic Information
//             </Text>

//             <Text style={styles.label}>
//               Full Name *
//             </Text>

//             <TextInput
//               value={name}
//               onChangeText={setName}
//               placeholder="Enter staff name"
//               placeholderTextColor="#A6979C"
//               style={styles.input}
//             />

//             <Text style={styles.label}>
//               Phone Number *
//             </Text>

//             <TextInput
//               value={phone}
//               onChangeText={setPhone}
//               placeholder="Enter phone number"
//               placeholderTextColor="#A6979C"
//               keyboardType="phone-pad"
//               style={styles.input}
//             />

//             <Text style={styles.label}>
//               Email
//             </Text>

//             <TextInput
//               value={email}
//               onChangeText={setEmail}
//               placeholder="Enter email"
//               placeholderTextColor="#A6979C"
//               keyboardType="email-address"
//               autoCapitalize="none"
//               style={styles.input}
//             />
//           </View>

//           {/* PROFESSIONAL */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>
//               Professional Details
//             </Text>

//             <Text style={styles.label}>
//               Specialization
//             </Text>

//             <TextInput
//               value={specialization}
//               onChangeText={
//                 setSpecialization
//               }
//               placeholder="Hair, Facial, Makeup..."
//               placeholderTextColor="#A6979C"
//               style={styles.input}
//             />

//             <Text style={styles.label}>
//               Experience
//             </Text>

//             <View
//               style={styles.experienceRow}
//             >
//               <TextInput
//                 value={experience}
//                 onChangeText={
//                   setExperience
//                 }
//                 placeholder="0"
//                 placeholderTextColor="#A6979C"
//                 keyboardType="numeric"
//                 style={[
//                   styles.input,
//                   {
//                     flex: 1,
//                     marginBottom: 0,
//                   },
//                 ]}
//               />

//               <View
//                 style={
//                   styles.yearBox
//                 }
//               >
//                 <Text
//                   style={
//                     styles.yearText
//                   }
//                 >
//                   Years
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* STATUS */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>
//               Staff Status
//             </Text>

//             <View
//               style={styles.statusRow}
//             >
//               <Pressable
//                 style={[
//                   styles.statusOption,
//                   status === "ACTIVE" &&
//                     styles.selectedActive,
//                 ]}
//                 onPress={() =>
//                   setStatus("ACTIVE")
//                 }
//               >
//                 <View
//                   style={[
//                     styles.radio,
//                     status ===
//                       "ACTIVE" &&
//                       styles.radioActive,
//                   ]}
//                 />

//                 <View>
//                   <Text
//                     style={
//                       styles.statusOptionTitle
//                     }
//                   >
//                     Active
//                   </Text>

//                   <Text
//                     style={
//                       styles.statusOptionText
//                     }
//                   >
//                     Available for salon work
//                   </Text>
//                 </View>
//               </Pressable>

//               <Pressable
//                 style={[
//                   styles.statusOption,
//                   status === "INACTIVE" &&
//                     styles.selectedInactive,
//                 ]}
//                 onPress={() =>
//                   setStatus("INACTIVE")
//                 }
//               >
//                 <View
//                   style={[
//                     styles.radio,
//                     status ===
//                       "INACTIVE" &&
//                       styles.radioInactive,
//                   ]}
//                 />

//                 <View>
//                   <Text
//                     style={
//                       styles.statusOptionTitle
//                     }
//                   >
//                     Inactive
//                   </Text>

//                   <Text
//                     style={
//                       styles.statusOptionText
//                     }
//                   >
//                     Currently unavailable
//                   </Text>
//                 </View>
//               </Pressable>
//             </View>
//           </View>

//           {/* SAVE */}
//           <Pressable
//             style={[
//               styles.saveButton,
//               loading &&
//                 styles.disabledButton,
//             ]}
//             disabled={loading}
//             onPress={saveStaff}
//           >
//             {loading ? (
//               <ActivityIndicator
//                 color="#FFFFFF"
//               />
//             ) : (
//               <Text
//                 style={styles.saveText}
//               >
//                 {editing
//                   ? "Update Staff"
//                   : "Add Staff"}
//               </Text>
//             )}
//           </Pressable>

//           <Pressable
//             style={styles.cancelButton}
//             onPress={() =>
//               router.back()
//             }
//           >
//             <Text
//               style={styles.cancelText}
//             >
//               Cancel
//             </Text>
//           </Pressable>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: "#F8F2EF", paddingTop: 20,
//   },

//   content: {
//     padding: 18,
//     paddingBottom: 40,
   
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//   },

//   backButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },

//   back: {
//     fontSize: 32,
//     color: "#4B2933",
//   },

//   eyebrow: {
//     fontSize: 10,
//     fontWeight: "800",
//     letterSpacing: 1.4,
//     color: "#9A6B78",
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: "800",
//     color: "#38252C",
//   },

//   subtitle: {
//     color: "#928188",
//     fontSize: 12,
//     marginTop: 2,
//   },

//   profileCard: {
//     backgroundColor: "#7E243A",
//     borderRadius: 24,
//     padding: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 18,
//   },

//   avatar: {
//     width: 64,
//     height: 64,
//     borderRadius: 20,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 14,
//   },

//   avatarText: {
//     color: "#7E243A",
//     fontSize: 27,
//     fontWeight: "900",
//   },

//   profileTitle: {
//     color: "#FFFFFF",
//     fontSize: 19,
//     fontWeight: "800",
//   },

//   profileSubtitle: {
//     color: "#F3DDE4",
//     fontSize: 12,
//     marginTop: 4,
//   },

//   section: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 20,
//     padding: 17,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: "#EEE3E0",
//   },

//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#3D2930",
//     marginBottom: 15,
//   },

//   label: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: "#75636A",
//     marginBottom: 7,
//     marginTop: 5,
//   },

//   input: {
//     height: 49,
//     borderWidth: 1,
//     borderColor: "#E8DCDA",
//     borderRadius: 13,
//     paddingHorizontal: 14,
//     color: "#3B2930",
//     fontSize: 14,
//     marginBottom: 12,
//     backgroundColor: "#FCFAF9",
//   },

//   experienceRow: {
//     flexDirection: "row",
//     gap: 8,
//   },

//   yearBox: {
//     height: 49,
//     paddingHorizontal: 18,
//     borderRadius: 13,
//     backgroundColor: "#F5E7EB",
//     justifyContent: "center",
//   },

//   yearText: {
//     color: "#7E243A",
//     fontWeight: "800",
//   },

//   statusRow: {
//     gap: 10,
//   },

//   statusOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E9DFDC",
//     borderRadius: 15,
//     padding: 13,
//   },

//   selectedActive: {
//     borderColor: "#7E243A",
//     backgroundColor: "#FCF3F6",
//   },

//   selectedInactive: {
//     borderColor: "#A85A5A",
//     backgroundColor: "#FFF7F7",
//   },

//   radio: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     borderWidth: 2,
//     borderColor: "#C9BABF",
//     marginRight: 11,
//   },

//   radioActive: {
//     borderColor: "#7E243A",
//     backgroundColor: "#7E243A",
//   },

//   radioInactive: {
//     borderColor: "#A85A5A",
//     backgroundColor: "#A85A5A",
//   },

//   statusOptionTitle: {
//     fontSize: 13,
//     fontWeight: "800",
//     color: "#46343A",
//   },

//   statusOptionText: {
//     fontSize: 10,
//     color: "#97888D",
//     marginTop: 2,
//   },

//   saveButton: {
//     height: 53,
//     backgroundColor: "#7E243A",
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 4,
//   },

//   disabledButton: {
//     opacity: 0.65,
//   },

//   saveText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "800",
//   },

//   cancelButton: {
//     height: 50,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   cancelText: {
//     color: "#806E75",
//     fontWeight: "700",
//   },

//   loader: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   loadingText: {
//     marginTop: 10,
//     color: "#806E75",
//   },
// });













import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useDispatch } from "react-redux";

import {
  createStylist,
  getStylistById,
  updateStylist,
  type SalaryType,
  type Stylist,
  type StylistStatus,
} from "../../src/features/stylist/stylistSlice";

type AppDispatch = any;

export default function AddStaffScreen() {
  const dispatch =
    useDispatch<AppDispatch>();

  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const staffId = params.id;

  const editing =
    Boolean(staffId);

  const [loading, setLoading] =
    useState(false);

  // BASIC
  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [specialization, setSpecialization] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [joiningDate, setJoiningDate] =
    useState("");

  const [status, setStatus] =
    useState<StylistStatus>("ACTIVE");

  // SALARY
  const [salaryType, setSalaryType] =
    useState<SalaryType>("MONTHLY");

  const [monthlySalary, setMonthlySalary] =
    useState("");

  const [basicSalary8h, setBasicSalary8h] =
    useState("");

  const [overtimeRate, setOvertimeRate] =
    useState("");

  const [standardHours, setStandardHours] =
    useState("8");

  const [notes, setNotes] =
    useState("");

  // =====================================================
  // LOAD EDIT STAFF
  // =====================================================

  useEffect(() => {
    if (!staffId) return;

    loadStaff();
  }, [staffId]);

  const loadStaff = async () => {
    try {
      setLoading(true);

      const result =
        await dispatch(
          getStylistById(staffId)
        ).unwrap();

      const staff: Stylist =
        result?.stylist ||
        result?.data ||
        result;

      setName(staff.name || "");

      setPhone(staff.phone || "");

      setEmail(staff.email || "");

      setSpecialization(
        staff.specialization || ""
      );

      setExperience(
        String(
          staff.experience ?? ""
        )
      );

      setJoiningDate(
        staff.joiningDate
          ? String(
              staff.joiningDate
            ).slice(0, 10)
          : ""
      );

      setStatus(
        staff.status || "ACTIVE"
      );

      setSalaryType(
        staff.salaryType ||
          "MONTHLY"
      );

      setMonthlySalary(
        String(
          staff.monthlySalary ?? ""
        )
      );

      setBasicSalary8h(
        String(
          staff.basicSalary8h ?? ""
        )
      );

      setOvertimeRate(
        String(
          staff.overtimeRatePerHour ??
            ""
        )
      );

      setStandardHours(
        String(
          staff.standardWorkingHours ??
            8
        )
      );

      setNotes(
        staff.notes || ""
      );
    } catch (err: any) {
      Alert.alert(
        "Error",
        String(
          err ||
            "Failed to load staff"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VALIDATE
  // =====================================================

  const validate = () => {
    if (!name.trim()) {
      Alert.alert(
        "Required",
        "Please enter staff name."
      );

      return false;
    }

    if (!phone.trim()) {
      Alert.alert(
        "Required",
        "Please enter phone number."
      );

      return false;
    }

    if (
      experience.trim() &&
      Number(experience) < 0
    ) {
      Alert.alert(
        "Invalid",
        "Experience cannot be negative."
      );

      return false;
    }

    if (
      basicSalary8h.trim() &&
      Number(basicSalary8h) < 0
    ) {
      Alert.alert(
        "Invalid",
        "Basic salary cannot be negative."
      );

      return false;
    }

    if (
      overtimeRate.trim() &&
      Number(overtimeRate) < 0
    ) {
      Alert.alert(
        "Invalid",
        "Overtime rate cannot be negative."
      );

      return false;
    }

    if (
      standardHours.trim() &&
      Number(standardHours) <= 0
    ) {
      Alert.alert(
        "Invalid",
        "Working hours must be greater than 0."
      );

      return false;
    }

    return true;
  };

  // =====================================================
  // SAVE
  // =====================================================

  const saveStaff = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),

        phone: phone.trim(),

        email: email.trim(),

        specialization:
          specialization.trim(),

        experience:
          Number(experience) || 0,

        status,

        joiningDate:
          joiningDate.trim() || null,

        salaryType,

        monthlySalary:
          Number(monthlySalary) || 0,

        basicSalary8h:
          Number(basicSalary8h) || 0,

        overtimeRatePerHour:
          Number(overtimeRate) || 0,

        standardWorkingHours:
          Number(standardHours) || 8,

        notes: notes.trim(),
      };

      if (editing) {
        await dispatch(
          updateStylist({
            id: staffId!,
            ...payload,
          })
        ).unwrap();

        Alert.alert(
          "Success",
          "Staff updated successfully.",
          [
            {
              text: "OK",
              onPress: () =>
                router.replace(
                  `/staff/${staffId}`
                ),
            },
          ]
        );
      } else {
        const result =
          await dispatch(
            createStylist(payload)
          ).unwrap();

        const created =
          result?.stylist ||
          result?.data ||
          result;

        Alert.alert(
          "Success",
          "Staff added successfully.",
          [
            {
              text: "View Profile",
              onPress: () => {
                if (created?._id) {
                  router.replace(
                    `/staff/${created._id}`
                  );
                } else {
                  router.replace(
                    "/staff"
                  );
                }
              },
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        String(
          err ||
            "Failed to save staff"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  if (
    loading &&
    editing &&
    !name
  ) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color="#7E243A"
          />

          <Text style={styles.loadingText}>
            Loading staff...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F2EF"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() =>
                router.back()
              }
            >
              <Text style={styles.back}>
                ‹
              </Text>
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>
                SALON TEAM
              </Text>

              <Text style={styles.title}>
                {editing
                  ? "Edit Staff"
                  : "Add Staff"}
              </Text>

              <Text style={styles.subtitle}>
                Staff details, salary & work settings
              </Text>
            </View>
          </View>

          {/* PROFILE */}

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name
                  ? name
                      .charAt(0)
                      .toUpperCase()
                  : "S"}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={styles.profileTitle}
              >
                {name ||
                  "New Staff Member"}
              </Text>

              <Text
                style={
                  styles.profileSubtitle
                }
              >
                {specialization ||
                  "Beauty Professional"}
              </Text>
            </View>
          </View>

          {/* BASIC INFO */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Basic Information
            </Text>

            <Field
              label="Full Name *"
              value={name}
              onChangeText={setName}
              placeholder="Enter staff name"
            />

            <Field
              label="Phone Number *"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Field
              label="Specialization"
              value={specialization}
              onChangeText={
                setSpecialization
              }
              placeholder="Hair, Facial, Makeup..."
            />

            <Field
              label="Experience (Years)"
              value={experience}
              onChangeText={
                setExperience
              }
              placeholder="0"
              keyboardType="numeric"
            />

            <Field
              label="Joining Date"
              value={joiningDate}
              onChangeText={
                setJoiningDate
              }
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* SALARY */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Salary Settings
            </Text>

            <Text style={styles.label}>
              Salary Type
            </Text>

            <View style={styles.optionRow}>
              <Pressable
                style={[
                  styles.option,
                  salaryType ===
                    "MONTHLY" &&
                    styles.selectedOption,
                ]}
                onPress={() =>
                  setSalaryType(
                    "MONTHLY"
                  )
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    salaryType ===
                      "MONTHLY" &&
                      styles.selectedOptionText,
                  ]}
                >
                  Monthly
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.option,
                  salaryType ===
                    "DAILY" &&
                    styles.selectedOption,
                ]}
                onPress={() =>
                  setSalaryType("DAILY")
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    salaryType ===
                      "DAILY" &&
                      styles.selectedOptionText,
                  ]}
                >
                  Daily
                </Text>
              </Pressable>
            </View>

            <Field
              label="Monthly Salary"
              value={monthlySalary}
              onChangeText={
                setMonthlySalary
              }
              placeholder="₹ 0"
              keyboardType="numeric"
            />

            <Field
              label="Basic Salary — 8 Hours"
              value={basicSalary8h}
              onChangeText={
                setBasicSalary8h
              }
              placeholder="₹ 0"
              keyboardType="numeric"
            />

            <Field
              label="Extra Hour / Overtime Rate"
              value={overtimeRate}
              onChangeText={
                setOvertimeRate
              }
              placeholder="₹ per hour"
              keyboardType="numeric"
            />

            <Field
              label="Standard Working Hours"
              value={standardHours}
              onChangeText={
                setStandardHours
              }
              placeholder="8"
              keyboardType="numeric"
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                Salary Calculation
              </Text>

              <Text style={styles.infoText}>
                Present day = Basic 8H salary
              </Text>

              <Text style={styles.infoText}>
                Extra hours = Overtime rate × extra hours
              </Text>

              <Text style={styles.infoText}>
                Half day = 50% of basic salary
              </Text>

              <Text style={styles.infoText}>
                Absent / Leave = ₹0
              </Text>
            </View>
          </View>

          {/* STATUS */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Staff Status
            </Text>

            <View style={styles.statusRow}>
              <Pressable
                style={[
                  styles.statusOption,
                  status === "ACTIVE" &&
                    styles.activeSelected,
                ]}
                onPress={() =>
                  setStatus("ACTIVE")
                }
              >
                <Text style={styles.statusTitle}>
                  Active
                </Text>

                <Text style={styles.statusSub}>
                  Available for work
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.statusOption,
                  status ===
                    "INACTIVE" &&
                    styles.inactiveSelected,
                ]}
                onPress={() =>
                  setStatus("INACTIVE")
                }
              >
                <Text style={styles.statusTitle}>
                  Inactive
                </Text>

                <Text style={styles.statusSub}>
                  Not currently working
                </Text>
              </Pressable>
            </View>
          </View>

          {/* NOTES */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Notes
            </Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional staff notes..."
              placeholderTextColor="#A6979C"
              multiline
              textAlignVertical="top"
              style={styles.notes}
            />
          </View>

          {/* SAVE */}

          <Pressable
            style={[
              styles.saveButton,
              loading &&
                styles.disabled,
            ]}
            disabled={loading}
            onPress={saveStaff}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>
                {editing
                  ? "Update Staff"
                  : "Add Staff"}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() =>
              router.back()
            }
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =====================================================
// FIELD
// =====================================================

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A6979C"
        keyboardType={keyboardType}
        autoCapitalize={
          autoCapitalize || "sentences"
        }
        style={styles.input}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F2EF",
  },

  content: {
    padding: 18,
    paddingBottom: 45,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  back: {
    color: "#4B2933",
    fontSize: 32,
    marginTop: -4,
  },

  eyebrow: {
    color: "#9A6B78",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  title: {
    color: "#38252C",
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    color: "#8C7D84",
    fontSize: 11,
    marginTop: 2,
  },

  profileCard: {
    backgroundColor: "#7E243A",
    borderRadius: 24,
    padding: 19,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  avatarText: {
    color: "#7E243A",
    fontSize: 27,
    fontWeight: "900",
  },

  profileTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  profileSubtitle: {
    color: "#F5DCE4",
    fontSize: 12,
    marginTop: 4,
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEE3E0",
  },

  sectionTitle: {
    color: "#3D2930",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 13,
  },

  label: {
    color: "#75636A",
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 6,
    marginTop: 5,
  },

  input: {
    height: 49,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E8DCDA",
    backgroundColor: "#FCFAF9",
    paddingHorizontal: 14,
    color: "#3B2930",
    fontSize: 14,
    marginBottom: 8,
  },

  optionRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 8,
  },

  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E6DAD8",
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: "center",
  },

  selectedOption: {
    backgroundColor: "#7E243A",
    borderColor: "#7E243A",
  },

  optionText: {
    color: "#675960",
    fontWeight: "800",
  },

  selectedOptionText: {
    color: "#FFFFFF",
  },

  infoBox: {
    backgroundColor: "#FCF4F7",
    borderRadius: 14,
    padding: 13,
    marginTop: 5,
  },

  infoTitle: {
    color: "#7E243A",
    fontWeight: "900",
    fontSize: 12,
    marginBottom: 6,
  },

  infoText: {
    color: "#806F76",
    fontSize: 11,
    marginTop: 3,
  },

  statusRow: {
    gap: 9,
  },

  statusOption: {
    borderWidth: 1,
    borderColor: "#E8DEDB",
    borderRadius: 14,
    padding: 13,
  },

  activeSelected: {
    borderColor: "#7E243A",
    backgroundColor: "#FCF3F6",
  },

  inactiveSelected: {
    borderColor: "#A65D5D",
    backgroundColor: "#FFF6F6",
  },

  statusTitle: {
    color: "#44333A",
    fontWeight: "900",
    fontSize: 13,
  },

  statusSub: {
    color: "#918188",
    fontSize: 10,
    marginTop: 3,
  },

  notes: {
    minHeight: 105,
    borderWidth: 1,
    borderColor: "#E8DCDA",
    borderRadius: 13,
    backgroundColor: "#FCFAF9",
    padding: 13,
    color: "#3B2930",
    fontSize: 13,
  },

  saveButton: {
    height: 54,
    backgroundColor: "#7E243A",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  disabled: {
    opacity: 0.65,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  cancelButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    color: "#806E75",
    fontWeight: "800",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#806E75",
    marginTop: 10,
  },
});