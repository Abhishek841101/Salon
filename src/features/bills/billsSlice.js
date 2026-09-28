import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/api";

// ======================================================
// GET ALL BILLS
// GET /api/bills
// ======================================================

export const getBills = createAsyncThunk(
  "billing/getBills",
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token;

      const query = new URLSearchParams();

      if (params.search) {
        query.append("search", params.search);
      }

      if (params.page) {
        query.append("page", String(params.page));
      }

      if (params.limit) {
        query.append("limit", String(params.limit));
      }

      if (params.paymentStatus) {
        query.append(
          "paymentStatus",
          params.paymentStatus
        );
      }

      const queryString = query.toString();

      const response = await apiRequest(
        `/bills${queryString ? `?${queryString}` : ""}`,
        {
          method: "GET",
          token,
        }
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch bills"
      );
    }
  }
);

// ======================================================
// GET SINGLE BILL
// GET /api/bills/:id
// ======================================================

export const getBillById = createAsyncThunk(
  "billing/getBillById",
  async (billId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token;

      const response = await apiRequest(
        `/bills/${billId}`,
        {
          method: "GET",
          token,
        }
      );

      return response.bill;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch bill"
      );
    }
  }
);

// ======================================================
// CREATE BILL
// POST /api/bills
// ======================================================

export const createBill = createAsyncThunk(
  "billing/createBill",
  async (billData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token;

      const response = await apiRequest(
        "/bills",
        {
          method: "POST",
          token,
          body: billData,
        }
      );

      return response.bill;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to create bill"
      );
    }
  }
);

// ======================================================
// UPDATE PAYMENT STATUS
// PATCH /api/bills/:id/payment
// ======================================================

export const updatePaymentStatus = createAsyncThunk(
  "billing/updatePaymentStatus",
  async (
    {
      billId,
      paymentStatus,
      paymentMethod,
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth?.token;

      const body = {
        paymentStatus,
      };

      if (paymentMethod !== undefined) {
        body.paymentMethod = paymentMethod;
      }

      const response = await apiRequest(
        `/bills/${billId}/payment`,
        {
          method: "PATCH",
          token,
          body,
        }
      );

      return response.bill;
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to update payment status"
      );
    }
  }
);

// ======================================================
// INITIAL STATE
// ======================================================

const initialState = {
  bills: [],
  selectedBill: null,

  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },

  loading: false,
  creating: false,
  fetchingSingle: false,
  updatingPayment: false,

  error: null,
  successMessage: null,
};

// ======================================================
// SLICE
// ======================================================

const billingSlice = createSlice({
  name: "billing",

  initialState,

  reducers: {
    // ==================================================
    // SET BILLS
    // ==================================================

    setBills: (state, action) => {
      state.bills = action.payload;
    },

    // ==================================================
    // ADD BILL
    // ==================================================

    addBill: (state, action) => {
      state.bills.unshift(action.payload);
    },

    // ==================================================
    // SET SELECTED BILL
    // ==================================================

    setSelectedBill: (state, action) => {
      state.selectedBill = action.payload;
    },

    // ==================================================
    // CLEAR SELECTED BILL
    // ==================================================

    clearSelectedBill: (state) => {
      state.selectedBill = null;
    },

    // ==================================================
    // UPDATE BILL LOCALLY
    // ==================================================

    updateBillLocal: (state, action) => {
      const updatedBill = action.payload;

      const index = state.bills.findIndex(
        (bill) =>
          bill._id === updatedBill._id
      );

      if (index !== -1) {
        state.bills[index] = updatedBill;
      }

      if (
        state.selectedBill?._id ===
        updatedBill._id
      ) {
        state.selectedBill = updatedBill;
      }
    },

    // ==================================================
    // REMOVE BILL
    // ==================================================

    removeBill: (state, action) => {
      const billId = action.payload;

      state.bills = state.bills.filter(
        (bill) => bill._id !== billId
      );

      if (
        state.selectedBill?._id === billId
      ) {
        state.selectedBill = null;
      }
    },

    // ==================================================
    // CLEAR ERROR
    // ==================================================

    clearBillingError: (state) => {
      state.error = null;
    },

    // ==================================================
    // CLEAR SUCCESS
    // ==================================================

    clearBillingSuccess: (state) => {
      state.successMessage = null;
    },

    // ==================================================
    // CLEAR ALL
    // ==================================================

    clearBills: (state) => {
      state.bills = [];
      state.selectedBill = null;

      state.pagination = {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    },
  },

  // ======================================================
  // ASYNC ACTIONS
  // ======================================================

  extraReducers: (builder) => {
    // ==================================================
    // GET BILLS
    // ==================================================

    builder
      .addCase(getBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getBills.fulfilled, (state, action) => {
        state.loading = false;

        state.bills =
          action.payload?.bills || [];

        if (action.payload?.pagination) {
          state.pagination =
            action.payload.pagination;
        }
      })

      .addCase(getBills.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          "Failed to fetch bills";
      });

    // ==================================================
    // GET SINGLE BILL
    // ==================================================

    builder
      .addCase(
        getBillById.pending,
        (state) => {
          state.fetchingSingle = true;
          state.error = null;
        }
      )

      .addCase(
        getBillById.fulfilled,
        (state, action) => {
          state.fetchingSingle = false;

          state.selectedBill =
            action.payload;
        }
      )

      .addCase(
        getBillById.rejected,
        (state, action) => {
          state.fetchingSingle = false;

          state.error =
            action.payload ||
            "Failed to fetch bill";
        }
      );

    // ==================================================
    // CREATE BILL
    // ==================================================

    builder
      .addCase(
        createBill.pending,
        (state) => {
          state.creating = true;
          state.error = null;
          state.successMessage = null;
        }
      )

      .addCase(
        createBill.fulfilled,
        (state, action) => {
          state.creating = false;

          const newBill =
            action.payload;

          state.bills.unshift(
            newBill
          );

          state.selectedBill =
            newBill;

          state.successMessage =
            "Bill created successfully";
        }
      )

      .addCase(
        createBill.rejected,
        (state, action) => {
          state.creating = false;

          state.error =
            action.payload ||
            "Failed to create bill";
        }
      );

    // ==================================================
    // UPDATE PAYMENT
    // ==================================================

    builder
      .addCase(
        updatePaymentStatus.pending,
        (state) => {
          state.updatingPayment = true;
          state.error = null;
          state.successMessage = null;
        }
      )

      .addCase(
        updatePaymentStatus.fulfilled,
        (state, action) => {
          state.updatingPayment = false;

          const updatedBill =
            action.payload;

          const index =
            state.bills.findIndex(
              (bill) =>
                bill._id ===
                updatedBill._id
            );

          if (index !== -1) {
            state.bills[index] =
              updatedBill;
          }

          if (
            state.selectedBill?._id ===
            updatedBill._id
          ) {
            state.selectedBill =
              updatedBill;
          }

          state.successMessage =
            "Payment status updated successfully";
        }
      )

      .addCase(
        updatePaymentStatus.rejected,
        (state, action) => {
          state.updatingPayment = false;

          state.error =
            action.payload ||
            "Failed to update payment status";
        }
      );
  },
});

// ======================================================
// ACTIONS
// ======================================================

export const {
  setBills,
  addBill,
  setSelectedBill,
  clearSelectedBill,
  updateBillLocal,
  removeBill,
  clearBillingError,
  clearBillingSuccess,
  clearBills,
} = billingSlice.actions;

// ======================================================
// SELECTORS
// ======================================================

export const selectBills = (state) =>
  state.billing.bills;

export const selectSelectedBill = (state) =>
  state.billing.selectedBill;

export const selectBillingPagination = (
  state
) => state.billing.pagination;

export const selectBillingLoading = (state) =>
  state.billing.loading;

export const selectBillingCreating = (state) =>
  state.billing.creating;

export const selectBillingFetchingSingle = (
  state
) => state.billing.fetchingSingle;

export const selectBillingUpdatingPayment = (
  state
) => state.billing.updatingPayment;

export const selectBillingError = (state) =>
  state.billing.error;

export const selectBillingSuccess = (state) =>
  state.billing.successMessage;

// ======================================================
// EXPORT REDUCER
// ======================================================

export default billingSlice.reducer;