


// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
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

// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";

// import { useDispatch, useSelector } from "react-redux";

// import type {
//   AppDispatch,
//   RootState,
// } from "../../src/store";

// import {
//   deleteProduct,
//   getProductSummary,
//   getProducts,
//   selectProductSummary,
//   selectProducts,
//   selectProductLoading,
//   selectProductSummaryLoading,
// } from "../../src/features/product/productSlice";

// import type {
//   Product,
// } from "../../src/features/product/productSlice";


// // ============================================================
// // COZ`E SALON THEME
// // ============================================================

// const COLORS = {
//   background: "#F8F2EF",
//   card: "#FFFFFF",

//   primary: "#8A243B",
//   primaryDark: "#702038",
//   primarySoft: "#F8E8E6",
//   primaryVerySoft: "#FFF7F5",

//   text: "#33282C",
//   textDark: "#403337",
//   textMuted: "#95868B",
//   textLight: "#A4979B",

//   border: "#E7DAD7",
//   divider: "#EFE5E2",

//   success: "#2E8B57",
//   successSoft: "#EAF6EF",

//   warning: "#C77700",
//   warningSoft: "#FFF4E3",

//   danger: "#C0392B",
//   dangerSoft: "#FDECEA",

//   white: "#FFFFFF",
// };


// // ============================================================
// // SCREEN
// // ============================================================

// export default function ProductsScreen() {
//   const dispatch =
//     useDispatch<AppDispatch>();

//   // ==========================================================
//   // REDUX
//   // ==========================================================

//   const products =
//     useSelector(selectProducts);

//   const summary =
//     useSelector(selectProductSummary);

//   const loading =
//     useSelector(selectProductLoading);

//   const summaryLoading =
//     useSelector(
//       selectProductSummaryLoading
//     );

//   // ==========================================================
//   // LOCAL STATE
//   // ==========================================================

//   const [search, setSearch] =
//     useState("");

//   const [selectedCategory, setSelectedCategory] =
//     useState<string>("All");

//   const [refreshing, setRefreshing] =
//     useState(false);

//   // ==========================================================
//   // LOAD DATA
//   // ==========================================================

//   const loadData = useCallback(
//     async () => {
//       await Promise.all([
//         dispatch(
//           getProducts({
//             active: true,
//           })
//         ),
//         dispatch(
//           getProductSummary()
//         ),
//       ]);
//     },
//     [dispatch]
//   );

//   useEffect(() => {
//     loadData();
//   }, [loadData]);

//   // ==========================================================
//   // REFRESH
//   // ==========================================================

//   const onRefresh = useCallback(
//     async () => {
//       setRefreshing(true);

//       try {
//         await loadData();
//       } finally {
//         setRefreshing(false);
//       }
//     },
//     [loadData]
//   );

//   // ==========================================================
//   // CATEGORIES
//   // ==========================================================

//   const categories = useMemo(() => {
//     const values =
//       products
//         .map(
//           (product) =>
//             product.category
//         )
//         .filter(Boolean);

//     return [
//       "All",
//       ...Array.from(
//         new Set(values)
//       ),
//     ];
//   }, [products]);

//   // ==========================================================
//   // FILTER PRODUCTS
//   // ==========================================================

//   const filteredProducts =
//     useMemo(() => {
//       const searchValue =
//         search
//           .trim()
//           .toLowerCase();

//       return products.filter(
//         (product) => {
//           const matchesSearch =
//             !searchValue ||
//             product.name
//               .toLowerCase()
//               .includes(searchValue) ||
//             product.brand
//               ?.toLowerCase()
//               .includes(searchValue) ||
//             product.category
//               ?.toLowerCase()
//               .includes(searchValue) ||
//             product.vendor
//               ?.toLowerCase()
//               .includes(searchValue);

//           const matchesCategory =
//             selectedCategory ===
//               "All" ||
//             product.category ===
//               selectedCategory;

//           return (
//             matchesSearch &&
//             matchesCategory
//           );
//         }
//       );
//     }, [
//       products,
//       search,
//       selectedCategory,
//     ]);

//   // ==========================================================
//   // DELETE
//   // ==========================================================

//   const handleDelete = (
//     product: Product
//   ) => {
//     Alert.alert(
//       "Remove Product",
//       `Are you sure you want to remove "${product.name}"?`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Remove",
//           style: "destructive",
//           onPress: async () => {
//             const result =
//               await dispatch(
//                 deleteProduct(
//                   product._id
//                 )
//               );

//             if (
//               deleteProduct.fulfilled.match(
//                 result
//               )
//             ) {
//               dispatch(
//                 getProductSummary()
//               );
//             } else {
//               Alert.alert(
//                 "Error",
//                 "Failed to remove product."
//               );
//             }
//           },
//         },
//       ]
//     );
//   };

//   // ==========================================================
//   // STOCK STATUS
//   // ==========================================================

//   const getStockStatus = (
//     product: Product
//   ) => {
//     if (
//       product.currentStock === 0
//     ) {
//       return "Out of Stock";
//     }

//     if (
//       product.minimumStock > 0 &&
//       product.currentStock <=
//         product.minimumStock
//     ) {
//       return "Low Stock";
//     }

//     return "In Stock";
//   };

//   // ==========================================================
//   // STOCK ICON
//   // ==========================================================

//   const getStockIcon = (
//     product: Product
//   ) => {
//     const status =
//       getStockStatus(product);

//     if (
//       status === "Out of Stock"
//     ) {
//       return "close-circle";
//     }

//     if (
//       status === "Low Stock"
//     ) {
//       return "warning";
//     }

//     return "checkmark-circle";
//   };

//   // ==========================================================
//   // STOCK COLOR
//   // ==========================================================

//   const getStockColor = (
//     product: Product
//   ) => {
//     const status =
//       getStockStatus(product);

//     if (
//       status === "Out of Stock"
//     ) {
//       return COLORS.danger;
//     }

//     if (
//       status === "Low Stock"
//     ) {
//       return COLORS.warning;
//     }

//     return COLORS.success;
//   };

//   const getStockBackground = (
//     product: Product
//   ) => {
//     const status =
//       getStockStatus(product);

//     if (
//       status === "Out of Stock"
//     ) {
//       return COLORS.dangerSoft;
//     }

//     if (
//       status === "Low Stock"
//     ) {
//       return COLORS.warningSoft;
//     }

//     return COLORS.successSoft;
//   };

//   // ==========================================================
//   // PRODUCT CARD
//   // ==========================================================

//   const renderProduct = ({
//     item,
//   }: {
//     item: Product;
//   }) => {
//     const status =
//       getStockStatus(item);

//     const stockColor =
//       getStockColor(item);

//     return (
//       <View
//         style={styles.productCard}
//       >
//         {/* PRODUCT ICON */}

//         <View
//           style={styles.productIcon}
//         >
//           <Ionicons
//             name="cube-outline"
//             size={25}
//             color={COLORS.primary}
//           />
//         </View>

//         {/* CONTENT */}

//         <View
//           style={styles.productContent}
//         >
//           {/* TOP */}

//           <View
//             style={
//               styles.productTopRow
//             }
//           >
//             <View
//               style={{
//                 flex: 1,
//               }}
//             >
//               <Text
//                 style={
//                   styles.productName
//                 }
//                 numberOfLines={1}
//               >
//                 {item.name}
//               </Text>

//               {!!item.brand && (
//                 <Text
//                   style={
//                     styles.productBrand
//                   }
//                   numberOfLines={1}
//                 >
//                   {item.brand}
//                 </Text>
//               )}
//             </View>

//             {/* STOCK */}

//             <View
//               style={[
//                 styles.stockBadge,
//                 {
//                   backgroundColor:
//                     getStockBackground(
//                       item
//                     ),
//                 },
//               ]}
//             >
//               <Ionicons
//                 name={
//                   getStockIcon(
//                     item
//                   ) as any
//                 }
//                 size={13}
//                 color={stockColor}
//               />

//               <Text
//                 style={[
//                   styles.stockBadgeText,
//                   {
//                     color:
//                       stockColor,
//                   },
//                 ]}
//               >
//                 {status}
//               </Text>
//             </View>
//           </View>

//           {/* INFORMATION */}

//           <View
//             style={
//               styles.infoRow
//             }
//           >
//             <View
//               style={
//                 styles.infoItem
//               }
//             >
//               <Ionicons
//                 name="pricetag-outline"
//                 size={14}
//                 color={
//                   COLORS.primary
//                 }
//               />

//               <Text
//                 style={
//                   styles.infoText
//                 }
//               >
//                 {item.category}
//               </Text>
//             </View>

//             <View
//               style={
//                 styles.infoItem
//               }
//             >
//               <Ionicons
//                 name="layers-outline"
//                 size={14}
//                 color={
//                   COLORS.primary
//                 }
//               />

//               <Text
//                 style={
//                   styles.infoText
//                 }
//               >
//                 {item.currentStock}{" "}
//                 {item.unit}
//               </Text>
//             </View>
//           </View>

//           {/* BOTTOM */}

//           <View
//             style={
//               styles.productBottomRow
//             }
//           >
//             <View>
//               <Text
//                 style={
//                   styles.smallLabel
//                 }
//               >
//                 Purchase Price
//               </Text>

//               <Text
//                 style={
//                   styles.priceText
//                 }
//               >
//                 ₹
//                 {Number(
//                   item.purchasePrice ||
//                     0
//                 ).toLocaleString(
//                   "en-IN"
//                 )}
//               </Text>
//             </View>

//             {/* ACTIONS */}

//             <View
//               style={
//                 styles.actionButtons
//               }
//             >
//               {/* EDIT */}

//               <Pressable
//                 style={
//                   styles.actionButton
//                 }
//                 onPress={() =>
//                   router.push(
//                     `/products/edit?id=${item._id}`
//                   )
//                 }
//               >
//                 <Ionicons
//                   name="create-outline"
//                   size={19}
//                   color={
//                     COLORS.primary
//                   }
//                 />
//               </Pressable>

//               {/* DELETE */}

//               <Pressable
//                 style={[
//                   styles.actionButton,
//                   styles.deleteButton,
//                 ]}
//                 onPress={() =>
//                   handleDelete(
//                     item
//                   )
//                 }
//               >
//                 <Ionicons
//                   name="trash-outline"
//                   size={18}
//                   color={
//                     COLORS.danger
//                   }
//                 />
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   // ==========================================================
//   // EMPTY
//   // ==========================================================

//   const renderEmpty = () => {
//     if (loading) {
//       return (
//         <View
//           style={
//             styles.emptyContainer
//           }
//         >
//           <ActivityIndicator
//             size="large"
//             color={
//               COLORS.primary
//             }
//           />

//           <Text
//             style={
//               styles.emptyText
//             }
//           >
//             Loading products...
//           </Text>
//         </View>
//       );
//     }

//     return (
//       <View
//         style={
//           styles.emptyContainer
//         }
//       >
//         <View
//           style={
//             styles.emptyIcon
//           }
//         >
//           <Ionicons
//             name="cube-outline"
//             size={38}
//             color={
//               COLORS.primary
//             }
//           />
//         </View>

//         <Text
//           style={
//             styles.emptyTitle
//           }
//         >
//           No Products Found
//         </Text>

//         <Text
//           style={
//             styles.emptyText
//           }
//         >
//           Add your salon products
//           to start managing
//           inventory.
//         </Text>

//         <Pressable
//           style={
//             styles.emptyButton
//           }
//           onPress={() =>
//             router.push(
//               "/products/add"
//             )
//           }
//         >
//           <Ionicons
//             name="add"
//             size={19}
//             color={
//               COLORS.white
//             }
//           />

//           <Text
//             style={
//               styles.emptyButtonText
//             }
//           >
//             Add Product
//           </Text>
//         </Pressable>
//       </View>
//     );
//   };

//   // ==========================================================
//   // UI
//   // ==========================================================

//   return (
//     <SafeAreaView
//       style={styles.safeArea}
//     >
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor={
//           COLORS.background
//         }
//       />

//       <View
//         style={styles.container}
//       >
//         {/* HEADER */}

//         <View
//           style={styles.header}
//         >
//           <View
//             style={
//               styles.headerTextContainer
//             }
//           >
//             <Text
//               style={
//                 styles.headerEyebrow
//               }
//             >
//               COZ`E SALON
//             </Text>

//             <Text
//               style={
//                 styles.headerTitle
//               }
//             >
//               Products
//             </Text>

//             <Text
//               style={
//                 styles.headerSubtitle
//               }
//             >
//               Manage salon inventory
//               & stock
//             </Text>
//           </View>

//           <Pressable
//             style={
//               styles.addButton
//             }
//             onPress={() =>
//               router.push(
//                 "/products/add"
//               )
//             }
//           >
//             <Ionicons
//               name="add"
//               size={20}
//               color={
//                 COLORS.white
//               }
//             />

//             <Text
//               style={
//                 styles.addButtonText
//               }
//             >
//               Add
//             </Text>
//           </Pressable>
//         </View>

//         {/* SUMMARY */}

//         <View
//           style={
//             styles.summaryGrid
//           }
//         >
//           {/* TOTAL */}

//           <View
//             style={
//               styles.summaryCard
//             }
//           >
//             <View
//               style={[
//                 styles.summaryIcon,
//                 {
//                   backgroundColor:
//                     COLORS.primarySoft,
//                 },
//               ]}
//             >
//               <Ionicons
//                 name="cube-outline"
//                 size={22}
//                 color={
//                   COLORS.primary
//                 }
//               />
//             </View>

//             <Text
//               style={
//                 styles.summaryValue
//               }
//             >
//               {summaryLoading
//                 ? "..."
//                 : summary.totalProducts}
//             </Text>

//             <Text
//               style={
//                 styles.summaryLabel
//               }
//             >
//               Total Products
//             </Text>
//           </View>

//           {/* LOW STOCK */}

//           <View
//             style={
//               styles.summaryCard
//             }
//           >
//             <View
//               style={[
//                 styles.summaryIcon,
//                 {
//                   backgroundColor:
//                     COLORS.warningSoft,
//                 },
//               ]}
//             >
//               <Ionicons
//                 name="warning-outline"
//                 size={22}
//                 color={
//                   COLORS.warning
//                 }
//               />
//             </View>

//             <Text
//               style={
//                 styles.summaryValue
//               }
//             >
//               {summaryLoading
//                 ? "..."
//                 : summary.lowStock}
//             </Text>

//             <Text
//               style={
//                 styles.summaryLabel
//               }
//             >
//               Low Stock
//             </Text>
//           </View>

//           {/* OUT OF STOCK */}

//           <View
//             style={
//               styles.summaryCard
//             }
//           >
//             <View
//               style={[
//                 styles.summaryIcon,
//                 {
//                   backgroundColor:
//                     COLORS.dangerSoft,
//                 },
//               ]}
//             >
//               <Ionicons
//                 name="close-circle-outline"
//                 size={22}
//                 color={
//                   COLORS.danger
//                 }
//               />
//             </View>

//             <Text
//               style={
//                 styles.summaryValue
//               }
//             >
//               {summaryLoading
//                 ? "..."
//                 : summary.outOfStock}
//             </Text>

//             <Text
//               style={
//                 styles.summaryLabel
//               }
//             >
//               Out of Stock
//             </Text>
//           </View>
//         </View>

//         {/* STOCK VALUE */}

//         <View
//           style={
//             styles.valueCard
//           }
//         >
//           <View
//             style={
//               styles.valueIcon
//             }
//           >
//             <Ionicons
//               name="wallet-outline"
//               size={25}
//               color={
//                 COLORS.primary
//               }
//             />
//           </View>

//           <View
//             style={{
//               flex: 1,
//             }}
//           >
//             <Text
//               style={
//                 styles.valueLabel
//               }
//             >
//               Total Stock Value
//             </Text>

//             <Text
//               style={
//                 styles.valueAmount
//               }
//             >
//               ₹
//               {Number(
//                 summary.totalStockValue ||
//                   0
//               ).toLocaleString(
//                 "en-IN"
//               )}
//             </Text>
//           </View>

//           <View
//             style={
//               styles.valueRight
//             }
//           >
//             <Ionicons
//               name="trending-up-outline"
//               size={18}
//               color={
//                 COLORS.primary
//               }
//             />
//           </View>
//         </View>

//         {/* SEARCH */}

//         <View
//           style={
//             styles.searchContainer
//           }
//         >
//           <View
//             style={
//               styles.searchIconBox
//             }
//           >
//             <Ionicons
//               name="search-outline"
//               size={18}
//               color={
//                 COLORS.primary
//               }
//             />
//           </View>

//           <TextInput
//             value={search}
//             onChangeText={
//               setSearch
//             }
//             placeholder="Search products, brand or vendor..."
//             placeholderTextColor={
//               COLORS.textLight
//             }
//             style={
//               styles.searchInput
//             }
//           />

//           {search.length > 0 && (
//             <Pressable
//               onPress={() =>
//                 setSearch("")
//               }
//               style={
//                 styles.clearSearch
//               }
//             >
//               <Ionicons
//                 name="close-circle"
//                 size={19}
//                 color={
//                   COLORS.textLight
//                 }
//               />
//             </Pressable>
//           )}
//         </View>

//         {/* CATEGORY FILTER */}

//         <View
//           style={
//             styles.categoryWrapper
//           }
//         >
//           <FlatList
//             horizontal
//             showsHorizontalScrollIndicator={
//               false
//             }
//             data={categories}
//             keyExtractor={(item) =>
//               item
//             }
//             contentContainerStyle={
//               styles.categoryList
//             }
//             renderItem={({
//               item,
//             }) => {
//               const active =
//                 selectedCategory ===
//                 item;

//               return (
//                 <Pressable
//                   style={[
//                     styles.categoryChip,
//                     active &&
//                       styles.activeCategoryChip,
//                   ]}
//                   onPress={() =>
//                     setSelectedCategory(
//                       item
//                     )
//                   }
//                 >
//                   <Text
//                     style={[
//                       styles.categoryText,
//                       active &&
//                         styles.activeCategoryText,
//                     ]}
//                   >
//                     {item}
//                   </Text>
//                 </Pressable>
//               );
//             }}
//           />
//         </View>

//         {/* LIST HEADER */}

//         <View
//           style={
//             styles.listHeader
//           }
//         >
//           <View>
//             <Text
//               style={
//                 styles.listTitle
//               }
//             >
//               Inventory
//             </Text>

//             <Text
//               style={
//                 styles.listSubtitle
//               }
//             >
//               Salon products & stock
//             </Text>
//           </View>

//           <View
//             style={
//               styles.listCountBadge
//             }
//           >
//             <Text
//               style={
//                 styles.listCount
//               }
//             >
//               {filteredProducts.length}{" "}
//               {filteredProducts.length ===
//               1
//                 ? "product"
//                 : "products"}
//             </Text>
//           </View>
//         </View>

//         {/* PRODUCTS */}

//         <FlatList
//           data={
//             filteredProducts
//           }
//           keyExtractor={(item) =>
//             item._id
//           }
//           renderItem={
//             renderProduct
//           }
//           ListEmptyComponent={
//             renderEmpty
//           }
//           showsVerticalScrollIndicator={
//             false
//           }
//           contentContainerStyle={
//             filteredProducts.length ===
//             0
//               ? styles.emptyList
//               : styles.productList
//           }
//           refreshControl={
//             <RefreshControl
//               refreshing={
//                 refreshing
//               }
//               onRefresh={
//                 onRefresh
//               }
//               tintColor={
//                 COLORS.primary
//               }
//               colors={[
//                 COLORS.primary,
//               ]}
//             />
//           }
//         />
//       </View>
//     </SafeAreaView>
//   );
// }


// // ============================================================
// // STYLES
// // ============================================================

// const styles = StyleSheet.create({
//   // ==========================================================
//   // BASE
//   // ==========================================================

//   safeArea: {
//     flex: 1,
//     backgroundColor:
//       COLORS.background,
//   },

//   container: {
//     flex: 1,
//     paddingHorizontal: 15,
//   },

//   // ==========================================================
//   // HEADER
//   // ==========================================================

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent:
//       "space-between",
//     paddingTop: 40,
//     paddingBottom: 15,
//   },

//   headerTextContainer: {
//     flex: 1,
//     paddingRight: 10,
//   },

//   headerEyebrow: {
//     color: COLORS.primary,
//     fontSize: 7,
//     fontWeight: "900",
//     letterSpacing: 1.5,
//     marginBottom: 3,
//   },

//   headerTitle: {
//     fontSize: 24,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   headerSubtitle: {
//     marginTop: 3,
//     fontSize: 10,
//     color: COLORS.textMuted,
//   },

//   addButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent:
//       "center",
//     backgroundColor:
//       COLORS.primary,
//     paddingHorizontal: 14,
//     height: 38,
//     borderRadius: 11,
//     shadowColor:
//       COLORS.primary,
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     elevation: 3,
//   },

//   addButtonText: {
//     color: COLORS.white,
//     fontSize: 11,
//     fontWeight: "800",
//     marginLeft: 4,
//   },

//   // ==========================================================
//   // SUMMARY
//   // ==========================================================

//   summaryGrid: {
//     flexDirection: "row",
//     gap: 8,
//     marginBottom: 10,
//   },

//   summaryCard: {
//     flex: 1,
//     backgroundColor:
//       COLORS.card,
//     borderRadius: 14,
//     padding: 11,
//     borderWidth: 1,
//     borderColor:
//       COLORS.border,
//   },

//   summaryIcon: {
//     width: 37,
//     height: 37,
//     borderRadius: 11,
//     alignItems: "center",
//     justifyContent:
//       "center",
//     marginBottom: 8,
//   },

//   summaryValue: {
//     fontSize: 19,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   summaryLabel: {
//     marginTop: 2,
//     fontSize: 8,
//     color: COLORS.textMuted,
//     fontWeight: "600",
//   },

//   // ==========================================================
//   // STOCK VALUE
//   // ==========================================================

//   valueCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor:
//       COLORS.card,
//     borderRadius: 15,
//     padding: 13,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor:
//       COLORS.border,
//   },

//   valueIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 13,
//     backgroundColor:
//       COLORS.primarySoft,
//     alignItems: "center",
//     justifyContent:
//       "center",
//     marginRight: 11,
//   },

//   valueLabel: {
//     fontSize: 9,
//     color: COLORS.textMuted,
//     fontWeight: "600",
//   },

//   valueAmount: {
//     marginTop: 2,
//     fontSize: 21,
//     fontWeight: "900",
//     color: COLORS.primary,
//   },

//   valueRight: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     backgroundColor:
//       COLORS.primaryVerySoft,
//     alignItems: "center",
//     justifyContent:
//       "center",
//   },

//   // ==========================================================
//   // SEARCH
//   // ==========================================================

//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor:
//       COLORS.card,
//     borderRadius: 13,
//     borderWidth: 1,
//     borderColor:
//       COLORS.border,
//     paddingHorizontal: 8,
//     height: 46,
//     marginBottom: 9,
//   },

//   searchIconBox: {
//     width: 31,
//     height: 31,
//     borderRadius: 9,
//     backgroundColor:
//       COLORS.primarySoft,
//     alignItems: "center",
//     justifyContent:
//       "center",
//   },

//   searchInput: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 11,
//     color: COLORS.text,
//     paddingVertical: 0,
//   },

//   clearSearch: {
//     padding: 4,
//   },

//   // ==========================================================
//   // CATEGORY
//   // ==========================================================

//   categoryWrapper: {
//     marginHorizontal: -15,
//   },

//   categoryList: {
//     paddingHorizontal: 15,
//     paddingBottom: 8,
//     gap: 7,
//   },

//   categoryChip: {
//     paddingHorizontal: 13,
//     paddingVertical: 7,
//     borderRadius: 18,
//     backgroundColor:
//       COLORS.card,
//     borderWidth: 1,
//     borderColor:
//       COLORS.border,
//   },

//   activeCategoryChip: {
//     backgroundColor:
//       COLORS.primary,
//     borderColor:
//       COLORS.primary,
//   },

//   categoryText: {
//     fontSize: 9,
//     fontWeight: "700",
//     color: COLORS.textMuted,
//   },

//   activeCategoryText: {
//     color: COLORS.white,
//     fontWeight: "800",
//   },

//   // ==========================================================
//   // LIST HEADER
//   // ==========================================================

//   listHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent:
//       "space-between",
//     paddingVertical: 7,
//   },

//   listTitle: {
//     fontSize: 15,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   listSubtitle: {
//     marginTop: 1,
//     fontSize: 8,
//     color: COLORS.textLight,
//   },

//   listCountBadge: {
//     backgroundColor:
//       COLORS.primarySoft,
//     paddingHorizontal: 9,
//     paddingVertical: 5,
//     borderRadius: 10,
//   },

//   listCount: {
//     fontSize: 8,
//     color: COLORS.primary,
//     fontWeight: "800",
//   },

//   // ==========================================================
//   // PRODUCT LIST
//   // ==========================================================

//   productList: {
//     paddingBottom: 25,
//   },

//   productCard: {
//     flexDirection: "row",
//     backgroundColor:
//       COLORS.card,
//     borderRadius: 15,
//     padding: 12,
//     marginBottom: 9,
//     borderWidth: 1,
//     borderColor:
//       COLORS.border,
//   },

//   productIcon: {
//     width: 45,
//     height: 45,
//     borderRadius: 13,
//     backgroundColor:
//       COLORS.primarySoft,
//     alignItems: "center",
//     justifyContent:
//       "center",
//     marginRight: 10,
//   },

//   productContent: {
//     flex: 1,
//   },

//   productTopRow: {
//     flexDirection: "row",
//     alignItems:
//       "flex-start",
//     gap: 7,
//   },

//   productName: {
//     fontSize: 13,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   productBrand: {
//     fontSize: 9,
//     color: COLORS.textMuted,
//     marginTop: 2,
//   },

//   stockBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 3,
//     paddingHorizontal: 6,
//     paddingVertical: 4,
//     borderRadius: 7,
//   },

//   stockBadgeText: {
//     fontSize: 7,
//     fontWeight: "800",
//   },

//   infoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 14,
//     marginTop: 8,
//   },

//   infoItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },

//   infoText: {
//     fontSize: 9,
//     color: COLORS.textMuted,
//     fontWeight: "600",
//   },

//   productBottomRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent:
//       "space-between",
//     marginTop: 10,
//     paddingTop: 9,
//     borderTopWidth: 1,
//     borderTopColor:
//       COLORS.divider,
//   },

//   smallLabel: {
//     fontSize: 7,
//     color: COLORS.textLight,
//     fontWeight: "600",
//   },

//   priceText: {
//     marginTop: 2,
//     fontSize: 12,
//     fontWeight: "900",
//     color: COLORS.primary,
//   },

//   // ==========================================================
//   // ACTION BUTTONS
//   // ==========================================================

//   actionButtons: {
//     flexDirection: "row",
//     gap: 6,
//   },

//   actionButton: {
//     width: 33,
//     height: 33,
//     borderRadius: 9,
//     backgroundColor:
//       COLORS.primarySoft,
//     alignItems: "center",
//     justifyContent:
//       "center",
//   },

//   deleteButton: {
//     backgroundColor:
//       COLORS.dangerSoft,
//   },

//   // ==========================================================
//   // EMPTY
//   // ==========================================================

//   emptyList: {
//     flexGrow: 1,
//   },

//   emptyContainer: {
//     alignItems: "center",
//     justifyContent:
//       "center",
//     paddingHorizontal: 30,
//     paddingVertical: 55,
//   },

//   emptyIcon: {
//     width: 72,
//     height: 72,
//     borderRadius: 23,
//     backgroundColor:
//       COLORS.primarySoft,
//     alignItems: "center",
//     justifyContent:
//       "center",
//     marginBottom: 14,
//   },

//   emptyTitle: {
//     fontSize: 16,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   emptyText: {
//     marginTop: 6,
//     fontSize: 10,
//     color: COLORS.textMuted,
//     textAlign: "center",
//     lineHeight: 16,
//   },

//   emptyButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     backgroundColor:
//       COLORS.primary,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 11,
//     marginTop: 17,
//   },

//   emptyButtonText: {
//     color: COLORS.white,
//     fontSize: 10,
//     fontWeight: "800",
//   },
// });



import React, {
  useCallback,
  useEffect,
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

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch } from "../../src/store";

import {
  deleteProduct,
  getProductSummary,
  getProducts,
  selectProductSummary,
  selectProducts,
  selectProductLoading,
  selectProductSummaryLoading,
} from "../../src/features/product/productSlice";

import type { Product } from "../../src/features/product/productSlice";

// ============================================================
// COZ`E SALON THEME
// ============================================================

const COLORS = {
  background: "#F8F2EF",
  card: "#FFFFFF",
  primary: "#8A243B",
  primaryDark: "#702038",
  primarySoft: "#F8E8E6",
  primaryVerySoft: "#FFF7F5",
  text: "#33282C",
  textDark: "#403337",
  textMuted: "#95868B",
  textLight: "#A4979B",
  border: "#E7DAD7",
  divider: "#EFE5E2",
  success: "#2E8B57",
  successSoft: "#EAF6EF",
  warning: "#C77700",
  warningSoft: "#FFF4E3",
  danger: "#C0392B",
  dangerSoft: "#FDECEA",
  white: "#FFFFFF",
};

// ============================================================
// API
// ============================================================

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:5000/api";

// ============================================================
// SCREEN
// ============================================================

export default function ProductsScreen() {
  const dispatch = useDispatch<AppDispatch>();

  // ==========================================================
  // REDUX
  // ==========================================================

  const products = useSelector(selectProducts);
  const summary = useSelector(selectProductSummary);
  const loading = useSelector(selectProductLoading);

  const summaryLoading = useSelector(
    selectProductSummaryLoading
  );

  // ==========================================================
  // LOCAL STATE
  // ==========================================================

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All");

  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [localBulkUploadResult, setLocalBulkUploadResult] =
    useState<any>(null);

  const bulkUploading = uploading;
  const bulkUploadResult = localBulkUploadResult;

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData = useCallback(async () => {
    await Promise.all([
      dispatch(
        getProducts({
          active: true,
        })
      ),
      dispatch(getProductSummary()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  // ==========================================================
  // BULK UPLOAD PRODUCTS
  // Expo SDK 57-compatible File API + expoFetch
  // ==========================================================

  const handleBulkUpload = async () => {
    if (uploading) {
      return;
    }

    try {
      setUploading(true);

      console.log("========================================");
      console.log("OPENING PRODUCT FILE PICKER");
      console.log("========================================");

      const result = await File.pickFileAsync({
        multipleFiles: false,
        mimeTypes: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
          "text/comma-separated-values",
        ],
      });

      if (result.canceled) {
        console.log("PRODUCT FILE PICKER CANCELLED");
        return;
      }

      const file = result.result;

      if (!file) {
        Alert.alert(
          "File Error",
          "Unable to select the Excel file."
        );
        return;
      }

      const uriFileName =
        file.uri?.split("/").pop()?.split("?")[0] || "";

      const fileName =
        file.name ||
        uriFileName ||
        `products-${Date.now()}.xlsx`;

      let extension =
        fileName
          .split(".")
          .pop()
          ?.toLowerCase()
          .trim() || "";

      // Detect extension from MIME type if needed.
      if (!["xlsx", "xls", "csv"].includes(extension)) {
        const mimeType = String(file.type || "").toLowerCase();

        if (mimeType.includes("spreadsheetml.sheet")) {
          extension = "xlsx";
        } else if (
          mimeType.includes("application/vnd.ms-excel")
        ) {
          extension = "xls";
        } else if (mimeType.includes("csv")) {
          extension = "csv";
        }
      }

      if (!["xlsx", "xls", "csv"].includes(extension)) {
        Alert.alert(
          "Invalid File",
          "Please select an Excel (.xlsx/.xls) or CSV file."
        );
        return;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token missing. Please login again."
        );
      }

      console.log("========================================");
      console.log("PRODUCT BULK UPLOAD");
      console.log("FILE:", fileName);
      console.log("TYPE:", file.type);
      console.log("SIZE:", file.size);
      console.log("URI:", file.uri);
      console.log("API:", `${API_URL}/products/bulk-upload`);
      console.log("========================================");

      // IMPORTANT:
      // Use the actual Expo File object.
      // Do not append { uri, name, type } to FormData.
      // Do not manually set multipart Content-Type.
      const formData = new FormData();

      formData.append("file", file as any);

      console.log("PRODUCT FORM DATA CREATED");
      console.log("STARTING PRODUCT UPLOAD");

      const response = await expoFetch(
        `${API_URL}/products/bulk-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const rawText = await response.text();

      console.log(
        "PRODUCT UPLOAD HTTP STATUS:",
        response.status
      );

      console.log(
        "PRODUCT UPLOAD RAW RESPONSE:",
        rawText
      );

      let data: any;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Invalid server response (${response.status})`
        );
      }

      if (
        response.status < 200 ||
        response.status >= 300 ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            `Upload failed (${response.status})`
        );
      }

      setLocalBulkUploadResult(data);

      // Refresh products and summary after successful import.
      await Promise.all([
        dispatch(getProducts({ active: true })),
        dispatch(getProductSummary()),
      ]);

      const totalRows = Number(data.totalRows || 0);
      const created = Number(data.created || 0);
      const duplicates = Number(data.duplicates || 0);
      const failed = Number(data.failed || 0);

      Alert.alert(
        "Product Import Completed",
        `Total Rows: ${totalRows}\n\nCreated: ${created}\nDuplicates: ${duplicates}\nFailed: ${failed}`
      );

      if (
        Array.isArray(data.failedRows) &&
        data.failedRows.length > 0
      ) {
        console.log(
          "FAILED PRODUCT ROWS:",
          data.failedRows
        );
      }

      if (
        Array.isArray(data.duplicateRows) &&
        data.duplicateRows.length > 0
      ) {
        console.log(
          "DUPLICATE PRODUCT ROWS:",
          data.duplicateRows
        );
      }
    } catch (error: any) {
      console.log(
        "========================================"
      );

      console.log(
        "PRODUCT BULK UPLOAD ERROR:",
        error
      );

      console.log(
        "========================================"
      );

      Alert.alert(
        "Upload Failed",
        error?.message ||
          "Unable to upload product file."
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================================
  // SHOW UPLOAD RESULT DETAILS
  // ==========================================================

  const showBulkUploadDetails = () => {
    if (!bulkUploadResult) {
      return;
    }

    const failedCount =
      bulkUploadResult.failed || 0;

    const duplicateCount =
      bulkUploadResult.duplicates || 0;

    const createdCount =
      bulkUploadResult.created || 0;

    let message =
      `Created: ${createdCount}\n` +
      `Duplicates: ${duplicateCount}\n` +
      `Failed: ${failedCount}`;

    if (
      bulkUploadResult.failedRows &&
      bulkUploadResult.failedRows.length > 0
    ) {
      const failedPreview =
        bulkUploadResult.failedRows
          .slice(0, 5)
          .map(
            (item: any) =>
              `Row ${item.row}: ${
                item.name || "Unknown"
              } - ${item.message || "Invalid data"}`
          )
          .join("\n");

      message +=
        `\n\nFailed Rows:\n${failedPreview}`;

      if (bulkUploadResult.failedRows.length > 5) {
        message +=
          `\n+ ${
            bulkUploadResult.failedRows.length - 5
          } more`;
      }
    }

    if (
      bulkUploadResult.duplicateRows &&
      bulkUploadResult.duplicateRows.length > 0
    ) {
      const duplicatePreview =
        bulkUploadResult.duplicateRows
          .slice(0, 5)
          .map(
            (item: any) =>
              `Row ${item.row}: ${
                item.name || "Unknown"
              } - ${item.reason || "Duplicate"}`
          )
          .join("\n");

      message +=
        `\n\nDuplicate Rows:\n${duplicatePreview}`;

      if (bulkUploadResult.duplicateRows.length > 5) {
        message +=
          `\n+ ${
            bulkUploadResult.duplicateRows.length - 5
          } more`;
      }
    }

    Alert.alert("Import Details", message);
  };

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values)),
    ];
  }, [products]);

  // ==========================================================
  // FILTER PRODUCTS
  // ==========================================================

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.name.toLowerCase().includes(searchValue) ||
        product.brand?.toLowerCase().includes(searchValue) ||
        product.category?.toLowerCase().includes(searchValue) ||
        product.vendor?.toLowerCase().includes(searchValue);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  // ==========================================================
  // DELETE PRODUCT
  // ==========================================================

  const handleDelete = (product: Product) => {
    Alert.alert(
      "Remove Product",
      `Are you sure you want to remove "${product.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const result = await dispatch(
              deleteProduct(product._id)
            );

            if (deleteProduct.fulfilled.match(result)) {
              await Promise.all([
                dispatch(getProducts({ active: true })),
                dispatch(getProductSummary()),
              ]);
            } else {
              Alert.alert(
                "Error",
                "Failed to remove product."
              );
            }
          },
        },
      ]
    );
  };

  // ==========================================================
  // STOCK STATUS
  // ==========================================================

  const getStockStatus = (product: Product) => {
    if (Number(product.currentStock) === 0) {
      return "Out of Stock";
    }

    if (
      Number(product.minimumStock) > 0 &&
      Number(product.currentStock) <=
        Number(product.minimumStock)
    ) {
      return "Low Stock";
    }

    return "In Stock";
  };

  // ==========================================================
  // STOCK ICON
  // ==========================================================

  const getStockIcon = (product: Product) => {
    const status = getStockStatus(product);

    if (status === "Out of Stock") {
      return "close-circle";
    }

    if (status === "Low Stock") {
      return "warning";
    }

    return "checkmark-circle";
  };

  // ==========================================================
  // STOCK COLOR
  // ==========================================================

  const getStockColor = (product: Product) => {
    const status = getStockStatus(product);

    if (status === "Out of Stock") {
      return COLORS.danger;
    }

    if (status === "Low Stock") {
      return COLORS.warning;
    }

    return COLORS.success;
  };

  // ==========================================================
  // STOCK BACKGROUND
  // ==========================================================

  const getStockBackground = (product: Product) => {
    const status = getStockStatus(product);

    if (status === "Out of Stock") {
      return COLORS.dangerSoft;
    }

    if (status === "Low Stock") {
      return COLORS.warningSoft;
    }

    return COLORS.successSoft;
  };

  // ==========================================================
  // PRODUCT CARD
  // ==========================================================

  const renderProduct = ({
    item,
  }: {
    item: Product;
  }) => {
    const status = getStockStatus(item);
    const stockColor = getStockColor(item);

    return (
      <View style={styles.productCard}>
        {/* PRODUCT ICON */}
        <View style={styles.productIcon}>
          <Ionicons
            name="cube-outline"
            size={25}
            color={COLORS.primary}
          />
        </View>

        {/* PRODUCT CONTENT */}
        <View style={styles.productContent}>
          {/* TOP */}
          <View style={styles.productTopRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={styles.productName}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <Text
                style={styles.productBrand}
                numberOfLines={1}
              >
                {item.brand || item.category}
              </Text>
            </View>

            <View
              style={[
                styles.stockBadge,
                {
                  backgroundColor:
                    getStockBackground(item),
                },
              ]}
            >
              <Ionicons
                name={getStockIcon(item) as any}
                size={13}
                color={stockColor}
              />

              <Text
                style={[
                  styles.stockBadgeText,
                  { color: stockColor },
                ]}
              >
                {status}
              </Text>
            </View>
          </View>

          {/* DIVIDER */}
          <View style={styles.productDivider} />

          {/* STOCK DETAILS */}
          <View style={styles.productDetailsRow}>
            <View style={styles.productDetail}>
              <Text style={styles.detailLabel}>
                Current Stock
              </Text>

              <Text style={styles.detailValue}>
                {Number(item.currentStock || 0)}{" "}
                {item.unit || ""}
              </Text>
            </View>

            <View style={styles.detailSeparator} />

            <View style={styles.productDetail}>
              <Text style={styles.detailLabel}>
                Minimum Stock
              </Text>

              <Text style={styles.detailValue}>
                {Number(item.minimumStock || 0)}
              </Text>
            </View>

            <View style={styles.detailSeparator} />

            <View style={styles.productDetail}>
              <Text style={styles.detailLabel}>
                Purchase Price
              </Text>

              <Text style={styles.detailValue}>
                ₹
                {Number(
                  item.purchasePrice || 0
                ).toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          {/* VENDOR */}
          {!!item.vendor && (
            <View style={styles.vendorRow}>
              <Ionicons
                name="business-outline"
                size={13}
                color={COLORS.textMuted}
              />

              <Text
                style={styles.vendorText}
                numberOfLines={1}
              >
                {item.vendor}
              </Text>
            </View>
          )}

          {/* NOTES */}
          {!!item.notes && (
            <Text
              style={styles.productNotes}
              numberOfLines={2}
            >
              {item.notes}
            </Text>
          )}

          {/* ACTIONS */}
          <View style={styles.productActions}>
            <Pressable
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: "/products/edit",
                  params: {
                    id: item._id,
                  },
                })
              }
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={COLORS.primary}
              />

              <Text style={styles.editButtonText}>
                Edit
              </Text>
            </Pressable>

            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={COLORS.danger}
              />

              <Text style={styles.deleteButtonText}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  // ==========================================================
  // HEADER
  // ==========================================================

  const renderHeader = () => (
    <View>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerEyebrow}>
            GLOW SALON
          </Text>

          <Text style={styles.headerTitle}>
            Products
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage salon inventory & stock
          </Text>
        </View>

        {/* HEADER ACTIONS */}
        <View style={styles.headerActions}>
          {/* IMPORT */}
          <Pressable
            style={[
              styles.bulkButton,
              bulkUploading && styles.disabledButton,
            ]}
            disabled={bulkUploading}
            onPress={handleBulkUpload}
          >
            {bulkUploading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
              />
            ) : (
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color={COLORS.primary}
              />
            )}

            <Text style={styles.bulkButtonText}>
              {bulkUploading ? "Uploading" : "Import"}
            </Text>
          </Pressable>

          {/* ADD */}
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/products/add")}
          >
            <Ionicons
              name="add"
              size={20}
              color={COLORS.white}
            />

            <Text style={styles.addButtonText}>
              Add
            </Text>
          </Pressable>
        </View>
      </View>

      {/* IMPORT RESULT */}
      {bulkUploadResult && (
        <Pressable
          style={styles.importResultCard}
          onPress={showBulkUploadDetails}
        >
          <View style={styles.importResultIcon}>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color={COLORS.success}
            />
          </View>

          <View style={styles.importResultContent}>
            <Text style={styles.importResultTitle}>
              Import Completed
            </Text>

            <Text style={styles.importResultSubtitle}>
              Tap to view import details
            </Text>

            <View style={styles.importResultStats}>
              <Text style={styles.importCreated}>
                Created: {bulkUploadResult.created}
              </Text>

              <Text style={styles.importDuplicates}>
                Duplicates: {bulkUploadResult.duplicates}
              </Text>

              <Text style={styles.importFailed}>
                Failed: {bulkUploadResult.failed}
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={COLORS.textMuted}
          />
        </Pressable>
      )}

      {/* SUMMARY CARDS */}
      <View style={styles.summaryRow}>
        {/* TOTAL PRODUCTS */}
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: COLORS.primarySoft },
            ]}
          >
            <Ionicons
              name="cube-outline"
              size={24}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.summaryNumber}>
            {summaryLoading
              ? "..."
              : summary.totalProducts || 0}
          </Text>

          <Text style={styles.summaryLabel}>
            Total Products
          </Text>
        </View>

        {/* LOW STOCK */}
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: COLORS.warningSoft },
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={24}
              color={COLORS.warning}
            />
          </View>

          <Text style={styles.summaryNumber}>
            {summaryLoading
              ? "..."
              : summary.lowStock || 0}
          </Text>

          <Text style={styles.summaryLabel}>
            Low Stock
          </Text>
        </View>

        {/* OUT OF STOCK */}
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: COLORS.dangerSoft },
            ]}
          >
            <Ionicons
              name="close-circle-outline"
              size={24}
              color={COLORS.danger}
            />
          </View>

          <Text style={styles.summaryNumber}>
            {summaryLoading
              ? "..."
              : summary.outOfStock || 0}
          </Text>

          <Text style={styles.summaryLabel}>
            Out of Stock
          </Text>
        </View>
      </View>

      {/* TOTAL STOCK VALUE */}
      <View style={styles.stockValueCard}>
        <View style={styles.stockValueIcon}>
          <Ionicons
            name="wallet-outline"
            size={28}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.stockValueContent}>
          <Text style={styles.stockValueLabel}>
            Total Stock Value
          </Text>

          <Text style={styles.stockValueAmount}>
            ₹
            {Number(
              summary.totalStockValue || 0
            ).toLocaleString("en-IN")}
          </Text>
        </View>

        <Ionicons
          name="trending-up-outline"
          size={25}
          color={COLORS.primary}
        />
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Ionicons
            name="search-outline"
            size={22}
            color={COLORS.primary}
          />
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search products, brand or vendor..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {!!search && (
          <Pressable
            onPress={() => setSearch("")}
            style={styles.clearSearchButton}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={COLORS.textMuted}
            />
          </Pressable>
        )}
      </View>

      {/* CATEGORY FILTER */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const active = selectedCategory === item;

          return (
            <Pressable
              style={[
                styles.categoryChip,
                active && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  active && styles.categoryChipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* SECTION TITLE */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Inventory
          </Text>

          <Text style={styles.sectionSubtitle}>
            Salon products and stock levels
          </Text>
        </View>

        <Text style={styles.productCount}>
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "Product"
            : "Products"}
        </Text>
      </View>
    </View>
  );

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Loading products...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="cube-outline"
            size={35}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          {search || selectedCategory !== "All"
            ? "No Products Found"
            : "No Products Found"}
        </Text>

        <Text style={styles.emptyText}>
          {search || selectedCategory !== "All"
            ? "Try changing your search or category filter."
            : "Add your salon products to start managing inventory."}
        </Text>

        {!search && selectedCategory === "All" && (
          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push("/products/add")}
          >
            <Ionicons
              name="add"
              size={20}
              color={COLORS.white}
            />

            <Text style={styles.emptyButtonText}>
              Add Product
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.container}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 35,
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
    gap: 10,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: COLORS.primary,
    marginBottom: 7,
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.8,
  },

  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 5,
    lineHeight: 19,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  bulkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 12,
    height: 49,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  bulkButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },

  disabledButton: {
    opacity: 0.55,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 16,
    height: 49,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
  },

  addButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.white,
  },

  importResultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#CDE9D7",
    padding: 15,
    marginBottom: 18,
    gap: 12,
  },

  importResultIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  importResultContent: {
    flex: 1,
  },

  importResultTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  importResultSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  importResultStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 8,
  },

  importCreated: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: "800",
  },

  importDuplicates: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: "800",
  },

  importFailed: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: "800",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  summaryCard: {
    flex: 1,
    minHeight: 155,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    paddingHorizontal: 13,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  summaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  summaryNumber: {
    fontSize: 27,
    fontWeight: "900",
    color: COLORS.text,
  },

  summaryLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 5,
    lineHeight: 15,
  },

  stockValueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 18,
    gap: 15,
  },

  stockValueIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  stockValueContent: {
    flex: 1,
  },

  stockValueLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  stockValueAmount: {
    fontSize: 27,
    fontWeight: "900",
    color: COLORS.primary,
    marginTop: 5,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 70,
    backgroundColor: COLORS.card,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    marginBottom: 16,
  },

  searchIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: COLORS.primaryVerySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },

  clearSearchButton: {
    padding: 5,
  },

  categoryList: {
    gap: 9,
    paddingBottom: 21,
  },

  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },

  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryChipText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },

  categoryChipTextActive: {
    color: COLORS.white,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  productCount: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
  },

  productCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 13,
    gap: 12,
  },

  productIcon: {
    width: 53,
    height: 53,
    borderRadius: 17,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  productContent: {
    flex: 1,
    minWidth: 0,
  },

  productTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  productName: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  productBrand: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 11,
  },

  stockBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },

  productDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 13,
  },

  productDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  productDetail: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 5,
  },

  detailValue: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
  },

  detailSeparator: {
    width: 1,
    height: 31,
    backgroundColor: COLORS.divider,
    marginHorizontal: 8,
  },

  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },

  vendorText: {
    flex: 1,
    fontSize: 10,
    color: COLORS.textMuted,
  },

  productNotes: {
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.textMuted,
    marginTop: 8,
  },

  productActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 9,
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.primaryVerySoft,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 11,
  },

  editButtonText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#F0D3D0",
    backgroundColor: COLORS.dangerSoft,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 11,
  },

  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "800",
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 65,
  },

  loadingText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 12,
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 55,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 23,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 6,
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 16,
  },

  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 11,
    marginTop: 17,
  },

  emptyButtonText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
  },
});
