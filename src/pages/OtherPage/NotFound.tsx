import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="Page Not Found - 404"
        description="The page you're looking for doesn't exist. Navigate back to explore our content."
      />
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The page you're looking for doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-500"
            >
              Go Back
            </button>
          </div>
        </div>
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} - Built with ❤️
        </p>
      </div>
    </>
  );
}
