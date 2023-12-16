"use client";
import React, { useEffect } from "react";
import Featured from "./components/Featured";
import Posts from "./components/Posts";
import Test from "./components/Test";

export default function Home() {
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  return (
    <main className="flex flex-col items-center p-24">
      <Featured />
      <Posts />
      {/* <Test /> */}
    </main>
  );
}
