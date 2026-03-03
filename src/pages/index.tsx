import useAuth from "@/hooks/use-auth";
import { useNavigate } from "@/router";
import { useEffect } from "react";
import { toast } from "sonner";

const Root = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  // This effect runs whenever the authentication status changes. It handles redirection based on the user's authentication status and role.
  useEffect(() => {
    if (auth.status === "loading") return;

    if (auth.status === "unauthenticated") {
      navigate("/login");
      auth.logout();
      return;
    }

    const deletedUser =
      auth.user?.roles.length === 1 && auth.user?.roles.includes("DELETED");

    if (deletedUser) {
      toast.error("You are not authorized to access this page.");
      navigate("/login");
      auth.logout();
      return;
    }

    if (auth.status === "authenticated") {
      navigate("/dashboard");
      return;
    }
  }, [auth]);

  return null;
};

export default Root;
