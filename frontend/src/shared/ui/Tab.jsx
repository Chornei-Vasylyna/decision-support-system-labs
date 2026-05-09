import { NavLink } from "react-router";

export const Tab = ({ to, label }) => (
  <NavLink
    to={to}
    end={to === "/"}
    className={({ isActive }) =>
      `px-4 py-3 text-base whitespace-nowrap border-b-2 transition-colors duration-150 ${
        isActive
          ? "border-stone-700 text-stone-800 font-medium"
          : "border-transparent text-stone-600 hover:text-stone-800"
      }`
    }
  >
    {label}
  </NavLink>
);