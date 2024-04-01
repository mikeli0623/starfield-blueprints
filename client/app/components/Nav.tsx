"use client";
import React, { useEffect, useState } from "react";
import Button from "./Button";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import useRequest from "../hooks/useRequest";
import homeIcon from "../../public/home.svg";
import userIcon from "../../public/user.svg";
import collapseClose from "../../public/collapse-close.svg";
import collapseOpen from "../../public/collapse-open.svg";
import { useRouter } from "next/navigation";

interface UserState {
  userId: string;
  iv: string;
  username: string;
  loggedIn: boolean;
}

const Nav = () => {
  const { state, dispatch } = useAuth();

  const [userState, setUserState] = useState<UserState>({
    userId: "",
    iv: "",
    username: "",
    loggedIn: false,
  });

  useEffect(() => {
    if (state.user)
      setUserState({
        userId: state.user.userId,
        iv: state.user.iv,
        username: state.user.username,
        loggedIn: state.user.loggedIn,
      });
    else
      setUserState({
        userId: "",
        iv: "",
        username: "",
        loggedIn: false,
      });
  }, [state]);

  const { fetchData } = useRequest("GET", "/auth/logout");

  const router = useRouter();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    fetchData();
    sessionStorage.clear();
    router.push("/");
  };

  const [hide, setHide] = useState<boolean>(false);

  return (
    <nav className="w-full bg-neutral flex items-center justify-end fixed z-50 px-4 py-2">
      <Button className="btn-circle" handleClick={() => setHide(!hide)}>
        <label className={`swap swap-rotate ${!hide ? "swap-active" : ""}`}>
          <Image
            src={collapseOpen}
            width={30}
            height={30}
            alt="open"
            className="swap-on"
          />
          <Image
            src={collapseClose}
            width={30}
            height={30}
            alt="close"
            className="swap-off"
            draggable={false}
          />
        </label>
      </Button>
      <Link href="/">
        <Button className="btn-circle">
          <Image
            src={homeIcon}
            alt="Home"
            width={30}
            height={30}
            draggable={false}
          />
        </Button>
      </Link>
      {!userState.loggedIn && (
        <Link href="/log_in">
          <Button className="btn-primary">Log In</Button>
        </Link>
      )}
      {!userState.loggedIn && (
        <Link href="/register">
          <Button className="btn-secondary">Register</Button>
        </Link>
      )}
      {userState.loggedIn && (
        <Link href="/">
          <Button className="btn-primary" handleClick={handleLogout}>
            Log Out
          </Button>
        </Link>
      )}
      {userState.loggedIn && (
        <Link href="/posts/add">
          <Button className="btn-accent">Upload</Button>
        </Link>
      )}
      {userState.loggedIn && state.user && (
        <p className="text-white">{userState.username}</p>
      )}
      {userState.loggedIn && (
        <Link href={`/users/view/${userState.userId}/${userState.iv}`}>
          <Button className="btn-circle">
            <Image
              src={userIcon}
              alt="User placeholder"
              width={35}
              height={35}
              draggable={false}
            />
          </Button>
        </Link>
      )}
    </nav>
  );
};

export default Nav;
