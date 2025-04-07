const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-all duration-300">
      <div className="relative flex flex-col items-center">
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="h-20 w-20 animate-[spin_2s_linear_infinite] rounded-full border-4 border-primary/20" />
          
          {/* Main spinning circle */}
          <div className="absolute inset-0 h-20 w-20 animate-[spin_1.5s_linear_infinite] rounded-full border-t-4 border-primary" />

          {/* Inner gradient circle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gradient-to-tr from-primary/40 to-primary/10" />
          </div>
        </div>

        {/* Loading text with fade effect */}
        <div className="mt-8 flex items-center gap-1.5">
          <p className="animate-pulse text-center font-medium text-primary/80">
            Loading
          </p>
          <span className="animate-[bounce_1s_infinite] delay-100">.</span>
          <span className="animate-[bounce_1s_infinite] delay-200">.</span>
          <span className="animate-[bounce_1s_infinite] delay-300">.</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
