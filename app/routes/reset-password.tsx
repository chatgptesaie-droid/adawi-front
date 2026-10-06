import { MetaFunction } from "@remix-run/node";
import { Form, useNavigation, useNavigate, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const meta: MetaFunction = () => [{ title: "Reset Password" }];

export default function ResetPassword() {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // récupère le token depuis l’URL

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [localSubmitting, setLocalSubmitting] = useState(false);
  const isActuallySubmitting = navigation.state === "submitting" || localSubmitting;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password !== confirm) {
      setError("Les champs ne correspondent pas.");
      return;
    }
    if (!token) {
      setError("Lien invalide ou expiré.");
      return;
    }

    try {
      setLocalSubmitting(true);
      const res = await fetch("http://localhost:8000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: password,
          confirmed_password: confirm,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail?.[0]?.msg || "Erreur lors de la réinitialisation.");
      }

      const data = await res.json();
      setSuccessMessage("Mot de passe réinitialisé avec succès !");
      setPassword("");
      setConfirm("");

      // Redirection après 2 secondes
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLocalSubmitting(false);
    }
  };

  const clearError = () => {
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundColor: "white" }}
    >
      <div className="w-full max-w-sm p-8 rounded-[20px] bg-white font-sans font-bold text-black shadow-xl flex flex-col items-center">
        {/* Logo */}
        <div className="mb-4">
          <img src="/ADAWI _ LOGO FOND BLANC.jpg" alt="Logo" className="h-[120px] object-contain" />
        </div>

        {/* Title */}
        <div className="text-center text-[24px] text-adawi-brown mb-6">
          Créer un nouveau mot de passe
        </div>

        <Form className="w-full space-y-4" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && <div className="text-red-500 text-sm text-center -mt-2">{error}</div>}

          {/* Success Message */}
          {successMessage && <div className="text-green-600 text-sm text-center -mt-2">{successMessage}</div>}

          {/* New password */}
          <div className="relative border-b-2 border-gray-300 hover:border-adawi-gold transition duration-300">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Nouveau mot de passe"
              required
              onFocus={clearError}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none border-none text-[18px] text-[#555] py-5 px-2 pr-10 tracking-wide"
            />
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          {/* Confirm password */}
          <div className="relative border-b-2 border-gray-300 hover:border-adawi-gold transition duration-300">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirm"
              placeholder="Confirmer le mot de passe"
              required
              onFocus={clearError}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-transparent outline-none border-none text-[18px] text-[#555] py-5 px-2 pr-10 tracking-wide"
            />
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isActuallySubmitting}
            className={`w-full h-[55px] mt-4 rounded-full text-white text-[18px] font-bold bg-gradient-to-r from-adawi-brown via-adawi-brown-light to-adawi-gold-light shadow-md transition duration-500 hover:bg-right flex items-center justify-center gap-2 ${
              isActuallySubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isActuallySubmitting && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isActuallySubmitting ? "Réinitialisation..." : "Réinitialiser"}
          </button>
        </Form>
      </div>
    </div>
  );
}
