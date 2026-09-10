import { useEffect, useState } from "react";
import {
  fetchTipJar,
  postTip,
  tipServerBase,
  type TipJarStatus,
  type TipResponse,
} from "../lib/tipApi";

export function Tip() {
  const [jar, setJar] = useState<TipJarStatus | null>(null);
  const [offline, setOffline] = useState(false);
  const [amount, setAmount] = useState("2");
  const [from, setFrom] = useState("");
  const [memo, setMemo] = useState("Super suggestions de cocktails");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TipResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTipJar()
      .then((data) => {
        if (!cancelled) {
          setJar(data);
          setOffline(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOffline(true);
          setJar(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [result]);

  async function onSubmit(e: import("react").FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const n = Number(amount);
      const res = await postTip({
        amount: n,
        from: from.trim() || undefined,
        memo: memo.trim() || undefined,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setOffline(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1>Laisser un pourboire</h1>
      <p style={{ color: "var(--muted)" }}>
        Monétisation hors jeu d&apos;argent : les pourboires créditent le grand
        livre fictif de l&apos;agent via le tip-server existant (
        <code>{tipServerBase()}</code>). Pas de Stripe ni de processeurs de
        paiement réels — bac à sable seulement.
      </p>

      {offline && (
        <p className="alert err">
          Le serveur de pourboires semble hors ligne. Démarrez-le avec{" "}
          <code>npm run tip-server</code> à la racine du monorepo, puis
          actualisez. Vous pouvez aussi tipper en CLI :{" "}
          <code>npm run tip -- 2</code>.
        </p>
      )}

      {jar && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>État du pot à pourboires</h2>
          <p>
            <strong>Adresse :</strong>{" "}
            <code style={{ wordBreak: "break-all" }}>{jar.tipAddress}</code>
          </p>
          <p>
            <strong>Solde :</strong> {jar.balance} · <strong>Palier :</strong>{" "}
            {jar.tier}
            {jar.tierDetail ? ` — ${jar.tierDetail}` : ""}
          </p>
          {jar.note && (
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              {jar.note}
            </p>
          )}
        </div>
      )}

      <form className="card form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="amount">Montant (unités type USDC)</label>
          <input
            id="amount"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="from">De (étiquette optionnelle)</label>
          <input
            id="from"
            className="input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="invité"
          />
        </div>
        <div className="field">
          <label htmlFor="memo">Mémo</label>
          <input
            id="memo"
            className="input"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Envoi…" : "Envoyer le pourboire (POST /tip)"}
        </button>
      </form>

      {error && <p className="alert err">{error}</p>}
      {result && (
        <p className="alert ok">
          Pourboire enregistré : +{result.amount} → solde {result.balance},
          palier {result.tier}. Merci de soutenir Cocktail à votre goût.
        </p>
      )}
    </section>
  );
}
