const LoadingSpinner = ({ size = "md", color = "primary", className = "" }) => {
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { dotSize: 8, spacing: 4 };
      case "md":
        return { dotSize: 16, spacing: 8 };
      case "lg":
        return { dotSize: 24, spacing: 12 };
      case "xl":
        return { dotSize: 32, spacing: 16 };
      default:
        return { dotSize: 16, spacing: 8 };
    }
  };

  const getColorStyles = () => {
    switch (color) {
      case "primary":
        return "#2563eb"; // Blue
      case "secondary":
        return "#7c3aed"; // Purple
      case "white":
        return "#ffffff"; // White
      case "gray":
        return "#9ca3af"; // Gray
      case "emerald":
        return "#10b981"; // Emerald
      case "rose":
        return "#f43f5e"; // Rose
      default:
        return "#2563eb";
    }
  };

  const { dotSize, spacing } = getSizeStyles();
  const dotColor = getColorStyles();

  const containerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#111827", // Dark background
    ...(className ? { className } : {}),
  };

  const dotsContainerStyles = {
    display: "flex",
    gap: `${spacing}px`,
    alignItems: "center",
  };

  const dotStyles = {
    width: `${dotSize}px`,
    height: `${dotSize}px`,
    backgroundColor: dotColor,
    borderRadius: "50%",
    animation: "pulse-dot 1.2s ease-in-out infinite",
  };

  return (
    <div style={containerStyles}>
      <style>
        {`
              @keyframes pulse-dot {
                0% { transform: scale(1); opacity: 0.4; }
                50% { transform: scale(1.5); opacity: 1; }
                100% { transform: scale(1); opacity: 0.4; }
              }
            `}
      </style>
      <div style={dotsContainerStyles}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ ...dotStyles, animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
