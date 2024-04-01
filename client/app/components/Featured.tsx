"use client";
import React, { useEffect, useState } from "react";
import Carousel from "./Carousel";
import useRequest from "../hooks/useRequest";
import { PostResponse } from "../util/types";

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
    <div className="w-full h-fit flex flex-col justify-center items-center gap-4">
      <h1>Designs of the Week</h1>
      <Carousel
        size="md"
        autoplay={true}
        images={images}
        placeholders={
          featuredRes?.data.map((post) => post.placeholderSVG) ?? []
        }
        hoverProps={featuredRes?.data}
      />
    </div>
  );
};

export default Featured;
