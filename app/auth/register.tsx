import React, { useState } from "react";
import {
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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleRegister = () => {
    // Backend baad me connect karenge.
    // Abhi registration UI testing ke liye login page open hoga.
    router.replace("/home");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* BACK */}

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>

            <Text style={styles.backText}>
              Back
            </Text>
          </Pressable>

          {/* BRAND */}

          <View style={styles.brandSection}>
            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <Text style={styles.logoText}>
                  S
                </Text>
              </View>
            </View>

            <Text style={styles.brandName}>
              SALON
            </Text>

            <Text style={styles.brandTagline}>
              BEAUTY • STYLE • CONFIDENCE
            </Text>
          </View>

          {/* REGISTER CARD */}

          <View style={styles.card}>
            <Text style={styles.heading}>
              Create Account
            </Text>

            <Text style={styles.description}>
              Set up your salon management account
            </Text>

            {/* NAME */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Text style={styles.inputIcon}>
                    ◉
                  </Text>
                </View>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#B7A9AD"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>

            {/* EMAIL */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Text style={styles.inputIcon}>
                    @
                  </Text>
                </View>

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#B7A9AD"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>
            </View>

            {/* PHONE */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mobile Number
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Text style={styles.inputIcon}>
                    ☎
                  </Text>
                </View>

                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#B7A9AD"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.input}
                />
              </View>
            </View>

            {/* PASSWORD */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Text style={styles.inputIcon}>
                    •••
                  </Text>
                </View>

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  placeholderTextColor="#B7A9AD"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={styles.input}
                />

                <Pressable
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowPassword((value) => !value)
                  }
                >
                  <Text style={styles.eyeText}>
                    {showPassword ? "◉" : "◌"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* CONFIRM PASSWORD */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Confirm Password
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Text style={styles.inputIcon}>
                    ✓
                  </Text>
                </View>

                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor="#B7A9AD"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  style={styles.input}
                />

                <Pressable
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                >
                  <Text style={styles.eyeText}>
                    {showConfirmPassword ? "◉" : "◌"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* REGISTER BUTTON */}

            <Pressable
              style={({ pressed }) => [
                styles.registerButton,
                pressed && styles.registerPressed,
              ]}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>
                Create Account
              </Text>

              <Text style={styles.registerArrow}>
                →
              </Text>
            </Pressable>

            {/* LOGIN */}

            <View style={styles.loginRow}>
              <Text style={styles.loginLabel}>
                Already have an account?
              </Text>

              <Pressable
                onPress={() => router.replace("/auth/login")}
              >
                <Text style={styles.loginLink}>
                  Login
                </Text>
              </Pressable>
            </View>
          </View>

          {/* TERMS */}

          <Text style={styles.terms}>
            By creating an account, you agree to our
          </Text>

          <View style={styles.termsRow}>
            <Pressable>
              <Text style={styles.termsLink}>
                Terms of Service
              </Text>
            </Pressable>

            <Text style={styles.termsAnd}>
              {" "}
              and{" "}
            </Text>

            <Pressable>
              <Text style={styles.termsLink}>
                Privacy Policy
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF7F4",
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

  backButton: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 5,
  },

  backArrow: {
    color: "#70243A",
    fontSize: 30,
    lineHeight: 30,
  },

  backText: {
    color: "#70243A",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 4,
  },

  /* BRAND */

  brandSection: {
    alignItems: "center",
    marginTop: 3,
    marginBottom: 23,
  },

  logoOuter: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#F1DDDA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  logoInner: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: "#70243A",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "600",
    fontFamily: "serif",
  },

  brandName: {
    color: "#602032",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 4,
  },

  brandTagline: {
    color: "#A08E93",
    fontSize: 6,
    letterSpacing: 1.8,
    marginTop: 4,
    fontWeight: "700",
  },

  /* CARD */

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 23,

    borderWidth: 1,
    borderColor: "#F0E4E1",

    shadowColor: "#4D1829",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,

    elevation: 4,
  },

  heading: {
    color: "#35292D",
    fontSize: 25,
    fontWeight: "600",
    fontFamily: "serif",
  },

  description: {
    color: "#9B8D91",
    fontSize: 10,
    marginTop: 5,
    marginBottom: 21,
  },

  /* INPUTS */

  inputGroup: {
    marginBottom: 14,
  },

  label: {
    color: "#4B3A3F",
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 7,
  },

  inputContainer: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#FBF8F7",
    borderWidth: 1,
    borderColor: "#EDE2DF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
  },

  inputIconBox: {
    width: 33,
    height: 33,
    borderRadius: 10,
    backgroundColor: "#F4E5E2",
    alignItems: "center",
    justifyContent: "center",
  },

  inputIcon: {
    color: "#76253A",
    fontSize: 10,
    fontWeight: "900",
  },

  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    color: "#35292D",
    fontSize: 11,
  },

  eyeButton: {
    width: 35,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  eyeText: {
    color: "#8F7D82",
    fontSize: 16,
  },

  /* REGISTER */

  registerButton: {
    height: 54,
    borderRadius: 16,
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

    elevation: 3,
  },

  registerPressed: {
    opacity: 0.85,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  registerArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 10,
  },

  /* LOGIN */

  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },

  loginLabel: {
    color: "#998B8F",
    fontSize: 9,
  },

  loginLink: {
    color: "#70243A",
    fontSize: 9,
    fontWeight: "900",
    marginLeft: 5,
  },

  /* TERMS */

  terms: {
    color: "#A6979B",
    fontSize: 8,
    textAlign: "center",
    marginTop: 20,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  termsLink: {
    color: "#70243A",
    fontSize: 8,
    fontWeight: "800",
  },

  termsAnd: {
    color: "#A6979B",
    fontSize: 8,
  },
});