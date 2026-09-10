import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Accueil", end: true },
  { to: "/quiz", label: "Quiz" },
  { to: "/pantry", label: "Mon bar" },
  { to: "/results", label: "Résultats" },
  { to: "/favorites", label: "Favoris" },
  { to: "/tip", label: "Pourboire" },
];

export function Layout() {
  return (
    <div className="app-shell">
      <nav className="nav">
        <div className="brand">
          <strong>Cocktail à votre goût</strong>
          <span>Des classiques et des créations, selon vos goûts.</span>
        </div>
        <div className="nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <Outlet />
      <p className="footer-note">
        MVP éducatif — recettes pour inspiration à la maison. Les pourboires
        créditent le grand livre bac à sable via tip-server (pas de paiements
        réels, pas de vente d&apos;alcool).
      </p>
    </div>
  );
}
