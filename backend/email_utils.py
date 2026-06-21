import os
import resend
from dotenv import load_dotenv

load_dotenv()

# Resend API Key
resend.api_key = os.getenv("RESEND_API_KEY")


async def send_reset_email(to_email: str, reset_token: str):
    """Send a password reset email with Resend."""

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5174")
    reset_link = f"{frontend_url}/reset-password/{reset_token}"

    # Plain text fallback
    plain_text = f"""Hello,

Click the link below to reset your password:

{reset_link}

This link expires in 15 minutes. If you did not request a password reset, you can safely ignore this email.

— InternHub Team
"""

    # HTML body
    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {{
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      margin: 0;
      padding: 0;
    }}
    .wrapper {{
      max-width: 520px;
      margin: 40px auto;
      background: #1a1d2e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      padding: 40px 36px;
    }}
    .logo {{
      font-size: 2rem;
      margin-bottom: 8px;
    }}
    .brand {{
      font-size: 1.4rem;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.5px;
    }}
    h2 {{
      color: #f8fafc;
      font-size: 1.5rem;
      margin: 24px 0 8px;
    }}
    p {{
      color: #94a3b8;
      line-height: 1.7;
      font-size: 0.95rem;
    }}
    .btn {{
      display: inline-block;
      margin: 28px 0 20px;
      padding: 14px 32px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #fff !important;
      font-size: 1rem;
      font-weight: 700;
      text-decoration: none;
      border-radius: 10px;
      box-shadow: 0 0 24px rgba(99,102,241,0.4);
    }}
    .expiry {{
      font-size: 0.82rem;
      color: #64748b;
      margin-top: 16px;
    }}
    .divider {{
      border: none;
      border-top: 1px solid rgba(255,255,255,0.08);
      margin: 24px 0;
    }}
    .footer {{
      font-size: 0.78rem;
      color: #475569;
      text-align: center;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo">🎓</div>
    <div class="brand">InternHub</div>

    <h2>Reset Your Password</h2>

    <p>We received a request to reset the password for your InternHub account.</p>

    <p>Click the button below to set a new password:</p>

    <a href="{reset_link}" class="btn">🔑 Reset My Password</a>

    <p class="expiry">
      ⏱ This link expires in <strong>15 minutes</strong>.
    </p>

    <hr class="divider" />

    <p style="font-size:0.85rem;">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will remain unchanged.
    </p>

    <hr class="divider" />

    <p class="footer">
      © 2026 InternHub · All rights reserved
    </p>
  </div>
</body>
</html>
"""

    try:
        resend.Emails.send(
            {
                "from": "onboarding@resend.dev",
                "to": [to_email],
                "subject": "Reset Your Password",
                "html": html_body,
                "text": plain_text,
            }
        )

        print(f"✅ Reset email sent to {to_email}")

    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        raise