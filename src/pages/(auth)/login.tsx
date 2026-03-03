import "@/App.css";
import LoginForm from "@/components/LoginForm";
import leftAvatar from "/animation/left-avatar.svg";
import rightAvatar from "/animation/right-avatar.svg";
import mobileBottomGradient from "/animation/orange-gradient-mobile.png";
import desktopBottomGradient from "/animation/orange-gradient.png";
import geaLogo from "/logo/gea.png";

const Login = () => {
  return (
    <>
      <div className="flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-b from-white to-orange-100">
        {/* Main content container */}
        <div className="relative flex w-[1050px] justify-center">
          <div className="relative z-10 flex w-[360px] flex-col gap-6 sm:w-md">
            <div
              className="flex cursor-pointer items-center justify-center"
              onClick={() => {
                window.location.href = "https://geamedical.com/";
              }}
            >
              <img src={geaLogo} alt="Logo" className="w-40" />
            </div>
            <LoginForm />
          </div>

          {/* Left avatar - hidden on mobile */}
          <div className="absolute top-1/2 left-0 z-0 hidden -translate-y-1/2 lg:block">
            <img
              src={leftAvatar}
              alt="Left Avatar"
              className="w-[260px]"
              style={{
                animation: "float 4s ease-in-out infinite",
              }}
            />
          </div>

          {/* Right avatar - hidden on mobile */}
          <div className="absolute top-1/2 right-0 z-0 hidden -translate-y-1/2 lg:block">
            <img
              src={rightAvatar}
              alt="Right Avatar"
              className="w-[320px]"
              style={{
                animation: "floatReverse 5s ease-in-out infinite",
              }}
            />
          </div>
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

export default Login;
