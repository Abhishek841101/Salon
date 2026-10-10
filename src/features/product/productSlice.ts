import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { RootState } from "../../store";

// ============================================================
// API URL
// ============================================================

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:5000/api";

// ============================================================
// AUTH HEADERS
// ============================================================

const getAuthHeaders = async () => {
  const token =
    await AsyncStorage.getItem("token");

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  };
};

// ============================================================
// TYPES
// ============================================================

export type Product = {
  _id: string;

  name: string;

  brand: string;

  category: string;

  unit: string;

  currentStock: number;

  minimumStock: number;

  purchasePrice: number;

  vendor: string;

  notes: string;

  isActive: boolean;

  stockStatus?: string;

  stockValue?: number;

  createdAt?: string;

  updatedAt?: string;
};

// ============================================================
// PRODUCT SUMMARY
// ============================================================

export type ProductSummary = {
  totalProducts: number;

  lowStock: number;

  outOfStock: number;

  totalStockValue: number;
};

// ============================================================
// BULK UPLOAD TYPES
// ============================================================

export type BulkUploadDuplicateRow = {
  row: number;

  name?: string;

  reason: string;

  productId?: string;
};

export type BulkUploadFailedRow = {
  row: number;

  name?: string;

  message: string;

  data?: Record<string, any>;
};

export type BulkUploadResult = {
  success: boolean;

  message: string;

  totalRows: number;

  created: number;

  duplicates: number;

  failed: number;

  products: Product[];

  duplicateRows: BulkUploadDuplicateRow[];

  failedRows: BulkUploadFailedRow[];
};

// ============================================================
// PRODUCT STATE
// ============================================================

type ProductState = {
  products: Product[];

  selectedProduct: Product | null;

  summary: ProductSummary;

  loading: boolean;

  summaryLoading: boolean;

  creating: boolean;

  updating: boolean;

  deleting: boolean;

  bulkUploading: boolean;

  bulkUploadResult: BulkUploadResult | null;

  error: string | null;
};

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: ProductState = {
  products: [],

  selectedProduct: null,

  summary: {
    totalProducts: 0,

    lowStock: 0,

    outOfStock: 0,

    totalStockValue: 0,
  },

  loading: false,

  summaryLoading: false,

  creating: false,

  updating: false,

  deleting: false,

  bulkUploading: false,

  bulkUploadResult: null,

  error: null,
};

// ============================================================
// FETCH PRODUCTS
// GET /api/products
// ============================================================

export const getProducts = createAsyncThunk<
  Product[],
  {
    search?: string;

    category?: string;

    status?:
      | "in_stock"
      | "low_stock"
      | "out_of_stock";

    active?: boolean;
  } | undefined,
  { rejectValue: string }
>(
  "products/getProducts",

  async (params, thunkAPI) => {
    try {
      const query =
        new URLSearchParams();

      if (params?.search) {
        query.append(
          "search",
          params.search
        );
      }

      if (params?.category) {
        query.append(
          "category",
          params.category
        );
      }

      if (params?.status) {
        query.append(
          "status",
          params.status
        );
      }

      if (
        params?.active !== undefined
      ) {
        query.append(
          "active",
          String(params.active)
        );
      }

      const queryString =
        query.toString();

      const url =
        `${API_URL}/products` +
        (
          queryString
            ? `?${queryString}`
            : ""
        );

      const headers =
        await getAuthHeaders();

      console.log(
        "PRODUCT API REQUEST:",
        url
      );

      console.log(
        "PRODUCT AUTH TOKEN:",
        headers.Authorization
          ? "Present"
          : "Missing"
      );

      const response =
        await fetch(url, {
          method: "GET",

          headers,
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to fetch products"
        );
      }

      return data.products || [];
    } catch (error: any) {
      console.error(
        "GET PRODUCTS ERROR:",
        error
      );

      return thunkAPI.rejectWithValue(
        error?.message ||
          "Failed to fetch products"
      );
    }
  }
);

// ============================================================
// GET PRODUCT BY ID
// GET /api/products/:id
// ============================================================

export const getProductById =
  createAsyncThunk<
    Product,
    string,
    { rejectValue: string }
  >(
    "products/getProductById",

    async (id, thunkAPI) => {
      try {
        const headers =
          await getAuthHeaders();

        const response =
          await fetch(
            `${API_URL}/products/${id}`,
            {
              method: "GET",

              headers,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to fetch product"
          );
        }

        return data.product;
      } catch (error: any) {
        console.error(
          "GET PRODUCT ERROR:",
          error
        );

        return thunkAPI.rejectWithValue(
          error?.message ||
            "Failed to fetch product"
        );
      }
    }
  );

// ============================================================
// CREATE PRODUCT
// POST /api/products
// ============================================================

export type CreateProductPayload = {
  name: string;

  brand?: string;

  category: string;

  unit: string;

  currentStock?: number;

  minimumStock?: number;

  purchasePrice?: number;

  vendor?: string;

  notes?: string;
};

// ============================================================
// CREATE PRODUCT THUNK
// ============================================================

export const createProduct =
  createAsyncThunk<
    Product,
    CreateProductPayload,
    { rejectValue: string }
  >(
    "products/createProduct",

    async (payload, thunkAPI) => {
      try {
        console.log(
          "CREATE PRODUCT REQUEST:",
          payload
        );

        const headers =
          await getAuthHeaders();

        console.log(
          "CREATE PRODUCT AUTH TOKEN:",
          headers.Authorization
            ? "Present"
            : "Missing"
        );

        const response =
          await fetch(
            `${API_URL}/products`,
            {
              method: "POST",

              headers,

              body: JSON.stringify({
                name:
                  payload.name.trim(),

                brand:
                  payload.brand?.trim() ||
                  "",

                category:
                  payload.category.trim(),

                unit:
                  payload.unit.trim(),

                currentStock:
                  Number(
                    payload.currentStock ||
                      0
                  ),

                minimumStock:
                  Number(
                    payload.minimumStock ||
                      0
                  ),

                purchasePrice:
                  Number(
                    payload.purchasePrice ||
                      0
                  ),

                vendor:
                  payload.vendor?.trim() ||
                  "",

                notes:
                  payload.notes?.trim() ||
                  "",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to create product"
          );
        }

        return data.product;
      } catch (error: any) {
        console.error(
          "CREATE PRODUCT ERROR:",
          error
        );

        return thunkAPI.rejectWithValue(
          error?.message ||
            "Failed to create product"
        );
      }
    }
  );

// ============================================================
// BULK UPLOAD PRODUCTS
// POST /api/products/bulk-upload
// ============================================================

export const bulkUploadProducts =
  createAsyncThunk<
    BulkUploadResult,
    FormData,
    { rejectValue: string }
  >(
    "products/bulkUploadProducts",

    async (formData, thunkAPI) => {
      try {
        console.log(
          "========================================"
        );

        console.log(
          "BULK PRODUCT UPLOAD REQUEST"
        );

        console.log(
          "========================================"
        );

        const token =
          await AsyncStorage.getItem(
            "token"
          );

        const headers: Record<
          string,
          string
        > = {};

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const response =
          await fetch(
            `${API_URL}/products/bulk-upload`,
            {
              method: "POST",

              headers,

              body: formData,
            }
          );

        const data =
          await response.json();

        console.log(
          "BULK PRODUCT UPLOAD RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to upload products"
          );
        }

        return data;
      } catch (error: any) {
        console.error(
          "BULK PRODUCT UPLOAD ERROR:",
          error
        );

        return thunkAPI.rejectWithValue(
          error?.message ||
            "Failed to upload products"
        );
      }
    }
  );

// ============================================================
// UPDATE PRODUCT
// PATCH /api/products/:id
// ============================================================

export const updateProduct =
  createAsyncThunk<
    Product,
    {
      id: string;

      data: Partial<
        CreateProductPayload
      > & {
        isActive?: boolean;
      };
    },
    { rejectValue: string }
  >(
    "products/updateProduct",

    async (
      { id, data: updateData },
      thunkAPI
    ) => {
      try {
        const headers =
          await getAuthHeaders();

        console.log(
          "UPDATE PRODUCT REQUEST:",
          id
        );

        console.log(
          "UPDATE PRODUCT AUTH TOKEN:",
          headers.Authorization
            ? "Present"
            : "Missing"
        );

        const response =
          await fetch(
            `${API_URL}/products/${id}`,
            {
              method: "PATCH",

              headers,

              body: JSON.stringify(
                updateData
              ),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to update product"
          );
        }

        return data.product;
      } catch (error: any) {
        console.error(
          "UPDATE PRODUCT ERROR:",
          error
        );

        return thunkAPI.rejectWithValue(
          error?.message ||
            "Failed to update product"
        );
      }
    }
  );

// ============================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ============================================================

export const deleteProduct =
  createAsyncThunk<
    string,
    string,
    { rejectValue: string }
  >(
    "products/deleteProduct",

    async (id, thunkAPI) => {
      try {
        const headers =
          await getAuthHeaders();

        console.log(
          "DELETE PRODUCT REQUEST:",
          id
        );

        console.log(
          "DELETE PRODUCT AUTH TOKEN:",
          headers.Authorization
            ? "Present"
            : "Missing"
        );

        const response =
          await fetch(
            `${API_URL}/products/${id}`,
            {
              method: "DELETE",

              headers,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to delete product"
          );
        }

        return id;
      } catch (error: any) {
        console.error(
          "DELETE PRODUCT ERROR:",
          error
        );

        return thunkAPI.rejectWithValue(
          error?.message ||
            "Failed to delete product"
        );
      }
    }
  );

// ============================================================
// GET PRODUCT SUMMARY
// GET /api/products/summary
// ============================================================

export const getProductSummary =
  createAsyncThunk<
    ProductSummary,
    void,
    { rejectValue: string }
  >(
    "products/getProductSummary",

    async (_, thunkAPI) => {
      try {
        const headers =
          await getAuthHeaders();

        console.log(
          "PRODUCT SUMMARY REQUEST:",
          `${API_URL}/products/summary`
        );

        console.log(
          "PRODUCT SUMMARY AUTH TOKEN:",
          headers.Authorization
            ? "Present"
            : "Missing"
        );

        const response =
          await fetch(
            `${API_URL}/products/summary`,
            {
              method: "GET",

              headers,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to fetch product summary"
          );
        }

        return data.summary;
      } catch (error: any) {
        console.error(
          "PRODUCT SUMMARY ERROR:",
          error
        );

        return thunkAPI.rejectWithValue(
          error?.message ||
            "Failed to fetch product summary"
        );
      }
    }
  );

// ============================================================
// SLICE
// ============================================================

const productSlice =
  createSlice({
    name: "products",

    initialState,

    reducers: {
      // ======================================================
      // CLEAR PRODUCT ERROR
      // ======================================================

      clearProductError: (
        state
      ) => {
        state.error = null;
      },

      // ======================================================
      // CLEAR SELECTED PRODUCT
      // ======================================================

      clearSelectedProduct: (
        state
      ) => {
        state.selectedProduct =
          null;
      },

      // ======================================================
      // SET SELECTED PRODUCT
      // ======================================================

      setSelectedProduct: (
        state,
        action: PayloadAction<Product>
      ) => {
        state.selectedProduct =
          action.payload;
      },

      // ======================================================
      // CLEAR PRODUCTS
      // ======================================================

      clearProducts: (
        state
      ) => {
        state.products = [];
      },

      // ======================================================
      // CLEAR BULK UPLOAD RESULT
      // ======================================================

      clearBulkUploadResult: (
        state
      ) => {
        state.bulkUploadResult =
          null;
      },
    },

    extraReducers: (
      builder
    ) => {
      // ======================================================
      // GET PRODUCTS
      // ======================================================

      builder
        .addCase(
          getProducts.pending,
          (state) => {
            state.loading = true;

            state.error = null;
          }
        )

        .addCase(
          getProducts.fulfilled,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.products =
              action.payload;
          }
        )

        .addCase(
          getProducts.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload ||
              "Failed to fetch products";
          }
        );

      // ======================================================
      // GET PRODUCT BY ID
      // ======================================================

      builder
        .addCase(
          getProductById.pending,
          (state) => {
            state.loading = true;

            state.error = null;
          }
        )

        .addCase(
          getProductById.fulfilled,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.selectedProduct =
              action.payload;
          }
        )

        .addCase(
          getProductById.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload ||
              "Failed to fetch product";
          }
        );

      // ======================================================
      // CREATE PRODUCT
      // ======================================================

      builder
        .addCase(
          createProduct.pending,
          (state) => {
            state.creating = true;

            state.error = null;
          }
        )

        .addCase(
          createProduct.fulfilled,
          (
            state,
            action
          ) => {
            state.creating = false;

            state.products.unshift(
              action.payload
            );

            state.selectedProduct =
              action.payload;
          }
        )

        .addCase(
          createProduct.rejected,
          (
            state,
            action
          ) => {
            state.creating = false;

            state.error =
              action.payload ||
              "Failed to create product";
          }
        );

      // ======================================================
      // BULK UPLOAD PRODUCTS
      // ======================================================

      builder
        .addCase(
          bulkUploadProducts.pending,
          (state) => {
            state.bulkUploading =
              true;

            state.error = null;

            state.bulkUploadResult =
              null;
          }
        )

        .addCase(
          bulkUploadProducts.fulfilled,
          (
            state,
            action
          ) => {
            state.bulkUploading =
              false;

            state.bulkUploadResult =
              action.payload;

            if (
              action.payload.products &&
              action.payload.products
                .length > 0
            ) {
              state.products = [
                ...action.payload.products,
                ...state.products,
              ];
            }
          }
        )

        .addCase(
          bulkUploadProducts.rejected,
          (
            state,
            action
          ) => {
            state.bulkUploading =
              false;

            state.error =
              action.payload ||
              "Failed to upload products";
          }
        );

      // ======================================================
      // UPDATE PRODUCT
      // ======================================================

      builder
        .addCase(
          updateProduct.pending,
          (state) => {
            state.updating = true;

            state.error = null;
          }
        )

        .addCase(
          updateProduct.fulfilled,
          (
            state,
            action
          ) => {
            state.updating = false;

            const index =
              state.products.findIndex(
                (product) =>
                  product._id ===
                  action.payload._id
              );

            if (index !== -1) {
              state.products[index] =
                action.payload;
            }

            state.selectedProduct =
              action.payload;
          }
        )

        .addCase(
          updateProduct.rejected,
          (
            state,
            action
          ) => {
            state.updating = false;

            state.error =
              action.payload ||
              "Failed to update product";
          }
        );

      // ======================================================
      // DELETE PRODUCT
      // ======================================================

      builder
        .addCase(
          deleteProduct.pending,
          (state) => {
            state.deleting = true;

            state.error = null;
          }
        )

        .addCase(
          deleteProduct.fulfilled,
          (
            state,
            action
          ) => {
            state.deleting = false;

            state.products =
              state.products.filter(
                (product) =>
                  product._id !==
                  action.payload
              );

            if (
              state.selectedProduct
                ?._id ===
              action.payload
            ) {
              state.selectedProduct =
                null;
            }
          }
        )

        .addCase(
          deleteProduct.rejected,
          (
            state,
            action
          ) => {
            state.deleting = false;

            state.error =
              action.payload ||
              "Failed to delete product";
          }
        );

      // ======================================================
      // PRODUCT SUMMARY
      // ======================================================

      builder
        .addCase(
          getProductSummary.pending,
          (state) => {
            state.summaryLoading =
              true;

            state.error = null;
          }
        )

        .addCase(
          getProductSummary.fulfilled,
          (
            state,
            action
          ) => {
            state.summaryLoading =
              false;

            state.summary =
              action.payload;
          }
        )

        .addCase(
          getProductSummary.rejected,
          (
            state,
            action
          ) => {
            state.summaryLoading =
              false;

            state.error =
              action.payload ||
              "Failed to fetch product summary";
          }
        );
    },
  });

// ============================================================
// ACTIONS
// ============================================================

export const {
  clearProductError,
  clearSelectedProduct,
  setSelectedProduct,
  clearProducts,
  clearBulkUploadResult,
} = productSlice.actions;

// ============================================================
// SELECTORS
// ============================================================

export const selectProducts = (
  state: RootState
) =>
  state.products?.products ?? [];

// ============================================================
// SELECTED PRODUCT
// ============================================================

export const selectSelectedProduct = (
  state: RootState
) =>
  state.products
    ?.selectedProduct ?? null;

// ============================================================
// PRODUCT SUMMARY
// ============================================================

export const selectProductSummary = (
  state: RootState
) =>
  state.products?.summary ?? {
    totalProducts: 0,

    lowStock: 0,

    outOfStock: 0,

    totalStockValue: 0,
  };

// ============================================================
// PRODUCT LOADING
// ============================================================

export const selectProductLoading = (
  state: RootState
) =>
  state.products?.loading ?? false;

// ============================================================
// SUMMARY LOADING
// ============================================================

export const selectProductSummaryLoading =
  (
    state: RootState
  ) =>
    state.products
      ?.summaryLoading ?? false;

// ============================================================
// PRODUCT CREATING
// ============================================================

export const selectProductCreating = (
  state: RootState
) =>
  state.products?.creating ?? false;

// ============================================================
// PRODUCT UPDATING
// ============================================================

export const selectProductUpdating = (
  state: RootState
) =>
  state.products?.updating ?? false;

// ============================================================
// PRODUCT DELETING
// ============================================================

export const selectProductDeleting = (
  state: RootState
) =>
  state.products?.deleting ?? false;

// ============================================================
// BULK UPLOADING
// ============================================================

export const selectProductBulkUploading = (
  state: RootState
) =>
  state.products?.bulkUploading ??
  false;

// ============================================================
// BULK UPLOAD RESULT
// ============================================================

export const selectProductBulkUploadResult = (
  state: RootState
) =>
  state.products?.bulkUploadResult ??
  null;

// ============================================================
// PRODUCT ERROR
// ============================================================

export const selectProductError = (
  state: RootState
) =>
  state.products?.error ?? null;

// ============================================================
// EXPORT REDUCER
// ============================================================

export default productSlice.reducer;