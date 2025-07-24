import type { IBackendRes } from "@/types/backend";
import axiosClient from "axios";
import { store } from "@/redux/store";
import { setRefreshTokenAction } from "@/redux/slice/accountSlice";

interface AccessTokenResponse {
  access_token: string;
}

/**
 * Creates an initial 'axios' instance with custom settings.
 */
const instance = axiosClient.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string,
  withCredentials: false, // Changed to false since our backend doesn't use cookies
});

const NO_RETRY_HEADER = 'x-no-retry';

const handleRefreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    const res = await instance.post<IBackendRes<AccessTokenResponse>>('/auth/refresh', {
      refreshToken
    });

    if (res && res.data && res.data.data) {
      return res.data.data.access_token;
    }
    return null;
  } catch (error) {
    return null;
  }
};

instance.interceptors.request.use(function (config) {
  if (typeof window !== "undefined" && window && window.localStorage && window.localStorage.getItem('access_token')) {
    config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('access_token');
  }
  if (!config.headers.Accept && config.headers["Content-Type"]) {
    config.headers.Accept = "application/json";
    config.headers["Content-Type"] = "application/json; charset=utf-8";
  }
  return config;
});

/**
 * Handle all responses. It is possible to add handlers
 * for requests, but it is omitted here for brevity.
 */
instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.config && error.response
      && +error.response.status === 401
      && error.config.url !== '/auth/login'
      && !error.config.headers[NO_RETRY_HEADER]
    ) {
      const access_token = await handleRefreshToken();
      error.config.headers[NO_RETRY_HEADER] = 'true'
      if (access_token) {
        error.config.headers['Authorization'] = `Bearer ${access_token}`;
        localStorage.setItem('access_token', access_token)
        return instance.request(error.config);
      }
    }

    if (
      error.config && error.response
      && +error.response.status === 400
      && error.config.url === '/auth/refresh'
    ) {
      const message = error?.response?.data?.message ?? "Session expired, please login again.";
      //dispatch redux action
      store.dispatch(setRefreshTokenAction({ status: true, message }));
    }

    return error?.response?.data ?? Promise.reject(error);
  }
);

export default instance;
