import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuthToken } from "../services/api";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/cantieri", label: "Cantieri" },
  { to: "/dipendenti", label: "Dipendenti" },
  { to: "/presenze", label: "Presenze" },
  { to: "/attrezzature", label: "Attrezzature" },
  { to: "/impostazioni", label: "Impostazioni" },
];

export function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAuthToken();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🌿</span>
          <div>
            <h1>GreenWork</h1>
            <p>Gestionale giardinaggio</p>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="logout-button" type="button" onClick={handleLogout}>
          Esci
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}