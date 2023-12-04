import React from "react";
import { Reorder } from "framer-motion";
import Image from "next/image";
import Button from "@/app/components/Button";
import deleteIcon from "../../../public/delete.svg";
import expandIcon from "../../../public/expand.svg";

type ImageHandler = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  src: UploadedImage
) => void;

interface UploadedImage {
  url: string;
  file: File | null;
}

interface Props {
  image: UploadedImage;
  handleRemoveImage: ImageHandler;
  handlePreviewImage: ImageHandler;
}

const ImagePreview = ({
  image,
  handleRemoveImage,
  handlePreviewImage,
}: Props) => {
  return (
    <Reorder.Item
      value={image}
      className="border border-black w-full h-full flex items-center relative m-4 z-10 flex-col"
      drag="x"
    >
      <div className="w-full h-3/4 relative">
        <Image
          src={image.url}
          alt="user uploaded image"
          fill
          style={{ objectFit: "cover" }}
          draggable={false}
        />
      </div>
      <div className="flex p-4 items-center justify-evenly bg-slate-300 border-t-[1px] border-t-black w-full">
        <Button
          className="btn-circle btn-secondary"
          handleClick={(e) => handlePreviewImage(e, image)}
        >
          <Image src={expandIcon} alt="expand" width={35} height={35} />
        </Button>
        <Button
          className="btn-circle btn-primary"
          handleClick={(e) => handleRemoveImage(e, image)}
        >
          <Image src={deleteIcon} alt="delete" width={35} height={35} />
        </Button>
      </div>
    </Reorder.Item>
  );
};

export default ImagePreview;
