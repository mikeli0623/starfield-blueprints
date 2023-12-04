import React, { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import closeIcon from "../../public/close.svg";

interface Props {
  imageUrl: string;
  onClose: () => void;
}

const FullImagePreview = ({ imageUrl, onClose }: Props) => {
  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if the pressed key is the ESC key (key code 27)
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    // Add event listener for the ESC key on mount
    window.addEventListener("keydown", handleKeyDown);

    // Remove the event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-10"
      onClick={handleClickOutside}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2 } }}
      exit={{ opacity: 0 }}
    >
      <div
        className="relative w-4/5 h-3/4 flex justify-center"
        onClick={handleClickOutside}
      >
        <motion.div
          className="indicator z-20 max-w-full max-h-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="indicator-item">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2 text-white"
              onClick={onClose}
            >
              <Image
                src={closeIcon}
                alt="close"
                width={40}
                height={40}
                className="svg-white"
              />
            </button>
          </div>
          {/*  eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Overlay"
            className="w-full h-full select-none object-contain"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FullImagePreview;
