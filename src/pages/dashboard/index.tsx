import AdsCategoryDistribution from "@/components/AdsCategoryDistribution";
import AdsList from "@/components/AdsList";
import NewsCategoryDistribution from "@/components/NewsCategoryDistribution";
import NewsList from "@/components/NewsList";
import useAuth from "@/hooks/use-auth";
import { useNavigate } from "@/router";
import { type UserData } from "@/types";
import { useEffect } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type TotalUsersByStatus = {
  status: "ACTIVE" | "REQUEST";
  count: number;
};

type TotalUsersByRole = {
  role: "NEWS_EDITOR" | "ADS_EDITOR";
  count: number;
};

const Home = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: UserData } = useSWR<UserData>(`/users/me`);
  const { data: TotalUsers } = useSWR<number>(`/users/stats/total`);
  const { data: TotalUsersByStatus } = useSWR<TotalUsersByStatus[]>(
    `/users/stats/totalbystatus`,
  );
  const { data: TotalUsersByRole } = useSWR<TotalUsersByRole[]>(
    `/users/stats/totalbyrole`,
  );

  useEffect(() => {
    if (auth.status === "loading") return;

    const allowedRoles = ["ADMIN"];

    const hasAccess = auth.user?.roles.some((role) =>
      allowedRoles.includes(role),
    );

    if (!hasAccess) {
      toast.error("You are not authorized to access this page.");
      navigate("/login");
    }
  }, [auth]);

  return (
    <>
      <div className="m-1 flex min-h-svh flex-col gap-4 rounded-xl border bg-white p-2">
        <div className="flex flex-row items-center p-2">
          <div>
            <h1 className="text-lg font-medium md:text-2xl">
              Hi, {UserData?.full_name}
            </h1>
            <p className="text-muted-foreground text-sm md:w-full">
              View stats and more
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Total Users Start */}
          <div className="bg-sidebar flex flex-1 flex-col gap-2 rounded-md border p-2">
            <h2 className="text-muted-foreground text-sm font-medium">
              Total Users
            </h2>
            <p className="font-mono text-lg md:text-2xl">{TotalUsers}</p>
          </div>
          {/* Total Users End */}

          {/* Total Users by Status Start */}
          <div className="bg-sidebar flex flex-1 flex-col gap-2 rounded-md border p-2">
            <h2 className="text-muted-foreground text-sm font-medium">
              Total Users by Status
            </h2>
            <div className="flex w-full flex-row justify-between gap-2 text-sm">
              {TotalUsersByStatus?.map((status) => (
                <div key={status.status} className="flex flex-1 flex-row">
                  {status.status === "ACTIVE" && (
                    <>
                      <div className="bg-primary flex flex-1 flex-row items-center justify-between rounded-sm px-2 py-1 text-white">
                        <span className="font-medium">Active</span>
                        <span className="font-mono text-lg md:text-xl">
                          {status.count}
                        </span>
                      </div>
                    </>
                  )}
                  {status.status === "REQUEST" && (
                    <>
                      <div className="bg-muted text-muted-foreground flex flex-1 flex-row items-center justify-between rounded-sm px-2 py-1">
                        <span className="font-medium">Request</span>
                        <span className="font-mono text-lg md:text-xl">
                          {status.count}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Total Users by Status End */}

          {/* Total Users by Role Start */}
          <div className="bg-sidebar flex flex-1 flex-col gap-2 rounded-md border p-2">
            <h2 className="text-muted-foreground text-sm font-medium">
              Total Users by Role
            </h2>
            <div className="flex w-full flex-row justify-between gap-2 text-sm">
              {TotalUsersByRole?.map((profile) => (
                <div key={profile.role} className="flex flex-1 flex-row">
                  {profile.role === "NEWS_EDITOR" && (
                    <>
                      <div className="bg-primary flex flex-1 flex-row items-center justify-between rounded-sm px-2 py-1 text-white">
                        <span className="font-medium">News Editor</span>
                        <span className="font-mono text-lg md:text-xl">
                          {profile.count}
                        </span>
                      </div>
                    </>
                  )}
                  {profile.role === "ADS_EDITOR" && (
                    <>
                      <div className="bg-muted text-muted-foreground flex flex-1 flex-row items-center justify-between rounded-sm px-2 py-1">
                        <span className="font-medium">Ads Editor</span>
                        <span className="font-mono text-lg md:text-xl">
                          {profile.count}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Total Users by Role End */}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <NewsCategoryDistribution />
          </div>
          <div>
            <AdsCategoryDistribution />
          </div>
          <div>
            <NewsList />
          </div>
          <div>
            <AdsList />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
