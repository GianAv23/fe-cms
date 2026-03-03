import AppSidebar from "@/components/AppSidebar";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import useAuth from "@/hooks/use-auth";
import { useNavigate } from "@/router";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { toast } from "sonner";

const DashboardLayout = () => {
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

  if (auth.status === "unauthenticated") {
    navigate("/login");
    auth.logout();
    return;
  }

  const deletedUser =
    auth.user?.roles?.length === 1 && auth.user.roles.includes("DELETED");
  if (deletedUser) {
    toast.error("You are not authorized to access this page.");
    navigate("/login");
    auth.logout();
    return;
  }

  return (
    <>
      <div className="bg-background flex">
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar />
          <main className="w-full">
            <Navbar />
            <Outlet />
          </main>
        </SidebarProvider>
      </div>
    </>
  );
};

export default DashboardLayout;
