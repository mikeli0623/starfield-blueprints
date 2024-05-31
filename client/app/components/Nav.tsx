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

  return (
    <nav className="w-full bg-neutral flex items-center justify-between fixed z-50 px-2 md:px-4 py-1 md:py-2 gap-2">
      <Link href="/" className="w-full flex justify-start">
        <Button className="btn-circle hidden xl:inline-flex">
          <Image
            src={homeIcon}
            alt="Home"
            width={30}
            height={30}
            draggable={false}
          />
        </Button>
        <Button className="btn-circle btn-sm hidden md:inline-flex xl:hidden">
          <Image
            src={homeIcon}
            alt="Home"
            width={18}
            height={18}
            draggable={false}
          />
        </Button>
        <Button className="btn-circle btn-xs inline-flex md:hidden">
          <Image
            src={homeIcon}
            alt="Home"
            width={14}
            height={14}
            draggable={false}
          />
        </Button>
      </Link>
      <h1 className="text-sm lg:text-2xl 2xl:text-4xl text-white w-full text-center">
        Starfield Blueprints
      </h1>
      <div className="flex items-center justify-end gap-2 w-full">
        {!userState.loggedIn && (
          <Link href="/log_in">
            <Button className="btn-primary btn-xs md:btn-sm md:text-[10px] xl:btn-md text-[8px] xl:text-sm">
              Log In
            </Button>
          </Link>
        )}
        {!userState.loggedIn && (
          <Link href="/register">
            <Button className="btn-secondary btn-xs md:btn-sm md:text-[10px] xl:btn-md text-[8px] xl:text-sm">
              Register
            </Button>
          </Link>
        )}
        {userState.loggedIn && (
          <Link href="/">
            <Button
              className="btn-primary btn-xs md:btn-sm md:text-[10px] xl:btn-md text-[8px] xl:text-sm"
              handleClick={handleLogout}
            >
              Log Out
            </Button>
          </Link>
        )}
        {userState.loggedIn && (
          <Link href="/posts/add">
            <Button className="btn-accent btn-xs md:btn-sm md:text-[10px] xl:btn-md text-[8px] xl:text-sm">
              Upload
            </Button>
          </Link>
        )}
        {userState.loggedIn && (
          <Link href={`/users/view/${userState.userId}/${userState.iv}`}>
            <Button className="btn-circle hidden xl:inline-flex">
              <Image
                src={userIcon}
                alt="User placeholder"
                width={35}
                height={35}
                draggable={false}
              />
            </Button>
            <Button className="btn-circle btn-sm hidden md:inline-flex xl:hidden">
              <Image
                src={userIcon}
                alt="User placeholder"
                width={22}
                height={22}
                draggable={false}
              />
            </Button>
            <Button className="btn-circle btn-xs inline-flex md:hidden">
              <Image
                src={userIcon}
                alt="User placeholder"
                width={16}
                height={16}
                draggable={false}
              />
            </Button>
          </Link>
        )}
        {userState.loggedIn && state.user && (
          <p className="text-white truncate hidden sm:block text-xs lg:text-base">
            {userState.username}
          </p>
        )}
      </div>
    </nav>
  );
};

export default Nav;
