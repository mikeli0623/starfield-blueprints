import React, { useState } from "react";
import Button from "../Button";
import visOnIcon from "../../../public/visibility-on.svg";
import visOffIcon from "../../../public/visibility-off.svg";
import Image from "next/image";

interface Props {
  password: string;
  type: string;
  key?: number;
  handleChangePassword: React.ChangeEventHandler<HTMLInputElement>;
}

const InputPassword = ({
  type,
  password,
  key = 0,
  handleChangePassword,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{type}</span>
      </label>
      <div className="join">
        <input
          type={showPassword ? "text" : "password"}
          id={`passsword-${key}`}
          value={password}
          onChange={handleChangePassword}
          className="input input-bordered join-item"
          required
          autoComplete="new-password"
        />
        <Button
          className={`join-item btn-outline swap swap-flip ${
            showPassword ? "swap-active" : ""
          }`}
          handleClick={(e) => {
            e.preventDefault();
            setShowPassword(!showPassword);
          }}
        >
          <Image
            className="swap-on"
            src={visOnIcon}
            alt="password visiblity on"
            width={25}
            height={25}
          />
          <Image
            className="swap-off"
            src={visOffIcon}
            alt="password visiblity off"
            width={25}
            height={25}
          />
        </Button>
      </div>
    </div>
  );
};

export default InputPassword;
