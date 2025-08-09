import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const Auth = () => {
  const navigate = useNavigate();

  useSEO({
    title: "Redirecting | CareConnect",
    description: "No sign in required. Redirecting to Settings.",
    canonical: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  useEffect(() => {
    navigate("/settings", { replace: true });
  }, [navigate]);

  return null;
};

export default Auth;
