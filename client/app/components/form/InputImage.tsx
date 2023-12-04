import React, { forwardRef } from "react";

interface Props {
  handleUploadImage: (e: any) => Promise<void>;
}

type Ref = HTMLInputElement;

const InputImage = forwardRef<Ref, Props>(({ handleUploadImage }, ref) => {
  return (
    <input
      id="imageInput"
      className="file-input file-input-bordered file-input-accent"
      ref={ref}
      type="file"
      accept="image/png, image/jpeg, image/jpg, image/webp"
      multiple
      onChange={handleUploadImage}
    />
  );
});

InputImage.displayName = "InputImage";

export default InputImage;
