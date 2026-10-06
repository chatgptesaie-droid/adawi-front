import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser, API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";

type Appointment = {
  _id: string;
  user_id: string;
  vendor_id: string;
  service_type: string;
  title: string;
  description: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  client_name: string;
  client_email: string; 
  client_phone: string;
  location: string;
  client_notes: string;
  vendor_notes: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  reminder_sent: boolean;
  reminder_sent_at: string;
  status_history: any[];
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const user = await requireUser(request);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { appointmentId } = params;
  if (!appointmentId) {
    throw new Response("Appointment ID is required", { status: 400 });
  }

  const token = await readToken(request);

  const res = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    throw new Response("Failed to load appointment details", { status: res.status });
  }

  const appointment: Appointment = await res.json();

  return json(appointment);
};
