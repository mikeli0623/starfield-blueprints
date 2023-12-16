import React from "react";

interface Props {
  value: number;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  handleAdd: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleRemove: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export default function InputNumber({ value, handleChange }: Props) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <input
        className="input w-full"
        type="text"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
