import { useState, useEffect } from "react";
import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation, useSubmit } from "@remix-run/react";
import { Plus, Search, Edit, Trash2, X, AlertCircle, Loader2, Calculator } from "lucide-react";
import { readToken } from "~/utils/session.server";
import { requireAdmin, API_BASE } from "~/utils/auth.server";

export interface Promotion {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  status: string;
}

type LoaderData = {
  promotions: Promotion[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name?: string;
    description?: string;
    discount_percentage?: string;
    start_date?: string;
    end_date?: string;
  };
  fields?: {
    name: string;
    description: string;
    discount_percentage: string;
    start_date: string;
    end_date: string;
  };
  success?: boolean;
  successMessage?: string;
  calculateResult?: {
    original_price: number;
    discounted_price: number;
    discount_amount: number;
    has_discount: boolean;
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Promotions - Adawi Admin" },
    { name: "description", content: "Gestion des promotions" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);
  const token = await readToken(request);

  const url = new URL(request.url);
  const skip = parseInt(url.searchParams.get("skip") || "0");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const response = await fetch(`${API_BASE}/promotions/?skip=${skip}&limit=${limit}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Response("Failed to load promotions", { status: response.status });
  }

  const data = await response.json();
  return json<LoaderData>(data);
};

function validateRequired(field: string, fieldName: string) {
  if (!field || field.trim() === "") {
    return `${fieldName} est requis`;
  }
}

function validateDiscount(discount: string) {
  const num = Number(discount);
  if (isNaN(num) || num < 0 || num > 100) {
    return "Le pourcentage de réduction doit être entre 0 et 100";
  }
}

function validateDate(date: string, fieldName: string) {
  if (!date) {
    return `${fieldName} est requise`;
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return `${fieldName} invalide`;
  }
}

function validateDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate >= endDate) {
    return "La date de fin doit être après la date de début";
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);
  const token = await readToken(request);
  const form = await request.formData();
  const intent = form.get("_intent")?.toString();

  if (intent === "calculate") {
    const original_price = form.get("original_price")?.toString();
    if (!original_price || isNaN(Number(original_price))) {
      return json<ActionData>({ formError: "Prix invalide" });
    }

    const response = await fetch(`${API_BASE}/promotions/calculate-discount?original_price=${original_price}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: "",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json<ActionData>({ formError: `Erreur lors du calcul: ${errorText}` });
    }

    const result = await response.json();
    return json<ActionData>({ calculateResult: result });
  }

  // Pour delete et deactivate, on n'a pas besoin de validation des autres champs
  const promotion_id = form.get("promotion_id")?.toString();

  if (intent === "delete" && promotion_id) {
    const response = await fetch(`${API_BASE}/promotions/${promotion_id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json<ActionData>({ formError: `Erreur: ${errorText}` }, { status: response.status });
    }

    return json<ActionData>({
      success: true,
      successMessage: "Promotion supprimée"
    });
  }

  if (intent === "deactivate" && promotion_id) {
    const response = await fetch(`${API_BASE}/promotions/${promotion_id}/deactivate`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json<ActionData>({ formError: `Erreur: ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    return json<ActionData>({
      success: true,
      successMessage: "Promotion désactivée"
    });
  }

  // Pour create et update, on valide tous les champs
  const name = form.get("name")?.toString() || "";
  const description = form.get("description")?.toString() || "";
  const discount_percentage = form.get("discount_percentage")?.toString() || "";
  const start_date = form.get("start_date")?.toString() || "";
  const end_date = form.get("end_date")?.toString() || "";

  const fields = { name, description, discount_percentage, start_date, end_date };

  const fieldErrors = {
    name: validateRequired(name, "Nom"),
    description: validateRequired(description, "Description"),
    discount_percentage: validateRequired(discount_percentage, "Pourcentage") || validateDiscount(discount_percentage),
    start_date: validateRequired(start_date, "Date de début") || validateDate(start_date, "Date de début"),
    end_date: validateRequired(end_date, "Date de fin") || validateDate(end_date, "Date de fin"),
  };

  if (!fieldErrors.start_date && !fieldErrors.end_date) {
    fieldErrors.end_date = fieldErrors.end_date || validateDateRange(start_date, end_date);
  }

  Object.keys(fieldErrors).forEach(key => {
    if (!fieldErrors[key as keyof typeof fieldErrors]) {
      delete fieldErrors[key as keyof typeof fieldErrors];
    }
  });

  if (Object.keys(fieldErrors).length > 0) {
    return json<ActionData>({ fieldErrors, fields }, { status: 422 });
  }

  const payload = {
    name,
    description,
    discount_percentage: Number(discount_percentage),
    start_date: new Date(start_date).toISOString(),
    end_date: new Date(end_date).toISOString(),
  };

  let response: Response;
  if (intent === "create") {
    response = await fetch(`${API_BASE}/promotions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } else if (intent === "update" && promotion_id) {
    response = await fetch(`${API_BASE}/promotions/${promotion_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ ...payload, is_active: true }),
    });
  } else {
    return json<ActionData>({ formError: "Action invalide" }, { status: 400 });
  }

  if (!response.ok) {
    const errorText = await response.text();
    return json<ActionData>({ formError: `Erreur: ${errorText}` }, { status: response.status });
  }

  return json<ActionData>({
    success: true,
    successMessage: intent === "create" ? "Promotion créée" : "Promotion mise à jour"
  });
};

function PromotionModal({
  isOpen,
  onClose,
  promotion,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  promotion?: Promotion;
  onSubmit: () => void;
}) {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" && 
    navigation.formData?.get("_intent") === (promotion ? "update" : "create");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {promotion ? "Modifier la promotion" : "Créer une promotion"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <Form method="post" className="p-6 space-y-4">
          <input type="hidden" name="_intent" value={promotion ? "update" : "create"} />
          {promotion && <input type="hidden" name="promotion_id" value={promotion.id} />}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              name="name"
              defaultValue={actionData?.fields?.name || promotion?.name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
              required
              disabled={isSubmitting}
            />
            {actionData?.fieldErrors?.name && (
              <p className="text-red-600 text-sm mt-1">{actionData.fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={actionData?.fields?.description || promotion?.description || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
              required
              disabled={isSubmitting}
            />
            {actionData?.fieldErrors?.description && (
              <p className="text-red-600 text-sm mt-1">{actionData.fieldErrors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pourcentage de réduction (0-100) *</label>
            <input
              type="number"
              name="discount_percentage"
              min="0"
              max="100"
              defaultValue={actionData?.fields?.discount_percentage || promotion?.discount_percentage || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
              required
              disabled={isSubmitting}
            />
            {actionData?.fieldErrors?.discount_percentage && (
              <p className="text-red-600 text-sm mt-1">{actionData.fieldErrors.discount_percentage}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
              <input
                type="datetime-local"
                name="start_date"
                defaultValue={actionData?.fields?.start_date || (promotion?.start_date ? new Date(promotion.start_date).toISOString().slice(0, 16) : "")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                required
                disabled={isSubmitting}
              />
              {actionData?.fieldErrors?.start_date && (
                <p className="text-red-600 text-sm mt-1">{actionData.fieldErrors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
              <input
                type="datetime-local"
                name="end_date"
                defaultValue={actionData?.fields?.end_date || (promotion?.end_date ? new Date(promotion.end_date).toISOString().slice(0, 16) : "")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                required
                disabled={isSubmitting}
              />
              {actionData?.fieldErrors?.end_date && (
                <p className="text-red-600 text-sm mt-1">{actionData.fieldErrors.end_date}</p>
              )}
            </div>
          </div>

          {actionData?.formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{actionData.formError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{promotion ? "Mettre à jour" : "Créer"}</span>
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({
  isOpen,
  onClose,
  promotion,
  isDeleting = false
}: {
  isOpen: boolean;
  onClose: () => void;
  promotion: Promotion;
  isDeleting?: boolean;
}) {
  const navigation = useNavigation();
  const isSubmittingDelete = navigation.state === "submitting" && 
    navigation.formData?.get("_intent") === "delete";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={isSubmittingDelete}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Êtes-vous sûr de vouloir supprimer la promotion{" "}
            <span className="font-semibold text-gray-900">"{promotion.name}"</span> ?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800">Cette action est irréversible</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSubmittingDelete}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <Form method="post" style={{ display: 'inline' }}>
            <input type="hidden" name="_intent" value="delete" />
            <input type="hidden" name="promotion_id" value={promotion.id} />
            <button
              type="submit"
              disabled={isSubmittingDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmittingDelete && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Supprimer</span>
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default function AdminPromotions() {
  const { promotions, total, page, size, has_next } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(page + 1);
  const [calculatePrice, setCalculatePrice] = useState("");

  useEffect(() => {
    if (actionData?.success) {
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedPromotion(null);
      window.location.reload();
    }
  }, [actionData?.success]);

  const filteredPromotions = promotions.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculatePrice || isNaN(Number(calculatePrice))) return;
    
    const formData = new FormData();
    formData.append("_intent", "calculate");
    formData.append("original_price", calculatePrice);
    submit(formData, { method: "post" });
  };

  const handleDeactivate = (promotionId: string) => {
    const formData = new FormData();
    formData.append("_intent", "deactivate");
    formData.append("promotion_id", promotionId);
    submit(formData, { method: "post" });
  };

  const openEditModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-adawi-brown">Gestion des Promotions</h1>
          <p className="text-gray-600">Gérez vos promotions et réductions</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Créer une promotion
        </button>
      </div>

      {/* Calculate Discount Tool */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Calculateur de réduction
        </h3>
        <form onSubmit={handleCalculate} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix original (F CFA)</label>
            <input
              type="number"
              value={calculatePrice}
              onChange={(e) => setCalculatePrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
              placeholder="12000"
              min="0"
            />
          </div>
          <button
            type="submit"
            disabled={navigation.state === "submitting" && navigation.formData?.get("_intent") === "calculate"}
            className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 disabled:opacity-50 flex items-center"
          >
            {navigation.state === "submitting" && navigation.formData?.get("_intent") === "calculate" && 
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            }
            Calculer
          </button>
        </form>
        {actionData?.calculateResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              Prix original: {actionData.calculateResult.original_price.toLocaleString()} F CFA<br/>
              Prix réduit: {actionData.calculateResult.discounted_price.toLocaleString()} F CFA<br/>
              Économie: {actionData.calculateResult.discount_amount.toLocaleString()} F CFA
            </p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une promotion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
          />
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Nom</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Réduction</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Dates</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPromotions.length > 0 ? (
                filteredPromotions.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{promotion.name}</td>
                    <td className="py-4 px-4 text-gray-700">{promotion.description}</td>
                    <td className="py-4 px-4 text-gray-900">{promotion.discount_percentage}%</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      Du {new Date(promotion.start_date).toLocaleDateString()}<br/>
                      Au {new Date(promotion.end_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        promotion.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {promotion.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(promotion)}
                          className="p-2 text-gray-400 hover:text-green-600"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {promotion.is_active && (
                          <button
                            onClick={() => handleDeactivate(promotion.id)}
                            className="p-2 text-gray-400 hover:text-yellow-600"
                            title="Désactiver"
                          >
                            Désactiver
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(promotion)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Aucune promotion trouvée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PromotionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={() => {}}
      />

      {selectedPromotion && (
        <PromotionModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedPromotion(null); }}
          promotion={selectedPromotion}
          onSubmit={() => {}}
        />
      )}

      {selectedPromotion && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => { setIsDeleteModalOpen(false); setSelectedPromotion(null); }}
          promotion={selectedPromotion}
        />
      )}
    </div>
  );
}