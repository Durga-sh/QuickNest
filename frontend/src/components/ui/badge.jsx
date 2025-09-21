import React from "react";
const Badge = React.forwardRef(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    const variants = {
      default:
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 bg-slate-900 text-white",
      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-gray-100 text-gray-900",
      outline: "text-foreground border-gray-300",
    };
    const variantStyles = variants[variant] || variants.default;
    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${className}`}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
export { Badge };
