import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { readSessionData } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    const sessionData = await readSessionData(request);
    
    return json({
        hasSession: !!sessionData,
        hasToken: !!sessionData?.access_token,
        tokenPreview: sessionData?.access_token ? sessionData.access_token.substring(0, 20) + "..." : null,
        sessionId: sessionData?.session_id || null,
    });
};

export default function TestAuth() {
    const data = useLoaderData<typeof loader>();
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Test Authentification</h1>
            <div className="bg-gray-100 p-4 rounded">
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
            
            <div className="mt-4">
                <button
                    onClick={async () => {
                        try {
                            const response = await fetch('/api/cart/add', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({
                                    product_id: "test_123",
                                    quantity: 1,
                                    size: "M",
                                    color: "noir"
                                })
                            });
                            
                            const result = await response.json();
                            console.log("Test API result:", result);
                            alert(JSON.stringify(result, null, 2));
                        } catch (error) {
                            console.error("Test API error:", error);
                            alert("Erreur: " + error);
                        }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Tester API Cart Add
                </button>
            </div>
        </div>
    );
}
