const SIZES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-20 h-20 text-xl",
};

export default function Avatar({ src, name, size = "sm", className = "" }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const sizeClasses = SIZES[size] || SIZES.sm;

  return (
    <div
      className={`shrink-0 rounded-full border-2 border-ink overflow-hidden ${sizeClasses} ${className}`}
    >
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-panel flex items-center justify-center font-display font-bold">
          {initial}
        </div>
      )}
    </div>
  );
}