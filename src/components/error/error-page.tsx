import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface ErrorPageProps {
  error?: Error | null;
  reset?: () => void;
}

export function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="mb-2 text-3xl font-bold">Oops! Something went wrong</h1>
      <p className="mb-6 max-w-md text-center text-muted-foreground">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Go to Home</Link>
        </Button>
        {reset && (
          <Button variant="neutral" onClick={reset}>
            Try Again
          </Button>
        )}
      </div>
      {error && process.env.NODE_ENV === "development" && (
        <div className="mt-8 rounded-md bg-muted p-4">
          <p className="font-mono text-sm">{error.message}</p>
        </div>
      )}
    </div>
  );
}
