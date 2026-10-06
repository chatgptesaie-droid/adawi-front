import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { readSessionData } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const sessionData = await readSessionData(request);

    if (!sessionData) {
      return json({ error: "No session" }, { status: 401 });
    }

    return json(sessionData);
  } catch (error) {
    console.error("Error reading session:", error);
    return json({ error: "Server error" }, { status: 500 });
  }
}
