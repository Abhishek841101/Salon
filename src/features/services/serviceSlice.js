// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import API_URL from "../../config/api";

// const initialState = {
//   services: [],
//   service: null,
//   loading: false,
//   detailsLoading: false,
//   saving: false,
//   deleting: false,
//   error: null,
//   success: false,
//   total: 0,
//   page: 1,
//   limit: 20,
//   totalPages: 1,
// };

// /* =====================================================
//    GET SERVICES
// ===================================================== */

// export const fetchServices = createAsyncThunk(
//   "services/fetchServices",
//   async (
//     { page = 1, limit = 20, search = "", status = "active" } = {},
//     { rejectWithValue }
//   ) => {
//     try {
//       const params = new URLSearchParams();

//       params.append("page", String(page));
//       params.append("limit", String(limit));
//       params.append("status", status);

//       if (search?.trim()) {
//         params.append("search", search.trim());
//       }

//       const url = `${API_URL}/services?${params.toString()}`;

//       console.log("FETCH SERVICES:", url);

//       const response = await fetch(url, {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//         },
//       });

//       const data = await response.json();

//       console.log("SERVICES RESPONSE:", response.status, data);

//       if (!response.ok || !data.success) {
//         return rejectWithValue(
//           data.message || "Failed to fetch services"
//         );
//       }

//       return data;
//     } catch (error) {
//       console.log("FETCH SERVICES ERROR:", error);

//       return rejectWithValue(
//         error?.message || "Unable to connect to server"
//       );
//     }
//   }
// );

// /* =====================================================
//    GET SERVICE BY ID
// ===================================================== */

// export const getServiceById = createAsyncThunk(
//   "services/getServiceById",
//   async (id, { rejectWithValue }) => {
//     try {
//       if (!id) {
//         return rejectWithValue("Service ID is required");
//       }

//       const response = await fetch(
//         `${API_URL}/services/${id}`,
//         {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//           },
//         }
//       );

//       const data = await response.json();

//       console.log(
//         "SERVICE DETAILS RESPONSE:",
//         response.status,
//         data
//       );

//       if (!response.ok || !data.success) {
//         return rejectWithValue(
//           data.message || "Failed to fetch service"
//         );
//       }

//       return data;
//     } catch (error) {
//       console.log("GET SERVICE ERROR:", error);

//       return rejectWithValue(
//         error?.message || "Unable to fetch service"
//       );
//     }
//   }
// );

// /* =====================================================
//    CREATE SERVICE
// ===================================================== */

// export const createService = createAsyncThunk(
//   "services/createService",
//   async (serviceData, { rejectWithValue }) => {
//     try {
//       const {
//         name,
//         category,
//         price,
//         duration,
//         description,
//       } = serviceData;

//       const response = await fetch(
//         `${API_URL}/services`,
//         {
//           method: "POST",

//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },

//           body: JSON.stringify({
//             name: String(name || "").trim(),
//             category: String(category || "").trim(),
//             price: Number(price),
//             duration:
//               duration === "" || duration === undefined
//                 ? 30
//                 : Number(duration),
//             description: String(
//               description || ""
//             ).trim(),
//           }),
//         }
//       );

//       const data = await response.json();

//       console.log(
//         "CREATE SERVICE RESPONSE:",
//         response.status,
//         data
//       );

//       if (!response.ok || !data.success) {
//         return rejectWithValue(
//           data.message || "Failed to create service"
//         );
//       }

//       return data;
//     } catch (error) {
//       console.log("CREATE SERVICE ERROR:", error);

//       return rejectWithValue(
//         error?.message || "Unable to create service"
//       );
//     }
//   }
// );

// /* =====================================================
//    UPDATE SERVICE
// ===================================================== */

// export const updateService = createAsyncThunk(
//   "services/updateService",
//   async (
//     { id, ...serviceData },
//     { rejectWithValue }
//   ) => {
//     try {
//       if (!id) {
//         return rejectWithValue("Service ID is required");
//       }

//       const body = {};

//       if (serviceData.name !== undefined) {
//         body.name = String(serviceData.name).trim();
//       }

//       if (serviceData.category !== undefined) {
//         body.category = String(
//           serviceData.category
//         ).trim();
//       }

//       if (serviceData.price !== undefined) {
//         body.price = Number(serviceData.price);
//       }

//       if (serviceData.duration !== undefined) {
//         body.duration = Number(serviceData.duration);
//       }

//       if (serviceData.description !== undefined) {
//         body.description = String(
//           serviceData.description
//         ).trim();
//       }

//       if (serviceData.isActive !== undefined) {
//         body.isActive = Boolean(
//           serviceData.isActive
//         );
//       }

//       const response = await fetch(
//         `${API_URL}/services/${id}`,
//         {
//           method: "PUT",

//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },

//           body: JSON.stringify(body),
//         }
//       );

//       const data = await response.json();

//       console.log(
//         "UPDATE SERVICE RESPONSE:",
//         response.status,
//         data
//       );

//       if (!response.ok || !data.success) {
//         return rejectWithValue(
//           data.message || "Failed to update service"
//         );
//       }

//       return data;
//     } catch (error) {
//       console.log("UPDATE SERVICE ERROR:", error);

//       return rejectWithValue(
//         error?.message || "Unable to update service"
//       );
//     }
//   }
// );

// /* =====================================================
//    DEACTIVATE SERVICE
// ===================================================== */

// export const deactivateService = createAsyncThunk(
//   "services/deactivateService",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await fetch(
//         `${API_URL}/services/${id}/deactivate`,
//         {
//           method: "PATCH",
//           headers: {
//             Accept: "application/json",
//           },
//         }
//       );

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         return rejectWithValue(
//           data.message || "Failed to deactivate service"
//         );
//       }

//       return data;
//     } catch (error) {
//       return rejectWithValue(
//         error?.message || "Unable to deactivate service"
//       );
//     }
//   }
// );

// /* =====================================================
//    REACTIVATE SERVICE
// ===================================================== */

// export const reactivateService = createAsyncThunk(
//   "services/reactivateService",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await fetch(
//         `${API_URL}/services/${id}/reactivate`,
//         {
//           method: "PATCH",
//           headers: {
//             Accept: "application/json",
//           },
//         }
//       );

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         return rejectWithValue(
//           data.message || "Failed to reactivate service"
//         );
//       }

//       return data;
//     } catch (error) {
//       return rejectWithValue(
//         error?.message || "Unable to reactivate service"
//       );
//     }
//   }
// );

// /* =====================================================
//    DELETE SERVICE
// ===================================================== */

// export const deleteService = createAsyncThunk(
//   "services/deleteService",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await fetch(
//         `${API_URL}/services/${id}`,
//         {
//           method: "DELETE",
//           headers: {
//             Accept: "application/json",
//           },
//         }
//       );

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         return rejectWithValue(
//           data.message || "Failed to delete service"
//         );
//       }

//       return {
//         ...data,
//         deletedId: id,
//       };
//     } catch (error) {
//       return rejectWithValue(
//         error?.message || "Unable to delete service"
//       );
//     }
//   }
// );

// /* =====================================================
//    SLICE
// ===================================================== */

// const servicesSlice = createSlice({
//   name: "services",

//   initialState,

//   reducers: {
//     clearServiceError: (state) => {
//       state.error = null;
//     },

//     clearServiceSuccess: (state) => {
//       state.success = false;
//     },

//     clearSelectedService: (state) => {
//       state.service = null;
//     },
//   },

//   extraReducers: (builder) => {
//     builder

//       /* =================================================
//          FETCH
//       ================================================= */

//       .addCase(fetchServices.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })

//       .addCase(fetchServices.fulfilled, (state, action) => {
//         state.loading = false;
//         state.error = null;

//         const data = action.payload;

//         state.services = Array.isArray(data.services)
//           ? data.services
//           : [];

//         state.total =
//           data.pagination?.total ??
//           state.services.length;

//         state.page =
//           data.pagination?.page ?? 1;

//         state.limit =
//           data.pagination?.limit ?? 20;

//         state.totalPages =
//           data.pagination?.totalPages ?? 1;
//       })

//       .addCase(fetchServices.rejected, (state, action) => {
//         state.loading = false;

//         state.error =
//           action.payload ||
//           "Failed to fetch services";
//       })

//       /* =================================================
//          DETAILS
//       ================================================= */

//       .addCase(getServiceById.pending, (state) => {
//         state.detailsLoading = true;
//         state.error = null;
//         state.service = null;
//       })

//       .addCase(getServiceById.fulfilled, (state, action) => {
//         state.detailsLoading = false;
//         state.error = null;

//         state.service =
//           action.payload.service || null;
//       })

//       .addCase(getServiceById.rejected, (state, action) => {
//         state.detailsLoading = false;

//         state.error =
//           action.payload ||
//           "Failed to fetch service";
//       })

//       /* =================================================
//          CREATE
//       ================================================= */

//       .addCase(createService.pending, (state) => {
//         state.saving = true;
//         state.error = null;
//         state.success = false;
//       })

//       .addCase(createService.fulfilled, (state, action) => {
//         state.saving = false;
//         state.success = true;
//         state.error = null;

//         const service = action.payload.service;

//         if (service) {
//           state.services.unshift(service);
//           state.total += 1;
//         }
//       })

//       .addCase(createService.rejected, (state, action) => {
//         state.saving = false;
//         state.success = false;

//         state.error =
//           action.payload ||
//           "Failed to create service";
//       })

//       /* =================================================
//          UPDATE
//       ================================================= */

//       .addCase(updateService.pending, (state) => {
//         state.saving = true;
//         state.error = null;
//       })

//       .addCase(updateService.fulfilled, (state, action) => {
//         state.saving = false;
//         state.success = true;
//         state.error = null;

//         const updated = action.payload.service;

//         if (!updated) return;

//         state.service = updated;

//         const index = state.services.findIndex(
//           (item) => item._id === updated._id
//         );

//         if (index !== -1) {
//           state.services[index] = updated;
//         }
//       })

//       .addCase(updateService.rejected, (state, action) => {
//         state.saving = false;

//         state.error =
//           action.payload ||
//           "Failed to update service";
//       })

//       /* =================================================
//          DEACTIVATE
//       ================================================= */

//       .addCase(
//         deactivateService.fulfilled,
//         (state, action) => {
//           const updated = action.payload.service;

//           if (!updated) return;

//           state.service = updated;

//           const index = state.services.findIndex(
//             (item) => item._id === updated._id
//           );

//           if (index !== -1) {
//             state.services[index] = updated;
//           }
//         }
//       )

//       .addCase(
//         deactivateService.rejected,
//         (state, action) => {
//           state.error =
//             action.payload ||
//             "Failed to deactivate service";
//         }
//       )

//       /* =================================================
//          REACTIVATE
//       ================================================= */

//       .addCase(
//         reactivateService.fulfilled,
//         (state, action) => {
//           const updated = action.payload.service;

//           if (!updated) return;

//           state.service = updated;

//           const index = state.services.findIndex(
//             (item) => item._id === updated._id
//           );

//           if (index !== -1) {
//             state.services[index] = updated;
//           }
//         }
//       )

//       .addCase(
//         reactivateService.rejected,
//         (state, action) => {
//           state.error =
//             action.payload ||
//             "Failed to reactivate service";
//         }
//       )

//       /* =================================================
//          DELETE
//       ================================================= */

//       .addCase(deleteService.pending, (state) => {
//         state.deleting = true;
//         state.error = null;
//       })

//       .addCase(deleteService.fulfilled, (state, action) => {
//         state.deleting = false;
//         state.success = true;

//         const deletedId = action.payload.deletedId;

//         state.services = state.services.filter(
//           (item) => item._id !== deletedId
//         );

//         state.total = Math.max(
//           state.total - 1,
//           0
//         );

//         if (state.service?._id === deletedId) {
//           state.service = null;
//         }
//       })

//       .addCase(deleteService.rejected, (state, action) => {
//         state.deleting = false;

//         state.error =
//           action.payload ||
//           "Failed to delete service";
//       });
//   },
// });

// export const {
//   clearServiceError,
//   clearServiceSuccess,
//   clearSelectedService,
// } = servicesSlice.actions;

// export default servicesSlice.reducer;














































































import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API_URL from "../../config/api";

const initialState = {
  services: [],
  service: null,

  loading: false,
  detailsLoading: false,
  saving: false,
  deleting: false,

  error: null,
  success: false,

  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
};

/* =====================================================
   HELPER
===================================================== */

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();

    return {
      data,
      message:
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`,
    };
  } catch {
    return {
      data: null,
      message: `Request failed with status ${response.status}`,
    };
  }
};

/* =====================================================
   GET SERVICES
===================================================== */

export const fetchServices = createAsyncThunk(
  "services/fetchServices",

  async (
    {
      page = 1,
      limit = 20,
      search = "",
      status = "active",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();

      params.append("page", String(page));
      params.append("limit", String(limit));
      params.append("status", String(status));

      if (search?.trim()) {
        params.append("search", search.trim());
      }

      const url = `${API_URL}/services?${params.toString()}`;

      console.log("========================================");
      console.log("FETCH SERVICES");
      console.log(url);
      console.log("========================================");

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const result = await getErrorMessage(response);

        return rejectWithValue(result.message);
      }

      const data = await response.json();

      console.log("SERVICES RESPONSE:", response.status, data);

      if (!data.success) {
        return rejectWithValue(
          data.message || "Failed to fetch services"
        );
      }

      return data;
    } catch (error) {
      console.log("FETCH SERVICES ERROR:", error);

      return rejectWithValue(
        error?.message || "Unable to connect to server"
      );
    }
  }
);

/* =====================================================
   GET SERVICE BY ID
===================================================== */

export const getServiceById = createAsyncThunk(
  "services/getServiceById",

  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Service ID is required");
      }

      const response = await fetch(
        `${API_URL}/services/${id}`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const result = await getErrorMessage(response);

        return rejectWithValue(result.message);
      }

      const data = await response.json();

      console.log(
        "SERVICE DETAILS RESPONSE:",
        response.status,
        data
      );

      if (!data.success) {
        return rejectWithValue(
          data.message || "Failed to fetch service"
        );
      }

      return data;
    } catch (error) {
      console.log("GET SERVICE ERROR:", error);

      return rejectWithValue(
        error?.message || "Unable to fetch service"
      );
    }
  }
);

/* =====================================================
   CREATE SERVICE
   IMAGE SUPPORT
===================================================== */

export const createService = createAsyncThunk(
  "services/createService",

  async (serviceData, { rejectWithValue }) => {
    try {
      const {
        name,
        category,
        price,
        duration,
        description,
        image,
        serviceImage,
      } = serviceData;

      console.log("========================================");
      console.log("CREATE SERVICE");
      console.log("NAME:", name);
      console.log("CATEGORY:", category);
      console.log("PRICE:", price);
      console.log("DURATION:", duration);
      console.log("IMAGE:", image || serviceImage || "NO IMAGE");
      console.log("========================================");

      if (!name?.trim()) {
        return rejectWithValue("Service name is required");
      }

      if (
        price === undefined ||
        price === null ||
        price === ""
      ) {
        return rejectWithValue("Service price is required");
      }

      const numericPrice = Number(price);

      if (
        Number.isNaN(numericPrice) ||
        numericPrice < 0
      ) {
        return rejectWithValue("Invalid service price");
      }

      const numericDuration =
        duration === undefined ||
        duration === ""
          ? 30
          : Number(duration);

      if (
        Number.isNaN(numericDuration) ||
        numericDuration < 1
      ) {
        return rejectWithValue(
          "Invalid service duration"
        );
      }

      /* ---------------------------------------------
         FORM DATA
      --------------------------------------------- */

      const formData = new FormData();

      formData.append(
        "name",
        String(name).trim()
      );

      formData.append(
        "category",
        String(category || "").trim()
      );

      formData.append(
        "price",
        String(numericPrice)
      );

      formData.append(
        "duration",
        String(numericDuration)
      );

      formData.append(
        "description",
        String(description || "").trim()
      );

      /* ---------------------------------------------
         IMAGE
      --------------------------------------------- */

      const selectedImage = image || serviceImage;

      if (selectedImage?.uri) {
        console.log("========================================");
        console.log("APPENDING SERVICE IMAGE");
        console.log("URI:", selectedImage.uri);
        console.log("NAME:", selectedImage.name);
        console.log("TYPE:", selectedImage.type);
        console.log("========================================");

        formData.append("image", {
          uri: selectedImage.uri,
          name:
            selectedImage.name ||
            `service-${Date.now()}.jpg`,
          type:
            selectedImage.type ||
            "image/jpeg",
        });
      }

      console.log("SENDING CREATE SERVICE REQUEST...");

      /*
       * IMPORTANT:
       * Do NOT set Content-Type manually.
       * React Native will automatically add:
       * multipart/form-data + boundary
       */

      const response = await fetch(
        `${API_URL}/services`,
        {
          method: "POST",

          headers: {
            Accept: "application/json",
          },

          body: formData,
        }
      );

      console.log(
        "CREATE SERVICE STATUS:",
        response.status
      );

      if (!response.ok) {
        const result = await getErrorMessage(response);

        console.log(
          "CREATE SERVICE SERVER ERROR:",
          result.data
        );

        return rejectWithValue(result.message);
      }

      const data = await response.json();

      console.log(
        "CREATE SERVICE RESPONSE:",
        response.status,
        data
      );

      if (!data.success) {
        return rejectWithValue(
          data.message ||
            "Failed to create service"
        );
      }

      return data;
    } catch (error) {
      console.log(
        "========================================"
      );

      console.log(
        "CREATE SERVICE ERROR:",
        error
      );

      console.log(
        "========================================"
      );

      return rejectWithValue(
        error?.message ||
          "Unable to create service"
      );
    }
  }
);

/* =====================================================
   UPDATE SERVICE
   IMAGE SUPPORT
===================================================== */

export const updateService = createAsyncThunk(
  "services/updateService",

  async (
    { id, ...serviceData },
    { rejectWithValue }
  ) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Service ID is required"
        );
      }

      const {
        name,
        category,
        price,
        duration,
        description,
        isActive,
        image,
        serviceImage,
      } = serviceData;

      const selectedImage =
        image || serviceImage;

      /*
       * ---------------------------------------------
       * Always use FormData for update.
       * This allows text + optional image.
       * ---------------------------------------------
       */

      const formData = new FormData();

      if (name !== undefined) {
        formData.append(
          "name",
          String(name).trim()
        );
      }

      if (category !== undefined) {
        formData.append(
          "category",
          String(category).trim()
        );
      }

      if (price !== undefined) {
        const numericPrice = Number(price);

        if (
          Number.isNaN(numericPrice) ||
          numericPrice < 0
        ) {
          return rejectWithValue(
            "Invalid service price"
          );
        }

        formData.append(
          "price",
          String(numericPrice)
        );
      }

      if (duration !== undefined) {
        const numericDuration =
          Number(duration);

        if (
          Number.isNaN(numericDuration) ||
          numericDuration < 1
        ) {
          return rejectWithValue(
            "Invalid service duration"
          );
        }

        formData.append(
          "duration",
          String(numericDuration)
        );
      }

      if (description !== undefined) {
        formData.append(
          "description",
          String(description).trim()
        );
      }

      if (isActive !== undefined) {
        formData.append(
          "isActive",
          String(Boolean(isActive))
        );
      }

      /* ---------------------------------------------
         IMAGE
      --------------------------------------------- */

      if (selectedImage?.uri) {
        console.log(
          "APPENDING UPDATED SERVICE IMAGE"
        );

        formData.append("image", {
          uri: selectedImage.uri,
          name:
            selectedImage.name ||
            `service-${Date.now()}.jpg`,
          type:
            selectedImage.type ||
            "image/jpeg",
        });
      }

      console.log(
        "UPDATING SERVICE:",
        id
      );

      const response = await fetch(
        `${API_URL}/services/${id}`,
        {
          method: "PUT",

          headers: {
            Accept: "application/json",
          },

          body: formData,
        }
      );

      if (!response.ok) {
        const result =
          await getErrorMessage(response);

        return rejectWithValue(
          result.message
        );
      }

      const data = await response.json();

      console.log(
        "UPDATE SERVICE RESPONSE:",
        response.status,
        data
      );

      if (!data.success) {
        return rejectWithValue(
          data.message ||
            "Failed to update service"
        );
      }

      return data;
    } catch (error) {
      console.log(
        "UPDATE SERVICE ERROR:",
        error
      );

      return rejectWithValue(
        error?.message ||
          "Unable to update service"
      );
    }
  }
);

/* =====================================================
   DEACTIVATE SERVICE
===================================================== */

export const deactivateService =
  createAsyncThunk(
    "services/deactivateService",

    async (id, { rejectWithValue }) => {
      try {
        const response = await fetch(
          `${API_URL}/services/${id}/deactivate`,
          {
            method: "PATCH",

            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          const result =
            await getErrorMessage(response);

          return rejectWithValue(
            result.message
          );
        }

        const data =
          await response.json();

        if (!data.success) {
          return rejectWithValue(
            data.message ||
              "Failed to deactivate service"
          );
        }

        return data;
      } catch (error) {
        return rejectWithValue(
          error?.message ||
            "Unable to deactivate service"
        );
      }
    }
  );

/* =====================================================
   REACTIVATE SERVICE
===================================================== */

export const reactivateService =
  createAsyncThunk(
    "services/reactivateService",

    async (id, { rejectWithValue }) => {
      try {
        const response = await fetch(
          `${API_URL}/services/${id}/reactivate`,
          {
            method: "PATCH",

            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          const result =
            await getErrorMessage(response);

          return rejectWithValue(
            result.message
          );
        }

        const data =
          await response.json();

        if (!data.success) {
          return rejectWithValue(
            data.message ||
              "Failed to reactivate service"
          );
        }

        return data;
      } catch (error) {
        return rejectWithValue(
          error?.message ||
            "Unable to reactivate service"
        );
      }
    }
  );

/* =====================================================
   DELETE SERVICE
===================================================== */

export const deleteService =
  createAsyncThunk(
    "services/deleteService",

    async (id, { rejectWithValue }) => {
      try {
        const response = await fetch(
          `${API_URL}/services/${id}`,
          {
            method: "DELETE",

            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          const result =
            await getErrorMessage(response);

          return rejectWithValue(
            result.message
          );
        }

        const data =
          await response.json();

        if (!data.success) {
          return rejectWithValue(
            data.message ||
              "Failed to delete service"
          );
        }

        return {
          ...data,
          deletedId: id,
        };
      } catch (error) {
        return rejectWithValue(
          error?.message ||
            "Unable to delete service"
        );
      }
    }
  );

/* =====================================================
   SLICE
===================================================== */

const servicesSlice = createSlice({
  name: "services",

  initialState,

  reducers: {
    clearServiceError: (state) => {
      state.error = null;
    },

    clearServiceSuccess: (state) => {
      state.success = false;
    },

    clearSelectedService: (state) => {
      state.service = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===============================================
         FETCH
      =============================================== */

      .addCase(
        fetchServices.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchServices.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const data =
            action.payload;

          state.services =
            Array.isArray(data.services)
              ? data.services
              : [];

          state.total =
            data.pagination?.total ??
            state.services.length;

          state.page =
            data.pagination?.page ?? 1;

          state.limit =
            data.pagination?.limit ?? 20;

          state.totalPages =
            data.pagination?.totalPages ?? 1;
        }
      )

      .addCase(
        fetchServices.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch services";
        }
      )

      /* ===============================================
         DETAILS
      =============================================== */

      .addCase(
        getServiceById.pending,
        (state) => {
          state.detailsLoading = true;
          state.error = null;
          state.service = null;
        }
      )

      .addCase(
        getServiceById.fulfilled,
        (state, action) => {
          state.detailsLoading = false;
          state.error = null;

          state.service =
            action.payload.service ||
            null;
        }
      )

      .addCase(
        getServiceById.rejected,
        (state, action) => {
          state.detailsLoading = false;

          state.error =
            action.payload ||
            "Failed to fetch service";
        }
      )

      /* ===============================================
         CREATE
      =============================================== */

      .addCase(
        createService.pending,
        (state) => {
          state.saving = true;
          state.error = null;
          state.success = false;
        }
      )

      .addCase(
        createService.fulfilled,
        (state, action) => {
          state.saving = false;
          state.success = true;
          state.error = null;

          const service =
            action.payload.service;

          if (service) {
            state.services.unshift(
              service
            );

            state.total += 1;
          }
        }
      )

      .addCase(
        createService.rejected,
        (state, action) => {
          state.saving = false;
          state.success = false;

          state.error =
            action.payload ||
            "Failed to create service";
        }
      )

      /* ===============================================
         UPDATE
      =============================================== */

      .addCase(
        updateService.pending,
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )

      .addCase(
        updateService.fulfilled,
        (state, action) => {
          state.saving = false;
          state.success = true;
          state.error = null;

          const updated =
            action.payload.service;

          if (!updated) return;

          state.service = updated;

          const index =
            state.services.findIndex(
              (item) =>
                item._id === updated._id
            );

          if (index !== -1) {
            state.services[index] =
              updated;
          }
        }
      )

      .addCase(
        updateService.rejected,
        (state, action) => {
          state.saving = false;

          state.error =
            action.payload ||
            "Failed to update service";
        }
      )

      /* ===============================================
         DEACTIVATE
      =============================================== */

      .addCase(
        deactivateService.fulfilled,
        (state, action) => {
          const updated =
            action.payload.service;

          if (!updated) return;

          state.service = updated;

          const index =
            state.services.findIndex(
              (item) =>
                item._id === updated._id
            );

          if (index !== -1) {
            state.services[index] =
              updated;
          }
        }
      )

      .addCase(
        deactivateService.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to deactivate service";
        }
      )

      /* ===============================================
         REACTIVATE
      =============================================== */

      .addCase(
        reactivateService.fulfilled,
        (state, action) => {
          const updated =
            action.payload.service;

          if (!updated) return;

          state.service = updated;

          const index =
            state.services.findIndex(
              (item) =>
                item._id === updated._id
            );

          if (index !== -1) {
            state.services[index] =
              updated;
          }
        }
      )

      .addCase(
        reactivateService.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to reactivate service";
        }
      )

      /* ===============================================
         DELETE
      =============================================== */

      .addCase(
        deleteService.pending,
        (state) => {
          state.deleting = true;
          state.error = null;
        }
      )

      .addCase(
        deleteService.fulfilled,
        (state, action) => {
          state.deleting = false;
          state.success = true;

          const deletedId =
            action.payload.deletedId;

          state.services =
            state.services.filter(
              (item) =>
                item._id !== deletedId
            );

          state.total = Math.max(
            state.total - 1,
            0
          );

          if (
            state.service?._id ===
            deletedId
          ) {
            state.service = null;
          }
        }
      )

      .addCase(
        deleteService.rejected,
        (state, action) => {
          state.deleting = false;

          state.error =
            action.payload ||
            "Failed to delete service";
        }
      );
  },
});

export const {
  clearServiceError,
  clearServiceSuccess,
  clearSelectedService,
} = servicesSlice.actions;

export default servicesSlice.reducer;