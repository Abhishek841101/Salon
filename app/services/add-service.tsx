// import React, { useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from "react-native";
// import { router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useSelector } from "react-redux";

// import API_URL from "../../src/config/api";

// type RootState = {
//   auth?: {
//     token?: string | null;
//   };
// };

// export default function AddServiceScreen() {
//   const token = useSelector(
//     (state: RootState) => state.auth?.token
//   );

//   const [name, setName] = useState("");
//   const [category, setCategory] = useState("");
//   const [price, setPrice] = useState("");
//   const [duration, setDuration] = useState("30");
//   const [description, setDescription] = useState("");

//   const [loading, setLoading] = useState(false);

//   const handleAddService = async () => {
//     const cleanName = name.trim();
//     const cleanCategory = category.trim();
//     const cleanPrice = price.trim();
//     const cleanDuration = duration.trim();
//     const cleanDescription = description.trim();

//     if (!token) {
//       Alert.alert(
//         "Authentication Error",
//         "Please login again."
//       );
//       return;
//     }

//     if (!cleanName) {
//       Alert.alert(
//         "Required",
//         "Please enter service name."
//       );
//       return;
//     }

//     if (!cleanPrice) {
//       Alert.alert(
//         "Required",
//         "Please enter service price."
//       );
//       return;
//     }

//     const numericPrice = Number(cleanPrice);

//     if (
//       !Number.isFinite(numericPrice) ||
//       numericPrice < 0
//     ) {
//       Alert.alert(
//         "Invalid Price",
//         "Please enter a valid service price."
//       );
//       return;
//     }

//     const numericDuration =
//       cleanDuration === ""
//         ? 30
//         : Number(cleanDuration);

//     if (
//       !Number.isFinite(numericDuration) ||
//       numericDuration < 1
//     ) {
//       Alert.alert(
//         "Invalid Duration",
//         "Duration must be at least 1 minute."
//       );
//       return;
//     }

//     try {
//       setLoading(true);

//       console.log(
//         "========================================"
//       );
//       console.log("CREATE SERVICE");
//       console.log("NAME:", cleanName);
//       console.log("CATEGORY:", cleanCategory);
//       console.log("PRICE:", numericPrice);
//       console.log("DURATION:", numericDuration);
//       console.log("TOKEN:", !!token);
//       console.log(
//         "========================================"
//       );

//       const response = await fetch(
//         `${API_URL}/services`,
//         {
//           method: "POST",

//           headers: {
//             Authorization: `Bearer ${token}`,
//             Accept: "application/json",
//             "Content-Type": "application/json",
//           },

//           body: JSON.stringify({
//             name: cleanName,
//             category: cleanCategory,
//             price: numericPrice,
//             duration: numericDuration,
//             description: cleanDescription,
//           }),
//         }
//       );

//       const rawText = await response.text();

//       let data: any;

//       try {
//         data = JSON.parse(rawText);
//       } catch {
//         throw new Error(
//           `Invalid server response (${response.status})`
//         );
//       }

//       console.log(
//         "CREATE SERVICE RESPONSE:",
//         response.status,
//         data
//       );

//       if (!response.ok || !data.success) {
//         throw new Error(
//           data.message ||
//             "Failed to create service"
//         );
//       }

//       Alert.alert(
//         "Success",
//         "Service added successfully.",
//         [
//           {
//             text: "OK",
//             onPress: () => {
//               router.replace("/services");
//             },
//           },
//         ]
//       );
//     } catch (error: any) {
//       console.log(
//         "CREATE SERVICE ERROR:",
//         error
//       );

//       Alert.alert(
//         "Error",
//         error?.message ||
//           "Unable to create service."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar style="dark" />

//       <SafeAreaView
//         style={styles.safeArea}
//         edges={["top", "bottom"]}
//       >
//         <KeyboardAvoidingView
//           style={styles.flex}
//           behavior={
//             Platform.OS === "ios"
//               ? "padding"
//               : undefined
//           }
//         >
//           {/* HEADER */}

//           <View style={styles.header}>
//             <Pressable
//               style={styles.backButton}
//               onPress={() => router.back()}
//               disabled={loading}
//             >
//               <Text style={styles.backIcon}>
//                 ‹
//               </Text>
//             </Pressable>

//             <View style={styles.headerText}>
//               <Text style={styles.eyebrow}>
//                 SERVICE MANAGEMENT
//               </Text>

//               <Text style={styles.title}>
//                 Add Service
//               </Text>

//               <Text style={styles.subtitle}>
//                 Create a new salon service
//               </Text>
//             </View>

//             <View style={styles.headerSpacer} />
//           </View>

//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//             contentContainerStyle={
//               styles.content
//             }
//           >
//             {/* SERVICE NAME */}

//             <View style={styles.field}>
//               <Text style={styles.label}>
//                 SERVICE NAME
//                 <Text style={styles.required}>
//                   {" "}*
//                 </Text>
//               </Text>

//               <TextInput
//                 value={name}
//                 onChangeText={setName}
//                 placeholder="e.g. Hair Cut"
//                 placeholderTextColor="#B5A8AB"
//                 style={styles.input}
//                 editable={!loading}
//                 autoCapitalize="words"
//                 returnKeyType="next"
//               />
//             </View>

//             {/* CATEGORY */}

//             <View style={styles.field}>
//               <Text style={styles.label}>
//                 CATEGORY
//               </Text>

//               <TextInput
//                 value={category}
//                 onChangeText={setCategory}
//                 placeholder="e.g. Hair, Facial, Spa"
//                 placeholderTextColor="#B5A8AB"
//                 style={styles.input}
//                 editable={!loading}
//                 autoCapitalize="words"
//                 returnKeyType="next"
//               />
//             </View>

//             {/* PRICE + DURATION */}

//             <View style={styles.row}>
//               <View
//                 style={[
//                   styles.field,
//                   styles.halfField,
//                 ]}
//               >
//                 <Text style={styles.label}>
//                   PRICE
//                   <Text style={styles.required}>
//                     {" "}*
//                   </Text>
//                 </Text>

//                 <View style={styles.inputWithIcon}>
//                   <Text style={styles.rupee}>
//                     ₹
//                   </Text>

//                   <TextInput
//                     value={price}
//                     onChangeText={(text) =>
//                       setPrice(
//                         text.replace(
//                           /[^0-9.]/g,
//                           ""
//                         )
//                       )
//                     }
//                     placeholder="500"
//                     placeholderTextColor="#B5A8AB"
//                     style={
//                       styles.inputInside
//                     }
//                     editable={!loading}
//                     keyboardType="decimal-pad"
//                   />
//                 </View>
//               </View>

//               <View
//                 style={[
//                   styles.field,
//                   styles.halfField,
//                 ]}
//               >
//                 <Text style={styles.label}>
//                   DURATION
//                 </Text>

//                 <View style={styles.inputWithIcon}>
//                   <TextInput
//                     value={duration}
//                     onChangeText={(text) =>
//                       setDuration(
//                         text.replace(
//                           /[^0-9]/g,
//                           ""
//                         )
//                       )
//                     }
//                     placeholder="30"
//                     placeholderTextColor="#B5A8AB"
//                     style={
//                       styles.inputInside
//                     }
//                     editable={!loading}
//                     keyboardType="number-pad"
//                   />

//                   <Text style={styles.unit}>
//                     min
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             {/* DESCRIPTION */}

//             <View style={styles.field}>
//               <Text style={styles.label}>
//                 DESCRIPTION
//               </Text>

//               <TextInput
//                 value={description}
//                 onChangeText={setDescription}
//                 placeholder="Describe this service..."
//                 placeholderTextColor="#B5A8AB"
//                 style={[
//                   styles.input,
//                   styles.textArea,
//                 ]}
//                 editable={!loading}
//                 multiline
//                 textAlignVertical="top"
//                 maxLength={500}
//               />

//               <Text style={styles.characterCount}>
//                 {description.length}/500
//               </Text>
//             </View>

//             {/* PREVIEW */}

//             <View style={styles.previewCard}>
//               <View style={styles.previewIcon}>
//                 <Text style={styles.previewIconText}>
//                   ✦
//                 </Text>
//               </View>

//               <View style={styles.previewInfo}>
//                 <Text style={styles.previewTitle}>
//                   {name.trim() ||
//                     "Service Name"}
//                 </Text>

//                 <Text style={styles.previewCategory}>
//                   {category.trim() ||
//                     "General"}
//                 </Text>

//                 <Text style={styles.previewDuration}>
//                   ◷{" "}
//                   {duration || "30"} min
//                 </Text>
//               </View>

//               <Text style={styles.previewPrice}>
//                 ₹{price || "0"}
//               </Text>
//             </View>

//             {/* ADD BUTTON */}

//             <Pressable
//               style={({ pressed }) => [
//                 styles.submitButton,
//                 pressed &&
//                   styles.submitButtonPressed,
//                 loading &&
//                   styles.submitButtonDisabled,
//               ]}
//               onPress={handleAddService}
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <ActivityIndicator
//                     size="small"
//                     color="#FFFFFF"
//                   />

//                   <Text
//                     style={
//                       styles.submitButtonText
//                     }
//                   >
//                     Adding...
//                   </Text>
//                 </>
//               ) : (
//                 <>
//                   <Text
//                     style={styles.submitIcon}
//                   >
//                     +
//                   </Text>

//                   <Text
//                     style={
//                       styles.submitButtonText
//                     }
//                   >
//                     Add Service
//                   </Text>
//                 </>
//               )}
//             </Pressable>

//             <Pressable
//               style={styles.cancelButton}
//               onPress={() => router.back()}
//               disabled={loading}
//             >
//               <Text style={styles.cancelText}>
//                 Cancel
//               </Text>
//             </Pressable>

//             <View style={styles.bottomSpace} />
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FCF7F4",
//   },

//   safeArea: {
//     flex: 1,
//   },

//   flex: {
//     flex: 1,
//   },

//   header: {
//     minHeight: 91,
//     paddingHorizontal: 17,
//     paddingTop: 10,
//     paddingBottom: 13,
//     flexDirection: "row",
//     alignItems: "center",
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0E5E2",
//   },

//   backButton: {
//     width: 43,
//     height: 43,
//     borderRadius: 14,
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#F0E5E2",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   backIcon: {
//     color: "#70243A",
//     fontSize: 32,
//     fontWeight: "300",
//     lineHeight: 34,
//     marginTop: -3,
//   },

//   headerText: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   eyebrow: {
//     color: "#A09195",
//     fontSize: 7,
//     fontWeight: "800",
//     letterSpacing: 1.4,
//   },

//   title: {
//     color: "#602032",
//     fontSize: 24,
//     fontWeight: "600",
//     fontFamily: "serif",
//     marginTop: 2,
//   },

//   subtitle: {
//     color: "#9B8E91",
//     fontSize: 9,
//     marginTop: 2,
//   },

//   headerSpacer: {
//     width: 43,
//   },

//   content: {
//     paddingHorizontal: 17,
//     paddingTop: 21,
//   },

//   field: {
//     marginBottom: 17,
//   },

//   row: {
//     flexDirection: "row",
//     gap: 11,
//   },

//   halfField: {
//     flex: 1,
//   },

//   label: {
//     color: "#6F6266",
//     fontSize: 8,
//     fontWeight: "900",
//     letterSpacing: 0.8,
//     marginBottom: 7,
//   },

//   required: {
//     color: "#A93650",
//   },

//   input: {
//     minHeight: 50,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#E9DDDA",
//     backgroundColor: "#FFFFFF",
//     paddingHorizontal: 14,
//     color: "#342A2D",
//     fontSize: 12,
//   },

//   inputWithIcon: {
//     minHeight: 50,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#E9DDDA",
//     backgroundColor: "#FFFFFF",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 13,
//   },

//   rupee: {
//     color: "#70243A",
//     fontSize: 15,
//     fontWeight: "800",
//     marginRight: 7,
//   },

//   inputInside: {
//     flex: 1,
//     minHeight: 48,
//     padding: 0,
//     color: "#342A2D",
//     fontSize: 12,
//   },

//   unit: {
//     color: "#8F8185",
//     fontSize: 9,
//     fontWeight: "700",
//   },

//   textArea: {
//     minHeight: 105,
//     paddingTop: 13,
//     paddingBottom: 13,
//   },

//   characterCount: {
//     color: "#AA9C9F",
//     fontSize: 8,
//     textAlign: "right",
//     marginTop: 4,
//   },

//   previewCard: {
//     minHeight: 88,
//     borderRadius: 18,
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#F0E5E2",
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 2,
//     marginBottom: 18,
//   },

//   previewIcon: {
//     width: 52,
//     height: 52,
//     borderRadius: 17,
//     backgroundColor: "#F8E9E6",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   previewIconText: {
//     color: "#76253A",
//     fontSize: 21,
//   },

//   previewInfo: {
//     flex: 1,
//     paddingLeft: 11,
//   },

//   previewTitle: {
//     color: "#342A2D",
//     fontSize: 11,
//     fontWeight: "800",
//   },

//   previewCategory: {
//     color: "#9A8C90",
//     fontSize: 8,
//     marginTop: 3,
//   },

//   previewDuration: {
//     color: "#8E8084",
//     fontSize: 8,
//     marginTop: 5,
//   },

//   previewPrice: {
//     color: "#70243A",
//     fontSize: 13,
//     fontWeight: "900",
//   },

//   submitButton: {
//     height: 53,
//     borderRadius: 16,
//     backgroundColor: "#70243A",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 7,
//   },

//   submitButtonPressed: {
//     opacity: 0.8,
//     transform: [{ scale: 0.99 }],
//   },

//   submitButtonDisabled: {
//     opacity: 0.65,
//   },

//   submitIcon: {
//     color: "#FFFFFF",
//     fontSize: 21,
//     lineHeight: 21,
//   },

//   submitButtonText: {
//     color: "#FFFFFF",
//     fontSize: 11,
//     fontWeight: "900",
//   },

//   cancelButton: {
//     height: 48,
//     borderRadius: 15,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 9,
//   },

//   cancelText: {
//     color: "#8C7E82",
//     fontSize: 10,
//     fontWeight: "700",
//   },

//   bottomSpace: {
//     height: 35,
//   },
// });






import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

import API_URL from "../../src/config/api";

type RootState = {
  auth?: {
    token?: string | null;
  };
};

type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

export default function AddServiceScreen() {
  const token = useSelector(
    (state: RootState) => state.auth?.token
  );

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("30");
  const [description, setDescription] = useState("");

  const [serviceImage, setServiceImage] =
    useState<SelectedImage | null>(null);

  const [loading, setLoading] = useState(false);

  // ========================================
  // PICK SERVICE IMAGE
  // ========================================

  const pickServiceImage = async () => {
    try {
      if (loading) return;

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo library permission to select a service image."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.85,
        });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert(
          "Image Error",
          "Unable to select image."
        );
        return;
      }

      const image: SelectedImage = {
        uri: asset.uri,
        name:
          asset.fileName ||
          `service-${Date.now()}.jpg`,
        type:
          asset.mimeType ||
          "image/jpeg",
      };

      console.log(
        "========================================"
      );
      console.log("SELECTED SERVICE IMAGE");
      console.log("URI:", image.uri);
      console.log("NAME:", image.name);
      console.log("TYPE:", image.type);
      console.log(
        "========================================"
      );

      setServiceImage(image);
    } catch (error) {
      console.log(
        "PICK SERVICE IMAGE ERROR:",
        error
      );

      Alert.alert(
        "Image Error",
        "Unable to select image."
      );
    }
  };

  // ========================================
  // REMOVE IMAGE
  // ========================================

  const removeServiceImage = () => {
    if (loading) return;

    setServiceImage(null);
  };

  // ========================================
  // ADD SERVICE
  // ========================================

  const handleAddService = async () => {
    const cleanName = name.trim();
    const cleanCategory = category.trim();
    const cleanPrice = price.trim();
    const cleanDuration = duration.trim();
    const cleanDescription =
      description.trim();

    if (!token) {
      Alert.alert(
        "Authentication Error",
        "Please login again."
      );
      return;
    }

    if (!cleanName) {
      Alert.alert(
        "Required",
        "Please enter service name."
      );
      return;
    }

    if (!cleanPrice) {
      Alert.alert(
        "Required",
        "Please enter service price."
      );
      return;
    }

    const numericPrice = Number(cleanPrice);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      Alert.alert(
        "Invalid Price",
        "Please enter a valid service price."
      );
      return;
    }

    const numericDuration =
      cleanDuration === ""
        ? 30
        : Number(cleanDuration);

    if (
      !Number.isFinite(numericDuration) ||
      numericDuration < 1
    ) {
      Alert.alert(
        "Invalid Duration",
        "Duration must be at least 1 minute."
      );
      return;
    }

    try {
      setLoading(true);

      console.log(
        "========================================"
      );
      console.log("CREATING SERVICE...");
      console.log("NAME:", cleanName);
      console.log("CATEGORY:", cleanCategory);
      console.log("PRICE:", numericPrice);
      console.log("DURATION:", numericDuration);
      console.log("DESCRIPTION:", cleanDescription);
      console.log("IMAGE:", !!serviceImage);
      console.log("TOKEN:", !!token);
      console.log(
        "========================================"
      );

      // ========================================
      // WITHOUT IMAGE
      // ========================================

      if (!serviceImage?.uri) {
        console.log(
          "CREATING SERVICE WITHOUT IMAGE..."
        );

        const response = await fetch(
          `${API_URL}/services`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name: cleanName,
              category: cleanCategory,
              price: numericPrice,
              duration: numericDuration,
              description: cleanDescription,
            }),
          }
        );

        const rawText =
          await response.text();

        let data: any;

        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error(
            `Invalid server response (${response.status})`
          );
        }

        console.log(
          "CREATE SERVICE RESPONSE:",
          response.status,
          data
        );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to create service"
          );
        }

        Alert.alert(
          "Success",
          "Service added successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/services");
              },
            },
          ]
        );

        return;
      }

      // ========================================
      // WITH IMAGE
      // ========================================

      console.log(
        "========================================"
      );
      console.log(
        "UPLOADING SERVICE WITH IMAGE..."
      );
      console.log(
        "IMAGE URI:",
        serviceImage.uri
      );
      console.log(
        "IMAGE NAME:",
        serviceImage.name
      );
      console.log(
        "IMAGE TYPE:",
        serviceImage.type
      );
      console.log(
        "========================================"
      );

      /*
       * IMPORTANT:
       *
       * We intentionally use expo-file-system/legacy
       * here instead of FormData + Blob.
       *
       * This avoids:
       * Unsupported FormDataPart implementation
       */

      const uploadResult =
        await FileSystem.uploadAsync(
          `${API_URL}/services`,
          serviceImage.uri,
          {
            httpMethod: "POST",

            uploadType:
              FileSystem.FileSystemUploadType
                .MULTIPART,

            // IMPORTANT:
            // Backend multer field name should be "image"
            fieldName: "image",

            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },

            parameters: {
              name: cleanName,
              category: cleanCategory,
              price: String(numericPrice),
              duration: String(
                numericDuration
              ),
              description: cleanDescription,
            },
          }
        );

      console.log(
        "========================================"
      );
      console.log(
        "SERVICE UPLOAD RESPONSE"
      );
      console.log(
        "STATUS:",
        uploadResult.status
      );
      console.log(
        "BODY:",
        uploadResult.body
      );
      console.log(
        "========================================"
      );

      let data: any;

      try {
        data = JSON.parse(
          uploadResult.body
        );
      } catch {
        throw new Error(
          `Invalid server response (${uploadResult.status})`
        );
      }

      if (
        uploadResult.status < 200 ||
        uploadResult.status >= 300 ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to create service"
        );
      }

      Alert.alert(
        "Success",
        "Service added successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/services");
            },
          },
        ]
      );
    } catch (error: any) {
      console.log(
        "========================================"
      );
      console.log(
        "CREATE SERVICE ERROR"
      );
      console.log(error);
      console.log(
        "========================================"
      );

      Alert.alert(
        "Error",
        error?.message ||
          "Unable to create service."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.backIcon}>
                ‹
              </Text>
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                SERVICE MANAGEMENT
              </Text>

              <Text style={styles.title}>
                Add Service
              </Text>

              <Text style={styles.subtitle}>
                Create a new salon service
              </Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.content
            }
          >
            {/* ================================= */}
            {/* SERVICE IMAGE */}
            {/* ================================= */}

            <View style={styles.field}>
              <Text style={styles.label}>
                SERVICE IMAGE
              </Text>

              {serviceImage ? (
                <View style={styles.imageCard}>
                  <Image
                    source={{
                      uri: serviceImage.uri,
                    }}
                    style={styles.serviceImage}
                  />

                  <View
                    style={styles.imageOverlay}
                  >
                    <Pressable
                      style={styles.changeImageButton}
                      onPress={pickServiceImage}
                      disabled={loading}
                    >
                      <Text
                        style={
                          styles.changeImageText
                        }
                      >
                        Change
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.removeImageButton}
                      onPress={
                        removeServiceImage
                      }
                      disabled={loading}
                    >
                      <Text
                        style={
                          styles.removeImageText
                        }
                      >
                        Remove
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.imagePicker,
                    pressed &&
                      styles.imagePickerPressed,
                  ]}
                  onPress={pickServiceImage}
                  disabled={loading}
                >
                  <View
                    style={
                      styles.imagePickerIcon
                    }
                  >
                    <Text
                      style={
                        styles.imagePickerIconText
                      }
                    >
                      +
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.imagePickerTitle
                    }
                  >
                    Add Service Image
                  </Text>

                  <Text
                    style={
                      styles.imagePickerSubtitle
                    }
                  >
                    Select a photo from your
                    gallery
                  </Text>
                </Pressable>
              )}
            </View>

            {/* SERVICE NAME */}

            <View style={styles.field}>
              <Text style={styles.label}>
                SERVICE NAME
                <Text style={styles.required}>
                  {" "}*
                </Text>
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Hair Cut"
                placeholderTextColor="#B5A8AB"
                style={styles.input}
                editable={!loading}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* CATEGORY */}

            <View style={styles.field}>
              <Text style={styles.label}>
                CATEGORY
              </Text>

              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Hair, Facial, Spa"
                placeholderTextColor="#B5A8AB"
                style={styles.input}
                editable={!loading}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* PRICE + DURATION */}

            <View style={styles.row}>
              <View
                style={[
                  styles.field,
                  styles.halfField,
                ]}
              >
                <Text style={styles.label}>
                  PRICE
                  <Text style={styles.required}>
                    {" "}*
                  </Text>
                </Text>

                <View
                  style={styles.inputWithIcon}
                >
                  <Text style={styles.rupee}>
                    ₹
                  </Text>

                  <TextInput
                    value={price}
                    onChangeText={(text) =>
                      setPrice(
                        text.replace(
                          /[^0-9.]/g,
                          ""
                        )
                      )
                    }
                    placeholder="500"
                    placeholderTextColor="#B5A8AB"
                    style={
                      styles.inputInside
                    }
                    editable={!loading}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View
                style={[
                  styles.field,
                  styles.halfField,
                ]}
              >
                <Text style={styles.label}>
                  DURATION
                </Text>

                <View
                  style={styles.inputWithIcon}
                >
                  <TextInput
                    value={duration}
                    onChangeText={(text) =>
                      setDuration(
                        text.replace(
                          /[^0-9]/g,
                          ""
                        )
                      )
                    }
                    placeholder="30"
                    placeholderTextColor="#B5A8AB"
                    style={
                      styles.inputInside
                    }
                    editable={!loading}
                    keyboardType="number-pad"
                  />

                  <Text style={styles.unit}>
                    min
                  </Text>
                </View>
              </View>
            </View>

            {/* DESCRIPTION */}

            <View style={styles.field}>
              <Text style={styles.label}>
                DESCRIPTION
              </Text>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe this service..."
                placeholderTextColor="#B5A8AB"
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                editable={!loading}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />

              <Text
                style={styles.characterCount}
              >
                {description.length}/500
              </Text>
            </View>

            {/* PREVIEW */}

            <View style={styles.previewCard}>
              {serviceImage ? (
                <Image
                  source={{
                    uri: serviceImage.uri,
                  }}
                  style={styles.previewImage}
                />
              ) : (
                <View
                  style={styles.previewIcon}
                >
                  <Text
                    style={
                      styles.previewIconText
                    }
                  >
                    ✦
                  </Text>
                </View>
              )}

              <View style={styles.previewInfo}>
                <Text style={styles.previewTitle}>
                  {name.trim() ||
                    "Service Name"}
                </Text>

                <Text
                  style={styles.previewCategory}
                >
                  {category.trim() ||
                    "General"}
                </Text>

                <Text
                  style={styles.previewDuration}
                >
                  ◷ {duration || "30"} min
                </Text>
              </View>

              <Text style={styles.previewPrice}>
                ₹{price || "0"}
              </Text>
            </View>

            {/* ADD BUTTON */}

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed &&
                  styles.submitButtonPressed,
                loading &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleAddService}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.submitButtonText
                    }
                  >
                    Adding...
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={styles.submitIcon}
                  >
                    +
                  </Text>

                  <Text
                    style={
                      styles.submitButtonText
                    }
                  >
                    Add Service
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>

            <View style={styles.bottomSpace} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF7F4",
  },

  safeArea: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  header: {
    minHeight: 91,
    paddingHorizontal: 17,
    paddingTop: 10,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0E5E2",
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0E5E2",
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    color: "#70243A",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 34,
    marginTop: -3,
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  eyebrow: {
    color: "#A09195",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  title: {
    color: "#602032",
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "serif",
    marginTop: 2,
  },

  subtitle: {
    color: "#9B8E91",
    fontSize: 9,
    marginTop: 2,
  },

  headerSpacer: {
    width: 43,
  },

  content: {
    paddingHorizontal: 17,
    paddingTop: 21,
  },

  field: {
    marginBottom: 17,
  },

  row: {
    flexDirection: "row",
    gap: 11,
  },

  halfField: {
    flex: 1,
  },

  label: {
    color: "#6F6266",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 7,
  },

  required: {
    color: "#A93650",
  },

  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E9DDDA",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    color: "#342A2D",
    fontSize: 12,
  },

  inputWithIcon: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E9DDDA",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  rupee: {
    color: "#70243A",
    fontSize: 15,
    fontWeight: "800",
    marginRight: 7,
  },

  inputInside: {
    flex: 1,
    minHeight: 48,
    padding: 0,
    color: "#342A2D",
    fontSize: 12,
  },

  unit: {
    color: "#8F8185",
    fontSize: 9,
    fontWeight: "700",
  },

  textArea: {
    minHeight: 105,
    paddingTop: 13,
    paddingBottom: 13,
  },

  characterCount: {
    color: "#AA9C9F",
    fontSize: 8,
    textAlign: "right",
    marginTop: 4,
  },

  // ========================================
  // IMAGE
  // ========================================

  imagePicker: {
    minHeight: 145,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E9DDDA",
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  imagePickerPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  imagePickerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  imagePickerIconText: {
    color: "#70243A",
    fontSize: 27,
    fontWeight: "300",
  },

  imagePickerTitle: {
    color: "#4C3D41",
    fontSize: 11,
    fontWeight: "800",
  },

  imagePickerSubtitle: {
    color: "#A19498",
    fontSize: 8,
    marginTop: 4,
  },

  imageCard: {
    height: 190,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9DDDA",
  },

  serviceImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },

  changeImageButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
  },

  changeImageText: {
    color: "#70243A",
    fontSize: 9,
    fontWeight: "800",
  },

  removeImageButton: {
    backgroundColor: "#70243A",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
  },

  removeImageText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },

  // ========================================
  // PREVIEW
  // ========================================

  previewCard: {
    minHeight: 88,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0E5E2",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 18,
  },

  previewImage: {
    width: 52,
    height: 52,
    borderRadius: 17,
    resizeMode: "cover",
  },

  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#F8E9E6",
    alignItems: "center",
    justifyContent: "center",
  },

  previewIconText: {
    color: "#76253A",
    fontSize: 21,
  },

  previewInfo: {
    flex: 1,
    paddingLeft: 11,
  },

  previewTitle: {
    color: "#342A2D",
    fontSize: 11,
    fontWeight: "800",
  },

  previewCategory: {
    color: "#9A8C90",
    fontSize: 8,
    marginTop: 3,
  },

  previewDuration: {
    color: "#8E8084",
    fontSize: 8,
    marginTop: 5,
  },

  previewPrice: {
    color: "#70243A",
    fontSize: 13,
    fontWeight: "900",
  },

  // ========================================
  // BUTTONS
  // ========================================

  submitButton: {
    height: 53,
    borderRadius: 16,
    backgroundColor: "#70243A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  submitButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitIcon: {
    color: "#FFFFFF",
    fontSize: 21,
    lineHeight: 21,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  cancelButton: {
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
  },

  cancelText: {
    color: "#8C7E82",
    fontSize: 10,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 35,
  },
});