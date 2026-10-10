
import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { RootState } from "../../store";

import API_URL from "../../config/api";

// ========================================
// TYPES
// ========================================

export type ExpenseCategory =
  | "Staff Salary"
  | "Product Purchase"
  | "Rent"
  | "Electricity"
  | "Maintenance"
  | "Marketing"
  | "Water"
  | "Internet"
  | "Equipment"
  | "Other";

export type ExpensePaymentMethod =
  | "Cash"
  | "UPI"
  | "Card"
  | "Bank Transfer"
  | "Other";

export type ExpenseStatus = "Paid" | "Pending";

export type ExpensePeriod =
  | "today"
  | "7days"
  | "month"
  | "year";

export interface Expense {
  _id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: ExpensePaymentMethod;
  paidTo: string;
  expenseDate: string;
  notes: string;
  status: ExpenseStatus;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpensePayload {
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod?: ExpensePaymentMethod;
  paidTo?: string;
  expenseDate?: string;
  notes?: string;
  status?: ExpenseStatus;
}

export interface UpdateExpensePayload {
  id: string;
  data: Partial<CreateExpensePayload>;
}

export interface CategoryExpenseSummary {
  category: string;
  total: number;
  count: number;
}

export interface PaymentExpenseSummary {
  paymentMethod: string;
  total: number;
  count: number;
}

export interface ExpenseSummary {
  success: boolean;
  period: string;
  from: string;
  to: string;
  totalExpense: number;
  totalExpenses: number;
  paidExpense: number;
  pendingExpense: number;
  byCategory: CategoryExpenseSummary[];
  byPaymentMethod: PaymentExpenseSummary[];
}

// ========================================
// API RESPONSE TYPES
// ========================================

interface ExpensesResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  totalAmount: number;
  expenses: Expense[];
}

interface ExpenseResponse {
  success: boolean;
  message?: string;
  expense: Expense;
}

interface DeleteExpenseResponse {
  success: boolean;
  message: string;
}

interface SummaryResponse extends ExpenseSummary {}

// ========================================
// STATE
// ========================================

interface ExpenseState {
  expenses: Expense[];
  selectedExpense: Expense | null;
  summary: ExpenseSummary | null;

  totalAmount: number;
  totalExpenses: number;

  currentPage: number;
  totalPages: number;

  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  summaryLoading: boolean;

  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  summaryError: string | null;
}

// ========================================
// INITIAL STATE
// ========================================

const initialState: ExpenseState = {
  expenses: [],
  selectedExpense: null,
  summary: null,

  totalAmount: 0,
  totalExpenses: 0,

  currentPage: 1,
  totalPages: 1,

  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  summaryLoading: false,

  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  summaryError: null,
};

// ========================================
// API HELPER
// ========================================

const getErrorMessage = (
  data: any,
  fallback: string
): string => {
  return (
    data?.message ||
    data?.error ||
    fallback
  );
};

// ========================================
// AUTH HEADER HELPER
// ========================================

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");

  console.log(
    "EXPENSE AUTH TOKEN:",
    token ? "FOUND" : "MISSING"
  );

  return {
    Accept: "application/json",
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

// ========================================
// GET ALL EXPENSES
// GET /api/expenses
// ========================================

export const fetchExpenses = createAsyncThunk<
  ExpensesResponse,
  {
    category?: string;
    status?: string;
    active?: boolean;
    from?: string;
    to?: string;
    search?: string;
    page?: number;
    limit?: number;
  } | undefined,
  { rejectValue: string }
>(
  "expense/fetchExpenses",

  async (params = {}, thunkAPI) => {
    try {
      const query = new URLSearchParams();

      if (params.category) {
        query.append(
          "category",
          params.category
        );
      }

      if (params.status) {
        query.append(
          "status",
          params.status
        );
      }

      if (params.active !== undefined) {
        query.append(
          "active",
          String(params.active)
        );
      }

      if (params.from) {
        query.append(
          "from",
          params.from
        );
      }

      if (params.to) {
        query.append(
          "to",
          params.to
        );
      }

      if (params.search) {
        query.append(
          "search",
          params.search
        );
      }

      if (params.page) {
        query.append(
          "page",
          String(params.page)
        );
      }

      if (params.limit) {
        query.append(
          "limit",
          String(params.limit)
        );
      }

      const url =
        `${API_URL}/expenses` +
        (
          query.toString()
            ? `?${query.toString()}`
            : ""
        );

      console.log(
        "EXPENSE API REQUEST:",
        url
      );

      const headers =
        await getAuthHeaders();

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Failed to fetch expenses"
          )
        );
      }

      return data;
    } catch (error: any) {
      console.error(
        "GET EXPENSES ERROR:",
        error
      );

      return thunkAPI.rejectWithValue(
        error?.message ||
          "Failed to fetch expenses"
      );
    }
  }
);

// ========================================
// GET SINGLE EXPENSE
// GET /api/expenses/:id
// ========================================

export const fetchExpenseById =
  createAsyncThunk<
    ExpenseResponse,
    string,
    { rejectValue: string }
  >(
    "expense/fetchExpenseById",

    async (id, thunkAPI) => {
      try {
        const url =
          `${API_URL}/expenses/${id}`;

        console.log(
          "GET EXPENSE REQUEST:",
          url
        );

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
          throw new Error(
            getErrorMessage(
              data,
              "Failed to fetch expense"
            )
          );
        }

        return data;
      } catch (error: any) {
        console.error(
          "GET EXPENSE ERROR:",
          error
        );

        return thunkAPI.rejectWithValue(
          error?.message ||
            "Failed to fetch expense"
        );
      }
    }
  );

// ========================================
// CREATE EXPENSE
// POST /api/expenses
// ========================================

export const createExpense =
  createAsyncThunk<
    ExpenseResponse,
    CreateExpensePayload,
    { rejectValue: string }
  >(
    "expense/createExpense",

    async (payload, thunkAPI) => {
      try {
        console.log(
          "CREATE EXPENSE REQUEST:",
          payload
        );

        const response =
          await fetch(
            `${API_URL}/expenses`,
            {
              method: "POST",

              headers:
                await getAuthHeaders(),

              body: JSON.stringify({
                title:
                  payload.title.trim(),

                category:
                  payload.category,

                amount:
                  Number(payload.amount),

                paymentMethod:
                  payload.paymentMethod ||
                  "Cash",

                paidTo:
                  payload.paidTo?.trim() ||
                  "",

                expenseDate:
                  payload.expenseDate,

                notes:
                  payload.notes?.trim() ||
                  "",

                status:
                  payload.status ||
                  "Paid",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              "Failed to create expense"
            )
          );
        }

        return data;
      } catch (error: any) {
        console.error(
          "CREATE EXPENSE ERROR:",
          error
        );

        return thunkAPI.rejectWithValue(
          error?.message ||
            "Failed to create expense"
        );
      }
    }
  );

// ========================================
// UPDATE EXPENSE
// PATCH /api/expenses/:id
// ========================================

export const updateExpense =
  createAsyncThunk<
    ExpenseResponse,
    UpdateExpensePayload,
    { rejectValue: string }
  >(
    "expense/updateExpense",

    async ({ id, data }, thunkAPI) => {
      try {
        console.log(
          "UPDATE EXPENSE REQUEST:",
          id,
          data
        );

        const response =
          await fetch(
            `${API_URL}/expenses/${id}`,
            {
              method: "PATCH",

              headers:
                await getAuthHeaders(),

              body: JSON.stringify(data),
            }
          );

        const responseData =
          await response.json();

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              responseData,
              "Failed to update expense"
            )
          );
        }

        return responseData;
      } catch (error: any) {
        console.error(
          "UPDATE EXPENSE ERROR:",
          error
        );

        return thunkAPI.rejectWithValue(
          error?.message ||
            "Failed to update expense"
        );
      }
    }
  );

// ========================================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ========================================

export const deleteExpense =
  createAsyncThunk<
    DeleteExpenseResponse & {
      id: string;
    },
    string,
    { rejectValue: string }
  >(
    "expense/deleteExpense",

    async (id, thunkAPI) => {
      try {
        console.log(
          "DELETE EXPENSE REQUEST:",
          id
        );

        const response =
          await fetch(
            `${API_URL}/expenses/${id}`,
            {
              method: "DELETE",

              headers:
                await getAuthHeaders(),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              "Failed to delete expense"
            )
          );
        }

        return {
          ...data,
          id,
        };
      } catch (error: any) {
        console.error(
          "DELETE EXPENSE ERROR:",
          error
        );

        return thunkAPI.rejectWithValue(
          error?.message ||
            "Failed to delete expense"
        );
      }
    }
  );

// ========================================
// GET EXPENSE SUMMARY
// GET /api/expenses/summary
// ========================================

export const fetchExpenseSummary =
  createAsyncThunk<
    SummaryResponse,
    {
      period?: ExpensePeriod;
      from?: string;
      to?: string;
    } | undefined,
    { rejectValue: string }
  >(
    "expense/fetchExpenseSummary",

    async (params = {}, thunkAPI) => {
      try {
        const query =
          new URLSearchParams();

        if (params.period) {
          query.append(
            "period",
            params.period
          );
        }

        if (params.from) {
          query.append(
            "from",
            params.from
          );
        }

        if (params.to) {
          query.append(
            "to",
            params.to
          );
        }

        const url =
          `${API_URL}/expenses/summary` +
          (
            query.toString()
              ? `?${query.toString()}`
              : ""
          );

        console.log(
          "EXPENSE SUMMARY REQUEST:",
          url
        );

        const response =
          await fetch(url, {
            method: "GET",

            headers:
              await getAuthHeaders(),
          });

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              "Failed to fetch expense summary"
            )
          );
        }

        return data;
      } catch (error: any) {
        console.error(
          "EXPENSE SUMMARY ERROR:",
          error
        );

        return thunkAPI.rejectWithValue(
          error?.message ||
            "Failed to fetch expense summary"
        );
      }
    }
  );

// ========================================
// SLICE
// ========================================

const expenseSlice = createSlice({
  name: "expense",

  initialState,

  reducers: {
    clearExpenseError: (
      state
    ) => {
      state.error = null;
    },

    clearCreateExpenseError: (
      state
    ) => {
      state.createError = null;
    },

    clearUpdateExpenseError: (
      state
    ) => {
      state.updateError = null;
    },

    clearDeleteExpenseError: (
      state
    ) => {
      state.deleteError = null;
    },

    clearExpenseSummaryError: (
      state
    ) => {
      state.summaryError = null;
    },

    clearSelectedExpense: (
      state
    ) => {
      state.selectedExpense = null;
    },

    resetExpenseState: (
      state
    ) => {
      state.expenses = [];
      state.selectedExpense = null;
      state.summary = null;

      state.totalAmount = 0;
      state.totalExpenses = 0;

      state.currentPage = 1;
      state.totalPages = 1;

      state.loading = false;
      state.creating = false;
      state.updating = false;
      state.deleting = false;
      state.summaryLoading = false;

      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.summaryError = null;
    },
  },

  extraReducers: (builder) => {

    // ========================================
    // GET EXPENSES
    // ========================================

    builder

      .addCase(
        fetchExpenses.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchExpenses.fulfilled,
        (
          state,
          action: PayloadAction<ExpensesResponse>
        ) => {
          state.loading = false;

          state.expenses =
            action.payload.expenses ||
            [];

          state.totalAmount =
            Number(
              action.payload.totalAmount ||
                0
            );

          state.totalExpenses =
            Number(
              action.payload.total ||
                0
            );

          state.currentPage =
            Number(
              action.payload.page ||
                1
            );

          state.totalPages =
            Math.max(
              Math.ceil(
                Number(
                  action.payload.total ||
                    0
                ) /
                  Number(
                    action.payload.limit ||
                      50
                  )
              ),
              1
            );

          state.error = null;
        }
      )

      .addCase(
        fetchExpenses.rejected,
        (
          state,
          action
        ) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch expenses";
        }
      );

    // ========================================
    // GET SINGLE EXPENSE
    // ========================================

    builder

      .addCase(
        fetchExpenseById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchExpenseById.fulfilled,
        (
          state,
          action
        ) => {
          state.loading = false;

          state.selectedExpense =
            action.payload.expense;

          state.error = null;
        }
      )

      .addCase(
        fetchExpenseById.rejected,
        (
          state,
          action
        ) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch expense";
        }
      );

    // ========================================
    // CREATE EXPENSE
    // ========================================

    builder

      .addCase(
        createExpense.pending,
        (state) => {
          state.creating = true;
          state.createError = null;
        }
      )

      .addCase(
        createExpense.fulfilled,
        (
          state,
          action
        ) => {
          state.creating = false;
          state.createError = null;

          if (
            action.payload.expense
          ) {
            state.expenses.unshift(
              action.payload.expense
            );

            state.totalAmount +=
              Number(
                action.payload.expense
                  .amount || 0
              );

            state.totalExpenses += 1;
          }
        }
      )

      .addCase(
        createExpense.rejected,
        (
          state,
          action
        ) => {
          state.creating = false;

          state.createError =
            action.payload ||
            "Failed to create expense";
        }
      );

    // ========================================
    // UPDATE EXPENSE
    // ========================================

    builder

      .addCase(
        updateExpense.pending,
        (state) => {
          state.updating = true;
          state.updateError = null;
        }
      )

      .addCase(
        updateExpense.fulfilled,
        (
          state,
          action
        ) => {
          state.updating = false;
          state.updateError = null;

          const updated =
            action.payload.expense;

          if (!updated) {
            return;
          }

          const index =
            state.expenses.findIndex(
              (item) =>
                item._id ===
                updated._id
            );

          if (index !== -1) {
            state.expenses[index] =
              updated;
          }

          if (
            state.selectedExpense?._id ===
            updated._id
          ) {
            state.selectedExpense =
              updated;
          }

          state.totalAmount =
            state.expenses.reduce(
              (
                total,
                item
              ) =>
                total +
                Number(
                  item.amount || 0
                ),
              0
            );
        }
      )

      .addCase(
        updateExpense.rejected,
        (
          state,
          action
        ) => {
          state.updating = false;

          state.updateError =
            action.payload ||
            "Failed to update expense";
        }
      );

    // ========================================
    // DELETE EXPENSE
    // ========================================

    builder

      .addCase(
        deleteExpense.pending,
        (state) => {
          state.deleting = true;
          state.deleteError = null;
        }
      )

      .addCase(
        deleteExpense.fulfilled,
        (
          state,
          action
        ) => {
          state.deleting = false;
          state.deleteError = null;

          const deleted =
            state.expenses.find(
              (item) =>
                item._id ===
                action.payload.id
            );

          if (deleted) {
            state.totalAmount -=
              Number(
                deleted.amount || 0
              );

            state.totalExpenses =
              Math.max(
                state.totalExpenses - 1,
                0
              );
          }

          state.expenses =
            state.expenses.filter(
              (item) =>
                item._id !==
                action.payload.id
            );

          if (
            state.selectedExpense?._id ===
            action.payload.id
          ) {
            state.selectedExpense =
              null;
          }
        }
      )

      .addCase(
        deleteExpense.rejected,
        (
          state,
          action
        ) => {
          state.deleting = false;

          state.deleteError =
            action.payload ||
            "Failed to delete expense";
        }
      );

    // ========================================
    // EXPENSE SUMMARY
    // ========================================

    builder

      .addCase(
        fetchExpenseSummary.pending,
        (state) => {
          state.summaryLoading = true;
          state.summaryError = null;
        }
      )

      .addCase(
        fetchExpenseSummary.fulfilled,
        (
          state,
          action
        ) => {
          state.summaryLoading = false;

          state.summary =
            action.payload;

          state.summaryError = null;
        }
      )

      .addCase(
        fetchExpenseSummary.rejected,
        (
          state,
          action
        ) => {
          state.summaryLoading = false;

          state.summaryError =
            action.payload ||
            "Failed to fetch expense summary";
        }
      );
  },
});

// ========================================
// ACTIONS
// ========================================

export const {
  clearExpenseError,
  clearCreateExpenseError,
  clearUpdateExpenseError,
  clearDeleteExpenseError,
  clearExpenseSummaryError,
  clearSelectedExpense,
  resetExpenseState,
} = expenseSlice.actions;

// ========================================
// SELECTORS
// ========================================

export const selectExpenses = (
  state: RootState
) =>
  state.expense?.expenses || [];

export const selectSelectedExpense = (
  state: RootState
) =>
  state.expense?.selectedExpense ||
  null;

export const selectExpenseSummary = (
  state: RootState
) =>
  state.expense?.summary || null;

export const selectExpenseTotal = (
  state: RootState
) =>
  state.expense?.totalAmount || 0;

export const selectExpenseCount = (
  state: RootState
) =>
  state.expense?.totalExpenses || 0;

export const selectExpenseLoading = (
  state: RootState
) =>
  state.expense?.loading || false;

export const selectExpenseCreating = (
  state: RootState
) =>
  state.expense?.creating || false;

export const selectExpenseUpdating = (
  state: RootState
) =>
  state.expense?.updating || false;

export const selectExpenseDeleting = (
  state: RootState
) =>
  state.expense?.deleting || false;

export const selectExpenseSummaryLoading = (
  state: RootState
) =>
  state.expense?.summaryLoading ||
  false;

export const selectExpenseError = (
  state: RootState
) =>
  state.expense?.error || null;

export const selectExpenseSummaryError = (
  state: RootState
) =>
  state.expense?.summaryError ||
  null;

// ========================================
// DEFAULT EXPORT
// ========================================

export default expenseSlice.reducer;