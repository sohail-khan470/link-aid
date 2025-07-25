import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const handlePrevPage = () => onPageChange(Math.max(currentPage - 1, 1));
  const handleNextPage = () => onPageChange(Math.min(currentPage + 1, totalPages));

  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className="flex items-center gap-2 text-sm px-3 py-1.5 border rounded disabled:opacity-50 dark:text-white"
      >
        <ChevronLeft size={16} /> Previous
      </button>
      <span className="text-sm text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 text-sm px-3 py-1.5 border rounded disabled:opacity-50 dark:text-white"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}