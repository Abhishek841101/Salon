import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  createClient,
  clearClientError,
} from "../../src/features/clients/clientsSlice";

/* ============================================================
   SCREEN
============================================================ */

export default function AddClientScreen() {
  const dispatch =
    useDispatch<any>();

  /* ==========================================================
     AUTH
  ========================================================== */

  const token =
    useSelector(
      (state: any) =>
        state.auth?.token
    );

  /* ==========================================================
     CLIENT STATE
  ========================================================== */

  const createLoading =
    useSelector(
      (state: any) =>
        state.clients
          ?.createLoading ||
        false
    );

  const reduxError =
    useSelector(
      (state: any) =>
        state.clients?.error ||
        null
    );

  /* ==========================================================
     FORM
  ========================================================== */

  const [
    name,
    setName,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    gender,
    setGender,
  ] = useState("");

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    dateOfBirth,
    setDateOfBirth,
  ] =
    useState<Date | null>(
      null
    );

  /* ==========================================================
     IMAGE
  ========================================================== */

  const [
    profileImage,
    setProfileImage,
  ] =
    useState<any>(null);

  /* ==========================================================
     LOCAL ERROR
  ========================================================== */

  const [
    localError,
    setLocalError,
  ] = useState("");

  /* ==========================================================
     CLEAR ERROR
  ========================================================== */

  useEffect(() => {
    dispatch(
      clearClientError()
    );
  }, [dispatch]);

  /* ==========================================================
     IMAGE PICKER
  ========================================================== */

  const pickImage =
    async () => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {
          Alert.alert(
            "Permission Required",
            "Please allow photo library permission."
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: [
                "images",
              ],

              allowsEditing:
                true,

              aspect: [
                1,
                1,
              ],

              quality:
                0.85,
            }
          );

        if (
          result.canceled
        ) {
          return;
        }

        const asset =
          result.assets?.[0];

        if (!asset?.uri) {
          Alert.alert(
            "Error",
            "Unable to get selected image."
          );

          return;
        }

        const image = {
          uri: asset.uri,

          name:
            asset.fileName ||
            `client-${Date.now()}.jpg`,

          type:
            asset.mimeType ||
            "image/jpeg",
        };

        console.log(
          "========================================"
        );

        console.log(
          "SELECTED CLIENT IMAGE:",
          image
        );

        console.log(
          "========================================"
        );

        setProfileImage(
          image
        );
      } catch (error) {
        console.error(
          "IMAGE PICKER ERROR:",
          error
        );

        Alert.alert(
          "Error",
          "Unable to select image."
        );
      }
    };

  /* ==========================================================
     REMOVE IMAGE
  ========================================================== */

  const removeImage =
    () => {
      setProfileImage(
        null
      );
    };

  /* ==========================================================
     DATE PICKER
     
     Android imperative API avoids deprecated onChange.
  ========================================================== */

  const openDatePicker =
    () => {
      const currentDate =
        dateOfBirth ||
        new Date();

      DateTimePickerAndroid.open(
        {
          value:
            currentDate,

          mode:
            "date",

          maximumDate:
            new Date(),

          onValueChange:
            (
              _event,
              selectedDate
            ) => {
              if (
                selectedDate
              ) {
                setDateOfBirth(
                  selectedDate
                );
              }
            },

          onDismiss:
            () => {},

          onNeutralButtonPress:
            () => {
              setDateOfBirth(
                null
              );
            },
        }
      );
    };

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validateForm =
    () => {
      if (
        !name.trim()
      ) {
        Alert.alert(
          "Required",
          "Please enter client name."
        );

        return false;
      }

      if (
        !phone.trim()
      ) {
        Alert.alert(
          "Required",
          "Please enter client phone number."
        );

        return false;
      }

      const cleanPhone =
        phone.replace(
          /\D/g,
          ""
        );

      if (
        cleanPhone.length <
        10
      ) {
        Alert.alert(
          "Invalid Phone",
          "Please enter a valid 10 digit phone number."
        );

        return false;
      }

      return true;
    };

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit =
    async () => {
      setLocalError("");

      if (!token) {
        Alert.alert(
          "Session Expired",
          "Please login again."
        );

        router.replace(
          "/auth/login"
        );

        return;
      }

      if (
        !validateForm()
      ) {
        return;
      }

      try {
        dispatch(
          clearClientError()
        );

        console.log(
          "========================================"
        );

        console.log(
          "CREATING CLIENT..."
        );

        console.log(
          "NAME:",
          name.trim()
        );

        console.log(
          "PHONE:",
          phone.trim()
        );

        console.log(
          "EMAIL:",
          email.trim()
        );

        console.log(
          "GENDER:",
          gender
        );

        console.log(
          "DOB:",
          dateOfBirth
        );

        console.log(
          "IMAGE:",
          profileImage?.uri
            ? "YES"
            : "NO"
        );

        console.log(
          "TOKEN:",
          !!token
        );

        console.log(
          "========================================"
        );

        const result =
          await dispatch(
            createClient(
              {
                token,

                name:
                  name.trim(),

                phone:
                  phone.trim(),

                email:
                  email.trim(),

                gender,

                dateOfBirth:
                  dateOfBirth
                    ? dateOfBirth.toISOString()
                    : null,

                address:
                  address.trim(),

                notes:
                  notes.trim(),

                profileImage,
              }
            )
          );

        if (
          createClient.fulfilled.match(
            result
          )
        ) {
          Alert.alert(
            "Success",
            "Client added successfully.",
            [
              {
                text: "OK",

                onPress:
                  () => {
                    router.back();
                  },
              },
            ]
          );

          return;
        }

        const message =
          result.payload ||
          "Unable to create client.";

        setLocalError(
          String(message)
        );

        Alert.alert(
          "Unable to Add Client",
          String(message)
        );
      } catch (error: any) {
        console.error(
          "CREATE CLIENT SCREEN ERROR:",
          error
        );

        const message =
          error?.message ||
          "Unable to create client.";

        setLocalError(
          message
        );

        Alert.alert(
          "Error",
          message
        );
      }
    };

  /* ==========================================================
     DATE DISPLAY
  ========================================================== */

  const formattedDate =
    dateOfBirth
      ? dateOfBirth.toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )
      : "Select date of birth";

  /* ==========================================================
     ERROR
  ========================================================== */

  const displayError =
    localError ||
    reduxError;

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      <StatusBar
        style="dark"
      />

      <KeyboardAvoidingView
        style={
          styles.flex
        }
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#3A1821"
            />
          </Pressable>

          <View
            style={
              styles.headerCenter
            }
          >
            <Text
              style={
                styles.headerTitle
              }
            >
              Add Client
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Create a new client profile
            </Text>
          </View>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {/* ==================================================
            FORM
        ================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* ==================================================
              PROFILE IMAGE
          ================================================== */}

          <View
            style={
              styles.imageSection
            }
          >
            <Pressable
              onPress={
                pickImage
              }
              style={
                styles.imageWrapper
              }
            >
              {profileImage?.uri ? (
                <Image
                  source={{
                    uri: profileImage.uri,
                  }}
                  style={
                    styles.profileImage
                  }
                />
              ) : (
                <View
                  style={
                    styles.imagePlaceholder
                  }
                >
                  <Ionicons
                    name="person"
                    size={48}
                    color="#A93650"
                  />

                  <Text
                    style={
                      styles.imageText
                    }
                  >
                    Add Photo
                  </Text>
                </View>
              )}

              <View
                style={
                  styles.cameraButton
                }
              >
                <Ionicons
                  name="camera"
                  size={18}
                  color="#FFFFFF"
                />
              </View>
            </Pressable>

            {profileImage?.uri && (
              <Pressable
                onPress={
                  removeImage
                }
                style={
                  styles.removeImageButton
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color="#C62828"
                />

                <Text
                  style={
                    styles.removeImageText
                  }
                >
                  Remove photo
                </Text>
              </Pressable>
            )}
          </View>

          {/* ==================================================
              ERROR
          ================================================== */}

          {displayError ? (
            <View
              style={
                styles.errorBox
              }
            >
              <Ionicons
                name="alert-circle"
                size={20}
                color="#B3261E"
              />

              <Text
                style={
                  styles.errorText
                }
              >
                {String(
                  displayError
                )}
              </Text>
            </View>
          ) : null}

          {/* ==================================================
              NAME
          ================================================== */}

          <View
            style={
              styles.field
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Client Name *
            </Text>

            <TextInput
              value={name}
              onChangeText={
                setName
              }
              placeholder="Enter client name"
              placeholderTextColor="#999"
              style={
                styles.input
              }
              autoCapitalize="words"
            />
          </View>

          {/* ==================================================
              PHONE
          ================================================== */}

          <View
            style={
              styles.field
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Phone Number *
            </Text>

            <TextInput
              value={phone}
              onChangeText={
                setPhone
              }
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              style={
                styles.input
              }
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* ==================================================
              EMAIL
          ================================================== */}

          <View
            style={
              styles.field
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Email
            </Text>

            <TextInput
              value={email}
              onChangeText={
                setEmail
              }
              placeholder="Enter email address"
              placeholderTextColor="#999"
              style={
                styles.input
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* ==================================================
              GENDER
          ================================================== */}

          <View
            style={
              styles.field
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Gender
            </Text>

            <View
              style={
                styles.genderRow
              }
            >
              {[
                "Male",
                "Female",
                "Other",
              ].map(
                (
                  item
                ) => (
                  <Pressable
                    key={
                      item
                    }
                    onPress={() =>
                      setGender(
                        item
                      )
                    }
                    style={[
                      styles.genderButton,
                      gender ===
                        item &&
                        styles.genderButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender ===
                          item &&
                          styles.genderTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          </View>

          {/* ==================================================
              DOB
          ================================================== */}

          <View
            style={
              styles.field
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Date of Birth
            </Text>

            <Pressable
              onPress={
                openDatePicker
              }
              style={
                styles.input
              }
            >
              <View
                style={
                  styles.dateRow
                }
              >
                <Text
                  style={[
                    styles.dateText,
                    !dateOfBirth &&
                      styles.placeholderText,
                  ]}
                >
                  {
                    formattedDate
                  }
                </Text>

                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#A93650"
                />
              </View>
            </Pressable>
          </View>

          {/* ==================================================
              ADDRESS
          ================================================== */}

          <View
            style={
              styles.field
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Address
            </Text>

            <TextInput
              value={address}
              onChangeText={
                setAddress
              }
              placeholder="Enter address"
              placeholderTextColor="#999"
              style={[
                styles.input,
                styles.multilineInput,
              ]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* ==================================================
              NOTES
          ================================================== */}

          <View
            style={
              styles.field
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Notes
            </Text>

            <TextInput
              value={notes}
              onChangeText={
                setNotes
              }
              placeholder="Add notes"
              placeholderTextColor="#999"
              style={[
                styles.input,
                styles.multilineInput,
              ]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* ==================================================
              SAVE
          ================================================== */}

          <Pressable
            onPress={
              handleSubmit
            }
            disabled={
              createLoading
            }
            style={[
              styles.submitButton,
              createLoading &&
                styles.submitButtonDisabled,
            ]}
          >
            {createLoading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.submitText
                  }
                >
                  Add Client
                </Text>
              </>
            )}
          </Pressable>

          <View
            style={
              styles.bottomSpace
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FFF8F8",
    },

    flex: {
      flex: 1,
    },

    header: {
      minHeight: 78,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 18,
      paddingTop:
        Platform.OS ===
        "android"
          ? 8
          : 0,
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F0E3E6",
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFF0F3",
    },

    headerCenter: {
      flex: 1,
      marginLeft: 12,
    },

    headerTitle: {
      fontSize: 21,
      fontWeight:
        "800",
      color: "#3A1821",
    },

    headerSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color: "#8B7078",
    },

    headerSpacer: {
      width: 42,
    },

    scrollContent: {
      padding: 18,
      paddingBottom: 40,
    },

    imageSection: {
      alignItems:
        "center",
      marginBottom: 22,
    },

    imageWrapper: {
      width: 118,
      height: 118,
      borderRadius: 59,
      overflow: "visible",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FBECEF",
      position: "relative",
    },

    profileImage: {
      width: 118,
      height: 118,
      borderRadius: 59,
      backgroundColor:
        "#FBECEF",
    },

    imagePlaceholder: {
      width: 118,
      height: 118,
      borderRadius: 59,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FBECEF",
      borderWidth: 1,
      borderColor:
        "#E8B8C4",
      borderStyle:
        "dashed",
    },

    imageText: {
      marginTop: 3,
      fontSize: 11,
      fontWeight:
        "700",
      color: "#A93650",
    },

    cameraButton: {
      position:
        "absolute",
      right: -2,
      bottom: 2,
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#A93650",
      borderWidth: 3,
      borderColor:
        "#FFFFFF",
    },

    removeImageButton: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 10,
      gap: 5,
    },

    removeImageText: {
      fontSize: 13,
      fontWeight:
        "700",
      color: "#C62828",
    },

    errorBox: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
      backgroundColor:
        "#FDECEC",
      borderWidth: 1,
      borderColor:
        "#F2B8B5",
    },

    errorText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: "#B3261E",
      fontWeight:
        "600",
    },

    field: {
      marginBottom: 17,
    },

    label: {
      marginBottom: 8,
      fontSize: 14,
      fontWeight:
        "700",
      color: "#3A1821",
    },

    input: {
      minHeight: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "#E5D6DA",
      backgroundColor:
        "#FFFFFF",
      paddingHorizontal: 15,
      fontSize: 15,
      color: "#24151A",
    },

    multilineInput: {
      minHeight: 100,
      paddingTop: 14,
      paddingBottom: 14,
    },

    genderRow: {
      flexDirection:
        "row",
      gap: 9,
    },

    genderButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 11,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5D6DA",
    },

    genderButtonActive: {
      backgroundColor:
        "#A93650",
      borderColor:
        "#A93650",
    },

    genderText: {
      fontSize: 14,
      fontWeight:
        "700",
      color: "#705963",
    },

    genderTextActive: {
      color: "#FFFFFF",
    },

    dateRow: {
      flex: 1,
      minHeight: 50,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    dateText: {
      fontSize: 15,
      color: "#24151A",
    },

    placeholderText: {
      color: "#999999",
    },

    submitButton: {
      minHeight: 56,
      borderRadius: 14,
      marginTop: 6,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 9,
      backgroundColor:
        "#A93650",
      elevation: 3,
      shadowColor:
        "#000000",
      shadowOpacity:
        0.12,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 3,
      },
    },

    submitButtonDisabled: {
      opacity: 0.65,
    },

    submitText: {
      fontSize: 16,
      fontWeight:
        "800",
      color: "#FFFFFF",
    },

    bottomSpace: {
      height: 20,
    },
  });