import { useState } from "react";
import { Link } from "react-router-dom"; 
import "./Dropdown.css";

export default function Dropdown({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="dropdown-btn">
        {title} <span style={{ fontSize: '0.75rem' }}>▼</span>
      </button>

      {open && (
        <div className="dropdown-menu">
          {children}
        </div>
      )}
    </div>
  );
}

Dropdown.Item = function DropdownItem({ children, to, onClick }) {
  if (onClick) {
    return (
      <div 
        className="dropdown-item"
        onClick={onClick}
        style={{ cursor: "pointer" }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="dropdown-item">
      <Link to={to}>{children}</Link>
    </div>
  );
};