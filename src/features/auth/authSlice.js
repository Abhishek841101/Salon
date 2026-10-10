import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import API_URL from "../../config/api";

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// ========================================
// LOGIN
// ========================================

export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",

  async (credentials, { rejectWithValue }) => {
    try {
      const {
        phone,
        email,
        password,
      } = credentials || {};

      // ========================================
      // VALIDATION
      // ========================================

      if (
        (!phone?.trim() && !email?.trim()) ||
        !password?.trim()
      ) {
        return rejectWithValue(
          "Email/phone and password are required"
        );
      }

      // ========================================
      // REQUEST BODY
      // ========================================

      const body = {
        password,
      };

      if (phone?.trim()) {
        body.phone = phone.trim();
      } else if (email?.trim()) {
        body.email = email.trim().toLowerCase();
      }

      console.log(
        "LOGIN REQUEST:",
        `${API_URL}/auth/login`
      );

      // ========================================
      // API REQUEST
      // ========================================

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      // ========================================
      // PARSE RESPONSE
      // ========================================

      const data = await response.json();

      console.log(
        "LOGIN RESPONSE:",
        response.status,
        data
      );

      // ========================================
      // API ERROR
      // ========================================

      if (
        !response.ok ||
        !data.success
      ) {
        return rejectWithValue(
          data.message || "Login failed"
        );
      }

      // ========================================
      // TOKEN CHECK
      // ========================================

      if (!data.token) {
        return rejectWithValue(
          "Login successful but authentication token was not received"
        );
      }

      // ========================================
      // USER CHECK
      // ========================================

      if (!data.user) {
        return rejectWithValue(
          "Login successful but user information was not received"
        );
      }

      // ========================================
      // SAVE TOKEN
      // ========================================

      await AsyncStorage.setItem(
        "token",
        data.token
      );

      // ========================================
      // SAVE USER
      // ========================================

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log(
        "LOGIN SUCCESS - TOKEN SAVED:",
        true
      );

      console.log(
        "USER ROLE:",
        data.user.role
      );

      console.log(
        "SUBSCRIPTION:",
        data.user.subscription
      );

      // ========================================
      // RETURN
      // ========================================

      return data;
    } catch (error) {
      console.error(
        "LOGIN API ERROR:",
        error
      );

      return rejectWithValue(
        error?.message ||
          "Unable to connect to server"
      );
    }
  }
);

// ========================================
// RESTORE AUTH SESSION
// ========================================
//
// App close/open hone par:
// token + saved user read karega.
//
// IMPORTANT:
// restoreAuth token ko delete nahi karta.
// Sirf actual logout par token delete hoga.
// ========================================

export const restoreAuth = createAsyncThunk(
  "auth/restoreAuth",

  async (_, { rejectWithValue }) => {
    try {
      const token =
        await AsyncStorage.getItem("token");

      const userString =
        await AsyncStorage.getItem("user");

      if (!token || !userString) {
        return rejectWithValue(
          "No saved session"
        );
      }

      let user;

      try {
        user = JSON.parse(userString);
      } catch (error) {
        console.error(
          "SAVED USER PARSE ERROR:",
          error
        );

        return rejectWithValue(
          "Invalid saved user session"
        );
      }

      if (!user) {
        return rejectWithValue(
          "Invalid saved user session"
        );
      }

      console.log(
        "AUTH RESTORED FROM STORAGE"
      );

      return {
        token,
        user,
      };
    } catch (error) {
      console.error(
        "RESTORE AUTH ERROR:",
        error
      );

      return rejectWithValue(
        "Unable to restore session"
      );
    }
  }
);

// ========================================
// GET CURRENT USER FROM BACKEND
// ========================================
//
// App open hone par latest user/subscription
// DB se refresh karega.
//
// JWT ke subscription data par trust nahi.
// ========================================

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",

  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();

      const token =
        state?.auth?.token ||
        (await AsyncStorage.getItem("token"));

      if (!token) {
        return rejectWithValue(
          "Authentication token not found"
        );
      }

      console.log(
        "FETCH ME:",
        `${API_URL}/auth/me`
      );

      const response = await fetch(
        `${API_URL}/auth/me`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "FETCH ME RESPONSE:",
        response.status,
        data
      );

      // ========================================
      // TOKEN INVALID / EXPIRED
      // ========================================

      if (
        response.status === 401 ||
        data?.code === "TOKEN_EXPIRED" ||
        data?.code === "INVALID_TOKEN"
      ) {
        await AsyncStorage.multiRemove([
          "token",
          "user",
        ]);

        return rejectWithValue(
          "Session expired. Please login again."
        );
      }

      // ========================================
      // OTHER API ERROR
      // ========================================

      if (
        !response.ok ||
        !data.success
      ) {
        return rejectWithValue(
          data.message ||
            "Unable to get current user"
        );
      }

      // ========================================
      // USER CHECK
      // ========================================

      if (!data.user) {
        return rejectWithValue(
          "User information not received"
        );
      }

      // ========================================
      // SAVE FRESH USER
      // ========================================

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log(
        "FRESH USER SAVED"
      );

      console.log(
        "LATEST SUBSCRIPTION:",
        data.user.subscription
      );

      return data;
    } catch (error) {
      console.error(
        "FETCH ME ERROR:",
        error
      );

      /*
       * IMPORTANT:
       *
       * Network error hone par token delete
       * nahi karenge.
       *
       * Isse temporary internet/server problem
       * ki wajah se user logout nahi hoga.
       */

      return rejectWithValue(
        error?.message ||
          "Unable to connect to server"
      );
    }
  }
);

// ========================================
// LOGOUT
// ========================================

export const logoutUser =
  createAsyncThunk(
    "auth/logoutUser",

    async () => {
      await AsyncStorage.multiRemove([
        "token",
        "user",
      ]);

      return true;
    }
  );

// ========================================
// SLICE
// ========================================

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    // ========================================
    // LOGOUT
    // ========================================

    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },

    // ========================================
    // CLEAR ERROR
    // ========================================

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ========================================
      // LOGIN PENDING
      // ========================================

      .addCase(
        loginAdmin.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      // ========================================
      // LOGIN SUCCESS
      // ========================================

      .addCase(
        loginAdmin.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.token =
            action.payload.token;

          state.admin =
            action.payload.user || null;

          state.isAuthenticated = true;
        }
      )

      // ========================================
      // LOGIN FAILED
      // ========================================

      .addCase(
        loginAdmin.rejected,
        (state, action) => {
          state.loading = false;

          state.isAuthenticated = false;
          state.token = null;
          state.admin = null;

          state.error =
            action.payload ||
            "Login failed";
        }
      )

      // ========================================
      // RESTORE SESSION PENDING
      // ========================================

      .addCase(
        restoreAuth.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      // ========================================
      // RESTORE SESSION SUCCESS
      // ========================================

      .addCase(
        restoreAuth.fulfilled,
        (state, action) => {
          state.loading = false;

          state.token =
            action.payload.token;

          state.admin =
            action.payload.user;

          state.isAuthenticated = true;

          state.error = null;
        }
      )

      // ========================================
      // RESTORE SESSION FAILED
      // ========================================

      .addCase(
        restoreAuth.rejected,
        (state) => {
          state.loading = false;

          /*
           * No saved session is NOT an error.
           * User simply needs to login.
           */

          state.token = null;
          state.admin = null;
          state.isAuthenticated = false;
        }
      )

      // ========================================
      // FETCH ME PENDING
      // ========================================

      .addCase(
        fetchMe.pending,
        (state) => {
          state.error = null;
        }
      )

      // ========================================
      // FETCH ME SUCCESS
      // ========================================

      .addCase(
        fetchMe.fulfilled,
        (state, action) => {
          state.loading = false;

          state.admin =
            action.payload.user;

          state.isAuthenticated = true;

          state.error = null;
        }
      )

      // ========================================
      // FETCH ME FAILED
      // ========================================

      .addCase(
        fetchMe.rejected,
        (state, action) => {
          state.loading = false;

          /*
           * IMPORTANT:
           *
           * Server/network temporarily unavailable
           * hone par existing token/session ko
           * remove nahi karna.
           *
           * Agar 401/token expired hai to fetchMe
           * already AsyncStorage clear kar chuka hai.
           */

          state.error =
            action.payload ||
            "Session verification failed";

          /*
           * If token still exists, keep user logged in.
           */
        }
      )

      // ========================================
      // LOGOUT SUCCESS
      // ========================================

      .addCase(
        logoutUser.fulfilled,
        (state) => {
          state.admin = null;
          state.token = null;
          state.isAuthenticated = false;
          state.loading = false;
          state.error = null;
        }
      );
  },
});

// ========================================
// ACTIONS
// ========================================

export const {
  logout,
  clearAuthError,
} = authSlice.actions;

// ========================================
// SELECTORS
// ========================================

export const selectAuth =
  (state) => state.auth;

export const selectCurrentUser =
  (state) => state.auth.admin;

export const selectToken =
  (state) => state.auth.token;

export const selectIsAuthenticated =
  (state) => state.auth.isAuthenticated;

export const selectSubscription =
  (state) =>
    state.auth.admin?.subscription || null;

export const selectUserRole =
  (state) =>
    state.auth.admin?.role || null;

// ========================================
// DEFAULT EXPORT
// ========================================

export default authSlice.reducer;