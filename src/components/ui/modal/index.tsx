import { useRef, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  isFullscreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  isFullscreen = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC key closes modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // If not open, render nothing
  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900";

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center px-4"
      onClick={onClose} // 🔴 click outside triggers close
    >
      {/* Backdrop Blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        ref={modalRef}
        className={`${contentClasses} z-10 ${className}`}
        onClick={(e) => e.stopPropagation()} // 🛑 prevent modal content from closing on inner click
      >
        {children}
      </div>
    </div>
  );
};
