import React, { useState } from "react";
import Button from "./Button";

interface Props {
  type: "design" | "user";
  item: {
    name: string;
    id: string;
  };
  handleDelete: (id: string) => void;
  children: React.ReactNode;
}

const titleMap = {
  design: "your design name",
  user: "your username",
};

const DeleteModal = ({ type, children, item, handleDelete }: Props) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  return (
    <dialog id={`delete-${type}-modal`} className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setInputValue("")}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg truncate">Deleting {item.name}</h3>
        {children}
        <h3 className="my-2 font-bold">
          Enter {titleMap[type]} below to confirm.
        </h3>
        <div className="join">
          <input
            type="text"
            placeholder={item.name}
            onChange={handleInput}
            value={inputValue}
            className="input input-bordered w-full max-w-xs join-item"
          />
          <div className="modal-action">
            <form method="dialog">
              <Button
                className={`${
                  inputValue === item.name ? "btn-error" : "btn-disabled"
                } join-item`}
                handleClick={() => {
                  setInputValue("");
                  handleDelete(item.id);
                }}
              >
                Delete
              </Button>
            </form>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setInputValue("")}>close</button>
      </form>
    </dialog>
  );
};

export default DeleteModal;
