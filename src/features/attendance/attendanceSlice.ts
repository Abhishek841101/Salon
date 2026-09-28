import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiRequest } from "../../api/api";

type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Half Day"
  | "Leave";

export type AttendanceStaff = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  specialization?: string;
  status?: string;
};

export type Attendance = {
  _id: string;
  staff: AttendanceStaff;
  date: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

type AttendanceState = {
  attendance: Attendance[];
  selectedAttendance: Attendance | null;
  loading: boolean;
  error: string | null;
  success: boolean;
};

const initialState: AttendanceState = {
  attendance: [],
  selectedAttendance: null,
  loading: false,
  error: null,
  success: false,
};

// ======================================================
// GET ATTENDANCE
// ======================================================

export const fetchAttendance = createAsyncThunk<
  Attendance[],
  {
    token?: string | null;
    date?: string;
    staffId?: string;
    startDate?: string;
    endDate?: string;
  } | undefined,
  { rejectValue: string }
>(
  "attendance/fetchAttendance",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();

      if (params.date) {
        query.append("date", params.date);
      }

      if (params.staffId) {
        query.append("staffId", params.staffId);
      }

      if (params.startDate) {
        query.append("startDate", params.startDate);
      }

      if (params.endDate) {
        query.append("endDate", params.endDate);
      }

      const queryString = query.toString();

      const response = await apiRequest(
        `/attendance${
          queryString ? `?${queryString}` : ""
        }`,
        {
          method: "GET",
          token: params.token,
        }
      );

      return response?.attendance || [];
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch attendance"
      );
    }
  }
);

// ======================================================
// GET SINGLE ATTENDANCE
// ======================================================

export const fetchAttendanceById =
  createAsyncThunk<
    Attendance,
    {
      id: string;
      token?: string | null;
    },
    { rejectValue: string }
  >(
    "attendance/fetchAttendanceById",
    async ({ id, token }, { rejectWithValue }) => {
      try {
        const response = await apiRequest(
          `/attendance/${id}`,
          {
            method: "GET",
            token,
          }
        );

        return response.attendance;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Failed to fetch attendance"
        );
      }
    }
  );

// ======================================================
// CREATE / UPDATE ATTENDANCE
// ======================================================

export const markAttendance = createAsyncThunk<
  Attendance,
  {
    staffId: string;
    date?: string;
    status: AttendanceStatus;
    checkIn?: string;
    checkOut?: string;
    notes?: string;
    token?: string | null;
  },
  { rejectValue: string }
>(
  "attendance/markAttendance",
  async (
    {
      staffId,
      date,
      status,
      checkIn,
      checkOut,
      notes,
      token,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiRequest(
        "/attendance",
        {
          method: "POST",
          token,
          body: {
            staffId,
            date,
            status,
            checkIn: checkIn || "",
            checkOut: checkOut || "",
            notes: notes || "",
          },
        }
      );

      return response.attendance;
    } catch (error: any) {
      return rejectWithValue(
        error?.message ||
          "Failed to save attendance"
      );
    }
  }
);

// ======================================================
// DELETE ATTENDANCE
// ======================================================

export const deleteAttendance =
  createAsyncThunk<
    string,
    {
      id: string;
      token?: string | null;
    },
    { rejectValue: string }
  >(
    "attendance/deleteAttendance",
    async ({ id, token }, { rejectWithValue }) => {
      try {
        await apiRequest(
          `/attendance/${id}`,
          {
            method: "DELETE",
            token,
          }
        );

        return id;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Failed to delete attendance"
        );
      }
    }
  );

// ======================================================
// SLICE
// ======================================================

const attendanceSlice = createSlice({
  name: "attendance",

  initialState,

  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },

    clearAttendanceSuccess: (state) => {
      state.success = false;
    },

    clearSelectedAttendance: (state) => {
      state.selectedAttendance = null;
    },
  },

  extraReducers: (builder) => {
    // ================================================
    // FETCH ALL
    // ================================================

    builder
      .addCase(
        fetchAttendance.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAttendance.fulfilled,
        (state, action) => {
          state.loading = false;
          state.attendance = action.payload;
        }
      )

      .addCase(
        fetchAttendance.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch attendance";
        }
      );

    // ================================================
    // FETCH SINGLE
    // ================================================

    builder
      .addCase(
        fetchAttendanceById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAttendanceById.fulfilled,
        (state, action) => {
          state.loading = false;
          state.selectedAttendance =
            action.payload;
        }
      )

      .addCase(
        fetchAttendanceById.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to fetch attendance";
        }
      );

    // ================================================
    // CREATE / UPDATE
    // ================================================

    builder
      .addCase(
        markAttendance.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        }
      )

      .addCase(
        markAttendance.fulfilled,
        (state, action) => {
          state.loading = false;
          state.success = true;

          const index =
            state.attendance.findIndex(
              (item) =>
                item._id === action.payload._id
            );

          if (index !== -1) {
            state.attendance[index] =
              action.payload;
          } else {
            state.attendance.unshift(
              action.payload
            );
          }

          state.selectedAttendance =
            action.payload;
        }
      )

      .addCase(
        markAttendance.rejected,
        (state, action) => {
          state.loading = false;
          state.success = false;
          state.error =
            action.payload ||
            "Failed to save attendance";
        }
      );

    // ================================================
    // DELETE
    // ================================================

    builder
      .addCase(
        deleteAttendance.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        deleteAttendance.fulfilled,
        (state, action) => {
          state.loading = false;

          state.attendance =
            state.attendance.filter(
              (item) =>
                item._id !== action.payload
            );

          if (
            state.selectedAttendance?._id ===
            action.payload
          ) {
            state.selectedAttendance = null;
          }
        }
      )

      .addCase(
        deleteAttendance.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to delete attendance";
        }
      );
  },
});

export const {
  clearAttendanceError,
  clearAttendanceSuccess,
  clearSelectedAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;