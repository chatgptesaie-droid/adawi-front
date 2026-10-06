import { MetaFunction, ActionFunction, json } from "@remix-run/node";
import { Form, useNavigation, useActionData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ArrowRight, Mail } from "lucide-react";

export const meta: MetaFunction = () => [{ title: "Mot de passe oublié — Adawi" }];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  if (typeof email !== "string") return json({ error: "Email invalide." }, { status: 400 });

  try {
    const res = await fetch("http://localhost:8000/auth/reset-password-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return json({ error: data.detail || "Erreur lors de la requête." }, { status: res.status });
    }
    return json({ success: true });
  } catch {
    return json({ error: "Impossible de contacter le serveur." }, { status: 500 });
  }
};

export default function ForgotPassword() {
  const navigation = useNavigation();
  const actionData = useActionData<{ success?: boolean; error?: string }>();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { if (actionData?.success) setSubmitted(true); }, [actionData]);

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex">
      {/* ── Colonne gauche — image ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://img.freepik.com/premium-photo/background-image-elegant-clothing-boutique-interior-with-clothes-accessories-display-copy-space_236854-52930.jpg"
          alt="Adawi boutique"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1A1A1A]/40" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <img src="/lOGO_FOND_BLANC-removebg.png" alt="Adawi" className="w-36 mb-6 brightness-0 invert" />
          <p className="text-white text-2xl font-bold leading-snug">"Votre sécurité,<br/>notre priorité."</p>
          <p className="text-white/60 text-sm mt-2">Un lien de réinitialisation vous sera envoyé par email.</p>
        </div>
      </div>

      {/* ── Colonne droite — formulaire ── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#FAFAF8]">
        {/* top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
          <Link to="/">
            <img src="/lOGO_FOND_BLANC-removebg.png" alt="Adawi" className="w-28 lg:hidden" />
            <span className="hidden lg:block text-sm font-semibold text-[#8B5E3C] hover:underline">← Retour au site</span>
          </Link>
          <Link to="/login" className="text-sm text-[#6B6B6B] hover:text-[#8B5E3C] transition">
            <span className="font-semibold text-[#8B5E3C]">← Retour à la connexion</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <p className="text-xs font-semibold tracking-widest text-[#C9A96E] uppercase mb-2">Sécurité</p>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Mot de passe oublié</h1>
              <p className="text-sm text-[#6B6B6B] mt-1">
                Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
              </p>
            </div>

            {submitted ? (
              /* ── État succès ── */
              <div className="space-y-5">
                <div className="flex flex-col items-center text-center gap-4 bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#6B8F71]/15 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-[#6B8F71]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A] mb-1">Email envoyé</p>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">
                      Un lien de réinitialisation a été envoyé à votre adresse. Vérifiez votre boîte de réception et suivez les instructions.
                    </p>
                  </div>
                </div>
                <Link to="/login"
                  className="w-full py-3.5 rounded-xl bg-[#8B5E3C] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#5C3D1E] shadow-lg shadow-[#8B5E3C]/20 transition">
                  Retour à la connexion <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              /* ── Formulaire ── */
              <>
                {actionData?.error && (
                  <div className="mb-5 flex gap-2 items-start bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                    <svg className="w-4 h-4 shrink-0 mt-0.5 text-[#C0392B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {actionData.error}
                  </div>
                )}

                <Form method="post" className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5">
                      Adresse email
                    </label>
                    <input
                      type="email" name="email" placeholder="votre@email.com"
                      disabled={isSubmitting} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition disabled:opacity-50"
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#8B5E3C] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#5C3D1E] shadow-lg shadow-[#8B5E3C]/20 transition disabled:opacity-60 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : (
                      <>Envoyer le lien <ArrowRight className="w-4 h-4"/></>
                    )}
                  </button>
                </Form>

                <p className="text-center text-xs text-[#6B6B6B] mt-6">
                  Besoin d'aide ?{" "}
                  <Link to="/support" className="text-[#8B5E3C] hover:underline font-semibold">Contacter le support</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
