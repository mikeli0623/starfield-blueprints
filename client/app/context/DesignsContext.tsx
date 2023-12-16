"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import useRequest from "../hooks/useRequest";

interface DesignsContextProps {
  likedDesigns: string[];
  addLikedDesign: (designId: string) => void;
  removeLikedDesign: (designId: string) => void;
  isDesignLiked: (designId: string) => boolean;
  userDesigns: string[];
  addUserDesign: (designId: string) => void;
  removeUserDesign: (designId: string) => void;
  isUserDesign: (designId: string) => boolean;
}

const DesignsContext = createContext<DesignsContextProps | undefined>(
  undefined
);

export const DesignsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { state } = useAuth();

  const [likedDesigns, setLikedDesigns] = useState<string[]>([]);
  const [userDesigns, setUserDesigns] = useState<string[]>([]);

  const { mutate } = useRequest("PATCH");

  useEffect(() => {
    if (state.user) {
      setLikedDesigns(state.user.likedPosts);
      setUserDesigns(state.user.posts);
    }
  }, [state]);

  const addLikedDesign = useCallback(
    (designId: string) => {
      mutate({ liked: true }, `/posts/like/${designId}`);
      setLikedDesigns((prevDesigns) => [...prevDesigns, designId]);
    },
    [mutate]
  );

  const removeLikedDesign = useCallback(
    (designId: string) => {
      mutate({ liked: false }, `/posts/like/${designId}`);
      setLikedDesigns((prevDesigns) =>
        prevDesigns.filter((id) => id !== designId)
      );
    },
    [mutate]
  );

  const isDesignLiked = useCallback(
    (designId: string) => likedDesigns.includes(designId),
    [likedDesigns]
  );

  const addUserDesign = useCallback((designId: string) => {
    setUserDesigns((prevDesigns) => [...prevDesigns, designId]);
  }, []);

  const removeUserDesign = useCallback((designId: string) => {
    setUserDesigns((prevDesigns) =>
      prevDesigns.filter((id) => id !== designId)
    );
  }, []);

  const isUserDesign = useCallback(
    (designId: string) => userDesigns.includes(designId),
    [userDesigns]
  );

  const contextValue: DesignsContextProps = {
    likedDesigns,
    addLikedDesign,
    removeLikedDesign,
    isDesignLiked,
    userDesigns,
    addUserDesign,
    removeUserDesign,
    isUserDesign,
  };

  return (
    <DesignsContext.Provider value={contextValue}>
      {children}
    </DesignsContext.Provider>
  );
};

export const useDesigns = () => {
  const context = useContext(DesignsContext);
  if (!context) {
    throw new Error("useDesigns must be used within a DesignsProvider");
  }
  return context;
};
