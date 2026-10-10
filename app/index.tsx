import React from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const handleBegin = () => {
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=90",
        }}
        style={styles.background}
        contentFit="cover"
        transition={300}
      />

      {/* Dark overlay */}
      <LinearGradient
        colors={[
          "rgba(15,10,11,0.18)",
          "rgba(15,10,11,0.08)",
          "rgba(15,10,11,0.35)",
          "rgba(15,10,11,0.96)",
        ]}
        locations={[0, 0.32, 0.58, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Extra bottom gradient */}
      <LinearGradient
        colors={["transparent", "rgba(18,10,12,0.82)"]}
        style={styles.bottomGradient}
      />

      <View style={styles.content}>

        {/* ================= TOP ================= */}

        <View style={styles.top}>
          <View style={styles.logoIcon}>
            <View style={styles.leafLeft} />
            <View style={styles.leafRight} />
            <View style={styles.stem} />
          </View>

          <Text style={styles.logo}>
          GLOW Salon
          </Text>

          <Text style={styles.logoSub}>
            BEAUTY <Text style={styles.dot}>•</Text> CARE{" "}
            <Text style={styles.dot}>•</Text> YOU
          </Text>
        </View>

        {/* ================= CENTER ================= */}

        <View style={styles.center}>

          <View style={styles.labelRow}>
            <View style={styles.line} />

            <Text style={styles.label}>
              YOUR SELF-CARE SPACE
            </Text>

            <View style={styles.line} />
          </View>

          <Text style={styles.title}>
            Look Good
          </Text>

          <Text style={styles.titleItalic}>
            Feel Greater
          </Text>

          <Text style={styles.description}>
            Beauty, care and confidence{"\n"}
            made just for you.
          </Text>

        </View>

        {/* ================= BOTTOM ================= */}

        <View style={styles.bottom}>

          <View style={styles.quote}>
            <Text style={styles.quoteText}>
              Good Hair
            </Text>

            <Text style={styles.quoteText}>
              Good Mood
            </Text>

            <Text style={styles.heart}>
              ♡
            </Text>
          </View>

          <Pressable
            onPress={handleBegin}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>
              Let's Begin
            </Text>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>

          <View style={styles.indicator} />

        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#160D10",
  },

  background: {
    position: "absolute",
    width,
    height,
  },

  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.55,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 15,
    justifyContent: "space-between",
  },

  /* ================= TOP ================= */

  top: {
    alignItems: "center",
  },

  logoIcon: {
    width: 42,
    height: 43,
    position: "relative",
    marginBottom: 5,
  },

  leafLeft: {
    position: "absolute",
    width: 17,
    height: 31,
    left: 5,
    top: 1,
    backgroundColor: "#F1C8C8",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    transform: [
      {
        rotate: "-32deg",
      },
    ],
  },

  leafRight: {
    position: "absolute",
    width: 17,
    height: 31,
    right: 5,
    top: 1,
    backgroundColor: "#A93650",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    transform: [
      {
        rotate: "32deg",
      },
    ],
  },

  stem: {
    position: "absolute",
    width: 3,
    height: 31,
    backgroundColor: "#E9AEB5",
    left: 20,
    top: 10,
    borderRadius: 5,
    transform: [
      {
        rotate: "5deg",
      },
    ],
  },

  logo: {
    color: "#FFF8F5",
    fontSize: 30,
    fontWeight: "600",
    letterSpacing: 0.2,
    fontFamily: "serif",
  },

  logoSub: {
    color: "#EBCDCF",
    fontSize: 9,
    letterSpacing: 2.8,
    marginTop: 4,
    fontWeight: "500",
  },

  dot: {
    color: "#D06B7C",
  },

  /* ================= CENTER ================= */

  center: {
    alignItems: "center",
    marginTop: height * 0.10,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  line: {
    width: 25,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.65)",
    marginHorizontal: 8,
  },

  label: {
    color: "#F2DCDD",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  title: {
    color: "#FFF8F5",
    fontSize: 48,
    lineHeight: 52,
    fontWeight: "500",
    fontFamily: "serif",
    letterSpacing: -1,
  },

  titleItalic: {
    color: "#FFF8F5",
    fontSize: 49,
    lineHeight: 54,
    fontWeight: "500",
    fontStyle: "italic",
    fontFamily: "serif",
    letterSpacing: -1,
  },

  description: {
    color: "#F0DDDB",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 17,
    letterSpacing: 0.2,
  },

  /* ================= BOTTOM ================= */

  bottom: {
    alignItems: "center",
  },

  quote: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },

  quoteText: {
    color: "#FFF1EE",
    fontSize: 17,
    lineHeight: 20,
    fontStyle: "italic",
    fontFamily: "serif",
  },

  heart: {
    position: "absolute",
    right: -31,
    bottom: -5,
    color: "#F3B8BD",
    fontSize: 28,
  },

  button: {
    width: "100%",
    height: 56,
    borderRadius: 30,
    backgroundColor: "#F8DEDA",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },

  buttonPressed: {
    transform: [
      {
        scale: 0.98,
      },
    ],
    opacity: 0.9,
  },

  buttonText: {
    color: "#671E30",
    fontSize: 15,
    fontWeight: "700",
  },

  arrow: {
    color: "#671E30",
    fontSize: 22,
    marginTop: -2,
  },

  indicator: {
    width: 100,
    height: 4,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.85)",
    marginTop: 17,
  },
});