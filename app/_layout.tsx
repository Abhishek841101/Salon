import React from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import {
  Stack,
  usePathname,
} from "expo-router";

import { Provider } from "react-redux";

import { store } from "../src/store/store";

import MainNavigation from "../src/components/MainNavigation";

export default function RootLayout() {
  const pathname = usePathname();

  /*
   * ========================================
   * HIDE BOTTOM NAVIGATION
   * ========================================
   *
   * "/"                  -> app/index.tsx
   * "/auth/*"            -> Login/Register
   *
   * In pages par navigation nahi dikhega.
   */

  const hideNavigation =
    pathname === "/" ||
    pathname.startsWith("/auth");

  return (
    <Provider store={store}>
      <View style={styles.container}>
        {/* ==================================
            ALL APP SCREENS
        ================================== */}

        <View style={styles.content}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
            }}
          />
        </View>

        {/* ==================================
            BOTTOM NAVIGATION
        ================================== */}

        {!hideNavigation && (
          <MainNavigation />
        )}
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#FAF7F8",
  },

  content: {
    flex: 1,
  },
});