import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import * as FileSystem from "expo-file-system/legacy";

import API_URL from "../../config/api";

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  clients: [],
  client: null,

  loading: false,
  error: null,
  success: false,

  total: 0,
  page: 1,
  pages: 1,
};

/* =========================================================
   HELPER
========================================================= */

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

/* =========================================================
   CREATE CLIENT
========================================================= */

export const createClient = createAsyncThunk(
  "clients/createClient",

  async (clientData, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        return rejectWithValue(
          "Authentication token missing"
        );
      }

      const {
        name = "",
        phone = "",
        email = "",
        gender = "",
        dateOfBirth = "",
        address = "",
        notes = "",
        profileImage = null,
      } = clientData || {};

      console.log("========================================");
      console.log("CREATE CLIENT SLICE");
      console.log("TOKEN:", !!token);
      console.log("NAME:", name);
      console.log("PHONE:", phone);
      console.log("EMAIL:", email);
      console.log("GENDER:", gender);
      console.log("DOB:", dateOfBirth);
      console.log("ADDRESS:", address);
      console.log("NOTES:", notes);
      console.log(
        "IMAGE:",
        profileImage?.uri || "NO IMAGE"
      );
      console.log("========================================");

      /* =====================================================
         VALIDATION
      ===================================================== */

      if (!String(name).trim()) {
        return rejectWithValue(
          "Client name is required"
        );
      }

      if (!String(phone).trim()) {
        return rejectWithValue(
          "Client phone number is required"
        );
      }

      /* =====================================================
         PARAMETERS
      ===================================================== */

      const parameters = {
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: String(email || "").trim(),
        gender: String(gender || "").trim(),
        address: String(address || "").trim(),
        notes: String(notes || "").trim(),
      };

      if (dateOfBirth) {
        try {
          parameters.dateOfBirth =
            new Date(dateOfBirth).toISOString();
        } catch {
          parameters.dateOfBirth = "";
        }
      }

      /* =====================================================
         IMAGE UPLOAD
         
         IMPORTANT:
         DO NOT USE:
         fetch + FormData + Blob

         Expo SDK 57 can throw:
         Unsupported FormDataPart implementation

         We use native legacy uploadAsync instead.
      ===================================================== */

      if (profileImage?.uri) {
        console.log("========================================");
        console.log("NATIVE MULTIPART IMAGE UPLOAD");
        console.log("URI:", profileImage.uri);
        console.log(
          "NAME:",
          profileImage.name || "client-image.jpg"
        );
        console.log(
          "TYPE:",
          profileImage.type || "image/jpeg"
        );
        console.log("========================================");

        const uploadResult =
          await FileSystem.uploadAsync(
            `${API_URL}/clients`,
            profileImage.uri,
            {
              httpMethod: "POST",

              uploadType:
                FileSystem.FileSystemUploadType.MULTIPART,

              fieldName: "profileImage",

              headers: {
                Authorization: `Bearer ${token}`,
              },

              parameters,
            }
          );

        console.log(
          "CREATE CLIENT HTTP STATUS:",
          uploadResult.status
        );

        console.log(
          "CREATE CLIENT SERVER RESPONSE:",
          uploadResult.body
        );

        const data = parseResponse(
          uploadResult.body
        );

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

        console.log(
          "========================================"
        );
        console.log(
          "CLIENT CREATED SUCCESSFULLY"
        );
        console.log(
          "CLIENT:",
          data.client
        );
        console.log(
          "========================================"
        );

        return data;
      }

      /* =====================================================
         NO IMAGE
         
         Since there is no file, normal FormData is safe
         because there is no native file/blob part.
      ===================================================== */

      console.log(
        "CREATE CLIENT WITHOUT IMAGE"
      );

      const formData = new FormData();

      Object.keys(parameters).forEach((key) => {
        formData.append(
          key,
          parameters[key]
        );
      });

      const response = await fetch(
        `${API_URL}/clients`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data = await response.json();

      console.log(
        "CREATE CLIENT RESPONSE:",
        response.status,
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        return rejectWithValue(
          data.message ||
            data.error ||
            "Failed to create client"
        );
      }

      return data;
    } catch (error) {
      console.log(
        "========================================"
      );
      console.log(
        "CREATE CLIENT ERROR"
      );
      console.log(error);
      console.log(
        "========================================"
      );

      return rejectWithValue(
        error?.message ||
          "Failed to create client"
      );
    }
  }
);

/* =========================================================
   FETCH CLIENTS
========================================================= */

export const fetchClients = createAsyncThunk(
  "clients/fetchClients",

  async (
    {
      page = 1,
      limit = 20,
      search = "",
    } = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getToken(getState);

      if (!token) {
        return rejectWithValue(
          "Authentication token missing"
        );
      }

      const params = new URLSearchParams();

      params.append(
        "page",
        String(page)
      );

      params.append(
        "limit",
        String(limit)
      );

      if (String(search).trim()) {
        params.append(
          "search",
          String(search).trim()
        );
      }

      const url =
        `${API_URL}/clients?${params.toString()}`;

      console.log(
        "FETCH CLIENTS:",
        url
      );

      const response = await fetch(
        url,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        return rejectWithValue(
          data.message ||
            "Failed to fetch clients"
        );
      }

      return data;
    } catch (error) {
      console.log(
        "FETCH CLIENTS ERROR:",
        error
      );

      return rejectWithValue(
        error?.message ||
          "Unable to connect to server"
      );
    }
  }
);

/* =========================================================
   GET CLIENT BY ID
========================================================= */

export const getClientById =
  createAsyncThunk(
    "clients/getClientById",

    async (
      id,
      { getState, rejectWithValue }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        if (!id) {
          return rejectWithValue(
            "Client ID is required"
          );
        }

        const response =
          await fetch(
            `${API_URL}/clients/${id}`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          return rejectWithValue(
            data.message ||
              "Failed to fetch client"
          );
        }

        return data;
      } catch (error) {
        return rejectWithValue(
          error?.message ||
            "Failed to fetch client"
        );
      }
    }
  );

/* =========================================================
   GET CLIENT HISTORY
========================================================= */

export const getClientHistory =
  createAsyncThunk(
    "clients/getClientHistory",

    async (
      id,
      { getState, rejectWithValue }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        if (!id) {
          return rejectWithValue(
            "Client ID is required"
          );
        }

        const response =
          await fetch(
            `${API_URL}/clients/${id}/history`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          return rejectWithValue(
            data.message ||
              "Failed to fetch client history"
          );
        }

        return data;
      } catch (error) {
        return rejectWithValue(
          error?.message ||
            "Failed to fetch client history"
        );
      }
    }
  );

/* =========================================================
   UPDATE CLIENT
========================================================= */

export const updateClient =
  createAsyncThunk(
    "clients/updateClient",

    async (
      {
        id,
        ...clientData
      },
      { getState, rejectWithValue }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        if (!id) {
          return rejectWithValue(
            "Client ID is required"
          );
        }

        const response =
          await fetch(
            `${API_URL}/clients/${id}`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify(
                clientData
              ),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          return rejectWithValue(
            data.message ||
              "Failed to update client"
          );
        }

        return data;
      } catch (error) {
        return rejectWithValue(
          error?.message ||
            "Failed to update client"
        );
      }
    }
  );

/* =========================================================
   DEACTIVATE CLIENT
========================================================= */

export const deactivateClient =
  createAsyncThunk(
    "clients/deactivateClient",

    async (
      id,
      { getState, rejectWithValue }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        const response =
          await fetch(
            `${API_URL}/clients/${id}/deactivate`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          return rejectWithValue(
            data.message ||
              "Failed to deactivate client"
          );
        }

        return data;
      } catch (error) {
        return rejectWithValue(
          error?.message ||
            "Failed to deactivate client"
        );
      }
    }
  );

/* =========================================================
   REACTIVATE CLIENT
========================================================= */

export const reactivateClient =
  createAsyncThunk(
    "clients/reactivateClient",

    async (
      id,
      { getState, rejectWithValue }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        const response =
          await fetch(
            `${API_URL}/clients/${id}/reactivate`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          return rejectWithValue(
            data.message ||
              "Failed to reactivate client"
          );
        }

        return data;
      } catch (error) {
        return rejectWithValue(
          error?.message ||
            "Failed to reactivate client"
        );
      }
    }
  );

/* =========================================================
   DELETE CLIENT
========================================================= */

export const deleteClient =
  createAsyncThunk(
    "clients/deleteClient",

    async (
      id,
      { getState, rejectWithValue }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        const response =
          await fetch(
            `${API_URL}/clients/${id}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          return rejectWithValue(
            data.message ||
              "Failed to delete client"
          );
        }

        return data;
      } catch (error) {
        return rejectWithValue(
          error?.message ||
            "Failed to delete client"
        );
      }
    }
  );

/* =========================================================
   SLICE
========================================================= */

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

      /* ===================================================
         CREATE
      =================================================== */

      .addCase(
        createClient.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        }
      )

      .addCase(
        createClient.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;
          state.success = true;

          const client =
            action.payload?.client ||
            null;

          state.client = client;

          if (client) {
            state.clients.unshift(
              client
            );

            state.total += 1;
          }
        }
      )

      .addCase(
        createClient.rejected,
        (state, action) => {
          state.loading = false;
          state.success = false;

          state.error =
            action.payload ||
            action.error?.message ||
            "Failed to create client";
        }
      )

      /* ===================================================
         FETCH
      =================================================== */

      .addCase(
        fetchClients.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchClients.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const payload =
            action.payload || {};

          state.clients =
            payload.clients ||
            payload.data ||
            [];

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
            payload.pagination?.pages ??
            1;
        }
      )

      .addCase(
        fetchClients.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            action.error?.message ||
            "Failed to fetch clients";
        }
      )

      /* ===================================================
         GET SINGLE
      =================================================== */

      .addCase(
        getClientById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getClientById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.client =
            action.payload?.client ||
            action.payload?.data ||
            null;
        }
      )

      .addCase(
        getClientById.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch client";
        }
      )

      /* ===================================================
         HISTORY
      =================================================== */

      .addCase(
        getClientHistory.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to fetch client history";
        }
      )

      /* ===================================================
         UPDATE
      =================================================== */

      .addCase(
        updateClient.fulfilled,
        (state, action) => {
          const updated =
            action.payload?.client ||
            action.payload?.data;

          if (!updated) {
            return;
          }

          state.client =
            updated;

          const index =
            state.clients.findIndex(
              (item) =>
                item._id ===
                updated._id
            );

          if (index !== -1) {
            state.clients[index] =
              updated;
          }
        }
      )

      .addCase(
        updateClient.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to update client";
        }
      )

      /* ===================================================
         DEACTIVATE
      =================================================== */

      .addCase(
        deactivateClient.fulfilled,
        (state, action) => {
          const updated =
            action.payload?.client;

          if (!updated) {
            return;
          }

          state.client =
            updated;

          const index =
            state.clients.findIndex(
              (item) =>
                item._id ===
                updated._id
            );

          if (index !== -1) {
            state.clients[index] =
              updated;
          }
        }
      )

      .addCase(
        deactivateClient.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to deactivate client";
        }
      )

      /* ===================================================
         REACTIVATE
      =================================================== */

      .addCase(
        reactivateClient.fulfilled,
        (state, action) => {
          const updated =
            action.payload?.client;

          if (!updated) {
            return;
          }

          state.client =
            updated;

          const index =
            state.clients.findIndex(
              (item) =>
                item._id ===
                updated._id
            );

          if (index !== -1) {
            state.clients[index] =
              updated;
          }
        }
      )

      .addCase(
        reactivateClient.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to reactivate client";
        }
      )

      /* ===================================================
         DELETE
      =================================================== */

      .addCase(
        deleteClient.fulfilled,
        (state, action) => {
          const deletedId =
            action.meta.arg;

          state.clients =
            state.clients.filter(
              (item) =>
                item._id !==
                deletedId
            );

          if (
            state.total > 0
          ) {
            state.total -= 1;
          }

          if (
            state.client?._id ===
            deletedId
          ) {
            state.client = null;
          }
        }
      )

      .addCase(
        deleteClient.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to delete client";
        }
      );
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearClientError,
  clearClientSuccess,
  clearSelectedClient,
} = clientsSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectClients =
  (state) =>
    state.clients?.clients || [];

export const selectClient =
  (state) =>
    state.clients?.client || null;

export const selectClientsLoading =
  (state) =>
    state.clients?.loading || false;

export const selectClientsError =
  (state) =>
    state.clients?.error || null;

export const selectClientsTotal =
  (state) =>
    state.clients?.total || 0;

/* =========================================================
   REDUCER
========================================================= */

export default clientsSlice.reducer;