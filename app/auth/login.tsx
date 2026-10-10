
import React, { useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,Image,
  View,
} from "react-native";

import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import Logo from "../../assets/images/logo.png";
import {
  loginAdmin,
  clearAuthError,
} from "../../src/features/auth/authSlice";

export default function LoginScreen() {
  const dispatch = useDispatch<any>();

  const { loading, error } = useSelector(
    (state: any) => state.auth
  );

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ========================================
  // LOGIN
  // ========================================

  const handleLogin = async () => {
    const value = identifier.trim();

    if (!value) {
      return;
    }

    if (!password.trim()) {
      return;
    }

    dispatch(clearAuthError());

    // ----------------------------------------
    // PHONE OR EMAIL
    // ----------------------------------------

    const isEmail = value.includes("@");

    const loginPayload = isEmail
      ? {
          email: value.toLowerCase(),
          password,
        }
      : {
          phone: value,
          password,
        };

    // ----------------------------------------
    // API LOGIN
    // ----------------------------------------

    const result = await dispatch(
      loginAdmin(loginPayload)
    );

    if (!loginAdmin.fulfilled.match(result)) {
      return;
    }

    // ----------------------------------------
    // GET USER FROM LOGIN RESPONSE
    // ----------------------------------------

    const user = result.payload?.user;

    if (!user) {
      return;
    }

    // ----------------------------------------
    // SUPER ADMIN
    // ----------------------------------------

    if (user.role === "superadmin") {
      router.replace("/superadmin");
      return;
    }

    // ----------------------------------------
    // ADMIN / OWNER
    // ----------------------------------------

    if (
      user.role === "admin" ||
      user.role === "owner"
    ) {
      const subscription = user.subscription;

      // --------------------------------------
      // EXPIRED
      // --------------------------------------

      if (
        !subscription ||
        subscription.status === "expired" ||
        subscription.status === "cancelled"
      ) {
        router.replace("/subscription-expired");
        return;
      }

      // --------------------------------------
      // TRIAL
      // --------------------------------------

      if (subscription.status === "trial") {
        router.replace("/home");
        return;
      }

      // --------------------------------------
      // ACTIVE PLAN
      // --------------------------------------

      if (subscription.status === "active") {
        router.replace("/home");
        return;
      }

      // --------------------------------------
      // UNKNOWN STATUS
      // --------------------------------------

      router.replace("/subscription-expired");
      return;
    }

    // ----------------------------------------
    // OTHER ROLES
    // ----------------------------------------

    router.replace("/home");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 0 : 20
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios"
              ? "interactive"
              : "on-drag"
          }
          automaticallyAdjustKeyboardInsets={
            Platform.OS === "ios"
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* ========================================
              BRAND
          ======================================== */}

          <View style={styles.brandSection}>
            <View style={styles.logoOuter}>
  <View style={styles.logoInner}>
    <Image
      source={Logo}
      style={styles.logoImage}
      resizeMode="contain"
    />
  </View>
</View>

            <Text style={styles.brandName}>
              SALON
            </Text>

            <Text style={styles.brandTagline}>
              BEAUTY • STYLE • CONFIDENCE
            </Text>
          </View>

          {/* ========================================
              LOGIN CARD
          ======================================== */}

          <View style={styles.card}>
            <Text style={styles.welcome}>
              Welcome Back
            </Text>

            <Text style={styles.description}>
              Sign in to manage your salon
            </Text>

            {/* ========================================
                ERROR
            ======================================== */}

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* ========================================
                PHONE / EMAIL
            ======================================== */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone Number / Email
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Text style={styles.inputIcon}>
                    @
                  </Text>
                </View>

                <TextInput
                  value={identifier}
                  onChangeText={(value) => {
                    setIdentifier(value);

                    if (error) {
                      dispatch(clearAuthError());
                    }
                  }}
                  placeholder="Enter phone or email"
                  placeholderTextColor="#B7A9AD"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* ========================================
                PASSWORD
            ======================================== */}

            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>
                  Password
                </Text>

                <Pressable
                  disabled={loading}
                  onPress={() => {}}
                >
                  <Text style={styles.forgotText}>
                    Forgot Password?
                  </Text>
                </Pressable>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}>
                  <Text style={styles.inputIcon}>
                    •••
                  </Text>
                </View>

                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);

                    if (error) {
                      dispatch(clearAuthError());
                    }
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#B7A9AD"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />

                <Pressable
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                >
                  <Text style={styles.eyeText}>
                    {showPassword ? "◉" : "◌"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* ========================================
                LOGIN BUTTON
            ======================================== */}

            <Pressable
              disabled={loading}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginPressed,
                loading && styles.loginDisabled,
              ]}
              onPress={handleLogin}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Text style={styles.loginText}>
                    Login
                  </Text>

                  <Text style={styles.loginArrow}>
                    →
                  </Text>
                </>
              )}
            </Pressable>

            {/* ========================================
                DIVIDER
            ======================================== */}

            <View style={styles.dividerRow}>
              <View style={styles.divider} />

              <Text style={styles.orText}>
                OR
              </Text>

              <View style={styles.divider} />
            </View>

            {/* ========================================
                REGISTER
            ======================================== */}

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>
                Don't have an account?
              </Text>

              <Pressable
                onPress={() =>
                  router.push("/auth/register")
                }
                disabled={loading}
              >
                <Text style={styles.registerLink}>
                  Create Account
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ========================================
              FOOTER
          ======================================== */}

          <Text style={styles.footer}>
            Your salon. Your business. Your success.
          </Text>

          {/* Extra bottom space for keyboard scrolling */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ====================================================
// STYLES
// ====================================================

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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 30,
  },

  bottomSpace: {
    height: 100,
  },

  // ========================================
  // BRAND
  // ========================================

  brandSection: {
    alignItems: "center",
    marginBottom: 27,
  },

  logoOuter: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: "#F1DDDA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  logoInner: {
    width: 57,
    height: 57,
    borderRadius: 20,
    backgroundColor: "#70243A",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "600",
    fontFamily: "serif",
  },

  brandName: {
    color: "#602032",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: 4,
  },

  brandTagline: {
    color: "#A08E93",
    fontSize: 7,
    letterSpacing: 2,
    marginTop: 5,
    fontWeight: "700",
  },

  // ========================================
  // CARD
  // ========================================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 24,

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

  welcome: {
    color: "#35292D",
    fontSize: 25,
    fontWeight: "600",
    fontFamily: "serif",
  },

  description: {
    color: "#9B8D91",
    fontSize: 10,
    marginTop: 5,
    marginBottom: 24,
  },

  // ========================================
  // ERROR
  // ========================================

  errorBox: {
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F3CACA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },

  errorText: {
    color: "#B42318",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },

  // ========================================
  // INPUT
  // ========================================

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    color: "#4B3A3F",
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 8,
  },

  passwordLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  forgotText: {
    color: "#76253A",
    fontSize: 8,
    fontWeight: "800",
  },

  inputContainer: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#FBF8F7",
    borderWidth: 1,
    borderColor: "#EDE2DF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  inputIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#F4E5E2",
    alignItems: "center",
    justifyContent: "center",
  },

  inputIcon: {
    color: "#76253A",
    fontSize: 11,
    fontWeight: "900",
  },

  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: 11,
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
    fontSize: 17,
  },

  // ========================================
  // LOGIN BUTTON
  // ========================================

  loginButton: {
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

  loginPressed: {
    opacity: 0.85,
  },

  loginDisabled: {
    opacity: 0.65,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  loginArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 10,
  },

  // ========================================
  // DIVIDER
  // ========================================

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEE3E0",
  },

  orText: {
    color: "#A6979B",
    fontSize: 8,
    fontWeight: "800",
    marginHorizontal: 10,
  },

  // ========================================
  // GOOGLE
  // ========================================

  googleButton: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E8DDDA",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  googleIcon: {
    width: 27,
    height: 27,
    borderRadius: 8,
    backgroundColor: "#F5EAE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  googleText: {
    color: "#70243A",
    fontSize: 12,
    fontWeight: "900",
  },

  googleButtonText: {
    color: "#514247",
    fontSize: 10,
    fontWeight: "700",
  },

  // ========================================
  // REGISTER
  // ========================================

  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    flexWrap: "wrap",
  },

  registerText: {
    color: "#998B8F",
    fontSize: 9,
  },

  registerLink: {
    color: "#70243A",
    fontSize: 9,
    fontWeight: "900",
    marginLeft: 5,
  },
  logoImage: {
  width: 55,
  height: 55,
  borderRadius: 28,
},

  // ========================================
  // FOOTER
  // ========================================

  footer: {
    color: "#B0A1A5",
    fontSize: 8,
    textAlign: "center",
    marginTop: 22,
  },
});
