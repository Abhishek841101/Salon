
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API_URL from "../../config/api";

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
  services: [],
  service: null,

  loading: false,
  detailsLoading: false,
  saving: false,
  deleting: false,
  uploading: false,

  error: null,
  success: false,

  uploadResult: null,

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
      serviceGroup = "",
      category = "",
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

      if (serviceGroup?.trim()) {
        params.append(
          "serviceGroup",
          serviceGroup.trim()
        );
      }

      if (category?.trim()) {
        params.append(
          "category",
          category.trim()
        );
      }

      const url =
        `${API_URL}/services?${params.toString()}`;

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
        const result =
          await getErrorMessage(response);

        return rejectWithValue(
          result.message
        );
      }

      const data = await response.json();

      console.log(
        "SERVICES RESPONSE:",
        response.status,
        data
      );

      if (!data.success) {
        return rejectWithValue(
          data.message ||
            "Failed to fetch services"
        );
      }

      return data;
    } catch (error) {
      console.log(
        "FETCH SERVICES ERROR:",
        error
      );

      return rejectWithValue(
        error?.message ||
          "Unable to connect to server"
      );
    }
  }
);

/* =====================================================
   GET SERVICE BY ID
===================================================== */

export const getServiceById =
  createAsyncThunk(
    "services/getServiceById",

    async (id, { rejectWithValue }) => {
      try {
        if (!id) {
          return rejectWithValue(
            "Service ID is required"
          );
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
          const result =
            await getErrorMessage(response);

          return rejectWithValue(
            result.message
          );
        }

        const data =
          await response.json();

        console.log(
          "SERVICE DETAILS RESPONSE:",
          response.status,
          data
        );

        if (!data.success) {
          return rejectWithValue(
            data.message ||
              "Failed to fetch service"
          );
        }

        return data;
      } catch (error) {
        console.log(
          "GET SERVICE ERROR:",
          error
        );

        return rejectWithValue(
          error?.message ||
            "Unable to fetch service"
        );
      }
    }
  );

/* =====================================================
   CREATE SERVICE
   IMAGE SUPPORT
===================================================== */

export const createService =
  createAsyncThunk(
    "services/createService",

    async (
      serviceData,
      { rejectWithValue }
    ) => {
      try {
        const {
          name,
          serviceGroup,
          category,
          price,
          duration,
          description,
          image,
          serviceImage,
        } = serviceData;

        console.log(
          "========================================"
        );
        console.log("CREATE SERVICE");
        console.log("NAME:", name);
        console.log(
          "SERVICE GROUP:",
          serviceGroup
        );
        console.log("CATEGORY:", category);
        console.log("PRICE:", price);
        console.log(
          "DURATION:",
          duration
        );
        console.log(
          "IMAGE:",
          image ||
            serviceImage ||
            "NO IMAGE"
        );
        console.log(
          "========================================"
        );

        /* -----------------------------
           NAME
        ----------------------------- */

        if (!name?.trim()) {
          return rejectWithValue(
            "Service name is required"
          );
        }

        /* -----------------------------
           PRICE
        ----------------------------- */

        if (
          price === undefined ||
          price === null ||
          price === ""
        ) {
          return rejectWithValue(
            "Service price is required"
          );
        }

        const numericPrice =
          Number(price);

        if (
          Number.isNaN(numericPrice) ||
          numericPrice < 0
        ) {
          return rejectWithValue(
            "Invalid service price"
          );
        }

        /* -----------------------------
           DURATION
        ----------------------------- */

        const numericDuration =
          duration === undefined ||
          duration === ""
            ? 30
            : Number(duration);

        if (
          Number.isNaN(
            numericDuration
          ) ||
          numericDuration < 1
        ) {
          return rejectWithValue(
            "Invalid service duration"
          );
        }

        /* -----------------------------
           FORM DATA
        ----------------------------- */

        const formData =
          new FormData();

        formData.append(
          "name",
          String(name).trim()
        );

        formData.append(
          "serviceGroup",
          String(
            serviceGroup || "General"
          ).trim()
        );

        formData.append(
          "category",
          String(
            category || ""
          ).trim()
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
          String(
            description || ""
          ).trim()
        );

        /* -----------------------------
           IMAGE
        ----------------------------- */

        const selectedImage =
          image || serviceImage;

        if (selectedImage?.uri) {
          console.log(
            "APPENDING SERVICE IMAGE"
          );

          console.log(
            "URI:",
            selectedImage.uri
          );

          console.log(
            "NAME:",
            selectedImage.name
          );

          console.log(
            "TYPE:",
            selectedImage.type
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

        /* -----------------------------
           REQUEST
        ----------------------------- */

        const response =
          await fetch(
            `${API_URL}/services`,
            {
              method: "POST",

              headers: {
                Accept:
                  "application/json",
              },

              /*
               * IMPORTANT:
               * Do NOT set Content-Type manually.
               * React Native adds multipart
               * boundary automatically.
               */

              body: formData,
            }
          );

        console.log(
          "CREATE SERVICE STATUS:",
          response.status
        );

        if (!response.ok) {
          const result =
            await getErrorMessage(
              response
            );

          console.log(
            "CREATE SERVICE SERVER ERROR:",
            result.data
          );

          return rejectWithValue(
            result.message
          );
        }

        const data =
          await response.json();

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
          "CREATE SERVICE ERROR:",
          error
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

export const updateService =
  createAsyncThunk(
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
          serviceGroup,
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

        /* -----------------------------
           FORM DATA
        ----------------------------- */

        const formData =
          new FormData();

        /* -----------------------------
           NAME
        ----------------------------- */

        if (name !== undefined) {
          if (!String(name).trim()) {
            return rejectWithValue(
              "Service name cannot be empty"
            );
          }

          formData.append(
            "name",
            String(name).trim()
          );
        }

        /* -----------------------------
           SERVICE GROUP
        ----------------------------- */

        if (
          serviceGroup !== undefined
        ) {
          formData.append(
            "serviceGroup",
            String(
              serviceGroup || "General"
            ).trim()
          );
        }

        /* -----------------------------
           CATEGORY
        ----------------------------- */

        if (category !== undefined) {
          formData.append(
            "category",
            String(category).trim()
          );
        }

        /* -----------------------------
           PRICE
        ----------------------------- */

        if (price !== undefined) {
          const numericPrice =
            Number(price);

          if (
            Number.isNaN(
              numericPrice
            ) ||
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

        /* -----------------------------
           DURATION
        ----------------------------- */

        if (duration !== undefined) {
          const numericDuration =
            Number(duration);

          if (
            Number.isNaN(
              numericDuration
            ) ||
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

        /* -----------------------------
           DESCRIPTION
        ----------------------------- */

        if (
          description !== undefined
        ) {
          formData.append(
            "description",
            String(
              description
            ).trim()
          );
        }

        /* -----------------------------
           ACTIVE STATUS
        ----------------------------- */

        if (
          isActive !== undefined
        ) {
          formData.append(
            "isActive",
            String(Boolean(isActive))
          );
        }

        /* -----------------------------
           IMAGE
        ----------------------------- */

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

        /* -----------------------------
           REQUEST
        ----------------------------- */

        const response =
          await fetch(
            `${API_URL}/services/${id}`,
            {
              method: "PUT",

              headers: {
                Accept:
                  "application/json",
              },

              body: formData,
            }
          );

        if (!response.ok) {
          const result =
            await getErrorMessage(
              response
            );

          return rejectWithValue(
            result.message
          );
        }

        const data =
          await response.json();

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
   BULK UPLOAD SERVICES
   EXCEL / XLS / XLSX / CSV

   Backend:
   POST /api/services/bulk-upload

   FormData field:
   file
===================================================== */

export const bulkUploadServices =
  createAsyncThunk(
    "services/bulkUploadServices",

    async (
      file,
      { rejectWithValue }
    ) => {
      try {
        if (!file) {
          return rejectWithValue(
            "Excel or CSV file is required"
          );
        }

        console.log(
          "========================================"
        );

        console.log(
          "BULK SERVICE UPLOAD"
        );

        console.log(
          "FILE:",
          file
        );

        console.log(
          "========================================"
        );

        /* -----------------------------
           FORM DATA
        ----------------------------- */

        const formData =
          new FormData();

        /*
         * React Native file object
         *
         * Expected:
         * {
         *   uri,
         *   name,
         *   type
         * }
         */

        formData.append("file", {
          uri: file.uri,

          name:
            file.name ||
            `services-${Date.now()}.xlsx`,

          type:
            file.type ||
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        /* -----------------------------
           REQUEST
        ----------------------------- */

        const response =
          await fetch(
            `${API_URL}/services/bulk-upload`,
            {
              method: "POST",

              headers: {
                Accept:
                  "application/json",
              },

              /*
               * IMPORTANT:
               * Do NOT manually set Content-Type.
               *
               * React Native automatically
               * creates multipart/form-data
               * boundary.
               */

              body: formData,
            }
          );

        console.log(
          "BULK UPLOAD STATUS:",
          response.status
        );

        if (!response.ok) {
          const result =
            await getErrorMessage(
              response
            );

          console.log(
            "BULK UPLOAD ERROR RESPONSE:",
            result.data
          );

          return rejectWithValue(
            result.message
          );
        }

        const data =
          await response.json();

        console.log(
          "BULK UPLOAD RESPONSE:",
          data
        );

        if (!data.success) {
          return rejectWithValue(
            data.message ||
              "Failed to upload services"
          );
        }

        return data;
      } catch (error) {
        console.log(
          "BULK SERVICE UPLOAD ERROR:",
          error
        );

        return rejectWithValue(
          error?.message ||
            "Unable to upload service file"
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

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          return rejectWithValue(
            "Service ID is required"
          );
        }

        const response =
          await fetch(
            `${API_URL}/services/${id}/deactivate`,
            {
              method: "PATCH",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          const result =
            await getErrorMessage(
              response
            );

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

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          return rejectWithValue(
            "Service ID is required"
          );
        }

        const response =
          await fetch(
            `${API_URL}/services/${id}/reactivate`,
            {
              method: "PATCH",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          const result =
            await getErrorMessage(
              response
            );

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

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          return rejectWithValue(
            "Service ID is required"
          );
        }

        const response =
          await fetch(
            `${API_URL}/services/${id}`,
            {
              method: "DELETE",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          const result =
            await getErrorMessage(
              response
            );

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

const servicesSlice =
  createSlice({
    name: "services",

    initialState,

    reducers: {
      clearServiceError: (
        state
      ) => {
        state.error = null;
      },

      clearServiceSuccess: (
        state
      ) => {
        state.success = false;
      },

      clearSelectedService: (
        state
      ) => {
        state.service = null;
      },

      clearUploadResult: (
        state
      ) => {
        state.uploadResult = null;
      },
    },

    extraReducers: (
      builder
    ) => {
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
          (
            state,
            action
          ) => {
            state.loading = false;
            state.error = null;

            const data =
              action.payload;

            state.services =
              Array.isArray(
                data.services
              )
                ? data.services
                : [];

            /*
             * Backend currently returns:
             * total
             * page
             * limit
             * totalPages
             */

            state.total =
              data.total ??
              data.pagination?.total ??
              state.services.length;

            state.page =
              data.page ??
              data.pagination?.page ??
              1;

            state.limit =
              data.limit ??
              data.pagination?.limit ??
              20;

            state.totalPages =
              data.totalPages ??
              data.pagination?.totalPages ??
              1;
          }
        )

        .addCase(
          fetchServices.rejected,
          (
            state,
            action
          ) => {
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
            state.detailsLoading =
              true;

            state.error = null;
            state.service = null;
          }
        )

        .addCase(
          getServiceById.fulfilled,
          (
            state,
            action
          ) => {
            state.detailsLoading =
              false;

            state.error = null;

            state.service =
              action.payload
                .service || null;
          }
        )

        .addCase(
          getServiceById.rejected,
          (
            state,
            action
          ) => {
            state.detailsLoading =
              false;

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
          (
            state,
            action
          ) => {
            state.saving = false;
            state.success = true;
            state.error = null;

            const service =
              action.payload
                .service;

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
          (
            state,
            action
          ) => {
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
          (
            state,
            action
          ) => {
            state.saving = false;
            state.success = true;
            state.error = null;

            const updated =
              action.payload
                .service;

            if (!updated) return;

            state.service =
              updated;

            const index =
              state.services.findIndex(
                (item) =>
                  item._id ===
                  updated._id
              );

            if (index !== -1) {
              state.services[
                index
              ] = updated;
            }
          }
        )

        .addCase(
          updateService.rejected,
          (
            state,
            action
          ) => {
            state.saving = false;

            state.error =
              action.payload ||
              "Failed to update service";
          }
        )

        /* ===============================================
           BULK UPLOAD
        =============================================== */

        .addCase(
          bulkUploadServices.pending,
          (state) => {
            state.uploading = true;
            state.error = null;
            state.success = false;
            state.uploadResult =
              null;
          }
        )

        .addCase(
          bulkUploadServices.fulfilled,
          (
            state,
            action
          ) => {
            state.uploading = false;
            state.success = true;
            state.error = null;

            const data =
              action.payload;

            state.uploadResult =
              data;

            /*
             * Add newly created services
             * into current Redux list.
             */

            if (
              Array.isArray(
                data.services
              )
            ) {
              const existingIds =
                new Set(
                  state.services.map(
                    (item) =>
                      String(
                        item._id
                      )
                  )
                );

              const newServices =
                data.services.filter(
                  (item) =>
                    item?._id &&
                    !existingIds.has(
                      String(
                        item._id
                      )
                    )
                );

              state.services = [
                ...newServices,
                ...state.services,
              ];

              state.total +=
                Number(
                  data.created || 0
                );
            }
          }
        )

        .addCase(
          bulkUploadServices.rejected,
          (
            state,
            action
          ) => {
            state.uploading = false;
            state.success = false;

            state.error =
              action.payload ||
              "Failed to upload services";
          }
        )

        /* ===============================================
           DEACTIVATE
        =============================================== */

        .addCase(
          deactivateService.pending,
          (state) => {
            state.error = null;
          }
        )

        .addCase(
          deactivateService.fulfilled,
          (
            state,
            action
          ) => {
            state.success = true;
            state.error = null;

            const updated =
              action.payload
                .service;

            if (!updated) return;

            state.service =
              updated;

            const index =
              state.services.findIndex(
                (item) =>
                  item._id ===
                  updated._id
              );

            if (index !== -1) {
              state.services[
                index
              ] = updated;
            }
          }
        )

        .addCase(
          deactivateService.rejected,
          (
            state,
            action
          ) => {
            state.error =
              action.payload ||
              "Failed to deactivate service";
          }
        )

        /* ===============================================
           REACTIVATE
        =============================================== */

        .addCase(
          reactivateService.pending,
          (state) => {
            state.error = null;
          }
        )

        .addCase(
          reactivateService.fulfilled,
          (
            state,
            action
          ) => {
            state.success = true;
            state.error = null;

            const updated =
              action.payload
                .service;

            if (!updated) return;

            state.service =
              updated;

            const index =
              state.services.findIndex(
                (item) =>
                  item._id ===
                  updated._id
              );

            if (index !== -1) {
              state.services[
                index
              ] = updated;
            }
          }
        )

        .addCase(
          reactivateService.rejected,
          (
            state,
            action
          ) => {
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
          (
            state,
            action
          ) => {
            state.deleting = false;
            state.success = true;
            state.error = null;

            const deletedId =
              action.payload
                .deletedId;

            state.services =
              state.services.filter(
                (item) =>
                  item._id !==
                  deletedId
              );

            state.total =
              Math.max(
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
          (
            state,
            action
          ) => {
            state.deleting = false;

            state.error =
              action.payload ||
              "Failed to delete service";
          }
        );
    },
  });

/* =====================================================
   ACTIONS
===================================================== */

export const {
  clearServiceError,
  clearServiceSuccess,
  clearSelectedService,
  clearUploadResult,
} = servicesSlice.actions;

/* =====================================================
   SELECTORS
===================================================== */

export const selectServices =
  (state) =>
    state.services?.services || [];

export const selectSelectedService =
  (state) =>
    state.services?.service || null;

export const selectServicesLoading =
  (state) =>
    state.services?.loading || false;

export const selectServicesSaving =
  (state) =>
    state.services?.saving || false;

export const selectServicesUploading =
  (state) =>
    state.services?.uploading || false;

export const selectServicesError =
  (state) =>
    state.services?.error || null;

export const selectServiceUploadResult =
  (state) =>
    state.services?.uploadResult ||
    null;

/* =====================================================
   EXPORT REDUCER
===================================================== */


