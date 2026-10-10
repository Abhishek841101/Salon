import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch } from "../../src/store";

import {
  clearSelectedProduct,
  getProductById,
  updateProduct,
  selectSelectedProduct,
  selectProductLoading,
  selectProductUpdating,
} from "../../src/features/product/productSlice";

// ============================================================
// THEME
// ============================================================

const COLORS = {
  primary: "#8A243B",
  primaryDark: "#702036",
  primaryLight: "#F8E8E6",
  background: "#F8F2EF",
  card: "#FFFFFF",
  border: "#E8DCD8",
  borderLight: "#EFE5E2",
  text: "#33282C",
  textSecondary: "#6F6065",
  muted: "#9B8A90",
  placeholder: "#A4979B",
  white: "#FFFFFF",
  danger: "#B42318",
  success: "#247A48",
  successLight: "#EAF6EF",
  warning: "#B7791F",
};

// ============================================================
// CATEGORIES AND UNITS
// ============================================================

const CATEGORIES = [
  "Hair Care",
  "Skin Care",
  "Hair Color",
  "Hair Treatment",
  "Nail Care",
  "Beauty",
  "Spa",
  "Cleaning",
  "Consumables",
  "Waxing",
  "Other",
];

const UNITS = [
  "pcs",
  "Piece",
  "Bottle",
  "Box",
  "Pack",
  "Kit",
  "Jar",
  "ml",
  "Litre",
  "Gram",
  "kg",
];

// ============================================================
// REUSABLE FORM FIELD
// ============================================================

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  multiline?: boolean;
  required?: boolean;
  maxLength?: number;
  onFocus?: () => void;
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  required = false,
  maxLength,
  onFocus,
}: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? (
          <Text style={styles.requiredMark}> *</Text>
        ) : null}
      </Text>

      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={
          placeholder || `Enter ${label.toLowerCase()}`
        }
        placeholderTextColor={COLORS.placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? "top" : "center"}
        maxLength={maxLength}
        autoCapitalize={
          keyboardType === "default" ? "sentences" : "none"
        }
      />
    </View>
  );
}

// ============================================================
// SCREEN
// ============================================================

export default function EditProductScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const productId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  // REDUX

  const product = useSelector(selectSelectedProduct);
  const loading = useSelector(selectProductLoading);
  const updating = useSelector(selectProductUpdating);

  // FORM STATE

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");

  const [showCategories, setShowCategories] = useState(false);
  const [showUnits, setShowUnits] = useState(false);

  const [initialLoadFinished, setInitialLoadFinished] =
    useState(false);

  const [loadedProductId, setLoadedProductId] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // ============================================================
  // KEYBOARD FIX
  // ============================================================

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios"
        ? "keyboardWillShow"
        : "keyboardDidShow";

    const hideEvent =
      Platform.OS === "ios"
        ? "keyboardWillHide"
        : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(
      showEvent,
      () => setKeyboardVisible(true)
    );

    const hideSubscription = Keyboard.addListener(
      hideEvent,
      () => setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleFieldFocus = useCallback(() => {
    // Keyboard ko screen resize karne ka time do.
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 300);
  }, []);

  // ============================================================
  // LOAD PRODUCT
  // ============================================================

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setInitialLoadFinished(true);

      Alert.alert(
        "Product ID Missing",
        "Product ID was not provided. Please open Edit from the Products screen.",
        [
          {
            text: "Go Back",
            onPress: () => router.back(),
          },
        ]
      );

      return;
    }

    setInitialLoadFinished(false);
    setLoadedProductId("");

    dispatch(clearSelectedProduct());

    try {
      const result = await dispatch(
        getProductById(productId)
      );

      if (getProductById.fulfilled.match(result)) {
        const item = result.payload;

        setName(item.name || "");
        setBrand(item.brand || "");
        setCategory(item.category || "");
        setUnit(item.unit || "");

        setCurrentStock(
          String(item.currentStock ?? 0)
        );

        setMinimumStock(
          String(item.minimumStock ?? 0)
        );

        setPurchasePrice(
          String(item.purchasePrice ?? 0)
        );

        setVendor(item.vendor || "");
        setNotes(item.notes || "");

        setLoadedProductId(item._id);
      } else {
        Alert.alert(
          "Unable to Load Product",
          String(
            result.payload ||
              "Failed to fetch product details."
          ),
          [
            {
              text: "Go Back",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ||
          "Unable to load product details."
      );
    } finally {
      setInitialLoadFinished(true);
    }
  }, [dispatch, productId]);

  useEffect(() => {
    loadProduct();

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [loadProduct, dispatch]);

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    if (!productId || !loadedProductId) {
      Alert.alert(
        "Product Not Loaded",
        "Please wait for the product details to load."
      );

      return false;
    }

    if (!name.trim()) {
      Alert.alert(
        "Required",
        "Please enter the product name."
      );

      return false;
    }

    if (!category.trim()) {
      Alert.alert(
        "Required",
        "Please select a category."
      );

      return false;
    }

    if (!unit.trim()) {
      Alert.alert(
        "Required",
        "Please select a unit."
      );

      return false;
    }

    const stock = Number(currentStock || 0);
    const minStock = Number(minimumStock || 0);
    const price = Number(purchasePrice || 0);

    if (!Number.isFinite(stock) || stock < 0) {
      Alert.alert(
        "Invalid Stock",
        "Current stock must be a valid non-negative number."
      );

      return false;
    }

    if (!Number.isFinite(minStock) || minStock < 0) {
      Alert.alert(
        "Invalid Minimum Stock",
        "Minimum stock must be a valid non-negative number."
      );

      return false;
    }

    if (!Number.isFinite(price) || price < 0) {
      Alert.alert(
        "Invalid Price",
        "Purchase price must be a valid non-negative number."
      );

      return false;
    }

    if (notes.trim().length > 500) {
      Alert.alert(
        "Notes Too Long",
        "Notes cannot exceed 500 characters."
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // SAVE PRODUCT
  // ============================================================

  const handleSave = async () => {
    if (updating) return;

    // Keyboard band karke save buttons ko accessible rakho.
    Keyboard.dismiss();

    if (!validateForm()) return;

    try {
      const result = await dispatch(
        updateProduct({
          id: productId!,
          data: {
            name: name.trim(),
            brand: brand.trim(),
            category: category.trim(),
            unit: unit.trim(),
            currentStock: Number(currentStock || 0),
            minimumStock: Number(minimumStock || 0),
            purchasePrice: Number(purchasePrice || 0),
            vendor: vendor.trim(),
            notes: notes.trim(),
          },
        })
      );

      if (updateProduct.fulfilled.match(result)) {
        Alert.alert(
          "Product Updated",
          "Product details have been updated successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/products");
              },
            },
          ]
        );

        return;
      }

      Alert.alert(
        "Update Failed",
        String(
          result.payload || "Failed to update product."
        )
      );
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error?.message || "Failed to update product."
      );
    }
  };

  // ============================================================
  // CATEGORY DROPDOWN
  // ============================================================

  const renderCategoryOptions = () => {
    if (!showCategories) return null;

    return (
      <View style={styles.dropdown}>
        {CATEGORIES.map((item) => (
          <Pressable
            key={item}
            style={({ pressed }) => [
              styles.dropdownItem,
              pressed && styles.dropdownItemPressed,
            ]}
            onPress={() => {
              setCategory(item);
              setShowCategories(false);
              Keyboard.dismiss();
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                category === item &&
                  styles.dropdownTextActive,
              ]}
            >
              {item}
            </Text>

            {category === item && (
              <Ionicons
                name="checkmark"
                size={18}
                color={COLORS.primary}
              />
            )}
          </Pressable>
        ))}
      </View>
    );
  };

  // ============================================================
  // UNIT DROPDOWN
  // ============================================================

  const renderUnitOptions = () => {
    if (!showUnits) return null;

    return (
      <View style={styles.dropdown}>
        {UNITS.map((item) => (
          <Pressable
            key={item}
            style={({ pressed }) => [
              styles.dropdownItem,
              pressed && styles.dropdownItemPressed,
            ]}
            onPress={() => {
              setUnit(item);
              setShowUnits(false);
              Keyboard.dismiss();
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                unit === item &&
                  styles.dropdownTextActive,
              ]}
            >
              {item}
            </Text>

            {unit === item && (
              <Ionicons
                name="checkmark"
                size={18}
                color={COLORS.primary}
              />
            )}
          </Pressable>
        ))}
      </View>
    );
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (
    !initialLoadFinished ||
    (loading && !loadedProductId)
  ) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingTitle}>
          Loading Product
        </Text>

        <Text style={styles.loadingSubtitle}>
          Please wait while we fetch product details.
        </Text>
      </View>
    );
  }

  // ============================================================
  // PRODUCT NOT AVAILABLE
  // ============================================================

  if (!productId || !loadedProductId || !product) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={38}
            color={COLORS.danger}
          />
        </View>

        <Text style={styles.loadingTitle}>
          Product Not Available
        </Text>

        <Text style={styles.loadingSubtitle}>
          Product details could not be loaded.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={loadProduct}
        >
          <Ionicons
            name="refresh-outline"
            size={19}
            color={COLORS.white}
          />

          <Text style={styles.primaryButtonText}>
            Try Again
          </Text>
        </Pressable>

        <Pressable
          style={styles.backTextButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios" ? "padding" : "height"
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
           

            <Text style={styles.headerTitle}>
              Edit Product
            </Text>

            <Text style={styles.headerSubtitle}>
              Update product and inventory details
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="create-outline"
              size={25}
              color={COLORS.primary}
            />
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={
            Platform.OS === "ios"
          }
          showsVerticalScrollIndicator={false}
        >
          {/* PRODUCT INFORMATION */}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="cube-outline"
                  size={21}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.sectionHeadingText}>
                <Text style={styles.sectionTitle}>
                  Product Information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Basic product details
                </Text>
              </View>
            </View>

            <FormField
              label="Product Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter product name"
              required
              maxLength={120}
              onFocus={handleFieldFocus}
            />

            <FormField
              label="Brand"
              value={brand}
              onChangeText={setBrand}
              placeholder="Enter brand name"
              maxLength={100}
              onFocus={handleFieldFocus}
            />

            {/* CATEGORY */}

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Category
                <Text style={styles.requiredMark}> *</Text>
              </Text>

              <Pressable
                style={styles.selectInput}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowCategories(!showCategories);
                  setShowUnits(false);
                }}
              >
                <Text
                  style={[
                    styles.selectText,
                    !category && styles.selectPlaceholder,
                  ]}
                >
                  {category || "Select category"}
                </Text>

                <Ionicons
                  name={
                    showCategories
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={19}
                  color={COLORS.muted}
                />
              </Pressable>

              {renderCategoryOptions()}
            </View>

            {/* UNIT */}

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Unit
                <Text style={styles.requiredMark}> *</Text>
              </Text>

              <Pressable
                style={styles.selectInput}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowUnits(!showUnits);
                  setShowCategories(false);
                }}
              >
                <Text
                  style={[
                    styles.selectText,
                    !unit && styles.selectPlaceholder,
                  ]}
                >
                  {unit || "Select unit"}
                </Text>

                <Ionicons
                  name={
                    showUnits
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={19}
                  color={COLORS.muted}
                />
              </Pressable>

              {renderUnitOptions()}
            </View>
          </View>

          {/* INVENTORY DETAILS */}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="layers-outline"
                  size={21}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.sectionHeadingText}>
                <Text style={styles.sectionTitle}>
                  Inventory Details
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Manage stock quantity and purchase price
                </Text>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.columnField}>
                <FormField
                  label="Current Stock"
                  value={currentStock}
                  onChangeText={setCurrentStock}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  required
                  onFocus={handleFieldFocus}
                />
              </View>

              <View style={styles.columnField}>
                <FormField
                  label="Minimum Stock"
                  value={minimumStock}
                  onChangeText={setMinimumStock}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  required
                  onFocus={handleFieldFocus}
                />
              </View>
            </View>

            <FormField
              label="Purchase Price (₹)"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              required
              onFocus={handleFieldFocus}
            />

            <View style={styles.stockInfoBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={COLORS.primary}
              />

              <Text style={styles.stockInfoText}>
                Low stock is determined by comparing current
                stock with minimum stock.
              </Text>
            </View>
          </View>

          {/* SUPPLIER DETAILS */}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="business-outline"
                  size={21}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.sectionHeadingText}>
                <Text style={styles.sectionTitle}>
                  Supplier Details
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Optional supplier information
                </Text>
              </View>
            </View>

            <FormField
              label="Vendor / Supplier"
              value={vendor}
              onChangeText={setVendor}
              placeholder="Enter vendor name"
              maxLength={120}
              onFocus={handleFieldFocus}
            />

            <FormField
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add product notes..."
              multiline
              maxLength={500}
              onFocus={handleFieldFocus}
            />

            <Text style={styles.characterCount}>
              {notes.length}/500 characters
            </Text>
          </View>

          {/* SAVE AND CANCEL
              Hide these buttons while the keyboard is open,
              so they cannot overlap the keyboard. */}

          {!keyboardVisible && (
            <View style={styles.bottomActions}>
              <Pressable
                style={styles.cancelButton}
                disabled={updating}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.saveButton,
                  updating && styles.disabledButton,
                ]}
                disabled={updating}
                onPress={handleSave}
              >
                {updating ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.white}
                  />
                ) : (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={COLORS.white}
                  />
                )}

                <Text style={styles.saveButtonText}>
                  {updating ? "Saving..." : "Save Changes"}
                </Text>
              </Pressable>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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

  keyboardContainer: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 18,
    gap: 12,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextContainer: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: COLORS.primary,
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: COLORS.text,
  },

  headerSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
  },

  headerIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 23,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    gap: 12,
  },

  sectionIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeadingText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
    lineHeight: 16,
  },

  fieldContainer: {
    marginBottom: 17,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },

  requiredMark: {
    color: COLORS.danger,
  },

  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFCFB",
    color: COLORS.text,
    fontSize: 14,
  },

  multilineInput: {
    minHeight: 105,
    paddingTop: 13,
  },

  selectInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingHorizontal: 14,
    backgroundColor: "#FFFCFB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },

  selectPlaceholder: {
    color: COLORS.placeholder,
  },

  dropdown: {
    marginTop: 7,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },

  dropdownItem: {
    minHeight: 46,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  dropdownItemPressed: {
    backgroundColor: COLORS.primaryLight,
  },

  dropdownText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  dropdownTextActive: {
    fontWeight: "800",
    color: COLORS.primary,
  },

  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },

  columnField: {
    flex: 1,
    minWidth: 0,
  },

  stockInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    marginTop: 1,
  },

  stockInfoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  characterCount: {
    fontSize: 10,
    color: COLORS.muted,
    textAlign: "right",
    marginTop: -9,
    marginBottom: 2,
  },

  bottomActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },

  cancelButton: {
    minHeight: 54,
    flex: 0.8,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textSecondary,
  },

  saveButton: {
    minHeight: 54,
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },

  disabledButton: {
    opacity: 0.65,
  },

  bottomSpacing: {
    height: 20,
  },

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: 28,
  },

  loadingTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 17,
  },

  loadingSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 7,
    textAlign: "center",
    lineHeight: 19,
  },

  errorIcon: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: "#FDECEA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    minHeight: 49,
    paddingHorizontal: 20,
    marginTop: 22,
  },

  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.white,
  },

  backTextButton: {
    padding: 12,
    marginTop: 8,
  },

  backText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },
});