import { Link } from "react-router-dom";
import { RecipeCard } from "../components/RecipeCard";
import { getSaqFeaturedRecipes, RECIPES } from "../data/recipes";

export function Home() {
  const classics = RECIPES.filter((r) => r.category === "classic").length;
  const specialty = RECIPES.filter((r) => r.category === "specialty").length;
  const zero = RECIPES.filter((r) => r.abvBand === "none").length;
  const saqFeatured = getSaqFeaturedRecipes().slice(0, 8);

  return (
    <section className="hero">
      <h1>
        Trouvez votre prochain <span className="accent-script">cocktail</span>,
        selon vos goûts.
      </h1>
      <p>
        Le quiz commence toujours par ton cocktail préféré, puis affine le profil
        de saveurs, la base spiritueuse et tes contraintes. Remplis{" "}
        <strong>Mon Bar</strong> avec ce que tu as sous la main — on priorise le
        catalogue et on invente des <strong>spécialités maison</strong>. Explore
        aussi nos suggestions inspirées de classiques SAQ et de spiritueux
        québécois.
      </p>
      <div className="btn-row">
        <Link className="btn btn-primary" to="/quiz">
          Commencer le Quiz
        </Link>
        <Link className="btn" to="/pantry">
          Mon Bar
        </Link>
        <Link className="btn" to="/tip">
          Laisser un Pourboire
        </Link>
        <Link className="btn btn-ghost" to="/results">
          Parcourir les Suggestions
        </Link>
      </div>
      <div className="card-grid" style={{ marginTop: "2rem" }}>
        <div className="card">
          <h3>{RECIPES.length} Recettes</h3>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            {classics} classiques · {specialty} spécialités · {zero} zéro alcool
          </p>
        </div>
        <div className="card">
          <h3>Mon Bar</h3>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Alcools, fruits, épices — filtre souple ou « seulement avec mon
            bar », plus créations maison et chips produits vedettes Québec.
          </p>
        </div>
        <div className="card">
          <h3>Pot à Pourboires Branché</h3>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Utilise le tip-server existant <code>POST /tip</code> en local.
          </p>
        </div>
      </div>

      <div className="section-saq">
        <h2>Suggestions SAQ &amp; Produits Vedettes</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Classiques bien connus et torsions boréales — Gin Ungava, Vermouth
          Kayak, camerise, sirop d&apos;épinette, Distillerie du Fjord, Cirka…
        </p>
        <div className="card-grid">
          {saqFeatured.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              actions={
                <Link className="btn" to={`/recipe/${recipe.id}`}>
                  Voir
                </Link>
              }
            />
          ))}
        </div>
        <p className="disclaimer">
          Non affilié à la SAQ; suggestions inspirées de classiques et de
          produits disponibles au Québec.
        </p>
        <div className="btn-row" style={{ marginTop: "0.85rem" }}>
          <Link className="btn btn-ghost" to="/results">
            Voir toutes les vedettes →
          </Link>
        </div>
      </div>
    </section>
  );
}
