"use client";
import React, {
  createContext,
  useEffect,
  useReducer,
  useContext,
  ReactNode,
} from "react";
import useRequest from "../hooks/useRequest";
import { UserResponse } from "../util/types";

interface User {
  username: string;
  userId: string;
  iv: string;
  loggedIn: boolean;
  posts: string[];
  likedPosts: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "REFRESH_USER"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: any }
  | { type: "LOGOUT" };

interface AuthContextProps {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}

const INITIAL_STATE: AuthState = {
  user: {
    username: "",
    userId: "",
    iv: "",
    loggedIn: false,
    posts: [],
    likedPosts: [],
  },
  loading: true,
  error: "",
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        loading: true,
        error: "",
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: "",
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      sessionStorage.clear();
      localStorage.clear();
      return {
        ...state,
        user: {
          username: "",
          userId: "",
          iv: "",
          loggedIn: false,
          posts: [],
          likedPosts: [],
        },
        loading: false,
        error: "",
      };
    case "REFRESH_USER":
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: "",
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  const {
    res: authRes,
    fetchData,
    error: authError,
  } = useRequest("GET", "/auth/loggedIn");

  const {
    res: userRes,
    fetchData: fetchUser,
    error: userError,
  } = useRequest<UserResponse>("GET", "/users/me");

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (authRes && !authError) fetchUser();
  }, [authError, authRes, fetchUser]);

  useEffect(() => {
    if (authError) {
      dispatch({
        type: "REFRESH_USER",
        payload: {
          username: "",
          userId: "",
          iv: "",
          loggedIn: false,
          posts: [],
          likedPosts: [],
        },
      });
    }
  }, [authError]);

  useEffect(() => {
    if (userRes && !userError) {
      dispatch({
        type: "REFRESH_USER",
        payload: {
          username: userRes.data.username,
          userId: userRes.data.id,
          iv: userRes.data.iv,
          loggedIn: true,
          posts: userRes.data.posts,
          likedPosts: userRes.data.likedPosts,
        },
      });
    }
  }, [userRes, userError]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
