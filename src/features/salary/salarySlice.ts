import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import AsyncStorage from "@react-native-async-storage/async-storage";

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://salon-backend-49vk.onrender.com/api";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export type PaymentStatus = "PENDING" | "PAID";

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "UPI"
  | "OTHER";

export interface SalaryStylist {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  specialization?: string;

  salaryType?: "MONTHLY" | "DAILY";

  monthlySalary?: number;
  basicSalary8h?: number;
  overtimeRatePerHour?: number;
  standardWorkingHours?: number;

  status?: "ACTIVE" | "INACTIVE";
}

export interface AttendanceSalary {
  basicSalaryEarned: number;
  overtimeSalary: number;
  totalSalaryEarned: number;

  workedHours: number;
  overtimeHours: number;

  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  totalDays: number;
}

export interface Salary {
  _id: string;

  stylist: SalaryStylist;

  month: string;

  basicSalary: number;
  overtimeSalary: number;

  commission: number;
  bonus: number;

  advance: number;
  deduction: number;

  grossSalary: number;
  netSalary: number;

  paymentStatus: PaymentStatus;

  paymentDate: string | null;

  paymentMethod: PaymentMethod;

  notes?: string;

  attendance?: AttendanceSalary;

  createdAt?: string;
  updatedAt?: string;
}

/*
|--------------------------------------------------------------------------
| SALARY TOTALS
|--------------------------------------------------------------------------
*/

export interface SalaryTotals {
  grossSalary: number;
  netSalary: number;
  paid: number;
  pending: number;
}

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

interface SalaryState {
  salaries: Salary[];

  selectedSalary: Salary | null;

  totals: SalaryTotals;

  loading: boolean;
  generating: boolean;
  paying: boolean;

  error: string | null;

  selectedMonth: string;

  search: string;

  status: "" | PaymentStatus;
}

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState: SalaryState = {
  salaries: [],

  selectedSalary: null,

  totals: {
    grossSalary: 0,
    netSalary: 0,
    paid: 0,
    pending: 0,
  },

  loading: false,
  generating: false,
  paying: false,

  error: null,

  selectedMonth: new Date()
    .toISOString()
    .slice(0, 7),

  search: "",

  status: "",
};

/*
|--------------------------------------------------------------------------
| AUTH TOKEN
|--------------------------------------------------------------------------
*/

const getAuthToken = async (): Promise<string | null> => {
  const possibleKeys = [
    "token",
    "authToken",
    "adminToken",
    "accessToken",
    "jwt",
    "admin_token",
    "auth_token",
    "access_token",
  ];

  for (const key of possibleKeys) {
    try {
      const value =
        await AsyncStorage.getItem(key);

      if (
        value &&
        typeof value === "string" &&
        value.trim().length > 10
      ) {
        return value.trim();
      }
    } catch {
      // Ignore storage error
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FALLBACK - SEARCH STORAGE
  |--------------------------------------------------------------------------
  */

  try {
    const allKeys =
      await AsyncStorage.getAllKeys();

    const tokenKeys = allKeys.filter(
      (key) => {
        const lower = key.toLowerCase();

        return (
          lower.includes("token") ||
          lower.includes("jwt") ||
          lower.includes("auth")
        );
      }
    );

    for (const key of tokenKeys) {
      try {
        const value =
          await AsyncStorage.getItem(key);

        if (!value) continue;

        try {
          const parsed =
            JSON.parse(value);

          if (
            typeof parsed === "string" &&
            parsed.trim()
          ) {
            return parsed.trim();
          }

          if (parsed?.token) {
            return String(parsed.token);
          }

          if (parsed?.accessToken) {
            return String(
              parsed.accessToken
            );
          }

          if (parsed?.authToken) {
            return String(
              parsed.authToken
            );
          }

          if (parsed?.data?.token) {
            return String(
              parsed.data.token
            );
          }
        } catch {
          if (value.trim().length > 10) {
            return value.trim();
          }
        }
      } catch {
        // Ignore
      }
    }
  } catch {
    // Ignore
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| AUTH HEADERS
|--------------------------------------------------------------------------
*/

const getAuthHeaders = async () => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error(
      "Authorization token is required. Please login again."
    );
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/*
|--------------------------------------------------------------------------
| ERROR
|--------------------------------------------------------------------------
*/

const getErrorMessage = (
  error: any,
  fallback: string
) => {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
};

/*
|--------------------------------------------------------------------------
| FETCH SALARIES
|--------------------------------------------------------------------------
|
| GET /api/salaries
|
*/

export const fetchSalaries =
  createAsyncThunk<
    {
      salaries: Salary[];
      totals: SalaryTotals;
    },
    {
      month?: string;
      status?: "" | PaymentStatus;
      search?: string;
    },
    { rejectValue: string }
  >(
    "salary/fetchSalaries",
    async (params, thunkAPI) => {
      try {
        const query =
          new URLSearchParams();

        if (params?.month) {
          query.append(
            "month",
            params.month
          );
        }

        if (params?.status) {
          query.append(
            "status",
            params.status
          );
        }

        if (params?.search?.trim()) {
          query.append(
            "search",
            params.search.trim()
          );
        }

        const queryString =
          query.toString();

        const url =
          `${API_URL}/salaries` +
          (queryString
            ? `?${queryString}`
            : "");

        const headers =
          await getAuthHeaders();

        const response =
          await fetch(url, {
            method: "GET",
            headers,
          });

        const data =
          await response.json();

        if (!response.ok) {
          return thunkAPI.rejectWithValue(
            data?.message ||
              "Failed to fetch salaries"
          );
        }

        return {
          salaries: Array.isArray(
            data?.salaries
          )
            ? data.salaries
            : [],

          totals:
            data?.totals || {
              grossSalary: 0,
              netSalary: 0,
              paid: 0,
              pending: 0,
            },
        };
      } catch (error: any) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Unable to connect to salary server"
          )
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| FETCH SINGLE SALARY
|--------------------------------------------------------------------------
*/

export const fetchSalaryById =
  createAsyncThunk<
    Salary,
    string,
    { rejectValue: string }
  >(
    "salary/fetchSalaryById",
    async (id, thunkAPI) => {
      try {
        const headers =
          await getAuthHeaders();

        const response =
          await fetch(
            `${API_URL}/salaries/${id}`,
            {
              method: "GET",
              headers,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          return thunkAPI.rejectWithValue(
            data?.message ||
              "Failed to fetch salary"
          );
        }

        return (
          data?.salary || data
        );
      } catch (error: any) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Unable to fetch salary"
          )
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| CREATE / GENERATE SALARY
|--------------------------------------------------------------------------
*/

export const createSalary =
  createAsyncThunk<
    Salary,
    {
      stylist: string;
      month: string;

      commission?: number;
      bonus?: number;

      advance?: number;
      deduction?: number;

      paymentMethod?: PaymentMethod;

      notes?: string;
    },
    { rejectValue: string }
  >(
    "salary/createSalary",
    async (payload, thunkAPI) => {
      try {
        const headers =
          await getAuthHeaders();

        const response =
          await fetch(
            `${API_URL}/salaries`,
            {
              method: "POST",

              headers,

              body: JSON.stringify({
                stylist:
                  payload.stylist,

                month:
                  payload.month,

                commission:
                  payload.commission || 0,

                bonus:
                  payload.bonus || 0,

                advance:
                  payload.advance || 0,

                deduction:
                  payload.deduction || 0,

                paymentMethod:
                  payload.paymentMethod ||
                  "CASH",

                notes:
                  payload.notes || "",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          return thunkAPI.rejectWithValue(
            data?.message ||
              "Failed to generate salary"
          );
        }

        return (
          data?.salary || data
        );
      } catch (error: any) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Unable to generate salary"
          )
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| MARK PAID
|--------------------------------------------------------------------------
*/

export const markSalaryPaid =
  createAsyncThunk<
    Salary,
    {
      id: string;
      paymentMethod?: PaymentMethod;
      paymentDate?: string;
    },
    { rejectValue: string }
  >(
    "salary/markSalaryPaid",
    async (payload, thunkAPI) => {
      try {
        const headers =
          await getAuthHeaders();

        const response =
          await fetch(
            `${API_URL}/salaries/${payload.id}/pay`,
            {
              method: "PATCH",

              headers,

              body: JSON.stringify({
                paymentMethod:
                  payload.paymentMethod ||
                  "CASH",

                paymentDate:
                  payload.paymentDate ||
                  new Date().toISOString(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          return thunkAPI.rejectWithValue(
            data?.message ||
              "Failed to mark salary as paid"
          );
        }

        return (
          data?.salary || data
        );
      } catch (error: any) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Unable to update payment status"
          )
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| MARK PENDING
|--------------------------------------------------------------------------
*/

export const markSalaryPending =
  createAsyncThunk<
    Salary,
    string,
    { rejectValue: string }
  >(
    "salary/markSalaryPending",
    async (id, thunkAPI) => {
      try {
        const headers =
          await getAuthHeaders();

        const response =
          await fetch(
            `${API_URL}/salaries/${id}/pending`,
            {
              method: "PATCH",
              headers,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          return thunkAPI.rejectWithValue(
            data?.message ||
              "Failed to mark salary as pending"
          );
        }

        return (
          data?.salary || data
        );
      } catch (error: any) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Unable to update salary status"
          )
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export const deleteSalary =
  createAsyncThunk<
    string,
    string,
    { rejectValue: string }
  >(
    "salary/deleteSalary",
    async (id, thunkAPI) => {
      try {
        const headers =
          await getAuthHeaders();

        const response =
          await fetch(
            `${API_URL}/salaries/${id}`,
            {
              method: "DELETE",
              headers,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          return thunkAPI.rejectWithValue(
            data?.message ||
              "Failed to delete salary"
          );
        }

        return id;
      } catch (error: any) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Unable to delete salary"
          )
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const salarySlice = createSlice({
  name: "salary",

  initialState,

  reducers: {
    setSelectedMonth: (
      state,
      action: PayloadAction<string>
    ) => {
      state.selectedMonth =
        action.payload;
    },

    setSearch: (
      state,
      action: PayloadAction<string>
    ) => {
      state.search =
        action.payload;
    },

    setStatus: (
      state,
      action: PayloadAction<
        "" | PaymentStatus
      >
    ) => {
      state.status =
        action.payload;
    },

    clearSelectedSalary: (
      state
    ) => {
      state.selectedSalary = null;
    },

    clearSalaryError: (
      state
    ) => {
      state.error = null;
    },

    clearSalaries: (
      state
    ) => {
      state.salaries = [];

      state.totals = {
        grossSalary: 0,
        netSalary: 0,
        paid: 0,
        pending: 0,
      };
    },
  },

  extraReducers: (builder) => {
    /*
    |--------------------------------------------------------------------------
    | FETCH
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        fetchSalaries.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchSalaries.fulfilled,
        (state, action) => {
          state.loading = false;

          state.salaries =
            action.payload.salaries;

          state.totals =
            action.payload.totals;

          state.error = null;
        }
      )

      .addCase(
        fetchSalaries.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch salaries";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | SINGLE
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        fetchSalaryById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchSalaryById.fulfilled,
        (state, action) => {
          state.loading = false;

          state.selectedSalary =
            action.payload;

          state.error = null;
        }
      )

      .addCase(
        fetchSalaryById.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch salary";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        createSalary.pending,
        (state) => {
          state.generating = true;
          state.error = null;
        }
      )

      .addCase(
        createSalary.fulfilled,
        (state, action) => {
          state.generating = false;

          const salary =
            action.payload;

          const index =
            state.salaries.findIndex(
              (item) =>
                item._id ===
                salary._id
            );

          if (index >= 0) {
            state.salaries[index] =
              salary;
          } else {
            state.salaries.unshift(
              salary
            );
          }

          state.selectedSalary =
            salary;

          state.error = null;
        }
      )

      .addCase(
        createSalary.rejected,
        (state, action) => {
          state.generating = false;

          state.error =
            action.payload ||
            "Failed to generate salary";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | PAID
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        markSalaryPaid.pending,
        (state) => {
          state.paying = true;
          state.error = null;
        }
      )

      .addCase(
        markSalaryPaid.fulfilled,
        (state, action) => {
          state.paying = false;

          const salary =
            action.payload;

          const index =
            state.salaries.findIndex(
              (item) =>
                item._id ===
                salary._id
            );

          if (index >= 0) {
            state.salaries[index] =
              salary;
          }

          if (
            state.selectedSalary?._id ===
            salary._id
          ) {
            state.selectedSalary =
              salary;
          }

          state.error = null;
        }
      )

      .addCase(
        markSalaryPaid.rejected,
        (state, action) => {
          state.paying = false;

          state.error =
            action.payload ||
            "Failed to mark salary as paid";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | PENDING
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        markSalaryPending.pending,
        (state) => {
          state.paying = true;
          state.error = null;
        }
      )

      .addCase(
        markSalaryPending.fulfilled,
        (state, action) => {
          state.paying = false;

          const salary =
            action.payload;

          const index =
            state.salaries.findIndex(
              (item) =>
                item._id ===
                salary._id
            );

          if (index >= 0) {
            state.salaries[index] =
              salary;
          }

          if (
            state.selectedSalary?._id ===
            salary._id
          ) {
            state.selectedSalary =
              salary;
          }

          state.error = null;
        }
      )

      .addCase(
        markSalaryPending.rejected,
        (state, action) => {
          state.paying = false;

          state.error =
            action.payload ||
            "Failed to mark salary as pending";
        }
      );

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        deleteSalary.fulfilled,
        (state, action) => {
          state.salaries =
            state.salaries.filter(
              (item) =>
                item._id !==
                action.payload
            );

          if (
            state.selectedSalary?._id ===
            action.payload
          ) {
            state.selectedSalary = null;
          }
        }
      )

      .addCase(
        deleteSalary.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to delete salary";
        }
      );
  },
});

/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
*/

export const {
  setSelectedMonth,
  setSearch,
  setStatus,
  clearSelectedSalary,
  clearSalaryError,
  clearSalaries,
} = salarySlice.actions;

/*
|--------------------------------------------------------------------------
| REDUCER
|--------------------------------------------------------------------------
*/

export default salarySlice.reducer;