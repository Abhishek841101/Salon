import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../src/store";

import {
  createProduct,
  selectProductCreating,
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
};

// ============================================================
// CATEGORIES
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
  "Other",
];

// ============================================================
// UNITS
// ============================================================

const UNITS = [
  "pcs",
  "bottle",
  "box",
  "pack",
  "ml",
  "litre",
  "gram",
  "kg",
];

// ============================================================
// SCREEN
// ============================================================

export default function AddProductScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const creating = useSelector(selectProductCreating);

  // ==========================================================
  // FORM
  // ==========================================================

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

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert(
        "Required",
        "Please enter product name."
      );
      return false;
    }

    if (!category) {
      Alert.alert(
        "Required",
        "Please select a category."
      );
      return false;
    }

    if (!unit) {
      Alert.alert(
        "Required",
        "Please select a unit."
      );
      return false;
    }

    const stock = Number(currentStock || 0);
    const minStock = Number(minimumStock || 0);
    const price = Number(purchasePrice || 0);

    if (Number.isNaN(stock) || stock < 0) {
      Alert.alert(
        "Invalid Stock",
        "Please enter a valid current stock."
      );
      return false;
    }

    if (Number.isNaN(minStock) || minStock < 0) {
      Alert.alert(
        "Invalid Stock",
        "Please enter a valid minimum stock."
      );
      return false;
    }

    if (Number.isNaN(price) || price < 0) {
      Alert.alert(
        "Invalid Price",
        "Please enter a valid purchase price."
      );
      return false;
    }

    return true;
  };

  // ==========================================================
  // CREATE PRODUCT
  // ==========================================================

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await dispatch(
      createProduct({
        name: name.trim(),

        brand: brand.trim(),

        category,

        unit,

        currentStock: Number(
          currentStock || 0
        ),

        minimumStock: Number(
          minimumStock || 0
        ),

        purchasePrice: Number(
          purchasePrice || 0
        ),

        vendor: vendor.trim(),

        notes: notes.trim(),
      })
    );

    if (createProduct.fulfilled.match(result)) {
      Alert.alert(
        "Product Added",
        "Product has been added successfully.",
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
      "Error",
      result.payload ||
        "Failed to create product."
    );
  };

  // ==========================================================
  // CATEGORY DROPDOWN
  // ==========================================================

  const renderCategoryOptions = () => {
    if (!showCategories) {
      return null;
    }

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
            }}
          >
            <Text style={styles.dropdownText}>
              {item}
            </Text>

            {category === item && (
              <Ionicons
                name="checkmark-circle"
                size={19}
                color={COLORS.primary}
              />
            )}
          </Pressable>
        ))}
      </View>
    );
  };

  // ==========================================================
  // UNIT DROPDOWN
  // ==========================================================

  const renderUnitOptions = () => {
    if (!showUnits) {
      return null;
    }

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
            }}
          >
            <Text style={styles.dropdownText}>
              {item}
            </Text>

            {unit === item && (
              <Ionicons
                name="checkmark-circle"
                size={19}
                color={COLORS.primary}
              />
            )}
          </Pressable>
        ))}
      </View>
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={COLORS.primary}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Add Product
          </Text>

          <Text style={styles.headerSubtitle}>
            Add salon inventory
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="cube-outline"
            size={21}
            color={COLORS.primary}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* BASIC INFORMATION */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Basic Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Product details
              </Text>
            </View>
          </View>

          {/* PRODUCT NAME */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Product Name *
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="cube-outline"
                size={19}
                color={COLORS.primary}
              />

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. L'Oreal Shampoo"
                placeholderTextColor={
                  COLORS.placeholder
                }
                style={styles.input}
              />
            </View>
          </View>

          {/* BRAND */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Brand
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="pricetag-outline"
                size={19}
                color={COLORS.primary}
              />

              <TextInput
                value={brand}
                onChangeText={setBrand}
                placeholder="e.g. L'Oreal"
                placeholderTextColor={
                  COLORS.placeholder
                }
                style={styles.input}
              />
            </View>
          </View>

          {/* CATEGORY */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Category *
            </Text>

            <Pressable
              style={styles.inputContainer}
              onPress={() => {
                setShowCategories(
                  !showCategories
                );
                setShowUnits(false);
              }}
            >
              <Ionicons
                name="grid-outline"
                size={19}
                color={COLORS.primary}
              />

              <Text
                style={[
                  styles.selectText,
                  !category &&
                    styles.placeholderText,
                ]}
              >
                {category ||
                  "Select category"}
              </Text>

              <Ionicons
                name={
                  showCategories
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={19}
                color={COLORS.textSecondary}
              />
            </Pressable>

            {renderCategoryOptions()}
          </View>

          {/* UNIT */}

          <View style={styles.fieldLast}>
            <Text style={styles.label}>
              Unit *
            </Text>

            <Pressable
              style={styles.inputContainer}
              onPress={() => {
                setShowUnits(!showUnits);
                setShowCategories(false);
              }}
            >
              <Ionicons
                name="scale-outline"
                size={19}
                color={COLORS.primary}
              />

              <Text
                style={[
                  styles.selectText,
                  !unit &&
                    styles.placeholderText,
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
                color={COLORS.textSecondary}
              />
            </Pressable>

            {renderUnitOptions()}
          </View>
        </View>

        {/* STOCK INFORMATION */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="layers-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Stock Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Manage inventory quantity
              </Text>
            </View>
          </View>

          {/* CURRENT STOCK */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Current Stock
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="layers-outline"
                size={19}
                color={COLORS.primary}
              />

              <TextInput
                value={currentStock}
                onChangeText={
                  setCurrentStock
                }
                placeholder="0"
                placeholderTextColor={
                  COLORS.placeholder
                }
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
          </View>

          {/* MINIMUM STOCK */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Minimum Stock
            </Text>

            <Text style={styles.helperText}>
              Alert will show when stock
              reaches this level.
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="warning-outline"
                size={19}
                color={COLORS.primary}
              />

              <TextInput
                value={minimumStock}
                onChangeText={
                  setMinimumStock
                }
                placeholder="e.g. 5"
                placeholderTextColor={
                  COLORS.placeholder
                }
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
          </View>

          {/* PURCHASE PRICE */}

          <View style={styles.fieldLast}>
            <Text style={styles.label}>
              Purchase Price
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.rupee}>
                ₹
              </Text>

              <TextInput
                value={purchasePrice}
                onChangeText={
                  setPurchasePrice
                }
                placeholder="0"
                placeholderTextColor={
                  COLORS.placeholder
                }
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
          </View>
        </View>

        {/* SUPPLIER */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="business-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Supplier Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Vendor details
              </Text>
            </View>
          </View>

          <View style={styles.fieldLast}>
            <Text style={styles.label}>
              Vendor / Supplier
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="business-outline"
                size={19}
                color={COLORS.primary}
              />

              <TextInput
                value={vendor}
                onChangeText={setVendor}
                placeholder="Supplier name"
                placeholderTextColor={
                  COLORS.placeholder
                }
                style={styles.input}
              />
            </View>
          </View>
        </View>

        {/* NOTES */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Notes
              </Text>

              <Text style={styles.sectionSubtitle}>
                Additional information
              </Text>
            </View>
          </View>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional information..."
            placeholderTextColor={
              COLORS.placeholder
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.notesInput}
          />
        </View>

        {/* CREATE BUTTON */}

        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            creating && styles.disabledButton,
            pressed &&
              !creating &&
              styles.createButtonPressed,
          ]}
          disabled={creating}
          onPress={handleCreate}
        >
          {creating ? (
            <ActivityIndicator
              size="small"
              color={COLORS.white}
            />
          ) : (
            <>
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={COLORS.white}
              />

              <Text
                style={styles.createButtonText}
              >
                Add Product
              </Text>
            </>
          )}
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 15,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backButtonPressed: {
    opacity: 0.7,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.muted,
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  content: {
    padding: 16,
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  section: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.muted,
  },

  // ==========================================================
  // FIELDS
  // ==========================================================

  field: {
    marginBottom: 15,
  },

  fieldLast: {
    marginBottom: 0,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 7,
  },

  helperText: {
    fontSize: 10,
    color: COLORS.muted,
    marginBottom: 6,
  },

  inputContainer: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCF8F6",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 10,
  },

  selectText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },

  placeholderText: {
    color: COLORS.placeholder,
    fontWeight: "400",
  },

  rupee: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
  },

  notesInput: {
    minHeight: 110,
    backgroundColor: "#FCF8F6",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    fontSize: 14,
    color: COLORS.text,
  },

  // ==========================================================
  // DROPDOWN
  // ==========================================================

  dropdown: {
    marginTop: 6,
    backgroundColor: COLORS.card,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  dropdownItem: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  dropdownItemPressed: {
    backgroundColor: COLORS.primaryLight,
  },

  dropdownText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },

  // ==========================================================
  // BUTTON
  // ==========================================================

  createButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },

  createButtonPressed: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 0.99 }],
  },

  disabledButton: {
    opacity: 0.6,
  },

  createButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },
});