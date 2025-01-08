import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface SubmitButtonProps {
  isPending: boolean;
  children: ReactNode;
  className?: string;
  spinnerSize?: number;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
}

const SubmitButton = ({
  isPending,
  children,
  className,
  spinnerSize = 20,
  variant = "default",
}: SubmitButtonProps) => {
  return (
    <Button
    type="submit"
      className={`flex gap-2 ${className}`}
      variant={variant}
      disabled={isPending}
    >
      {isPending && (
        <Loader2 className="animate-spin" size={spinnerSize} />
      )}
      {children}
    </Button>
  );
};
export default SubmitButton