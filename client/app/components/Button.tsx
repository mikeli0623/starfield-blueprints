import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  handleClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const Button = ({ children, className, handleClick = () => {} }: Props) => {
  return (
    <button className={`btn ${className}`} onClick={handleClick}>
      {children}
    </button>
  );
};

export default Button;
