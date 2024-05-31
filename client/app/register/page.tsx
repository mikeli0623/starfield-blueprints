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
import { matcher } from "../util/constants";
import InputPassword from "../components/form/InputPassword";

const MAX_USERNAME_LENGTH = 20;

interface Credentials {
  username: string;
  password: string;
}

export default function Register() {
  const [isSuccess, setSuccess] = useState<boolean>(false);
  const [hasProfanity, setHasProfanity] = useState<boolean>(false);
  const router = useRouter();

  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });

  const [retypedPassword, setRetypedPassword] = useState<string>("");

  const { dispatch } = useAuth();

  const {
    mutate: register,
    res,
    error: errReq,
  } = useRequest<UserResponse>("POST", "/auth/register");

  const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>): void => {
    const username = e.target.value;

    setHasProfanity(matcher.hasMatch(username));
    const sanitizedValue = username.replace(/\s/g, "");
    if (sanitizedValue.length <= MAX_USERNAME_LENGTH) {
      setCredentials((prev) => ({ ...prev, username: sanitizedValue }));
    }
  };

  const handleChangePassword = (e: ChangeEvent<HTMLInputElement>): void => {
    setCredentials((prev) => ({ ...prev, password: e.target.value }));
  };

  const handleRetypedPassword = (e: ChangeEvent<HTMLInputElement>): void => {
    setRetypedPassword(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validPassword || hasProfanity) return;
    dispatch({ type: "LOGIN_START" });
    register(credentials);
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
          posts: [],
          likedPosts: [],
        },
      });
      if (res.status === 201) {
        setSuccess(true);
      }
    }
  }, [res, dispatch]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Account made");
      router.push("/");
    }
  }, [isSuccess, router]);

  const [validPassword, setValidPassword] = useState(false);
  // const [validPassword, setValidPassword] = useState(true);

  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (errReq) setErrorText(errReq);
  }, [errReq]);

  return (
    <main className="flex min-h-screen flex-col items-center py-12 md:py-24 lg:px-24 md:px-16 px-8 gap-2">
      <h1>Register</h1>
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
            className={`input input-bordered ${
              hasProfanity || errorText ? "input-error" : ""
            }`}
            required
          />
          <label className="label">
            <span className="label-text-alt">
              {credentials.username.length}/{MAX_USERNAME_LENGTH}
            </span>
            <span className="label-text-alt text-error">
              {hasProfanity ? "No profanity" : errorText}
            </span>
          </label>
        </div>
        <InputPassword
          type="Password"
          password={credentials.password}
          handleChangePassword={handleChangePassword}
        />
        <InputPassword
          type="Retype Password"
          key={1}
          password={retypedPassword}
          handleChangePassword={handleRetypedPassword}
        />
        <PasswordChecklist
          onChange={(isValid) => setValidPassword(isValid)}
          rules={["minLength", "specialChar", "number", "capital", "match"]}
          minLength={5}
          value={credentials.password}
          valueAgain={retypedPassword}
          messages={{
            specialChar: "Password has a special character.",
          }}
        />
        <Button className="submit bg-blue-500 text-white px-4 py-2 hover:bg-blue-700 transition duration-300">
          Register
        </Button>
        <p>
          Have an account?{" "}
          <Link className="underline" href="/log_in">
            Sign In.
          </Link>
        </p>
      </form>
    </main>
  );
}
