import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { apiRequest } from "../../src/api/api";
import {
  createBooking,
  confirmBooking,
} from "../../src/features/booking/bookingSlice";

type Client = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
};

type Service = {
  _id: string;
  name: string;
  price?: number;
  duration?: number;
  category?: string;
};

type Stylist = {
  _id: string;
  name: string;
  phone?: string;
};

const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
];

const unwrapArray = (response: any, key: string) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data?.[key])) return response.data[key];
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export default function NewBookingScreen() {
  const dispatch = useDispatch<any>();
  const token = useSelector((state: any) => state.auth?.token);

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [stylistOpen, setStylistOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const totalAmount = useMemo(
    () =>
      selectedServices.reduce(
        (total, service) => total + Number(service.price || 0),
        0
      ),
    [selectedServices]
  );

  const totalDuration = useMemo(
    () =>
      selectedServices.reduce(
        (total, service) => total + Number(service.duration || 0),
        0
      ),
    [selectedServices]
  );

  const formattedDate = selectedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    let mounted = true;

    const loadFormData = async () => {
      try {
        setLoadingData(true);

        const [clientsResponse, servicesResponse, stylistsResponse] =
          await Promise.all([
            apiRequest("/clients", {
              method: "GET",
              token,
            }),
            apiRequest("/services", {
              method: "GET",
              token,
            }),
            apiRequest("/stylists", {
              method: "GET",
              token,
            }).catch(() => ({ stylists: [] })),
          ]);

        if (!mounted) return;

        setClients(unwrapArray(clientsResponse, "clients"));
        setServices(unwrapArray(servicesResponse, "services"));
        setStylists(unwrapArray(stylistsResponse, "stylists"));
      } catch (error: any) {
        console.error("BOOKING FORM DATA ERROR:", error);

        if (mounted) {
          setClients([]);
          setServices([]);
          setStylists([]);
          Alert.alert(
            "Unable to load data",
            error?.message || "Clients and services could not be loaded."
          );
        }
      } finally {
        if (mounted) setLoadingData(false);
      }
    };

    loadFormData();

    return () => {
      mounted = false;
    };
  }, [token]);

  const toggleService = (service: Service) => {
    const alreadySelected = selectedServices.some(
      (item) => item._id === service._id
    );

    if (alreadySelected) {
      setSelectedServices((current) =>
        current.filter((item) => item._id !== service._id)
      );
    } else {
      setSelectedServices((current) => [...current, service]);
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedClient) {
      Alert.alert("Select Client", "Please select a client first.");
      return;
    }

    if (!selectedTime) {
      Alert.alert("Select Time", "Please select appointment time.");
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert("Select Service", "Please select at least one service.");
      return;
    }

    try {
      setCreating(true);

      const bookingData = {
        client: selectedClient._id,
        service: selectedServices[0]._id,
        serviceIds: selectedServices.map((service) => service._id),
        bookingDate: selectedDate.toISOString(),
        startTime: selectedTime,
        endTime: null,
        stylist: selectedStylist?._id || null,
        notes: notes.trim(),
      };

      const result = await dispatch(createBooking(bookingData)).unwrap();

      // Admin creates the appointment, so confirm it immediately
      // after the backend creates the initial PENDING booking.
      const bookingId = result?._id || result?.booking?._id;

      if (bookingId) {
        await dispatch(confirmBooking(bookingId)).unwrap();
      }

      console.log("CREATED + CONFIRMED BOOKING:", result);

      Alert.alert(
        "Booking Created",
        "Appointment has been confirmed successfully.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/bookings"),
          },
        ]
      );
    } catch (error: any) {
      console.error("CREATE BOOKING ERROR:", error);

      Alert.alert(
        "Booking Failed",
        typeof error === "string"
          ? error
          : error?.message || "Unable to create booking."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#321923"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              New Booking
            </Text>

            <Text style={styles.subtitle}>
              Create an appointment for your client
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {loadingData ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#76253A" />
              <Text style={styles.loadingText}>
                Loading clients, services and stylists...
              </Text>
            </View>
          ) : null}

          {/* CLIENT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Client
            </Text>

            <Pressable
              style={styles.selectBox}
              disabled={loadingData}
              onPress={() =>
                setClientOpen(!clientOpen)
              }
            >
              <View style={styles.selectLeft}>
                <View style={styles.roundIcon}>
                  <Ionicons
                    name="person-outline"
                    size={19}
                    color="#76253A"
                  />
                </View>

                <View>
                  <Text
                    style={
                      selectedClient
                        ? styles.selectedValue
                        : styles.placeholder
                    }
                  >
                    {selectedClient
                      ? selectedClient.name
                      : "Select client"}
                  </Text>

                  {selectedClient && (
                    <Text style={styles.smallText}>
                      {selectedClient.phone}
                    </Text>
                  )}
                </View>
              </View>

              <Ionicons
                name={
                  clientOpen
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={19}
                color="#8D7B82"
              />
            </Pressable>

            {clientOpen && (
              <View style={styles.dropdown}>
                {clients.map((client) => {
                  const selected =
                    selectedClient?._id ===
                    client._id;

                  return (
                    <Pressable
                      key={client._id}
                      style={[
                        styles.dropdownItem,
                        selected &&
                          styles.selectedDropdownItem,
                      ]}
                      onPress={() => {
                        setSelectedClient(client);
                        setClientOpen(false);
                      }}
                    >
                      <View
                        style={styles.avatar}
                      >
                        <Text
                          style={styles.avatarText}
                        >
                          {client.name
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.flex}>
                        <Text
                          style={
                            styles.dropdownTitle
                          }
                        >
                          {client.name}
                        </Text>

                        <Text
                          style={styles.smallText}
                        >
                          {client.phone}
                        </Text>
                      </View>

                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color="#76253A"
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* DATE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Appointment Date
            </Text>

            <Pressable
              style={styles.selectBox}
              onPress={() =>
                setShowDatePicker(true)
              }
            >
              <View style={styles.selectLeft}>
                <View style={styles.roundIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={19}
                    color="#76253A"
                  />
                </View>

                <View>
                  <Text style={styles.selectedValue}>
                    {formattedDate}
                  </Text>

                  <Text style={styles.smallText}>
                    Appointment date
                  </Text>
                </View>
              </View>

              <Ionicons
                name="chevron-down"
                size={19}
                color="#8D7B82"
              />
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(false);

                  if (date) {
                    setSelectedDate(date);
                  }
                }}
              />
            )}
          </View>

          {/* TIME */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Appointment Time
            </Text>

            <Pressable
              style={styles.selectBox}
              onPress={() =>
                setTimeOpen(!timeOpen)
              }
            >
              <View style={styles.selectLeft}>
                <View style={styles.roundIcon}>
                  <Ionicons
                    name="time-outline"
                    size={19}
                    color="#76253A"
                  />
                </View>

                <Text
                  style={
                    selectedTime
                      ? styles.selectedValue
                      : styles.placeholder
                  }
                >
                  {selectedTime ||
                    "Select appointment time"}
                </Text>
              </View>

              <Ionicons
                name={
                  timeOpen
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={19}
                color="#8D7B82"
              />
            </Pressable>

            {timeOpen && (
              <View style={styles.timeGrid}>
                {timeSlots.map((time) => {
                  const selected =
                    selectedTime === time;

                  return (
                    <Pressable
                      key={time}
                      style={[
                        styles.timeItem,
                        selected &&
                          styles.selectedTimeItem,
                      ]}
                      onPress={() => {
                        setSelectedTime(time);
                        setTimeOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selected &&
                            styles.selectedTimeText,
                        ]}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* SERVICES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Services
            </Text>

            <Pressable
              style={styles.selectBox}
              disabled={loadingData}
              onPress={() =>
                setServiceOpen(!serviceOpen)
              }
            >
              <View style={styles.selectLeft}>
                <View style={styles.roundIcon}>
                  <Ionicons
                    name="sparkles-outline"
                    size={19}
                    color="#76253A"
                  />
                </View>

                <View>
                  <Text
                    style={
                      selectedServices.length
                        ? styles.selectedValue
                        : styles.placeholder
                    }
                  >
                    {selectedServices.length
                      ? `${selectedServices.length} service${
                          selectedServices.length >
                          1
                            ? "s"
                            : ""
                        } selected`
                      : "Select services"}
                  </Text>

                  {selectedServices.length >
                    0 && (
                    <Text
                      style={styles.smallText}
                    >
                      Tap below to manage services
                    </Text>
                  )}
                </View>
              </View>

              <Ionicons
                name={
                  serviceOpen
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={19}
                color="#8D7B82"
              />
            </Pressable>

            {serviceOpen && (
              <View style={styles.dropdown}>
                {services.map((service) => {
                  const selected =
                    selectedServices.some(
                      (item) =>
                        item._id === service._id
                    );

                  return (
                    <Pressable
                      key={service._id}
                      style={[
                        styles.serviceItem,
                        selected &&
                          styles.selectedDropdownItem,
                      ]}
                      onPress={() =>
                        toggleService(service)
                      }
                    >
                      <View
                        style={
                          styles.serviceIcon
                        }
                      >
                        <Ionicons
                          name="sparkles"
                          size={17}
                          color="#76253A"
                        />
                      </View>

                      <View
                        style={styles.flex}
                      >
                        <Text
                          style={
                            styles.dropdownTitle
                          }
                        >
                          {service.name}
                        </Text>

                        <Text
                          style={styles.smallText}
                        >
                          {Number(service.duration || 0)} min
                        </Text>
                      </View>

                      <Text
                        style={styles.servicePrice}
                      >
                        ₹
                        {Number(service.price || 0).toLocaleString(
                          "en-IN"
                        )}
                      </Text>

                      <View
                        style={[
                          styles.checkbox,
                          selected &&
                            styles.checkedBox,
                        ]}
                      >
                        {selected && (
                          <Ionicons
                            name="checkmark"
                            size={15}
                            color="#FFFFFF"
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* SELECTED SERVICES */}
            {selectedServices.length > 0 && (
              <View
                style={styles.selectedServices}
              >
                {selectedServices.map(
                  (service) => (
                    <View
                      key={service._id}
                      style={
                        styles.selectedServiceRow
                      }
                    >
                      <View
                        style={styles.flex}
                      >
                        <Text
                          style={
                            styles.selectedServiceName
                          }
                        >
                          {service.name}
                        </Text>

                        <Text
                          style={styles.smallText}
                        >
                          {Number(service.duration || 0)} min
                        </Text>
                      </View>

                      <Text
                        style={styles.servicePrice}
                      >
                        ₹
                        {Number(service.price || 0).toLocaleString(
                          "en-IN"
                        )}
                      </Text>

                      <Pressable
                        onPress={() =>
                          toggleService(service)
                        }
                        style={
                          styles.removeButton
                        }
                      >
                        <Ionicons
                          name="close"
                          size={17}
                          color="#8D7B82"
                        />
                      </Pressable>
                    </View>
                  )
                )}
              </View>
            )}
          </View>

          {/* STYLIST */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Stylist
            </Text>

            <Pressable
              style={styles.selectBox}
              disabled={loadingData}
              onPress={() =>
                setStylistOpen(!stylistOpen)
              }
            >
              <View style={styles.selectLeft}>
                <View style={styles.roundIcon}>
                  <Ionicons
                    name="person-circle-outline"
                    size={21}
                    color="#76253A"
                  />
                </View>

                <Text
                  style={
                    selectedStylist
                      ? styles.selectedValue
                      : styles.placeholder
                  }
                >
                  {selectedStylist
                    ? selectedStylist.name
                    : "Select stylist"}
                </Text>
              </View>

              <Ionicons
                name={
                  stylistOpen
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={19}
                color="#8D7B82"
              />
            </Pressable>

            {stylistOpen && (
              <View style={styles.dropdown}>
                {stylists.map((stylist) => {
                  const selected =
                    selectedStylist?._id ===
                    stylist._id;

                  return (
                    <Pressable
                      key={stylist._id}
                      style={[
                        styles.dropdownItem,
                        selected &&
                          styles.selectedDropdownItem,
                      ]}
                      onPress={() => {
                        setSelectedStylist(
                          stylist
                        );
                        setStylistOpen(false);
                      }}
                    >
                      <View
                        style={styles.avatar}
                      >
                        <Text
                          style={styles.avatarText}
                        >
                          {stylist.name
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.dropdownTitle,
                          styles.flex,
                        ]}
                      >
                        {stylist.name}
                      </Text>

                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color="#76253A"
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* NOTES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Notes
            </Text>

            <View style={styles.notesBox}>
              <Ionicons
                name="document-text-outline"
                size={19}
                color="#9A898F"
              />

              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add appointment notes..."
                placeholderTextColor="#B2A5AA"
                multiline
                textAlignVertical="top"
                style={styles.notesInput}
              />
            </View>
          </View>

          {/* SUMMARY */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryTitle}>
                  Booking Summary
                </Text>

                <Text style={styles.summarySub}>
                  {selectedServices.length} service
                  {selectedServices.length !== 1
                    ? "s"
                    : ""}{" "}
                  • {totalDuration} min
                </Text>
              </View>

              <View
                style={styles.confirmedBadge}
              >
                <View
                  style={styles.statusDot}
                />

                <Text
                  style={styles.confirmedText}
                >
                  CONFIRMED
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Total
              </Text>

              <Text style={styles.totalAmount}>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </Text>
            </View>
          </View>

          {/* CREATE */}
          <Pressable
            disabled={creating}
            onPress={handleCreateBooking}
            style={({ pressed }) => [
              styles.createButton,
              pressed &&
                !creating &&
                styles.createButtonPressed,
              creating &&
                styles.createButtonDisabled,
            ]}
          >
            <Ionicons
              name={
                creating
                  ? "hourglass-outline"
                  : "checkmark-circle-outline"
              }
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.createButtonText}>
              {creating
                ? "Creating Booking..."
                : "Create Booking"}
            </Text>
          </Pressable>

          <Text style={styles.bottomHint}>
            Booking will be confirmed immediately.
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
    backgroundColor: "#FCF9FA",
  },

  container: {
    flex: 1,
    backgroundColor: "#FCF9FA",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#FCF9FA",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F0E5E8",
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#321923",
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#95868C",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 30,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#40252E",
    marginBottom: 9,
  },

  selectBox: {
    minHeight: 62,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDE2E5",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  roundIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#F8EDF0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  selectedValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#38232B",
  },

  placeholder: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A29499",
  },

  smallText: {
    marginTop: 3,
    fontSize: 11,
    color: "#9B8D92",
  },

  dropdown: {
    marginTop: 7,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDE2E5",
    overflow: "hidden",
  },

  dropdownItem: {
    minHeight: 62,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F4ECEE",
  },

  selectedDropdownItem: {
    backgroundColor: "#FCF4F6",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F1DCE2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#76253A",
  },

  dropdownTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3D2930",
  },

  flex: {
    flex: 1,
  },

  timeGrid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  timeItem: {
    width: "31.7%",
    minHeight: 43,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDE2E5",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedTimeItem: {
    backgroundColor: "#76253A",
    borderColor: "#76253A",
  },

  timeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#65545B",
  },

  selectedTimeText: {
    color: "#FFFFFF",
  },

  serviceItem: {
    minHeight: 67,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F4ECEE",
  },

  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F8EDF0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  servicePrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4A2933",
    marginHorizontal: 9,
  },

  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#D8C9CE",
    alignItems: "center",
    justifyContent: "center",
  },

  checkedBox: {
    backgroundColor: "#76253A",
    borderColor: "#76253A",
  },

  selectedServices: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EDE2E5",
    overflow: "hidden",
  },

  selectedServiceRow: {
    minHeight: 58,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F4ECEE",
  },

  selectedServiceName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#40252E",
  },

  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#F7F0F2",
    alignItems: "center",
    justifyContent: "center",
  },

  notesBox: {
    minHeight: 105,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDE2E5",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  notesInput: {
    flex: 1,
    marginLeft: 10,
    minHeight: 75,
    fontSize: 13,
    color: "#3D2930",
    paddingTop: 0,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDE2E5",
    marginBottom: 15,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3D252D",
  },

  summarySub: {
    marginTop: 4,
    fontSize: 11,
    color: "#96878D",
  },

  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF8F2",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B9B61",
    marginRight: 5,
  },

  confirmedText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#318051",
  },

  divider: {
    height: 1,
    backgroundColor: "#F0E7E9",
    marginVertical: 14,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#76666C",
  },

  totalAmount: {
    fontSize: 23,
    fontWeight: "900",
    color: "#76253A",
  },

  createButton: {
    height: 57,
    borderRadius: 17,
    backgroundColor: "#76253A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#76253A",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },

  createButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  createButtonDisabled: {
    opacity: 0.65,
  },

  createButtonText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  bottomHint: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 10,
    color: "#A29499",
  },

  loadingBox: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDE2E5",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    flexDirection: "row",
  },

  loadingText: {
    marginLeft: 9,
    fontSize: 12,
    fontWeight: "600",
    color: "#8D7B82",
  },

  bottomSpace: {
    height: 35,
  },
});