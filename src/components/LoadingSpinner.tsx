
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-transparent bg-gradient-to-tr from-blue-500 to-purple-600 bg-clip-border",
        sizeClasses[size]
      )}>
        <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 m-[2px]"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
