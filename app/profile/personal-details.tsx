import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

const MAROON = "#70253B";

export default function PersonalDetailsScreen() {
  const [name, setName] = useState("COZ`E Guest");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [gender, setGender] = useState("Prefer not to say");

  const [hair, setHair] = useState(true);
  const [skin, setSkin] = useState(false);
  const [nails, setNails] = useState(false);
  const [makeup, setMakeup] = useState(false);

  const [saving, setSaving] = useState(false);

  const formattedDOB = useMemo(() => {
    if (!dateOfBirth) return "";

    const day = String(dateOfBirth.getDate()).padStart(2, "0");
    const month = String(
      dateOfBirth.getMonth() + 1
    ).padStart(2, "0");
    const year = dateOfBirth.getFullYear();

    return `${day}/${month}/${year}`;
  }, [dateOfBirth]);

  const handleDateChange = (
    event: any,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(
        "Name required",
        "Please enter your full name."
      );
      return;
    }

    if (email.trim() && !email.includes("@")) {
      Alert.alert(
        "Invalid email",
        "Please enter a valid email address."
      );
      return;
    }

    if (phone.trim() && phone.length < 10) {
      Alert.alert(
        "Invalid phone",
        "Please enter a valid phone number."
      );
      return;
    }

    setSaving(true);

    /*
      BACKEND WILL BE CONNECTED HERE LATER.

      Example future API:

      await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          dateOfBirth,
          gender,
          preferences: {
            hair,
            skin,
            nails,
            makeup,
          },
        }),
      });
    */

    setTimeout(() => {
      setSaving(false);

      Alert.alert(
        "Profile Updated",
        "Your details have been updated successfully.",
        [
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ]
      );
    }, 500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {/* ================= HEADER ================= */}

            <View style={styles.header}>
              <Pressable
                style={styles.headerButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backIcon}>‹</Text>
              </Pressable>

              <View style={styles.headerCenter}>
                <Text style={styles.brand}>
                  COZ`E SALON
                </Text>

                <Text style={styles.headerTitle}>
                  Personal Details
                </Text>
              </View>

              <View style={styles.headerRight} />
            </View>

            {/* ================= INTRO ================= */}

            <View style={styles.intro}>
              <Text style={styles.eyebrow}>
                YOUR PROFILE
              </Text>

              <Text style={styles.pageTitle}>
                Tell us about you
              </Text>

              <Text style={styles.pageSubtitle}>
                Keep your details updated for a more
                personalized salon experience.
              </Text>
            </View>

            {/* ================= PROFILE PHOTO ================= */}

            <View style={styles.photoSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {name.trim()
                    ? name.trim().charAt(0).toUpperCase()
                    : "G"}
                </Text>
              </View>

              <Pressable
                style={styles.photoButton}
                onPress={() =>
                  Alert.alert(
                    "Profile Photo",
                    "Photo upload will be connected later."
                  )
                }
              >
                <Text style={styles.photoButtonText}>
                  Change profile photo
                </Text>
              </Pressable>
            </View>

            {/* ================= BASIC DETAILS ================= */}

            <Text style={styles.sectionTitle}>
              BASIC DETAILS
            </Text>

            <View style={styles.card}>
              <InputField
                label="FULL NAME"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                autoCapitalize="words"
              />

              <InputField
                label="EMAIL ADDRESS"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <InputField
                label="PHONE NUMBER"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />

              {/* DOB */}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  DATE OF BIRTH
                </Text>

                <Pressable
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.dateLeft}>
                    <Text
                      style={[
                        styles.dateText,
                        !formattedDOB &&
                          styles.placeholder,
                      ]}
                    >
                      {formattedDOB ||
                        "Select your date of birth"}
                    </Text>
                  </View>

                  <View style={styles.calendarButton}>
                    <Text style={styles.calendarIcon}>
                      ▣
                    </Text>
                  </View>
                </Pressable>

                {showDatePicker && (
                  <DateTimePicker
                    value={
                      dateOfBirth ||
                      new Date(2000, 0, 1)
                    }
                    mode="date"
                    display={
                      Platform.OS === "ios"
                        ? "spinner"
                        : "default"
                    }
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                  />
                )}

                {Platform.OS === "ios" &&
                  showDatePicker && (
                    <Pressable
                      style={styles.doneDateButton}
                      onPress={() =>
                        setShowDatePicker(false)
                      }
                    >
                      <Text
                        style={
                          styles.doneDateText
                        }
                      >
                        Done
                      </Text>
                    </Pressable>
                  )}
              </View>
            </View>

            {/* ================= GENDER ================= */}

            <Text style={styles.sectionTitle}>
              GENDER
            </Text>

            <View style={styles.card}>
              <Text style={styles.preferenceTitle}>
                How would you like us to address you?
              </Text>

              <View style={styles.genderContainer}>
                <GenderOption
                  title="Female"
                  selected={gender === "Female"}
                  onPress={() =>
                    setGender("Female")
                  }
                />

                <GenderOption
                  title="Male"
                  selected={gender === "Male"}
                  onPress={() =>
                    setGender("Male")
                  }
                />

                <GenderOption
                  title="Other"
                  selected={gender === "Other"}
                  onPress={() =>
                    setGender("Other")
                  }
                />

                <GenderOption
                  title="Prefer not to say"
                  selected={
                    gender === "Prefer not to say"
                  }
                  onPress={() =>
                    setGender("Prefer not to say")
                  }
                />
              </View>
            </View>

            {/* ================= BEAUTY PREFERENCES ================= */}

            <Text style={styles.sectionTitle}>
              BEAUTY PREFERENCES
            </Text>

            <View style={styles.card}>
              <Text style={styles.preferenceTitle}>
                What do you usually book?
              </Text>

              <Text style={styles.preferenceSubtitle}>
                Select everything you are interested in.
              </Text>

              <View style={styles.chips}>
                <PreferenceChip
                  text="Hair"
                  selected={hair}
                  onPress={() => setHair(!hair)}
                />

                <PreferenceChip
                  text="Skin"
                  selected={skin}
                  onPress={() => setSkin(!skin)}
                />

                <PreferenceChip
                  text="Nails"
                  selected={nails}
                  onPress={() =>
                    setNails(!nails)
                  }
                />

                <PreferenceChip
                  text="Makeup"
                  selected={makeup}
                  onPress={() =>
                    setMakeup(!makeup)
                  }
                />
              </View>
            </View>

            {/* ================= SAVE ================= */}

            <Pressable
              style={[
                styles.saveButton,
                saving && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </Text>

              {!saving && (
                <View style={styles.saveArrow}>
                  <Text style={styles.arrow}>
                    →
                  </Text>
                </View>
              )}
            </Pressable>

            <Text style={styles.privateText}>
              Your personal information is kept private
              and secure.
            </Text>

            <View style={styles.bottomSpace} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/* =====================================================
   INPUT FIELD
===================================================== */

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?:
    | "default"
    | "email-address"
    | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B8AAAE"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

/* =====================================================
   GENDER OPTION
===================================================== */

function GenderOption({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.genderOption,
        selected && styles.genderOptionSelected,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.radio,
          selected && styles.radioSelected,
        ]}
      >
        {selected && (
          <View style={styles.radioDot} />
        )}
      </View>

      <Text
        style={[
          styles.genderText,
          selected && styles.genderTextSelected,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

/* =====================================================
   PREFERENCE CHIP
===================================================== */

function PreferenceChip({
  text,
  selected,
  onPress,
}: {
  text: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.chip,
        selected && styles.chipSelected,
      ]}
      onPress={onPress}
    >
      {selected && (
        <Text style={styles.check}>
          ✓
        </Text>
      )}

      <Text
        style={[
          styles.chipText,
          selected && styles.chipTextSelected,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#FCF7F4",
  },

  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 19,
    paddingBottom: 35,
  },

  /* HEADER */

  header: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#F1E1DE",
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    color: MAROON,
    fontSize: 32,
    lineHeight: 35,
    marginTop: -5,
  },

  headerCenter: {
    alignItems: "center",
  },

  headerRight: {
    width: 44,
  },

  brand: {
    color: "#A18E94",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 2,
  },

  headerTitle: {
    color: "#30272A",
    fontSize: 20,
    fontFamily: "serif",
    fontWeight: "600",
    marginTop: 2,
  },

  /* INTRO */

  intro: {
    paddingTop: 8,
    paddingBottom: 15,
  },

  eyebrow: {
    color: "#A07983",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.8,
  },

  pageTitle: {
    color: "#31282B",
    fontSize: 29,
    fontFamily: "serif",
    fontWeight: "600",
    marginTop: 5,
  },

  pageSubtitle: {
    color: "#93868A",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
    maxWidth: 350,
  },

  /* PHOTO */

  photoSection: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 4,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: MAROON,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontFamily: "serif",
    fontWeight: "700",
  },

  photoButton: {
    marginTop: 9,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  photoButtonText: {
    color: MAROON,
    fontSize: 8,
    fontWeight: "900",
  },

  /* SECTION */

  sectionTitle: {
    color: "#9B8A90",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginTop: 20,
    marginBottom: 9,
    marginLeft: 3,
  },

  /* CARD */

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    paddingHorizontal: 17,
    paddingVertical: 7,
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },

  /* INPUT */

  inputGroup: {
    paddingVertical: 10,
  },

  inputLabel: {
    color: "#A09297",
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 7,
  },

  input: {
    height: 45,
    borderRadius: 13,
    backgroundColor: "#FAF5F3",
    paddingHorizontal: 13,
    color: "#423438",
    fontSize: 10,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#F0E8E5",
  },

  /* DATE */

  dateInput: {
    minHeight: 45,
    borderRadius: 13,
    backgroundColor: "#FAF5F3",
    borderWidth: 1,
    borderColor: "#F0E8E5",
    paddingLeft: 13,
    paddingRight: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dateLeft: {
    flex: 1,
  },

  dateText: {
    color: "#423438",
    fontSize: 10,
    fontWeight: "600",
  },

  placeholder: {
    color: "#B8AAAE",
  },

  calendarButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#F1E2DF",
    alignItems: "center",
    justifyContent: "center",
  },

  calendarIcon: {
    color: MAROON,
    fontSize: 14,
  },

  doneDateButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#F1E2DF",
  },

  doneDateText: {
    color: MAROON,
    fontSize: 9,
    fontWeight: "900",
  },

  /* GENDER */

  preferenceTitle: {
    color: "#403337",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },

  genderContainer: {
    marginTop: 8,
  },

  genderOption: {
    minHeight: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E9DFDC",
    marginBottom: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  genderOptionSelected: {
    borderColor: MAROON,
    backgroundColor: "#FBF3F1",
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#C8B8BD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  radioSelected: {
    borderColor: MAROON,
  },

  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: MAROON,
  },

  genderText: {
    color: "#8E7F84",
    fontSize: 9,
    fontWeight: "700",
  },

  genderTextSelected: {
    color: MAROON,
  },

  /* BEAUTY */

  preferenceSubtitle: {
    color: "#9B8E92",
    fontSize: 8,
    marginTop: 1,
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
    paddingBottom: 5,
  },

  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E7DAD7",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  chipSelected: {
    backgroundColor: MAROON,
    borderColor: MAROON,
  },

  check: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    marginRight: 5,
  },

  chipText: {
    color: "#8E7F84",
    fontSize: 8,
    fontWeight: "800",
  },

  chipTextSelected: {
    color: "#FFFFFF",
  },

  /* SAVE */

  saveButton: {
    height: 59,
    borderRadius: 22,
    backgroundColor: MAROON,
    marginTop: 20,
    paddingLeft: 20,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  saveArrow: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 19,
  },

  privateText: {
    color: "#A79A9E",
    fontSize: 7,
    lineHeight: 12,
    textAlign: "center",
    marginTop: 13,
    paddingHorizontal: 25,
  },

  bottomSpace: {
    height: 25,
  },
});