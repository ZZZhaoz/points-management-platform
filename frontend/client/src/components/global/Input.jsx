import "./Input.css";

export default function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  error = "",
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label className="input-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}

      <input
        className={`input-field ${error ? "input-error" : ""}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...props}
      />

      {error && <div className="input-error-message">{error}</div>}
    </div>
  );
}
