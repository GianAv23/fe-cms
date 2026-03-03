import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import notfoundImg from "/animation/not-found.png";
import mobileBottomGradient from "/animation/orange-gradient-mobile.png";
import desktopBottomGradient from "/animation/orange-gradient.png";
import { Link } from "@/router";
import useAuth from "@/hooks/use-auth";

const NotFound = () => {
  const auth = useAuth();

  const getStartLocation = () => {
    return auth.status === "authenticated" ? "/dashboard" : "/login";
  };

  return (
    <>
      <div className="flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-b from-white to-orange-100">
        <div className="relative z-100 flex flex-col gap-2">
          <div className="flex flex-col gap-4">
            <img src={notfoundImg} alt="Not Found" />
            <span className="text-foreground text-center text-lg font-medium">
              Oops! Page Not Found
            </span>
          </div>
          <Link
            to={getStartLocation()}
            className="mt-4 flex cursor-pointer rounded-lg bg-red-200 text-white"
          >
            <Button variant={"default"} className="flex-1">
              <ChevronLeft className="size-6" />
              Go Back
            </Button>
          </Link>
        </div>

        {/* Bottom gradient */}
        <picture className="absolute bottom-0 left-0 z-0 w-full">
          <source media="(min-width: 768px)" srcSet={desktopBottomGradient} />
          <source media="(max-width: 767px)" srcSet={mobileBottomGradient} />
          <img
            src={desktopBottomGradient}
            alt="Bottom Gradient"
            className="w-full"
          />
        </picture>
      </div>
    </>
  );
};

export default NotFound;
