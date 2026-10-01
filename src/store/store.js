import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import clientsReducer from "../features/clients/clientsSlice";
import servicesReducer from "../features/services/serviceSlice";
import billsReducer from "../features/bills/billsSlice";
import bookingReducer from "../features/booking/bookingSlice";
import stylistsReducer from "../features/stylist/stylistSlice";
import attendanceReducer from "../features/attendance/attendanceSlice";
import productReducer from "../features/product/productSlice";
import expenseReducer from "../features/expense/expenseSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    services: servicesReducer,
    bills: billsReducer,
    booking: bookingReducer,
    stylists: stylistsReducer,
    attendance: attendanceReducer,
    products: productReducer,
    expense: expenseReducer,
  },
});

export default store;