import { readToken } from "./session.server";
import { redirect } from "@remix-run/node";

const API_BASE =
  process.env.API_BASE_URL ||
  "http://localhost:8000"; // <- ton backend Render

/**
 * Récupère le profil utilisateur via /auth/me avec le JWT du cookie
 */
export async function getUserProfile(request: Request) {
  const token = await readToken(request);
  if (!token) return null;

  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json(); // { id, name, email, role, ... }
}

/**
 * Vérifie si l'utilisateur est connecté.
 * Retourne l'objet user ou redirige vers /login.
 */
export async function requireUser(request: Request) {
  const user = await getUserProfile(request);
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/login?redirectTo=${url.pathname}`);
  }
  return user;
}

/**
 * Vérifie si l'utilisateur est ADMIN
 */
export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  if (user.role !== "admin") {
    throw redirect("/unauthorized");
  }
  return user;
}

/**
 * Vérifie si l'utilisateur est VENDEUR
 */
export async function requireVendor(request: Request) {
  const user = await requireUser(request);
  if (user.role !== "vendeur") {
    throw redirect("/unauthorized");
  }
  return user;
}

/**
 * Expose la base API si besoin ailleurs
 */
export { API_BASE };
