
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";

import { useDispatch, useSelector } from "react-redux";

import { apiRequest } from "../../src/api/api";

import {
  generateInvoicePdf,
  shareInvoicePdf,
} from "../../src/utils/invoicePdf";

import {
  createBill,
} from "../../src/features/bills/billsSlice";

type Client = {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
};

type Service = {
  _id: string;
  name: string;
  duration: number;
  price: number;
};

type Stylist = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  specialization?: string;
  experience?: number;
  status?: "ACTIVE" | "INACTIVE";
};

type RootState = any;

export default function BillingScreen() {
  const dispatch = useDispatch<any>();

  const token = useSelector(
    (state: RootState) => state.auth?.token
  );

  // ======================================================
  // DATA
  // ======================================================

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);

  // ======================================================
  // SELECTED
  // ======================================================

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [selectedStylist, setSelectedStylist] =
    useState<Stylist | null>(null);

  const [selectedServices, setSelectedServices] =
    useState<Service[]>([]);

  // ======================================================
  // SEARCH
  // ======================================================

  const [search, setSearch] = useState("");

  const [staffSearch, setStaffSearch] =
    useState("");

  const [showClients, setShowClients] =
    useState(false);

  const [showStylists, setShowStylists] =
    useState(false);

  // ======================================================
  // BILL
  // ======================================================

  const [discount, setDiscount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  // ======================================================
  // LOADING
  // ======================================================

  const [loadingData, setLoadingData] =
    useState(false);

  const [creatingBill, setCreatingBill] =
    useState(false);

  // ======================================================
  // LOAD CLIENTS
  // ======================================================

  const loadClients = useCallback(
    async (searchText = "") => {
      if (!token) return;

      try {
        const value = searchText.trim();

        if (!value) {
          setClients([]);
          return;
        }

        const query =
          `?search=${encodeURIComponent(value)}`;

        const response = await apiRequest(
          `/clients${query}`,
          {
            method: "GET",
            token,
          }
        );

        setClients(
          Array.isArray(response?.clients)
            ? response.clients
            : []
        );
      } catch (error: any) {
        console.error(
          "LOAD CLIENTS ERROR:",
          error
        );

        setClients([]);
      }
    },
    [token]
  );

  // ======================================================
  // LOAD SERVICES + STAFF
  // ======================================================

  useEffect(() => {
    const loadBillingData = async () => {
      if (!token) return;

      try {
        setLoadingData(true);

        const [
          servicesResponse,
          stylistsResponse,
        ] = await Promise.all([
          apiRequest("/services", {
            method: "GET",
            token,
          }),

          apiRequest("/stylists", {
            method: "GET",
            token,
          }),
        ]);

        setServices(
          Array.isArray(
            servicesResponse?.services
          )
            ? servicesResponse.services
            : []
        );

        setStylists(
          (
            Array.isArray(
              stylistsResponse?.stylists
            )
              ? stylistsResponse.stylists
              : []
          ).filter(
            (staff: Stylist) =>
              staff.status !== "INACTIVE"
          )
        );
      } catch (error: any) {
        console.error(
          "BILLING DATA ERROR:",
          error
        );

        Alert.alert(
          "Error",
          error?.message ||
            "Failed to load billing data."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadBillingData();
  }, [token]);

  // ======================================================
  // CLIENT SEARCH
  // ======================================================

  const handleClientSearch = async () => {
    const value = search.trim();

    if (!value) {
      setClients([]);
      setShowClients(false);
      return;
    }

    setShowClients(true);

    await loadClients(value);
  };

  const clearClientSearch = () => {
    setSearch("");
    setClients([]);
    setShowClients(false);
  };

  // ======================================================
  // STAFF SEARCH
  // ======================================================

  const filteredStylists = useMemo(() => {
    const q =
      staffSearch.trim().toLowerCase();

    if (!q) return [];

    return stylists.filter((staff) => {
      return [
        staff.name,
        staff.phone,
        staff.email,
        staff.specialization,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [stylists, staffSearch]);

  // ======================================================
  // TOTAL
  // ======================================================

  const subtotal = useMemo(() => {
    return selectedServices.reduce(
      (total, service) =>
        total +
        Number(service.price || 0),
      0
    );
  }, [selectedServices]);

  const discountAmount = Math.min(
    Number(discount) || 0,
    subtotal
  );

  const total =
    subtotal - discountAmount;

  // ======================================================
  // SERVICE SELECT
  // ======================================================

  const toggleService = (
    service: Service
  ) => {
    const exists =
      selectedServices.some(
        (item) =>
          item._id === service._id
      );

    if (exists) {
      setSelectedServices(
        selectedServices.filter(
          (item) =>
            item._id !== service._id
        )
      );
    } else {
      setSelectedServices([
        ...selectedServices,
        service,
      ]);
    }
  };

  // ======================================================
  // WHATSAPP NUMBER
  // ======================================================

  const getWhatsAppNumber = (
    phone: string
  ) => {
    let number = String(
      phone || ""
    ).replace(/\D/g, "");

    // India local number
    if (number.startsWith("0")) {
      number = number.substring(1);
    }

    // 10 digit Indian number
    if (number.length === 10) {
      number = `91${number}`;
    }

    return number;
  };

  // ======================================================
  // FORMAT MONEY
  // ======================================================

  const formatMoney = (
    value: number
  ) => {
    return Number(value || 0)
      .toLocaleString("en-IN");
  };

  // ======================================================
  // CREATE WHATSAPP MESSAGE
  // ======================================================

  const buildWhatsAppMessage = (
    bill: any
  ) => {
    const clientName =
      bill?.clientName ||
      bill?.client?.name ||
      selectedClient?.name ||
      "Customer";

    const clientPhone =
      bill?.clientPhone ||
      bill?.client?.phone ||
      selectedClient?.phone ||
      "";

    const invoiceNumber =
      bill?.invoiceNumber ||
      "Invoice";

    const billDate =
      bill?.billDate ||
      bill?.createdAt ||
      new Date().toISOString();

    const stylistName =
      bill?.stylistName ||
      bill?.stylist?.name ||
      selectedStylist?.name ||
      "Staff";

    const finalSubtotal =
      Number(
        bill?.subtotal ??
          subtotal
      );

    const finalDiscount =
      Number(
        bill?.discount ??
          discountAmount
      );

    const finalTotal =
      Number(
        bill?.grandTotal ??
          total
      );

    const finalPaymentMethod =
      bill?.paymentMethod ||
      paymentMethod;

    const finalPaymentStatus =
      bill?.paymentStatus ||
      "Paid";

    // --------------------------------------------------
    // SERVICES
    // --------------------------------------------------

    let items =
      Array.isArray(bill?.items)
        ? bill.items
        : [];

    if (items.length === 0) {
      items =
        selectedServices.map(
          (service) => ({
            serviceName:
              service.name,

            price:
              Number(service.price || 0),

            quantity: 1,

            total:
              Number(service.price || 0),
          })
        );
    }

    const serviceText =
      items
        .map(
          (
            item: any,
            index: number
          ) => {
            const serviceName =
              item?.serviceName ||
              item?.service?.name ||
              selectedServices[
                index
              ]?.name ||
              "Service";

            const quantity =
              Number(
                item?.quantity || 1
              );

            const itemPrice =
              Number(
                item?.price || 0
              );

            const itemTotal =
              Number(
                item?.total
              ) ||
              itemPrice * quantity;

            const itemStylist =
              item?.stylistName ||
              item?.stylist?.name ||
              stylistName;

            return `${index + 1}. ${serviceName}
   Staff: ${itemStylist}
   Qty: ${quantity}
   ₹${formatMoney(itemTotal)}`;
          }
        )
        .join("\n\n");

    const formattedDate =
      new Date(
        billDate
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    return `✨ *Glow Salon – Invoice* ✨

Hello ${clientName} 👋

Thank you for visiting *Glow Salon*.

🧾 *Invoice:* ${invoiceNumber}
📅 *Date:* ${formattedDate}

👤 *Client*
${clientName}
📱 ${clientPhone}

💇 *Services*

${serviceText}

👨‍💼 *Staff / Stylist*
${stylistName}

────────────────
Subtotal: ₹${formatMoney(
      finalSubtotal
    )}

Discount: ₹${formatMoney(
      finalDiscount
    )}

────────────────
💰 *Total: ₹${formatMoney(
      finalTotal
    )}*

💳 *Payment*
Status: ${finalPaymentStatus}
Method: ${finalPaymentMethod}

Thank you for choosing
✨ *Glow Salon* ✨

We look forward to seeing you again ❤️`;
  };

  // ======================================================
  // GENERATE + WHATSAPP
  // ======================================================

  const sendInvoiceToWhatsApp = async (
    bill: any
  ) => {
    try {
      if (!bill) {
        Alert.alert(
          "Invoice Error",
          "Bill data is not available."
        );

        return;
      }

      const phone =
        selectedClient?.phone ||
        bill?.clientPhone ||
        bill?.client?.phone ||
        "";

      if (!phone) {
        Alert.alert(
          "WhatsApp Error",
          "Client phone number is not available."
        );

        return;
      }

      const whatsappNumber =
        getWhatsAppNumber(phone);

      if (
        whatsappNumber.length < 12
      ) {
        Alert.alert(
          "Invalid Number",
          "Please check the client's phone number."
        );

        return;
      }

      // ------------------------------------------------
      // Create complete bill object for PDF
      // ------------------------------------------------

      const pdfBill = {
        ...bill,

        clientName:
          bill?.clientName ||
          selectedClient?.name ||
          "",

        clientPhone:
          bill?.clientPhone ||
          selectedClient?.phone ||
          "",

        stylistName:
          bill?.stylistName ||
          selectedStylist?.name ||
          "",

        stylist:
          bill?.stylist ||
          selectedStylist ||
          null,

        items:
          Array.isArray(
            bill?.items
          ) &&
          bill.items.length > 0
            ? bill.items
            : selectedServices.map(
                (service) => ({
                  service: service,
                  serviceName:
                    service.name,
                  quantity: 1,
                  price:
                    Number(
                      service.price || 0
                    ),
                  total:
                    Number(
                      service.price || 0
                    ),
                  stylist:
                    selectedStylist,
                  stylistName:
                    selectedStylist?.name ||
                    "",
                })
              ),
      };

      // ------------------------------------------------
      // Generate PDF
      // ------------------------------------------------

      let pdfUri = "";

      try {
        pdfUri =
          await generateInvoicePdf(
            pdfBill
          );
      } catch (pdfError) {
        console.error(
          "PDF GENERATION ERROR:",
          pdfError
        );
      }

      // ------------------------------------------------
      // WhatsApp message
      // ------------------------------------------------

      const message =
        buildWhatsAppMessage(
          pdfBill
        );

      const whatsappUrl =
        `https://wa.me/${whatsappNumber}` +
        `?text=${encodeURIComponent(
          message
        )}`;

      const supported =
        await Linking.canOpenURL(
          whatsappUrl
        );

      if (!supported) {
        Alert.alert(
          "WhatsApp Not Found",
          "WhatsApp is not installed on this phone."
        );

        return;
      }

      // ------------------------------------------------
      // Open exact client chat
      // ------------------------------------------------

      await Linking.openURL(
        whatsappUrl
      );

      // ------------------------------------------------
      // PDF share option
      // ------------------------------------------------

      if (pdfUri) {
        setTimeout(() => {
          Alert.alert(
            "Invoice PDF Ready",
            "WhatsApp chat has been opened. You can also share the generated PDF.",
            [
              {
                text: "Share PDF",
                onPress:
                  async () => {
                    try {
                      await shareInvoicePdf(
                        pdfUri
                      );
                    } catch (
                      shareError: any
                    ) {
                      console.error(
                        "INVOICE SHARE ERROR:",
                        shareError
                      );

                      Alert.alert(
                        "Share Error",
                        shareError
                          ?.message ||
                          "Unable to share invoice PDF."
                      );
                    }
                  },
              },

              {
                text: "Done",
                style: "cancel",
              },
            ]
          );
        }, 700);
      }
    } catch (error: any) {
      console.error(
        "WHATSAPP ERROR:",
        error
      );

      Alert.alert(
        "WhatsApp Error",
        error?.message ||
          "Unable to open WhatsApp."
      );
    }
  };

  // ======================================================
  // GENERATE BILL
  // ======================================================

  const generateBill = async () => {
    if (!selectedClient) {
      Alert.alert(
        "Select Client",
        "Please search and select a client."
      );

      return;
    }

    if (!selectedStylist) {
      Alert.alert(
        "Select Staff",
        "Please search and select the staff / stylist who provided the service."
      );

      return;
    }

    if (
      selectedServices.length === 0
    ) {
      Alert.alert(
        "Select Service",
        "Please select at least one service."
      );

      return;
    }

    try {
      setCreatingBill(true);

      // ------------------------------------------------
      // Backend bill payload
      // ------------------------------------------------

      const bill =
        await dispatch(
          createBill({
            clientId:
              selectedClient._id,

            stylistId:
              selectedStylist._id,

            items:
              selectedServices.map(
                (service) => ({
                  serviceId:
                    service._id,

                  quantity: 1,
                })
              ),

            discount:
              discountAmount,

            tax: 0,

            paymentMethod:
              paymentMethod ===
              "Split"
                ? "Other"
                : paymentMethod,

            paymentStatus:
              "Paid",

            notes: "",
          })
        ).unwrap();

      const finalTotal =
        Number(
          bill?.grandTotal ??
            total
        );

      Alert.alert(
        "Bill Generated",
        `Invoice: ${
          bill?.invoiceNumber ||
          "Generated"
        }

Client: ${
          bill?.clientName ||
          selectedClient?.name ||
          ""
        }

Staff: ${
          bill?.stylistName ||
          selectedStylist?.name ||
          ""
        }

Total: ₹${formatMoney(
          finalTotal
        )}

Payment: ${
          bill?.paymentMethod ||
          paymentMethod
        }`,
        [
          {
            text: "WhatsApp",
            onPress: () =>
              sendInvoiceToWhatsApp(
                bill
              ),
          },

          {
            text: "Share PDF",
            onPress:
              async () => {
                try {
                  const pdfBill = {
                    ...bill,

                    clientName:
                      bill?.clientName ||
                      selectedClient?.name ||
                      "",

                    clientPhone:
                      bill?.clientPhone ||
                      selectedClient?.phone ||
                      "",

                    stylistName:
                      bill?.stylistName ||
                      selectedStylist?.name ||
                      "",

                    stylist:
                      bill?.stylist ||
                      selectedStylist ||
                      null,

                    items:
                      Array.isArray(
                        bill?.items
                      ) &&
                      bill.items.length > 0
                        ? bill.items
                        : selectedServices.map(
                            (service) => ({
                              service:
                                service,

                              serviceName:
                                service.name,

                              quantity: 1,

                              price:
                                Number(
                                  service.price ||
                                    0
                                ),

                              total:
                                Number(
                                  service.price ||
                                    0
                                ),

                              stylist:
                                selectedStylist,

                              stylistName:
                                selectedStylist?.name ||
                                "",
                            })
                          ),
                  };

                  const uri =
                    await generateInvoicePdf(
                      pdfBill
                    );

                  await shareInvoicePdf(
                    uri
                  );
                } catch (
                  error: any
                ) {
                  console.error(
                    "PDF SHARE ERROR:",
                    error
                  );

                  Alert.alert(
                    "PDF Error",
                    error?.message ||
                      "Unable to share PDF."
                  );
                }
              },
          },

          {
            text: "Done",
            style: "cancel",
          },
        ]
      );
    } catch (error: any) {
      console.error(
        "CREATE BILL ERROR:",
        error
      );

      Alert.alert(
        "Billing Error",
        error?.message ||
          "Failed to create bill."
      );
    } finally {
      setCreatingBill(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F2EF"
      />

      <View style={styles.container}>
        {/* ==================================================
            HEADER
        ================================================== */}

        <View style={styles.header} />

        {/* ==================================================
            TITLE
        ================================================== */}

        <View style={styles.titleRow}>
          <Text
            style={styles.pageTitle}
          >
            New Bill
          </Text>

          <Pressable
            onPress={() => {
              Alert.alert(
                "Bill History",
                "Bill history is connected through the billing backend and can be added as a separate page."
              );
            }}
          >
            <Text
              style={styles.historyText}
            >
              Bill History →
            </Text>
          </Pressable>
        </View>

        {/* ==================================================
            KEYBOARD AWARE PAGE
        ================================================== */}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
          keyboardVerticalOffset={
            Platform.OS === "ios"
              ? 80
              : 20
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios"
                ? "interactive"
                : "on-drag"
            }
            contentContainerStyle={
              styles.content
            }
          >
            {/* ==================================================
                BILL CARD
            ================================================== */}

            <View
              style={styles.billCard}
            >
              {/* ==================================================
                  CLIENT
              ================================================== */}

              <Text
                style={styles.label}
              >
                SELECT CLIENT
              </Text>

              <View
                style={
                  styles.clientSearchContainer
                }
              >
                <TextInput
                  value={search}
                  onChangeText={(
                    value
                  ) => {
                    setSearch(value);

                    if (
                      value.trim()
                        .length === 0
                    ) {
                      setClients([]);
                      setShowClients(
                        false
                      );
                      return;
                    }

                    setShowClients(
                      true
                    );
                  }}
                  onSubmitEditing={
                    handleClientSearch
                  }
                  placeholder="Search name, phone or email..."
                  placeholderTextColor="#B9A2A8"
                  style={
                    styles.clientSearchInput
                  }
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                />

                {search.length >
                  0 && (
                  <Pressable
                    onPress={
                      clearClientSearch
                    }
                    hitSlop={8}
                    style={
                      styles.clientClearButton
                    }
                  >
                    <Text
                      style={
                        styles.clientClearText
                      }
                    >
                      ×
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={
                    handleClientSearch
                  }
                  style={
                    styles.clientSearchButton
                  }
                >
                  <Text
                    style={
                      styles.clientSearchButtonText
                    }
                  >
                    ⌕
                  </Text>
                </Pressable>
              </View>

              {/* SELECTED CLIENT */}

              {selectedClient && (
                <View
                  style={
                    styles.selectedClientCard
                  }
                >
                  <View
                    style={
                      styles.clientAvatar
                    }
                  >
                    <Text
                      style={
                        styles.clientAvatarText
                      }
                    >
                      {(
                        selectedClient.name ||
                        "C"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.dropdownClientInfo
                    }
                  >
                    <Text
                      style={
                        styles.dropdownName
                      }
                    >
                      {selectedClient.name ||
                        "Client"}
                    </Text>

                    {!!selectedClient.phone && (
                      <Text
                        style={
                          styles.dropdownPhone
                        }
                      >
                        {
                          selectedClient.phone
                        }
                      </Text>
                    )}

                    {!!selectedClient.email && (
                      <Text
                        style={
                          styles.dropdownEmail
                        }
                        numberOfLines={1}
                      >
                        {
                          selectedClient.email
                        }
                      </Text>
                    )}
                  </View>

                  <Pressable
                    onPress={() => {
                      setSelectedClient(
                        null
                      );

                      setSearch("");

                      setClients([]);

                      setShowClients(
                        false
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.changeText
                      }
                    >
                      Change
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* CLIENT RESULTS */}

              {showClients &&
                search.trim()
                  .length > 0 &&
                !selectedClient && (
                  <View
                    style={
                      styles.clientDropdown
                    }
                  >
                    {clients.length >
                    0 ? (
                      <ScrollView
                        style={
                          styles.clientList
                        }
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                      >
                        {clients.map(
                          (client) => (
                            <Pressable
                              key={
                                client._id
                              }
                              style={
                                styles.dropdownItem
                              }
                              onPress={() => {
                                setSelectedClient(
                                  client
                                );

                                setShowClients(
                                  false
                                );

                                setSearch(
                                  ""
                                );

                                setClients(
                                  []
                                );
                              }}
                            >
                              <View
                                style={
                                  styles.clientAvatar
                                }
                              >
                                <Text
                                  style={
                                    styles.clientAvatarText
                                  }
                                >
                                  {(
                                    client.name ||
                                    "C"
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </Text>
                              </View>

                              <View
                                style={
                                  styles.dropdownClientInfo
                                }
                              >
                                <Text
                                  style={
                                    styles.dropdownName
                                  }
                                >
                                  {client.name ||
                                    "Unknown Client"}
                                </Text>

                                {!!client.phone && (
                                  <Text
                                    style={
                                      styles.dropdownPhone
                                    }
                                  >
                                    {
                                      client.phone
                                    }
                                  </Text>
                                )}

                                {!!client.email && (
                                  <Text
                                    style={
                                      styles.dropdownEmail
                                    }
                                    numberOfLines={
                                      1
                                    }
                                  >
                                    {
                                      client.email
                                    }
                                  </Text>
                                )}
                              </View>
                            </Pressable>
                          )
                        )}
                      </ScrollView>
                    ) : (
                      <View
                        style={
                          styles.noClientBox
                        }
                      >
                        <Text
                          style={
                            styles.noClientTitle
                          }
                        >
                          No Clients Found
                        </Text>

                        <Text
                          style={
                            styles.noClientText
                          }
                        >
                          Press search or submit
                          the search to find a
                          client.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

              {/* ==================================================
                  STAFF
              ================================================== */}

              <Text
                style={[
                  styles.label,
                  {
                    marginTop: 12,
                  },
                ]}
              >
                STAFF / STYLIST
              </Text>

              <View
                style={
                  styles.clientSearchContainer
                }
              >
                <TextInput
                  value={staffSearch}
                  onChangeText={(
                    value
                  ) => {
                    setStaffSearch(
                      value
                    );

                    setShowStylists(
                      value.trim()
                        .length > 0
                    );
                  }}
                  placeholder="Search staff by name or phone..."
                  placeholderTextColor="#B9A2A8"
                  style={
                    styles.clientSearchInput
                  }
                  returnKeyType="search"
                  autoCorrect={false}
                />

                {staffSearch.length >
                  0 && (
                  <Pressable
                    onPress={() => {
                      setStaffSearch(
                        ""
                      );

                      setShowStylists(
                        false
                      );
                    }}
                    hitSlop={8}
                    style={
                      styles.clientClearButton
                    }
                  >
                    <Text
                      style={
                        styles.clientClearText
                      }
                    >
                      ×
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* SELECTED STAFF */}

              {selectedStylist && (
                <View
                  style={
                    styles.selectedClientCard
                  }
                >
                  <View
                    style={
                      styles.clientAvatar
                    }
                  >
                    <Text
                      style={
                        styles.clientAvatarText
                      }
                    >
                      {(
                        selectedStylist.name ||
                        "S"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.dropdownClientInfo
                    }
                  >
                    <Text
                      style={
                        styles.dropdownName
                      }
                    >
                      {
                        selectedStylist.name
                      }
                    </Text>

                    {!!selectedStylist.phone && (
                      <Text
                        style={
                          styles.dropdownPhone
                        }
                      >
                        {
                          selectedStylist.phone
                        }
                      </Text>
                    )}

                    {!!selectedStylist.specialization && (
                      <Text
                        style={
                          styles.dropdownEmail
                        }
                      >
                        {
                          selectedStylist.specialization
                        }
                      </Text>
                    )}
                  </View>

                  <Pressable
                    onPress={() => {
                      setSelectedStylist(
                        null
                      );

                      setStaffSearch(
                        ""
                      );

                      setShowStylists(
                        false
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.changeText
                      }
                    >
                      Change
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* STAFF RESULTS */}

              {showStylists &&
                staffSearch.trim()
                  .length > 0 &&
                !selectedStylist && (
                  <View
                    style={
                      styles.clientDropdown
                    }
                  >
                    {filteredStylists.length >
                    0 ? (
                      <ScrollView
                        style={
                          styles.clientList
                        }
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                      >
                        {filteredStylists.map(
                          (staff) => (
                            <Pressable
                              key={
                                staff._id
                              }
                              style={
                                styles.dropdownItem
                              }
                              onPress={() => {
                                setSelectedStylist(
                                  staff
                                );

                                setShowStylists(
                                  false
                                );

                                setStaffSearch(
                                  ""
                                );
                              }}
                            >
                              <View
                                style={
                                  styles.clientAvatar
                                }
                              >
                                <Text
                                  style={
                                    styles.clientAvatarText
                                  }
                                >
                                  {(
                                    staff.name ||
                                    "S"
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </Text>
                              </View>

                              <View
                                style={
                                  styles.dropdownClientInfo
                                }
                              >
                                <Text
                                  style={
                                    styles.dropdownName
                                  }
                                >
                                  {
                                    staff.name
                                  }
                                </Text>

                                {!!staff.phone && (
                                  <Text
                                    style={
                                      styles.dropdownPhone
                                    }
                                  >
                                    {
                                      staff.phone
                                    }
                                  </Text>
                                )}

                                {!!staff.specialization && (
                                  <Text
                                    style={
                                      styles.dropdownEmail
                                    }
                                  >
                                    {
                                      staff.specialization
                                    }
                                  </Text>
                                )}
                              </View>
                            </Pressable>
                          )
                        )}
                      </ScrollView>
                    ) : (
                      <View
                        style={
                          styles.noClientBox
                        }
                      >
                        <Text
                          style={
                            styles.noClientTitle
                          }
                        >
                          No Staff Found
                        </Text>

                        <Text
                          style={
                            styles.noClientText
                          }
                        >
                          Try another staff name,
                          phone or specialization.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

              {/* ==================================================
                  SERVICES
              ================================================== */}

              <View
                style={
                  styles.serviceHeader
                }
              >
                <Text
                  style={styles.label}
                >
                  SERVICES
                </Text>

                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Services",
                      "Select one or more services below."
                    );
                  }}
                >
                  <Text
                    style={styles.addText}
                  >
                    + Add
                  </Text>
                </Pressable>
              </View>

              {services.map(
                (service) => {
                  const selected =
                    selectedServices.some(
                      (item) =>
                        item._id ===
                        service._id
                    );

                  return (
                    <Pressable
                      key={
                        service._id
                      }
                      style={[
                        styles.serviceRow,
                        selected &&
                          styles.selectedServiceRow,
                      ]}
                      onPress={() =>
                        toggleService(
                          service
                        )
                      }
                    >
                      <View
                        style={[
                          styles.serviceCheck,
                          selected &&
                            styles.serviceCheckSelected,
                        ]}
                      >
                        {selected && (
                          <Text
                            style={
                              styles.checkText
                            }
                          >
                            ✓
                          </Text>
                        )}
                      </View>

                      <View
                        style={
                          styles.serviceInfo
                        }
                      >
                        <Text
                          style={
                            styles.serviceName
                          }
                        >
                          {
                            service.name
                          }
                        </Text>

                        <Text
                          style={
                            styles.serviceDuration
                          }
                        >
                          {
                            service.duration
                          }{" "}
                          min
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.servicePrice
                        }
                      >
                        ₹
                        {Number(
                          service.price ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </Text>
                    </Pressable>
                  );
                }
              )}

              {/* ==================================================
                  DISCOUNT
              ================================================== */}

              <Text
                style={[
                  styles.label,
                  {
                    marginTop: 12,
                  },
                ]}
              >
                DISCOUNT
              </Text>

              <View
                style={
                  styles.discountBox
                }
              >
                <Text
                  style={
                    styles.rupeeSymbol
                  }
                >
                  ₹
                </Text>

                <TextInput
                  value={discount}
                  onChangeText={
                    setDiscount
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#B6A8AC"
                  style={
                    styles.discountInput
                  }
                />
              </View>

              {/* ==================================================
                  SUMMARY
              ================================================== */}

              <View
                style={
                  styles.summaryDivider
                }
              />

              <View
                style={
                  styles.summaryRow
                }
              >
                <Text
                  style={
                    styles.subtotalText
                  }
                >
                  Subtotal
                </Text>

                <Text
                  style={
                    styles.subtotalValue
                  }
                >
                  ₹
                  {formatMoney(
                    subtotal
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.summaryRow
                }
              >
                <Text
                  style={
                    styles.discountText
                  }
                >
                  Discount
                </Text>

                <Text
                  style={
                    styles.discountValue
                  }
                >
                  - ₹
                  {formatMoney(
                    discountAmount
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.totalRow
                }
              >
                <Text
                  style={
                    styles.totalLabel
                  }
                >
                  Total
                </Text>

                <Text
                  style={
                    styles.totalValue
                  }
                >
                  ₹
                  {formatMoney(total)}
                </Text>
              </View>

              {/* ==================================================
                  GENERATE
              ================================================== */}

              <Pressable
                style={[
                  styles.generateButton,
                  (creatingBill ||
                    loadingData) &&
                    {
                      opacity: 0.6,
                    },
                ]}
                onPress={
                  generateBill
                }
                disabled={
                  creatingBill ||
                  loadingData
                }
              >
                <Text
                  style={
                    styles.generateText
                  }
                >
                  {creatingBill
                    ? "Generating Bill..."
                    : `Generate Bill • ₹${formatMoney(
                        total
                      )}`}
                </Text>
              </Pressable>
            </View>

            {/* ==================================================
                PAYMENT
            ================================================== */}

            <Text
              style={
                styles.paymentTitle
              }
            >
              Payment Method
            </Text>

            <View
              style={
                styles.paymentGrid
              }
            >
              {[
                {
                  name: "Cash",
                  icon: "₹",
                },
                {
                  name: "UPI",
                  icon: "⌁",
                },
                {
                  name: "Card",
                  icon: "▣",
                },
                {
                  name: "Split",
                  icon: "÷",
                },
              ].map(
                (method) => {
                  const active =
                    paymentMethod ===
                    method.name;

                  return (
                    <Pressable
                      key={
                        method.name
                      }
                      style={[
                        styles.paymentCard,
                        active &&
                          styles.paymentCardActive,
                      ]}
                      onPress={() =>
                        setPaymentMethod(
                          method.name
                        )
                      }
                    >
                      <View
                        style={[
                          styles.paymentIcon,
                          active &&
                            styles.paymentIconActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.paymentIconText,
                            active &&
                              styles.paymentIconTextActive,
                          ]}
                        >
                          {
                            method.icon
                          }
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.paymentName,
                          active &&
                            styles.paymentNameActive,
                        ]}
                      >
                        {
                          method.name
                        }
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>

            {/* ==================================================
                QUICK SUMMARY
            ================================================== */}

            <View
              style={
                styles.bottomSummary
              }
            >
              <View>
                <Text
                  style={
                    styles.bottomSmall
                  }
                >
                  PAYMENT
                </Text>

                <Text
                  style={
                    styles.bottomPayment
                  }
                >
                  {
                    paymentMethod
                  }
                </Text>
              </View>

              <View
                style={{
                  alignItems:
                    "flex-end",
                }}
              >
                <Text
                  style={
                    styles.bottomSmall
                  }
                >
                  PAYABLE
                </Text>

                <Text
                  style={
                    styles.bottomAmount
                  }
                >
                  ₹
                  {formatMoney(total)}
                </Text>
              </View>
            </View>

            <View
              style={{
                height: 150,
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ==================================================
            BOTTOM NAV
        ================================================== */}

        <View
          style={styles.bottomNav}
        >
          <NavItem
            icon="⌂"
            label="Home"
            onPress={() =>
              router.push("/")
            }
          />

          <NavItem
            icon="♙"
            label="Clients"
            onPress={() =>
              router.push(
                "/clients"
              )
            }
          />

          <NavItem
            icon="▣"
            label="Billing"
            active
            onPress={() => {}}
          />

          <NavItem
            icon="✦"
            label="Services"
            onPress={() =>
              router.push(
                "/services"
              )
            }
          />

          <NavItem
            icon="•••"
            label="More"
            onPress={() =>
              Alert.alert(
                "More",
                "More options coming soon."
              )
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ======================================================
// NAV ITEM
// ======================================================

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.navItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.navIconBox,
          active &&
            styles.navIconBoxActive,
        ]}
      >
        <Text
          style={[
            styles.navIcon,
            active &&
              styles.navIconActive,
          ]}
        >
          {icon}
        </Text>
      </View>

      <Text
        style={[
          styles.navLabel,
          active &&
            styles.navLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F2EF",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8F2EF",
  },

  header: {
    height: 32,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  titleRow: {
    paddingHorizontal: 15,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  pageTitle: {
    color: "#33282C",
    fontSize: 14,
    fontWeight: "800",
  },

  historyText: {
    color: "#7E243A",
    fontSize: 7,
    fontWeight: "800",
  },

  content: {
    paddingHorizontal: 15,
    paddingBottom: 25,
  },

  billCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EADFDB",
    padding: 10,
  },

  label: {
    color: "#9B8A90",
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  selectedClientCard: {
    marginTop: 7,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E7DAD7",
    borderRadius: 10,
    backgroundColor: "#FFF9F7",
    paddingHorizontal: 8,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  changeText: {
    color: "#8A243B",
    fontSize: 6,
    fontWeight: "900",
  },

  clientDropdown: {
    marginTop: 5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E7DAD7",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  clientSearchContainer: {
    height: 40,
    margin: 7,
    borderWidth: 1,
    borderColor: "#EEDDE1",
    borderRadius: 10,
    backgroundColor: "#FFF9F7",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 9,
    paddingRight: 4,
  },

  clientSearchInput: {
    flex: 1,
    color: "#45363B",
    fontSize: 8,
    paddingVertical: 0,
  },

  clientClearButton: {
    width: 25,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  clientClearText: {
    color: "#A98B93",
    fontSize: 19,
    lineHeight: 20,
  },

  clientSearchButton: {
    width: 31,
    height: 31,
    borderRadius: 8,
    backgroundColor: "#A93650",
    alignItems: "center",
    justifyContent: "center",
  },

  clientSearchButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  clientList: {
    maxHeight: 220,
  },

  dropdownClientInfo: {
    flex: 1,
    marginLeft: 8,
  },

  dropdownEmail: {
    color: "#B0A1A6",
    fontSize: 6,
    marginTop: 2,
  },

  noClientBox: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
  },

  noClientTitle: {
    color: "#45363B",
    fontSize: 8,
    fontWeight: "800",
  },

  noClientText: {
    color: "#A4979B",
    fontSize: 6,
    marginTop: 4,
    textAlign: "center",
  },

  dropdownItem: {
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1E9E6",
  },

  clientAvatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#F5E5E2",
    alignItems: "center",
    justifyContent: "center",
  },

  clientAvatarText: {
    color: "#7E243A",
    fontSize: 8,
    fontWeight: "800",
  },

  dropdownName: {
    color: "#45363B",
    fontSize: 8,
    fontWeight: "700",
    marginLeft: 8,
  },

  dropdownPhone: {
    color: "#A4979B",
    fontSize: 6,
    marginLeft: 8,
    marginTop: 2,
  },

  serviceHeader: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  addText: {
    color: "#7E243A",
    fontSize: 7,
    fontWeight: "800",
  },

  serviceRow: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE5E2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
  },

  selectedServiceRow: {
    backgroundColor: "#FFF9F7",
  },

  serviceCheck: {
    width: 23,
    height: 23,
    borderRadius: 7,
    backgroundColor: "#F8E9E7",
    alignItems: "center",
    justifyContent: "center",
  },

  serviceCheckSelected: {
    backgroundColor: "#7E243A",
  },

  checkText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  serviceInfo: {
    flex: 1,
    marginLeft: 8,
  },

  serviceName: {
    color: "#403337",
    fontSize: 8,
    fontWeight: "700",
  },

  serviceDuration: {
    color: "#A4979B",
    fontSize: 6,
    marginTop: 2,
  },

  servicePrice: {
    color: "#7E243A",
    fontSize: 7,
    fontWeight: "800",
  },

  discountBox: {
    height: 35,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E7DAD7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
  },

  rupeeSymbol: {
    color: "#8A747A",
    fontSize: 8,
    fontWeight: "700",
  },

  discountInput: {
    flex: 1,
    color: "#403337",
    fontSize: 8,
    padding: 0,
    marginLeft: 4,
  },

  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: "#E7DAD7",
    borderStyle: "dashed",
    marginTop: 9,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginTop: 7,
  },

  subtotalText: {
    color: "#95868B",
    fontSize: 7,
  },

  subtotalValue: {
    color: "#66565B",
    fontSize: 7,
  },

  discountText: {
    color: "#95868B",
    fontSize: 7,
  },

  discountValue: {
    color: "#7E243A",
    fontSize: 7,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EFE5E2",
  },

  totalLabel: {
    color: "#33282C",
    fontSize: 11,
    fontWeight: "900",
  },

  totalValue: {
    color: "#7E243A",
    fontSize: 12,
    fontWeight: "900",
  },

  generateButton: {
    height: 39,
    backgroundColor: "#8A243B",
    borderRadius: 9,
    marginTop: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  generateText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "900",
  },

  paymentTitle: {
    color: "#33282C",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 7,
  },

  paymentGrid: {
    flexDirection: "row",
    gap: 6,
  },

  paymentCard: {
    flex: 1,
    height: 63,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7DAD7",
    alignItems: "center",
    justifyContent: "center",
  },

  paymentCardActive: {
    borderColor: "#8A243B",
    backgroundColor: "#FFF8F6",
  },

  paymentIcon: {
    width: 23,
    height: 23,
    borderRadius: 7,
    backgroundColor: "#F8E8E6",
    alignItems: "center",
    justifyContent: "center",
  },

  paymentIconActive: {
    backgroundColor: "#8A243B",
  },

  paymentIconText: {
    color: "#8A243B",
    fontSize: 10,
    fontWeight: "800",
  },

  paymentIconTextActive: {
    color: "#FFFFFF",
  },

  paymentName: {
    color: "#6F6065",
    fontSize: 6,
    fontWeight: "700",
    marginTop: 5,
  },

  paymentNameActive: {
    color: "#8A243B",
  },

  bottomSummary: {
    marginTop: 12,
    backgroundColor: "#F1E2DF",
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    justifyContent:
      "space-between",
  },

  bottomSmall: {
    color: "#9B7E85",
    fontSize: 5,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  bottomPayment: {
    color: "#70243A",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2,
  },

  bottomAmount: {
    color: "#70243A",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
  },

  bottomNav: {
    position: "absolute",
    left: 9,
    right: 9,
    bottom: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8DEDB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-around",
    elevation: 8,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconBoxActive: {
    backgroundColor: "#8A243B",
  },

  navIcon: {
    color: "#9C8D92",
    fontSize: 10,
    fontWeight: "800",
  },

  navIconActive: {
    color: "#FFFFFF",
  },

  navLabel: {
    color: "#9C8D92",
    fontSize: 5,
    marginTop: 2,
  },

  navLabelActive: {
    color: "#8A243B",
    fontWeight: "800",
  },
});

