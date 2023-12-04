import { useState, useEffect } from "react";

function useSessionStorage<T>(name: string) {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    setValue(JSON.parse(sessionStorage.getItem(name) || "null"));
  }, [name]);

  return value;
}

export default useSessionStorage;
