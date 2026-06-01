import { type ReactNode } from "react";
import { StyledSafeAreaView } from "./styled";

interface ScreenLayoutProps {
  children: ReactNode;
}

export function ScreenLayout({ children }: ScreenLayoutProps) {
  return (
    <StyledSafeAreaView edges={["top"]} className="flex-1 bg-background">
      {children}
    </StyledSafeAreaView>
  );
}
