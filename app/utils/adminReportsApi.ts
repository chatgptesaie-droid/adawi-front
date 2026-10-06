const API_BASE = "";

export interface ReportsSummary {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  total_products: number;
  orders_growth: number;
  revenue_growth: number;
  customers_growth: number;
  commission_collected: number;
  total_produits_vendus: number;
  total_nouveaux_clients: number;
}

export interface SalesReport {
  page: number;
  items_per_page: number;
  total_pages: number;
  total_items: number;
  ventes: Array<{
    date: string;
    produit: string;
    client: string;
    quantite: number;
    montant: number;
  }>;
}

export interface ProductReport {
  nom: string;
  stock: number;
  vendus: number;
  revenus: number;
  statut: string;
}

export async function fetchReportsSummary(token: string, dateRange: string = "30-days"): Promise<ReportsSummary> {
  const response = await fetch(`/api/admin/rapports?date_range=${encodeURIComponent(dateRange)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erreur lors de la récupération des rapports");
  }

  return response.json();
}

export async function fetchSalesReport(
  token: string,
  page: number = 1,
  itemsPerPage: number = 10,
  dateRange: string = "30-days"
): Promise<SalesReport> {
  const response = await fetch(
    `/api/admin/rapports/ventes?page=${page}&items_per_page=${itemsPerPage}&date_range=${encodeURIComponent(dateRange)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erreur lors de la récupération des ventes");
  }

  return response.json();
}

export async function fetchProductsReport(token: string): Promise<ProductReport[]> {
  const response = await fetch(`/api/admin/rapports/produits`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erreur lors de la récupération des produits");
  }

  return response.json();
}

export async function exportReports(token: string, dateRange: string = "30-days"): Promise<Blob> {
  const response = await fetch(`/api/admin/export/rapports?date_range=${encodeURIComponent(dateRange)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Erreur lors de l'export des rapports");
  }

  return response.blob();
}
