import { useEffect } from "react";
import axiosInstance from "../lib/axiosInstance";
import { getToken } from "../lib/token";

const useAxios = () => {
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = getToken("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, []);

  return axiosInstance;
};

export default useAxios;
