import axios, {
  AxiosError,
  isAxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { useEffect } from "react";
import { toast } from "sonner";
import useAuth from "./use-auth";

interface AxiosRequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const baseUrl = import.meta.env.VITE_API_URL;

export const instance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

export let isRefreshing = false;
export let pendingRequests: Array<() => void> = [];
export const processPendingRequests = () => {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
};

export type ResponseModel<T = undefined> = {
  response: {
    code: number;
    message: string;
    data: T;
  };
};

export enum Responses {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  FORBIDDEN = 403,
  CONFLICT = 409,
  VALIDATION_ERROR = 422,
  INTERNAL_SERVER_ERROR = 500,
}

// useApi is a custom hook that sets up an Axios instance with interceptors for handling authentication
const useApi = () => {
  const auth = useAuth();

  useEffect(() => {
    const responseInterceptor = instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ResponseModel>) => {
        const originalRequest = error.config as AxiosRequestConfigWithRetry;

        if (
          error.response?.status === 401 &&
          !originalRequest?._retry &&
          !originalRequest?.url?.includes("/users/refresh-token") &&
          !originalRequest?.url?.includes("/users/login")
        ) {
          if (isRefreshing) {
            return new Promise((resolve) => {
              pendingRequests.push(() => {
                resolve(instance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            await axios.get<ResponseModel>(baseUrl + "/users/refresh-token", {
              withCredentials: true,
            });

            processPendingRequests();

            return instance(originalRequest);
          } catch (refreshError) {
            auth.logout();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      instance.interceptors.response.eject(responseInterceptor);
    };
  }, [auth]);

  return instance;
};

// useErrorToastHandler is a custom hook that handles errors by displaying a toast message
export const useErrorToastHandler = () => {
  return (
    error: AxiosError<ResponseModel | { statusCode: number; message: string }>,
  ) => {
    if (!isAxiosError(error)) {
      toast.message("Error", {
        description: "something went wrong or response structure is invalid.",
        duration: 1500,
      });
      return;
    }

    if (error.response) {
      const errorData = error.response.data;

      if ("message" in errorData && errorData.message === "Unauthorized") {
        return;
      }

      if ("statusCode" in errorData && "message" in errorData) {
        const message = errorData.message || "Unexpected error occurred.";

        toast.error(message, {
          duration: 1500,
        });
        return;
      }

      // Handle the original response structure
      if ("response" in errorData && errorData.response) {
        const message =
          errorData.response.message || "Unexpected error occurred.";

        toast.error(message, {
          description: message,
          duration: 1500,
        });
        return;
      }

      toast.error("Error", {
        description: "An unexpected error occurred.",
        duration: 1500,
      });
      return;
    }

    toast.error("Network Error", {
      description: "Please check your connection and try again.",
      duration: 1500,
    });
  };
};

// Custom hook for fetching data
export const useFetcher = () => {
  const api = useApi();
  const errorHandler = useErrorToastHandler();

  return (url: string) => {
    return api
      .get(url)
      .then((response) => response.data.response.data)
      .catch(errorHandler);
  };
};

export default useApi;
