const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="relative">
        {/* Main circle */}
        <div className="h-16 w-16 animate-[spin_1.5s_linear_infinite] rounded-full border-4 border-primary" />

        {/* Inner pulsing circle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-8 w-8 animate-ping rounded-full bg-primary/50" />
        </div>

        {/* Loading text */}
        <p className="mt-6 animate-pulse text-center font-semibold">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
