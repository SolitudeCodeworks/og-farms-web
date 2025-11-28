interface LoadingSpinnerProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ message = "Loading...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <img 
        src="/images/weed-icon.png" 
        alt="Loading"
        className={`${sizeClasses[size]} animate-spin`}
      />
      <p className="text-white text-xl font-bold">{message}</p>
    </div>
  )
}
