


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
import { router } from "expo-router";

import { useDispatch, useSelector } from "react-redux";

import type {
  AppDispatch,
  RootState,
} from "../../src/store";

import {
  deleteProduct,
  getProductSummary,
  getProducts,
  selectProductSummary,
  selectProducts,
  selectProductLoading,
  selectProductSummaryLoading,
} from "../../src/features/product/productSlice";

import type {
  Product,
} from "../../src/features/product/productSlice";


// ============================================================
// GLOW SALON THEME
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
// SCREEN
// ============================================================

export default function ProductsScreen() {
  const dispatch =
    useDispatch<AppDispatch>();

  // ==========================================================
  // REDUX
  // ==========================================================

  const products =
    useSelector(selectProducts);

  const summary =
    useSelector(selectProductSummary);

  const loading =
    useSelector(selectProductLoading);

  const summaryLoading =
    useSelector(
      selectProductSummaryLoading
    );

  // ==========================================================
  // LOCAL STATE
  // ==========================================================

  const [search, setSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<string>("All");

  const [refreshing, setRefreshing] =
    useState(false);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData = useCallback(
    async () => {
      await Promise.all([
        dispatch(
          getProducts({
            active: true,
          })
        ),
        dispatch(
          getProductSummary()
        ),
      ]);
    },
    [dispatch]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const onRefresh = useCallback(
    async () => {
      setRefreshing(true);

      try {
        await loadData();
      } finally {
        setRefreshing(false);
      }
    },
    [loadData]
  );

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories = useMemo(() => {
    const values =
      products
        .map(
          (product) =>
            product.category
        )
        .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(values)
      ),
    ];
  }, [products]);

  // ==========================================================
  // FILTER PRODUCTS
  // ==========================================================

  const filteredProducts =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const matchesSearch =
            !searchValue ||
            product.name
              .toLowerCase()
              .includes(searchValue) ||
            product.brand
              ?.toLowerCase()
              .includes(searchValue) ||
            product.category
              ?.toLowerCase()
              .includes(searchValue) ||
            product.vendor
              ?.toLowerCase()
              .includes(searchValue);

          const matchesCategory =
            selectedCategory ===
              "All" ||
            product.category ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      products,
      search,
      selectedCategory,
    ]);

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = (
    product: Product
  ) => {
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
            const result =
              await dispatch(
                deleteProduct(
                  product._id
                )
              );

            if (
              deleteProduct.fulfilled.match(
                result
              )
            ) {
              dispatch(
                getProductSummary()
              );
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

  const getStockStatus = (
    product: Product
  ) => {
    if (
      product.currentStock === 0
    ) {
      return "Out of Stock";
    }

    if (
      product.minimumStock > 0 &&
      product.currentStock <=
        product.minimumStock
    ) {
      return "Low Stock";
    }

    return "In Stock";
  };

  // ==========================================================
  // STOCK ICON
  // ==========================================================

  const getStockIcon = (
    product: Product
  ) => {
    const status =
      getStockStatus(product);

    if (
      status === "Out of Stock"
    ) {
      return "close-circle";
    }

    if (
      status === "Low Stock"
    ) {
      return "warning";
    }

    return "checkmark-circle";
  };

  // ==========================================================
  // STOCK COLOR
  // ==========================================================

  const getStockColor = (
    product: Product
  ) => {
    const status =
      getStockStatus(product);

    if (
      status === "Out of Stock"
    ) {
      return COLORS.danger;
    }

    if (
      status === "Low Stock"
    ) {
      return COLORS.warning;
    }

    return COLORS.success;
  };

  const getStockBackground = (
    product: Product
  ) => {
    const status =
      getStockStatus(product);

    if (
      status === "Out of Stock"
    ) {
      return COLORS.dangerSoft;
    }

    if (
      status === "Low Stock"
    ) {
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
    const status =
      getStockStatus(item);

    const stockColor =
      getStockColor(item);

    return (
      <View
        style={styles.productCard}
      >
        {/* PRODUCT ICON */}

        <View
          style={styles.productIcon}
        >
          <Ionicons
            name="cube-outline"
            size={25}
            color={COLORS.primary}
          />
        </View>

        {/* CONTENT */}

        <View
          style={styles.productContent}
        >
          {/* TOP */}

          <View
            style={
              styles.productTopRow
            }
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.productName
                }
                numberOfLines={1}
              >
                {item.name}
              </Text>

              {!!item.brand && (
                <Text
                  style={
                    styles.productBrand
                  }
                  numberOfLines={1}
                >
                  {item.brand}
                </Text>
              )}
            </View>

            {/* STOCK */}

            <View
              style={[
                styles.stockBadge,
                {
                  backgroundColor:
                    getStockBackground(
                      item
                    ),
                },
              ]}
            >
              <Ionicons
                name={
                  getStockIcon(
                    item
                  ) as any
                }
                size={13}
                color={stockColor}
              />

              <Text
                style={[
                  styles.stockBadgeText,
                  {
                    color:
                      stockColor,
                  },
                ]}
              >
                {status}
              </Text>
            </View>
          </View>

          {/* INFORMATION */}

          <View
            style={
              styles.infoRow
            }
          >
            <View
              style={
                styles.infoItem
              }
            >
              <Ionicons
                name="pricetag-outline"
                size={14}
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.infoText
                }
              >
                {item.category}
              </Text>
            </View>

            <View
              style={
                styles.infoItem
              }
            >
              <Ionicons
                name="layers-outline"
                size={14}
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.infoText
                }
              >
                {item.currentStock}{" "}
                {item.unit}
              </Text>
            </View>
          </View>

          {/* BOTTOM */}

          <View
            style={
              styles.productBottomRow
            }
          >
            <View>
              <Text
                style={
                  styles.smallLabel
                }
              >
                Purchase Price
              </Text>

              <Text
                style={
                  styles.priceText
                }
              >
                ₹
                {Number(
                  item.purchasePrice ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </Text>
            </View>

            {/* ACTIONS */}

            <View
              style={
                styles.actionButtons
              }
            >
              {/* EDIT */}

              <Pressable
                style={
                  styles.actionButton
                }
                onPress={() =>
                  router.push(
                    `/products/edit?id=${item._id}`
                  )
                }
              >
                <Ionicons
                  name="create-outline"
                  size={19}
                  color={
                    COLORS.primary
                  }
                />
              </Pressable>

              {/* DELETE */}

              <Pressable
                style={[
                  styles.actionButton,
                  styles.deleteButton,
                ]}
                onPress={() =>
                  handleDelete(
                    item
                  )
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={
                    COLORS.danger
                  }
                />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ==========================================================
  // EMPTY
  // ==========================================================

  const renderEmpty = () => {
    if (loading) {
      return (
        <View
          style={
            styles.emptyContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={
              COLORS.primary
            }
          />

          <Text
            style={
              styles.emptyText
            }
          >
            Loading products...
          </Text>
        </View>
      );
    }

    return (
      <View
        style={
          styles.emptyContainer
        }
      >
        <View
          style={
            styles.emptyIcon
          }
        >
          <Ionicons
            name="cube-outline"
            size={38}
            color={
              COLORS.primary
            }
          />
        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          No Products Found
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          Add your salon products
          to start managing
          inventory.
        </Text>

        <Pressable
          style={
            styles.emptyButton
          }
          onPress={() =>
            router.push(
              "/products/add"
            )
          }
        >
          <Ionicons
            name="add"
            size={19}
            color={
              COLORS.white
            }
          />

          <Text
            style={
              styles.emptyButtonText
            }
          >
            Add Product
          </Text>
        </Pressable>
      </View>
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.background
        }
      />

      <View
        style={styles.container}
      >
        {/* HEADER */}

        <View
          style={styles.header}
        >
          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={
                styles.headerEyebrow
              }
            >
              GLOW SALON
            </Text>

            <Text
              style={
                styles.headerTitle
              }
            >
              Products
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Manage salon inventory
              & stock
            </Text>
          </View>

          <Pressable
            style={
              styles.addButton
            }
            onPress={() =>
              router.push(
                "/products/add"
              )
            }
          >
            <Ionicons
              name="add"
              size={20}
              color={
                COLORS.white
              }
            />

            <Text
              style={
                styles.addButtonText
              }
            >
              Add
            </Text>
          </Pressable>
        </View>

        {/* SUMMARY */}

        <View
          style={
            styles.summaryGrid
          }
        >
          {/* TOTAL */}

          <View
            style={
              styles.summaryCard
            }
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    COLORS.primarySoft,
                },
              ]}
            >
              <Ionicons
                name="cube-outline"
                size={22}
                color={
                  COLORS.primary
                }
              />
            </View>

            <Text
              style={
                styles.summaryValue
              }
            >
              {summaryLoading
                ? "..."
                : summary.totalProducts}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Total Products
            </Text>
          </View>

          {/* LOW STOCK */}

          <View
            style={
              styles.summaryCard
            }
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    COLORS.warningSoft,
                },
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={22}
                color={
                  COLORS.warning
                }
              />
            </View>

            <Text
              style={
                styles.summaryValue
              }
            >
              {summaryLoading
                ? "..."
                : summary.lowStock}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Low Stock
            </Text>
          </View>

          {/* OUT OF STOCK */}

          <View
            style={
              styles.summaryCard
            }
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    COLORS.dangerSoft,
                },
              ]}
            >
              <Ionicons
                name="close-circle-outline"
                size={22}
                color={
                  COLORS.danger
                }
              />
            </View>

            <Text
              style={
                styles.summaryValue
              }
            >
              {summaryLoading
                ? "..."
                : summary.outOfStock}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Out of Stock
            </Text>
          </View>
        </View>

        {/* STOCK VALUE */}

        <View
          style={
            styles.valueCard
          }
        >
          <View
            style={
              styles.valueIcon
            }
          >
            <Ionicons
              name="wallet-outline"
              size={25}
              color={
                COLORS.primary
              }
            />
          </View>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.valueLabel
              }
            >
              Total Stock Value
            </Text>

            <Text
              style={
                styles.valueAmount
              }
            >
              ₹
              {Number(
                summary.totalStockValue ||
                  0
              ).toLocaleString(
                "en-IN"
              )}
            </Text>
          </View>

          <View
            style={
              styles.valueRight
            }
          >
            <Ionicons
              name="trending-up-outline"
              size={18}
              color={
                COLORS.primary
              }
            />
          </View>
        </View>

        {/* SEARCH */}

        <View
          style={
            styles.searchContainer
          }
        >
          <View
            style={
              styles.searchIconBox
            }
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={
                COLORS.primary
              }
            />
          </View>

          <TextInput
            value={search}
            onChangeText={
              setSearch
            }
            placeholder="Search products, brand or vendor..."
            placeholderTextColor={
              COLORS.textLight
            }
            style={
              styles.searchInput
            }
          />

          {search.length > 0 && (
            <Pressable
              onPress={() =>
                setSearch("")
              }
              style={
                styles.clearSearch
              }
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={
                  COLORS.textLight
                }
              />
            </Pressable>
          )}
        </View>

        {/* CATEGORY FILTER */}

        <View
          style={
            styles.categoryWrapper
          }
        >
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            data={categories}
            keyExtractor={(item) =>
              item
            }
            contentContainerStyle={
              styles.categoryList
            }
            renderItem={({
              item,
            }) => {
              const active =
                selectedCategory ===
                item;

              return (
                <Pressable
                  style={[
                    styles.categoryChip,
                    active &&
                      styles.activeCategoryChip,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      item
                    )
                  }
                >
                  <Text
                    style={[
                      styles.categoryText,
                      active &&
                        styles.activeCategoryText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* LIST HEADER */}

        <View
          style={
            styles.listHeader
          }
        >
          <View>
            <Text
              style={
                styles.listTitle
              }
            >
              Inventory
            </Text>

            <Text
              style={
                styles.listSubtitle
              }
            >
              Salon products & stock
            </Text>
          </View>

          <View
            style={
              styles.listCountBadge
            }
          >
            <Text
              style={
                styles.listCount
              }
            >
              {filteredProducts.length}{" "}
              {filteredProducts.length ===
              1
                ? "product"
                : "products"}
            </Text>
          </View>
        </View>

        {/* PRODUCTS */}

        <FlatList
          data={
            filteredProducts
          }
          keyExtractor={(item) =>
            item._id
          }
          renderItem={
            renderProduct
          }
          ListEmptyComponent={
            renderEmpty
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            filteredProducts.length ===
            0
              ? styles.emptyList
              : styles.productList
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                onRefresh
              }
              tintColor={
                COLORS.primary
              }
              colors={[
                COLORS.primary,
              ]}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // BASE
  // ==========================================================

  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 15,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingTop: 40,
    paddingBottom: 15,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 3,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: COLORS.textMuted,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "center",
    backgroundColor:
      COLORS.primary,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 11,
    shadowColor:
      COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  addButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
  },

  // ==========================================================
  // SUMMARY
  // ==========================================================

  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  summaryCard: {
    flex: 1,
    backgroundColor:
      COLORS.card,
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  summaryIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    alignItems: "center",
    justifyContent:
      "center",
    marginBottom: 8,
  },

  summaryValue: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 8,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  // ==========================================================
  // STOCK VALUE
  // ==========================================================

  valueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      COLORS.card,
    borderRadius: 15,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  valueIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor:
      COLORS.primarySoft,
    alignItems: "center",
    justifyContent:
      "center",
    marginRight: 11,
  },

  valueLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  valueAmount: {
    marginTop: 2,
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.primary,
  },

  valueRight: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor:
      COLORS.primaryVerySoft,
    alignItems: "center",
    justifyContent:
      "center",
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      COLORS.card,
    borderRadius: 13,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingHorizontal: 8,
    height: 46,
    marginBottom: 9,
  },

  searchIconBox: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor:
      COLORS.primarySoft,
    alignItems: "center",
    justifyContent:
      "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    color: COLORS.text,
    paddingVertical: 0,
  },

  clearSearch: {
    padding: 4,
  },

  // ==========================================================
  // CATEGORY
  // ==========================================================

  categoryWrapper: {
    marginHorizontal: -15,
  },

  categoryList: {
    paddingHorizontal: 15,
    paddingBottom: 8,
    gap: 7,
  },

  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor:
      COLORS.card,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  activeCategoryChip: {
    backgroundColor:
      COLORS.primary,
    borderColor:
      COLORS.primary,
  },

  categoryText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.textMuted,
  },

  activeCategoryText: {
    color: COLORS.white,
    fontWeight: "800",
  },

  // ==========================================================
  // LIST HEADER
  // ==========================================================

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingVertical: 7,
  },

  listTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  listSubtitle: {
    marginTop: 1,
    fontSize: 8,
    color: COLORS.textLight,
  },

  listCountBadge: {
    backgroundColor:
      COLORS.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  listCount: {
    fontSize: 8,
    color: COLORS.primary,
    fontWeight: "800",
  },

  // ==========================================================
  // PRODUCT LIST
  // ==========================================================

  productList: {
    paddingBottom: 25,
  },

  productCard: {
    flexDirection: "row",
    backgroundColor:
      COLORS.card,
    borderRadius: 15,
    padding: 12,
    marginBottom: 9,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  productIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor:
      COLORS.primarySoft,
    alignItems: "center",
    justifyContent:
      "center",
    marginRight: 10,
  },

  productContent: {
    flex: 1,
  },

  productTopRow: {
    flexDirection: "row",
    alignItems:
      "flex-start",
    gap: 7,
  },

  productName: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },

  productBrand: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 7,
  },

  stockBadgeText: {
    fontSize: 7,
    fontWeight: "800",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  infoText: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  productBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.divider,
  },

  smallLabel: {
    fontSize: 7,
    color: COLORS.textLight,
    fontWeight: "600",
  },

  priceText: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },

  // ==========================================================
  // ACTION BUTTONS
  // ==========================================================

  actionButtons: {
    flexDirection: "row",
    gap: 6,
  },

  actionButton: {
    width: 33,
    height: 33,
    borderRadius: 9,
    backgroundColor:
      COLORS.primarySoft,
    alignItems: "center",
    justifyContent:
      "center",
  },

  deleteButton: {
    backgroundColor:
      COLORS.dangerSoft,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyList: {
    flexGrow: 1,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent:
      "center",
    paddingHorizontal: 30,
    paddingVertical: 55,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 23,
    backgroundColor:
      COLORS.primarySoft,
    alignItems: "center",
    justifyContent:
      "center",
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
    backgroundColor:
      COLORS.primary,
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