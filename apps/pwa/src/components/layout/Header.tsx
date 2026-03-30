import { Button } from "@/components/ui/button";
import {
  CalendarRange,
  Clock1,
  Flame,
  LogOut,
  Menu,
  MessageSquare,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

interface HeaderProps {
  menuContent?: ReactNode;
}

export function Header({ menuContent }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleSignOut() {
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 h-14">
        {/* Logo - Left */}
        <div className="shrink-0">
          <Button variant="ghost" size="icon-lg" onClick={() => navigate("/")}>
            <Flame className="size-6" />
          </Button>
        </div>

        {/* Navigation Icons - Center */}

        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => navigate("/chat")}
          aria-label="Chat"
        >
          <MessageSquare
            className={`size-6 ${location.pathname === "/chat" ? "text-primary" : ""}`}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => navigate("/daily")}
          aria-label="Daily view"
        >
          <Clock1
            className={`size-6 ${location.pathname === "/daily" ? "text-primary" : ""}`}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => navigate("/weekly")}
          aria-label="Weekly view"
        >
          <CalendarRange
            className={`size-6 ${location.pathname === "/weekly" ? "text-primary" : ""}`}
          />
        </Button>

        {/* Hamburger - Right */}
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-end px-4 py-3 border-b border-gray-100">
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-6" />
            </Button>
          </div>

          {/* Dynamic Menu Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">{menuContent}</div>

          {/* Sign Out - Bottom */}
          <div className="border-t border-gray-100 p-4">
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
