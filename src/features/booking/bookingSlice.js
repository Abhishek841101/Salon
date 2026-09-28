import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/api";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

const getBookingFromResponse = (response) => {
  if (!response) return null;

  if (response.booking) {
    return response.booking;
  }

  if (response.data && !Array.isArray(response.data)) {
    return response.data;
  }

  if (response._id) {
    return response;
  }

  return null;
};

const getBookingsFromResponse = (response) => {
  if (!response) {
    return [];
  }

  // Backend directly returns array
  if (Array.isArray(response)) {
    return response;
  }

  // { bookings: [...] }
  if (Array.isArray(response.bookings)) {
    return response.bookings;
  }

  // { data: [...] }
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // { result: [...] }
  if (Array.isArray(response.result)) {
    return response.result;
  }

  // { appointments: [...] }
  if (Array.isArray(response.appointments)) {
    return response.appointments;
  }

  return [];
};

/* =========================================================
   GET ALL BOOKINGS
   GET /api/bookings
========================================================= */

export const getBookings = createAsyncThunk(
  "booking/getBookings",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token;

      const response = await apiRequest("/bookings", {
        method: "GET",
        token,
      });

      console.log(
        "🔥 GET BOOKINGS RAW RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const bookings = getBookingsFromResponse(response);

      console.log(
        "🔥 FINAL BOOKINGS FROM API:",
        JSON.stringify(bookings, null, 2)
      );

      return bookings;
    } catch (error) {
      console.error("❌ GET BOOKINGS ERROR:", error);

      return rejectWithValue(
        error?.message || "Failed to fetch bookings"
      );
    }
  }
);

/* =========================================================
   GET SINGLE BOOKING
   GET /api/bookings/:id
========================================================= */

export const getBookingById = createAsyncThunk(
  "booking/getBookingById",
  async (bookingId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token;

      const response = await apiRequest(
        `/bookings/${bookingId}`,
        {
          method: "GET",
          token,
        }
      );

      console.log(
        "🔥 GET BOOKING RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      return getBookingFromResponse(response);
    } catch (error) {
      console.error("❌ GET BOOKING ERROR:", error);

      return rejectWithValue(
        error?.message || "Failed to fetch booking"
      );
    }
  }
);

/* =========================================================
   CREATE BOOKING
   POST /api/bookings
========================================================= */

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (
    bookingData,
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth?.token;

      console.log(
        "🔥 CREATE BOOKING DATA:",
        JSON.stringify(bookingData, null, 2)
      );

      const response = await apiRequest(
        "/bookings",
        {
          method: "POST",
          token,
          body: bookingData,
        }
      );

      console.log(
        "🔥 CREATE BOOKING RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const booking =
        getBookingFromResponse(response);

      if (!booking) {
        throw new Error(
          "Booking created but booking data was not returned by server"
        );
      }

      return booking;
    } catch (error) {
      console.error(
        "❌ CREATE BOOKING ERROR:",
        error
      );

      return rejectWithValue(
        error?.message || "Failed to create booking"
      );
    }
  }
);

/* =========================================================
   CONFIRM BOOKING
   PATCH /api/bookings/:id/confirm
========================================================= */

export const confirmBooking = createAsyncThunk(
  "booking/confirmBooking",
  async (
    bookingId,
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth?.token;

      console.log(
        "🔥 CONFIRM BOOKING ID:",
        bookingId
      );

      const response = await apiRequest(
        `/bookings/${bookingId}/confirm`,
        {
          method: "PATCH",
          token,
        }
      );

      console.log(
        "🔥 CONFIRM BOOKING RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const booking =
        getBookingFromResponse(response);

      if (!booking) {
        throw new Error(
          "Booking confirmed but updated booking was not returned"
        );
      }

      return booking;
    } catch (error) {
      console.error(
        "❌ CONFIRM BOOKING ERROR:",
        error
      );

      return rejectWithValue(
        error?.message ||
          "Failed to confirm booking"
      );
    }
  }
);

/* =========================================================
   COMPLETE BOOKING
   PATCH /api/bookings/:id/complete
========================================================= */

export const completeBooking = createAsyncThunk(
  "booking/completeBooking",
  async (
    bookingId,
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth?.token;

      const response = await apiRequest(
        `/bookings/${bookingId}/complete`,
        {
          method: "PATCH",
          token,
        }
      );

      console.log(
        "🔥 COMPLETE BOOKING RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const booking =
        getBookingFromResponse(response);

      if (!booking) {
        throw new Error(
          "Booking completed but updated booking was not returned"
        );
      }

      return booking;
    } catch (error) {
      console.error(
        "❌ COMPLETE BOOKING ERROR:",
        error
      );

      return rejectWithValue(
        error?.message ||
          "Failed to complete booking"
      );
    }
  }
);

/* =========================================================
   CANCEL BOOKING
   PATCH /api/bookings/:id/cancel
========================================================= */

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async (
    { bookingId, reason = "" },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth?.token;

      const response = await apiRequest(
        `/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          token,
          body: {
            cancellationReason: reason,
          },
        }
      );

      console.log(
        "🔥 CANCEL BOOKING RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const booking =
        getBookingFromResponse(response);

      if (!booking) {
        throw new Error(
          "Booking cancelled but updated booking was not returned"
        );
      }

      return booking;
    } catch (error) {
      console.error(
        "❌ CANCEL BOOKING ERROR:",
        error
      );

      return rejectWithValue(
        error?.message ||
          "Failed to cancel booking"
      );
    }
  }
);

/* =========================================================
   UPDATE BOOKING
   PUT /api/bookings/:id
========================================================= */

export const updateBooking = createAsyncThunk(
  "booking/updateBooking",
  async (
    { bookingId, data },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth?.token;

      const response = await apiRequest(
        `/bookings/${bookingId}`,
        {
          method: "PUT",
          token,
          body: data,
        }
      );

      console.log(
        "🔥 UPDATE BOOKING RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const booking =
        getBookingFromResponse(response);

      if (!booking) {
        throw new Error(
          "Booking updated but updated booking was not returned"
        );
      }

      return booking;
    } catch (error) {
      console.error(
        "❌ UPDATE BOOKING ERROR:",
        error
      );

      return rejectWithValue(
        error?.message ||
          "Failed to update booking"
      );
    }
  }
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  bookings: [],
  selectedBooking: null,

  loading: false,
  creating: false,
  updating: false,
  confirming: false,
  completing: false,
  cancelling: false,

  error: null,
  successMessage: null,
};

/* =========================================================
   SLICE
========================================================= */

const bookingSlice = createSlice({
  name: "booking",

  initialState,

  reducers: {
    /* SET BOOKINGS */

    setBookings: (state, action) => {
      state.bookings =
        Array.isArray(action.payload)
          ? action.payload
          : [];
    },

    /* ADD BOOKING */

    addBooking: (state, action) => {
      if (action.payload?._id) {
        state.bookings.unshift(
          action.payload
        );
      }
    },

    /* SELECT BOOKING */

    setSelectedBooking: (
      state,
      action
    ) => {
      state.selectedBooking =
        action.payload;
    },

    /* CLEAR SELECTED BOOKING */

    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },

    /* UPDATE BOOKING LOCALLY */

    updateBookingLocal: (
      state,
      action
    ) => {
      const updatedBooking =
        action.payload;

      if (!updatedBooking?._id) {
        return;
      }

      const index =
        state.bookings.findIndex(
          (booking) =>
            booking._id ===
            updatedBooking._id
        );

      if (index !== -1) {
        state.bookings[index] =
          updatedBooking;
      }

      if (
        state.selectedBooking?._id ===
        updatedBooking._id
      ) {
        state.selectedBooking =
          updatedBooking;
      }
    },

    /* REMOVE BOOKING */

    removeBooking: (
      state,
      action
    ) => {
      const bookingId =
        action.payload;

      state.bookings =
        state.bookings.filter(
          (booking) =>
            booking._id !== bookingId
        );

      if (
        state.selectedBooking?._id ===
        bookingId
      ) {
        state.selectedBooking = null;
      }
    },

    /* CLEAR ERROR */

    clearBookingError: (state) => {
      state.error = null;
    },

    /* CLEAR SUCCESS */

    clearBookingSuccess: (state) => {
      state.successMessage = null;
    },

    /* CLEAR BOOKINGS */

    clearBookings: (state) => {
      state.bookings = [];
      state.selectedBooking = null;
    },
  },

  /* =====================================================
     ASYNC ACTIONS
  ===================================================== */

  extraReducers: (builder) => {
    /* ===================================================
       GET BOOKINGS
    =================================================== */

    builder
      .addCase(
        getBookings.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getBookings.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          state.bookings =
            Array.isArray(action.payload)
              ? action.payload
              : [];
        }
      )

      .addCase(
        getBookings.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch bookings";
        }
      );

    /* ===================================================
       GET SINGLE BOOKING
    =================================================== */

    builder
      .addCase(
        getBookingById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getBookingById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.selectedBooking =
            action.payload;
        }
      )

      .addCase(
        getBookingById.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch booking";
        }
      );

    /* ===================================================
       CREATE BOOKING
    =================================================== */

    builder
      .addCase(
        createBooking.pending,
        (state) => {
          state.creating = true;
          state.error = null;
          state.successMessage = null;
        }
      )

      .addCase(
        createBooking.fulfilled,
        (state, action) => {
          state.creating = false;
          state.error = null;

          const newBooking =
            action.payload;

          if (newBooking?._id) {
            state.bookings.unshift(
              newBooking
            );
          }

          state.successMessage =
            "Booking created successfully";
        }
      )

      .addCase(
        createBooking.rejected,
        (state, action) => {
          state.creating = false;

          state.error =
            action.payload ||
            "Failed to create booking";
        }
      );

    /* ===================================================
       CONFIRM BOOKING
    =================================================== */

    builder
      .addCase(
        confirmBooking.pending,
        (state) => {
          state.confirming = true;
          state.error = null;
          state.successMessage = null;
        }
      )

      .addCase(
        confirmBooking.fulfilled,
        (state, action) => {
          state.confirming = false;
          state.error = null;

          const updatedBooking =
            action.payload;

          if (!updatedBooking?._id) {
            return;
          }

          const index =
            state.bookings.findIndex(
              (booking) =>
                booking._id ===
                updatedBooking._id
            );

          if (index !== -1) {
            state.bookings[index] =
              updatedBooking;
          } else {
            state.bookings.unshift(
              updatedBooking
            );
          }

          if (
            state.selectedBooking?._id ===
            updatedBooking._id
          ) {
            state.selectedBooking =
              updatedBooking;
          }

          state.successMessage =
            "Booking confirmed successfully";
        }
      )

      .addCase(
        confirmBooking.rejected,
        (state, action) => {
          state.confirming = false;

          state.error =
            action.payload ||
            "Failed to confirm booking";
        }
      );

    /* ===================================================
       COMPLETE BOOKING
    =================================================== */

    builder
      .addCase(
        completeBooking.pending,
        (state) => {
          state.completing = true;
          state.error = null;
          state.successMessage = null;
        }
      )

      .addCase(
        completeBooking.fulfilled,
        (state, action) => {
          state.completing = false;
          state.error = null;

          const updatedBooking =
            action.payload;

          if (!updatedBooking?._id) {
            return;
          }

          const index =
            state.bookings.findIndex(
              (booking) =>
                booking._id ===
                updatedBooking._id
            );

          if (index !== -1) {
            state.bookings[index] =
              updatedBooking;
          } else {
            state.bookings.unshift(
              updatedBooking
            );
          }

          if (
            state.selectedBooking?._id ===
            updatedBooking._id
          ) {
            state.selectedBooking =
              updatedBooking;
          }

          state.successMessage =
            "Booking completed successfully";
        }
      )

      .addCase(
        completeBooking.rejected,
        (state, action) => {
          state.completing = false;

          state.error =
            action.payload ||
            "Failed to complete booking";
        }
      );

    /* ===================================================
       CANCEL BOOKING
    =================================================== */

    builder
      .addCase(
        cancelBooking.pending,
        (state) => {
          state.cancelling = true;
          state.error = null;
          state.successMessage = null;
        }
      )

      .addCase(
        cancelBooking.fulfilled,
        (state, action) => {
          state.cancelling = false;
          state.error = null;

          const updatedBooking =
            action.payload;

          if (!updatedBooking?._id) {
            return;
          }

          const index =
            state.bookings.findIndex(
              (booking) =>
                booking._id ===
                updatedBooking._id
            );

          if (index !== -1) {
            state.bookings[index] =
              updatedBooking;
          } else {
            state.bookings.unshift(
              updatedBooking
            );
          }

          if (
            state.selectedBooking?._id ===
            updatedBooking._id
          ) {
            state.selectedBooking =
              updatedBooking;
          }

          state.successMessage =
            "Booking cancelled successfully";
        }
      )

      .addCase(
        cancelBooking.rejected,
        (state, action) => {
          state.cancelling = false;

          state.error =
            action.payload ||
            "Failed to cancel booking";
        }
      );

    /* ===================================================
       UPDATE BOOKING
    =================================================== */

    builder
      .addCase(
        updateBooking.pending,
        (state) => {
          state.updating = true;
          state.error = null;
          state.successMessage = null;
        }
      )

      .addCase(
        updateBooking.fulfilled,
        (state, action) => {
          state.updating = false;
          state.error = null;

          const updatedBooking =
            action.payload;

          if (!updatedBooking?._id) {
            return;
          }

          const index =
            state.bookings.findIndex(
              (booking) =>
                booking._id ===
                updatedBooking._id
            );

          if (index !== -1) {
            state.bookings[index] =
              updatedBooking;
          } else {
            state.bookings.unshift(
              updatedBooking
            );
          }

          if (
            state.selectedBooking?._id ===
            updatedBooking._id
          ) {
            state.selectedBooking =
              updatedBooking;
          }

          state.successMessage =
            "Booking updated successfully";
        }
      )

      .addCase(
        updateBooking.rejected,
        (state, action) => {
          state.updating = false;

          state.error =
            action.payload ||
            "Failed to update booking";
        }
      );
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setBookings,
  addBooking,
  setSelectedBooking,
  clearSelectedBooking,
  updateBookingLocal,
  removeBooking,
  clearBookingError,
  clearBookingSuccess,
  clearBookings,
} = bookingSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectBookings = (state) =>
  state.booking?.bookings || [];

export const selectSelectedBooking = (
  state
) =>
  state.booking?.selectedBooking || null;

export const selectBookingLoading = (
  state
) =>
  state.booking?.loading || false;

export const selectBookingCreating = (
  state
) =>
  state.booking?.creating || false;

export const selectBookingUpdating = (
  state
) =>
  state.booking?.updating || false;

export const selectBookingConfirming = (
  state
) =>
  state.booking?.confirming || false;

export const selectBookingCompleting = (
  state
) =>
  state.booking?.completing || false;

export const selectBookingCancelling = (
  state
) =>
  state.booking?.cancelling || false;

export const selectBookingError = (
  state
) =>
  state.booking?.error || null;

export const selectBookingSuccess = (
  state
) =>
  state.booking?.successMessage || null;

/* =========================================================
   REDUCER
========================================================= */

export default bookingSlice.reducer;