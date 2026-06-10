import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/cantieri", label: "Cantieri" },
  { to: "/dipendenti", label: "Dipendenti" },
  { to: "/attrezzature", label: "Attrezzature" },
  { to: "/impostazioni", label: "Impostazioni" },
];

export function AppLayout() {
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
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}