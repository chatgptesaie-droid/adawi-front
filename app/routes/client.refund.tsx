// app/routes/client.refund.tsx
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import ClientLayout from "~/components/client/ClientLayout";
import { readToken } from "~/utils/session.server";
import { AlertCircle, CheckCircle, RefreshCw, HelpCircle, ChevronRight } from "lucide-react";

export const meta: MetaFunction = () => [
  { title: "Demande de remboursement - Adawi" },
  { name: "description", content: "Formulaire de demande de remboursement" },
];

interface User {
  id: string;
  email: string;
  full_name: string;
}
interface Order {
  id: string;
  created_at: string;
  total: number;
}
interface LoaderData {
  user: User | null;
  orders: Order[];
  token: string;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const tokenData = await readToken(request);
    if (!tokenData) throw redirect("/login");

    const token =
      typeof tokenData === "string"
        ? (() => { try { return JSON.parse(tokenData)?.access_token || tokenData; } catch { return tokenData; } })()
        : tokenData;

    if (!token) throw redirect("/login");

    const [userRes, ordersRes] = await Promise.all([
      fetch("http://localhost:8000/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://localhost:8000/orders/", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const user = userRes.ok ? await userRes.json() : null;
    const orders = ordersRes.ok ? await ordersRes.json() : [];

    return json<LoaderData>({ user, orders, token });
  } catch (err: any) {
    return json<LoaderData>({ user: null, orders: [], token: "", error: err.message || "Erreur serveur" });
  }
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition";
const labelCls = "block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5";

export default function RefundRequest() {
  const { user, orders, token, error } = useLoaderData<LoaderData>();
  const [orderId, setOrderId] = useState(orders.length > 0 ? orders[0].id : "");
  const [reason, setReason] = useState("other");
  const [comment, setComment] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setSuccess(null);
    try {
      const response = await fetch("http://localhost:8000/refunds/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order_id: orderId, reason, comment, items }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.[0]?.msg || "Erreur lors de la demande");
      }
      const data = await response.json();
      setSuccess(`Demande soumise avec succès. Référence : ${data.id}`);
      setOrderId(orders.length > 0 ? orders[0].id : "");
      setReason("other");
      setComment("");
      setItems([]);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Soumettez votre demande", desc: "Remplissez le formulaire avec les détails de votre commande." },
    { num: 2, title: "Examen de la demande", desc: "Notre équipe examine votre demande sous 48 heures ouvrées." },
    { num: 3, title: "Remboursement effectué", desc: "Si validé, le remboursement est traité sous 5 à 7 jours." },
  ];

  return (
    <ClientLayout userName={user?.full_name}>
      <div className="min-h-screen bg-[#FAFAF8] space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-[#8B5E3C]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A] uppercase tracking-wide">Demande de remboursement</h1>
            <p className="text-xs text-[#6B6B6B]">Soumettez une demande pour une commande éligible</p>
          </div>
        </div>

        {/* Loader error */}
        {error && (
          <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 text-[#C0392B] mt-0.5 flex-shrink-0" />
            <p className="text-[#C0392B]">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide mb-5">Formulaire de demande</h2>

            {formError && (
              <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm mb-4">
                <AlertCircle className="w-4 h-4 text-[#C0392B] mt-0.5 flex-shrink-0" />
                <p className="text-[#C0392B]">{formError}</p>
              </div>
            )}
            {success && (
              <div className="flex gap-3 items-start bg-[#6B8F71]/10 border border-[#6B8F71]/20 rounded-2xl px-4 py-3 text-sm mb-4">
                <CheckCircle className="w-4 h-4 text-[#6B8F71] mt-0.5 flex-shrink-0" />
                <p className="text-[#6B8F71] font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {orders.length > 0 ? (
                <div>
                  <label className={labelCls}>Commande concernée</label>
                  <select value={orderId} onChange={e => setOrderId(e.target.value)} required className={inputCls}>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>
                        #{o.id.slice(-8)} — {new Date(o.created_at).toLocaleDateString("fr-FR")}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex gap-3 items-start bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-700">Aucune commande disponible pour un remboursement.</p>
                </div>
              )}

              <div>
                <label className={labelCls}>Raison du remboursement</label>
                <select value={reason} onChange={e => setReason(e.target.value)} className={inputCls}>
                  <option value="damaged">Article endommagé</option>
                  <option value="wrong_item">Article incorrect</option>
                  <option value="not_satisfied">Insatisfait</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Commentaire</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  placeholder="Décrivez votre situation en détail..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Articles à retourner</label>
                <input
                  type="text"
                  value={items.join(",")}
                  onChange={e => setItems(e.target.value.split(",").map(i => i.trim()))}
                  placeholder="IDs séparés par des virgules (optionnel)"
                  className={inputCls}
                />
                <p className="text-xs text-[#6B6B6B] mt-1">Laissez vide si la demande concerne toute la commande.</p>
              </div>

              <button
                type="submit"
                disabled={loading || orders.length === 0}
                className="w-full py-2.5 text-sm font-bold text-white bg-[#8B5E3C] rounded-xl hover:bg-[#5C3D1E] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Traitement...</>
                ) : (
                  <>Soumettre la demande</>
                )}
              </button>
            </form>
          </div>

          {/* Right: Info card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-[#8B5E3C]" />
                </div>
                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">Comment ça marche</h3>
              </div>
              <div className="space-y-4">
                {steps.map(step => (
                  <div key={step.num} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#8B5E3C] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1A1A1A]">{step.title}</p>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#8B5E3C]/5 rounded-2xl border border-[#8B5E3C]/10 p-5">
              <p className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wide mb-2">Conditions d'éligibilité</p>
              <ul className="space-y-1.5">
                {[
                  "Commande passée il y a moins de 30 jours",
                  "Article dans son état d'origine",
                  "Étiquettes non retirées",
                  "Accompagnée du bon de livraison",
                ].map(cond => (
                  <li key={cond} className="flex items-start gap-2 text-xs text-[#6B6B6B]">
                    <ChevronRight className="w-3 h-3 text-[#8B5E3C] mt-0.5 flex-shrink-0" />
                    {cond}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide mb-2">Besoin d'aide ?</p>
              <p className="text-xs text-[#6B6B6B] mb-3">Notre équipe support est disponible pour vous accompagner dans votre démarche.</p>
              <a href="/client/tickets" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5E3C] hover:text-[#5C3D1E] transition">
                Créer un ticket support
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
