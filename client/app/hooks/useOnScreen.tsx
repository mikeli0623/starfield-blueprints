import { useEffect, useState, useRef, RefObject } from "react";

export default function useOnScreen(
  ref: RefObject<HTMLElement>,
  threshold = 1
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isOnScreen, setIsOnScreen] = useState(false);
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setRatio(entry.intersectionRatio);
        setIsOnScreen(entry.isIntersecting);
      },
      { threshold }
    );
  }, [threshold, ref]);

  useEffect(() => {
    if (ref.current && observerRef.current) {
      observerRef.current.observe(ref.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [ref]);

  return { isOnScreen, ratio };
}
