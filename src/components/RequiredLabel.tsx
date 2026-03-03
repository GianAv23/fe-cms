import type { ReactNode } from "react";

const RequiredLabel = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex items-center">
      {children}
      <span className="text-muted-foreground ml-0.5">*</span>
    </div>
  );
};

export default RequiredLabel;
