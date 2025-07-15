interface LoadingSpinnerProps {
  size?: number;
}

const LoadingSpinner = ({ size = 64 }: LoadingSpinnerProps) => {
  const spinnerSize = `${size}px`;

  return (
    <div
      className="flex justify-center items-center"
      style={{ height: spinnerSize }}
    >
      <div
        className="animate-spin rounded-full border-t-2 border-b-2 border-blue-500"
        style={{
          width: spinnerSize,
          height: spinnerSize,
        }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
