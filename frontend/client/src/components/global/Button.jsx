import "./Button.css";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  size = "md",
}) {
  const sizeClass = size !== "md" ? `btn-${size}` : "";
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${sizeClass} ${disabled ? "btn-disabled" : ""} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
