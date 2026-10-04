import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://salon-backend-49vk.onrender.com/api";

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

export interface SalaryTotals {
  grossSalary: number;
  netSalary: number;
  paid: number;
  pending: number;
}

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

  selectedMonth: new Date().toISOString().slice(0, 7),

  search: "",

  status: "",
};

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

const getErrorMessage = (error: any, fallback: string) => {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
};

/*
|--------------------------------------------------------------------------
| GET SALARIES
|--------------------------------------------------------------------------
*/

export const fetchSalaries = createAsyncThunk<
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
>("salary/fetchSalaries", async (params, thunkAPI) => {
  try {
    const query = new URLSearchParams();

    if (params.month) {
      query.append("month", params.month);
    }

    if (params.status) {
      query.append("status", params.status);
    }

    if (params.search?.trim()) {
      query.append("search", params.search.trim());
    }

    const url = `${API_URL}/salaries${
      query.toString() ? `?${query.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return thunkAPI.rejectWithValue(
        data?.message || "Failed to fetch salaries"
      );
    }

    return {
      salaries: Array.isArray(data?.salaries) ? data.salaries : [],
      totals: data?.totals || {
        grossSalary: 0,
        netSalary: 0,
        paid: 0,
        pending: 0,
      },
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Unable to connect to salary server")
    );
  }
});

/*
|--------------------------------------------------------------------------
| GET SINGLE SALARY
|--------------------------------------------------------------------------
*/

export const fetchSalaryById = createAsyncThunk<
  Salary,
  string,
  { rejectValue: string }
>("salary/fetchSalaryById", async (id, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/salaries/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return thunkAPI.rejectWithValue(
        data?.message || "Failed to fetch salary"
      );
    }

    return data?.salary || data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Unable to fetch salary")
    );
  }
});

/*
|--------------------------------------------------------------------------
| CREATE / GENERATE SALARY
|--------------------------------------------------------------------------
*/

export const createSalary = createAsyncThunk<
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
>("salary/createSalary", async (payload, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/salaries`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stylist: payload.stylist,
        month: payload.month,

        commission: payload.commission || 0,
        bonus: payload.bonus || 0,

        advance: payload.advance || 0,
        deduction: payload.deduction || 0,

        paymentMethod: payload.paymentMethod || "CASH",

        notes: payload.notes || "",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return thunkAPI.rejectWithValue(
        data?.message || "Failed to generate salary"
      );
    }

    return data?.salary || data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Unable to generate salary")
    );
  }
});

/*
|--------------------------------------------------------------------------
| MARK SALARY PAID
|--------------------------------------------------------------------------
*/

export const markSalaryPaid = createAsyncThunk<
  Salary,
  {
    id: string;
    paymentMethod?: PaymentMethod;
    paymentDate?: string;
  },
  { rejectValue: string }
>("salary/markSalaryPaid", async (payload, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/salaries/${payload.id}/pay`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentMethod: payload.paymentMethod || "CASH",
        paymentDate: payload.paymentDate || new Date().toISOString(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return thunkAPI.rejectWithValue(
        data?.message || "Failed to mark salary as paid"
      );
    }

    return data?.salary || data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Unable to update payment status")
    );
  }
});

/*
|--------------------------------------------------------------------------
| MARK SALARY PENDING
|--------------------------------------------------------------------------
*/

export const markSalaryPending = createAsyncThunk<
  Salary,
  string,
  { rejectValue: string }
>("salary/markSalaryPending", async (id, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/salaries/${id}/pending`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return thunkAPI.rejectWithValue(
        data?.message || "Failed to mark salary as pending"
      );
    }

    return data?.salary || data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Unable to update salary status")
    );
  }
});

/*
|--------------------------------------------------------------------------
| DELETE SALARY
|--------------------------------------------------------------------------
*/

export const deleteSalary = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("salary/deleteSalary", async (id, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/salaries/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return thunkAPI.rejectWithValue(
        data?.message || "Failed to delete salary"
      );
    }

    return id;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Unable to delete salary")
    );
  }
});

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const salarySlice = createSlice({
  name: "salary",

  initialState,

  reducers: {
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },

    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },

    setStatus: (
      state,
      action: PayloadAction<"" | PaymentStatus>
    ) => {
      state.status = action.payload;
    },

    clearSelectedSalary: (state) => {
      state.selectedSalary = null;
    },

    clearSalaryError: (state) => {
      state.error = null;
    },

    clearSalaries: (state) => {
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
    | Fetch Salaries
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(fetchSalaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchSalaries.fulfilled, (state, action) => {
        state.loading = false;

        state.salaries = action.payload.salaries;

        state.totals = action.payload.totals;

        state.error = null;
      })

      .addCase(fetchSalaries.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || "Failed to fetch salaries";
      });

    /*
    |--------------------------------------------------------------------------
    | Fetch Single Salary
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(fetchSalaryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchSalaryById.fulfilled, (state, action) => {
        state.loading = false;

        state.selectedSalary = action.payload;

        state.error = null;
      })

      .addCase(fetchSalaryById.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload || "Failed to fetch salary";
      });

    /*
    |--------------------------------------------------------------------------
    | Create Salary
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(createSalary.pending, (state) => {
        state.generating = true;
        state.error = null;
      })

      .addCase(createSalary.fulfilled, (state, action) => {
        state.generating = false;

        const newSalary = action.payload;

        const existingIndex = state.salaries.findIndex(
          (salary) => salary._id === newSalary._id
        );

        if (existingIndex >= 0) {
          state.salaries[existingIndex] = newSalary;
        } else {
          state.salaries.unshift(newSalary);
        }

        state.selectedSalary = newSalary;

        state.error = null;
      })

      .addCase(createSalary.rejected, (state, action) => {
        state.generating = false;

        state.error =
          action.payload || "Failed to generate salary";
      });

    /*
    |--------------------------------------------------------------------------
    | Mark Paid
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(markSalaryPaid.pending, (state) => {
        state.paying = true;
        state.error = null;
      })

      .addCase(markSalaryPaid.fulfilled, (state, action) => {
        state.paying = false;

        const updatedSalary = action.payload;

        const index = state.salaries.findIndex(
          (salary) => salary._id === updatedSalary._id
        );

        if (index >= 0) {
          state.salaries[index] = updatedSalary;
        }

        if (
          state.selectedSalary?._id === updatedSalary._id
        ) {
          state.selectedSalary = updatedSalary;
        }

        state.error = null;
      })

      .addCase(markSalaryPaid.rejected, (state, action) => {
        state.paying = false;

        state.error =
          action.payload || "Failed to mark salary as paid";
      });

    /*
    |--------------------------------------------------------------------------
    | Mark Pending
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(markSalaryPending.pending, (state) => {
        state.paying = true;
        state.error = null;
      })

      .addCase(markSalaryPending.fulfilled, (state, action) => {
        state.paying = false;

        const updatedSalary = action.payload;

        const index = state.salaries.findIndex(
          (salary) => salary._id === updatedSalary._id
        );

        if (index >= 0) {
          state.salaries[index] = updatedSalary;
        }

        if (
          state.selectedSalary?._id === updatedSalary._id
        ) {
          state.selectedSalary = updatedSalary;
        }

        state.error = null;
      })

      .addCase(markSalaryPending.rejected, (state, action) => {
        state.paying = false;

        state.error =
          action.payload || "Failed to mark salary as pending";
      });

    /*
    |--------------------------------------------------------------------------
    | Delete Salary
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(deleteSalary.fulfilled, (state, action) => {
        state.salaries = state.salaries.filter(
          (salary) => salary._id !== action.payload
        );

        if (
          state.selectedSalary?._id === action.payload
        ) {
          state.selectedSalary = null;
        }
      })

      .addCase(deleteSalary.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to delete salary";
      });
  },
});

export const {
  setSelectedMonth,
  setSearch,
  setStatus,
  clearSelectedSalary,
  clearSalaryError,
  clearSalaries,
} = salarySlice.actions;

export default salarySlice.reducer;