import smtplib
from email.message import EmailMessage

EMAIL = "marcusgigoh@gmail.com"
APP_PASSWORD = "yidpmyackvqqkeed"

msg = EmailMessage()
msg["Subject"] = "Test SMTP Gmail"
msg["From"] = EMAIL
msg["To"] = EMAIL
msg.set_content("Test SMTP réussi.")

with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
    smtp.login(EMAIL, APP_PASSWORD)
    smtp.send_message(msg)

print("Email envoyé avec succès !")