import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_email_with_pdf(
    to_email: str,
    subject: str,
    body_text: str,
    pdf_bytes: bytes,
    filename: str
) -> bool:
    """
    Sends an email with a PDF attachment.
    If SMTP credentials are not configured, logs the payload safely.
    """
    smtp_host = getattr(settings, "SMTP_HOST", None)
    smtp_port = getattr(settings, "SMTP_PORT", 587)
    smtp_user = getattr(settings, "SMTP_USER", None)
    smtp_password = getattr(settings, "SMTP_PASSWORD", None)
    from_email = getattr(settings, "EMAILS_FROM_EMAIL", "noreply@kitrivo.com")

    if not smtp_host or not smtp_user:
        logger.info(
            f"[MOCK EMAIL SERVICE] Email requested for {to_email}.\n"
            f"Subject: {subject}\n"
            f"Attachment: {filename} ({len(pdf_bytes)} bytes)\n"
            f"Body:\n{body_text}"
        )
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body_text, 'html'))

        pdf_attachment = MIMEApplication(pdf_bytes, _subtype="pdf")
        pdf_attachment.add_header('Content-Disposition', 'attachment', filename=filename)
        msg.attach(pdf_attachment)

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)

        logger.info(f"Email successfully sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False
