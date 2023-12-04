import React from "react";
import Button from "../Button";
import Image from "next/image";

interface Props {
  value: number;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  handleAdd: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleRemove: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export default function InputNumber({
  value,
  handleChange,
}: //   handleAdd,
//   handleRemove,
Props) {
  return (
    <div className="flex flex-row gap-2 items-center">
      {/* <Button handleClick={handleRemove}>
        <Image src="./remove.svg" alt="add" width={22} height={22} />{" "}
      </Button> */}

      <input
        className="input w-full"
        type="text"
        value={value}
        onChange={handleChange}
      />

      {/* <Button handleClick={handleAdd}>
        <Image src="./remove.svg" alt="add" width={22} height={22} />{" "}
      </Button> */}
    </div>
  );
}
