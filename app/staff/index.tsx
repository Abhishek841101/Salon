
// // import React, {
// //   useCallback,
// //   useEffect,
// //   useMemo,
// //   useState,
// // } from "react";

// // import {
// //   ActivityIndicator,
// //   Alert,
// //   FlatList,
// //   KeyboardAvoidingView,
// //   Modal,
// //   Platform,
// //   Pressable,
// //   RefreshControl,
// //   SafeAreaView,
// //   StatusBar,
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   View,
// // } from "react-native";

// // import { router, useFocusEffect } from "expo-router";

// // import { useDispatch, useSelector } from "react-redux";

// // import {
// //   createStylist,
// //   deleteStylist,
// //   fetchStylists,
// //   updateStylist,
// //   clearStylistError,
// //   clearStylistSuccess,
// //   type Stylist,
// // } from "../../src/features/stylist/stylistSlice";

// // /* =========================================================
// //    TYPES
// // ========================================================= */

// // type AppDispatch = any;
// // type RootState = any;

// // /* =========================================================
// //    SCREEN
// // ========================================================= */

// // export default function StaffScreen() {
// //   const dispatch = useDispatch<AppDispatch>();

// //   const {
// //     stylists = [],
// //     loading = false,
// //     saving = false,
// //     deleting = false,
// //     error = null,
// //     success = false,
// //   } = useSelector(
// //     (state: RootState) => state.stylists || {}
// //   );

// //   /* =======================================================
// //      STATE
// //   ======================================================= */

// //   const [search, setSearch] = useState("");
// //   const [refreshing, setRefreshing] = useState(false);

// //   const [modalVisible, setModalVisible] =
// //     useState(false);

// //   const [editingStaff, setEditingStaff] =
// //     useState<Stylist | null>(null);

// //   const [name, setName] = useState("");
// //   const [phone, setPhone] = useState("");
// //   const [email, setEmail] = useState("");
// //   const [specialization, setSpecialization] =
// //     useState("");

// //   const [experience, setExperience] = useState("");

// //   const [status, setStatus] =
// //     useState<"ACTIVE" | "INACTIVE">("ACTIVE");

// //   const [searchLoading, setSearchLoading] =
// //     useState(false);

// //   /* =======================================================
// //      LOAD STAFF
// //   ======================================================= */

// //   const loadStaff = useCallback(
// //     async (searchValue = "") => {
// //       try {
// //         setSearchLoading(true);

// //         await dispatch(
// //           fetchStylists({
// //             search: searchValue.trim(),
// //           })
// //         ).unwrap();
// //       } catch (err) {
// //         console.log("LOAD STAFF ERROR:", err);
// //       } finally {
// //         setSearchLoading(false);
// //       }
// //     },
// //     [dispatch]
// //   );

// //   /* =======================================================
// //      SCREEN FOCUS
// //   ======================================================= */

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadStaff(search);
// //     }, [])
// //   );

// //   /* =======================================================
// //      SUCCESS
// //   ======================================================= */

// //   useEffect(() => {
// //     if (!success) return;

// //     const timer = setTimeout(() => {
// //       dispatch(clearStylistSuccess());
// //     }, 2500);

// //     return () => clearTimeout(timer);
// //   }, [success, dispatch]);

// //   /* =======================================================
// //      ERROR
// //   ======================================================= */

// //   useEffect(() => {
// //     if (!error) return;

// //     const timer = setTimeout(() => {
// //       dispatch(clearStylistError());
// //     }, 3000);

// //     return () => clearTimeout(timer);
// //   }, [error, dispatch]);

// //   /* =======================================================
// //      SEARCH
// //   ======================================================= */

// //   const handleSearch = async () => {
// //     await loadStaff(search);
// //   };

// //   const clearSearch = async () => {
// //     setSearch("");
// //     await loadStaff("");
// //   };

// //   /* =======================================================
// //      REFRESH
// //   ======================================================= */

// //   const handleRefresh = async () => {
// //     try {
// //       setRefreshing(true);

// //       await dispatch(
// //         fetchStylists({
// //           search: search.trim(),
// //         })
// //       ).unwrap();
// //     } catch (err) {
// //       console.log("REFRESH ERROR:", err);
// //     } finally {
// //       setRefreshing(false);
// //     }
// //   };

// //   /* =======================================================
// //      FORM
// //   ======================================================= */

// //   const resetForm = () => {
// //     setName("");
// //     setPhone("");
// //     setEmail("");
// //     setSpecialization("");
// //     setExperience("");
// //     setStatus("ACTIVE");
// //     setEditingStaff(null);
// //   };

// //   const openAddStaff = () => {
// //     resetForm();
// //     setModalVisible(true);
// //   };

// //   const openEditStaff = (staff: Stylist) => {
// //     setEditingStaff(staff);

// //     setName(staff.name || "");
// //     setPhone(staff.phone || "");
// //     setEmail(staff.email || "");
// //     setSpecialization(
// //       staff.specialization || ""
// //     );
// //     setExperience(
// //       String(staff.experience ?? "")
// //     );
// //     setStatus(staff.status || "ACTIVE");

// //     setModalVisible(true);
// //   };

// //   const closeModal = () => {
// //     if (saving) return;

// //     setModalVisible(false);
// //     resetForm();
// //   };

// //   /* =======================================================
// //      VALIDATION
// //   ======================================================= */

// //   const validateForm = () => {
// //     if (!name.trim()) {
// //       Alert.alert(
// //         "Required",
// //         "Please enter staff name."
// //       );
// //       return false;
// //     }

// //     if (!phone.trim()) {
// //       Alert.alert(
// //         "Required",
// //         "Please enter phone number."
// //       );
// //       return false;
// //     }

// //     if (
// //       experience.trim() &&
// //       Number(experience) < 0
// //     ) {
// //       Alert.alert(
// //         "Invalid Experience",
// //         "Experience cannot be negative."
// //       );
// //       return false;
// //     }

// //     return true;
// //   };

// //   /* =======================================================
// //      SAVE
// //   ======================================================= */

// //   const handleSave = async () => {
// //     if (!validateForm()) return;

// //     try {
// //       if (editingStaff) {
// //         await dispatch(
// //           updateStylist({
// //             id: editingStaff._id,
// //             name: name.trim(),
// //             phone: phone.trim(),
// //             email: email.trim(),
// //             specialization:
// //               specialization.trim(),
// //             experience:
// //               Number(experience) || 0,
// //             status,
// //           })
// //         ).unwrap();

// //         Alert.alert(
// //           "Success",
// //           "Staff updated successfully."
// //         );
// //       } else {
// //         await dispatch(
// //           createStylist({
// //             name: name.trim(),
// //             phone: phone.trim(),
// //             email: email.trim(),
// //             specialization:
// //               specialization.trim(),
// //             experience:
// //               Number(experience) || 0,
// //             status,
// //           })
// //         ).unwrap();

// //         Alert.alert(
// //           "Success",
// //           "Staff added successfully."
// //         );
// //       }

// //       setModalVisible(false);
// //       resetForm();

// //       await loadStaff(search);
// //     } catch (err: any) {
// //       Alert.alert(
// //         "Error",
// //         String(err || "Something went wrong.")
// //       );
// //     }
// //   };

// //   /* =======================================================
// //      DELETE
// //   ======================================================= */

// //   const confirmDelete = (staff: Stylist) => {
// //     Alert.alert(
// //       "Delete Staff",
// //       `Are you sure you want to delete ${staff.name}?`,
// //       [
// //         {
// //           text: "Cancel",
// //           style: "cancel",
// //         },
// //         {
// //           text: "Delete",
// //           style: "destructive",
// //           onPress: async () => {
// //             try {
// //               await dispatch(
// //                 deleteStylist(staff._id)
// //               ).unwrap();

// //               Alert.alert(
// //                 "Deleted",
// //                 "Staff deleted successfully."
// //               );

// //               await loadStaff(search);
// //             } catch (err: any) {
// //               Alert.alert(
// //                 "Error",
// //                 String(
// //                   err ||
// //                     "Failed to delete staff."
// //                 )
// //               );
// //             }
// //           },
// //         },
// //       ]
// //     );
// //   };

// //   /* =======================================================
// //      STATUS
// //   ======================================================= */

// //   const toggleStatus = (staff: Stylist) => {
// //     const newStatus =
// //       staff.status === "ACTIVE"
// //         ? "INACTIVE"
// //         : "ACTIVE";

// //     Alert.alert(
// //       newStatus === "ACTIVE"
// //         ? "Activate Staff"
// //         : "Deactivate Staff",
// //       `${staff.name} will be marked ${newStatus.toLowerCase()}.`,
// //       [
// //         {
// //           text: "Cancel",
// //           style: "cancel",
// //         },
// //         {
// //           text: "Confirm",
// //           onPress: async () => {
// //             try {
// //               await dispatch(
// //                 updateStylist({
// //                   id: staff._id,
// //                   status: newStatus,
// //                 })
// //               ).unwrap();

// //               await loadStaff(search);
// //             } catch (err: any) {
// //               Alert.alert(
// //                 "Error",
// //                 String(
// //                   err ||
// //                     "Failed to update status."
// //                 )
// //               );
// //             }
// //           },
// //         },
// //       ]
// //     );
// //   };

// //   /* =======================================================
// //      SEARCH FALLBACK
// //   ======================================================= */

// //   const displayedStaff = useMemo(() => {
// //     if (!search.trim()) {
// //       return stylists;
// //     }

// //     const value = search
// //       .trim()
// //       .toLowerCase();

// //     return stylists.filter(
// //       (staff: Stylist) => {
// //         const staffName = String(
// //           staff.name || ""
// //         ).toLowerCase();

// //         const staffPhone = String(
// //           staff.phone || ""
// //         ).toLowerCase();

// //         const staffEmail = String(
// //           staff.email || ""
// //         ).toLowerCase();

// //         return (
// //           staffName.includes(value) ||
// //           staffPhone.includes(value) ||
// //           staffEmail.includes(value)
// //         );
// //       }
// //     );
// //   }, [stylists, search]);

// //   /* =======================================================
// //      STAFF CARD
// //   ======================================================= */

// //   const renderStaff = ({
// //     item,
// //   }: {
// //     item: Stylist;
// //   }) => {
// //     const initial =
// //       item.name
// //         ?.charAt(0)
// //         ?.toUpperCase() || "S";

// //     const isActive =
// //       item.status === "ACTIVE";

// //     return (
// //       <View style={styles.staffCard}>
// //         {/* TOP */}
// //         <View style={styles.cardTop}>
// //           <View style={styles.avatar}>
// //             <Text style={styles.avatarText}>
// //               {initial}
// //             </Text>
// //           </View>

// //           <View style={styles.staffMain}>
// //             <View style={styles.nameRow}>
// //               <Text
// //                 style={styles.staffName}
// //                 numberOfLines={1}
// //               >
// //                 {item.name}
// //               </Text>

// //               <View
// //                 style={[
// //                   styles.statusBadge,
// //                   isActive
// //                     ? styles.activeBadge
// //                     : styles.inactiveBadge,
// //                 ]}
// //               >
// //                 <View
// //                   style={[
// //                     styles.statusDot,
// //                     isActive
// //                       ? styles.activeDot
// //                       : styles.inactiveDot,
// //                   ]}
// //                 />

// //                 <Text
// //                   style={[
// //                     styles.statusText,
// //                     isActive
// //                       ? styles.activeText
// //                       : styles.inactiveText,
// //                   ]}
// //                 >
// //                   {isActive
// //                     ? "ACTIVE"
// //                     : "INACTIVE"}
// //                 </Text>
// //               </View>
// //             </View>

// //             <Text
// //               style={styles.specialization}
// //               numberOfLines={1}
// //             >
// //               {item.specialization ||
// //                 "Beauty Professional"}
// //             </Text>

// //             <Text style={styles.phone}>
// //               {item.phone}
// //             </Text>
// //           </View>
// //         </View>

// //         <View style={styles.cardDivider} />

// //         {/* INFO */}
// //         <View style={styles.infoRow}>
// //           <View style={styles.infoItem}>
// //             <Text style={styles.infoLabel}>
// //               EMAIL
// //             </Text>

// //             <Text
// //               style={styles.infoValue}
// //               numberOfLines={1}
// //             >
// //               {item.email || "Not added"}
// //             </Text>
// //           </View>

// //           <View style={styles.infoItem}>
// //             <Text style={styles.infoLabel}>
// //               EXPERIENCE
// //             </Text>

// //             <Text style={styles.infoValue}>
// //               {item.experience || 0}{" "}
// //               {Number(item.experience) === 1
// //                 ? "year"
// //                 : "years"}
// //             </Text>
// //           </View>
// //         </View>

// //         {/* ACTIONS */}
// //         <View style={styles.actionRow}>
// //           <Pressable
// //             style={styles.statusButton}
// //             onPress={() =>
// //               toggleStatus(item)
// //             }
// //           >
// //             <Text
// //               style={styles.statusButtonText}
// //             >
// //               {isActive
// //                 ? "Deactivate"
// //                 : "Activate"}
// //             </Text>
// //           </Pressable>

// //           <Pressable
// //             style={styles.editButton}
// //             onPress={() =>
// //               openEditStaff(item)
// //             }
// //           >
// //             <Text
// //               style={styles.editButtonText}
// //             >
// //               Edit
// //             </Text>
// //           </Pressable>

// //           <Pressable
// //             style={styles.deleteButton}
// //             onPress={() =>
// //               confirmDelete(item)
// //             }
// //           >
// //             <Text
// //               style={styles.deleteButtonText}
// //             >
// //               Delete
// //             </Text>
// //           </Pressable>
// //         </View>
// //       </View>
// //     );
// //   };

// //   /* =======================================================
// //      EMPTY
// //   ======================================================= */

// //   const renderEmpty = () => {
// //     if (
// //       loading ||
// //       searchLoading
// //     ) {
// //       return (
// //         <View style={styles.emptyContainer}>
// //           <ActivityIndicator
// //             size="large"
// //             color="#7E243A"
// //           />

// //           <Text style={styles.emptyText}>
// //             Loading staff...
// //           </Text>
// //         </View>
// //       );
// //     }

// //     return (
// //       <View style={styles.emptyContainer}>
// //         <View style={styles.emptyIcon}>
// //           <Text style={styles.emptyIconText}>
// //             ♙
// //           </Text>
// //         </View>

// //         <Text style={styles.emptyTitle}>
// //           No Staff Found
// //         </Text>

// //         <Text style={styles.emptySubtitle}>
// //           {search.trim()
// //             ? "Try another name, phone number or email."
// //             : "Add your first staff member to start managing your salon team."}
// //         </Text>

// //         {!search.trim() && (
// //           <Pressable
// //             style={styles.emptyAddButton}
// //             onPress={openAddStaff}
// //           >
// //             <Text
// //               style={styles.emptyAddButtonText}
// //             >
// //               + Add Staff
// //             </Text>
// //           </Pressable>
// //         )}
// //       </View>
// //     );
// //   };

// //   /* =======================================================
// //      RENDER
// //   ======================================================= */

// //   return (
// //     <SafeAreaView style={styles.safeArea}>
// //       <StatusBar
// //         barStyle="dark-content"
// //         backgroundColor="#F8F2EF"
// //       />

// //       <View style={styles.container}>
// //         {/* HEADER */}
// //         <View style={styles.header}>
// //           <Pressable
// //             style={styles.backButton}
// //             onPress={() => router.back()}
// //           >
// //             <Text style={styles.backText}>
// //               ‹
// //             </Text>
// //           </Pressable>

// //           <View style={styles.headerText}>
// //             <Text style={styles.headerEyebrow}>
// //               SALON TEAM
// //             </Text>

// //             <Text style={styles.headerTitle}>
// //               Staff & Stylists
// //             </Text>

// //             <Text style={styles.headerSubtitle}>
// //               Manage your salon team
// //             </Text>
// //           </View>

// //           <Pressable
// //             style={styles.addButton}
// //             onPress={openAddStaff}
// //           >
// //             <Text style={styles.addButtonPlus}>
// //               +
// //             </Text>

// //             <Text style={styles.addButtonText}>
// //               Add
// //             </Text>
// //           </Pressable>
// //         </View>

// //         {/* SEARCH */}
// //         <View style={styles.searchContainer}>
// //           <View style={styles.searchIconBox}>
// //             <Text style={styles.searchIcon}>
// //               ⌕
// //             </Text>
// //           </View>

// //           <TextInput
// //             value={search}
// //             onChangeText={setSearch}
// //             onSubmitEditing={handleSearch}
// //             placeholder="Search name, phone or email..."
// //             placeholderTextColor="#A4979B"
// //             style={styles.searchInput}
// //             returnKeyType="search"
// //             autoCapitalize="none"
// //           />

// //           {search.length > 0 && (
// //             <Pressable
// //               onPress={clearSearch}
// //               style={styles.clearButton}
// //             >
// //               <Text style={styles.clearText}>
// //                 ×
// //               </Text>
// //             </Pressable>
// //           )}

// //           <Pressable
// //             onPress={handleSearch}
// //             style={styles.searchButton}
// //           >
// //             <Text style={styles.searchButtonText}>
// //               Search
// //             </Text>
// //           </Pressable>
// //         </View>

// //         {/* SUMMARY */}
// //         <View style={styles.summaryRow}>
// //           <View style={styles.summaryCard}>
// //             <View style={styles.summaryIcon}>
// //               <Text style={styles.summaryIconText}>
// //                 ♙
// //               </Text>
// //             </View>

// //             <View>
// //               <Text style={styles.summaryValue}>
// //                 {stylists.length}
// //               </Text>

// //               <Text style={styles.summaryLabel}>
// //                 Total Staff
// //               </Text>
// //             </View>
// //           </View>

// //           <View style={styles.summaryCard}>
// //             <View style={styles.summaryIcon}>
// //               <Text style={styles.summaryIconText}>
// //                 ✓
// //               </Text>
// //             </View>

// //             <View>
// //               <Text style={styles.summaryValue}>
// //                 {
// //                   stylists.filter(
// //                     (staff: Stylist) =>
// //                       staff.status === "ACTIVE"
// //                   ).length
// //                 }
// //               </Text>

// //               <Text style={styles.summaryLabel}>
// //                 Active
// //               </Text>
// //             </View>
// //           </View>
// //         </View>

// //         {/* LIST */}
// //         <FlatList
// //           data={displayedStaff}
// //           keyExtractor={(item) =>
// //             String(item._id)
// //           }
// //           renderItem={renderStaff}
// //           ListEmptyComponent={renderEmpty}
// //           showsVerticalScrollIndicator={false}
// //           contentContainerStyle={[
// //             styles.listContent,
// //             displayedStaff.length === 0 &&
// //               styles.emptyListContent,
// //           ]}
// //           refreshControl={
// //             <RefreshControl
// //               refreshing={refreshing}
// //               onRefresh={handleRefresh}
// //               tintColor="#7E243A"
// //               colors={["#7E243A"]}
// //             />
// //           }
// //         />

// //         {/* =================================================
// //             ADD / EDIT MODAL
// //         ================================================= */}

// //         <Modal
// //           visible={modalVisible}
// //           animationType="slide"
// //           transparent
// //           onRequestClose={closeModal}
// //         >
// //           <KeyboardAvoidingView
// //             style={styles.modalOverlay}
// //             behavior={
// //               Platform.OS === "ios"
// //                 ? "padding"
// //                 : undefined
// //             }
// //           >
// //             <View style={styles.modalCard}>
// //               {/* MODAL HEADER */}
// //               <View style={styles.modalHeader}>
// //                 <View>
// //                   <Text style={styles.modalEyebrow}>
// //                     TEAM MEMBER
// //                   </Text>

// //                   <Text style={styles.modalTitle}>
// //                     {editingStaff
// //                       ? "Edit Staff"
// //                       : "Add Staff"}
// //                   </Text>
// //                 </View>

// //                 <Pressable
// //                   onPress={closeModal}
// //                   style={styles.modalClose}
// //                 >
// //                   <Text style={styles.modalCloseText}>
// //                     ×
// //                   </Text>
// //                 </Pressable>
// //               </View>

// //               <FlatList
// //                 data={[1]}
// //                 keyExtractor={() => "form"}
// //                 showsVerticalScrollIndicator={false}
// //                 renderItem={() => (
// //                   <View>
// //                     {/* NAME */}
// //                     <Text style={styles.inputLabel}>
// //                       NAME *
// //                     </Text>

// //                     <TextInput
// //                       value={name}
// //                       onChangeText={setName}
// //                       placeholder="Enter staff name"
// //                       placeholderTextColor="#A4979B"
// //                       style={styles.input}
// //                     />

// //                     {/* PHONE */}
// //                     <Text style={styles.inputLabel}>
// //                       PHONE *
// //                     </Text>

// //                     <TextInput
// //                       value={phone}
// //                       onChangeText={setPhone}
// //                       placeholder="Enter phone number"
// //                       placeholderTextColor="#A4979B"
// //                       keyboardType="phone-pad"
// //                       style={styles.input}
// //                     />

// //                     {/* EMAIL */}
// //                     <Text style={styles.inputLabel}>
// //                       EMAIL
// //                     </Text>

// //                     <TextInput
// //                       value={email}
// //                       onChangeText={setEmail}
// //                       placeholder="Enter email"
// //                       placeholderTextColor="#A4979B"
// //                       keyboardType="email-address"
// //                       autoCapitalize="none"
// //                       style={styles.input}
// //                     />

// //                     {/* SPECIALIZATION */}
// //                     <Text style={styles.inputLabel}>
// //                       SPECIALIZATION
// //                     </Text>

// //                     <TextInput
// //                       value={specialization}
// //                       onChangeText={
// //                         setSpecialization
// //                       }
// //                       placeholder="Hair stylist, Makeup artist..."
// //                       placeholderTextColor="#A4979B"
// //                       style={styles.input}
// //                     />

// //                     {/* EXPERIENCE */}
// //                     <Text style={styles.inputLabel}>
// //                       EXPERIENCE
// //                     </Text>

// //                     <TextInput
// //                       value={experience}
// //                       onChangeText={
// //                         setExperience
// //                       }
// //                       placeholder="Years of experience"
// //                       placeholderTextColor="#A4979B"
// //                       keyboardType="numeric"
// //                       style={styles.input}
// //                     />

// //                     {/* STATUS */}
// //                     <Text style={styles.inputLabel}>
// //                       STATUS
// //                     </Text>

// //                     <View style={styles.statusSelector}>
// //                       <Pressable
// //                         style={[
// //                           styles.statusOption,
// //                           status === "ACTIVE" &&
// //                             styles.statusOptionActive,
// //                         ]}
// //                         onPress={() =>
// //                           setStatus("ACTIVE")
// //                         }
// //                       >
// //                         <Text
// //                           style={[
// //                             styles.statusOptionText,
// //                             status ===
// //                               "ACTIVE" &&
// //                               styles.statusOptionTextActive,
// //                           ]}
// //                         >
// //                           Active
// //                         </Text>
// //                       </Pressable>

// //                       <Pressable
// //                         style={[
// //                           styles.statusOption,
// //                           status ===
// //                             "INACTIVE" &&
// //                             styles.statusOptionInactive,
// //                         ]}
// //                         onPress={() =>
// //                           setStatus("INACTIVE")
// //                         }
// //                       >
// //                         <Text
// //                           style={[
// //                             styles.statusOptionText,
// //                             status ===
// //                               "INACTIVE" &&
// //                               styles.statusOptionTextInactive,
// //                           ]}
// //                         >
// //                           Inactive
// //                         </Text>
// //                       </Pressable>
// //                     </View>

// //                     {/* BUTTONS */}
// //                     <View style={styles.modalActions}>
// //                       <Pressable
// //                         style={styles.cancelButton}
// //                         onPress={closeModal}
// //                         disabled={saving}
// //                       >
// //                         <Text
// //                           style={
// //                             styles.cancelButtonText
// //                           }
// //                         >
// //                           Cancel
// //                         </Text>
// //                       </Pressable>

// //                       <Pressable
// //                         style={[
// //                           styles.saveButton,
// //                           saving &&
// //                             styles.disabledButton,
// //                         ]}
// //                         onPress={handleSave}
// //                         disabled={saving}
// //                       >
// //                         {saving ? (
// //                           <ActivityIndicator
// //                             color="#FFFFFF"
// //                             size="small"
// //                           />
// //                         ) : (
// //                           <Text
// //                             style={
// //                               styles.saveButtonText
// //                             }
// //                           >
// //                             {editingStaff
// //                               ? "Update Staff"
// //                               : "Add Staff"}
// //                           </Text>
// //                         )}
// //                       </Pressable>
// //                     </View>

// //                     <View
// //                       style={{
// //                         height: 30,
// //                       }}
// //                     />
// //                   </View>
// //                 )}
// //               />
// //             </View>
// //           </KeyboardAvoidingView>
// //         </Modal>
// //       </View>
// //     </SafeAreaView>
// //   );
// // }

// // /* =========================================================
// //    STYLES
// // ========================================================= */

// // const styles = StyleSheet.create({
// //   /* APP */

// //   safeArea: {
// //     flex: 1,
// //     backgroundColor: "#F8F2EF",
// //   },

// //   container: {
// //     flex: 1,
// //     backgroundColor: "#F8F2EF",
// //   },

// //   /* HEADER */

// //   header: {
// //     paddingHorizontal: 15,
// //     paddingTop: 48,
// //     paddingBottom: 12,
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },

// //   backButton: {
// //     width: 38,
// //     height: 38,
// //     borderRadius: 12,
// //     backgroundColor: "#FFFFFF",
// //     borderWidth: 1,
// //     borderColor: "#E8DCD8",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginRight: 10,
// //   },

// //   backText: {
// //     color: "#7E243A",
// //     fontSize: 26,
// //     fontWeight: "300",
// //     marginTop: -3,
// //   },

// //   headerText: {
// //     flex: 1,
// //   },

// //   headerEyebrow: {
// //     color: "#A39599",
// //     fontSize: 7,
// //     fontWeight: "900",
// //     letterSpacing: 1.3,
// //   },

// //   headerTitle: {
// //     color: "#33282C",
// //     fontSize: 20,
// //     fontWeight: "900",
// //     marginTop: 3,
// //   },

// //   headerSubtitle: {
// //     color: "#A4979B",
// //     fontSize: 7,
// //     marginTop: 3,
// //   },

// //   addButton: {
// //     height: 39,
// //     paddingHorizontal: 13,
// //     borderRadius: 12,
// //     backgroundColor: "#7E243A",
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     shadowColor: "#7E243A",
// //     shadowOpacity: 0.18,
// //     shadowRadius: 8,
// //     shadowOffset: {
// //       width: 0,
// //       height: 4,
// //     },
// //     elevation: 4,
// //   },

// //   addButtonPlus: {
// //     color: "#FFFFFF",
// //     fontSize: 19,
// //     fontWeight: "300",
// //     marginRight: 4,
// //   },

// //   addButtonText: {
// //     color: "#FFFFFF",
// //     fontSize: 8,
// //     fontWeight: "900",
// //   },

// //   /* SEARCH */

// //   searchContainer: {
// //     marginHorizontal: 15,
// //     minHeight: 49,
// //     backgroundColor: "#FFFFFF",
// //     borderWidth: 1,
// //     borderColor: "#E8DCD8",
// //     borderRadius: 15,
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 7,
// //   },

// //   searchIconBox: {
// //     width: 34,
// //     height: 34,
// //     borderRadius: 10,
// //     backgroundColor: "#F8E9E6",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   searchIcon: {
// //     color: "#7E243A",
// //     fontSize: 17,
// //     fontWeight: "900",
// //   },

// //   searchInput: {
// //     flex: 1,
// //     height: 45,
// //     paddingHorizontal: 9,
// //     color: "#403337",
// //     fontSize: 11,
// //   },

// //   clearButton: {
// //     width: 28,
// //     height: 28,
// //     borderRadius: 9,
// //     backgroundColor: "#F8E9E6",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginRight: 4,
// //   },

// //   clearText: {
// //     color: "#7E243A",
// //     fontSize: 18,
// //     lineHeight: 20,
// //   },

// //   searchButton: {
// //     height: 35,
// //     paddingHorizontal: 11,
// //     borderRadius: 10,
// //     backgroundColor: "#7E243A",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   searchButtonText: {
// //     color: "#FFFFFF",
// //     fontSize: 7,
// //     fontWeight: "900",
// //   },

// //   /* SUMMARY */

// //   summaryRow: {
// //     flexDirection: "row",
// //     gap: 8,
// //     marginHorizontal: 15,
// //     marginTop: 10,
// //     marginBottom: 3,
// //   },

// //   summaryCard: {
// //     flex: 1,
// //     minHeight: 61,
// //     backgroundColor: "#FFFFFF",
// //     borderRadius: 14,
// //     borderWidth: 1,
// //     borderColor: "#E8DCD8",
// //     paddingHorizontal: 10,
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },

// //   summaryIcon: {
// //     width: 34,
// //     height: 34,
// //     borderRadius: 11,
// //     backgroundColor: "#F8E9E6",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginRight: 9,
// //   },

// //   summaryIconText: {
// //     color: "#7E243A",
// //     fontSize: 13,
// //     fontWeight: "900",
// //   },

// //   summaryValue: {
// //     color: "#33282C",
// //     fontSize: 15,
// //     fontWeight: "900",
// //   },

// //   summaryLabel: {
// //     color: "#A4979B",
// //     fontSize: 6,
// //     marginTop: 2,
// //   },

// //   /* LIST */

// //   listContent: {
// //     paddingHorizontal: 15,
// //     paddingTop: 9,
// //     paddingBottom: 35,
// //   },

// //   emptyListContent: {
// //     flexGrow: 1,
// //   },

// //   /* STAFF CARD */

// //   staffCard: {
// //     backgroundColor: "#FFFFFF",
// //     borderRadius: 16,
// //     borderWidth: 1,
// //     borderColor: "#E8DCD8",
// //     marginBottom: 10,
// //     padding: 12,
// //     shadowColor: "#7E243A",
// //     shadowOpacity: 0.04,
// //     shadowRadius: 7,
// //     shadowOffset: {
// //       width: 0,
// //       height: 3,
// //     },
// //     elevation: 2,
// //   },

// //   cardTop: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },

// //   avatar: {
// //     width: 48,
// //     height: 48,
// //     borderRadius: 15,
// //     backgroundColor: "#7E243A",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   avatarText: {
// //     color: "#FFFFFF",
// //     fontSize: 19,
// //     fontWeight: "900",
// //   },

// //   staffMain: {
// //     flex: 1,
// //     marginLeft: 11,
// //   },

// //   nameRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },

// //   staffName: {
// //     flex: 1,
// //     color: "#403337",
// //     fontSize: 11,
// //     fontWeight: "900",
// //     marginRight: 6,
// //   },

// //   statusBadge: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 7,
// //     height: 21,
// //     borderRadius: 7,
// //   },

// //   activeBadge: {
// //     backgroundColor: "#F1E9E3",
// //   },

// //   inactiveBadge: {
// //     backgroundColor: "#F2EEEE",
// //   },

// //   statusDot: {
// //     width: 5,
// //     height: 5,
// //     borderRadius: 3,
// //     marginRight: 4,
// //   },

// //   activeDot: {
// //     backgroundColor: "#7E243A",
// //   },

// //   inactiveDot: {
// //     backgroundColor: "#A4979B",
// //   },

// //   statusText: {
// //     fontSize: 5.5,
// //     fontWeight: "900",
// //   },

// //   activeText: {
// //     color: "#7E243A",
// //   },

// //   inactiveText: {
// //     color: "#8F8589",
// //   },

// //   specialization: {
// //     color: "#8E7F84",
// //     fontSize: 7,
// //     marginTop: 4,
// //   },

// //   phone: {
// //     color: "#A4979B",
// //     fontSize: 7,
// //     marginTop: 3,
// //   },

// //   cardDivider: {
// //     height: 1,
// //     backgroundColor: "#F0E8E5",
// //     marginTop: 11,
// //     marginBottom: 10,
// //   },

// //   /* INFO */

// //   infoRow: {
// //     flexDirection: "row",
// //     gap: 10,
// //   },

// //   infoItem: {
// //     flex: 1,
// //   },

// //   infoLabel: {
// //     color: "#A39599",
// //     fontSize: 5.5,
// //     fontWeight: "900",
// //     letterSpacing: 0.7,
// //   },

// //   infoValue: {
// //     color: "#403337",
// //     fontSize: 7,
// //     fontWeight: "700",
// //     marginTop: 3,
// //   },

// //   /* ACTIONS */

// //   actionRow: {
// //     flexDirection: "row",
// //     gap: 7,
// //     marginTop: 11,
// //   },

// //   statusButton: {
// //     flex: 1,
// //     height: 34,
// //     borderRadius: 9,
// //     backgroundColor: "#F8E9E6",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   statusButtonText: {
// //     color: "#7E243A",
// //     fontSize: 6.5,
// //     fontWeight: "900",
// //   },

// //   editButton: {
// //     flex: 0.65,
// //     height: 34,
// //     borderRadius: 9,
// //     backgroundColor: "#7E243A",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   editButtonText: {
// //     color: "#FFFFFF",
// //     fontSize: 6.5,
// //     fontWeight: "900",
// //   },

// //   deleteButton: {
// //     flex: 0.65,
// //     height: 34,
// //     borderRadius: 9,
// //     backgroundColor: "#FFF3F1",
// //     borderWidth: 1,
// //     borderColor: "#E8D8D5",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   deleteButtonText: {
// //     color: "#9B3A4D",
// //     fontSize: 6.5,
// //     fontWeight: "900",
// //   },

// //   /* EMPTY */

// //   emptyContainer: {
// //     flex: 1,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     paddingHorizontal: 35,
// //     minHeight: 280,
// //   },

// //   emptyIcon: {
// //     width: 62,
// //     height: 62,
// //     borderRadius: 20,
// //     backgroundColor: "#F8E9E6",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginBottom: 12,
// //   },

// //   emptyIconText: {
// //     color: "#7E243A",
// //     fontSize: 25,
// //     fontWeight: "900",
// //   },

// //   emptyTitle: {
// //     color: "#403337",
// //     fontSize: 13,
// //     fontWeight: "900",
// //   },

// //   emptySubtitle: {
// //     color: "#A4979B",
// //     fontSize: 7,
// //     textAlign: "center",
// //     lineHeight: 12,
// //     marginTop: 6,
// //   },

// //   emptyText: {
// //     color: "#8E7F84",
// //     fontSize: 8,
// //     marginTop: 9,
// //   },

// //   emptyAddButton: {
// //     marginTop: 14,
// //     backgroundColor: "#7E243A",
// //     height: 38,
// //     paddingHorizontal: 18,
// //     borderRadius: 11,
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   emptyAddButtonText: {
// //     color: "#FFFFFF",
// //     fontSize: 7,
// //     fontWeight: "900",
// //   },

// //   /* MODAL */

// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: "rgba(51,40,44,0.35)",
// //     justifyContent: "flex-end",
// //   },

// //   modalCard: {
// //     maxHeight: "92%",
// //     backgroundColor: "#F8F2EF",
// //     borderTopLeftRadius: 25,
// //     borderTopRightRadius: 25,
// //     paddingHorizontal: 16,
// //     paddingTop: 16,
// //   },

// //   modalHeader: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     marginBottom: 8,
// //   },

// //   modalEyebrow: {
// //     color: "#A39599",
// //     fontSize: 6,
// //     fontWeight: "900",
// //     letterSpacing: 1.1,
// //   },

// //   modalTitle: {
// //     color: "#33282C",
// //     fontSize: 19,
// //     fontWeight: "900",
// //     marginTop: 3,
// //   },

// //   modalClose: {
// //     width: 35,
// //     height: 35,
// //     borderRadius: 11,
// //     backgroundColor: "#FFFFFF",
// //     borderWidth: 1,
// //     borderColor: "#E8DCD8",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   modalCloseText: {
// //     color: "#7E243A",
// //     fontSize: 21,
// //     lineHeight: 22,
// //   },

// //   /* INPUTS */

// //   inputLabel: {
// //     color: "#8F7F85",
// //     fontSize: 6,
// //     fontWeight: "900",
// //     letterSpacing: 0.7,
// //     marginTop: 12,
// //     marginBottom: 5,
// //   },

// //   input: {
// //     height: 46,
// //     backgroundColor: "#FFFFFF",
// //     borderWidth: 1,
// //     borderColor: "#E8DCD8",
// //     borderRadius: 12,
// //     paddingHorizontal: 12,
// //     color: "#403337",
// //     fontSize: 9,
// //   },

// //   /* STATUS SELECTOR */

// //   statusSelector: {
// //     flexDirection: "row",
// //     gap: 8,
// //   },

// //   statusOption: {
// //     flex: 1,
// //     height: 42,
// //     borderRadius: 11,
// //     backgroundColor: "#FFFFFF",
// //     borderWidth: 1,
// //     borderColor: "#E8DCD8",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   statusOptionActive: {
// //     backgroundColor: "#7E243A",
// //     borderColor: "#7E243A",
// //   },

// //   statusOptionInactive: {
// //     backgroundColor: "#F1EAEA",
// //     borderColor: "#DCCDCF",
// //   },

// //   statusOptionText: {
// //     color: "#8F7F85",
// //     fontSize: 8,
// //     fontWeight: "800",
// //   },

// //   statusOptionTextActive: {
// //     color: "#FFFFFF",
// //   },

// //   statusOptionTextInactive: {
// //     color: "#7E243A",
// //   },

// //   /* MODAL BUTTONS */

// //   modalActions: {
// //     flexDirection: "row",
// //     gap: 8,
// //     marginTop: 18,
// //   },

// //   cancelButton: {
// //     flex: 1,
// //     height: 45,
// //     borderRadius: 12,
// //     backgroundColor: "#FFFFFF",
// //     borderWidth: 1,
// //     borderColor: "#E8DCD8",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   cancelButtonText: {
// //     color: "#7E243A",
// //     fontSize: 8,
// //     fontWeight: "900",
// //   },

// //   saveButton: {
// //     flex: 1.5,
// //     height: 45,
// //     borderRadius: 12,
// //     backgroundColor: "#7E243A",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },

// //   saveButtonText: {
// //     color: "#FFFFFF",
// //     fontSize: 8,
// //     fontWeight: "900",
// //   },

// //   disabledButton: {
// //     opacity: 0.65,
// //   },
// // });






// import React, {
//   useCallback,
//   useState,
// } from "react";

// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Pressable,
//   RefreshControl,
//   SafeAreaView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from "react-native";

// import {
//   router,
//   useFocusEffect,
// } from "expo-router";

// import { useDispatch, useSelector } from "react-redux";

// import {
//   fetchStylists,
//   deleteStylist,
//   type Stylist,
// } from "../../src/features/stylist/stylistSlice";

// type RootState = any;
// type AppDispatch = any;

// export default function StaffScreen() {
//   const dispatch = useDispatch<AppDispatch>();

//   const {
//     stylists = [],
//     loading = false,
//     error = null,
//   } = useSelector(
//     (state: RootState) =>
//       state.stylists || {}
//   );

//   const [search, setSearch] = useState("");
//   const [refreshing, setRefreshing] =
//     useState(false);

//   const loadStaff = useCallback(
//     async () => {
//       try {
//         await dispatch(
//           fetchStylists({
//             search: search.trim(),
//           })
//         ).unwrap();
//       } catch (err) {
//         console.log(
//           "LOAD STAFF ERROR:",
//           err
//         );
//       }
//     },
//     [dispatch, search]
//   );

//   useFocusEffect(
//     useCallback(() => {
//       loadStaff();
//     }, [loadStaff])
//   );

//   const handleRefresh = async () => {
//     try {
//       setRefreshing(true);
//       await loadStaff();
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const filteredStaff = stylists.filter(
//     (staff: Stylist) => {
//       const value =
//         search.trim().toLowerCase();

//       if (!value) return true;

//       return (
//         staff.name
//           ?.toLowerCase()
//           .includes(value) ||
//         staff.phone
//           ?.toLowerCase()
//           .includes(value) ||
//         staff.email
//           ?.toLowerCase()
//           .includes(value) ||
//         staff.specialization
//           ?.toLowerCase()
//           .includes(value)
//       );
//     }
//   );

//   const handleDelete = (
//     staff: Stylist
//   ) => {
//     Alert.alert(
//       "Delete Staff",
//       `Delete ${staff.name}?`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await dispatch(
//                 deleteStylist(staff._id)
//               ).unwrap();

//               await loadStaff();
//             } catch (err: any) {
//               Alert.alert(
//                 "Error",
//                 String(
//                   err ||
//                     "Failed to delete staff"
//                 )
//               );
//             }
//           },
//         },
//       ]
//     );
//   };

//   const renderStaff = ({
//     item,
//   }: {
//     item: Stylist;
//   }) => {
//     const initial =
//       item.name
//         ?.charAt(0)
//         ?.toUpperCase() || "S";

//     const active =
//       item.status === "ACTIVE";

//     return (
//       <Pressable
//         style={({ pressed }) => [
//           styles.staffCard,
//           pressed && {
//             opacity: 0.94,
//             transform: [
//               { scale: 0.99 },
//             ],
//           },
//         ]}
//         onPress={() =>
//           router.push(
//             `/staff/${item._id}`
//           )
//         }
//       >
//         <View style={styles.cardTop}>
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>
//               {initial}
//             </Text>
//           </View>

//           <View style={styles.mainInfo}>
//             <View style={styles.nameRow}>
//               <Text
//                 style={styles.name}
//                 numberOfLines={1}
//               >
//                 {item.name}
//               </Text>

//               <View
//                 style={[
//                   styles.statusBadge,
//                   active
//                     ? styles.activeBadge
//                     : styles.inactiveBadge,
//                 ]}
//               >
//                 <View
//                   style={[
//                     styles.statusDot,
//                     active
//                       ? styles.activeDot
//                       : styles.inactiveDot,
//                   ]}
//                 />

//                 <Text
//                   style={[
//                     styles.statusText,
//                     active
//                       ? styles.activeText
//                       : styles.inactiveText,
//                   ]}
//                 >
//                   {active
//                     ? "ACTIVE"
//                     : "INACTIVE"}
//                 </Text>
//               </View>
//             </View>

//             <Text
//               style={styles.specialization}
//               numberOfLines={1}
//             >
//               {item.specialization ||
//                 "Beauty Professional"}
//             </Text>

//             <Text style={styles.phone}>
//               {item.phone}
//             </Text>
//           </View>

//           <Text style={styles.arrow}>
//             ›
//           </Text>
//         </View>

//         <View style={styles.divider} />

//         <View style={styles.infoRow}>
//           <View style={styles.infoBlock}>
//             <Text style={styles.infoLabel}>
//               EXPERIENCE
//             </Text>

//             <Text style={styles.infoValue}>
//               {item.experience || 0}{" "}
//               {Number(item.experience) === 1
//                 ? "year"
//                 : "years"}
//             </Text>
//           </View>

//           <View style={styles.infoBlock}>
//             <Text style={styles.infoLabel}>
//               EMAIL
//             </Text>

//             <Text
//               style={styles.infoValue}
//               numberOfLines={1}
//             >
//               {item.email || "Not added"}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.bottomActions}>
//           <Pressable
//             style={styles.viewButton}
//             onPress={() =>
//               router.push(
//                 `/staff/${item._id}`
//               )
//             }
//           >
//             <Text style={styles.viewText}>
//               View Profile
//             </Text>
//           </Pressable>

//           <Pressable
//             style={styles.editButton}
//             onPress={() =>
//               router.push({
//                 pathname:
//                   "/staff/add",
//                 params: {
//                   id: item._id,
//                 },
//               })
//             }
//           >
//             <Text style={styles.editText}>
//               Edit
//             </Text>
//           </Pressable>

//           <Pressable
//             style={styles.deleteButton}
//             onPress={() =>
//               handleDelete(item)
//             }
//           >
//             <Text
//               style={styles.deleteText}
//             >
//               Delete
//             </Text>
//           </Pressable>
//         </View>
//       </Pressable>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="#F8F2EF"
//       />

//       <View style={styles.container}>
//         {/* HEADER */}
//         <View style={styles.header}>
//           <Pressable
//             style={styles.backButton}
//             onPress={() => router.back()}
//           >
//             <Text style={styles.back}>
//               ‹
//             </Text>
//           </Pressable>

//           <View style={styles.headerCenter}>
//             <Text style={styles.eyebrow}>
//               SALON TEAM
//             </Text>

//             <Text style={styles.title}>
//               Staff & Stylists
//             </Text>

//             <Text style={styles.subtitle}>
//               Manage your salon team
//             </Text>
//           </View>

//           <Pressable
//             style={styles.addButton}
//             onPress={() =>
//               router.push("/staff/add")
//             }
//           >
//             <Text style={styles.plus}>
//               +
//             </Text>

//             <Text style={styles.addText}>
//               Add
//             </Text>
//           </Pressable>
//         </View>

//         {/* SEARCH */}
//         <View style={styles.searchBox}>
//           <Text style={styles.searchIcon}>
//             ⌕
//           </Text>

//           <TextInput
//             value={search}
//             onChangeText={setSearch}
//             placeholder="Search name, phone or email..."
//             placeholderTextColor="#A4979B"
//             style={styles.searchInput}
//             autoCapitalize="none"
//           />

//           {search.length > 0 && (
//             <Pressable
//               onPress={() => setSearch("")}
//             >
//               <Text style={styles.clear}>
//                 ×
//               </Text>
//             </Pressable>
//           )}
//         </View>

//         {/* SUMMARY */}
//         <View style={styles.summaryRow}>
//           <View style={styles.summaryCard}>
//             <Text style={styles.summaryIcon}>
//               ♙
//             </Text>

//             <View>
//               <Text
//                 style={styles.summaryValue}
//               >
//                 {stylists.length}
//               </Text>

//               <Text
//                 style={styles.summaryLabel}
//               >
//                 Total Staff
//               </Text>
//             </View>
//           </View>

//           <View style={styles.summaryCard}>
//             <Text style={styles.summaryIcon}>
//               ✓
//             </Text>

//             <View>
//               <Text
//                 style={styles.summaryValue}
//               >
//                 {
//                   stylists.filter(
//                     (s: Stylist) =>
//                       s.status ===
//                       "ACTIVE"
//                   ).length
//                 }
//               </Text>

//               <Text
//                 style={styles.summaryLabel}
//               >
//                 Active
//               </Text>
//             </View>
//           </View>
//         </View>

//         {error && (
//           <Text style={styles.error}>
//             {String(error)}
//           </Text>
//         )}

//         {/* LIST */}
//         {loading &&
//         stylists.length === 0 ? (
//           <View style={styles.loader}>
//             <ActivityIndicator
//               size="large"
//               color="#7E243A"
//             />

//             <Text style={styles.loadingText}>
//               Loading staff...
//             </Text>
//           </View>
//         ) : (
//           <FlatList
//             data={filteredStaff}
//             keyExtractor={(item) =>
//               String(item._id)
//             }
//             renderItem={renderStaff}
//             showsVerticalScrollIndicator={
//               false
//             }
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={handleRefresh}
//                 tintColor="#7E243A"
//                 colors={["#7E243A"]}
//               />
//             }
//             contentContainerStyle={
//               styles.list
//             }
//             ListEmptyComponent={
//               <View
//                 style={
//                   styles.empty
//                 }
//               >
//                 <Text
//                   style={styles.emptyIcon}
//                 >
//                   ♙
//                 </Text>

//                 <Text
//                   style={
//                     styles.emptyTitle
//                   }
//                 >
//                   No Staff Found
//                 </Text>

//                 <Text
//                   style={
//                     styles.emptyText
//                   }
//                 >
//                   {search
//                     ? "Try another search."
//                     : "Add your first staff member."}
//                 </Text>

//                 {!search && (
//                   <Pressable
//                     style={
//                       styles.emptyButton
//                     }
//                     onPress={() =>
//                       router.push(
//                         "/staff/add"
//                       )
//                     }
//                   >
//                     <Text
//                       style={
//                         styles.emptyButtonText
//                       }
//                     >
//                       + Add Staff
//                     </Text>
//                   </Pressable>
//                 )}
//               </View>
//             }
//           />
//         )}
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: "#F8F2EF",
//   },

//   container: {
//     flex: 1,
//     paddingHorizontal: 18,
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingTop: 46,
//     paddingBottom: 18,
//   },

//   backButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//     backgroundColor: "#FFFFFF",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },

//   back: {
//     fontSize: 32,
//     color: "#4B2933",
//     marginTop: -4,
//   },

//   headerCenter: {
//     flex: 1,
//   },

//   eyebrow: {
//     fontSize: 10,
//     fontWeight: "800",
//     letterSpacing: 1.5,
//     color: "#9A6B78",
//   },

//   title: {
//     fontSize: 23,
//     fontWeight: "800",
//     color: "#3B252C",
//     marginTop: 2,
//   },

//   subtitle: {
//     fontSize: 12,
//     color: "#907D83",
//     marginTop: 2,
//   },

//   addButton: {
//     backgroundColor: "#7E243A",
//     height: 44,
//     paddingHorizontal: 14,
//     borderRadius: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//   },

//   plus: {
//     color: "#FFFFFF",
//     fontSize: 21,
//     fontWeight: "700",
//   },

//   addText: {
//     color: "#FFFFFF",
//     fontSize: 13,
//     fontWeight: "800",
//   },

//   searchBox: {
//     height: 52,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#EDE1DE",
//     marginBottom: 14,
//   },

//   searchIcon: {
//     fontSize: 24,
//     color: "#7E243A",
//     marginRight: 8,
//   },

//   searchInput: {
//     flex: 1,
//     color: "#38262D",
//     fontSize: 14,
//   },

//   clear: {
//     fontSize: 25,
//     color: "#9C8C91",
//     paddingHorizontal: 5,
//   },

//   summaryRow: {
//     flexDirection: "row",
//     gap: 12,
//     marginBottom: 15,
//   },

//   summaryCard: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 18,
//     padding: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     borderWidth: 1,
//     borderColor: "#EDE1DE",
//   },

//   summaryIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 13,
//     backgroundColor: "#F5E7EB",
//     color: "#7E243A",
//     textAlign: "center",
//     textAlignVertical: "center",
//     fontSize: 20,
//     fontWeight: "700",
//   },

//   summaryValue: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#3B252C",
//   },

//   summaryLabel: {
//     fontSize: 11,
//     color: "#94848A",
//     marginTop: 1,
//   },

//   list: {
//     paddingBottom: 30,
//   },

//   staffCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 22,
//     padding: 16,
//     marginBottom: 13,
//     borderWidth: 1,
//     borderColor: "#EEE3E0",
//   },

//   cardTop: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   avatar: {
//     width: 56,
//     height: 56,
//     borderRadius: 18,
//     backgroundColor: "#7E243A",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 13,
//   },

//   avatarText: {
//     color: "#FFFFFF",
//     fontSize: 23,
//     fontWeight: "800",
//   },

//   mainInfo: {
//     flex: 1,
//   },

//   nameRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   name: {
//     flex: 1,
//     fontSize: 17,
//     fontWeight: "800",
//     color: "#35252B",
//   },

//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 10,
//     marginLeft: 6,
//   },

//   activeBadge: {
//     backgroundColor: "#EAF7EF",
//   },

//   inactiveBadge: {
//     backgroundColor: "#F8EAEA",
//   },

//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 5,
//   },

//   activeDot: {
//     backgroundColor: "#269B55",
//   },

//   inactiveDot: {
//     backgroundColor: "#C14C4C",
//   },

//   statusText: {
//     fontSize: 8,
//     fontWeight: "900",
//   },

//   activeText: {
//     color: "#25834A",
//   },

//   inactiveText: {
//     color: "#A13D3D",
//   },

//   specialization: {
//     color: "#7E243A",
//     fontSize: 12,
//     fontWeight: "700",
//     marginTop: 4,
//   },

//   phone: {
//     color: "#918187",
//     fontSize: 12,
//     marginTop: 3,
//   },

//   arrow: {
//     fontSize: 30,
//     color: "#B8A7AD",
//     marginLeft: 5,
//   },

//   divider: {
//     height: 1,
//     backgroundColor: "#F0E8E6",
//     marginVertical: 14,
//   },

//   infoRow: {
//     flexDirection: "row",
//     gap: 15,
//   },

//   infoBlock: {
//     flex: 1,
//   },

//   infoLabel: {
//     fontSize: 9,
//     fontWeight: "800",
//     color: "#A39499",
//     letterSpacing: 0.8,
//   },

//   infoValue: {
//     fontSize: 12,
//     color: "#4B3940",
//     fontWeight: "600",
//     marginTop: 4,
//   },

//   bottomActions: {
//     flexDirection: "row",
//     marginTop: 15,
//     gap: 8,
//   },

//   viewButton: {
//     flex: 1.4,
//     height: 39,
//     borderRadius: 12,
//     backgroundColor: "#F5E7EB",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   viewText: {
//     color: "#7E243A",
//     fontSize: 12,
//     fontWeight: "800",
//   },

//   editButton: {
//     flex: 0.7,
//     height: 39,
//     borderRadius: 12,
//     backgroundColor: "#F6F2F0",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   editText: {
//     color: "#57454C",
//     fontSize: 12,
//     fontWeight: "800",
//   },

//   deleteButton: {
//     flex: 0.8,
//     height: 39,
//     borderRadius: 12,
//     backgroundColor: "#FBECEC",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   deleteText: {
//     color: "#B23B3B",
//     fontSize: 12,
//     fontWeight: "800",
//   },

//   loader: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   loadingText: {
//     marginTop: 10,
//     color: "#806F76",
//   },

//   error: {
//     color: "#B23B3B",
//     fontSize: 12,
//     marginBottom: 8,
//   },

//   empty: {
//     alignItems: "center",
//     paddingTop: 70,
//     paddingHorizontal: 30,
//   },

//   emptyIcon: {
//     fontSize: 44,
//     color: "#7E243A",
//   },

//   emptyTitle: {
//     fontSize: 19,
//     fontWeight: "800",
//     color: "#3B252C",
//     marginTop: 12,
//   },

//   emptyText: {
//     fontSize: 13,
//     color: "#928188",
//     textAlign: "center",
//     marginTop: 6,
//   },

//   emptyButton: {
//     backgroundColor: "#7E243A",
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 13,
//     marginTop: 18,
//   },

//   emptyButtonText: {
//     color: "#FFFFFF",
//     fontWeight: "800",
//   },
// });














import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchStylists,
  deleteStylist,
  updateStylist,
  type Stylist,
} from "../../src/features/stylist/stylistSlice";

type RootState = any;
type AppDispatch = any;

export default function StaffScreen() {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    stylists = [],
    loading = false,
    deleting = false,
    error = null,
  } = useSelector(
    (state: RootState) =>
      state.stylists || {}
  );

  const [search, setSearch] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  const loadStaff = useCallback(
    async () => {
      try {
        await dispatch(
          fetchStylists({
            search: search.trim(),
          })
        ).unwrap();
      } catch (err) {
        console.log(
          "LOAD STAFF ERROR:",
          err
        );
      }
    },
    [dispatch, search]
  );

  useFocusEffect(
    useCallback(() => {
      loadStaff();
    }, [loadStaff])
  );

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadStaff();
    } finally {
      setRefreshing(false);
    }
  };

  const displayedStaff =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return stylists;
      }

      return stylists.filter(
        (staff: Stylist) =>
          staff.name
            ?.toLowerCase()
            .includes(value) ||
          staff.phone
            ?.toLowerCase()
            .includes(value) ||
          staff.email
            ?.toLowerCase()
            .includes(value) ||
          staff.specialization
            ?.toLowerCase()
            .includes(value)
      );
    }, [stylists, search]);

  const confirmDelete = (
    staff: Stylist
  ) => {
    Alert.alert(
      "Delete Staff",
      `Are you sure you want to delete ${staff.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(
                deleteStylist(staff._id)
              ).unwrap();

              await loadStaff();
            } catch (err: any) {
              Alert.alert(
                "Error",
                String(
                  err ||
                    "Failed to delete staff"
                )
              );
            }
          },
        },
      ]
    );
  };

  const toggleStatus = (
    staff: Stylist
  ) => {
    const newStatus =
      staff.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    Alert.alert(
      newStatus === "ACTIVE"
        ? "Activate Staff"
        : "Deactivate Staff",
      `${staff.name} will be marked ${newStatus.toLowerCase()}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await dispatch(
                updateStylist({
                  id: staff._id,
                  status: newStatus,
                })
              ).unwrap();

              await loadStaff();
            } catch (err: any) {
              Alert.alert(
                "Error",
                String(
                  err ||
                    "Failed to update status"
                )
              );
            }
          },
        },
      ]
    );
  };

  const renderStaff = ({
    item,
  }: {
    item: Stylist;
  }) => {
    const active =
      item.status === "ACTIVE";

    const initial =
      item.name
        ?.charAt(0)
        ?.toUpperCase() || "S";

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && {
            opacity: 0.94,
          },
        ]}
        onPress={() =>
          router.push(
            `/staff/${item._id}`
          )
        }
      >
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initial}
            </Text>
          </View>

          <View style={styles.main}>
            <View style={styles.nameRow}>
              <Text
                style={styles.name}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <View
                style={[
                  styles.badge,
                  active
                    ? styles.activeBadge
                    : styles.inactiveBadge,
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    active
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />

                <Text
                  style={[
                    styles.badgeText,
                    active
                      ? styles.activeText
                      : styles.inactiveText,
                  ]}
                >
                  {active
                    ? "ACTIVE"
                    : "INACTIVE"}
                </Text>
              </View>
            </View>

            <Text
              style={styles.specialization}
            >
              {item.specialization ||
                "Beauty Professional"}
            </Text>

            <Text style={styles.phone}>
              {item.phone}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.salaryRow}>
          <View>
            <Text style={styles.smallLabel}>
              MONTHLY
            </Text>

            <Text style={styles.salary}>
              ₹
              {Number(
                item.monthlySalary || 0
              ).toLocaleString("en-IN")}
            </Text>
          </View>

          <View>
            <Text style={styles.smallLabel}>
              8H BASIC
            </Text>

            <Text style={styles.salary}>
              ₹
              {Number(
                item.basicSalary8h || 0
              ).toLocaleString("en-IN")}
            </Text>
          </View>

          <View>
            <Text style={styles.smallLabel}>
              OT / HOUR
            </Text>

            <Text style={styles.salary}>
              ₹
              {Number(
                item.overtimeRatePerHour ||
                  0
              ).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actions}>
          <Pressable
            style={styles.viewButton}
            onPress={() =>
              router.push(
                `/staff/${item._id}`
              )
            }
          >
            <Text style={styles.viewText}>
              View Profile
            </Text>
          </Pressable>

          <Pressable
            style={styles.editButton}
            onPress={() =>
              router.push(
                `/staff/add?id=${item._id}`
              )
            }
          >
            <Text style={styles.editText}>
              Edit
            </Text>
          </Pressable>

          <Pressable
            style={styles.statusButton}
            onPress={() =>
              toggleStatus(item)
            }
          >
            <Text style={styles.statusButtonText}>
              {active
                ? "Deactivate"
                : "Activate"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            disabled={deleting}
            onPress={() =>
              confirmDelete(item)
            }
          >
            <Text
              style={
                styles.deleteButtonText
              }
            >
              Delete
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F2EF"
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            SALON TEAM
          </Text>

          <Text style={styles.title}>
            Staff & Stylists
          </Text>

          <Text style={styles.subtitle}>
            Manage staff, salary and attendance
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            router.push("/staff/add")
          }
        >
          <Text style={styles.addPlus}>
            +
          </Text>

          <Text style={styles.addText}>
            Add Staff
          </Text>
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>
          ⌕
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, phone or email..."
          placeholderTextColor="#9B8F94"
          style={styles.searchInput}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() =>
              setSearch("")
            }
          >
            <Text style={styles.clear}>
              ×
            </Text>
          </Pressable>
        )}
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {String(error)}
          </Text>
        </View>
      )}

      <FlatList
        data={displayedStaff}
        keyExtractor={(item) =>
          item._id
        }
        renderItem={renderStaff}
        contentContainerStyle={
          styles.list
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#7E243A"]}
            tintColor="#7E243A"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <>
                <ActivityIndicator
                  size="large"
                  color="#7E243A"
                />

                <Text style={styles.emptyText}>
                  Loading staff...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyIcon}>
                  ♙
                </Text>

                <Text style={styles.emptyTitle}>
                  No Staff Found
                </Text>

                <Text style={styles.emptyText}>
                  {search
                    ? "Try another search."
                    : "Add your first staff member."}
                </Text>

                {!search && (
                  <Pressable
                    style={styles.emptyButton}
                    onPress={() =>
                      router.push(
                        "/staff/add"
                      )
                    }
                  >
                    <Text
                      style={
                        styles.emptyButtonText
                      }
                    >
                      + Add Staff
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F2EF",
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#9A6B78",
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#38252C",
    marginTop: 2,
  },

  subtitle: {
    color: "#887980",
    fontSize: 12,
    marginTop: 3,
  },

  addButton: {
    backgroundColor: "#7E243A",
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  addPlus: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginRight: 4,
  },

  addText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  searchBox: {
    marginHorizontal: 18,
    marginBottom: 12,
    height: 49,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8DCDA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  searchIcon: {
    fontSize: 22,
    color: "#7E243A",
    marginRight: 7,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#3D2930",
  },

  clear: {
    fontSize: 25,
    color: "#8C7B82",
  },

  errorBox: {
    marginHorizontal: 18,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#E5BDBD",
  },

  errorText: {
    color: "#9D3434",
    fontSize: 12,
    fontWeight: "600",
  },

  list: {
    paddingHorizontal: 18,
    paddingBottom: 35,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#EEE3E0",
  },

  cardTop: {
    flexDirection: "row",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#F5E5EA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#7E243A",
    fontSize: 24,
    fontWeight: "900",
  },

  main: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    flex: 1,
    color: "#39282E",
    fontSize: 17,
    fontWeight: "900",
    marginRight: 7,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#EAF7EF",
  },

  inactiveBadge: {
    backgroundColor: "#F4EAEA",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  activeDot: {
    backgroundColor: "#2F9B57",
  },

  inactiveDot: {
    backgroundColor: "#A45B5B",
  },

  badgeText: {
    fontSize: 8,
    fontWeight: "900",
  },

  activeText: {
    color: "#2F8050",
  },

  inactiveText: {
    color: "#955151",
  },

  specialization: {
    color: "#7E243A",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },

  phone: {
    color: "#81737A",
    fontSize: 12,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#F0E8E6",
    marginVertical: 14,
  },

  salaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  smallLabel: {
    fontSize: 8,
    color: "#A09298",
    fontWeight: "900",
    marginBottom: 3,
  },

  salary: {
    color: "#4B2933",
    fontSize: 13,
    fontWeight: "900",
  },

  actions: {
    flexDirection: "row",
    gap: 7,
  },

  viewButton: {
    flex: 1,
    backgroundColor: "#7E243A",
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: "center",
  },

  viewText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  editButton: {
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#F5E7EB",
  },

  editText: {
    color: "#7E243A",
    fontSize: 10,
    fontWeight: "800",
  },

  statusButton: {
    paddingHorizontal: 9,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#F2EEE9",
  },

  statusButtonText: {
    color: "#62545A",
    fontSize: 9,
    fontWeight: "800",
  },

  deleteButton: {
    paddingHorizontal: 9,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#FFF0F0",
  },

  deleteButtonText: {
    color: "#A33F3F",
    fontSize: 9,
    fontWeight: "800",
  },

  empty: {
    paddingTop: 80,
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 42,
    color: "#7E243A",
  },

  emptyTitle: {
    color: "#3D2930",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 12,
  },

  emptyText: {
    color: "#8C7E84",
    fontSize: 12,
    marginTop: 7,
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: "#7E243A",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 13,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});