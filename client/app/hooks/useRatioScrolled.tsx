import { useEffect, useState, RefObject, useCallback } from "react";

export default function useRatioScrolled(ref: RefObject<HTMLElement>) {
  const [ratio, setRatio] = useState(0);

  const handleScroll = useCallback(() => {
    if (ref.current) {
      const scrollRef = ref.current;
      const actualHeight = scrollRef.scrollHeight - scrollRef.offsetHeight;
      const scrollHeight = scrollRef.scrollTop;
      setRatio(scrollHeight / actualHeight);
    }
  }, [ref]);

  useEffect(() => {
    if (ref.current) {
      const scrollRef = ref.current;
      scrollRef.addEventListener("scroll", handleScroll);

      return () => {
        scrollRef.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll, ref]);

  const removeListener = () => {
    if (ref.current) ref.current.removeEventListener("scroll", handleScroll);
  };

  const addListener = () => {
    if (ref.current) ref.current.addEventListener("scroll", handleScroll);
  };

  return { ratio, removeListener, addListener };
}
