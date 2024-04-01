import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  handleClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
}

const Button = ({
  children,
  className,
  handleClick = () => {},
  disabled = false,
}: Props) => {
  return (
    <button
      className={`btn ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
