const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://10.71.192.9:5000/api";

export const apiRequest = async (
  endpoint: string,
  options: any = {}
) => {
  try {
    const {
      method = "GET",
      body,
      token,
      headers = {},
    } = options;

    const requestHeaders: any = {
      Accept: "application/json",
      ...headers,
    };

    if (!(body instanceof FormData)) {
      requestHeaders["Content-Type"] =
        "application/json";
    }

    if (token) {
      requestHeaders.Authorization =
        `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;

    console.log("API REQUEST:", method, url);

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body:
        body instanceof FormData
          ? body
          : body
          ? JSON.stringify(body)
          : undefined,
    });

    const text = await response.text();

    let data: any;

    try {
      data = text
        ? JSON.parse(text)
        : {};
    } catch {
      data = {
        success: false,
        message:
          text ||
          "Invalid server response",
      };
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error(
      "API ERROR:",
      error
    );

    throw error;
  }
};

export const getApiUrl = () =>
  API_URL;