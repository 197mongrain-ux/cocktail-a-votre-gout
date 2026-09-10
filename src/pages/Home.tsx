import { Link } from "react-router-dom";
import { RECIPES } from "../data/recipes";

export function Home() {
  const classics = RECIPES.filter((r) => r.category === "classic").length;
  const specialty = RECIPES.filter((r) => r.category === "specialty").length;
  const zero = RECIPES.filter((r) => r.abvBand === "none").length;

  return (
    <section className="hero">
      <h1>Trouvez votre prochain cocktail, selon vos goûts.</h1>
      <p>
        Le quiz commence toujours par ton cocktail préféré, puis affine le profil
        de saveurs, la base spiritueuse et tes contraintes. Remplis{" "}
        <strong>Mon bar</strong> avec ce que tu as sous la main — on priorise le
        catalogue et on invente des <strong>spécialités maison</strong>.
      </p>
      <div className="btn-row">
        <Link className="btn btn-primary" to="/quiz">
          Commencer le quiz
        </Link>
        <Link className="btn" to="/pantry">
          Mon bar
        </Link>
        <Link className="btn" to="/tip">
          Laisser un pourboire
        </Link>
        <Link className="btn btn-ghost" to="/results">
          Parcourir les suggestions
        </Link>
      </div>
      <div className="card-grid" style={{ marginTop: "2rem" }}>
        <div className="card">
          <h3>{RECIPES.length} recettes</h3>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            {classics} classiques · {specialty} spécialités · {zero} zéro alcool
          </p>
        </div>
        <div className="card">
          <h3>Mon bar</h3>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Alcools, fruits, épices — filtre souple ou « seulement avec mon
            bar », plus créations maison.
          </p>
        </div>
        <div className="card">
          <h3>Pot à pourboires branché</h3>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Utilise le tip-server existant <code>POST /tip</code> en local.
          </p>
        </div>
      </div>
    </section>
  );
}
