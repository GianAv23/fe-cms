import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useNavigate } from "@/router";
import {
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Newspaper,
  PanelTop,
  User,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import useSWR from "swr";
import packageJson from "../../package.json";
import { Button } from "./ui/button";
import questionImg from "/animation/question.png";
import geaLogo from "/logo/gea.png";

type User = {
  email: string;
  roles: string[];
};

const getAvailableMenus = (roles: string[] = []) => {
  const isAdmin = roles.includes("ADMIN");
  const isNewsEditor = roles.includes("NEWS_EDITOR");
  const isAdsEditor = roles.includes("ADS_EDITOR");

  const baseMenus = [];

  if (isAdmin) {
    baseMenus.push({
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    });

    baseMenus.push({
      name: "Users",
      url: "/dashboard/users",
      icon: User,
    });
  }

  if (isAdmin || isNewsEditor) {
    baseMenus.push({
      name: "News",
      url: "/dashboard/news",
      icon: Newspaper,
    });
  }

  if (isAdmin || isAdsEditor) {
    baseMenus.push({
      name: "Ads",
      url: "/dashboard/ads",
      icon: PanelTop,
    });
  }

  return baseMenus;
};

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const closeRef = useRef<HTMLButtonElement>(null);
  const auth = useAuth();

  const userData = useSWR<User>("/users/me");

  // Format user roles
  const userRole = (_role: string[] = []) => {
    const format = userData.data?.roles.filter((role) => role !== "USER");
    if (format?.length === 0) {
      return "User";
    }
    return format?.join(", ");
  };

  const userRoles = userData.data?.roles || [];
  const availableMenus = getAvailableMenus(userRoles);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Sidebar collapsible="icon" variant="inset">
        {/* Logo */}
        <SidebarHeader className="py-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigate("/dashboard")}
                className="h-fit cursor-pointer"
              >
                {state === "collapsed" ? (
                  <img
                    src={geaLogo}
                    className="h-8 w-8 object-contain"
                    alt="RD Logo"
                  />
                ) : (
                  <img src={geaLogo} className="h-14" />
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarSeparator className="mx-0" />

        {/* Menus */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-1">
                {availableMenus.map((menu) => (
                  <SidebarMenuItem key={menu.name}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "active:translate-y-0.1 h-10 items-center border font-medium active:scale-98",
                        location.pathname === menu.url
                          ? "text-accent-foreground border bg-white shadow-[0_4px_14px_0_rgba(0,0,0,0.04)]"
                          : "text-muted-foreground border-transparent",
                      )}
                    >
                      <Link to={menu.url}>
                        <menu.icon className="1rem" />
                        <span>{menu.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <SidebarMenuButton className="bg-accent w-full justify-between px-4 py-8">
                    <div className="flex items-center gap-4">
                      <User size={"1.2rem"} />
                      <div className="flex flex-col gap-1">
                        <span>{userData.data?.email}</span>
                        <div className="text-muted-foreground text-xs">
                          {userRole(userData.data?.roles) || "No roles"}
                        </div>
                      </div>
                    </div>
                    <ChevronsUpDown />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <LogOut className="h-[1.2rem] w-[1.2rem]" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="text-muted-foreground mt-2 text-xs">
                <span>Version: {packageJson.version}</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Dialog Start */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex flex-col justify-center p-4 md:max-w-lg">
          <DialogHeader className="flex flex-col items-center">
            <img src={questionImg} alt="Question" className="mb-6 w-14" />
            <DialogTitle>Log Out</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse md:flex-row">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1" ref={closeRef}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="bg-primary flex-1"
              onClick={() => {
                auth.logout();
                setDialogOpen(false);
              }}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog End */}
    </>
  );
};

export default AppSidebar;
