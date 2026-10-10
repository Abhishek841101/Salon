
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  View,
} from "react-native";
import {
  router,
  usePathname,
} from "expo-router";
import { useSelector } from "react-redux";

export default function RouteGuard() {
  const pathname = usePathname();

  const {
    token,
    admin,
    loading,
    isAuthenticated,
  } = useSelector((state: any) => state.auth);

  /*
   * Do not redirect while auth is being restored/refreshed.
   * restoreAuth() + fetchMe() are handled by _layout.tsx.
   */
  const authReady =
    !loading &&
    (
      isAuthenticated ||
      (!token && !admin)
    );

  useEffect(() => {
    console.log("================================");
    console.log("ROUTE GUARD");
    console.log("PATH:", pathname);
    console.log("TOKEN:", !!token);
    console.log("ADMIN:", admin);
    console.log("AUTHENTICATED:", isAuthenticated);
    console.log("LOADING:", loading);
    console.log("================================");

    /*
     * Never redirect during auth startup.
     */
    if (!authReady) {
      return;
    }

    /*
     * NOT LOGGED IN
     */
    if (!token || !admin || !isAuthenticated) {
      if (
        pathname === "/" ||
        pathname.startsWith("/auth")
      ) {
        return;
      }

      console.log(
        "ROUTE GUARD: No valid session -> Login"
      );

      router.replace("/auth/login");
      return;
    }

    /*
     * SUPER ADMIN
     */
    if (admin.role === "superadmin") {
      if (!pathname.startsWith("/superadmin")) {
        console.log(
          "ROUTE GUARD: Super Admin -> /superadmin"
        );

        router.replace("/superadmin");
      }

      return;
    }

    /*
     * SALON ADMIN / OWNER
     */
    if (
      admin.role === "admin" ||
      admin.role === "owner"
    ) {
      const subscription = admin.subscription;

      const isExpired =
        !subscription ||
        subscription.status === "expired" ||
        subscription.status === "cancelled";

      if (isExpired) {
        /*
         * IMPORTANT:
         * Allow both subscription screens.
         * Otherwise Renew Subscription gets redirected
         * back to /subscription-expired.
         */
        const allowedSubscriptionRoutes = [
          "/subscription-expired",
          "/subscription-payment",
        ];

        const isAllowedSubscriptionRoute =
          allowedSubscriptionRoutes.includes(pathname);

        if (!isAllowedSubscriptionRoute) {
          console.log(
            "ROUTE GUARD: Subscription expired -> /subscription-expired"
          );

          router.replace("/subscription-expired");
        }

        return;
      }

      /*
       * TRIAL / ACTIVE SUBSCRIPTION
       */
      if (
        subscription.status === "trial" ||
        subscription.status === "active"
      ) {
        if (
          pathname === "/" ||
          pathname.startsWith("/auth") ||
          pathname === "/subscription-expired" ||
          pathname === "/subscription-payment"
        ) {
          console.log(
            "ROUTE GUARD: Valid subscription -> /home"
          );

          router.replace("/home");
        }

        return;
      }
    }

    /*
     * STAFF
     */
    if (admin.role === "staff") {
      if (
        pathname === "/" ||
        pathname.startsWith("/auth")
      ) {
        router.replace("/home");
      }

      return;
    }

    /*
     * UNKNOWN ROLE
     */
    console.log(
      "ROUTE GUARD: Unknown role:",
      admin.role
    );
  }, [
    pathname,
    token,
    admin,
    loading,
    isAuthenticated,
    authReady,
  ]);

  /*
   * STARTUP LOADING
   */
  if (!authReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}

const styles = {
  loadingContainer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#FAF7F8",
    zIndex: 9999,
  },
};
