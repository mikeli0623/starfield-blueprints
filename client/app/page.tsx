"use client";
import React, { useEffect } from "react";
import Featured from "./components/Featured";
import Posts from "./components/Posts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const queryClient = new QueryClient();

export default function Home() {
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex flex-col items-center py-12 md:py-24 lg:px-24 md:px-16 px-8 gap-8">
        <Featured />
        <Posts />
      </main>
    </QueryClientProvider>
  );
}
