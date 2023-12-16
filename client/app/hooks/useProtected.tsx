import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const useProtected = () => {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.user && !state.loading && !state.user.loggedIn) {
      router.push("/log_in");
    }
  }, [state, router]);
};

export default useProtected;
