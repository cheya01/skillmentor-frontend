import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router";

export default function PostAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { navigate("/login", { replace: true }); return; }

    const role = user?.publicMetadata?.role;
    navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
  }, [isLoaded, isSignedIn, user, navigate]);

  return null; // no flash
}
