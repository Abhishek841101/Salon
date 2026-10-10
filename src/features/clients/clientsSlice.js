import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import API_URL from "../../config/api";
// import * as DocumentPicker from "expo-document-picker";
import { File, UploadType } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  clients: [],
  client: null,
  loading: false,
  error: null,
  success: false,
  bulkImporting: false,
  total: 0,
  page: 1,
  pages: 1,
};

// ========================================
// HELPERS
// ========================================

const getToken = (getState) => {
  return getState()?.auth?.token || null;
};

const parseResponse = (response) => {
  try {
    return JSON.parse(response);
  } catch {
    return {
      success: false,
      message: response || "Invalid server response",
    };
  }
};

const getResponseData = async (response) => {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid server response (HTTP ${response.status})`
    );
  }
};

// ========================================
// CREATE CLIENT
// POST /api/clients
// ========================================

export const createClient = createAsyncThunk(
  "clients/createClient",
  async (clientData, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        return rejectWithValue("Authentication token missing");
      }

      const {
        name = "",
        phone = "",
        email = "",
        gender = "",
        dateOfBirth = "",
        anniversaryDate = "",
        address = "",
        notes = "",
        profileImage = null,
      } = clientData || {};

      if (!String(name).trim()) {
        return rejectWithValue("Client name is required");
      }

      if (!String(phone).trim()) {
        return rejectWithValue("Client phone number is required");
      }

      const parameters = {
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: String(email || "").trim(),
        gender: String(gender || "").trim(),
        address: String(address || "").trim(),
        notes: String(notes || "").trim(),
      };

      if (dateOfBirth) {
        const dob = new Date(dateOfBirth);

        if (!Number.isNaN(dob.getTime())) {
          parameters.dateOfBirth = dob.toISOString();
        }
      }

      if (anniversaryDate) {
        const anniversary = new Date(anniversaryDate);

        if (!Number.isNaN(anniversary.getTime())) {
          parameters.anniversaryDate = anniversary.toISOString();
        }
      }

      // IMAGE UPLOAD
      if (profileImage?.uri) {
        const uploadResult = await FileSystem.uploadAsync(
          `${API_URL}/clients`,
          profileImage.uri,
          {
            httpMethod: "POST",
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: "profileImage",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            parameters,
          }
        );

        const data = parseResponse(uploadResult.body);

        if (
          uploadResult.status < 200 ||
          uploadResult.status >= 300 ||
          !data.success
        ) {
          return rejectWithValue(
            data.message ||
              data.error ||
              "Failed to create client"
          );
        }

        return data;
      }

      // CLIENT WITHOUT IMAGE
      const formData = new FormData();

      Object.entries(parameters).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(`${API_URL}/clients`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await getResponseData(response);

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || data.error || "Failed to create client"
        );
      }

      return data;
    } catch (error) {
      console.error("CREATE CLIENT ERROR:", error);

      return rejectWithValue(
        error?.message || "Failed to create client"
      );
    }
  }
);

// ========================================
// BULK IMPORT CLIENTS
// POST /api/clients/bulk
// ========================================


export const bulkImportClients = createAsyncThunk(
  "clients/bulkImportClients",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        return rejectWithValue("Authentication token missing");
      }

      console.log("========== BULK CLIENT IMPORT ==========");

      // 1. Open Android native file picker
      const result = await File.pickFileAsync({
        mimeTypes: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
          "text/comma-separated-values",
          "application/octet-stream",
        ],
      });

      // 2. Handle cancellation
      if (!result || result.canceled || !result.result) {
        return rejectWithValue("FILE_PICKER_CANCELLED");
      }

      const file = result.result;

      // 3. Read selected file information
      const fileName = String(file.name || "").trim();
      const lowerFileName = fileName.toLowerCase();
      const mimeType = String(file.type || "").toLowerCase();

      console.log(
        "PICKER RESULT:",
        JSON.stringify({
          name: fileName,
          uri: file.uri,
          type: mimeType,
          size: file.size,
          constructor: file.constructor?.name,
        })
      );

      // 4. Validate URI
      if (!file.uri) {
        return rejectWithValue("Selected file URI is missing.");
      }

      // 5. Validate extension OR MIME type.
      // Android can return a document ID instead of the actual filename.
      const validExtension = /\.(xlsx|xls|csv)$/i.test(fileName);

      const supportedMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "text/comma-separated-values",
        "application/csv",
      ];

      const validMimeType = supportedMimeTypes.includes(mimeType);

      if (!validExtension && !validMimeType) {
        return rejectWithValue(
          `Unsupported file "${fileName}". Select an Excel or CSV file.`
        );
      }

      // 6. Validate size
      if (typeof file.size === "number" && file.size <= 0) {
        return rejectWithValue("The selected file is empty.");
      }

      // 7. Determine upload MIME type
      let uploadMimeType = mimeType;

      if (!uploadMimeType || uploadMimeType === "application/octet-stream") {
        if (lowerFileName.endsWith(".csv")) {
          uploadMimeType = "text/csv";
        } else if (lowerFileName.endsWith(".xls")) {
          uploadMimeType = "application/vnd.ms-excel";
        } else {
          uploadMimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
      }

      console.log("CLIENT IMPORT URI:", file.uri);
      console.log("CLIENT IMPORT MIME:", uploadMimeType);
      console.log("CLIENT IMPORT SIZE:", file.size);

      // 8. Upload file to backend
      const uploadUrl = `${API_URL}/clients/bulk`;

      const uploadResult = await file.upload(uploadUrl, {
        httpMethod: "POST",
        uploadType: UploadType.MULTIPART,
        fieldName: "file",
        mimeType: uploadMimeType,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("CLIENT IMPORT HTTP STATUS:", uploadResult.status);
      console.log("CLIENT IMPORT RESPONSE:", uploadResult.body);

      // 9. Parse backend response
      let data;

      try {
        data =
          typeof uploadResult.body === "string"
            ? JSON.parse(uploadResult.body || "{}")
            : uploadResult.body || {};
      } catch (parseError) {
        console.error("CLIENT IMPORT PARSE ERROR:", parseError);

        return rejectWithValue(
          `Invalid server response (HTTP ${uploadResult.status}).`
        );
      }

      // 10. Check HTTP and backend errors
      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        return rejectWithValue(
          data.message ||
            data.error ||
            `Import failed with HTTP ${uploadResult.status}.`
        );
      }

      if (data.success === false) {
        return rejectWithValue(
          data.message || data.error || "Client import failed."
        );
      }

      console.log("CLIENT IMPORT SUMMARY:", data.summary);

      return data;
    } catch (error) {
      console.error("CLIENT BULK IMPORT ERROR:", error);

      return rejectWithValue(
        error?.message || "Unable to import clients."
      );
    }
  }
);




// ========================================
// FETCH CLIENTS
// GET /api/clients
// ========================================

export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async (
    { page = 1, limit = 20, search = "" } = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getToken(getState);

      if (!token) {
        return rejectWithValue("Authentication token missing");
      }

      const params = new URLSearchParams();

      params.append("page", String(page));
      params.append("limit", String(limit));

      if (String(search).trim()) {
        params.append("search", String(search).trim());
      }

      const response = await fetch(
        `${API_URL}/clients?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await getResponseData(response);

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Failed to fetch clients"
        );
      }

      return data;
    } catch (error) {
      console.error("FETCH CLIENTS ERROR:", error);

      return rejectWithValue(
        error?.message || "Unable to connect to server"
      );
    }
  }
);

// ========================================
// GET CLIENT BY ID
// GET /api/clients/:id
// ========================================

export const getClientById = createAsyncThunk(
  "clients/getClientById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        return rejectWithValue("Authentication token missing");
      }

      if (!id) {
        return rejectWithValue("Client ID is required");
      }

      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await getResponseData(response);

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Failed to fetch client"
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch client"
      );
    }
  }
);

// ========================================
// GET CLIENT HISTORY
// GET /api/clients/:id/history
// ========================================

export const getClientHistory = createAsyncThunk(
  "clients/getClientHistory",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        return rejectWithValue("Authentication token missing");
      }

      if (!id) {
        return rejectWithValue("Client ID is required");
      }

      const response = await fetch(
        `${API_URL}/clients/${id}/history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await getResponseData(response);

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Failed to fetch client history"
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch client history"
      );
    }
  }
);

// ========================================
// UPDATE CLIENT
// PUT /api/clients/:id
// ========================================

export const updateClient = createAsyncThunk(
  "clients/updateClient",
  async ({ id, ...clientData }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        return rejectWithValue("Authentication token missing");
      }

      if (!id) {
        return rejectWithValue("Client ID is required");
      }

      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(clientData),
      });

      const data = await getResponseData(response);

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Failed to update client"
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to update client"
      );
    }
  }
);

// ========================================
// DEACTIVATE CLIENT
// PATCH /api/clients/:id/deactivate
// ========================================

export const deactivateClient = createAsyncThunk(
  "clients/deactivateClient",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        return rejectWithValue("Authentication token missing");
      }

      const response = await fetch(
        `${API_URL}/clients/${id}/deactivate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await getResponseData(response);

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Failed to deactivate client"
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to deactivate client"
      );
    }
  }
);

// ========================================
// REACTIVATE CLIENT
// PATCH /api/clients/:id/reactivate
// ========================================

export const reactivateClient = createAsyncThunk(
  "clients/reactivateClient",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        return rejectWithValue("Authentication token missing");
      }

      const response = await fetch(
        `${API_URL}/clients/${id}/reactivate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await getResponseData(response);

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Failed to reactivate client"
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to reactivate client"
      );
    }
  }
);

// ========================================
// DELETE CLIENT
// DELETE /api/clients/:id
// ========================================

export const deleteClient = createAsyncThunk(
  "clients/deleteClient",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        return rejectWithValue("Authentication token missing");
      }

      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await getResponseData(response);

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Failed to delete client"
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to delete client"
      );
    }
  }
);

// ========================================
// CLIENT SLICE
// ========================================

const clientsSlice = createSlice({
  name: "clients",
  initialState,

  reducers: {
    clearClientError: (state) => {
      state.error = null;
    },

    clearClientSuccess: (state) => {
      state.success = false;
    },

    clearSelectedClient: (state) => {
      state.client = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // CREATE CLIENT
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = true;

        const client = action.payload?.client || null;

        state.client = client;

        if (client) {
          const exists = state.clients.some(
            (item) => String(item._id) === String(client._id)
          );

          if (!exists) {
            state.clients.unshift(client);
            state.total += 1;
          }
        }
      })

      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to create client";
      })

      // FETCH CLIENTS
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const payload = action.payload || {};

        state.clients = payload.clients || payload.data || [];

        state.total =
          payload.total ??
          payload.pagination?.total ??
          state.clients.length;

        state.page =
          payload.page ??
          payload.pagination?.page ??
          1;

        state.pages =
          payload.pages ??
          payload.pagination?.totalPages ??
          payload.pagination?.pages ??
          1;
      })

      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch clients";
      })

      // GET CLIENT BY ID
      .addCase(getClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.client =
          action.payload?.client ||
          action.payload?.data ||
          null;
      })

      .addCase(getClientById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch client";
      })

      // CLIENT HISTORY
      .addCase(getClientHistory.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to fetch client history";
      })

      // UPDATE CLIENT
      .addCase(updateClient.fulfilled, (state, action) => {
        const updated =
          action.payload?.client ||
          action.payload?.data;

        if (!updated) return;

        state.client = updated;

        const index = state.clients.findIndex(
          (item) => String(item._id) === String(updated._id)
        );

        if (index !== -1) {
          state.clients[index] = updated;
        }
      })

      .addCase(updateClient.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to update client";
      })

      // DEACTIVATE CLIENT
      .addCase(deactivateClient.fulfilled, (state, action) => {
        const updated = action.payload?.client;

        if (!updated) return;

        state.client = updated;

        const index = state.clients.findIndex(
          (item) => String(item._id) === String(updated._id)
        );

        if (index !== -1) {
          state.clients[index] = updated;
        }
      })

      .addCase(deactivateClient.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to deactivate client";
      })

      // REACTIVATE CLIENT
      .addCase(reactivateClient.fulfilled, (state, action) => {
        const updated = action.payload?.client;

        if (!updated) return;

        state.client = updated;

        const index = state.clients.findIndex(
          (item) => String(item._id) === String(updated._id)
        );

        if (index !== -1) {
          state.clients[index] = updated;
        }
      })

      .addCase(reactivateClient.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to reactivate client";
      })

      // BULK IMPORT
      .addCase(bulkImportClients.pending, (state) => {
        state.bulkImporting = true;
        state.error = null;
      })

      .addCase(bulkImportClients.fulfilled, (state, action) => {
        state.bulkImporting = false;
        state.error = null;

        const importedClients = action.payload?.clients || [];

        const existingIds = new Set(
          state.clients.map((client) => String(client._id))
        );

        const newClients = importedClients.filter(
          (client) => !existingIds.has(String(client._id))
        );

        state.clients = [...newClients, ...state.clients];
        state.total += newClients.length;
      })

      .addCase(bulkImportClients.rejected, (state, action) => {
        state.bulkImporting = false;

        if (action.payload !== "FILE_PICKER_CANCELLED") {
          state.error =
            action.payload ||
            action.error?.message ||
            "Client import failed.";
        }
      })

      // DELETE CLIENT
      .addCase(deleteClient.fulfilled, (state, action) => {
        const deletedId = action.meta.arg;

        state.clients = state.clients.filter(
          (item) => String(item._id) !== String(deletedId)
        );

        if (state.total > 0) {
          state.total -= 1;
        }

        if (String(state.client?._id) === String(deletedId)) {
          state.client = null;
        }
      })

      .addCase(deleteClient.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to delete client";
      });
  },
});

// ========================================
// ACTIONS
// ========================================

export const {
  clearClientError,
  clearClientSuccess,
  clearSelectedClient,
} = clientsSlice.actions;

// ========================================
// SELECTORS
// ========================================

export const selectClients = (state) =>
  state.clients?.clients || [];

export const selectClient = (state) =>
  state.clients?.client || null;

export const selectClientsLoading = (state) =>
  state.clients?.loading || false;

export const selectClientsError = (state) =>
  state.clients?.error || null;

export const selectClientsTotal = (state) =>
  state.clients?.total || 0;

// ========================================
// REDUCER
// ========================================

export default clientsSlice.reducer;