import { createCookie, createCookieSessionStorage } from "@remix-run/node";

/** 
 * Cookie qui stocke le JWT (côté serveur uniquement).
 * - HttpOnly: non lisible en JS
 * - secure en prod
 * - signé (empêche la falsification)
 */
export const tokenCookie = createCookie("access_token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  // IMPORTANT: fournissez une secret key en prod, ex: process.env.SESSION_SECRET
  secrets: [process.env.SESSION_SECRET || "dev-secret-change-me"],
  maxAge: 60 * 60 * 24 // 1 jour
});

const sessionSecret = process.env.SESSION_SECRET || "default-secret";

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    httpOnly: true,
  },
});

export { getSession, commitSession, destroySession };

export async function readToken(request: Request): Promise<string | null> {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const sessionDataString = session.get("sessionData");

    if (!sessionDataString) {
      return null;
    }

    // Parser les données JSON stockées
    const sessionData = JSON.parse(sessionDataString);
    return sessionData?.access_token || null;
  } catch (error) {
    console.error("Erreur lors de la lecture du token:", error);
    return null;
  }
}

export async function readSessionData(request: Request) {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const sessionDataString = session.get("sessionData");

    if (!sessionDataString) {
      return null;
    }

    // Parser les données JSON stockées
    const sessionData = JSON.parse(sessionDataString);
    return {
      access_token: sessionData?.access_token,
      session_id: sessionData?.session_id,
      token_type: sessionData?.token_type,
    };
  } catch (error) {
    console.error("Erreur lors de la lecture des données de session:", error);
    return null;
  }
}

// Fonction pour committer les données de session
export async function commitToken(sessionDataString: string) {
  const session = await getSession();
  session.set("sessionData", sessionDataString);
  return {
    "Set-Cookie": await commitSession(session),
  };
}

// En-têtes Set-Cookie pour détruire le token
export async function destroyToken() {
  const session = await getSession();
  return {
    "Set-Cookie": await destroySession(session),
  };
}
