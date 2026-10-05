
import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import API_URL from "../../config/api";

// =====================================================
// TYPES
// =====================================================

export type StylistStatus =
  | "ACTIVE"
  | "INACTIVE";

export type SalaryType =
  | "MONTHLY"
  | "DAILY";

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LEAVE";

// =====================================================
// STYLIST
// =====================================================

export type Stylist = {
  _id: string;

  name: string;

  phone: string;

  email?: string;

  specialization?: string;

  experience?: number;

  status: StylistStatus;

  joiningDate?: string | null;

  salaryType?: SalaryType;

  monthlySalary?: number;

  basicSalary8h?: number;

  overtimeRatePerHour?: number;

  standardWorkingHours?: number;

  notes?: string;

  createdAt?: string;

  updatedAt?: string;
};

// =====================================================
// STYLIST STATS
// =====================================================

export type StylistStats = {
  totalClients: number;

  totalAppointments: number;

  completedServices: number;

  confirmedAppointments: number;

  cancelledAppointments: number;

  totalBills: number;

  totalRevenue: number;

  pendingAmount: number;

  averageServiceValue: number;

  periodAppointments: number;

  periodCompletedServices: number;

  periodBills: number;

  periodRevenue: number;

  periodPendingAmount: number;

  // Backend profile may also return this.
  periodBookingRevenue?: number;
};

// =====================================================
// ATTENDANCE
// =====================================================

export type StylistAttendance = {
  _id: string;

  stylist:
    | string
    | Stylist
    | {
        _id: string;

        name?: string;

        phone?: string;

        email?: string;

        specialization?: string;

        status?: StylistStatus;
      };

  date: string;

  status: AttendanceStatus;

  checkIn?: string | null;

  checkOut?: string | null;

  workedHours: number;

  overtimeHours: number;

  basicSalaryEarned: number;

  overtimeSalary: number;

  totalSalaryEarned: number;

  notes?: string;

  createdAt?: string;

  updatedAt?: string;
};

// =====================================================
// ATTENDANCE SUMMARY
// =====================================================

export type AttendanceSummary = {
  totalDays: number;

  presentDays: number;

  absentDays: number;

  halfDays: number;

  leaveDays: number;

  totalWorkedHours: number;

  totalOvertimeHours: number;

  basicSalaryEarned: number;

  overtimeSalary: number;

  totalSalaryEarned: number;
};

// =====================================================
// POST ATTENDANCE CALCULATION
// =====================================================

export type AttendanceCalculation = {
  standardWorkingHours: number;

  workedHours: number;

  regularHours: number;

  overtimeHours: number;

  basicSalaryEarned: number;

  overtimeSalary: number;

  totalSalaryEarned: number;
};

// =====================================================
// SALARY
// =====================================================

export type StylistSalary = {
  monthlySalary: number;

  basicSalary8h: number;

  overtimeRatePerHour: number;

  standardWorkingHours: number;

  basicSalaryEarned: number;

  overtimeSalary: number;

  totalSalaryEarned: number;
};

// =====================================================
// PROFILE
// =====================================================

export type StylistProfile = {
  stylist: Stylist | null;

  stats: StylistStats;

  attendance: {
    totalDays: number;

    presentDays: number;

    absentDays: number;

    halfDays: number;

    leaveDays: number;

    totalWorkedHours: number;

    overtimeHours: number;
  };

  salary: StylistSalary;

  period?: {
    type?: string;

    startDate: string | null;

    endDate: string | null;
  };

  recentBookings: any[];

  recentBills: any[];
};

// =====================================================
// API RESPONSE TYPES
// =====================================================

type StylistsResponse = {
  success: boolean;

  count?: number;

  stylists?: Stylist[];

  message?: string;
};

type StylistResponse = {
  success: boolean;

  stylist?: Stylist;

  message?: string;
};

type ProfileResponse = {
  success: boolean;

  stylist?: Stylist | null;

  stats?: Partial<StylistStats>;

  attendance?: {
    totalDays?: number;

    presentDays?: number;

    absentDays?: number;

    halfDays?: number;

    leaveDays?: number;

    totalWorkedHours?: number;

    overtimeHours?: number;
  };

  salary?: Partial<StylistSalary>;

  period?: {
    type?: string;

    startDate?: string | null;

    endDate?: string | null;
  };

  recentBookings?: any[];

  recentBills?: any[];

  message?: string;
};

type AttendanceResponse = {
  success: boolean;

  stylist?: Stylist;

  period?: {
    startDate: string;

    endDate: string;
  };

  count?: number;

  attendance?: StylistAttendance[];

  message?: string;
};

type AttendanceSaveResponse = {
  success: boolean;

  message?: string;

  attendance?: StylistAttendance;

  calculation?: AttendanceCalculation;
};

type AttendanceSummaryResponse = {
  success: boolean;

  stylist?: {
    id: string;

    name: string;

    phone: string;

    status: StylistStatus;

    salary: {
      salaryType?: SalaryType;

      monthlySalary?: number;

      basicSalary8h?: number;

      overtimeRatePerHour?: number;

      standardWorkingHours?: number;
    };
  };

  period?: {
    startDate: string;

    endDate: string;
  };

  attendance?: AttendanceSummary;

  salary?: {
    basicSalaryEarned: number;

    overtimeSalary: number;

    totalSalaryEarned: number;
  };

  message?: string;
};

// =====================================================
// CREATE
// =====================================================

export type CreateStylistData = {
  name: string;

  phone: string;

  email?: string;

  specialization?: string;

  experience?: number | string;

  status?: StylistStatus;

  joiningDate?: string | null;

  salaryType?: SalaryType;

  monthlySalary?: number | string;

  basicSalary8h?: number | string;

  overtimeRatePerHour?:
    | number
    | string;

  standardWorkingHours?:
    | number
    | string;

  notes?: string;
};

// =====================================================
// UPDATE
// =====================================================

export type UpdateStylistData = {
  id: string;

  name?: string;

  phone?: string;

  email?: string;

  specialization?: string;

  experience?: number | string;

  status?: StylistStatus;

  joiningDate?: string | null;

  salaryType?: SalaryType;

  monthlySalary?: number | string;

  basicSalary8h?: number | string;

  overtimeRatePerHour?:
    | number
    | string;

  standardWorkingHours?:
    | number
    | string;

  notes?: string;
};

// =====================================================
// ATTENDANCE INPUT
// =====================================================

export type MarkAttendanceData = {
  stylistId: string;

  date: string;

  status?: AttendanceStatus;

  checkIn?: string | null;

  checkOut?: string | null;

  workedHours?: number | string;

  overtimeHours?: number | string;

  notes?: string;
};

// =====================================================
// ATTENDANCE QUERY
// =====================================================

export type AttendanceQuery = {
  stylistId: string;

  startDate?: string;

  endDate?: string;
};

// =====================================================
// STATE
// =====================================================

type StylistState = {
  stylists: Stylist[];

  stylist: Stylist | null;

  profile: StylistProfile | null;

  attendance: StylistAttendance[];

  attendanceSummary:
    | AttendanceSummary
    | null;

  attendanceCalculation:
    | AttendanceCalculation
    | null;

  attendancePeriod:
    | {
        startDate: string;

        endDate: string;
      }
    | null;

  loading: boolean;

  detailsLoading: boolean;

  profileLoading: boolean;

  attendanceLoading: boolean;

  attendanceSaving: boolean;

  saving: boolean;

  deleting: boolean;

  error: string | null;

  success: boolean;

  total: number;
};

// =====================================================
// DEFAULTS
// =====================================================

const emptyStats: StylistStats = {
  totalClients: 0,

  totalAppointments: 0,

  completedServices: 0,

  confirmedAppointments: 0,

  cancelledAppointments: 0,

  totalBills: 0,

  totalRevenue: 0,

  pendingAmount: 0,

  averageServiceValue: 0,

  periodAppointments: 0,

  periodCompletedServices: 0,

  periodBills: 0,

  periodRevenue: 0,

  periodPendingAmount: 0,

  periodBookingRevenue: 0,
};

const emptySalary: StylistSalary = {
  monthlySalary: 0,

  basicSalary8h: 0,

  overtimeRatePerHour: 0,

  standardWorkingHours: 8,

  basicSalaryEarned: 0,

  overtimeSalary: 0,

  totalSalaryEarned: 0,
};

const initialState: StylistState = {
  stylists: [],

  stylist: null,

  profile: null,

  attendance: [],

  attendanceSummary: null,

  attendanceCalculation: null,

  attendancePeriod: null,

  loading: false,

  detailsLoading: false,

  profileLoading: false,

  attendanceLoading: false,

  attendanceSaving: false,

  saving: false,

  deleting: false,

  error: null,

  success: false,

  total: 0,
};

// =====================================================
// HELPERS
// =====================================================

const getToken = (
  getState: any
): string | null => {
  return (
    getState()?.auth?.token ||
    null
  );
};

const authHeaders = (
  token: string
) => ({
  Accept: "application/json",

  Authorization: `Bearer ${token}`,
});

const jsonHeaders = (
  token: string
) => ({
  "Content-Type":
    "application/json",

  Accept: "application/json",

  Authorization: `Bearer ${token}`,
});

const parseResponse = async (
  response: Response
): Promise<any> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const toNumber = (
  value: unknown,
  fallback = 0
): number => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const cleanNumber = (
  value: unknown,
  fallback = 0
): number => {
  return Math.max(
    0,
    toNumber(value, fallback)
  );
};

const cleanText = (
  value: unknown
): string => {
  return String(value ?? "").trim();
};

// =====================================================
// FETCH STYLISTS
//
// GET /api/stylists
//
// Supports:
// ?search=name
// ?status=ACTIVE
// =====================================================

export const fetchStylists =
  createAsyncThunk<
    StylistsResponse,
    void | {
      search?: string;

      status?: StylistStatus;
    },
    { rejectValue: string }
  >(
    "stylists/fetchStylists",

    async (
      params = {},
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        const query =
          new URLSearchParams();

        if (
          typeof params ===
            "object" &&
          params?.search?.trim()
        ) {
          query.set(
            "search",
            params.search.trim()
          );
        }

        if (
          typeof params ===
            "object" &&
          params?.status
        ) {
          query.set(
            "status",
            params.status
          );
        }

        const queryString =
          query.toString();

        const url =
          `${API_URL}/stylists` +
          (queryString
            ? `?${queryString}`
            : "");

        const response =
          await fetch(url, {
            method: "GET",

            headers:
              authHeaders(token),
          });

        const data =
          await parseResponse(
            response
          );

        if (
          !response.ok ||
          !data?.success
        ) {
          return rejectWithValue(
            data?.message ||
              "Failed to fetch stylists"
          );
        }

        return data;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Unable to connect to server"
        );
      }
    }
  );

// =====================================================
// GET STYLIST BY ID
// =====================================================

export const getStylistById =
  createAsyncThunk<
    StylistResponse,
    string,
    { rejectValue: string }
  >(
    "stylists/getStylistById",

    async (
      id,
      {
        getState,
        rejectWithValue,
      }
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
            "Stylist ID is required"
          );
        }

        const response =
          await fetch(
            `${API_URL}/stylists/${id}`,
            {
              method: "GET",

              headers:
                authHeaders(token),
            }
          );

        const data =
          await parseResponse(
            response
          );

        if (
          !response.ok ||
          !data?.success
        ) {
          return rejectWithValue(
            data?.message ||
              "Failed to fetch stylist"
          );
        }

        return data;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Unable to fetch stylist"
        );
      }
    }
  );

// =====================================================
// GET PROFILE
//
// GET /api/stylists/:id/profile
// =====================================================

export const getStylistProfile =
  createAsyncThunk<
    ProfileResponse,
    {
      id: string;

      period?:
        | "week"
        | "month";

      startDate?: string;

      endDate?: string;
    },
    { rejectValue: string }
  >(
    "stylists/getStylistProfile",

    async (
      params,
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        if (!params?.id) {
          return rejectWithValue(
            "Stylist ID is required"
          );
        }

        const query =
          new URLSearchParams();

        if (params.period) {
          query.set(
            "period",
            params.period
          );
        }

        if (params.startDate) {
          query.set(
            "startDate",
            params.startDate
          );
        }

        if (params.endDate) {
          query.set(
            "endDate",
            params.endDate
          );
        }

        const queryString =
          query.toString();

        const url =
          `${API_URL}/stylists/${params.id}/profile` +
          (queryString
            ? `?${queryString}`
            : "");

        const response =
          await fetch(url, {
            method: "GET",

            headers:
              authHeaders(token),
          });

        const data =
          await parseResponse(
            response
          );

        if (
          !response.ok ||
          !data?.success
        ) {
          return rejectWithValue(
            data?.message ||
              "Failed to fetch stylist profile"
          );
        }

        return data;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Unable to fetch stylist profile"
        );
      }
    }
  );

// =====================================================
// CREATE STYLIST
// =====================================================

export const createStylist =
  createAsyncThunk<
    StylistResponse,
    CreateStylistData,
    { rejectValue: string }
  >(
    "stylists/createStylist",

    async (
      data,
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        const name =
          cleanText(data.name);

        const phone =
          cleanText(data.phone);

        if (!name) {
          return rejectWithValue(
            "Name is required"
          );
        }

        if (!phone) {
          return rejectWithValue(
            "Phone is required"
          );
        }

        const body = {
          name,

          phone,

          email: cleanText(
            data.email
          ).toLowerCase(),

          specialization:
            cleanText(
              data.specialization
            ),

          experience:
            cleanNumber(
              data.experience
            ),

          status:
            data.status ||
            "ACTIVE",

          joiningDate:
            data.joiningDate ||
            null,

          salaryType:
            data.salaryType ||
            "MONTHLY",

          monthlySalary:
            cleanNumber(
              data.monthlySalary
            ),

          basicSalary8h:
            cleanNumber(
              data.basicSalary8h
            ),

          overtimeRatePerHour:
            cleanNumber(
              data.overtimeRatePerHour
            ),

          standardWorkingHours:
            Math.max(
              1,
              cleanNumber(
                data.standardWorkingHours,
                8
              )
            ),

          notes: cleanText(
            data.notes
          ),
        };

        const response =
          await fetch(
            `${API_URL}/stylists`,
            {
              method: "POST",

              headers:
                jsonHeaders(token),

              body:
                JSON.stringify(body),
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (
          !response.ok ||
          !result?.success
        ) {
          return rejectWithValue(
            result?.message ||
              "Failed to create stylist"
          );
        }

        return result;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Unable to create stylist"
        );
      }
    }
  );

// =====================================================
// UPDATE STYLIST
// =====================================================

export const updateStylist =
  createAsyncThunk<
    StylistResponse,
    UpdateStylistData,
    { rejectValue: string }
  >(
    "stylists/updateStylist",

    async (
      data,
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        const {
          id,
          ...rest
        } = data;

        if (!id) {
          return rejectWithValue(
            "Stylist ID is required"
          );
        }

        const body: Record<
          string,
          any
        > = {};

        if (
          rest.name !== undefined
        ) {
          const value =
            cleanText(rest.name);

          if (!value) {
            return rejectWithValue(
              "Name cannot be empty"
            );
          }

          body.name = value;
        }

        if (
          rest.phone !== undefined
        ) {
          const value =
            cleanText(rest.phone);

          if (!value) {
            return rejectWithValue(
              "Phone cannot be empty"
            );
          }

          body.phone = value;
        }

        if (
          rest.email !== undefined
        ) {
          body.email =
            cleanText(
              rest.email
            ).toLowerCase();
        }

        if (
          rest.specialization !==
          undefined
        ) {
          body.specialization =
            cleanText(
              rest.specialization
            );
        }

        if (
          rest.experience !==
          undefined
        ) {
          body.experience =
            cleanNumber(
              rest.experience
            );
        }

        if (
          rest.status !== undefined
        ) {
          body.status =
            rest.status;
        }

        if (
          rest.joiningDate !==
          undefined
        ) {
          body.joiningDate =
            rest.joiningDate ||
            null;
        }

        if (
          rest.salaryType !==
          undefined
        ) {
          body.salaryType =
            rest.salaryType;
        }

        if (
          rest.monthlySalary !==
          undefined
        ) {
          body.monthlySalary =
            cleanNumber(
              rest.monthlySalary
            );
        }

        if (
          rest.basicSalary8h !==
          undefined
        ) {
          body.basicSalary8h =
            cleanNumber(
              rest.basicSalary8h
            );
        }

        if (
          rest.overtimeRatePerHour !==
          undefined
        ) {
          body.overtimeRatePerHour =
            cleanNumber(
              rest.overtimeRatePerHour
            );
        }

        if (
          rest.standardWorkingHours !==
          undefined
        ) {
          body.standardWorkingHours =
            Math.max(
              1,
              cleanNumber(
                rest.standardWorkingHours,
                8
              )
            );
        }

        if (
          rest.notes !== undefined
        ) {
          body.notes =
            cleanText(
              rest.notes
            );
        }

        const response =
          await fetch(
            `${API_URL}/stylists/${id}`,
            {
              method: "PATCH",

              headers:
                jsonHeaders(token),

              body:
                JSON.stringify(body),
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (
          !response.ok ||
          !result?.success
        ) {
          return rejectWithValue(
            result?.message ||
              "Failed to update stylist"
          );
        }

        return result;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Unable to update stylist"
        );
      }
    }
  );

// =====================================================
// DELETE STYLIST
// =====================================================

export const deleteStylist =
  createAsyncThunk<
    string,
    string,
    { rejectValue: string }
  >(
    "stylists/deleteStylist",

    async (
      id,
      {
        getState,
        rejectWithValue,
      }
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
            "Stylist ID is required"
          );
        }

        const response =
          await fetch(
            `${API_URL}/stylists/${id}`,
            {
              method: "DELETE",

              headers:
                authHeaders(token),
            }
          );

        const data =
          await parseResponse(
            response
          );

        if (
          !response.ok ||
          !data?.success
        ) {
          return rejectWithValue(
            data?.message ||
              "Failed to delete stylist"
          );
        }

        return id;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Unable to delete stylist"
        );
      }
    }
  );

// =====================================================
// MARK / UPDATE ATTENDANCE
//
// IMPORTANT:
// Do NOT send workedHours = 0 automatically.
// Backend calculates hours from checkIn/checkOut.
// =====================================================

export const markStylistAttendance =
  createAsyncThunk<
    AttendanceSaveResponse,
    MarkAttendanceData,
    { rejectValue: string }
  >(
    "stylists/markAttendance",

    async (
      data,
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        if (!data?.stylistId) {
          return rejectWithValue(
            "Stylist ID is required"
          );
        }

        if (!data?.date) {
          return rejectWithValue(
            "Attendance date is required"
          );
        }

        const body: Record<
          string,
          any
        > = {
          date: data.date,

          status:
            data.status ||
            "PRESENT",

          checkIn:
            data.checkIn || null,

          checkOut:
            data.checkOut || null,

          notes:
            cleanText(data.notes),
        };

        // Only send workedHours when
        // caller explicitly supplied it.
        if (
          data.workedHours !==
            undefined &&
          data.workedHours !==
            null &&
          data.workedHours !== ""
        ) {
          body.workedHours =
            cleanNumber(
              data.workedHours
            );
        }

        // Only send overtimeHours when
        // caller explicitly supplied it.
        // Otherwise backend calculates it.
        if (
          data.overtimeHours !==
            undefined &&
          data.overtimeHours !==
            null &&
          data.overtimeHours !== ""
        ) {
          body.overtimeHours =
            cleanNumber(
              data.overtimeHours
            );
        }

        const response =
          await fetch(
            `${API_URL}/stylists/${data.stylistId}/attendance`,
            {
              method: "POST",

              headers:
                jsonHeaders(token),

              body:
                JSON.stringify(body),
            }
          );

        const result =
          await parseResponse(
            response
          );

        if (
          !response.ok ||
          !result?.success
        ) {
          return rejectWithValue(
            result?.message ||
              "Failed to save attendance"
          );
        }

        return result;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Unable to save attendance"
        );
      }
    }
  );

// =====================================================
// GET ATTENDANCE
//
// GET /api/stylists/:id/attendance
// =====================================================

export const getStylistAttendance =
  createAsyncThunk<
    AttendanceResponse,
    AttendanceQuery,
    { rejectValue: string }
  >(
    "stylists/getAttendance",

    async (
      params,
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        if (!params?.stylistId) {
          return rejectWithValue(
            "Stylist ID is required"
          );
        }

        const query =
          new URLSearchParams();

        if (params.startDate) {
          query.set(
            "startDate",
            params.startDate
          );
        }

        if (params.endDate) {
          query.set(
            "endDate",
            params.endDate
          );
        }

        const queryString =
          query.toString();

        const url =
          `${API_URL}/stylists/${params.stylistId}/attendance` +
          (queryString
            ? `?${queryString}`
            : "");

        const response =
          await fetch(url, {
            method: "GET",

            headers:
              authHeaders(token),
          });

        const data =
          await parseResponse(
            response
          );

        if (
          !response.ok ||
          !data?.success
        ) {
          return rejectWithValue(
            data?.message ||
              "Failed to fetch attendance"
          );
        }

        return data;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Unable to fetch attendance"
        );
      }
    }
  );

// =====================================================
// ATTENDANCE SUMMARY
//
// Backend response:
//
// attendance: {
//   totalDays,
//   presentDays,
//   absentDays,
//   halfDays,
//   leaveDays,
//   totalWorkedHours,
//   totalOvertimeHours
// }
//
// salary: {
//   basicSalaryEarned,
//   overtimeSalary,
//   totalSalaryEarned
// }
// =====================================================

export const getAttendanceSummary =
  createAsyncThunk<
    AttendanceSummaryResponse,
    AttendanceQuery,
    { rejectValue: string }
  >(
    "stylists/getAttendanceSummary",

    async (
      params,
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {
        const token =
          getToken(getState);

        if (!token) {
          return rejectWithValue(
            "Authentication token missing"
          );
        }

        if (!params?.stylistId) {
          return rejectWithValue(
            "Stylist ID is required"
          );
        }

        const query =
          new URLSearchParams();

        if (params.startDate) {
          query.set(
            "startDate",
            params.startDate
          );
        }

        if (params.endDate) {
          query.set(
            "endDate",
            params.endDate
          );
        }

        const queryString =
          query.toString();

        const url =
          `${API_URL}/stylists/${params.stylistId}/attendance-summary` +
          (queryString
            ? `?${queryString}`
            : "");

        const response =
          await fetch(url, {
            method: "GET",

            headers:
              authHeaders(token),
          });

        const data =
          await parseResponse(
            response
          );

        if (
          !response.ok ||
          !data?.success
        ) {
          return rejectWithValue(
            data?.message ||
              "Failed to fetch attendance summary"
          );
        }

        return data;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Unable to fetch attendance summary"
        );
      }
    }
  );

// =====================================================
// SLICE
// =====================================================

const stylistsSlice =
  createSlice({
    name: "stylists",

    initialState,

    reducers: {
      clearStylistError: (
        state
      ) => {
        state.error = null;
      },

      clearStylistSuccess: (
        state
      ) => {
        state.success = false;
      },

      clearSelectedStylist: (
        state
      ) => {
        state.stylist = null;
      },

      clearProfile: (
        state
      ) => {
        state.profile = null;
      },

      clearAttendance: (
        state
      ) => {
        state.attendance = [];

        state.attendanceSummary =
          null;

        state.attendanceCalculation =
          null;

        state.attendancePeriod =
          null;
      },

      clearAttendanceSummary: (
        state
      ) => {
        state.attendanceSummary =
          null;

        state.attendancePeriod =
          null;
      },

      clearAttendanceCalculation: (
        state
      ) => {
        state.attendanceCalculation =
          null;
      },
    },

    extraReducers:
      (builder) => {
        // =================================================
        // FETCH STAFF
        // =================================================

        builder

          .addCase(
            fetchStylists.pending,
            (state) => {
              state.loading = true;

              state.error = null;
            }
          )

          .addCase(
            fetchStylists.fulfilled,
            (
              state,
              action: PayloadAction<StylistsResponse>
            ) => {
              state.loading = false;

              state.stylists =
                Array.isArray(
                  action.payload?.stylists
                )
                  ? action.payload.stylists
                  : [];

              state.total =
                typeof action.payload?.count ===
                "number"
                  ? action.payload.count
                  : state.stylists.length;
            }
          )

          .addCase(
            fetchStylists.rejected,
            (
              state,
              action
            ) => {
              state.loading = false;

              state.error =
                action.payload ||
                "Failed to fetch stylists";
            }
          );

        // =================================================
        // GET STAFF
        // =================================================

        builder

          .addCase(
            getStylistById.pending,
            (state) => {
              state.detailsLoading =
                true;

              state.error = null;
            }
          )

          .addCase(
            getStylistById.fulfilled,
            (
              state,
              action: PayloadAction<StylistResponse>
            ) => {
              state.detailsLoading =
                false;

              state.stylist =
                action.payload?.stylist ||
                null;
            }
          )

          .addCase(
            getStylistById.rejected,
            (
              state,
              action
            ) => {
              state.detailsLoading =
                false;

              state.error =
                action.payload ||
                "Failed to fetch stylist";
            }
          );

        // =================================================
        // PROFILE
        // =================================================

        builder

          .addCase(
            getStylistProfile.pending,
            (state) => {
              state.profileLoading =
                true;

              state.error = null;
            }
          )

          .addCase(
            getStylistProfile.fulfilled,
            (
              state,
              action: PayloadAction<ProfileResponse>
            ) => {
              state.profileLoading =
                false;

              const data =
                action.payload || {};

              const rawStats =
                data.stats || {};

              const rawAttendance =
                data.attendance || {};

              const rawSalary =
                data.salary || {};

              const stylist =
                data.stylist || null;

              state.profile = {
                stylist,

                stats: {
                  ...emptyStats,

                  ...rawStats,

                  totalClients:
                    toNumber(
                      rawStats.totalClients
                    ),

                  totalAppointments:
                    toNumber(
                      rawStats.totalAppointments
                    ),

                  completedServices:
                    toNumber(
                      rawStats.completedServices
                    ),

                  confirmedAppointments:
                    toNumber(
                      rawStats.confirmedAppointments
                    ),

                  cancelledAppointments:
                    toNumber(
                      rawStats.cancelledAppointments
                    ),

                  totalBills:
                    toNumber(
                      rawStats.totalBills
                    ),

                  totalRevenue:
                    toNumber(
                      rawStats.totalRevenue
                    ),

                  pendingAmount:
                    toNumber(
                      rawStats.pendingAmount
                    ),

                  averageServiceValue:
                    toNumber(
                      rawStats.averageServiceValue
                    ),

                  periodAppointments:
                    toNumber(
                      rawStats.periodAppointments
                    ),

                  periodCompletedServices:
                    toNumber(
                      rawStats.periodCompletedServices
                    ),

                  periodBills:
                    toNumber(
                      rawStats.periodBills
                    ),

                  periodRevenue:
                    toNumber(
                      rawStats.periodRevenue
                    ),

                  periodPendingAmount:
                    toNumber(
                      rawStats.periodPendingAmount
                    ),

                  periodBookingRevenue:
                    toNumber(
                      rawStats.periodBookingRevenue
                    ),
                },

                attendance: {
                  totalDays:
                    toNumber(
                      rawAttendance.totalDays
                    ),

                  presentDays:
                    toNumber(
                      rawAttendance.presentDays
                    ),

                  absentDays:
                    toNumber(
                      rawAttendance.absentDays
                    ),

                  halfDays:
                    toNumber(
                      rawAttendance.halfDays
                    ),

                  leaveDays:
                    toNumber(
                      rawAttendance.leaveDays
                    ),

                  totalWorkedHours:
                    toNumber(
                      rawAttendance.totalWorkedHours
                    ),

                  // IMPORTANT:
                  // profile API calls this
                  // `overtimeHours`.
                  overtimeHours:
                    toNumber(
                      rawAttendance.overtimeHours
                    ),
                },

                salary: {
                  ...emptySalary,

                  monthlySalary:
                    toNumber(
                      rawSalary.monthlySalary
                    ),

                  basicSalary8h:
                    toNumber(
                      rawSalary.basicSalary8h
                    ),

                  overtimeRatePerHour:
                    toNumber(
                      rawSalary.overtimeRatePerHour
                    ),

                  standardWorkingHours:
                    Math.max(
                      1,
                      toNumber(
                        rawSalary.standardWorkingHours,
                        8
                      )
                    ),

                  basicSalaryEarned:
                    toNumber(
                      rawSalary.basicSalaryEarned
                    ),

                  overtimeSalary:
                    toNumber(
                      rawSalary.overtimeSalary
                    ),

                  totalSalaryEarned:
                    toNumber(
                      rawSalary.totalSalaryEarned
                    ),
                },

                period:
                  data.period || {
                    type: "month",

                    startDate: null,

                    endDate: null,
                  },

                recentBookings:
                  Array.isArray(
                    data.recentBookings
                  )
                    ? data.recentBookings
                    : [],

                recentBills:
                  Array.isArray(
                    data.recentBills
                  )
                    ? data.recentBills
                    : [],
              };

              state.stylist =
                stylist;
            }
          )

          .addCase(
            getStylistProfile.rejected,
            (
              state,
              action
            ) => {
              state.profileLoading =
                false;

              state.error =
                action.payload ||
                "Failed to fetch stylist profile";
            }
          );

        // =================================================
        // CREATE
        // =================================================

        builder

          .addCase(
            createStylist.pending,
            (state) => {
              state.saving = true;

              state.success = false;

              state.error = null;
            }
          )

          .addCase(
            createStylist.fulfilled,
            (
              state,
              action: PayloadAction<StylistResponse>
            ) => {
              state.saving = false;

              state.success = true;

              const stylist =
                action.payload?.stylist;

              if (!stylist) {
                return;
              }

              state.stylists.unshift(
                stylist
              );

              state.total += 1;
            }
          )

          .addCase(
            createStylist.rejected,
            (
              state,
              action
            ) => {
              state.saving = false;

              state.success = false;

              state.error =
                action.payload ||
                "Failed to create stylist";
            }
          );

        // =================================================
        // UPDATE
        // =================================================

        builder

          .addCase(
            updateStylist.pending,
            (state) => {
              state.saving = true;

              state.success = false;

              state.error = null;
            }
          )

          .addCase(
            updateStylist.fulfilled,
            (
              state,
              action: PayloadAction<StylistResponse>
            ) => {
              state.saving = false;

              state.success = true;

              const updated =
                action.payload?.stylist;

              if (!updated) {
                return;
              }

              const index =
                state.stylists.findIndex(
                  (item) =>
                    item._id ===
                    updated._id
                );

              if (index !== -1) {
                state.stylists[index] =
                  updated;
              }

              if (
                state.stylist?._id ===
                updated._id
              ) {
                state.stylist =
                  updated;
              }

              if (
                state.profile?.stylist?._id ===
                updated._id
              ) {
                state.profile.stylist =
                  updated;
              }
            }
          )

          .addCase(
            updateStylist.rejected,
            (
              state,
              action
            ) => {
              state.saving = false;

              state.success = false;

              state.error =
                action.payload ||
                "Failed to update stylist";
            }
          );

        // =================================================
        // DELETE
        // =================================================

        builder

          .addCase(
            deleteStylist.pending,
            (state) => {
              state.deleting = true;

              state.error = null;
            }
          )

          .addCase(
            deleteStylist.fulfilled,
            (
              state,
              action
            ) => {
              state.deleting = false;

              state.success = true;

              state.stylists =
                state.stylists.filter(
                  (item) =>
                    item._id !==
                    action.payload
                );

              state.total = Math.max(
                0,
                state.total - 1
              );

              if (
                state.stylist?._id ===
                action.payload
              ) {
                state.stylist = null;
              }

              if (
                state.profile?.stylist?._id ===
                action.payload
              ) {
                state.profile = null;
              }
            }
          )

          .addCase(
            deleteStylist.rejected,
            (
              state,
              action
            ) => {
              state.deleting = false;

              state.error =
                action.payload ||
                "Failed to delete stylist";
            }
          );

        // =================================================
        // SAVE ATTENDANCE
        // =================================================

        builder

          .addCase(
            markStylistAttendance.pending,
            (state) => {
              state.attendanceSaving =
                true;

              state.success = false;

              state.error = null;
            }
          )

          .addCase(
            markStylistAttendance.fulfilled,
            (
              state,
              action: PayloadAction<AttendanceSaveResponse>
            ) => {
              state.attendanceSaving =
                false;

              state.success = true;

              const attendance =
                action.payload?.attendance;

              const calculation =
                action.payload?.calculation;

              if (calculation) {
                state.attendanceCalculation =
                  calculation;
              }

              if (!attendance) {
                return;
              }

              const existingIndex =
                state.attendance.findIndex(
                  (item) =>
                    item._id ===
                    attendance._id
                );

              if (
                existingIndex >= 0
              ) {
                state.attendance[
                  existingIndex
                ] = attendance;
              } else {
                state.attendance.unshift(
                  attendance
                );
              }
            }
          )

          .addCase(
            markStylistAttendance.rejected,
            (
              state,
              action
            ) => {
              state.attendanceSaving =
                false;

              state.success = false;

              state.error =
                action.payload ||
                "Failed to save attendance";
            }
          );

        // =================================================
        // GET ATTENDANCE
        // =================================================

        builder

          .addCase(
            getStylistAttendance.pending,
            (state) => {
              state.attendanceLoading =
                true;

              state.error = null;
            }
          )

          .addCase(
            getStylistAttendance.fulfilled,
            (
              state,
              action: PayloadAction<AttendanceResponse>
            ) => {
              state.attendanceLoading =
                false;

              state.attendance =
                Array.isArray(
                  action.payload?.attendance
                )
                  ? action.payload.attendance
                  : [];

              state.attendancePeriod =
                action.payload?.period ||
                null;
            }
          )

          .addCase(
            getStylistAttendance.rejected,
            (
              state,
              action
            ) => {
              state.attendanceLoading =
                false;

              state.error =
                action.payload ||
                "Failed to fetch attendance";
            }
          );

        // =================================================
        // ATTENDANCE SUMMARY
        // =================================================

        builder

          .addCase(
            getAttendanceSummary.pending,
            (state) => {
              state.attendanceLoading =
                true;

              state.error = null;
            }
          )

          .addCase(
            getAttendanceSummary.fulfilled,
            (
              state,
              action: PayloadAction<AttendanceSummaryResponse>
            ) => {
              state.attendanceLoading =
                false;

              const attendance =
                action.payload?.attendance;

              if (attendance) {
                state.attendanceSummary = {
                  totalDays:
                    toNumber(
                      attendance.totalDays
                    ),

                  presentDays:
                    toNumber(
                      attendance.presentDays
                    ),

                  absentDays:
                    toNumber(
                      attendance.absentDays
                    ),

                  halfDays:
                    toNumber(
                      attendance.halfDays
                    ),

                  leaveDays:
                    toNumber(
                      attendance.leaveDays
                    ),

                  totalWorkedHours:
                    toNumber(
                      attendance.totalWorkedHours
                    ),

                  totalOvertimeHours:
                    toNumber(
                      attendance.totalOvertimeHours
                    ),

                  basicSalaryEarned:
                    toNumber(
                      attendance.basicSalaryEarned
                    ),

                  overtimeSalary:
                    toNumber(
                      attendance.overtimeSalary
                    ),

                  totalSalaryEarned:
                    toNumber(
                      attendance.totalSalaryEarned
                    ),
                };
              } else {
                state.attendanceSummary =
                  null;
              }

              state.attendancePeriod =
                action.payload?.period ||
                null;
            }
          )

          .addCase(
            getAttendanceSummary.rejected,
            (
              state,
              action
            ) => {
              state.attendanceLoading =
                false;

              state.error =
                action.payload ||
                "Failed to fetch attendance summary";
            }
          );
      },
  });

// =====================================================
// ACTIONS
// =====================================================

export const {
  clearStylistError,

  clearStylistSuccess,

  clearSelectedStylist,

  clearProfile,

  clearAttendance,

  clearAttendanceSummary,

  clearAttendanceCalculation,
} = stylistsSlice.actions;

// =====================================================
// SELECTORS
// =====================================================

export const selectStylists = (
  state: any
): Stylist[] =>
  state.stylists?.stylists || [];

export const selectStylist = (
  state: any
): Stylist | null =>
  state.stylists?.stylist || null;

export const selectStylistProfile = (
  state: any
): StylistProfile | null =>
  state.stylists?.profile || null;

export const selectStylistAttendance = (
  state: any
): StylistAttendance[] =>
  state.stylists?.attendance || [];

export const selectAttendanceSummary = (
  state: any
): AttendanceSummary | null =>
  state.stylists?.attendanceSummary ||
  null;

export const selectAttendanceCalculation = (
  state: any
): AttendanceCalculation | null =>
  state.stylists
    ?.attendanceCalculation ||
  null;

export const selectStylistLoading = (
  state: any
): boolean =>
  Boolean(
    state.stylists?.loading
  );

export const selectStylistSaving = (
  state: any
): boolean =>
  Boolean(
    state.stylists?.saving
  );

export const selectAttendanceLoading = (
  state: any
): boolean =>
  Boolean(
    state.stylists
      ?.attendanceLoading
  );

export const selectAttendanceSaving = (
  state: any
): boolean =>
  Boolean(
    state.stylists
      ?.attendanceSaving
  );

export const selectStylistError = (
  state: any
): string | null =>
  state.stylists?.error || null;

// =====================================================
// REDUCER
// =====================================================

export default stylistsSlice.reducer;