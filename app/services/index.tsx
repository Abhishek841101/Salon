
import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";

import API_URL from "../../src/config/api";

type Service = {
  _id: string;
  name: string;
  serviceGroup?: string;
  category?: string;
  price: number;
  duration: number;
  description?: string;
  image?: {
    url?: string;
    publicId?: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ServicesResponse = {
  success: boolean;
  services?: Service[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  message?: string;
};

type BulkUploadResponse = {
  success: boolean;
  message?: string;
  totalRows?: number;
  created?: number;
  duplicates?: number;
  failed?: number;
  services?: Service[];
  duplicateRows?: Array<{
    row: number;
    name: string;
    serviceGroup?: string;
    reason?: string;
  }>;
  failedRows?: Array<{
    row: number;
    name?: string;
    serviceGroup?: string;
    reason?: string;
  }>;
};

type RootState = {
  auth?: {
    token?: string | null;
  };
};

const getCategoryIcon = (category?: string) => {
  const value = String(category || "").toLowerCase();

  if (
    value.includes("hair") ||
    value.includes("cut") ||
    value.includes("color")
  ) {
    return "✂";
  }

  if (
    value.includes("skin") ||
    value.includes("facial") ||
    value.includes("face")
  ) {
    return "✧";
  }

  if (
    value.includes("nail") ||
    value.includes("manicure") ||
    value.includes("pedicure")
  ) {
    return "♡";
  }

  if (value.includes("spa") || value.includes("massage")) {
    return "✦";
  }

  if (value.includes("groom") || value.includes("beard")) {
    return "◈";
  }

  return "✦";
};

const formatPrice = (price: number) => {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "₹0";
  }

  return `₹${numericPrice.toLocaleString("en-IN")}`;
};

const formatDuration = (duration: number) => {
  const numericDuration = Number(duration);

  if (!Number.isFinite(numericDuration)) {
    return "30 min";
  }

  if (numericDuration >= 60) {
    const hours = Math.floor(numericDuration / 60);
    const minutes = numericDuration % 60;

    if (minutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${minutes} min`;
  }

  return `${numericDuration} min`;
};

const getGroupName = (service: Service) => {
  const group = String(service.serviceGroup || "").trim();

  return group || "General";
};

export default function ServicesScreen() {
  const token = useSelector(
    (state: RootState) => state.auth?.token
  );

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setError("");

      if (!token) {
        console.log("FETCH SERVICES: TOKEN MISSING");

        setServices([]);
        setError("Authentication token missing");
        return;
      }

      const url =
        `${API_URL}/services` +
        "?status=active&page=1&limit=100";

      console.log("========================================");
      console.log("FETCH SERVICES");
      console.log("URL:", url);
      console.log("TOKEN:", !!token);
      console.log("========================================");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const rawText = await response.text();

      let data: ServicesResponse;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Invalid server response (${response.status})`
        );
      }

      console.log(
        "SERVICES RESPONSE:",
        response.status,
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Failed to fetch services (${response.status})`
        );
      }

      const serverServices = Array.isArray(data.services)
        ? data.services
        : [];

      setServices(serverServices);
      setError("");
    } catch (err: any) {
      console.log(
        "========================================"
      );
      console.log("FETCH SERVICES ERROR:", err);
      console.log(
        "========================================"
      );

      setServices([]);

      setError(
        err?.message ||
          "Unable to connect to server"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [fetchServices])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
  };

  const openAddService = () => {
    router.push("/services/add-service");
  };

  const handleServicePress = (service: Service) => {
    if (!service?._id) {
      Alert.alert(
        "Error",
        "Service ID is missing"
      );
      return;
    }

    router.push({
      pathname: "/services/[id]",
      params: {
        id: service._id,
      },
    });
  };

  const handleEditService = (service: Service) => {
    if (!service?._id) {
      Alert.alert(
        "Error",
        "Service ID is missing"
      );
      return;
    }

    router.push({
      pathname: "/services/edit-service",
      params: {
        id: service._id,
      },
    });
  };

const handleBulkUpload = async () => {
  if (!token) {
    Alert.alert(
      "Authentication Error",
      "Please login again and try."
    );
    return;
  }

  if (uploading) {
    return;
  }

  try {
    console.log("========================================");
    console.log("OPENING SERVICE FILE PICKER");
    console.log("========================================");

    const result = await File.pickFileAsync({
      multipleFiles: false,
      mimeTypes: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "text/comma-separated-values",
      ],
    });

    if (result.canceled) {
      console.log("FILE PICKER CANCELLED");
      return;
    }

    const file = result.result;

    if (!file) {
      Alert.alert(
        "File Error",
        "Unable to select the Excel file."
      );
      return;
    }

    console.log("========================================");
    console.log("SELECTED FILE OBJECT");
    console.log("FILE NAME:", file.name);
    console.log("FILE TYPE:", file.type);
    console.log("FILE SIZE:", file.size);
    console.log("FILE URI:", file.uri);
    console.log("========================================");

    /*
     * Android can sometimes return a file object
     * where the filename does not contain a normal
     * .xlsx / .xls / .csv extension.
     *
     * Therefore we detect the extension from:
     *
     * 1. file.name
     * 2. file.uri
     * 3. file.type
     */

    const uriFileName =
      file.uri
        ?.split("/")
        ?.pop()
        ?.split("?")[0] || "";

    console.log(
      "URI FILE NAME:",
      uriFileName
    );

    const fileName =
      file.name ||
      uriFileName ||
      `services-${Date.now()}.xlsx`;

    console.log(
      "FINAL FILE NAME:",
      fileName
    );

    let extension =
      fileName
        .split(".")
        .pop()
        ?.toLowerCase()
        .trim() || "";

    /*
     * If the filename does not have a valid extension,
     * try detecting it from the URI.
     */

    if (
      !["xlsx", "xls", "csv"].includes(
        extension
      )
    ) {
      const uriExtension =
        uriFileName
          .split(".")
          .pop()
          ?.toLowerCase()
          .trim() || "";

      if (
        ["xlsx", "xls", "csv"].includes(
          uriExtension
        )
      ) {
        extension = uriExtension;
      }
    }

    /*
     * If extension is still not detected,
     * detect it from MIME type.
     */

    if (
      !["xlsx", "xls", "csv"].includes(
        extension
      )
    ) {
      const mimeType =
        String(file.type || "")
          .toLowerCase()
          .trim();

      if (
        mimeType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) ||
        mimeType.includes(
          "spreadsheetml.sheet"
        )
      ) {
        extension = "xlsx";
      } else if (
        mimeType.includes(
          "application/vnd.ms-excel"
        )
      ) {
        extension = "xls";
      } else if (
        mimeType.includes("text/csv") ||
        mimeType.includes(
          "text/comma-separated-values"
        ) ||
        mimeType.includes("csv")
      ) {
        extension = "csv";
      }
    }

    console.log(
      "DETECTED EXTENSION:",
      extension
    );

    /*
     * Final validation.
     *
     * The system picker already filters the file,
     * so this is only a safety check.
     */

    if (
      !["xlsx", "xls", "csv"].includes(
        extension
      )
    ) {
      console.log(
        "INVALID FILE DETAILS:",
        {
          fileName,
          uriFileName,
          fileType: file.type,
          fileUri: file.uri,
          extension,
        }
      );

      Alert.alert(
        "Invalid File",
        "Please select an Excel (.xlsx/.xls) or CSV file."
      );

      return;
    }

    setUploading(true);

    console.log("========================================");
    console.log("BULK SERVICE UPLOAD");
    console.log("FILE:", fileName);
    console.log("EXTENSION:", extension);
    console.log("TYPE:", file.type);
    console.log("SIZE:", file.size);
    console.log("URI:", file.uri);
    console.log(
      "API:",
      `${API_URL}/services/bulk-upload`
    );
    console.log("========================================");

    /*
     * Modern Expo SDK 57 upload flow.
     *
     * File.pickFileAsync() gives us a real Expo File.
     *
     * We append that actual File object to FormData.
     *
     * We do NOT use:
     *
     * DocumentPicker.getDocumentAsync()
     *
     * We do NOT use:
     *
     * FileSystem.uploadAsync()
     *
     * We do NOT create:
     *
     * {
     *   uri: file.uri,
     *   name: fileName,
     *   type: file.type
     * }
     */

    const formData = new FormData();

    formData.append(
      "file",
      file as any
    );

    console.log(
      "FORM DATA CREATED SUCCESSFULLY"
    );

    console.log(
      "STARTING BULK SERVICE UPLOAD..."
    );

    const response = await expoFetch(
      `${API_URL}/services/bulk-upload`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },

        body: formData,
      }
    );

    console.log(
      "BULK UPLOAD HTTP STATUS:",
      response.status
    );

    const rawText =
      await response.text();

    console.log(
      "BULK UPLOAD RAW RESPONSE:",
      rawText
    );

    let data: BulkUploadResponse;

    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(
        `Invalid server response (${response.status})`
      );
    }

    console.log(
      "BULK UPLOAD RESPONSE:",
      response.status,
      data
    );

    if (
      response.status < 200 ||
      response.status >= 300 ||
      !data.success
    ) {
      throw new Error(
        data.message ||
          `Upload failed (${response.status})`
      );
    }

    const created =
      Number(data.created || 0);

    const duplicates =
      Number(data.duplicates || 0);

    const failed =
      Number(data.failed || 0);

    const totalRows =
      Number(data.totalRows || 0);

    let message =
      `Total rows: ${totalRows}\n\n` +
      `Created: ${created}\n` +
      `Duplicates: ${duplicates}\n` +
      `Failed: ${failed}`;

    if (
      Array.isArray(data.duplicateRows) &&
      data.duplicateRows.length > 0
    ) {
      const duplicatePreview =
        data.duplicateRows
          .slice(0, 5)
          .map(
            (item) =>
              `Row ${item.row}: ${
                item.name || "Unknown"
              } - ${
                item.reason || "Duplicate"
              }`
          )
          .join("\n");

      message +=
        `\n\nDuplicate rows:\n${duplicatePreview}`;

      if (
        data.duplicateRows.length > 5
      ) {
        message +=
          `\n...and ${
            data.duplicateRows.length - 5
          } more`;
      }
    }

    if (
      Array.isArray(data.failedRows) &&
      data.failedRows.length > 0
    ) {
      const failedPreview =
        data.failedRows
          .slice(0, 5)
          .map(
            (item) =>
              `Row ${item.row}: ${
                item.name || "Unknown"
              } - ${
                item.reason || "Invalid data"
              }`
          )
          .join("\n");

      message +=
        `\n\nFailed rows:\n${failedPreview}`;

      if (
        data.failedRows.length > 5
      ) {
        message +=
          `\n...and ${
            data.failedRows.length - 5
          } more`;
      }
    }

    Alert.alert(
      "Service Import Completed",
      message,
      [
        {
          text: "OK",
          onPress: () => {
            fetchServices();
          },
        },
      ]
    );

    await fetchServices();
  } catch (err: any) {
    console.log(
      "========================================"
    );

    console.log(
      "BULK UPLOAD ERROR:",
      err
    );

    console.log(
      "BULK UPLOAD ERROR MESSAGE:",
      err?.message
    );

    console.log(
      "========================================"
    );

    Alert.alert(
      "Upload Failed",
      err?.message ||
        "Unable to upload services file."
    );
  } finally {
    setUploading(false);
  }
};
  const groupedServices = useMemo(() => {
    const groups: Record<
      string,
      Service[]
    > = {};

    services.forEach((service) => {
      const groupName =
        getGroupName(service);

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(service);
    });

    return Object.entries(groups).map(
      ([groupName, groupServices]) => ({
        groupName,
        groupServices,
      })
    );
  }, [services]);

  const renderService = ({
    item,
  }: {
    item: Service;
  }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.serviceCard,
          pressed &&
            styles.serviceCardPressed,
        ]}
        onPress={() =>
          handleServicePress(item)
        }
      >
        <View style={styles.serviceIconBox}>
          <Text style={styles.serviceIcon}>
            {getCategoryIcon(
              item.category
            )}
          </Text>
        </View>

        <View style={styles.serviceInfo}>
          <Text
            style={styles.serviceName}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text
            style={styles.serviceCategory}
            numberOfLines={1}
          >
            {item.category ||
              "General"}
          </Text>

          <View style={styles.metaRow}>
            <Text
              style={styles.durationIcon}
            >
              ◷
            </Text>

            <Text
              style={styles.durationText}
            >
              {formatDuration(
                item.duration
              )}
            </Text>

            {item.isActive && (
              <View
                style={
                  styles.activeBadge
                }
              >
                <View
                  style={
                    styles.activeDot
                  }
                />

                <Text
                  style={
                    styles.activeText
                  }
                >
                  Active
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={styles.priceContainer}
        >
          <Text style={styles.price}>
            {formatPrice(item.price)}
          </Text>

          <Pressable
            style={styles.editButton}
            onPress={(event) => {
              event.stopPropagation();
              handleEditService(item);
            }}
          >
            <Text
              style={
                styles.editButtonText
              }
            >
              Edit
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const renderGroup = ({
    groupName,
    groupServices,
  }: {
    groupName: string;
    groupServices: Service[];
  }) => {
    return (
      <View
        key={groupName}
        style={styles.groupContainer}
      >
        <View style={styles.groupHeader}>
          <View
            style={styles.groupHeaderLeft}
          >
            <View
              style={styles.groupIconBox}
            >
              <Text
                style={styles.groupIcon}
              >
                ✦
              </Text>
            </View>

            <View
              style={styles.groupTitleBox}
            >
              <Text
                style={styles.groupTitle}
                numberOfLines={1}
              >
                {groupName}
              </Text>

              <Text
                style={styles.groupSubtitle}
              >
                {groupServices.length}{" "}
                {groupServices.length === 1
                  ? "service"
                  : "services"}
              </Text>
            </View>
          </View>

          <View
            style={styles.groupCountBadge}
          >
            <Text
              style={
                styles.groupCountText
              }
            >
              {groupServices.length}
            </Text>
          </View>
        </View>

        {groupServices.map(
          (service) => (
            <View
              key={service._id}
            >
              {renderService({
                item: service,
              })}
            </View>
          )
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator
            size="large"
            color="#70243A"
          />

          <Text
            style={styles.loadingText}
          >
            Loading services...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyCard}>
          <View
            style={styles.emptyIconBox}
          >
            <Text
              style={styles.emptyIcon}
            >
              !
            </Text>
          </View>

          <Text
            style={styles.emptyTitle}
          >
            Unable to load services
          </Text>

          <Text
            style={styles.emptySubtitle}
          >
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={fetchServices}
          >
            <Text
              style={styles.retryText}
            >
              Try Again
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.emptyCard}>
        <View
          style={styles.emptyIconBox}
        >
          <Text
            style={styles.emptyIcon}
          >
            ✦
          </Text>
        </View>

        <Text
          style={styles.emptyTitle}
        >
          No services yet
        </Text>

        <Text
          style={styles.emptySubtitle}
        >
          Add your first salon service
          {"\n"}
          or import your complete
          {"\n"}
          service menu from Excel.
        </Text>

        <View
          style={styles.emptyActions}
        >
          <Pressable
            style={styles.retryButton}
            onPress={openAddService}
          >
            <Text
              style={styles.retryText}
            >
              Add Service
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={handleBulkUpload}
          >
            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Import Excel
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.eyebrow}>
              SALON MANAGEMENT
            </Text>

            <Text style={styles.title}>
              Services
            </Text>

            <Text
              style={styles.subtitle}
            >
              Manage your salon services
            </Text>
          </View>

          <View
            style={styles.headerActions}
          >
            <Pressable
              style={[
                styles.importButton,
                uploading &&
                  styles.disabledButton,
              ]}
              onPress={handleBulkUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator
                  size="small"
                  color="#70243A"
                />
              ) : (
                <Text
                  style={
                    styles.importIcon
                  }
                >
                  ⇧
                </Text>
              )}

              <Text
                style={styles.importText}
              >
                {uploading
                  ? "Importing"
                  : "Import"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.addButton}
              onPress={openAddService}
            >
              <Text
                style={styles.addIcon}
              >
                +
              </Text>

              <Text
                style={styles.addText}
              >
                Add
              </Text>
            </Pressable>
          </View>
        </View>

        <FlatList
          data={groupedServices}
          keyExtractor={(item) =>
            `group-${item.groupName}`
          }
          renderItem={({ item }) =>
            renderGroup(item)
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#70243A"
            />
          }
          contentContainerStyle={[
            styles.content,
            services.length === 0 &&
              styles.emptyListContent,
          ]}
          ListHeaderComponent={
            services.length > 0 ? (
              <>
                <View
                  style={styles.summaryCard}
                >
                  <View
                    style={
                      styles.summaryIconBox
                    }
                  >
                    <Text
                      style={
                        styles.summaryIcon
                      }
                    >
                      ✦
                    </Text>
                  </View>

                  <View
                    style={styles.summaryInfo}
                  >
                    <Text
                      style={
                        styles.summaryNumber
                      }
                    >
                      {services.length}
                    </Text>

                    <Text
                      style={
                        styles.summaryLabel
                      }
                    >
                      ACTIVE SERVICES
                    </Text>
                  </View>

                  <View
                    style={
                      styles.summaryDivider
                    }
                  />

                  <View
                    style={styles.summaryInfo}
                  >
                    <Text
                      style={
                        styles.summaryNumber
                      }
                    >
                      {groupedServices.length}
                    </Text>

                    <Text
                      style={
                        styles.summaryLabel
                      }
                    >
                      SERVICE GROUPS
                    </Text>
                  </View>
                </View>

                <View
                  style={styles.sectionHeader}
                >
                  <View>
                    <Text
                      style={
                        styles.sectionTitle
                      }
                    >
                      Your Services
                    </Text>

                    <Text
                      style={
                        styles.sectionSubtitle
                      }
                    >
                      Services organized by
                      service group
                    </Text>
                  </View>

                  <View
                    style={styles.countBadge}
                  >
                    <Text
                      style={
                        styles.countText
                      }
                    >
                      {services.length}
                    </Text>
                  </View>
                </View>
              </>
            ) : null
          }
          ListEmptyComponent={
            renderEmpty
          }
          ListFooterComponent={
            <View
              style={styles.bottomSpace}
            />
          }
        />

        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/")
            }
          >
            <View
              style={styles.navIconBox}
            >
              <Text
                style={styles.navIcon}
              >
                ⌂
              </Text>
            </View>

            <Text
              style={styles.navText}
            >
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/clients")
            }
          >
            <View
              style={styles.navIconBox}
            >
              <Text
                style={styles.navIcon}
              >
                ♙
              </Text>
            </View>

            <Text
              style={styles.navText}
            >
              Clients
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/billing")
            }
          >
            <View
              style={styles.navIconBox}
            >
              <Text
                style={styles.navIcon}
              >
                ▣
              </Text>
            </View>

            <Text
              style={styles.navText}
            >
              Billing
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/services")
            }
          >
            <View
              style={[
                styles.navIconBox,
                styles.navIconBoxActive,
              ]}
            >
              <Text
                style={styles.navIconActive}
              >
                ✦
              </Text>
            </View>

            <Text
              style={styles.navActive}
            >
              Services
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/profile")
            }
          >
            <View
              style={styles.navIconBox}
            >
              <Text
                style={styles.navIcon}
              >
                ♙
              </Text>
            </View>

            <Text
              style={styles.navText}
            >
              Profile
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF7F4",
  },

  safeArea: {
    flex: 1,
  },

  header: {
    minHeight: 94,
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0E5E2",
  },

  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },

  eyebrow: {
    color: "#A09195",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  title: {
    color: "#602032",
    fontSize: 26,
    fontWeight: "600",
    fontFamily: "serif",
    marginTop: 2,
  },

  subtitle: {
    color: "#9B8E91",
    fontSize: 9,
    marginTop: 2,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  importButton: {
    height: 43,
    minWidth: 82,
    paddingHorizontal: 11,
    borderRadius: 14,
    backgroundColor: "#F2E3E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  importIcon: {
    color: "#70243A",
    fontSize: 17,
    fontWeight: "800",
  },

  importText: {
    color: "#70243A",
    fontSize: 9,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.65,
  },

  addButton: {
    height: 43,
    minWidth: 68,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#70243A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  addIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 20,
  },

  addText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  content: {
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 15,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  summaryCard: {
    minHeight: 94,
    borderRadius: 22,
    padding: 16,
    backgroundColor: "#70243A",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 21,
  },

  summaryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F0D9D7",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryIcon: {
    color: "#76253A",
    fontSize: 21,
  },

  summaryInfo: {
    flex: 1,
    paddingLeft: 12,
  },

  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  summaryLabel: {
    color: "#EBD4D5",
    fontSize: 8,
    marginTop: 2,
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#A66575",
    marginHorizontal: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },

  sectionTitle: {
    color: "#33292C",
    fontSize: 20,
    fontFamily: "serif",
    fontWeight: "600",
  },

  sectionSubtitle: {
    color: "#9B8E91",
    fontSize: 8,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 29,
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: "#F2E3E0",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: "#76253A",
    fontSize: 8,
    fontWeight: "800",
  },

  groupContainer: {
    marginBottom: 15,
  },

  groupHeader: {
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 17,
    backgroundColor: "#F2E3E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  groupHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  groupIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  groupIcon: {
    color: "#76253A",
    fontSize: 16,
  },

  groupTitleBox: {
    flex: 1,
    paddingLeft: 10,
    minWidth: 0,
  },

  groupTitle: {
    color: "#602032",
    fontSize: 12,
    fontWeight: "900",
  },

  groupSubtitle: {
    color: "#9A8C90",
    fontSize: 8,
    marginTop: 2,
  },

  groupCountBadge: {
    minWidth: 27,
    height: 25,
    paddingHorizontal: 7,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  groupCountText: {
    color: "#76253A",
    fontSize: 8,
    fontWeight: "900",
  },

  serviceCard: {
    minHeight: 91,
    borderRadius: 19,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0E5E2",
    flexDirection: "row",
    alignItems: "center",
  },

  serviceCardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  serviceIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
  },

  serviceIcon: {
    color: "#76253A",
    fontSize: 22,
  },

  serviceInfo: {
    flex: 1,
    paddingLeft: 12,
    minWidth: 0,
  },

  serviceName: {
    color: "#342A2D",
    fontSize: 12,
    fontWeight: "800",
  },

  serviceCategory: {
    color: "#9A8C90",
    fontSize: 8,
    marginTop: 3,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  durationIcon: {
    color: "#9C8E91",
    fontSize: 10,
  },

  durationText: {
    color: "#8E8084",
    fontSize: 8,
    marginLeft: 3,
  },

  activeBadge: {
    marginLeft: 9,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#F2F8F2",
    flexDirection: "row",
    alignItems: "center",
  },

  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#5B9A67",
    marginRight: 4,
  },

  activeText: {
    color: "#5C8864",
    fontSize: 7,
    fontWeight: "800",
  },

  priceContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingLeft: 5,
  },

  price: {
    color: "#70243A",
    fontSize: 12,
    fontWeight: "900",
  },

  editButton: {
    marginTop: 7,
    paddingHorizontal: 10,
    height: 27,
    borderRadius: 9,
    backgroundColor: "#F2E3E0",
    alignItems: "center",
    justifyContent: "center",
  },

  editButtonText: {
    color: "#76253A",
    fontSize: 8,
    fontWeight: "800",
  },

  centerBox: {
    flex: 1,
    minHeight: 250,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#8E8084",
    fontSize: 10,
    marginTop: 10,
  },

  emptyCard: {
    minHeight: 280,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0E5E2",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  emptyIconBox: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyIcon: {
    color: "#76253A",
    fontSize: 25,
    fontWeight: "800",
  },

  emptyTitle: {
    color: "#342A2D",
    fontSize: 16,
    fontWeight: "800",
  },

  emptySubtitle: {
    color: "#9A8C90",
    fontSize: 10,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 16,
  },

  emptyActions: {
    alignItems: "center",
    marginTop: 3,
  },

  retryButton: {
    marginTop: 17,
    minWidth: 110,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#70243A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  secondaryButton: {
    marginTop: 9,
    minWidth: 110,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F2E3E0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  secondaryButtonText: {
    color: "#76253A",
    fontSize: 10,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 90,
  },

  bottomNav: {
    position: "absolute",
    left: 15,
    right: 15,
    bottom: 10,
    height: 68,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#32141E",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconBoxActive: {
    backgroundColor: "#76253A",
  },

  navIcon: {
    color: "#9D9193",
    fontSize: 17,
    fontWeight: "700",
  },

  navIconActive: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  navText: {
    color: "#9D9193",
    fontSize: 8,
    marginTop: 3,
  },

  navActive: {
    color: "#76253A",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 3,
  },
});
