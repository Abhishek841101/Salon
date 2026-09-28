import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useSelector } from "react-redux";
import API_URL from "../../src/config/api";

/* =====================================================
   TYPES
===================================================== */

type ServiceImage =
  | string
  | {
      url?: string;
      publicId?: string;
    }
  | null
  | undefined;

type Service = {
  _id: string;
  name: string;
  category?: string;
  price: number;
  duration?: number;
  description?: string;
  image?: ServiceImage;
  serviceImage?: ServiceImage;
  isActive?: boolean;
};

/* =====================================================
   HELPERS
===================================================== */

const getImageUrl = (service: Service | null) => {
  if (!service) return null;

  const image =
    service.image ?? service.serviceImage;

  if (!image) return null;

  if (typeof image === "string") {
    return image;
  }

  if (typeof image === "object" && image.url) {
    return image.url;
  }

  return null;
};

const formatPrice = (price: number | undefined) => {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "₹0";
  }

  return `₹${numericPrice.toLocaleString("en-IN")}`;
};

const formatDuration = (
  duration: number | undefined
) => {
  const minutes = Number(duration);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "30 min";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (remaining === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remaining} min`;
};

/* =====================================================
   SCREEN
===================================================== */

export default function ServiceDetailsScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const rawId = params.id;

  const serviceId = Array.isArray(rawId)
    ? rawId[0]
    : rawId;

  const token = useSelector(
    (state: any) => state?.auth?.token
  );

  const [service, setService] =
    useState<Service | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [imageError, setImageError] =
    useState(false);

  /* =====================================================
     FETCH SERVICE
  ===================================================== */

  const fetchService = async () => {
    if (!serviceId) {
      setLoading(false);
      setError("Service ID is missing");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(
        "========================================"
      );
      console.log(
        "FETCH SERVICE DETAILS"
      );
      console.log(
        "SERVICE ID:",
        serviceId
      );
      console.log(
        "API:",
        `${API_URL}/services/${serviceId}`
      );
      console.log(
        "TOKEN:",
        !!token
      );
      console.log(
        "========================================"
      );

      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/services/${encodeURIComponent(
          serviceId
        )}`,
        {
          method: "GET",
          headers,
        }
      );

      const text = await response.text();

      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      console.log(
        "SERVICE DETAILS STATUS:",
        response.status
      );

      console.log(
        "SERVICE DETAILS RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load service (${response.status})`
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Service not found"
        );
      }

      const receivedService =
        data.service ||
        data.data ||
        null;

      if (!receivedService) {
        throw new Error(
          "Service details are empty"
        );
      }

      setService(receivedService);
      setImageError(false);
    } catch (err: any) {
      console.log(
        "FETCH SERVICE DETAILS ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load service details"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL FETCH
  ===================================================== */

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <StatusBar style="dark" />

        <View style={styles.loadingCircle}>
          <ActivityIndicator
            size="large"
            color="#70253B"
          />
        </View>

        <Text style={styles.loadingTitle}>
          Loading service
        </Text>

        <Text style={styles.loadingText}>
          Please wait...
        </Text>
      </View>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !service) {
    return (
      <View style={styles.centerScreen}>
        <StatusBar style="dark" />

        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>
            !
          </Text>
        </View>

        <Text style={styles.errorTitle}>
          Service unavailable
        </Text>

        <Text style={styles.errorText}>
          {error ||
            "Unable to load this service."}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={fetchService}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </Pressable>

        <Pressable
          style={styles.backTextButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ← Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  /* =====================================================
     SERVICE DATA
  ===================================================== */

  const imageUrl = getImageUrl(service);

  const price = formatPrice(
    service.price
  );

  const duration = formatDuration(
    service.duration
  );

  const category =
    service.category?.trim() ||
    "BEAUTY";

  const description =
    service.description?.trim() ||
    "Enjoy a professional salon service designed to give you a comfortable and personalised experience.";

  /* =====================================================
     INCLUDED
  ===================================================== */

  const included = [
    "Professional service",
    "Personalised consultation",
    "Premium salon care",
    "Finishing touch",
  ];

  /* =====================================================
     UI
  ===================================================== */

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* =================================================
              HERO IMAGE
          ================================================= */}

          <View style={styles.imageContainer}>
            {imageUrl && !imageError ? (
              <Image
                source={{
                  uri: imageUrl,
                }}
                style={styles.heroImage}
                resizeMode="cover"
                onError={() => {
                  console.log(
                    "SERVICE IMAGE LOAD ERROR"
                  );

                  setImageError(true);
                }}
              />
            ) : (
              <View
                style={styles.imagePlaceholder}
              >
                <Text
                  style={styles.placeholderIcon}
                >
                  ✦
                </Text>

                <Text
                  style={
                    styles.placeholderText
                  }
                >
                  {service.name}
                </Text>
              </View>
            )}

            <View
              style={styles.imageOverlay}
            />

            {/* BACK */}

            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>
                ‹
              </Text>
            </Pressable>

            {/* FAVORITE */}

            <Pressable
              style={styles.favoriteButton}
            >
              <Text
                style={styles.favoriteIcon}
              >
                ♡
              </Text>
            </Pressable>

            {/* CATEGORY */}

            <View
              style={styles.categoryBadge}
            >
              <Text
                style={styles.categoryText}
              >
                {category.toUpperCase()}
              </Text>
            </View>

            <View
              style={styles.bottomImageShade}
            />
          </View>

          {/* =================================================
              CONTENT
          ================================================= */}

          <View style={styles.mainContent}>
            <Text style={styles.serviceName}>
              {service.name}
            </Text>

            <Text style={styles.tagline}>
              BEAUTY • CARE • YOU
            </Text>

            {/* =================================================
                PRICE + DURATION
            ================================================= */}

            <View style={styles.infoCard}>
              {/* PRICE */}

              <View style={styles.infoItem}>
                <View
                  style={styles.infoIconBox}
                >
                  <Text
                    style={styles.infoIcon}
                  >
                    ₹
                  </Text>
                </View>

                <View>
                  <Text
                    style={styles.infoLabel}
                  >
                    PRICE
                  </Text>

                  <Text
                    style={styles.infoValue}
                  >
                    {price}
                  </Text>
                </View>
              </View>

              <View
                style={styles.infoDivider}
              />

              {/* DURATION */}

              <View style={styles.infoItem}>
                <View
                  style={styles.infoIconBox}
                >
                  <Text
                    style={styles.infoIcon}
                  >
                    ◷
                  </Text>
                </View>

                <View>
                  <Text
                    style={styles.infoLabel}
                  >
                    DURATION
                  </Text>

                  <Text
                    style={styles.infoValue}
                  >
                    {duration}
                  </Text>
                </View>
              </View>
            </View>

            {/* =================================================
                STATUS
            ================================================= */}

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      service.isActive ===
                        false
                        ? "#B94A48"
                        : "#4D9560",
                  },
                ]}
              />

              <Text
                style={styles.statusText}
              >
                {service.isActive === false
                  ? "Currently unavailable"
                  : "Available for booking"}
              </Text>
            </View>

            {/* =================================================
                ABOUT
            ================================================= */}

            <View style={styles.section}>
              <View
                style={
                  styles.sectionHeadingRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionEyebrow
                    }
                  >
                    DETAILS
                  </Text>

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    About this service
                  </Text>
                </View>

                <View
                  style={styles.headingLine}
                />
              </View>

              <Text
                style={styles.description}
              >
                {description}
              </Text>
            </View>

            {/* =================================================
                INCLUDED
            ================================================= */}

            <View style={styles.section}>
              <View
                style={
                  styles.sectionHeadingRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionEyebrow
                    }
                  >
                    INCLUDED
                  </Text>

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    What's included
                  </Text>
                </View>
              </View>

              <View
                style={styles.includedGrid}
              >
                {included.map(
                  (item, index) => (
                    <View
                      key={`${item}-${index}`}
                      style={
                        styles.includedItem
                      }
                    >
                      <View
                        style={
                          styles.checkCircle
                        }
                      >
                        <Text
                          style={
                            styles.check
                          }
                        >
                          ✓
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.includedText
                        }
                      >
                        {item}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>

            {/* =================================================
                EXPERIENCE
            ================================================= */}

            <View
              style={
                styles.experienceCard
              }
            >
              <View
                style={styles.experienceIcon}
              >
                <Text style={styles.star}>
                  ✦
                </Text>
              </View>

              <View
                style={
                  styles.experienceContent
                }
              >
                <Text
                  style={
                    styles.experienceTitle
                  }
                >
                  Your Salon Experience
                </Text>

                <Text
                  style={
                    styles.experienceText
                  }
                >
                  Take a little time for
                  yourself. Our professionals
                  focus on personalised care
                  and a comfortable experience.
                </Text>
              </View>
            </View>

            {/* =================================================
                NOTE
            ================================================= */}

            <View style={styles.noteCard}>
              <Text
                style={styles.noteIcon}
              >
                ♡
              </Text>

              <View
                style={styles.noteContent}
              >
                <Text
                  style={styles.noteTitle}
                >
                  Made for you
                </Text>

                <Text
                  style={styles.noteText}
                >
                  Every appointment is tailored
                  to your personal style and
                  comfort.
                </Text>
              </View>
            </View>

            <View
              style={styles.bottomSpacing}
            />
          </View>
        </ScrollView>

        {/* =================================================
            BOOKING BAR
        ================================================= */}

        <View style={styles.bottomBar}>
          <View
            style={styles.totalContainer}
          >
            <Text
              style={styles.totalLabel}
            >
              STARTING FROM
            </Text>

            <Text
              style={styles.totalPrice}
            >
              {price}
            </Text>
          </View>

          <Pressable
            disabled={
              service.isActive === false
            }
            style={({ pressed }) => [
              styles.bookButton,
              service.isActive === false &&
                styles.bookButtonDisabled,
              pressed &&
                service.isActive !== false &&
                styles.bookButtonPressed,
            ]}
            onPress={() => {
              if (
                service.isActive === false
              ) {
                return;
              }

              router.push({
                pathname: "/booking",
                params: {
                  serviceId:
                    service._id,
                  serviceName:
                    service.name,
                  price: String(
                    service.price
                  ),
                  duration: String(
                    service.duration ??
                      30
                  ),
                },
              });
            }}
          >
            <Text
              style={styles.bookButtonText}
            >
              {service.isActive === false
                ? "Unavailable"
                : "Book Appointment"}
            </Text>

            {service.isActive !==
              false && (
              <View
                style={
                  styles.bookArrowCircle
                }
              >
                <Text
                  style={styles.bookArrow}
                >
                  →
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF7F4",
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  /* =================================================
     CENTER STATES
  ================================================= */

  centerScreen: {
    flex: 1,
    backgroundColor: "#FCF7F4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F3E4E1",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingTitle: {
    marginTop: 18,
    color: "#3A2C31",
    fontSize: 19,
    fontWeight: "800",
  },

  loadingText: {
    marginTop: 6,
    color: "#938487",
    fontSize: 12,
  },

  errorIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#F3DFDF",
    alignItems: "center",
    justifyContent: "center",
  },

  errorIconText: {
    color: "#A94442",
    fontSize: 28,
    fontWeight: "900",
  },

  errorTitle: {
    marginTop: 18,
    color: "#3A2C31",
    fontSize: 20,
    fontWeight: "800",
  },

  errorText: {
    marginTop: 8,
    color: "#8E8084",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },

  retryButton: {
    marginTop: 22,
    minWidth: 130,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#70253B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  backTextButton: {
    marginTop: 16,
    padding: 10,
  },

  backText: {
    color: "#70253B",
    fontSize: 12,
    fontWeight: "800",
  },

  /* =================================================
     HERO
  ================================================= */

  imageContainer: {
    width: "100%",
    height: 335,
    position: "relative",
    backgroundColor: "#E6D2CE",
    overflow: "hidden",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#E8D7D4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  placeholderIcon: {
    color: "#70253B",
    fontSize: 42,
    marginBottom: 10,
  },

  placeholderText: {
    color: "#70253B",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor:
      "rgba(40,18,25,0.10)",
  },

  bottomImageShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    backgroundColor:
      "rgba(30,15,20,0.12)",
  },

  backButton: {
    position: "absolute",
    top: 18,
    left: 18,
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor:
      "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  backIcon: {
    color: "#70253B",
    fontSize: 34,
    lineHeight: 36,
    marginTop: -5,
  },

  favoriteButton: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor:
      "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  favoriteIcon: {
    color: "#70253B",
    fontSize: 26,
  },

  categoryBadge: {
    position: "absolute",
    bottom: 20,
    left: 20,
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor:
      "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  categoryText: {
    color: "#70253B",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  /* =================================================
     MAIN
  ================================================= */

  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  serviceName: {
    color: "#30272A",
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "600",
  },

  tagline: {
    color: "#9A8C90",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginTop: 5,
  },

  /* =================================================
     INFO
  ================================================= */

  infoCard: {
    marginTop: 22,
    minHeight: 82,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F2E0DD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  infoIcon: {
    color: "#74263C",
    fontSize: 15,
    fontWeight: "900",
  },

  infoLabel: {
    color: "#A09296",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  infoValue: {
    color: "#352B2E",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },

  infoDivider: {
    width: 1,
    height: 38,
    backgroundColor: "#E7DCDA",
    marginHorizontal: 7,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 4,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  statusText: {
    color: "#817478",
    fontSize: 10,
    fontWeight: "600",
  },

  /* =================================================
     SECTIONS
  ================================================= */

  section: {
    marginTop: 30,
  },

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionEyebrow: {
    color: "#A77B85",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 3,
  },

  sectionTitle: {
    color: "#332A2D",
    fontSize: 21,
    fontWeight: "600",
  },

  headingLine: {
    width: 35,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#A45F70",
    marginBottom: 5,
  },

  description: {
    color: "#817478",
    fontSize: 11,
    lineHeight: 19,
    marginTop: 10,
  },

  /* =================================================
     INCLUDED
  ================================================= */

  includedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },

  includedItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingRight: 7,
  },

  checkCircle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "#F2E0DD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  check: {
    color: "#72263C",
    fontSize: 12,
    fontWeight: "900",
  },

  includedText: {
    color: "#514649",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    flex: 1,
  },

  /* =================================================
     EXPERIENCE
  ================================================= */

  experienceCard: {
    marginTop: 13,
    padding: 16,
    borderRadius: 21,
    backgroundColor: "#F3E4E1",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  experienceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  star: {
    color: "#76273D",
    fontSize: 19,
  },

  experienceContent: {
    flex: 1,
  },

  experienceTitle: {
    color: "#643144",
    fontSize: 12,
    fontWeight: "900",
  },

  experienceText: {
    color: "#806F74",
    fontSize: 9,
    lineHeight: 15,
    marginTop: 4,
  },

  /* =================================================
     NOTE
  ================================================= */

  noteCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE3E0",
    flexDirection: "row",
    alignItems: "center",
  },

  noteIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F5E8E5",
    textAlign: "center",
    textAlignVertical: "center",
    color: "#70253B",
    fontSize: 20,
    marginRight: 10,
  },

  noteContent: {
    flex: 1,
  },

  noteTitle: {
    color: "#443639",
    fontSize: 11,
    fontWeight: "800",
  },

  noteText: {
    color: "#978A8E",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  bottomSpacing: {
    height: 20,
  },

  /* =================================================
     BOOKING BAR
  ================================================= */

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 86,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 11,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 14,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  totalContainer: {
    paddingRight: 10,
  },

  totalLabel: {
    color: "#A09295",
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  totalPrice: {
    color: "#72263C",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },

  bookButton: {
    minHeight: 51,
    paddingLeft: 17,
    paddingRight: 6,
    borderRadius: 27,
    backgroundColor: "#70253B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  bookButtonDisabled: {
    backgroundColor: "#A99A9E",
  },

  bookButtonPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  bookArrowCircle: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 9,
  },

  bookArrow: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});