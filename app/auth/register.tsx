
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useDispatch } from "react-redux";

import Logo from "../../assets/images/logo.png";
import { loginAdmin } from "../../src/features/auth/authSlice";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://salon-backend-49vk.onrender.com/api";

export default function RegisterScreen() {
  const dispatch = useDispatch<any>();

  const [step, setStep] = useState<1 | 2>(1);

  // STEP 1
  const [salonName, setSalonName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // STEP 2
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // STEP 1 -> STEP 2
  // ==========================================
  const handleContinue = () => {
    setError("");

    const cleanSalonName = salonName.trim();
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanSalonName) {
      setError("Please enter your salon name.");
      return;
    }

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanPhone) {
      setError("Please enter your mobile number.");
      return;
    }

    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setPhone(cleanPhone);
    setStep(2);
  };

  // ==========================================
  // BACK TO STEP 1
  // ==========================================
  const handleBackToStepOne = () => {
    setError("");
    setStep(1);
  };

  // ==========================================
  // REGISTER
  // ==========================================
  const handleRegister = async () => {
    setError("");

    const cleanSalonName = salonName.trim();
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // ==========================================
      // CREATE SALON ACCOUNT
      // ==========================================
      console.log("================================");
      console.log("REGISTERING SALON...");
      console.log("API:", `${API_URL}/auth/register-salon`);
      console.log("SALON:", cleanSalonName);
      console.log("OWNER:", cleanName);
      console.log("PHONE:", cleanPhone);
      console.log("EMAIL:", cleanEmail);
      console.log("================================");

      const response = await fetch(
        `${API_URL}/auth/register-salon`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            salonName: cleanSalonName,
            ownerName: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("REGISTER RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to create your salon account."
        );
      }

      console.log("REGISTER SUCCESS:", data);

      // ==========================================
      // AUTOMATIC LOGIN AFTER REGISTRATION
      // ==========================================
      console.log("AUTO LOGIN STARTED...");

      const loginResult = await dispatch(
        loginAdmin({
          phone: cleanPhone,
          password,
        })
      ).unwrap();

      console.log("AUTO LOGIN SUCCESS:", loginResult);

      // ==========================================
      // DIRECT HOME
      // ==========================================
      router.replace("/home");
    } catch (err: any) {
      console.error("REGISTER / AUTO LOGIN ERROR:", err);

      setError(
        err?.message ||
          "Something went wrong while creating your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === "ios" ? "padding" : "height"
        }
        keyboardVerticalOffset={0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios"
              ? "interactive"
              : "on-drag"
          }
          contentContainerStyle={styles.scrollContent}
          automaticallyAdjustKeyboardInsets={
            Platform.OS === "ios"
          }
        >
          {/* ==========================================
              BRAND
          ========================================== */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Image
                source={Logo}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.brandName}>
              GLOW SALON
            </Text>

            <Text style={styles.brandTagline}>
              BEAUTY • STYLE • CARE
            </Text>
          </View>

          {/* ==========================================
              MAIN CARD
          ========================================== */}
          <View style={styles.card}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {step === 1
                  ? "Create your salon"
                  : "Create your account"}
              </Text>

              <Text style={styles.description}>
                {step === 1
                  ? "Tell us a little about your salon."
                  : "Set up your login details to continue."}
              </Text>
            </View>

            {/* ==========================================
                PROGRESS
            ========================================== */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  STEP {step} OF 2
                </Text>

                <Text style={styles.progressPercent}>
                  {step === 1 ? "50%" : "100%"}
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        step === 1 ? "50%" : "100%",
                    },
                  ]}
                />
              </View>
            </View>

            {/* ==========================================
                ERROR
            ========================================== */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>
                  !
                </Text>

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* ==========================================
                STEP 1
            ========================================== */}
            {step === 1 ? (
              <>
                {/* SALON NAME */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Salon Name
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>
                      ✦
                    </Text>

                    <TextInput
                      value={salonName}
                      onChangeText={setSalonName}
                      placeholder="Enter salon name"
                      placeholderTextColor="#A69CA0"
                      style={styles.input}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* FULL NAME */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Full Name
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>
                      ◯
                    </Text>

                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      placeholderTextColor="#A69CA0"
                      style={styles.input}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* MOBILE */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Mobile Number
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>
                      ☎
                    </Text>

                    <TextInput
                      value={phone}
                      onChangeText={(value) => {
                        const cleanValue =
                          value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                        setPhone(cleanValue);
                      }}
                      placeholder="Enter 10-digit mobile number"
                      placeholderTextColor="#A69CA0"
                      style={styles.input}
                      keyboardType="phone-pad"
                      maxLength={10}
                      returnKeyType="done"
                      onSubmitEditing={handleContinue}
                    />
                  </View>
                </View>

                {/* CONTINUE */}
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed &&
                      styles.buttonPressed,
                  ]}
                  onPress={handleContinue}
                >
                  <Text style={styles.primaryButtonText}>
                    Continue
                  </Text>

                  <Text style={styles.primaryButtonArrow}>
                    →
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* ==========================================
                    STEP 2
                ========================================== */}

                {/* EMAIL */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Email Address
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>
                      @
                    </Text>

                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="#A69CA0"
                      style={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* PASSWORD */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Password
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>
                      ●
                    </Text>

                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Create a password"
                      placeholderTextColor="#A69CA0"
                      style={styles.input}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />

                    <Pressable
                      onPress={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      style={styles.eyeButton}
                    >
                      <Text style={styles.eyeText}>
                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* CONFIRM PASSWORD */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Confirm Password
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>
                      ●
                    </Text>

                    <TextInput
                      value={confirmPassword}
                      onChangeText={
                        setConfirmPassword
                      }
                      placeholder="Confirm your password"
                      placeholderTextColor="#A69CA0"
                      style={styles.input}
                      secureTextEntry={
                        !showConfirmPassword
                      }
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={
                        handleRegister
                      }
                    />

                    <Pressable
                      onPress={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      style={styles.eyeButton}
                    >
                      <Text style={styles.eyeText}>
                        {showConfirmPassword
                          ? "Hide"
                          : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* CREATE ACCOUNT */}
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed &&
                      styles.buttonPressed,
                    loading &&
                      styles.disabledButton,
                  ]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Text
                        style={
                          styles.primaryButtonText
                        }
                      >
                        Create Account
                      </Text>

                      <Text
                        style={
                          styles.primaryButtonArrow
                        }
                      >
                        →
                      </Text>
                    </>
                  )}
                </Pressable>

                {/* BACK */}
                <Pressable
                  style={styles.backButton}
                  onPress={handleBackToStepOne}
                  disabled={loading}
                >
                  <Text style={styles.backArrow}>
                    ←
                  </Text>

                  <Text style={styles.backText}>
                    Back to salon details
                  </Text>
                </Pressable>
              </>
            )}

            {/* ==========================================
                LOGIN
            ========================================== */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>
                Already have an account?
              </Text>

              <Pressable
                onPress={() =>
                  router.push("/auth/login")
                }
                disabled={loading}
              >
                <Text style={styles.loginLink}>
                  Login
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ==========================================
              FREE TRIAL
          ========================================== */}
          <View style={styles.trialBox}>
            <View style={styles.trialIconContainer}>
              <Text style={styles.trialIcon}>
                ✓
              </Text>
            </View>

            <View style={styles.trialContent}>
              <Text style={styles.trialTitle}>
                3-Day Free Trial
              </Text>

              <Text style={styles.trialText}>
                Start managing your salon today. No
                payment required to get started.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F8",
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 35,
  },

  bottomSpace: {
    height: 80,
  },

  // ==========================================
  // BRAND
  // ==========================================

  brandSection: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 22,
  },

  logoContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  logo: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },

  brandName: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 2.4,
    color: "#70243A",
  },

  brandTagline: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#A78A94",
  },

  // ==========================================
  // CARD
  // ==========================================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#2D2025",
    marginBottom: 7,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#8C7D83",
  },

  // ==========================================
  // PROGRESS
  // ==========================================

  progressSection: {
    marginBottom: 22,
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#70243A",
  },

  progressPercent: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9A8B91",
  },

  progressTrack: {
    height: 6,
    borderRadius: 10,
    backgroundColor: "#EEE6E9",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#70243A",
  },

  // ==========================================
  // ERROR
  // ==========================================

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#F1CACA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 18,
  },

  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: "center",
    lineHeight: 20,
    fontSize: 12,
    fontWeight: "800",
    color: "#B42318",
    backgroundColor: "#FEE4E2",
    marginRight: 9,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#B42318",
    fontWeight: "600",
  },

  // ==========================================
  // INPUT
  // ==========================================

  inputGroup: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3C2D33",
    marginBottom: 8,
  },

  inputWrapper: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6DDE1",
    backgroundColor: "#FCFAFB",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
  },

  inputIcon: {
    width: 22,
    fontSize: 16,
    fontWeight: "700",
    color: "#8A4059",
    textAlign: "center",
    marginRight: 8,
  },

  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 14,
    color: "#2D2025",
    paddingVertical: 0,
  },

  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 8,
  },

  eyeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#70243A",
  },

  // ==========================================
  // PRIMARY BUTTON
  // ==========================================

  primaryButton: {
    height: 55,
    borderRadius: 15,
    backgroundColor: "#70243A",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 4,

    shadowColor: "#70243A",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  disabledButton: {
    opacity: 0.7,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  primaryButtonArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "500",
    marginLeft: 12,
  },

  // ==========================================
  // BACK
  // ==========================================

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingVertical: 8,
  },

  backArrow: {
    color: "#70243A",
    fontSize: 17,
    marginRight: 7,
  },

  backText: {
    color: "#70243A",
    fontSize: 13,
    fontWeight: "700",
  },

  // ==========================================
  // LOGIN
  // ==========================================

  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  loginText: {
    fontSize: 13,
    color: "#8C7D83",
  },

  loginLink: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: "800",
    color: "#70243A",
  },

  // ==========================================
  // TRIAL
  // ==========================================

  trialBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4ECEF",
    borderRadius: 17,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginTop: 16,
  },

  trialIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  trialIcon: {
    fontSize: 16,
    fontWeight: "800",
    color: "#70243A",
  },

  trialContent: {
    flex: 1,
  },

  trialTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4A3039",
    marginBottom: 3,
  },

  trialText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#8C737B",
  },
});
