import React from "react";

export default function DebouncedTextarea({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange">) {
  const [value, setValue] = React.useState<string>(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  return (
    <textarea
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
