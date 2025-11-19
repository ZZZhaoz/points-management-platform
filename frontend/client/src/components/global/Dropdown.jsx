import { useState } from "react";
import { Link } from "react-router-dom"; 

export default function Dropdown({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="dropdown-btn">{title} ▼</button>

      {open && (
        <div className="dropdown-menu">
          {children}
        </div>
      )}
    </div>
  );
}

Dropdown.Item = function DropdownItem({ children, to }) {
  return (
    <div className="dropdown-item">
      <Link to={to}>{children}</Link>
    </div>
  );
};
