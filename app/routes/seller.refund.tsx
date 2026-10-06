import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import RefundList from '~/components/RefundList';
import RefundStats from '~/components/RefundStats';
import SellerLayout from "~/components/seller/SellerLayout";
import { requireVendor } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireVendor(request);
  const token = await readToken(request);
  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return json({ token });
};

export default function AdminRefunds() {
  const { token } = useLoaderData<typeof loader>();

  return (
    <SellerLayout userName="VENDEUR"> {/* Replace with actual seller name */}
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des remboursements</h1>

      <div className="mb-8">
        <RefundStats token={token} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Liste des demandes de remboursement</h2>
        <RefundList token={token} />
      </div>
    </div>
    </SellerLayout>
  );
}
