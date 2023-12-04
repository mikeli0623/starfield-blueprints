"use client";
import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import PasswordChecklist from "react-password-checklist";
import { useAuth } from "../context/AuthContext";
import useRequest from "../hooks/useRequest";
import Link from "next/link";
import Button from "../components/Button";
import Image from "next/image";
import visOnIcon from "../../public/visibility-on.svg";
import visOffIcon from "../../public/visibility-off.svg";
import { UserResponse } from "../util/types";
import toast from "react-hot-toast";
import InputPassword from "../components/form/InputPassword";

interface Credentials {
  username: string;
  password: string;
}

export default function Register() {
  const [isSuccess, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });

  const [remember, setRemember] = useState<boolean>(false);

  const { state, dispatch } = useAuth();

  const {
    mutate,
    res,
    error: errReq,
  } = useRequest<UserResponse>("POST", "/auth/login");

  const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>): void => {
    setErrorText("");
    const username = e.target.value;

    const sanitizedValue = username.replace(/\s/g, "");
    setCredentials((prev) => ({ ...prev, username: sanitizedValue }));
  };

  const handleChangePassword = (e: ChangeEvent<HTMLInputElement>): void => {
    setCredentials((prev) => ({ ...prev, password: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validPassword) return;
    dispatch({ type: "LOGIN_START" });
    mutate({
      username: credentials.username,
      password: credentials.password,
      remember: remember,
    });
  };

  useEffect(() => {
    if (res) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          username: res.data.username,
          loggedIn: true,
          userId: res.data.id,
          iv: res.data.iv,
          posts: res.data.posts,
          likedPosts: res.data.likedPosts,
        },
      });
      if (res.status === 200) {
        setSuccess(true);
      }
    }
  }, [res, dispatch]);

  useEffect(() => {
    if (errReq) dispatch({ type: "LOGIN_FAILURE", payload: errReq });
  }, [errReq, dispatch]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(`Welcome back, ${state.user?.username}`);
      router.push("/");
    }
  }, [isSuccess, router, state]);

  // const [validPassword, setValidPassword] = useState(false);
  const [validPassword, setValidPassword] = useState(true);

  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (errReq) setErrorText(errReq);
  }, [errReq]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-2">
      <h1 className="text-4xl">Log In</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-2"
      >
        <div className="form-control">
          <label className="label">
            <span className="label-text">Username</span>
          </label>
          <input
            type="text"
            id="username"
            value={credentials.username}
            onChange={handleChangeUsername}
            className={`input input-bordered ${errorText ? "input-error" : ""}`}
            required
            autoComplete="on"
          />
          {errorText && (
            <label className="label">
              <span className="label-text-alt text-error">{errorText}</span>
            </label>
          )}
        </div>
        <InputPassword
          type="Password"
          password={credentials.password}
          handleChangePassword={handleChangePassword}
        />
        {/* <PasswordChecklist
          onChange={(isValid) => setValidPassword(isValid)}
          rules={["minLength", "specialChar", "number", "capital"]}
          minLength={5}
          value={credentials.password}
          messages={{
            specialChar: "Password has a special character.",
          }}
        /> */}
        <div
          className="form-control"
          onChange={() => {
            setRemember(!remember);
          }}
        >
          <label className="label cursor-pointer">
            <span className="label-text mr-2">Remember me</span>
            <input
              type="checkbox"
              defaultChecked={false}
              className="checkbox"
            />
          </label>
        </div>
        <Button className="submit bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 join-item">
          Log In
        </Button>
        <p>
          Don&apos;t have an account?{" "}
          <Link className="underline" href="/register">
            Sign up.
          </Link>
        </p>
      </form>
    </main>
  );
}
