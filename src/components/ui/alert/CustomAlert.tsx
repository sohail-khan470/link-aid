import { ReactNode, useEffect, useState } from "react";
import { XCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import clsx from "clsx";

interface CustomAlertProps {
  isOpen: boolean;
  title: string;
  text?: string;
  icon?: "success" | "warning" | "error" | "info";
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function CustomAlert({
  isOpen,
  title,
  text,
  icon = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  onConfirm,
  onCancel,
}: CustomAlertProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) setShow(true);
    else setTimeout(() => setShow(false), 300);
  }, [isOpen]);

  if (!show) return null;

  const getIcon = (): ReactNode => {
    const iconClasses = "w-14 h-14";
    switch (icon) {
      case "success":
        return <CheckCircle className={`${iconClasses} text-green-500`} />;
      case "error":
        return <XCircle className={`${iconClasses} text-red-500`} />;
      case "info":
        return <Info className={`${iconClasses} text-blue-500`} />;
      default:
        return <AlertTriangle className={`${iconClasses} text-yellow-500`} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className={clsx(
          "w-full max-w-md rounded-xl shadow-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-6 transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        <div className="flex flex-col items-center text-center gap-4">
          {getIcon()}
          <h2 className="text-2xl font-semibold">{title}</h2>
          {text && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
          )}
          <div className="mt-6 flex justify-center gap-3 w-full">
            {showCancel && (
              <button
                onClick={onCancel}
                className="w-full px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
