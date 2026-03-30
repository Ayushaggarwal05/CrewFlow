import { clsx } from "clsx";

const Spinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  };
  return (
    <div
      className={clsx(
        "rounded-full border-dark-600 border-t-brand-500 animate-spin",
        sizes[size],
        className,
      )}
    />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-900">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-dark-400 text-sm animate-pulse">Loading...</p>
    </div>
  </div>
);

export const CardSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array(count)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
          <div className="flex gap-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
  </div>
);

export default Spinner;
