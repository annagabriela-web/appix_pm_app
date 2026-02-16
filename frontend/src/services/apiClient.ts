import axios from "axios";

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function transformKeys(
  data: unknown,
  transformer: (key: string) => string
): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => transformKeys(item, transformer));
  }
  if (data !== null && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, value]) => [
        transformer(key),
        transformKeys(value, transformer),
      ])
    );
  }
  return data;
}

const apiClient = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Transform snake_case responses to camelCase
apiClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = transformKeys(response.data, snakeToCamel);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Transform camelCase requests to snake_case
apiClient.interceptors.request.use((config) => {
  if (config.data) {
    config.data = transformKeys(config.data, camelToSnake);
  }
  if (config.params) {
    config.params = transformKeys(config.params, camelToSnake);
  }
  return config;
});

export default apiClient;
