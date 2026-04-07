// ══════════════════════════════════════════════
//  EmailJS Config — Fly for Peace
//  Replace the placeholders with your real keys
//  from https://dashboard.emailjs.com
// ══════════════════════════════════════════════

const EMAILJS_PUBLIC_KEY   = "YOUR_EMAILJS_PUBLIC_KEY";    // From EmailJS → Account → API Keys
const EMAILJS_SERVICE_ID   = "YOUR_EMAILJS_SERVICE_ID";    // From EmailJS → Email Services
const ADMIN_EMAIL          = "flyforpeaceinfo@gmail.com";       // ← Change to real admin email

// ─── Initialise ───────────────────────────────
(function() {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => emailjs.init(EMAILJS_PUBLIC_KEY);
    document.head.appendChild(script);
})();

// ─── TEMPLATE IDs (create these in EmailJS dashboard) ─────────────────────
// All templates use a single "html_body" variable — we pass the full HTML ourselves.
const TEMPLATE_GENERIC = "template_generic_html"; // One universal template with {{html_body}}

// ─── Email sender ──────────────────────────────────────────────────────────
async function sendEmail(toEmail, subject, htmlBody) {
    try {
        await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_GENERIC, {
            to_email: toEmail,
            subject:  subject,
            html_body: htmlBody,
        });
        console.log(`✅ Email sent to ${toEmail}`);
    } catch(err) {
        console.error("EmailJS error:", err);
    }
}

// ══════════════════════════════════════════════
//  EMAIL TEMPLATES
// ══════════════════════════════════════════════

function membershipConfirmationHTML(name, memberType, amount, currency) {
    return `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;}
  .wrap{max-width:620px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);}
  .header{background:linear-gradient(135deg,#153c5e 0%,#5ca4cf 100%);padding:48px 40px 36px;text-align:center;}
  .header img{width:90px;margin-bottom:18px;}
  .header h1{color:#fff;margin:0;font-size:2rem;letter-spacing:-0.5px;}
  .header p{color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:1rem;}
  .body{padding:40px;}
  .greeting{font-size:1.15rem;color:#1a202c;margin-bottom:20px;}
  .card{background:linear-gradient(135deg,#e8f4fd,#f0f9ff);border-radius:12px;padding:28px;margin:24px 0;border-left:5px solid #5ca4cf;}
  .card-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(92,164,207,0.15);}
  .card-row:last-child{border-bottom:none;}
  .card-label{color:#666;font-size:0.9rem;}
  .card-val{color:#153c5e;font-weight:700;font-size:0.95rem;}
  .highlight{background:linear-gradient(135deg,#153c5e,#5ca4cf);color:#fff;border-radius:10px;padding:20px 28px;text-align:center;margin:24px 0;}
  .highlight p{margin:0;font-size:1rem;opacity:0.9;}
  .highlight strong{display:block;font-size:1.5rem;margin-bottom:4px;}
  .cta-btn{display:block;background:linear-gradient(135deg,#e74c3c,#c0392b);color:#fff;text-decoration:none;text-align:center;padding:16px 32px;border-radius:50px;font-weight:700;font-size:1rem;margin:28px auto;width:fit-content;}
  .footer-note{font-size:0.85rem;color:#888;text-align:center;margin-top:30px;line-height:1.6;}
  .footer-bar{background:#0f172a;padding:24px 40px;text-align:center;}
  .footer-bar p{color:#64748b;font-size:0.82rem;margin:0;}
  .footer-bar a{color:#5ca4cf;text-decoration:none;}
  .social-row{margin:12px 0;}
  .social-row a{display:inline-block;background:rgba(255,255,255,0.08);color:#94a3b8;border-radius:50%;width:34px;height:34px;line-height:34px;text-align:center;margin:0 3px;text-decoration:none;font-size:0.85rem;}
  .divider{height:1px;background:#e2e8f0;margin:24px 0;}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🕊️ Fly for Peace</h1>
    <p>Peace Membership Confirmation</p>
  </div>
  <div class="body">
    <p class="greeting">Dear <strong>${name}</strong>,</p>
    <p>Thank you for joining the <strong>Fly for Peace</strong> global movement for cultural harmony and a peaceful world. Your membership registration has been received successfully.</p>

    <div class="card">
      <div class="card-row"><span class="card-label">Member Name</span><span class="card-val">${name}</span></div>
      <div class="card-row"><span class="card-label">Membership Type</span><span class="card-val">${memberType}</span></div>
      <div class="card-row"><span class="card-label">Amount Paid</span><span class="card-val">${currency} ${amount}</span></div>
      <div class="card-row"><span class="card-label">Status</span><span class="card-val" style="color:#27ae60;">✓ Payment Confirmed</span></div>
    </div>

    <div class="highlight">
      <p>What happens next?</p>
      <strong>A team member will contact you shortly</strong>
      <p>We'll be in touch to share your exclusive membership benefits and onboarding details.</p>
    </div>

    <p style="color:#555;line-height:1.7;">In the meantime, feel free to explore our website, follow us on social media, and spread the word about the Peace movement. Together, we make the sky a canvas of unity.</p>

    <div class="divider"></div>
    <p class="footer-note">If you have any questions, contact us at <a href="mailto:flyforpeaceinfo@gmail.com" style="color:#5ca4cf;">flyforpeaceinfo@gmail.com</a><br>Please do not reply directly to this email.</p>
  </div>
  <div class="footer-bar">
    <div class="social-row">
      <a href="https://web.facebook.com/profile.php?id=61573327524448">f</a>
      <a href="https://x.com/flyforpeacex">𝕏</a>
      <a href="https://www.instagram.com/flyforpeaceofficial">▣</a>
      <a href="https://www.linkedin.com/company/flyforpeace">in</a>
    </div>
    <p>© 2026 Fly for Peace – World Peace Movement. All Rights Reserved.</p>
    <p><a href="https://flyforpeace.com">flyforpeace.com</a></p>
  </div>
</div>
</body></html>`;
}

function membershipAdminNotifHTML(name, email, memberType, amount, currency, extraDetails) {
    return `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;}
  .wrap{max-width:620px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);}
  .header{background:linear-gradient(135deg,#153c5e 0%,#e74c3c 100%);padding:36px 40px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:1.6rem;}
  .header p{color:rgba(255,255,255,0.85);margin:6px 0 0;}
  .body{padding:36px 40px;}
  .alert-badge{background:#e74c3c;color:#fff;padding:4px 14px;border-radius:20px;font-size:0.82rem;font-weight:700;display:inline-block;margin-bottom:16px;}
  .card{background:#f8fafc;border-radius:12px;padding:24px;border:1px solid #e2e8f0;}
  .card-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #e2e8f0;}
  .card-row:last-child{border-bottom:none;}
  .card-label{color:#666;font-size:0.9rem;}
  .card-val{color:#1a202c;font-weight:700;font-size:0.9rem;text-align:right;max-width:60%;}
  .cta{display:block;background:#153c5e;color:#fff;text-align:center;padding:14px 28px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:24px;}
  .footer-bar{background:#0f172a;padding:20px 40px;text-align:center;}
  .footer-bar p{color:#64748b;font-size:0.8rem;margin:0;}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🔔 New Member Registered</h1>
    <p>Fly for Peace Admin Notification</p>
  </div>
  <div class="body">
    <span class="alert-badge">ACTION REQUIRED</span>
    <p style="color:#444;margin-bottom:20px;">A new member has successfully registered and completed payment. Please review their details and initiate onboarding contact.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Full Name</span><span class="card-val">${name}</span></div>
      <div class="card-row"><span class="card-label">Email</span><span class="card-val">${email}</span></div>
      <div class="card-row"><span class="card-label">Membership Type</span><span class="card-val">${memberType}</span></div>
      <div class="card-row"><span class="card-label">Amount Paid</span><span class="card-val">${currency} ${amount}</span></div>
      ${extraDetails}
      <div class="card-row"><span class="card-label">Registered At</span><span class="card-val">${new Date().toLocaleString()}</span></div>
    </div>
    <a href="https://flyforpeace.com/admin/dashboard.html" class="cta">View in Admin Dashboard →</a>
  </div>
  <div class="footer-bar"><p>Fly for Peace Admin System — Automated Notification</p></div>
</div>
</body></html>`;
}

function donationApprovedHTML(donorName, amount) {
    return `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;}
  .wrap{max-width:620px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);}
  .header{background:linear-gradient(135deg,#27ae60 0%,#2ecc71 100%);padding:48px 40px 36px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:2rem;}
  .header p{color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:1rem;}
  .body{padding:40px;}
  .greeting{font-size:1.1rem;color:#1a202c;margin-bottom:20px;}
  .impact-box{background:linear-gradient(135deg,#e8f8f5,#d5f5e3);border-radius:12px;padding:28px;margin:24px 0;text-align:center;border:1px solid rgba(39,174,96,0.2);}
  .impact-box .amount{font-size:3rem;font-weight:900;color:#27ae60;font-family:'Segoe UI',Arial;line-height:1;}
  .impact-box .currency{font-size:1rem;color:#555;font-weight:600;margin-bottom:6px;}
  .impact-box .label{font-size:0.9rem;color:#666;margin-top:8px;}
  .ref-card{background:#f8fafc;border-radius:10px;padding:20px;margin:20px 0;border-left:4px solid #27ae60;}
  .ref-card p{margin:5px 0;font-size:0.9rem;color:#555;}
  .ref-card strong{color:#1a202c;}
  .quote-box{border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin:24px 0;font-style:italic;color:#555;text-align:center;font-size:1rem;line-height:1.7;}
  .quote-box::before{content:'"';font-size:3rem;color:#5ca4cf;line-height:0.5;display:block;margin-bottom:12px;}
  .footer-note{font-size:0.85rem;color:#888;text-align:center;margin-top:24px;line-height:1.6;}
  .footer-bar{background:#0f172a;padding:24px 40px;text-align:center;}
  .footer-bar p{color:#64748b;font-size:0.82rem;margin:4px 0;}
  .footer-bar a{color:#5ca4cf;text-decoration:none;}
  .social-row a{display:inline-block;background:rgba(255,255,255,0.08);color:#94a3b8;border-radius:50%;width:34px;height:34px;line-height:34px;text-align:center;margin:4px 3px;text-decoration:none;font-size:0.85rem;}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>💚 Thank You!</h1>
    <p>Your Donation Has Been Confirmed</p>
  </div>
  <div class="body">
    <p class="greeting">Dear <strong>${donorName}</strong>,</p>
    <p>We are deeply grateful for your generous contribution to <strong>Fly for Peace</strong>. Your donation has been verified and officially recorded.</p>

    <div class="impact-box">
      <div class="currency">USD</div>
      <div class="amount">$${amount}</div>
      <div class="label">✓ Verified &amp; Confirmed by Fly for Peace Team</div>
    </div>

    <div class="ref-card">
      <p><strong>What your donation supports:</strong></p>
      <p>🪁 International Kite Air Show — Bentota Beach, Sri Lanka (April 22nd, 2026)</p>
      <p>🌍 Global outreach and cultural exchange programs</p>
      <p>🕊️ Campaigns promoting peace and unity worldwide</p>
    </div>

    <div class="quote-box">
      Air is not for war; Air is to breathe.
    </div>

    <p style="color:#555;line-height:1.7;text-align:center;">Your kindness is helping us build a world where the sky is filled with colors of freedom. Thank you for being a part of this movement.</p>

    <p class="footer-note">Questions? Reach us at <a href="mailto:flyforpeaceinfo@gmail.com" style="color:#5ca4cf;">flyforpeaceinfo@gmail.com</a></p>
  </div>
  <div class="footer-bar">
    <div class="social-row">
      <a href="https://web.facebook.com/profile.php?id=61573327524448">f</a>
      <a href="https://x.com/flyforpeacex">𝕏</a>
      <a href="https://www.instagram.com/flyforpeaceofficial">▣</a>
    </div>
    <p>© 2026 Fly for Peace – World Peace Movement. All Rights Reserved.</p>
    <p><a href="https://flyforpeace.com">flyforpeace.com</a></p>
  </div>
</div>
</body></html>`;
}
