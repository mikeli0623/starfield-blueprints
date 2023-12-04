"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import { wrap } from "@popmotion/popcorn";
import { PostResponse } from "../util/types";
import { IMG_URL } from "../util/constants";
import Link from "next/link";

interface ButtonProps {
  handleClick: () => void;
  direction: string;
  show: boolean;
}

const CarouselButton = ({ handleClick, direction, show }: ButtonProps) => {
  return (
    <button
      className={`btn-accent btn-circle absolute z-10 ${
        direction === "prev" ? "left-4" : "right-4"
      } top-[50%] -translate-y-[50%] ${
        show ? "opacity-100" : "opacity-0"
      } transition-opacity`}
      onClick={handleClick}
    >
      <Image src={`/${direction}.svg`} alt={direction} width={50} height={50} />
    </button>
  );
};

interface CarouselProps {
  autoplay: boolean;
  images: string[];
  size: "md" | "lg";
  hoverProps?: PostResponse[] | undefined;
  preview?: boolean;
  children: React.ReactNode;
  img_prefix?: string;
}

const HEIGHTS = {
  lg: "h-[70vh]",
  md: "h-[60vh]",
};

const Carousel = ({
  autoplay,
  images,
  hoverProps,
  size,
  preview = false,
  img_prefix = IMG_URL,
  children,
}: CarouselProps) => {
  const sliderVariants = {
    incoming: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      scale: 1.2,
      opacity: 0,
    }),
    active: { x: 0, scale: 1, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      scale: 1,
      opacity: 0.2,
    }),
  };

  const sliderTransition = {
    duration: 1,
    ease: [0.56, 0.03, 0.12, 1.04],
  };

  const [[imageCount, direction], setImageCount] = useState([0, 0]);

  const activeImageIndex = wrap(0, images.length, imageCount);

  const swipeToImage = useCallback(
    (swipeDirection: 1 | -1) => {
      setImageCount([imageCount + swipeDirection, swipeDirection]);
    },
    [imageCount]
  );

  const skipToImage = (imageId: number) => {
    let changeDirection: number;
    if (imageId > activeImageIndex) {
      changeDirection = 1;
    } else if (imageId < activeImageIndex) {
      changeDirection = -1;
    } else return;
    setImageCount([imageId, changeDirection]);
  };

  const dragEndHandler = (dragInfo: PanInfo) => {
    const draggedDistance = dragInfo.offset.x;
    const swipeThreshold = 50;
    if (draggedDistance > swipeThreshold) {
      swipeToImage(-1);
    } else if (draggedDistance < -swipeThreshold) {
      swipeToImage(1);
    }
  };

  const autoScrollInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  useEffect(() => {
    if (!autoplay) return;
    autoScrollInterval.current = setInterval(() => {
      swipeToImage(1);
    }, 5000);

    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [swipeToImage, autoplay]);

  const [showButtons, setShowButtons] = useState<boolean>(false);

  if (images.length > 0)
    return (
      <div
        className={`relative overflow-hidden ${HEIGHTS[size]} lg:w-3/4 w-4/5 flex cursor-grab active:cursor-grabbing bg-gray-800 group`}
        onMouseEnter={() => {
          if (autoScrollInterval.current && autoplay) {
            clearInterval(autoScrollInterval.current);
            autoScrollInterval.current = null;
          }
          setShowButtons(true);
        }}
        onMouseLeave={() => {
          if (!autoScrollInterval.current && autoplay)
            autoScrollInterval.current = setInterval(() => {
              swipeToImage(1);
            }, 5000);
          setShowButtons(false);
        }}
      >
        {children}
        {preview && (
          <div className="z-40 absolute bottom-0 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out flex justify-center w-full h-1/5 overflow-x-auto gap-4 bg-gray-600/60 p-4">
            {images.map((image, i) => {
              return (
                <div
                  key={image}
                  className={`relative w-40 h-full transition-colors ${
                    activeImageIndex === i ? "border-white" : "border-black"
                  } border-2`}
                  onClick={() => skipToImage(i)}
                >
                  <Image
                    src={img_prefix + image}
                    alt={`Image ${i + 1}`}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              );
            })}
          </div>
        )}
        <CarouselButton
          handleClick={() => swipeToImage(-1)}
          direction="prev"
          show={showButtons}
        />
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={imageCount}
            custom={direction}
            variants={sliderVariants}
            initial="incoming"
            animate="active"
            exit="exit"
            transition={sliderTransition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, dragInfo) => dragEndHandler(dragInfo)}
            className="absolute h-full w-full"
          >
            <Image
              src={img_prefix + images[activeImageIndex]}
              alt="ship image"
              fill
              draggable={false}
              style={{ objectFit: "contain" }}
            />
            {hoverProps && (
              <div className="absolute inset-0 bg-black/30 bg-opacity-60 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out flex flex-col justify-between">
                <div className="text-white p-2 flex items-center">
                  <Link
                    href={`/posts/view/${hoverProps[activeImageIndex]._id}`}
                    className="flex items-center max-w-[85%]"
                  >
                    <h2 className="truncate text-lg font-bold underline">
                      {hoverProps[activeImageIndex].title}
                    </h2>
                  </Link>
                  <p className="text-sm mx-2 truncate">
                    by{" "}
                    <Link
                      href={`/users/view/${hoverProps[activeImageIndex].userId.id}/${hoverProps[activeImageIndex].userId.iv}`}
                    >
                      {hoverProps[activeImageIndex].username}
                    </Link>
                  </p>
                </div>
                <div className="p-4 text-white text-xs md:text-sm h-1/3 flex flex-col-reverse">
                  <p className="overflow-hidden w-full text-center">
                    {hoverProps[activeImageIndex].description}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <CarouselButton
          handleClick={() => swipeToImage(1)}
          direction="next"
          show={showButtons}
        />
      </div>
    );
  else return <div className={`skeleton lg:w-3/4 w-4/5 ${HEIGHTS[size]}`} />;
};

export default Carousel;
