import React from "react";

interface Props {
  text: string;
}

const ErrorText = ({ text }: Props) => {
  return <p className="text-error text-xl">{text}</p>;
};

export default ErrorText;
