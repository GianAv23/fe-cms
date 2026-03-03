import Loader from "@/components/Loader";
import useAuth from "@/hooks/use-auth";
import { useNavigate } from "@/router";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { toast } from "sonner";

const AuthLayout = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (auth.status !== "loading") {
      setAuthChecked(true);
    }
  }, [auth]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader withLogo={true} />
      </div>
    );
  }

  const deletedUser =
    auth.user?.roles?.length === 1 && auth.user.roles.includes("DELETED");
  if (deletedUser) {
    toast.error("You are not authorized to access this page.");
    navigate("/login");
    auth.logout();
    return;
  }

  const admin = auth.user?.roles.includes("ADMIN");
  if (admin && auth.status === "authenticated") {
    navigate("/dashboard");
    return;
  }

  const adsEditor = auth.user?.roles.includes("ADS_EDITOR");
  if (adsEditor && auth.status === "authenticated") {
    navigate("/dashboard/ads");
    return;
  }

  const newsEditor = auth.user?.roles.includes("NEWS_EDITOR");
  if (newsEditor && auth.status === "authenticated") {
    navigate("/dashboard/news");
    return;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
