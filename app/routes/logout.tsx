import { ActionFunction, redirect } from "@remix-run/node";
import { destroyToken } from "~/utils/session.server";

export const action: ActionFunction = async () => {
  return redirect("/login", { headers: await destroyToken() });
};

export default function Logout() { return null; }
