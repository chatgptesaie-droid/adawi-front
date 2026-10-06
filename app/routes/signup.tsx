import { MetaFunction, ActionFunction, json } from "@remix-run/node";
import { Form, useNavigation, useActionData, useNavigate, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export const meta: MetaFunction = () => [{ title: "Inscription — Adawi" }];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const payload = {
    email: formData.get("email"),
    full_name: formData.get("name"),
    role: "client",
    is_banned: false,
    is_active: true,
    is_deleted: false,
    password: formData.get("password"),
  };

  try {
    const res = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return json({ error: data.message || "Une erreur est survenue lors de l'inscription." }, { status: res.status });
    return json({ success: true });
  } catch (err: any) {
    return json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
};

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [btnState, setBtnState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.error) { setErrorMsg(actionData.error); setBtnState("error"); }
    else if (actionData?.success) { setBtnState("success"); setTimeout(() => navigate("/login?success=1"), 2000); }
  }, [actionData, navigate]);

  useEffect(() => { if (navigation.state === "submitting" && btnState !== "success") { setBtnState("loading"); setErrorMsg(""); } }, [navigation.state]);

  const isDisabled = navigation.state === "submitting" || btnState === "success" || btnState === "loading";

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
          <p className="text-white text-2xl font-bold leading-snug">"Rejoignez la<br/>communauté Adawi."</p>
          <p className="text-white/60 text-sm mt-2">Mode locale, livraison rapide, qualité artisanale.</p>
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
            Déjà membre ? <span className="font-semibold text-[#8B5E3C]">Se connecter</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <p className="text-xs font-semibold tracking-widest text-[#C9A96E] uppercase mb-2">Nouveau compte</p>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Créer un compte</h1>
              <p className="text-sm text-[#6B6B6B] mt-1">Remplissez le formulaire pour rejoindre Adawi.</p>
            </div>

            {/* Succès */}
            {btnState === "success" && (
              <div className="mb-5 flex gap-2 items-center bg-green-50 border border-green-200 text-green-800 rounded-2xl px-4 py-3 text-sm">
                <svg className="w-4 h-4 shrink-0 text-[#6B8F71]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Compte créé ! Redirection vers la connexion…
              </div>
            )}

            {/* Erreur */}
            {errorMsg && btnState === "error" && (
              <div className="mb-5 flex gap-2 items-start bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                <svg className="w-4 h-4 shrink-0 mt-0.5 text-[#C0392B]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {errorMsg}
              </div>
            )}

            <Form method="post" className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5">Nom complet</label>
                <input type="text" name="name" placeholder="Jean Dupont"
                  disabled={isDisabled} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5">Email</label>
                <input type="email" name="email" placeholder="votre@email.com"
                  disabled={isDisabled} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition disabled:opacity-50"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••"
                    disabled={isDisabled} required
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-white text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition disabled:opacity-50"
                  />
                  <button type="button" onClick={() => !isDisabled && setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B5E3C] transition">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              {/* Bouton */}
              <button type="submit" disabled={isDisabled}
                className="w-full mt-2 py-3.5 rounded-xl bg-[#8B5E3C] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#5C3D1E] shadow-lg shadow-[#8B5E3C]/20 transition disabled:opacity-60 disabled:cursor-not-allowed">
                {btnState === "loading" ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : btnState === "success" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                ) : (
                  <>Créer mon compte <ArrowRight className="w-4 h-4"/></>
                )}
              </button>
            </Form>

            <p className="text-center text-xs text-[#6B6B6B] mt-6">
              Besoin d'aide ?{" "}
              <Link to="/support" className="text-[#8B5E3C] hover:underline font-semibold">Contacter le support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
