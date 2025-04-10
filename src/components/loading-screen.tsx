const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-all duration-300">
      <div className="relative flex flex-col items-center">
        <div className="relative">
          {/* Outer rotating ring - darkened for better contrast */}
          <div className="h-20 w-20 animate-[spin_2s_linear_infinite] rounded-full border-4 border-black dark:border-white/40" />

          {/* Main spinning circle - increased opacity and contrast */}
          <div className="absolute inset-0 h-20 w-20 animate-[spin_1.5s_linear_infinite] rounded-full border-t-4 border-primary shadow-lg" />

          {/* Inner gradient circle - using stronger colors */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gradient-to-tr from-primary to-primary/60 shadow-md" />
          </div>
        </div>

        {/* Loading text with fade effect - using solid color instead of opacity */}
        <div className="mt-8 flex items-center gap-1.5">
          <p className="animate-pulse text-center font-medium text-black">
            Loading
          </p>
          <span className="animate-[bounce_1s_infinite] text-black delay-100">
            .
          </span>
          <span className="animate-[bounce_1s_infinite] text-black delay-200">
            .
          </span>
          <span className="animate-[bounce_1s_infinite] text-black delay-300">
            .
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
