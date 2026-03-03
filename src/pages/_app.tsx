import Loader from "@/components/Loader";
import { useFetcher } from "@/hooks/use-api";
import useAuth from "@/hooks/use-auth";
import { Outlet, ScrollRestoration } from "react-router";
import { Toaster } from "sonner";
import { SWRConfig } from "swr";
import "../App.css";

const GlobalLayout = () => {
  const fetcher = useFetcher();
  const auth = useAuth();

  return (
    <>
      <ScrollRestoration />
      <SWRConfig
        value={{
          fetcher,
          refreshInterval: 15 * 1000, // Refresh data every 15 seconds
        }}
      >
        {auth.status === "loading" && (
          <div className="flex min-h-screen items-center justify-center">
            <Loader withLogo={true} />
          </div>
        )}

        <Toaster position="top-center" closeButton={true} />
        {auth.status !== "loading" && <Outlet />}
      </SWRConfig>
    </>
  );
};

export default GlobalLayout;
