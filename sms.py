"""
Service SMS via NGH SMS API
============================
Host   : extranet.nghcorp.net
Route  : POST /api/send-sms
Données: JSON
Réponse: { "status": 200, "status_desc": "Success", "messageid": "...", "credits": ... }

TODO : Remplis les 3 champs ci-dessous avec tes identifiants NGH.
"""

import http.client
import json

# ─────────────────────────────────────────────────────────────
# TODO : à remplir avec tes identifiants NGH SMS
NGH_API_KEY    = ""   # api_key   — ex: k_RdFidnulkkY7UVfmNtPZgL9C11J
NGH_API_SECRET = ""   # api_secret — ex: s_gTWNjzxXUKddffO8aio1vXC_jLOIiJ
NGH_SENDER_ID  = ""   # from      — ton Sender ID approuvé, ex: "ADAWI"
# ─────────────────────────────────────────────────────────────

NGH_HOST     = "extranet.nghcorp.net"
NGH_ENDPOINT = "/api/send-sms"


def send_sms(to: int | str, message: str, reference: int = 0) -> dict:
    """
    Envoie un SMS via NGH SMS API.

    Args:
        to        : Numéro destinataire (int ou str), ex: 22892470847
        message   : Texte du SMS
        reference : Référence optionnelle pour tracking, ex: 1212

    Returns:
        dict avec "success" (bool), "status" (int), "message_id" (str), "credits" (int)
    """
    payload = json.dumps({
        "from":       NGH_SENDER_ID,
        "to":         int(to),
        "text":       message,
        "reference":  reference,
        "api_key":    NGH_API_KEY,
        "api_secret": NGH_API_SECRET,
    })

    headers = {"Content-Type": "application/json"}

    try:
        conn = http.client.HTTPSConnection(NGH_HOST, timeout=10)
        conn.request("POST", NGH_ENDPOINT, payload, headers)
        res  = conn.getresponse()
        data = res.read().decode("utf-8")
        conn.close()

        result = json.loads(data)
        success = result.get("status") == 200

        return {
            "success":    success,
            "status":     result.get("status"),
            "status_desc": result.get("status_desc", ""),
            "message_id": result.get("messageid", ""),
            "credits":    result.get("credits", 0),
            "raw":        result,
        }

    except Exception as e:
        return {
            "success":    False,
            "status":     -1,
            "status_desc": f"Erreur : {e}",
            "message_id": "",
            "credits":    0,
            "raw":        None,
        }


def send_sms_bulk(contacts: list, message: str) -> list:
    """
    Envoie le même SMS à une liste de numéros.

    Args:
        contacts : Liste de numéros, ex: [22890000000, 22870000000]
        message  : Texte du message

    Returns:
        Liste de résultats pour chaque numéro
    """
    results = []
    for idx, contact in enumerate(contacts):
        result = send_sms(contact, message, reference=idx + 1)
        result["contact"] = contact
        status = "✓" if result["success"] else "✗"
        print(f"  {status} {contact} : {result['status_desc']}")
        results.append(result)
    return results


# ─────────────────────────────────────────────────────────────
# Templates de messages Adawi
# ─────────────────────────────────────────────────────────────

def msg_commande_confirmee(nom: str, ref: str) -> str:
    return f"Bonjour {nom}, votre commande {ref} est confirmée. Merci pour votre achat ! - ADAWI"

def msg_commande_expediee(nom: str, ref: str) -> str:
    return f"Bonjour {nom}, votre commande {ref} est en cours de livraison. Vous serez contacté. - ADAWI"

def msg_commande_livree(nom: str, ref: str) -> str:
    return f"Bonjour {nom}, votre commande {ref} a bien été livrée. Bonne utilisation ! - ADAWI"

def msg_commande_annulee(nom: str, ref: str) -> str:
    return f"Bonjour {nom}, votre commande {ref} a été annulée. Contactez-nous pour plus d'infos. - ADAWI"

def msg_remboursement(nom: str, montant: str) -> str:
    return f"Bonjour {nom}, votre remboursement de {montant} FCFA a été initié (2-3 jours ouvrables). - ADAWI"

def msg_nouveau_compte(nom: str) -> str:
    return f"Bienvenue {nom} ! Votre compte ADAWI a été créé avec succès. Bonne expérience de shopping !"


# ─────────────────────────────────────────────────────────────
# Test rapide — python sms.py
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # TODO : remplace par un vrai numéro de test
    TEST_CONTACT = 22897732976        # ex: 22890000000
    TEST_NOM     = "marc"   # ex: "Jean Dupont"

    print("=== Test envoi SMS NGH ===")
    message = msg_commande_confirmee(TEST_NOM, "CMD-001")
    print(f"Contact : {TEST_CONTACT}")
    print(f"Message : {message}\n")

    result = send_sms(TEST_CONTACT, message, reference=1001)
    print(json.dumps(result, indent=2, ensure_ascii=False))
