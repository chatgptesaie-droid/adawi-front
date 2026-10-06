import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { Package, Clock, Truck, CheckCircle, AlertCircle, Search, HelpCircle, ChevronRight } from "lucide-react";
import ClientLayout from "~/components/client/ClientLayout";
import { readToken } from "~/utils/session.server";
import { Link } from "@remix-run/react";

interface TrackingStep {
  status: string;
  label: string;
  reached: boolean;
  date: string | null;
}
interface TrackingHistory {
  status: string;
  changed_at: string;
  comment: string;
}
interface TrackingResponse {
  order_id: string;
  current_status: string;
  steps: TrackingStep[];
  history: TrackingHistory[];
}
interface User {
  id: string;
  email: string;
  full_name: string;
}
interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
}

interface LoaderData {
  user: User | null;
  token: string;
  orders: Order[];
  error?: string;
}
interface ActionData {
  trackingData?: TrackingResponse;
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
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
    const orders: Order[] = ordersRes.ok ? await ordersRes.json() : [];

    return json<LoaderData>({ user, token, orders });
  } catch (err: any) {
    return json<LoaderData>({ user: null, token: "", orders: [], error: err.message || "Erreur serveur" });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const orderId = formData.get("orderId") as string;

  if (!orderId?.trim()) {
    return json<ActionData>({ error: "Veuillez saisir un ID de commande" }, { status: 400 });
  }

  try {
    const tokenData = await readToken(request);
    const token =
      typeof tokenData === "string"
        ? (() => { try { return JSON.parse(tokenData)?.access_token || tokenData; } catch { return tokenData; } })()
        : tokenData;

    if (!token) return json<ActionData>({ error: "Non authentifié" }, { status: 401 });

    const response = await fetch(`http://localhost:8000/orders/${orderId.trim()}/tracking`, {
      method: "GET",
      headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return json<ActionData>({ error: `Erreur ${response.status}: ${response.statusText}` }, { status: response.status });
    }

    const trackingData: TrackingResponse = await response.json();
    return json<ActionData>({ trackingData });
  } catch (error) {
    return json<ActionData>({ error: error instanceof Error ? error.message : "Une erreur est survenue" }, { status: 500 });
  }
}

function getStepIcon(status: string, reached: boolean, isCurrent: boolean) {
  if (!reached) return <Clock className="w-4 h-4 text-gray-400" />;
  if (isCurrent) {
    switch (status) {
      case "en_cours": return <Package className="w-4 h-4 text-white" />;
      case "expediee": return <Truck className="w-4 h-4 text-white" />;
      case "livree": return <CheckCircle className="w-4 h-4 text-white" />;
      default: return <Package className="w-4 h-4 text-white" />;
    }
  }
  return <CheckCircle className="w-4 h-4 text-white" />;
}

function formatDate(d: string | null) {
  if (!d) return "En attente";
  return new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "en_cours": return "bg-blue-50 text-blue-700 border-blue-200";
    case "en_preparation": return "bg-amber-50 text-amber-700 border-amber-200";
    case "expediee": return "bg-orange-50 text-orange-700 border-orange-200";
    case "livree": return "bg-[#6B8F71]/10 text-[#6B8F71] border-[#6B8F71]/20";
    default: return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "en_cours": return "En cours";
    case "en_preparation": return "En préparation";
    case "expediee": return "Expédiée";
    case "livree": return "Livrée";
    default: return status;
  }
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition";

export default function TrackingPage() {
  const { user, orders, error: loaderError } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const tracking = actionData?.trackingData;

  return (
    <ClientLayout userName={user?.full_name}>
      <div className="min-h-screen bg-[#FAFAF8] space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-[#8B5E3C]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A] uppercase tracking-wide">Suivi de commande</h1>
            <p className="text-xs text-[#6B6B6B]">Suivez l'état de votre commande en temps réel</p>
          </div>
        </div>

        {/* Loader error */}
        {loaderError && (
          <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 text-[#C0392B] mt-0.5 flex-shrink-0" />
            <p className="text-[#C0392B]">{loaderError}</p>
          </div>
        )}

        {/* Search card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <Form method="post">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="orderId" className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5">
                  Sélectionner une commande
                </label>
                {orders.length > 0 ? (
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      id="orderId"
                      name="orderId"
                      required
                      defaultValue=""
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition appearance-none cursor-pointer"
                    >
                      <option value="" disabled>-- Choisir une commande --</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          #{order.id.slice(-8).toUpperCase()} &nbsp;—&nbsp;
                          {new Date(order.created_at).toLocaleDateString("fr-FR")} &nbsp;—&nbsp;
                          {order.total.toLocaleString()} F CFA &nbsp;—&nbsp;
                          {getStatusLabel(order.status)}
                        </option>
                      ))}
                    </select>
                    {/* chevron décoratif */}
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                ) : (
                  /* Fallback input texte si aucune commande */
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="orderId"
                      name="orderId"
                      placeholder="Ex: CMD-123456"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition"
                      required
                    />
                  </div>
                )}
              </div>
              <div className="sm:pt-7">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8B5E3C] text-white text-sm font-bold rounded-xl hover:bg-[#5C3D1E] transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Recherche...</>
                  ) : (
                    <>Suivre</>
                  )}
                </button>
              </div>
            </div>
          </Form>

          {orders.length === 0 && !loaderError && (
            <p className="text-xs text-[#6B6B6B] mt-3 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#C9A96E]" />
              Vous n'avez pas encore de commandes. Saisissez l'ID manuellement.
            </p>
          )}

          {actionData?.error && (
            <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm mt-4">
              <AlertCircle className="w-4 h-4 text-[#C0392B] mt-0.5 flex-shrink-0" />
              <p className="text-[#C0392B]">{actionData.error}</p>
            </div>
          )}
        </div>

        {/* Tracking results */}
        {tracking && (
          <div className="space-y-5">
            {/* Order header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">Commande #{tracking.order_id}</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">Statut mis à jour en temps réel</p>
              </div>
              <span className={`self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-3 py-1 border ${getStatusBadge(tracking.current_status)}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {getStatusLabel(tracking.current_status)}
              </span>
            </div>

            {/* Stepper */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#8B5E3C]" />
                </div>
                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">Progression</h3>
              </div>

              {/* Horizontal stepper */}
              <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
                {tracking.steps.map((step, index) => {
                  const isLast = index === tracking.steps.length - 1;
                  const isCurrent = step.reached && (!tracking.steps[index + 1]?.reached);
                  return (
                    <div key={index} className="flex items-center flex-shrink-0">
                      <div className="flex flex-col items-center">
                        {/* Circle */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center
                          ${isCurrent ? "bg-[#8B5E3C] ring-4 ring-[#8B5E3C]/20" :
                            step.reached ? "bg-[#6B8F71]" : "bg-gray-100 border-2 border-gray-200"}`}>
                          {getStepIcon(step.status, step.reached, isCurrent)}
                        </div>
                        {/* Label */}
                        <div className="mt-2 text-center w-20">
                          <p className={`text-xs font-semibold leading-tight ${step.reached ? "text-[#1A1A1A]" : "text-gray-400"}`}>
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-xs text-[#6B6B6B] mt-0.5 leading-tight">
                              {new Date(step.date).toLocaleDateString("fr-FR")}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Connector */}
                      {!isLast && (
                        <div className={`h-0.5 w-8 sm:w-12 mx-1 mt-[-18px] flex-shrink-0 ${
                          tracking.steps[index + 1]?.reached ? "bg-[#6B8F71]" : "bg-gray-200"
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#8B5E3C]" />
                </div>
                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">Historique détaillé</h3>
              </div>

              {tracking.history.length > 0 ? (
                <div className="space-y-3">
                  {tracking.history.map((entry, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-[#8B5E3C] mt-1.5 flex-shrink-0" />
                        {index < tracking.history.length - 1 && (
                          <div className="w-px flex-1 bg-[#8B5E3C]/20 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <p className="text-sm font-medium text-[#1A1A1A]">{entry.comment}</p>
                          <span className="text-xs text-[#6B6B6B] flex-shrink-0">{formatDate(entry.changed_at)}</span>
                        </div>
                        <span className={`inline-flex items-center mt-1 rounded-full text-xs font-semibold px-2 py-0.5 border ${getStatusBadge(entry.status)}`}>
                          {getStatusLabel(entry.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-[#6B6B6B]">Aucun historique disponible pour le moment</p>
                </div>
              )}
            </div>

            {/* Help card */}
            <div className="bg-[#8B5E3C]/5 rounded-2xl border border-[#8B5E3C]/10 p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#8B5E3C] flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#8B5E3C]">Besoin d'aide ?</p>
                  <p className="text-xs text-[#6B6B6B] mt-1 mb-3">
                    Si vous avez des questions concernant votre commande, notre équipe est là pour vous.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/support" className="flex items-center gap-1 px-3 py-1.5 bg-[#8B5E3C] text-white text-xs font-semibold rounded-xl hover:bg-[#5C3D1E] transition">
                      Contacter le support <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link to="/livraison" className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#8B5E3C]/30 text-[#8B5E3C] text-xs font-semibold rounded-xl hover:bg-[#8B5E3C]/5 transition">
                      FAQ Livraison <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
