import { useNavigate, useParams } from "@/router";
import { ChevronRight, Code } from "lucide-react";
import { useLocation } from "react-router";
import useSWR from "swr";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";

type NewsBreadcrumbs = {
  uuid: string;
  title: string;
};

type AdsBreadcrumbs = {
  uuid: string;
  title: string;
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const newsParams = useParams("/dashboard/news/:id");
  const adsParams = useParams("/dashboard/ads/:id");

  const isNewsPage = location.pathname.includes("/dashboard/news");
  const { data: newsDetail } = useSWR<NewsBreadcrumbs>(
    isNewsPage && newsParams.id ? `/news/news-cms/${newsParams.id}` : null,
  );

  const isAdsPage = location.pathname.includes("/dashboard/ads");
  const { data: adsDetail } = useSWR<AdsBreadcrumbs>(
    isAdsPage && adsParams.id ? `/ads/ads-cms/${adsParams.id}` : null,
  );

  // Function to render dynamic breadcrumbs based on current path
  const renderBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    let breadcrumbs = [];

    if (pathSegments.length < 2) {
      breadcrumbs.push(
        <BreadcrumbItem key="dashboard">
          <BreadcrumbPage className="font-medium">Dashboard</BreadcrumbPage>
        </BreadcrumbItem>,
      );
    }

    if (pathSegments.length > 1) {
      switch (pathSegments[1]) {
        case "users":
          breadcrumbs.push(
            <BreadcrumbItem key="users">
              <BreadcrumbPage className="font-medium">Users</BreadcrumbPage>
            </BreadcrumbItem>,
          );
          break;

        case "news":
          if (pathSegments.length > 2 && newsParams.id) {
            breadcrumbs.push(
              <BreadcrumbItem key="news">
                <BreadcrumbLink
                  onClick={() => navigate("/dashboard/news")}
                  className="hover:text-primary cursor-pointer text-sm font-medium transition-colors duration-200 ease-in-out md:block md:text-base"
                >
                  News
                </BreadcrumbLink>
              </BreadcrumbItem>,
            );

            breadcrumbs.push(
              <BreadcrumbItem key="separator-2">
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              </BreadcrumbItem>,
            );

            breadcrumbs.push(
              <BreadcrumbItem key="news-detail">
                {newsDetail ? (
                  <BreadcrumbPage
                    className="max-w-[100px] truncate text-sm font-medium md:max-w-[200px] md:text-base"
                    title={newsDetail.title}
                  >
                    {newsDetail.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbPage className="font-medium">
                    Loading...
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>,
            );
          } else {
            breadcrumbs.push(
              <BreadcrumbItem key="news">
                <BreadcrumbPage className="font-medium">News</BreadcrumbPage>
              </BreadcrumbItem>,
            );
          }
          break;

        case "ads":
          if (pathSegments.length > 2 && adsParams.id) {
            breadcrumbs.push(
              <BreadcrumbItem key="ads">
                <BreadcrumbLink
                  onClick={() => navigate("/dashboard/ads")}
                  className="hover:text-primary hidden cursor-pointer font-medium transition-colors duration-200 ease-in-out md:block"
                >
                  Ads
                </BreadcrumbLink>
                <BreadcrumbLink
                  onClick={() => navigate("/dashboard/ads")}
                  className="cursor-pointer text-sm font-medium md:hidden"
                >
                  Ads
                </BreadcrumbLink>
              </BreadcrumbItem>,
            );

            breadcrumbs.push(
              <BreadcrumbItem key="separator-2">
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              </BreadcrumbItem>,
            );

            breadcrumbs.push(
              <BreadcrumbItem key="ads-detail">
                {adsDetail ? (
                  <BreadcrumbPage
                    className="max-w-[100px] truncate text-sm font-medium md:max-w-[200px] md:text-base"
                    title={adsDetail.title}
                  >
                    {adsDetail.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbPage className="font-medium">
                    Loading...
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>,
            );
          } else {
            breadcrumbs.push(
              <BreadcrumbItem key="ads">
                <BreadcrumbPage className="font-medium">Ads</BreadcrumbPage>
              </BreadcrumbItem>,
            );
          }
          break;

        default:
          break;
      }
    }

    return breadcrumbs;
  };

  return (
    <nav className="bg-background sticky top-0 z-50 flex items-center justify-between p-4">
      {/* Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <SidebarTrigger variant={"ghost"} />
        <Breadcrumb>
          <BreadcrumbList>{renderBreadcrumbs()}</BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <Button>
          <Code className="h-4 w-4" />
          Source Code
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
