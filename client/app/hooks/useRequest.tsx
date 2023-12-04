"use client";
import { useCallback, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { API_URL } from "../util/constants";

type RequestMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";

type Res<T> = { data: T; status: number };

interface APIResponse<T> {
  res: Res<T> | null;
  error: string | null;
  loading: boolean;
  fetchData: (queries?: string, newUrl?: any) => Promise<void>;
  mutate: (data: Object, newUrl?: any) => Promise<void>;
}

function useRequest<T>(method: RequestMethod, url?: string): APIResponse<T> {
  const [res, setRes] = useState<Res<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(
    async (queries = "", newUrl = null) => {
      setLoading(true);
      setError(null);
      try {
        let res: AxiosResponse<T>;
        switch (method) {
          case "GET":
            res = await axios.get<T>(API_URL + (newUrl || url) + queries, {
              withCredentials: true,
            });
            break;
          case "DELETE":
            res = await axios.delete<T>(API_URL + (newUrl || url), {
              withCredentials: true,
            });
            break;
          default:
            throw new Error("Invalid request method");
        }
        setRes({ data: res.data, status: res.status });
      } catch (err: any) {
        console.log(err);
        setError(err.response.data.message);
      } finally {
        setLoading(false);
      }
    },
    [method, url]
  );

  const mutate = useCallback(
    async (data: Object, newUrl = null) => {
      setLoading(true);
      setError(null);
      try {
        let res: AxiosResponse<T>;
        switch (method) {
          case "POST":
            res = await axios.post<T>(API_URL + (newUrl || url), data, {
              withCredentials: true,
            });
            break;
          case "PUT":
            res = await axios.put<T>(API_URL + (newUrl || url), data, {
              withCredentials: true,
            });
            break;
          case "PATCH":
            res = await axios.patch<T>(API_URL + (newUrl || url), data, {
              withCredentials: true,
            });
            break;
          default:
            throw new Error("Invalid request method");
        }
        setRes({ data: res.data, status: res.status });
      } catch (err: any) {
        console.log(err);
        // setError(err.message);
        setError(err.response.data.message);
      } finally {
        setLoading(false);
      }
    },
    [method, url]
  );

  return { res, error, loading, fetchData, mutate };
}

export default useRequest;
