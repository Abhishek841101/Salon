// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import API_URL from "../../config/api";

// const initialState = {
//   admin: null,
//   token: null,
//   isAuthenticated: false,
//   loading: false,
//   error: null,
// };

// // ========================================
// // ADMIN LOGIN
// // ========================================

// export const loginAdmin = createAsyncThunk(
//   "auth/loginAdmin",

//   async ({ phone, password }, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`${API_URL}/auth/admin-login`, {
//         method: "POST",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         body: JSON.stringify({
//           phone,
//           password,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         return rejectWithValue(
//           data.message || "Login failed"
//         );
//       }

//       return data;
//     } catch (error) {
//       console.error("LOGIN API ERROR:", error);

//       return rejectWithValue(
//         error.message || "Unable to connect to server"
//       );
//     }
//   }
// );

// // ========================================
// // SLICE
// // ========================================

// const authSlice = createSlice({
//   name: "auth",

//   initialState,

//   reducers: {
//     logout: (state) => {
//       state.admin = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       state.loading = false;
//       state.error = null;
//     },

//     clearAuthError: (state) => {
//       state.error = null;
//     },
//   },

//   extraReducers: (builder) => {
//     builder

//       // ========================================
//       // LOGIN PENDING
//       // ========================================

//       .addCase(loginAdmin.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })

//       // ========================================
//       // LOGIN SUCCESS
//       // ========================================

//       .addCase(loginAdmin.fulfilled, (state, action) => {
//         state.loading = false;
//         state.error = null;

//         state.token = action.payload.token;

//         state.admin =
//           action.payload.admin ||
//           action.payload.user ||
//           null;

//         state.isAuthenticated = true;
//       })

//       // ========================================
//       // LOGIN FAILED
//       // ========================================

//       .addCase(loginAdmin.rejected, (state, action) => {
//         state.loading = false;
//         state.isAuthenticated = false;

//         state.error =
//           action.payload || "Login failed";
//       });
//   },
// });

// export const {
//   logout,
//   clearAuthError,
// } = authSlice.actions;

// export default authSlice.reducer;




import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API_URL from "../../config/api";

const initialState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// ========================================
// ADMIN LOGIN
// ========================================

export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",

  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/admin-login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
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
      // SAVE TOKEN
      // ========================================

      await AsyncStorage.setItem(
        "token",
        data.token
      );

      // ========================================
      // SAVE ADMIN USER
      // ========================================

      if (data.user) {
        await AsyncStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      console.log(
        "LOGIN SUCCESS - TOKEN SAVED:",
        true
      );

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
// SLICE
// ========================================

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ========================================
      // LOGIN PENDING
      // ========================================

      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

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
            action.payload.admin ||
            action.payload.user ||
            null;

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

          state.error =
            action.payload ||
            "Login failed";
        }
      );
  },
});

export const {
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;