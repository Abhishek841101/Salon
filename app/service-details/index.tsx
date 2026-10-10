import React from "react";
import {
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

/* =====================================================
   SERVICES DATA
===================================================== */

const services = [
  {
    id: "1",
    category: "Hair",
    name: "Hair Cut & Style",
    description:
      "Give your hair a fresh new look with a personalised cut, relaxing wash and professional styling designed around your look.",
    price: "₹499",
    duration: "45 min",

    image: require("../../src/assets/images/hair-cut.jpg"),

    included: [
      "Hair Wash",
      "Hair Cut",
      "Blow Dry",
      "Professional Styling",
    ],
  },

  {
    id: "2",
    category: "Hair",
    name: "Hair Spa",
    description:
      "A relaxing hair spa treatment designed to nourish your scalp, repair damaged hair and bring back natural shine.",
    price: "₹799",
    duration: "60 min",

    image: require("../../src/assets/images/hair-spa.jpg"),

    included: [
      "Scalp Massage",
      "Hair Mask",
      "Deep Conditioning",
      "Hair Wash",
    ],
  },

  {
    id: "3",
    category: "Hair",
    name: "Hair Coloring",
    description:
      "Refresh your look with beautiful professional hair colour selected according to your style and personality.",
    price: "₹1,499",
    duration: "90 min",

    image: require("../../src/assets/images/hair-color.jpg"),

    included: [
      "Colour Consultation",
      "Hair Colour",
      "Hair Wash",
      "Finishing Style",
    ],
  },

  {
    id: "4",
    category: "Skin",
    name: "COZ`E Facial",
    description:
      "A refreshing facial treatment that cleanses, hydrates and leaves your skin looking naturally fresh and radiant.",
    price: "₹899",
    duration: "60 min",

    image: require("../../src/assets/images/facial.jpg"),

    included: [
      "Face Cleanse",
      "Exfoliation",
      "Face Massage",
      "Face Mask",
    ],
  },

  {
    id: "5",
    category: "Skin",
    name: "Clean Up",
    description:
      "A gentle deep-cleansing treatment for fresh, clean and healthy-looking skin.",
    price: "₹599",
    duration: "40 min",

    image: require("../../src/assets/images/cleanup.jpg"),

    included: [
      "Deep Cleanse",
      "Scrub",
      "Steam",
      "Moisturising",
    ],
  },

  {
    id: "6",
    category: "Nails",
    name: "Classic Manicure",
    description:
      "Give your hands and nails the care they deserve with our relaxing classic manicure experience.",
    price: "₹499",
    duration: "40 min",

    image: require("../../src/assets/images/manicure.jpg"),

    included: [
      "Nail Shaping",
      "Cuticle Care",
      "Hand Massage",
      "Nail Finish",
    ],
  },

  {
    id: "7",
    category: "Nails",
    name: "Gel Nails",
    description:
      "Beautiful long-lasting gel nails with a smooth premium finish designed for your personal style.",
    price: "₹999",
    duration: "60 min",

    image: require("../../src/assets/images/gel-nails.jpg"),

    included: [
      "Nail Preparation",
      "Gel Application",
      "Nail Shaping",
      "Premium Finish",
    ],
  },

  {
    id: "8",
    category: "Makeup",
    name: "Party Makeup",
    description:
      "A soft glam makeup look designed to make you feel confident and beautiful for your special occasion.",
    price: "₹1,999",
    duration: "90 min",

    image: require("../../src/assets/images/party-makeup.jpg"),

    included: [
      "Base Makeup",
      "Eye Makeup",
      "Hair Styling",
      "Final Touch-up",
    ],
  },
];

/* =====================================================
   SCREEN
===================================================== */

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  /* ===================================================
     FIND SELECTED SERVICE
  =================================================== */

  const service =
    services.find((item) => item.id === id) ??
    services[0];

  /* ===================================================
     UI
  =================================================== */

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* =================================================
              HERO / SERVICE IMAGE
          ================================================= */}

          <View style={styles.imageContainer}>
            <Image
              source={service.image}
              style={styles.heroImage}
              resizeMode="cover"
            />

            <View style={styles.imageOverlay} />

            {/* BACK BUTTON */}

            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>

            {/* FAVORITE */}

            <Pressable style={styles.favoriteButton}>
              <Text style={styles.favoriteIcon}>
                ♡
              </Text>
            </Pressable>

            {/* CATEGORY */}

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {service.category.toUpperCase()}
              </Text>
            </View>

            {/* IMAGE BOTTOM GRADIENT EFFECT */}

            <View style={styles.bottomImageShade} />
          </View>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <View style={styles.mainContent}>
            {/* SERVICE NAME */}

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
                <View style={styles.infoIconBox}>
                  <Text style={styles.infoIcon}>
                    ₹
                  </Text>
                </View>

                <View>
                  <Text style={styles.infoLabel}>
                    PRICE
                  </Text>

                  <Text style={styles.infoValue}>
                    {service.price}
                  </Text>
                </View>
              </View>

              {/* DIVIDER */}

              <View style={styles.infoDivider} />

              {/* DURATION */}

              <View style={styles.infoItem}>
                <View style={styles.infoIconBox}>
                  <Text style={styles.infoIcon}>
                    ◷
                  </Text>
                </View>

                <View>
                  <Text style={styles.infoLabel}>
                    DURATION
                  </Text>

                  <Text style={styles.infoValue}>
                    {service.duration}
                  </Text>
                </View>
              </View>
            </View>

            {/* =================================================
                ABOUT
            ================================================= */}

            <View style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View>
                  <Text style={styles.sectionEyebrow}>
                    DETAILS
                  </Text>

                  <Text style={styles.sectionTitle}>
                    About this service
                  </Text>
                </View>

                <View style={styles.headingLine} />
              </View>

              <Text style={styles.description}>
                {service.description}
              </Text>
            </View>

            {/* =================================================
                INCLUDED
            ================================================= */}

            <View style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <View>
                  <Text style={styles.sectionEyebrow}>
                    INCLUDED
                  </Text>

                  <Text style={styles.sectionTitle}>
                    What's included
                  </Text>
                </View>
              </View>

              <View style={styles.includedGrid}>
                {service.included.map(
                  (item, index) => (
                    <View
                      key={`${item}-${index}`}
                      style={styles.includedItem}
                    >
                      <View style={styles.checkCircle}>
                        <Text style={styles.check}>
                          ✓
                        </Text>
                      </View>

                      <Text style={styles.includedText}>
                        {item}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>

            {/* =================================================
                EXPERIENCE CARD
            ================================================= */}

            <View style={styles.experienceCard}>
              <View style={styles.experienceIcon}>
                <Text style={styles.star}>
                  ✦
                </Text>
              </View>

              <View style={styles.experienceContent}>
                <Text style={styles.experienceTitle}>
                  Your COZ`E Experience
                </Text>

                <Text style={styles.experienceText}>
                  Take a little time for yourself.
                  Our artists focus on personalised
                  care and a comfortable experience.
                </Text>
              </View>
            </View>

            {/* =================================================
                SALON NOTE
            ================================================= */}

            <View style={styles.noteCard}>
              <Text style={styles.noteIcon}>
                ♡
              </Text>

              <View style={styles.noteContent}>
                <Text style={styles.noteTitle}>
                  Made for you
                </Text>

                <Text style={styles.noteText}>
                  Every appointment is tailored to
                  your personal style and comfort.
                </Text>
              </View>
            </View>

            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>

        {/* =================================================
            FIXED BOOKING BAR
        ================================================= */}

        <View style={styles.bottomBar}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>
              STARTING FROM
            </Text>

            <Text style={styles.totalPrice}>
              {service.price}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.bookButton,
              pressed && styles.bookButtonPressed,
            ]}
            onPress={() =>
              router.push({
                pathname: "/booking",
                params: {
                  serviceId: service.id,
                  serviceName: service.name,
                  price: service.price,
                },
              })
            }
          >
            <Text style={styles.bookButtonText}>
              Book Appointment
            </Text>

            <View style={styles.bookArrowCircle}>
              <Text style={styles.bookArrow}>
                →
              </Text>
            </View>
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
     IMAGE
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

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(40,18,25,0.10)",
  },

  bottomImageShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    backgroundColor: "rgba(30,15,20,0.12)",
  },

  /* BACK */

  backButton: {
    position: "absolute",
    top: 18,
    left: 18,
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.94)",
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

  /* FAVORITE */

  favoriteButton: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  favoriteIcon: {
    color: "#70253B",
    fontSize: 26,
  },

  /* CATEGORY */

  categoryBadge: {
    position: "absolute",
    bottom: 20,
    left: 20,
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
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
    fontFamily: "serif",
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
     INFO CARD
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
    fontFamily: "serif",
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
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 9,
  },

  bookArrow: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});