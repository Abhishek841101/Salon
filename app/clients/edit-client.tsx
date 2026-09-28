import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";

import {
  getClientById,
  updateClient,
} from "../../src/features/clients/clientsSlice";

const EditClientScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const params = useLocalSearchParams();

  const clientId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const client = useSelector(
    (state: any) => state.clients?.client
  );

  const loading = useSelector(
    (state: any) => state.clients?.loading
  );

  const error = useSelector(
    (state: any) => state.clients?.error
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [saving, setSaving] = useState(false);

  /* =====================================================
     LOAD CLIENT
  ===================================================== */

  useEffect(() => {
    const loadClient = async () => {
      if (!clientId) {
        Alert.alert(
          "Error",
          "Client ID not found.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );

        return;
      }

      try {
        setInitialLoading(true);

        const result: any = await dispatch(
          getClientById(clientId) as any
        );

        if (
          result?.meta?.requestStatus !==
          "fulfilled"
        ) {
          Alert.alert(
            "Error",
            result?.payload ||
              "Unable to load client."
          );

          return;
        }

        const data =
          result?.payload?.client ||
          result?.payload?.data ||
          null;

        if (!data) {
          Alert.alert(
            "Error",
            "Client data not found."
          );

          return;
        }

        fillForm(data);
      } catch (err) {
        console.log(
          "EDIT CLIENT LOAD ERROR:",
          err
        );

        Alert.alert(
          "Error",
          "Failed to load client."
        );
      } finally {
        setInitialLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  /* =====================================================
     IF REDUX CLIENT CHANGES
  ===================================================== */

  useEffect(() => {
    if (client) {
      fillForm(client);
    }
  }, [client]);

  /* =====================================================
     FILL FORM
  ===================================================== */

  const fillForm = (data: any) => {
    setName(data?.name || "");
    setPhone(data?.phone || "");
    setEmail(data?.email || "");
    setGender(data?.gender || "");

    if (data?.dateOfBirth) {
      try {
        const date = new Date(
          data.dateOfBirth
        );

        if (!Number.isNaN(date.getTime())) {
          setDateOfBirth(
            date.toISOString().split("T")[0]
          );
        }
      } catch {
        setDateOfBirth("");
      }
    } else {
      setDateOfBirth("");
    }

    setAddress(data?.address || "");
    setNotes(data?.notes || "");
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validate = () => {
    if (!name.trim()) {
      Alert.alert(
        "Required",
        "Client name is required."
      );
      return false;
    }

    if (!phone.trim()) {
      Alert.alert(
        "Required",
        "Client phone number is required."
      );
      return false;
    }

    if (phone.trim().length < 10) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid phone number."
      );
      return false;
    }

    if (
      email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return false;
    }

    return true;
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!validate()) {
      return;
    }

    if (!clientId) {
      Alert.alert(
        "Error",
        "Client ID is missing."
      );
      return;
    }

    try {
      setSaving(true);

      console.log(
        "========================================"
      );
      console.log(
        "UPDATING CLIENT"
      );
      console.log(
        "CLIENT ID:",
        clientId
      );
      console.log(
        "NAME:",
        name
      );
      console.log(
        "PHONE:",
        phone
      );
      console.log(
        "EMAIL:",
        email
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
        "ADDRESS:",
        address
      );
      console.log(
        "NOTES:",
        notes
      );
      console.log(
        "========================================"
      );

      const updateData: any = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        gender: gender.trim(),
        address: address.trim(),
        notes: notes.trim(),
      };

      /*
       * Backend expects Date.
       * Send null when DOB is empty.
       */
      if (dateOfBirth.trim()) {
        const parsedDate =
          new Date(dateOfBirth);

        if (
          !Number.isNaN(
            parsedDate.getTime()
          )
        ) {
          updateData.dateOfBirth =
            parsedDate.toISOString();
        }
      } else {
        updateData.dateOfBirth = null;
      }

      const result: any =
        await dispatch(
          updateClient({
            id: clientId,
            ...updateData,
          }) as any
        );

      console.log(
        "UPDATE CLIENT RESULT:",
        result
      );

      if (
        result?.meta?.requestStatus !==
        "fulfilled"
      ) {
        Alert.alert(
          "Update Failed",
          result?.payload ||
            "Unable to update client."
        );

        return;
      }

      Alert.alert(
        "Success",
        "Client updated successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (err) {
      console.log(
        "UPDATE CLIENT ERROR:",
        err
      );

      Alert.alert(
        "Error",
        "Something went wrong while updating client."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (initialLoading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#A93650"
          />

          <Text style={styles.loadingText}>
            Loading client...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>
              Edit Client
            </Text>

            <Text style={styles.headerSubtitle}>
              Update client information
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* BASIC DETAILS */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Basic Details
            </Text>

            {/* NAME */}

            <Text style={styles.label}>
              Client Name *
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter client name"
              placeholderTextColor="#999"
              style={styles.input}
              autoCapitalize="words"
            />

            {/* PHONE */}

            <Text style={styles.label}>
              Phone Number *
            </Text>

            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={15}
            />

            {/* EMAIL */}

            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* PERSONAL DETAILS */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Personal Details
            </Text>

            {/* GENDER */}

            <Text style={styles.label}>
              Gender
            </Text>

            <View style={styles.genderRow}>
              {[
                "Male",
                "Female",
                "Other",
              ].map((item) => {
                const selected =
                  gender === item;

                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.genderButton,
                      selected &&
                        styles.genderButtonSelected,
                    ]}
                    onPress={() =>
                      setGender(item)
                    }
                  >
                    <Text
                      style={[
                        styles.genderText,
                        selected &&
                          styles.genderTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* DOB */}

            <Text style={styles.label}>
              Date of Birth
            </Text>

            <TextInput
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.helperText}>
              Format: YYYY-MM-DD
            </Text>

            {/* ADDRESS */}

            <Text style={styles.label}>
              Address
            </Text>

            <TextInput
              value={address}
              onChangeText={setAddress}
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

          {/* NOTES */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Notes
            </Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this client"
              placeholderTextColor="#999"
              style={[
                styles.input,
                styles.notesInput,
              ]}
              multiline
              numberOfLines={5}
              maxLength={1000}
              textAlignVertical="top"
            />

            <Text style={styles.counter}>
              {notes.length}/1000
            </Text>
          </View>

          {/* ERROR */}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* SAVE */}

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text style={styles.saveText}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          {/* CANCEL */}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditClientScreen;

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F7F8",
  },

  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F7E9ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: "#A93650",
    marginTop: -3,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#202020",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#888",
  },

  scrollContent: {
    padding: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    marginBottom: 15,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#242424",
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 7,
    marginTop: 4,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 11,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
    color: "#222",
    fontSize: 15,
    marginBottom: 14,
  },

  multilineInput: {
    height: 90,
    paddingTop: 13,
  },

  notesInput: {
    height: 120,
    paddingTop: 13,
    marginBottom: 4,
  },

  helperText: {
    fontSize: 11,
    color: "#999",
    marginTop: -9,
    marginBottom: 12,
  },

  genderRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
  },

  genderButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
  },

  genderButtonSelected: {
    backgroundColor: "#F7E5EA",
    borderColor: "#A93650",
  },

  genderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },

  genderTextSelected: {
    color: "#A93650",
  },

  counter: {
    textAlign: "right",
    fontSize: 11,
    color: "#999",
  },

  errorBox: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFD0D0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },

  errorText: {
    color: "#C62828",
    fontSize: 13,
  },

  saveButton: {
    height: 54,
    borderRadius: 13,
    backgroundColor: "#A93650",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  cancelText: {
    color: "#555",
    fontSize: 15,
    fontWeight: "600",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#777",
    fontSize: 14,
  },
});