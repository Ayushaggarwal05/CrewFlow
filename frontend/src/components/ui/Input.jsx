import { forwardRef, useState } from "react";
import { clsx } from "clsx";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(
  (
    { label, error, icon: Icon, className = "", type = "text", ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-dark-300">{label}</label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {Icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
              <Icon size={16} />
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={clsx(
              "input-base",
              Icon && "pl-9",
              isPassword && "pr-9", // space for eye icon
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className,
            )}
            {...props}
          />

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
