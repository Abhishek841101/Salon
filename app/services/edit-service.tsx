import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../src/store";
import {
  getServiceById,
  updateService,
  clearServiceError,
  clearServiceSuccess,
} from "../../src/features/services/serviceSlice";

type ServiceImage = {
  uri: string;
  name?: string;
  type?: string;
};

type Service = {
  _id: string;
  name: string;
  category?: string;
  price: number;
  duration: number;
  description?: string;
  isActive: boolean;
  image?: {
    url?: string;
    publicId?: string;
  };
};

export default function EditServiceScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    service,
    detailsLoading,
    saving,
    error,
    success,
  } = useSelector((state: RootState) => state.services);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ServiceImage | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    if (!id) {
      Alert.alert(
        "Error",
        "Service ID is missing",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }

    dispatch(getServiceById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (!service) return;

    const currentService = service as Service;

    setName(currentService.name || "");
    setCategory(currentService.category || "");
    setPrice(
      currentService.price !== undefined &&
        currentService.price !== null
        ? String(currentService.price)
        : ""
    );
    setDuration(
      currentService.duration !== undefined &&
        currentService.duration !== null
        ? String(currentService.duration)
        : "30"
    );
    setDescription(currentService.description || "");
    setIsActive(
      currentService.isActive !== undefined
        ? currentService.isActive
        : true
    );
    setImagePreview(currentService.image?.url || "");
    setSelectedImage(null);
    setLoadingInitial(false);
  }, [service]);

  useEffect(() => {
    if (error) {
      setLoadingInitial(false);
    }
  }, [error]);

  useEffect(() => {
    if (!success) return;

    Alert.alert(
      "Service Updated",
      "Service details have been updated successfully.",
      [
        {
          text: "OK",
          onPress: () => {
            dispatch(clearServiceSuccess());
            router.replace("/services");
          },
        },
      ]
    );
  }, [success, dispatch]);

  const handlePickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access to change the service image."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.85,
        });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      const fileName =
        asset.fileName ||
        `service-${Date.now()}.jpg`;

      const mimeType =
        asset.mimeType ||
        "image/jpeg";

      setSelectedImage({
        uri: asset.uri,
        name: fileName,
        type: mimeType,
      });

      setImagePreview(asset.uri);
    } catch (err) {
      console.log("IMAGE PICK ERROR:", err);

      Alert.alert(
        "Error",
        "Unable to select image."
      );
    }
  };

  const validateForm = () => {
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const trimmedPrice = price.trim();
    const trimmedDuration = duration.trim();

    if (!trimmedName) {
      Alert.alert(
        "Validation",
        "Service name is required."
      );
      return false;
    }

    if (!trimmedCategory) {
      Alert.alert(
        "Validation",
        "Service category is required."
      );
      return false;
    }

    if (!trimmedPrice) {
      Alert.alert(
        "Validation",
        "Service price is required."
      );
      return false;
    }

    const numericPrice = Number(trimmedPrice);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      Alert.alert(
        "Validation",
        "Please enter a valid service price."
      );
      return false;
    }

    if (!trimmedDuration) {
      Alert.alert(
        "Validation",
        "Service duration is required."
      );
      return false;
    }

    const numericDuration =
      Number(trimmedDuration);

    if (
      Number.isNaN(numericDuration) ||
      numericDuration < 1
    ) {
      Alert.alert(
        "Validation",
        "Duration must be at least 1 minute."
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!id) {
      Alert.alert(
        "Error",
        "Service ID is missing."
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      dispatch(clearServiceError());

      await dispatch(
        updateService({
          id,
          name: name.trim(),
          category: category.trim(),
          price: Number(price),
          duration: Number(duration),
          description: description.trim(),
          isActive,
          image: selectedImage || undefined,
        })
      ).unwrap();
    } catch (err: any) {
      console.log(
        "UPDATE SERVICE SCREEN ERROR:",
        err
      );

      Alert.alert(
        "Update Failed",
        String(
          err ||
            "Unable to update service."
        )
      );
    }
  };

  const handleBack = () => {
    if (saving) return;
    router.back();
  };

  if (detailsLoading || loadingInitial) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />

        <ActivityIndicator
          size="large"
          color="#70243A"
        />

        <Text style={styles.loadingTitle}>
          Loading service...
        </Text>

        <Text style={styles.loadingSubtitle}>
          Please wait while we load the service details.
        </Text>
      </View>
    );
  }

  if (!service && error) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />

        <View style={styles.errorIconBox}>
          <Text style={styles.errorIcon}>
            !
          </Text>
        </View>

        <Text style={styles.loadingTitle}>
          Unable to load service
        </Text>

        <Text style={styles.loadingSubtitle}>
          {String(error)}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => {
            if (id) {
              dispatch(getServiceById(id));
            }
          }}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>

        <Pressable
          style={styles.backSecondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backSecondaryText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
      >
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={handleBack}
              disabled={saving}
            >
              <Text style={styles.backIcon}>
                ‹
              </Text>
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.eyebrow}>
                SALON MANAGEMENT
              </Text>

              <Text style={styles.title}>
                Edit Service
              </Text>

              <Text style={styles.subtitle}>
                Update your service details
              </Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.scrollContent
            }
          >
            <View style={styles.heroCard}>
              <View style={styles.heroIconBox}>
                <Text style={styles.heroIcon}>
                  ✦
                </Text>
              </View>

              <View style={styles.heroTextBox}>
                <Text style={styles.heroTitle}>
                  Service Information
                </Text>

                <Text style={styles.heroSubtitle}>
                  Keep your pricing, duration and service details up to date.
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Service Image
              </Text>

              <Text style={styles.sectionSubtitle}>
                Change the image if you want.
              </Text>

              <Pressable
                style={styles.imageCard}
                onPress={handlePickImage}
                disabled={saving}
              >
                {imagePreview ? (
                  <Image
                    source={{
                      uri: imagePreview,
                    }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View
                    style={
                      styles.imagePlaceholder
                    }
                  >
                    <Text
                      style={
                        styles.imagePlaceholderIcon
                      }
                    >
                      ✦
                    </Text>

                    <Text
                      style={
                        styles.imagePlaceholderTitle
                      }
                    >
                      No Image
                    </Text>
                  </View>
                )}

                <View style={styles.imageOverlay}>
                  <View
                    style={
                      styles.changeImageButton
                    }
                  >
                    <Text
                      style={
                        styles.changeImageIcon
                      }
                    >
                      ✎
                    </Text>

                    <Text
                      style={
                        styles.changeImageText
                      }
                    >
                      Change Image
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Basic Details
              </Text>

              <Text style={styles.sectionSubtitle}>
                Update the service information.
              </Text>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Service Name
                </Text>

                <View style={styles.inputContainer}>
                  <Text
                    style={styles.inputIcon}
                  >
                    ✦
                  </Text>

                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter service name"
                    placeholderTextColor="#B5A8AB"
                    style={styles.input}
                    editable={!saving}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Category
                </Text>

                <View style={styles.inputContainer}>
                  <Text
                    style={styles.inputIcon}
                  >
                    ◇
                  </Text>

                  <TextInput
                    value={category}
                    onChangeText={setCategory}
                    placeholder="Hair, Facial, Spa..."
                    placeholderTextColor="#B5A8AB"
                    style={styles.input}
                    editable={!saving}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View
                  style={[
                    styles.field,
                    styles.halfField,
                  ]}
                >
                  <Text style={styles.label}>
                    Price
                  </Text>

                  <View
                    style={
                      styles.inputContainer
                    }
                  >
                    <Text
                      style={
                        styles.inputIcon
                      }
                    >
                      ₹
                    </Text>

                    <TextInput
                      value={price}
                      onChangeText={setPrice}
                      placeholder="0"
                      placeholderTextColor="#B5A8AB"
                      style={styles.input}
                      editable={!saving}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.field,
                    styles.halfField,
                  ]}
                >
                  <Text style={styles.label}>
                    Duration
                  </Text>

                  <View
                    style={
                      styles.inputContainer
                    }
                  >
                    <Text
                      style={
                        styles.inputIcon
                      }
                    >
                      ◷
                    </Text>

                    <TextInput
                      value={duration}
                      onChangeText={setDuration}
                      placeholder="30"
                      placeholderTextColor="#B5A8AB"
                      style={styles.input}
                      editable={!saving}
                      keyboardType="number-pad"
                    />
                  </View>

                  <Text
                    style={
                      styles.helperText
                    }
                  >
                    Minutes
                  </Text>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Description
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    styles.textAreaContainer,
                  ]}
                >
                  <Text
                    style={[
                      styles.inputIcon,
                      styles.textAreaIcon,
                    ]}
                  >
                    ≋
                  </Text>

                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe this service..."
                    placeholderTextColor="#B5A8AB"
                    style={[
                      styles.input,
                      styles.textArea,
                    ]}
                    editable={!saving}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Service Status
              </Text>

              <Text style={styles.sectionSubtitle}>
                Control whether this service is available for booking.
              </Text>

              <View style={styles.statusCard}>
                <View
                  style={styles.statusLeft}
                >
                  <View
                    style={[
                      styles.statusIconBox,
                      isActive
                        ? styles.statusIconActive
                        : styles.statusIconInactive,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDotLarge,
                        isActive
                          ? styles.dotActive
                          : styles.dotInactive,
                      ]}
                    />
                  </View>

                  <View
                    style={styles.statusTextBox}
                  >
                    <Text
                      style={styles.statusTitle}
                    >
                      {isActive
                        ? "Active Service"
                        : "Inactive Service"}
                    </Text>

                    <Text
                      style={
                        styles.statusSubtitle
                      }
                    >
                      {isActive
                        ? "Service is available in the salon menu."
                        : "Service is hidden from the active menu."}
                    </Text>
                  </View>
                </View>

                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  disabled={saving}
                  trackColor={{
                    false: "#D9CCCF",
                    true: "#D9A9B4",
                  }}
                  thumbColor={
                    isActive
                      ? "#70243A"
                      : "#FFFFFF"
                  }
                />
              </View>
            </View>

            <View style={styles.warningCard}>
              <View
                style={styles.warningIconBox}
              >
                <Text
                  style={styles.warningIcon}
                >
                  !
                </Text>
              </View>

              <View
                style={styles.warningTextBox}
              >
                <Text
                  style={styles.warningTitle}
                >
                  Before saving
                </Text>

                <Text
                  style={styles.warningText}
                >
                  Price and duration changes will be used for future service bookings and bills.
                </Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.saveButton,
                saving &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.saveText}
                  >
                    Saving Changes...
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={styles.saveIcon}
                  >
                    ✓
                  </Text>

                  <Text
                    style={styles.saveText}
                  >
                    Save Changes
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={handleBack}
              disabled={saving}
            >
              <Text
                style={styles.cancelText}
              >
                Cancel
              </Text>
            </Pressable>

            <View
              style={styles.bottomSpace}
            />
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboard: {
    flex: 1,
  },
  header: {
    minHeight: 94,
    paddingHorizontal: 17,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0E5E2",
    backgroundColor: "#FCF7F4",
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#F2E3E0",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#70243A",
    fontSize: 31,
    lineHeight: 34,
    marginTop: -3,
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerSpacer: {
    width: 43,
  },
  eyebrow: {
    color: "#A09195",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    color: "#602032",
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "serif",
    marginTop: 2,
  },
  subtitle: {
    color: "#9B8E91",
    fontSize: 9,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 17,
    paddingTop: 16,
    paddingBottom: 30,
  },
  heroCard: {
    minHeight: 100,
    borderRadius: 22,
    backgroundColor: "#70243A",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F0D9D7",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIcon: {
    color: "#76253A",
    fontSize: 22,
  },
  heroTextBox: {
    flex: 1,
    paddingLeft: 13,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#EBD4D5",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
  },
  section: {
    marginBottom: 21,
  },
  sectionTitle: {
    color: "#342A2D",
    fontSize: 19,
    fontFamily: "serif",
    fontWeight: "600",
  },
  sectionSubtitle: {
    color: "#9B8E91",
    fontSize: 8,
    lineHeight: 13,
    marginTop: 3,
    marginBottom: 11,
  },
  imageCard: {
    height: 205,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F8E9E6",
    borderWidth: 1,
    borderColor: "#F0E5E2",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderIcon: {
    color: "#76253A",
    fontSize: 28,
  },
  imagePlaceholderTitle: {
    color: "#8E8084",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 8,
  },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    alignItems: "flex-end",
  },
  changeImageButton: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: "rgba(112,36,58,0.94)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  changeImageIcon: {
    color: "#FFFFFF",
    fontSize: 13,
    marginRight: 6,
  },
  changeImageText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: "#514549",
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 6,
  },
  inputContainer: {
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E9DDDA",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  inputIcon: {
    width: 23,
    color: "#8B3B50",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  input: {
    flex: 1,
    color: "#342A2D",
    fontSize: 11,
    paddingVertical: 0,
    marginLeft: 6,
    minHeight: 46,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfField: {
    width: "48%",
  },
  helperText: {
    color: "#A09195",
    fontSize: 7,
    marginTop: 4,
  },
  textAreaContainer: {
    minHeight: 110,
    alignItems: "flex-start",
    paddingTop: 12,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textArea: {
    minHeight: 90,
    paddingTop: 0,
    lineHeight: 17,
  },
  statusCard: {
    minHeight: 78,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0E5E2",
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statusIconBox: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconActive: {
    backgroundColor: "#F2F8F2",
  },
  statusIconInactive: {
    backgroundColor: "#F4EEEE",
  },
  statusDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotActive: {
    backgroundColor: "#5B9A67",
  },
  dotInactive: {
    backgroundColor: "#9C8E91",
  },
  statusTextBox: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 8,
  },
  statusTitle: {
    color: "#342A2D",
    fontSize: 10,
    fontWeight: "800",
  },
  statusSubtitle: {
    color: "#9A8C90",
    fontSize: 7,
    lineHeight: 12,
    marginTop: 3,
  },
  warningCard: {
    minHeight: 74,
    borderRadius: 17,
    backgroundColor: "#FFF8F0",
    borderWidth: 1,
    borderColor: "#F2E4D4",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  warningIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F4E3D2",
    alignItems: "center",
    justifyContent: "center",
  },
  warningIcon: {
    color: "#9A6330",
    fontSize: 15,
    fontWeight: "900",
  },
  warningTextBox: {
    flex: 1,
    paddingLeft: 10,
  },
  warningTitle: {
    color: "#654A37",
    fontSize: 9,
    fontWeight: "800",
  },
  warningText: {
    color: "#9A8170",
    fontSize: 7,
    lineHeight: 12,
    marginTop: 3,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: "#70243A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginRight: 8,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  cancelButton: {
    height: 45,
    borderRadius: 14,
    backgroundColor: "#F2E3E0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
  },
  cancelText: {
    color: "#70243A",
    fontSize: 10,
    fontWeight: "800",
  },
  bottomSpace: {
    height: 35,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FCF7F4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  loadingTitle: {
    color: "#342A2D",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 15,
  },
  loadingSubtitle: {
    color: "#9A8C90",
    fontSize: 9,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 6,
  },
  errorIconBox: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
  },
  errorIcon: {
    color: "#76253A",
    fontSize: 25,
    fontWeight: "900",
  },
  retryButton: {
    minWidth: 120,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#70243A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 17,
    marginTop: 17,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  backSecondaryButton: {
    minWidth: 120,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F2E3E0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 17,
    marginTop: 9,
  },
  backSecondaryText: {
    color: "#70243A",
    fontSize: 10,
    fontWeight: "800",
  },
});