import { useState } from "react";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import { Link } from "react-router";

interface HeaderProps {
  onClick?: () => void;
  onToggle: () => void;
}

const IconButton = ({
  onClick,
  children,
  className = "",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center w-10 h-10 text-gray-500 dark:text-gray-400 ${className}`}
  >
    {children}
  </button>
);

const HamburgerIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.583 1C0.583 0.586 0.919 0.25 1.333 0.25H14.667C15.081 0.25 15.417 0.586 15.417 1C15.417 1.414 15.081 1.75 14.667 1.75H1.333C0.919 1.75 0.583 1.414 0.583 1ZM0.583 11C0.583 10.586 0.919 10.25 1.333 10.25H14.667C15.081 10.25 15.417 10.586 15.417 11C15.417 11.414 15.081 11.75 14.667 11.75H1.333C0.919 11.75 0.583 11.414 0.583 11ZM1.333 5.25C0.919 5.25 0.583 5.586 0.583 6C0.583 6.414 0.919 6.75 1.333 6.75H8C8.414 6.75 8.75 6.414 8.75 6C8.75 5.586 8.414 5.25 8 5.25H1.333Z"
      fill="currentColor"
    />
  </svg>
);

const DotsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 10.5C6.828 10.5 7.5 11.167 7.5 12C7.5 12.833 6.828 13.5 6 13.5C5.172 13.5 4.5 12.833 4.5 12C4.5 11.167 5.172 10.5 6 10.5ZM18 10.5C18.828 10.5 19.5 11.167 19.5 12C19.5 12.833 18.828 13.5 18 13.5C17.172 13.5 16.5 12.833 16.5 12C16.5 11.167 17.172 10.5 18 10.5ZM13.5 12C13.5 11.167 12.828 10.5 12 10.5C11.172 10.5 10.5 11.167 10.5 12C10.5 12.833 11.172 13.5 12 13.5C12.828 13.5 13.5 12.833 13.5 12Z"
      fill="currentColor"
    />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onClick, onToggle }) => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const toggleApplicationMenu = () => setApplicationMenuOpen((prev) => !prev);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-between lg:flex-row lg:px-6">
        {/* Top Row */}
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 dark:border-gray-800 sm:gap-4 lg:border-b-0 lg:px-0 lg:py-4">
          <IconButton onClick={onToggle} className="lg:hidden">
            <HamburgerIcon />
          </IconButton>

          <IconButton
            onClick={onClick}
            className="hidden rounded-lg border border-gray-200 dark:border-gray-800 lg:flex lg:h-11 lg:w-11"
          >
            <HamburgerIcon />
          </IconButton>

          {/* Logo */}
          <Link to="/" className="lg:hidden">
            <img
              className="dark:hidden"
              src="./images/logo/dark.png"
              alt="Logo"
            />
            <img
              className="hidden dark:block"
              src="./images/logo/light.png"
              alt="Logo"
            />
          </Link>

          {/* App Menu Toggle (Mobile) */}
          <IconButton
            onClick={toggleApplicationMenu}
            className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <DotsIcon />
          </IconButton>
        </div>

        {/* Right-side Buttons (Notification, Theme, User) */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } w-full items-center justify-between gap-4 px-5 py-4 shadow-theme-md lg:flex lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
