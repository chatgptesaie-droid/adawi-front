import { useState } from "react";

export default function Newsletter() {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string[]}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer les erreurs quand l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
    
    // Effacer le message de statut
    if (status) {
      setStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    const newErrors: {[key: string]: string[]} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = ["Le nom est requis"];
    }
    
    if (!formData.email.trim()) {
      newErrors.email = ["L'email est requis"];
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = ["Format d'email invalide"];
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setStatus("Abonnement en cours...");
    setErrors({});

    try {
      const response = await fetch("http://localhost:8000/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(" " + (data.message || "Abonnement réussi ! Merci de vous être abonné à notre newsletter."));
        setFormData({ name: "", email: "" });
      } else if (response.status === 422) {
        const errorData = await response.json();
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const fieldErrors: {[key: string]: string[]} = {};
          errorData.detail.forEach((error: any) => {
            if (error.loc && error.loc.length > 1) {
              const field = error.loc[1];
              if (!fieldErrors[field]) fieldErrors[field] = [];
              fieldErrors[field].push(error.msg);
            }
          });
          setErrors(fieldErrors);
          setStatus(" Veuillez corriger les erreurs ci-dessous.");
        } else {
          setStatus(" Données invalides. Veuillez vérifier vos informations.");
        }
      } else if (response.status === 409) {
        setStatus(" Cette adresse email est déjà abonnée à notre newsletter.");
      } else {
        setStatus(" Erreur lors de l'abonnement. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur abonnement newsletter:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setStatus(" Impossible de contacter le serveur. Vérifiez votre connexion internet.");
      } else {
        setStatus(" Erreur technique. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fade-in-right {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slide-down {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
          
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
          }
          
          .animate-fade-in-right {
            animation: fade-in-right 0.8s ease-out 0.2s both;
          }
          
          .animate-slide-down {
            animation: slide-down 0.3s ease-out;
          }
          
          .shake {
            animation: shake 0.5s ease-in-out;
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
        `
      }} />
      
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Section formulaire */}
            <div className="flex-1 max-w-2xl w-full order-2 lg:order-1 animate-fade-in-up">
              {/* En-tête avec animation */}
              <div className="flex items-center mb-8 group">
                <div className="bg-yellow-400 p-2 rounded-full mr-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <svg 
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white transition-colors duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-yellow-600">
                    Abonnez-vous à la newsletter
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Recevez nos dernières actualités et offres exclusives
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Champs de formulaire responsifs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Champ Nom */}
                  <div className="flex-1 group">
                    <label 
                      htmlFor="newsletter-name" 
                      className="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-yellow-600"
                    >
                      Nom
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="newsletter-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className={`w-full bg-white text-gray-900 px-4 py-3 sm:py-4 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400 transform hover:scale-[1.02] ${
                          errors.name?.length 
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-200 shake' 
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isSubmitting ? 'opacity-60 cursor-not-allowed hover:scale-100' : ''}`}
                        placeholder="Votre nom"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-yellow-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    {errors.name?.length > 0 && (
                      <p className="text-red-500 text-xs mt-2 animate-slide-down flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.name[0]}
                      </p>
                    )}
                  </div>

                  {/* Champ Email */}
                  <div className="flex-1 group">
                    <label 
                      htmlFor="newsletter-email" 
                      className="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-yellow-600"
                    >
                      E-mail
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="newsletter-email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className={`w-full bg-white text-gray-900 px-4 py-3 sm:py-4 border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400 transform hover:scale-[1.02] ${
                          errors.email?.length 
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-200 shake' 
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isSubmitting ? 'opacity-60 cursor-not-allowed hover:scale-100' : ''}`}
                        placeholder="votre@email.com"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-yellow-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                    </div>
                    {errors.email?.length > 0 && (
                      <p className="text-red-500 text-xs mt-2 animate-slide-down flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.email[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bouton d'abonnement */}
                <div className="flex justify-center sm:justify-start">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold px-8 py-3 sm:py-4 rounded-2xl transition-all duration-300 flex items-center justify-center min-w-[200px] shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed hover:scale-100' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        <span className="animate-pulse">Abonnement...</span>
                      </>
                    ) : (
                      <>
                        <span className="mr-3 transition-transform duration-200 group-hover:translate-x-1">
                          S'abonner
                        </span>
                        <svg
                          className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-110"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                {/* Message de statut avec animation */}
                {status && (
                  <div className={`text-sm p-4 rounded-2xl border transition-all duration-500 transform animate-slide-down shadow-md ${
                    status.startsWith('') 
                      ? 'bg-green-50 text-green-800 border-green-200 shadow-green-100' 
                      : 'bg-red-50 text-red-800 border-red-200 shadow-red-100'
                  }`}>
                    <div className="flex items-center">
                      <span className="text-lg mr-2 animate-bounce">
                        {status.startsWith('') ? '' : ''}
                      </span>
                      <span>{status.replace(/^(|)\s?/, '')}</span>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Section image avec animations */}
            <div className="flex-shrink-0 max-w-md w-full order-1 lg:order-2 animate-fade-in-right">
              <div className="relative group">
                {/* Image principale avec overlay */}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:rotate-1">
                  <div className="w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80" 
                      alt="Vêtements suspendus dans un dressing moderne"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Overlay avec effet de gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </div>

                {/* Éléments décoratifs flottants */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce-slow opacity-80"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-yellow-300 rounded-full animate-bounce-slow opacity-60" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}