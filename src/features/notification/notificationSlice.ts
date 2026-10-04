import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://192.168.68.101:5000/api";

export interface NotificationClient {
  _id: string;
  name?: string;
  phone?: string;
  dateOfBirth?: string | null;
  anniversaryDate?: string | null;
}

export interface SalonNotification {
  _id: string;
  type: "birthday" | "anniversary";
  client: NotificationClient | string;
  title: string;
  message: string;
  eventDate: string;
  daysBefore: number;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: SalonNotification[];
  unreadNotifications: SalonNotification[];
  unreadCount: number;

  loading: boolean;
  markingRead: boolean;
  generating: boolean;

  error: string | null;
  success: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadNotifications: [],
  unreadCount: 0,

  loading: false,
  markingRead: false,
  generating: false,

  error: null,
  success: null,
};

// ==========================================
// GET AUTH TOKEN
// ==========================================

const getToken = async () => {
  const token =
    (await AsyncStorage.getItem("token")) ||
    (await AsyncStorage.getItem("authToken"));

  return token;
};

// ==========================================
// FETCH ALL NOTIFICATIONS
// ==========================================

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();

      const response = await fetch(
        `${API_URL}/notifications`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data?.message || "Failed to fetch notifications"
        );
      }

      return data.notifications || [];
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Network error"
      );
    }
  }
);

// ==========================================
// FETCH UNREAD NOTIFICATIONS
// ==========================================

export const fetchUnreadNotifications = createAsyncThunk(
  "notifications/fetchUnreadNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();

      const response = await fetch(
        `${API_URL}/notifications/unread`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data?.message || "Failed to fetch unread notifications"
        );
      }

      return data.notifications || [];
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Network error"
      );
    }
  }
);

// ==========================================
// MARK ONE AS READ
// ==========================================

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (
    notificationId: string,
    { rejectWithValue }
  ) => {
    try {
      const token = await getToken();

      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data?.message || "Failed to mark notification as read"
        );
      }

      return data.notification;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Network error"
      );
    }
  }
);

// ==========================================
// MARK ALL AS READ
// ==========================================

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();

      const response = await fetch(
        `${API_URL}/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data?.message ||
            "Failed to mark all notifications as read"
        );
      }

      return true;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Network error"
      );
    }
  }
);

// ==========================================
// GENERATE UPCOMING NOTIFICATIONS
// ==========================================

export const generateUpcomingNotifications =
  createAsyncThunk(
    "notifications/generateUpcomingNotifications",
    async (_, { rejectWithValue }) => {
      try {
        const token = await getToken();

        const response = await fetch(
          `${API_URL}/notifications/generate`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return rejectWithValue(
            data?.message ||
              "Failed to generate notifications"
          );
        }

        return data;
      } catch (error: any) {
        return rejectWithValue(
          error?.message || "Network error"
        );
      }
    }
  );

// ==========================================
// SLICE
// ==========================================

const notificationSlice = createSlice({
  name: "notifications",

  initialState,

  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },

    clearNotificationSuccess: (state) => {
      state.success = null;
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = [];
      state.unreadCount = 0;
    },
  },

  extraReducers: (builder) => {
    // ======================================
    // FETCH ALL
    // ======================================

    builder
      .addCase(
        fetchNotifications.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchNotifications.fulfilled,
        (state, action) => {
          state.loading = false;

          state.notifications = action.payload;

          state.unreadNotifications =
            action.payload.filter(
              (item: SalonNotification) =>
                !item.isRead
            );

          state.unreadCount =
            state.unreadNotifications.length;
        }
      )

      .addCase(
        fetchNotifications.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            (action.payload as string) ||
            "Failed to fetch notifications";
        }
      );

    // ======================================
    // FETCH UNREAD
    // ======================================

    builder
      .addCase(
        fetchUnreadNotifications.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchUnreadNotifications.fulfilled,
        (state, action) => {
          state.loading = false;

          state.unreadNotifications =
            action.payload;

          state.unreadCount =
            action.payload.length;

          // Keep all notifications in sync
          action.payload.forEach(
            (unreadNotification: SalonNotification) => {
              const index =
                state.notifications.findIndex(
                  (notification) =>
                    notification._id ===
                    unreadNotification._id
                );

              if (index >= 0) {
                state.notifications[index] =
                  unreadNotification;
              } else {
                state.notifications.unshift(
                  unreadNotification
                );
              }
            }
          );
        }
      )

      .addCase(
        fetchUnreadNotifications.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            (action.payload as string) ||
            "Failed to fetch unread notifications";
        }
      );

    // ======================================
    // MARK ONE READ
    // ======================================

    builder
      .addCase(
        markNotificationAsRead.pending,
        (state) => {
          state.markingRead = true;
          state.error = null;
        }
      )

      .addCase(
        markNotificationAsRead.fulfilled,
        (state, action) => {
          state.markingRead = false;

          const notificationId =
            action.payload?._id;

          // Remove from unread list
          state.unreadNotifications =
            state.unreadNotifications.filter(
              (notification) =>
                notification._id !== notificationId
            );

          state.unreadCount =
            state.unreadNotifications.length;

          // Update main list
          const index =
            state.notifications.findIndex(
              (notification) =>
                notification._id === notificationId
            );

          if (index >= 0) {
            state.notifications[index] = {
              ...state.notifications[index],
              ...action.payload,
              isRead: true,
            };
          }
        }
      )

      .addCase(
        markNotificationAsRead.rejected,
        (state, action) => {
          state.markingRead = false;

          state.error =
            (action.payload as string) ||
            "Failed to mark notification as read";
        }
      );

    // ======================================
    // MARK ALL READ
    // ======================================

    builder
      .addCase(
        markAllNotificationsAsRead.pending,
        (state) => {
          state.markingRead = true;
          state.error = null;
        }
      )

      .addCase(
        markAllNotificationsAsRead.fulfilled,
        (state) => {
          state.markingRead = false;

          state.notifications =
            state.notifications.map(
              (notification) => ({
                ...notification,
                isRead: true,
                readAt:
                  notification.readAt ||
                  new Date().toISOString(),
              })
            );

          state.unreadNotifications = [];
          state.unreadCount = 0;

          state.success =
            "All notifications marked as read";
        }
      )

      .addCase(
        markAllNotificationsAsRead.rejected,
        (state, action) => {
          state.markingRead = false;

          state.error =
            (action.payload as string) ||
            "Failed to mark all notifications as read";
        }
      );

    // ======================================
    // GENERATE
    // ======================================

    builder
      .addCase(
        generateUpcomingNotifications.pending,
        (state) => {
          state.generating = true;
          state.error = null;
        }
      )

      .addCase(
        generateUpcomingNotifications.fulfilled,
        (state, action) => {
          state.generating = false;

          state.success =
            action.payload?.message ||
            "Notifications checked successfully";
        }
      )

      .addCase(
        generateUpcomingNotifications.rejected,
        (state, action) => {
          state.generating = false;

          state.error =
            (action.payload as string) ||
            "Failed to generate notifications";
        }
      );
  },
});

export const {
  clearNotificationError,
  clearNotificationSuccess,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;