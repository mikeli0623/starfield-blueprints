import React from "react";
import Featured from "./components/Featured";
import Posts from "./components/Posts";

export default function Home() {
  return (
    <main className="flex flex-col items-center p-24">
      <Featured />
      <Posts />
    </main>
  );
}
