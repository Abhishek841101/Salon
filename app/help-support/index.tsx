import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

export default function HelpSupportScreen() {
  const [search, setSearch] = useState("");

  const faqs = [
    {
      question: "How can I book a service?",
      answer:
        "Open Services, select your preferred service and stylist, choose an available date and time, and confirm your booking.",
    },
    {
      question: "How can I cancel my booking?",
      answer:
        "Open My Bookings, select your booking and use the cancellation option if the booking is eligible for cancellation.",
    },
    {
      question: "Can I change my appointment?",
      answer:
        "Yes. Open your booking details and contact the salon if you need to change the appointment time.",
    },
    {
      question: "How can I contact the salon?",
      answer:
        "You can contact the salon directly by phone or WhatsApp using the support options below.",
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((item) =>
    item.question.toLowerCase().includes(search.toLowerCase())
  );

  const callSalon = async () => {
    const phone = "tel:+919955607199";

    try {
      await Linking.openURL(phone);
    } catch {
      Alert.alert("Unable to call", "Please try again later.");
    }
  };

  const whatsappSalon = async () => {
    const url =
      "https://wa.me/919955607199?text=Hello%20Glow%20Salon,%20I%20need%20help.";

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "WhatsApp unavailable",
        "WhatsApp could not be opened on this device."
      );
    }
  };

  const emailSalon = async () => {
    const url =
      "mailto:support@glowsalon.com?subject=Glow%20Salon%20Support";

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open email", "Please try again later.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FCF7F4"
      />

      <View style={styles.container}>
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerSmall}>
              GLOW SALON
            </Text>

            <Text style={styles.headerTitle}>
              Help & Support
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* HERO */}

          <View style={styles.heroCard}>
            <View style={styles.supportIcon}>
              <Text style={styles.supportIconText}>?</Text>
            </View>

            <Text style={styles.heroTitle}>
              How can we help?
            </Text>

            <Text style={styles.heroDescription}>
              Find answers to common questions or contact
              our support team directly.
            </Text>
          </View>

          {/* SEARCH */}

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search for help..."
              placeholderTextColor="#AA9B9F"
              style={styles.searchInput}
            />
          </View>

          {/* FAQ */}

          <Text style={styles.sectionTitle}>
            FREQUENTLY ASKED QUESTIONS
          </Text>

          <View style={styles.faqCard}>
            {filteredFaqs.length === 0 ? (
              <View style={styles.emptyFaq}>
                <Text style={styles.emptyTitle}>
                  No results found
                </Text>

                <Text style={styles.emptyText}>
                  Try searching with different keywords.
                </Text>
              </View>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <View key={faq.question}>
                    <Pressable
                      style={styles.faqQuestion}
                      onPress={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                    >
                      <View style={styles.questionIcon}>
                        <Text style={styles.questionIconText}>
                          ?
                        </Text>
                      </View>

                      <Text style={styles.questionText}>
                        {faq.question}
                      </Text>

                      <Text
                        style={[
                          styles.faqArrow,
                          isOpen && styles.faqArrowOpen,
                        ]}
                      >
                        ›
                      </Text>
                    </Pressable>

                    {isOpen && (
                      <View style={styles.answerBox}>
                        <Text style={styles.answerText}>
                          {faq.answer}
                        </Text>
                      </View>
                    )}

                    {index <
                      filteredFaqs.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                );
              })
            )}
          </View>

          {/* CONTACT */}

          <Text style={styles.sectionTitle}>
            CONTACT US
          </Text>

          <View style={styles.contactCard}>
            {/* CALL */}

            <Pressable
              style={styles.contactItem}
              onPress={callSalon}
            >
              <View style={styles.contactIcon}>
                <Text style={styles.contactIconText}>
                  ☎
                </Text>
              </View>

              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>
                  Call us
                </Text>

                <Text style={styles.contactSubtitle}>
                  Speak directly with our team
                </Text>
              </View>

              <Text style={styles.contactArrow}>
                ›
              </Text>
            </Pressable>

            <View style={styles.divider} />

            {/* WHATSAPP */}

            <Pressable
              style={styles.contactItem}
              onPress={whatsappSalon}
            >
              <View style={styles.contactIcon}>
                <Text style={styles.contactIconText}>
                  W
                </Text>
              </View>

              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>
                  WhatsApp
                </Text>

                <Text style={styles.contactSubtitle}>
                  Chat with us on WhatsApp
                </Text>
              </View>

              <Text style={styles.contactArrow}>
                ›
              </Text>
            </Pressable>

            <View style={styles.divider} />

            {/* EMAIL */}

            <Pressable
              style={styles.contactItem}
              onPress={emailSalon}
            >
              <View style={styles.contactIcon}>
                <Text style={styles.contactIconText}>
                  @
                </Text>
              </View>

              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>
                  Email us
                </Text>

                <Text style={styles.contactSubtitle}>
                  Send us your questions
                </Text>
              </View>

              <Text style={styles.contactArrow}>
                ›
              </Text>
            </Pressable>
          </View>

          {/* SUPPORT HOURS */}

          <View style={styles.hoursCard}>
            <View style={styles.clockCircle}>
              <Text style={styles.clockText}>
                ◷
              </Text>
            </View>

            <View style={styles.hoursContent}>
              <Text style={styles.hoursTitle}>
                Support Hours
              </Text>

              <Text style={styles.hoursText}>
                Monday – Sunday
              </Text>

              <Text style={styles.hoursTime}>
                9:00 AM – 9:00 PM
              </Text>
            </View>
          </View>

          {/* FOOTER */}

          <Text style={styles.footer}>
            GLOW SALON • WE'RE HERE FOR YOU
          </Text>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FCF7F4",
  },

  container: {
    flex: 1,
    backgroundColor: "#FCF7F4",
  },

  /* HEADER */

  header: {
    height: 76,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#F1E1DE",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  backIcon: {
    color: "#70253B",
    fontSize: 32,
    lineHeight: 34,
    marginTop: -3,
  },

  headerCenter: {
    alignItems: "center",
  },

  headerSmall: {
    color: "#A18E94",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 2,
  },

  headerTitle: {
    color: "#30272A",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 3,
  },

  headerSpacer: {
    width: 44,
  },

  /* CONTENT */

  content: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  /* HERO */

  heroCard: {
    backgroundColor: "#70253B",
    borderRadius: 27,
    paddingHorizontal: 22,
    paddingVertical: 25,
    alignItems: "center",
    elevation: 4,
  },

  supportIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  supportIconText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "700",
    marginTop: 15,
  },

  heroDescription: {
    color: "#E9D9DD",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 300,
  },

  /* SEARCH */

  searchBox: {
    height: 52,
    marginTop: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 2,
  },

  searchIcon: {
    color: "#70253B",
    fontSize: 22,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    color: "#30272A",
    fontSize: 12,
    paddingVertical: 0,
  },

  /* SECTION */

  sectionTitle: {
    color: "#9B8A90",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginTop: 23,
    marginBottom: 9,
    marginLeft: 3,
  },

  /* FAQ */

  faqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 7,
    elevation: 2,
    overflow: "hidden",
  },

  faqQuestion: {
    minHeight: 65,
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  questionIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#FAF0ED",
    alignItems: "center",
    justifyContent: "center",
  },

  questionIconText: {
    color: "#70253B",
    fontSize: 15,
    fontWeight: "800",
  },

  questionText: {
    flex: 1,
    color: "#3C3236",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 11,
    lineHeight: 15,
  },

  faqArrow: {
    color: "#A99A9F",
    fontSize: 23,
    marginRight: 5,
  },

  faqArrowOpen: {
    transform: [{ rotate: "90deg" }],
    color: "#70253B",
  },

  answerBox: {
    backgroundColor: "#FCF7F4",
    marginHorizontal: 8,
    marginBottom: 10,
    borderRadius: 13,
    padding: 13,
  },

  answerText: {
    color: "#817276",
    fontSize: 9,
    lineHeight: 16,
  },

  emptyFaq: {
    padding: 25,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#3C3236",
    fontSize: 12,
    fontWeight: "800",
  },

  emptyText: {
    color: "#9B8A90",
    fontSize: 9,
    marginTop: 5,
  },

  /* CONTACT */

  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 7,
    elevation: 2,
    overflow: "hidden",
  },

  contactItem: {
    minHeight: 70,
    paddingHorizontal: 9,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FAF0ED",
    alignItems: "center",
    justifyContent: "center",
  },

  contactIconText: {
    color: "#70253B",
    fontSize: 16,
    fontWeight: "800",
  },

  contactContent: {
    flex: 1,
    marginLeft: 11,
  },

  contactTitle: {
    color: "#3C3236",
    fontSize: 11,
    fontWeight: "800",
  },

  contactSubtitle: {
    color: "#A09297",
    fontSize: 7.5,
    marginTop: 3,
  },

  contactArrow: {
    color: "#A99A9F",
    fontSize: 23,
    marginRight: 5,
  },

  /* DIVIDER */

  divider: {
    height: 1,
    backgroundColor: "#F1EAE7",
    marginHorizontal: 8,
  },

  /* HOURS */

  hoursCard: {
    marginTop: 15,
    backgroundColor: "#F4E6E2",
    borderRadius: 21,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  clockCircle: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  clockText: {
    color: "#70253B",
    fontSize: 21,
  },

  hoursContent: {
    marginLeft: 12,
  },

  hoursTitle: {
    color: "#70253B",
    fontSize: 11,
    fontWeight: "800",
  },

  hoursText: {
    color: "#8C797F",
    fontSize: 8,
    marginTop: 3,
  },

  hoursTime: {
    color: "#6D5A60",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 2,
  },

  /* FOOTER */

  footer: {
    color: "#B1A4A8",
    fontSize: 6,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 18,
  },

  bottomSpace: {
    height: 25,
  },
});