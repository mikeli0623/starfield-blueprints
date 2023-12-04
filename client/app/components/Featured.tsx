"use client";
import React, { useEffect, useState } from "react";
import Carousel from "./Carousel";
import useRequest from "../hooks/useRequest";
import { PostResponse } from "../util/types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Featured = () => {
  const {
    res: featuredRes,
    loading,
    error,
    fetchData,
  } = useRequest<PostResponse[]>("GET", "/posts/featured");

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (featuredRes) {
      setImages(featuredRes.data.map((post) => post.imageKeys[0]));
    }
  }, [featuredRes]);

  return (
    <div className="w-full h-fit flex flex-col justify-center items-center">
      <h1 className="text-3xl mb-4">Designs of the Week</h1>
      <Carousel
        size="md"
        autoplay={true}
        images={images}
        hoverProps={featuredRes?.data}
      >
        <Skeleton />
      </Carousel>
    </div>
  );
};

export default Featured;
