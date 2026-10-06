import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { getUserProfile, requireUser, API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import { useEffect, useState } from "react";
import SellerLayout from "~/components/seller/SellerLayout";

export const meta: MetaFunction = () => {
  return [
    { title: "Créer un rendez-vous - Adawi" },
    { name: "description", content: "Page pour créer un nouveau rendez-vous" },
  ];
};

type LoaderData = {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserProfile(request);
  if (!user) {
    return redirect("/login?redirectTo=/appointments");
  }
  return json<LoaderData>({
    user: {
      id: user.id || "",
      name: user.full_name || "",
      email: user.email || "",
    },
  });
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    service_type?: string;
    title?: string;
    description?: string;
    appointment_date?: string;
    duration_minutes?: string;
    client_name?: string;
    client_email?: string;
    client_phone?: string;
    location?: string;
    client_notes?: string;
  };
  fields?: {
    service_type: string;
    title: string;
    description: string;
    appointment_date: string;
    duration_minutes: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    location: string;
    client_notes: string;
  };
  success?: boolean;
  successMessage?: string;
};

function validateRequired(field: string, fieldName: string) {
  if (!field || field.trim() === "") {
    return `${fieldName} est requis`;
  }
}

function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Email invalide";
  }
}

function validateDateTime(dateTimeString: string) {
  if (!dateTimeString || dateTimeString.trim() === "") {
    return "Date du rendez-vous est requise";
  }

  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) {
    return "Date du rendez-vous invalide";
  }

  if (date < new Date()) {
    return "La date du rendez-vous ne peut pas être dans le passé";
  }

  return undefined;
}

function formatDateForAPI(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toISOString();
}

function validateDurationMinutes(duration: string) {
  if (!duration || duration.trim() === "") {
    return "Durée est requise";
  }

  const durationNum = Number(duration);
  if (isNaN(durationNum) || durationNum <= 0) {
    return "Durée invalide";
  }

  if (durationNum > 480) {
    return "Durée maximale de 8 heures";
  }

  return undefined;
}

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);

  const form = await request.formData();
  const service_type = form.get("service_type")?.toString() || "";
  const title = form.get("title")?.toString() || "";
  const description = form.get("description")?.toString() || "";
  const appointment_date = form.get("appointment_date")?.toString() || "";
  const duration_minutes = form.get("duration_minutes")?.toString() || "";
  const client_name = form.get("client_name")?.toString() || "";
  const client_email = form.get("client_email")?.toString() || "";
  const client_phone = form.get("client_phone")?.toString() || "";
  const location = form.get("location")?.toString() || "";
  const client_notes = form.get("client_notes")?.toString() || "";

  const fields = {
    service_type,
    title,
    description,
    appointment_date,
    duration_minutes,
    client_name,
    client_email,
    client_phone,
    location,
    client_notes,
  };

  const fieldErrors = {
    service_type: validateRequired(service_type, "Type de service"),
    title: validateRequired(title, "Titre"),
    description: validateRequired(description, "Description"),
    appointment_date: validateDateTime(appointment_date),
    duration_minutes: validateDurationMinutes(duration_minutes),
    client_name: validateRequired(client_name, "Nom du client"),
    client_email: validateRequired(client_email, "Email du client") || validateEmail(client_email),
  };

  Object.keys(fieldErrors).forEach(key => {
    if (!fieldErrors[key as keyof typeof fieldErrors]) {
      delete fieldErrors[key as keyof typeof fieldErrors];
    }
  });

  if (Object.keys(fieldErrors).length > 0) {
    return json<ActionData>({ fieldErrors, fields }, { status: 422 });
  }

  const payload = {
    user_id: user.id,
    service_type,
    title,
    description,
    appointment_date: formatDateForAPI(appointment_date),
    duration_minutes: Number(duration_minutes),
    client_name,
    client_email,
    client_phone: client_phone || null,
    location: location || null,
    client_notes: client_notes || null,
  };

  const token = await readToken(request);

  try {
    console.log("Payload envoyé à l'API:", payload);
    console.log("API_BASE:", API_BASE);
    console.log("Token:", token ? "Token présent" : "Pas de token");

    const res = await fetch(`${API_BASE}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });

    console.log("Statut de la réponse:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Erreur de l'API:", errorText);

      if (res.status === 422) {
        try {
          const errorData = JSON.parse(errorText);
          return json<ActionData>({
            formError: "Erreur de validation côté serveur",
            fieldErrors: errorData.fieldErrors || {},
            fields
          }, { status: 422 });
        } catch (parseError) {
          return json<ActionData>({
            formError: `Erreur de validation côté serveur: ${errorText}`,
            fields
          }, { status: 422 });
        }
      }

      if (res.status === 401) {
        return json<ActionData>({
          formError: "Session expirée. Veuillez vous reconnecter.",
          fields
        }, { status: 401 });
      }

      if (res.status === 403) {
        return json<ActionData>({
          formError: "Accès non autorisé pour cette action.",
          fields
        }, { status: 403 });
      }

      return json<ActionData>({
        formError: `Erreur lors de la création du rendez-vous (${res.status}): ${errorText}`,
        fields
      }, { status: res.status });
    }

    const responseData = await res.json();
    console.log("Réponse de l'API:", responseData);

    return json<ActionData>({
      success: true,
      successMessage: "Rendez-vous créé avec succès !"
    });

  } catch (error) {
    console.error("Erreur lors de la requête:", error);
    return json<ActionData>({
      formError: `Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      fields
    }, { status: 500 });
  }
};

export default function Appointments() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";
  const [showSuccess, setShowSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (actionData?.success) {
      setShowSuccess(true);
      setFormKey(prev => prev + 1);

      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [actionData?.success]);

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setFormKey(prev => prev + 1);
  };

  const handleGoToDashboard = () => {
    window.location.href = "/client/list";
  };

  return (
    <SellerLayout>
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {showSuccess && actionData?.success && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-4 mb-6 animate-pulse">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="relative">
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping"></div>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-green-800">
                  Rendez-vous créé avec succès ! 
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  {actionData.successMessage}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleCreateAnother}
                    className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Créer un autre rendez-vous
                  </button>
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`bg-white rounded-lg shadow-md p-6 ${showSuccess ? "opacity-50 pointer-events-none" : ""}`}>
          <h1 className="text-2xl font-bold mb-6">Créer un nouveau rendez-vous</h1>

          <Form method="post" noValidate key={formKey}>
            {/* Type de service */}
            <div className="mb-4">
              <label htmlFor="service_type" className="block font-medium mb-1">
                Type de service *
              </label>
              <select
                id="service_type"
                name="service_type"
                defaultValue={actionData?.fields?.service_type || ""}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                aria-invalid={Boolean(actionData?.fieldErrors?.service_type)}
                aria-describedby="service_type-error"
                required
              >
                <option value="">Sélectionnez un type de service</option>
                <option value="prise_de_mesure">Prise de mesure</option>
                <option value="consultation">Consultation</option>
                <option value="suivi">Suivi</option>
                <option value="urgence">Urgence</option>
                <option value="preventif">Préventif</option>
                <option value="autre">Autre</option>
              </select>
              {actionData?.fieldErrors?.service_type && (
                <p className="text-red-600 text-sm mt-1" id="service_type-error">
                  {actionData.fieldErrors.service_type}
                </p>
              )}
            </div>

            {/* Titre */}
            <div className="mb-4">
              <label htmlFor="title" className="block font-medium mb-1">
                Titre *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={actionData?.fields?.title || ""}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                aria-invalid={Boolean(actionData?.fieldErrors?.title)}
                aria-describedby="title-error"
                placeholder="Ex: Consultation médicale"
                maxLength={100}
                required
              />
              {actionData?.fieldErrors?.title && (
                <p className="text-red-600 text-sm mt-1" id="title-error">
                  {actionData.fieldErrors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block font-medium mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={actionData?.fields?.description || ""}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                aria-invalid={Boolean(actionData?.fieldErrors?.description)}
                aria-describedby="description-error"
                placeholder="Décrivez le motif du rendez-vous..."
                maxLength={500}
                required
              />
              {actionData?.fieldErrors?.description && (
                <p className="text-red-600 text-sm mt-1" id="description-error">
                  {actionData.fieldErrors.description}
                </p>
              )}
            </div>

            {/* Date et durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="appointment_date" className="block font-medium mb-1">
                  Date et heure du rendez-vous *
                </label>
                <input
                  type="datetime-local"
                  id="appointment_date"
                  name="appointment_date"
                  min={new Date().toISOString().slice(0, 16)}
                  defaultValue={actionData?.fields?.appointment_date || ""}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  aria-invalid={Boolean(actionData?.fieldErrors?.appointment_date)}
                  aria-describedby="appointment_date-error"
                  required
                />
                {actionData?.fieldErrors?.appointment_date && (
                  <p className="text-red-600 text-sm mt-1" id="appointment_date-error">
                    {actionData.fieldErrors.appointment_date}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="duration_minutes" className="block font-medium mb-1">
                  Durée (minutes) *
                </label>
                <select
                  id="duration_minutes"
                  name="duration_minutes"
                  defaultValue={actionData?.fields?.duration_minutes || "60"}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  aria-invalid={Boolean(actionData?.fieldErrors?.duration_minutes)}
                  aria-describedby="duration_minutes-error"
                  required
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 heure</option>
                  <option value="90">1h30</option>
                  <option value="120">2 heures</option>
                  <option value="180">3 heures</option>
                </select>
                {actionData?.fieldErrors?.duration_minutes && (
                  <p className="text-red-600 text-sm mt-1" id="duration_minutes-error">
                    {actionData.fieldErrors.duration_minutes}
                  </p>
                )}
              </div>
            </div>

            {/* Séparateur pour les informations client */}
            <div className="border-t pt-6 mb-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Informations client</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="client_name" className="block font-medium mb-1">
                    Nom du client *
                  </label>
                  <input
                    type="text"
                    id="client_name"
                    name="client_name"
                    defaultValue={user?.name || actionData?.fields?.client_name || ""}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                    aria-invalid={Boolean(actionData?.fieldErrors?.client_name)}
                    aria-describedby="client_name-error"
                    maxLength={100}
                    required
                  />
                  {actionData?.fieldErrors?.client_name && (
                    <p className="text-red-600 text-sm mt-1" id="client_name-error">
                      {actionData.fieldErrors.client_name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="client_email" className="block font-medium mb-1">
                    Email du client *
                  </label>
                  <input
                    type="email"
                    id="client_email"
                    name="client_email"
                    defaultValue={""}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                    aria-invalid={Boolean(actionData?.fieldErrors?.client_email)}
                    aria-describedby="client_email-error"
                    required
                  />
                  {actionData?.fieldErrors?.client_email && (
                    <p className="text-red-600 text-sm mt-1" id="client_email-error">
                      {actionData.fieldErrors.client_email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="client_phone" className="block font-medium mb-1">
                    Téléphone du client
                  </label>
                  <input
                    type="tel"
                    id="client_phone"
                    name="client_phone"
                    defaultValue={actionData?.fields?.client_phone || ""}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                    placeholder="+228 XX XX XX XX"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block font-medium mb-1">
                    Lieu du rendez-vous
                  </label>
                  <select
                    id="location"
                    name="location"
                    defaultValue={actionData?.fields?.location || ""}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  >
                    <option value="">Sélectionnez un lieu</option>
                    <option value="Boutique">Boutique</option>
                    <option value="Domicile">Domicile</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="client_notes" className="block font-medium mb-1">
                  Notes supplémentaires
                </label>
                <textarea
                  id="client_notes"
                  name="client_notes"
                  rows={3}
                  defaultValue={actionData?.fields?.client_notes || ""}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  placeholder="Notes, instructions spéciales, allergies..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 1000 caractères</p>
              </div>
            </div>

            {/* Message d'erreur général */}
            {actionData?.formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-600 text-sm font-medium">{actionData.formError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-adawi-gold text-white font-semibold px-6 py-3 rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {isSubmitting ? "Création en cours..." : "Créer le rendez-vous"}
              </button>

              <button
                type="button"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
                className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
    </SellerLayout>
  );
}