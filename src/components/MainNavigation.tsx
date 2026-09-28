import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";

import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const navigationItems: NavItem[] = [
  {
    label: "Home",
    icon: "home-outline",
    route: "/home",
  },
  {
    label: "Clients",
    icon: "people-outline",
    route: "/clients",
  },
  {
    label: "Billing",
    icon: "receipt-outline",
    route: "/billing",
  },
  {
    label: "Services",
    icon: "sparkles-outline",
    route: "/services",
  },
  {
    label: "More",
    icon: "menu-outline",
    route: "/more",
  },
];

type NavigationContextType = {
  showNavigation: () => void;
  hideNavigation: () => void;
  handleScroll: (offsetY: number) => void;
};

const NavigationContext =
  createContext<NavigationContextType | null>(null);

export function useMainNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error(
      "useMainNavigation must be used inside MainNavigation"
    );
  }

  return context;
}

export default function MainNavigation() {
  const pathname = usePathname();

  const translateY = useRef(
    new Animated.Value(0)
  ).current;

  const opacity = useRef(
    new Animated.Value(1)
  ).current;

  const [visible, setVisible] = useState(true);

  const lastOffset = useRef(0);

  const scrollTimer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  /*
   * ========================================
   * FIND CURRENT TAB
   * ========================================
   */

  const getCurrentIndex = () => {
    const index = navigationItems.findIndex(
      (item) => {
        if (item.route === "/home") {
          return (
            pathname === "/home" ||
            pathname.startsWith("/home/")
          );
        }

        return (
          pathname === item.route ||
          pathname.startsWith(`${item.route}/`)
        );
      }
    );

    return index === -1 ? 0 : index;
  };

  /*
   * ========================================
   * NAVIGATION
   * ========================================
   */

  const navigateToIndex = (index: number) => {
    if (
      index < 0 ||
      index >= navigationItems.length
    ) {
      return;
    }

    const route =
      navigationItems[index].route;

    if (pathname === route) {
      return;
    }

    showNavigation();

    router.push(route as any);
  };

  /*
   * ========================================
   * SWIPE NAVIGATION
   * ========================================
   */

  const navigateNext = () => {
    const currentIndex = getCurrentIndex();

    const nextIndex = currentIndex + 1;

    if (
      nextIndex >= navigationItems.length
    ) {
      return;
    }

    navigateToIndex(nextIndex);
  };

  const navigatePrevious = () => {
    const currentIndex = getCurrentIndex();

    const previousIndex = currentIndex - 1;

    if (previousIndex < 0) {
      return;
    }

    navigateToIndex(previousIndex);
  };

  /*
   * ========================================
   * PAN RESPONDER
   * ========================================
   */

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _,
        gestureState
      ) => {
        const { dx, dy } = gestureState;

        /*
         * Sirf horizontal gesture ko detect karo.
         *
         * Agar vertical movement zyada hai
         * to navigation swipe activate nahi hoga.
         */

        return (
          Math.abs(dx) > 20 &&
          Math.abs(dx) > Math.abs(dy) * 1.4
        );
      },

      onPanResponderRelease: (
        _,
        gestureState
      ) => {
        const { dx, vx } = gestureState;

        const SWIPE_DISTANCE = 70;
        const SWIPE_VELOCITY = 0.35;

        /*
         * LEFT SWIPE
         *
         * Home -> Clients
         * Clients -> Billing
         * Billing -> Services
         * Services -> More
         */

        if (
          dx < -SWIPE_DISTANCE ||
          vx < -SWIPE_VELOCITY
        ) {
          navigateNext();
          return;
        }

        /*
         * RIGHT SWIPE
         *
         * More -> Services
         * Services -> Billing
         * Billing -> Clients
         * Clients -> Home
         */

        if (
          dx > SWIPE_DISTANCE ||
          vx > SWIPE_VELOCITY
        ) {
          navigatePrevious();
        }
      },
    })
  ).current;

  /*
   * ========================================
   * SHOW NAVIGATION
   * ========================================
   */

  const showNavigation = () => {
    if (visible) {
      return;
    }

    setVisible(true);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
        mass: 0.7,
      }),

      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /*
   * ========================================
   * HIDE NAVIGATION
   * ========================================
   */

  const hideNavigation = () => {
    if (!visible) {
      return;
    }

    setVisible(false);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 110,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
        mass: 0.7,
      }),

      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /*
   * ========================================
   * VERTICAL SCROLL
   * ========================================
   */

  const handleScroll = (offsetY: number) => {
    const currentOffset = Math.max(
      offsetY,
      0
    );

    const difference =
      currentOffset - lastOffset.current;

    /*
     * Top par navigation visible
     */

    if (currentOffset <= 10) {
      showNavigation();

      lastOffset.current = currentOffset;

      return;
    }

    /*
     * Small movement ignore
     */

    if (Math.abs(difference) < 8) {
      return;
    }

    /*
     * Scroll down
     * -> hide
     */

    if (difference > 0) {
      hideNavigation();
    }

    /*
     * Scroll up
     * -> show
     */

    else {
      showNavigation();
    }

    lastOffset.current = currentOffset;

    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }

    scrollTimer.current = setTimeout(() => {
      scrollTimer.current = null;
    }, 100);
  };

  /*
   * ========================================
   * ROUTE CHANGE
   * ========================================
   */

  useEffect(() => {
    setVisible(true);

    translateY.setValue(0);

    opacity.setValue(1);

    lastOffset.current = 0;

    return () => {
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, [pathname]);

  /*
   * ========================================
   * ACTIVE TAB
   * ========================================
   */

  const isActive = (route: string) => {
    if (route === "/home") {
      return (
        pathname === "/home" ||
        pathname.startsWith("/home/")
      );
    }

    return (
      pathname === route ||
      pathname.startsWith(`${route}/`)
    );
  };

  /*
   * ========================================
   * BUTTON NAVIGATION
   * ========================================
   */

  const handleNavigation = (
    route: string
  ) => {
    showNavigation();

    if (pathname === route) {
      return;
    }

    router.push(route as any);
  };

  const contextValue: NavigationContextType = {
    showNavigation,
    hideNavigation,
    handleScroll,
  };

  /*
   * ========================================
   * UI
   * ========================================
   */

  return (
    <NavigationContext.Provider
      value={contextValue}
    >
      <Animated.View
        {...panResponder.panHandlers}
        pointerEvents={
          visible ? "auto" : "none"
        }
        style={[
          styles.wrapper,
          {
            opacity,

            transform: [
              {
                translateY,
              },
            ],
          },
        ]}
      >
        <View style={styles.navigation}>
          {navigationItems.map(
            (item) => {
              const active = isActive(
                item.route
              );

              return (
                <Pressable
                  key={item.route}
                  style={({ pressed }) => [
                    styles.item,
                    pressed &&
                      styles.pressedItem,
                  ]}
                  onPress={() =>
                    handleNavigation(
                      item.route
                    )
                  }
                  android_ripple={{
                    color: "#F4E4E8",
                  }}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      active &&
                        styles.activeIconContainer,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={
                        active
                          ? "#FFFFFF"
                          : "#8E7D83"
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.label,
                      active &&
                        styles.activeLabel,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>
      </Animated.View>
    </NavigationContext.Provider>
  );
}

const { width } =
  Dimensions.get("window");

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",

    left: 14,
    right: 14,
    bottom: 12,

    zIndex: 9999,

    elevation: 9999,
  },

  navigation: {
    width: width - 28,

    height: 72,

    borderRadius: 26,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-around",

    paddingHorizontal: 6,

    borderWidth: 1,

    borderColor: "#F1E4E7",

    shadowColor: "#3A1822",

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.13,

    shadowRadius: 18,

    elevation: 12,
  },

  item: {
    flex: 1,

    height: 66,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 20,
  },

  pressedItem: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  iconContainer: {
    width: 36,

    height: 32,

    borderRadius: 11,

    alignItems: "center",

    justifyContent: "center",
  },

  activeIconContainer: {
    backgroundColor: "#76253A",

    shadowColor: "#76253A",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.22,

    shadowRadius: 6,

    elevation: 4,
  },

  label: {
    marginTop: 4,

    fontSize: 9,

    fontWeight: "600",

    color: "#9A8C91",
  },

  activeLabel: {
    color: "#76253A",

    fontWeight: "800",
  },
});