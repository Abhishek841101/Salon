import React, { useEffect, useState } from "react";

import {
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import {
  Stack,
  usePathname,
  router,
} from "expo-router";

import { Provider, useDispatch, useSelector } from "react-redux";

import { store } from "../src/store/store";

import MainNavigation from "../src/components/MainNavigation";

import RouteGuard from "../src/components/RouteGuard";

import {
  restoreAuth,
  fetchMe,
} from "../src/features/auth/authSlice";


function AppInitializer() {
  const dispatch = useDispatch<any>();
  const pathname = usePathname();

  const {
    token,
    isAuthenticated,
    loading,
  } = useSelector(
    (state: any) => state.auth
  );

  const [initialized, setInitialized] =
    useState(false);

  /*
   * ========================================
   * APP STARTUP
   * ========================================
   *
   * App open hone par:
   *
   * 1. AsyncStorage se token/user restore
   * 2. Backend /auth/me call
   * 3. Latest subscription fetch
   * 4. RouteGuard correct screen decide karega
   *
   * Logout hone tak session saved rahega.
   */

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log(
          "AUTH: Restoring saved session..."
        );

        const result =
          await dispatch(
            restoreAuth()
          );

        /*
         * ==================================
         * NO SAVED SESSION
         * ==================================
         */

        if (
          !restoreAuth.fulfilled.match(
            result
          )
        ) {
          console.log(
            "AUTH: No saved session"
          );

          if (mounted) {
            setInitialized(true);
          }

          return;
        }

        /*
         * ==================================
         * SAVED SESSION FOUND
         * ==================================
         */

        console.log(
          "AUTH: Saved session restored"
        );

        /*
         * ==================================
         * FRESH BACKEND USER
         * ==================================
         *
         * DB se latest:
         * - user
         * - role
         * - subscription
         *
         * fetch karega.
         */

        const meResult =
          await dispatch(
            fetchMe()
          );

        if (
          fetchMe.fulfilled.match(
            meResult
          )
        ) {
          console.log(
            "AUTH: Fresh user data loaded"
          );

          console.log(
            "AUTH: Subscription:",
            meResult.payload?.user
              ?.subscription
          );
        } else {
          console.log(
            "AUTH: Could not refresh user from server"
          );

          /*
           * IMPORTANT:
           *
           * Network/server temporarily
           * unavailable hone par saved
           * login session delete nahi karenge.
           *
           * User ko unnecessary login
           * nahi karwana hai.
           */
        }
      } catch (error) {
        console.error(
          "AUTH INITIALIZATION ERROR:",
          error
        );
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  /*
   * ========================================
   * HIDE BOTTOM NAVIGATION
   * ========================================
   */

  const hideNavigation =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/superadmin") ||
    pathname ===
      "/subscription-expired";

  /*
   * ========================================
   * STARTUP LOADING
   * ========================================
   */

  if (!initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ==================================
          ROUTE GUARD
      ================================== */}

      <RouteGuard />

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
  );
}


export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppInitializer />
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

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF7F8",
  },
});