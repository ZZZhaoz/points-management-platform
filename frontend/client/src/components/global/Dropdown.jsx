import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom"; 
import "./Dropdown.css";

export default function Dropdown({ title, children }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    // Small delay to allow moving to menu
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="dropdown"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="dropdown-btn">
        {title} <span style={{ fontSize: '0.75rem' }}>▼</span>
      </button>

      {open && (
        <div 
          className="dropdown-menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
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