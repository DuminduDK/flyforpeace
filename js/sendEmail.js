/**
 * sendEmail.js — Fly for Peace
 * Calls Resend API directly via CORS proxy (same pattern as contact form).
 * 
 * Usage (ES module):
 *   import { sendEmail } from './sendEmail.js';
 *   await sendEmail('user@example.com', 'Subject', '<p>HTML</p>');
 */

const RESEND_API_KEY = "re_GqjoHFsi_KVtDoA5GevTmmntk9i9KgfMu";
const FROM_ADDRESS   = "noreply@webmindr.online";
const CORS_PROXY     = "https://corsproxy.io/?";

/**
 * Send an email via Resend API.
 * @param {string|string[]} to
 * @param {string} subject
 * @param {string} html
 * @returns {Promise<boolean>}
 */
export async function sendEmail(to, subject, html) {
    try {
        const res = await fetch(CORS_PROXY + "https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type":  "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: FROM_ADDRESS,
                to:   Array.isArray(to) ? to : [to],
                subject,
                html,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.warn(`❌ Resend error (${res.status}):`, err.message || err);
            return false;
        }

        console.log(`✅ Email sent to: ${to}`);
        return true;
    } catch (err) {
        console.error("sendEmail network error:", err);
        return false;
    }
}

// ══════════════════════════════════════════════
//  EMAIL TEMPLATES
// ══════════════════════════════════════════════

export function membershipConfirmationHTML(name, memberType, amount, currency) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;}
.wrap{max-width:620px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.10);}
.hdr{background:linear-gradient(135deg,#153c5e 0%,#5ca4cf 100%);padding:48px 40px 36px;text-align:center;}
.hdr h1{color:#fff;margin:0;font-size:2rem;}
.hdr p{color:rgba(255,255,255,.85);margin:8px 0 0;font-size:1rem;}
.body{padding:40px;}
.card{background:linear-gradient(135deg,#e8f4fd,#f0f9ff);border-radius:12px;padding:28px;margin:24px 0;border-left:5px solid #5ca4cf;}
.card-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(92,164,207,.15);}
.card-row:last-child{border-bottom:none;}
.card-label{color:#666;font-size:.9rem;}
.card-val{color:#153c5e;font-weight:700;font-size:.95rem;}
.hl{background:linear-gradient(135deg,#153c5e,#5ca4cf);color:#fff;border-radius:10px;padding:22px 28px;text-align:center;margin:24px 0;}
.hl p{margin:0;font-size:.95rem;opacity:.9;}
.hl strong{display:block;font-size:1.4rem;margin-bottom:4px;}
.fnote{font-size:.85rem;color:#888;text-align:center;margin-top:24px;line-height:1.6;}
.fbar{background:#0f172a;padding:24px 40px;text-align:center;}
.fbar p{color:#64748b;font-size:.82rem;margin:4px 0;}
.fbar a{color:#5ca4cf;text-decoration:none;}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>&#x1F54A;&#xFE0F; Fly for Peace</h1><p>Peace Membership Confirmation</p></div>
  <div class="body">
    <p style="font-size:1.05rem;color:#1a202c;">Dear <strong>${name}</strong>,</p>
    <p style="color:#555;line-height:1.7;">Thank you for joining the <strong>Fly for Peace</strong> global movement for cultural harmony and a peaceful world. Your membership has been received and your payment is confirmed.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Member Name</span><span class="card-val">${name}</span></div>
      <div class="card-row"><span class="card-label">Membership Type</span><span class="card-val">${memberType}</span></div>
      <div class="card-row"><span class="card-label">Amount Paid</span><span class="card-val">${currency} ${amount}</span></div>
      <div class="card-row"><span class="card-label">Status</span><span class="card-val" style="color:#27ae60;">&#x2713; Payment Confirmed</span></div>
    </div>
    <div class="hl">
      <p>What happens next?</p>
      <strong>A team member will contact you shortly</strong>
      <p>We will be in touch to share your exclusive membership benefits and onboarding details.</p>
    </div>
    <p style="color:#555;line-height:1.7;text-align:center;">Thank you for supporting global unity and peace.</p>
    <p class="fnote">Questions? <a href="mailto:flyforpeaceinfo@gmail.com" style="color:#5ca4cf;">flyforpeaceinfo@gmail.com</a><br>Please do not reply to this automated email.</p>
  </div>
  <div class="fbar">
    <p>&copy; 2026 Fly for Peace &ndash; World Peace Movement. All Rights Reserved.</p>
    <p><a href="https://flyforpeace.rakasl.com">flyforpeace.rakasl.com</a></p></div>
  </div>
</div>
</body></html>`;
}

export function membershipAdminNotifHTML(name, email, phone, memberType, amount, currency, extraDetails) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;}
.wrap{max-width:580px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1);}
.hdr{background:linear-gradient(135deg,#153c5e,#e74c3c);padding:32px 36px;text-align:center;}
.hdr h1{color:#fff;margin:0;font-size:1.6rem;}
.hdr p{color:rgba(255,255,255,.85);margin:6px 0 0;}
.body{padding:32px 36px;}
.badge{background:#e74c3c;color:#fff;padding:5px 16px;border-radius:20px;font-size:.82rem;font-weight:700;display:inline-block;margin-bottom:18px;}
.card{background:#f8fafc;border-radius:12px;padding:22px;border:1px solid #e2e8f0;}
.card-row{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 0;border-bottom:1px solid #e2e8f0;font-size:.88rem;}
.card-row:last-child{border-bottom:none;}
.card-label{color:#888;}
.card-val{color:#1a202c;font-weight:700;text-align:right;max-width:60%;word-break:break-word;}
.cta{display:block;background:#153c5e;color:#fff;text-align:center;padding:15px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:24px;}
.fbar{background:#0f172a;padding:20px;text-align:center;}
.fbar p{color:#64748b;font-size:.8rem;margin:0;}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>&#x1F514; New Member Registered</h1><p>Fly for Peace Admin Notification</p></div>
  <div class="body">
    <span class="badge">ACTION REQUIRED</span>
    <p style="color:#444;margin-bottom:20px;line-height:1.6;">A new member has registered and completed payment. Please initiate onboarding contact.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Full Name</span><span class="card-val">${name}</span></div>
      <div class="card-row"><span class="card-label">Email</span><span class="card-val">${email}</span></div>
      <div class="card-row"><span class="card-label">WhatsApp</span><span class="card-val">${phone || '&mdash;'}</span></div>
      <div class="card-row"><span class="card-label">Membership Type</span><span class="card-val">${memberType}</span></div>
      <div class="card-row"><span class="card-label">Amount Paid</span><span class="card-val">${currency} ${amount}</span></div>
      ${extraDetails}
      <div class="card-row"><span class="card-label">Registered At</span><span class="card-val">${new Date().toLocaleString('en-US', { dateStyle:'medium', timeStyle:'short' })}</span></div>
    </div>
    <a href="https://flyforpeace.rakasl.com/admin/dashboard.html" class="cta">Open Admin Dashboard &rarr;</a>
  </div>
  <div class="fbar"><p>Fly for Peace Admin System &mdash; Automated Notification</p></div>
</div>
</body></html>`;
}

export function donationApprovedHTML(donorName, amount) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;}
.wrap{max-width:620px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.10);}
.hdr{background:linear-gradient(135deg,#27ae60 0%,#2ecc71 100%);padding:48px 40px 36px;text-align:center;}
.hdr h1{color:#fff;margin:0;font-size:2rem;}
.hdr p{color:rgba(255,255,255,.85);margin:8px 0 0;}
.body{padding:40px;}
.impact{background:linear-gradient(135deg,#e8f8f5,#d5f5e3);border-radius:12px;padding:30px;margin:24px 0;text-align:center;border:1px solid rgba(39,174,96,.2);}
.amount{font-size:3.2rem;font-weight:900;color:#27ae60;line-height:1;}
.currency{font-size:1rem;color:#555;font-weight:600;margin-bottom:6px;}
.ref{background:#f8fafc;border-radius:10px;padding:22px;margin:20px 0;border-left:4px solid #27ae60;}
.ref p{margin:6px 0;font-size:.9rem;color:#555;}
.quote{border:1px solid #e2e8f0;border-radius:10px;padding:22px 28px;margin:24px 0;font-style:italic;color:#555;text-align:center;font-size:1.05rem;line-height:1.7;}
.fnote{font-size:.85rem;color:#888;text-align:center;margin-top:24px;line-height:1.6;}
.fbar{background:#0f172a;padding:24px 40px;text-align:center;}
.fbar p{color:#64748b;font-size:.82rem;margin:4px 0;}
.fbar a{color:#5ca4cf;text-decoration:none;}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>&#x1F49A; Thank You!</h1><p>Your Donation to Fly for Peace Has Been Confirmed</p></div>
  <div class="body">
    <p style="font-size:1.05rem;color:#1a202c;">Dear <strong>${donorName}</strong>,</p>
    <p style="color:#555;line-height:1.7;">We are deeply grateful for your generous contribution to <strong>Fly for Peace</strong>. Your donation has been verified and officially recorded.</p>
    <div class="impact">
      <div class="currency">USD</div>
      <div class="amount">$${amount}</div>
      <div style="font-size:.9rem;color:#666;margin-top:10px;">&#x2713; Verified &amp; Confirmed by Fly for Peace Team</div>
    </div>
    <div class="ref">
      <p><strong>Your donation directly supports:</strong></p>
      <p>&#x1FA81; International Kite Air Show &mdash; Bentota Beach, Sri Lanka (April 22nd, 2026)</p>
      <p>&#x1F30D; Global outreach and cultural exchange programs</p>
      <p>&#x1F54A;&#xFE0F; Campaigns promoting peace and unity worldwide</p>
    </div>
    <div class="quote">&ldquo;Air is not for war; Air is to breathe.&rdquo;</div>
    <p style="color:#555;line-height:1.7;text-align:center;">Your kindness is helping us build a world where the sky is painted with colors of freedom. Thank you for being part of this movement.</p>
    <p class="fnote">Questions? <a href="mailto:flyforpeaceinfo@gmail.com" style="color:#5ca4cf;">flyforpeaceinfo@gmail.com</a><br>Please do not reply to this automated email.</p>
  </div>
  <div class="fbar">
    <p>&copy; 2026 Fly for Peace &ndash; World Peace Movement. All Rights Reserved.</p>
    <p><a href="https://flyforpeace.rakasl.com">flyforpeace.rakasl.com</a></p>
  </div>
</div>
</body></html>`;
}

export function donationAdminNotifHTML(donorName, donorEmail, amount) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;}
.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;}
.hdr{background:linear-gradient(135deg,#153c5e,#27ae60);padding:30px 36px;text-align:center;}
.hdr h1{color:#fff;margin:0;font-size:1.5rem;}
.hdr p{color:rgba(255,255,255,.8);margin:6px 0 0;}
.body{padding:32px 36px;}
.badge{background:#27ae60;color:#fff;padding:5px 16px;border-radius:20px;font-size:.82rem;font-weight:700;display:inline-block;margin-bottom:18px;}
.card{background:#f8fafc;border-radius:12px;padding:22px;border:1px solid #e2e8f0;}
.card-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #e2e8f0;font-size:.88rem;}
.card-row:last-child{border-bottom:none;}
.card-label{color:#888;}
.card-val{color:#1a202c;font-weight:700;}
.cta{display:block;background:#153c5e;color:#fff;text-align:center;padding:14px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:20px;}
.fbar{background:#0f172a;padding:18px;text-align:center;}
.fbar p{color:#64748b;font-size:.8rem;margin:0;}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>&#x1F4B0; Donation Approved</h1><p>Fly for Peace Admin Record</p></div>
  <div class="body">
    <span class="badge">DONATION VERIFIED</span>
    <p style="color:#444;margin-bottom:20px;line-height:1.6;">You approved a donation. A confirmation email has been automatically sent to the donor.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Donor Name</span><span class="card-val">${donorName}</span></div>
      <div class="card-row"><span class="card-label">Donor Email</span><span class="card-val">${donorEmail}</span></div>
      <div class="card-row"><span class="card-label">Amount</span><span class="card-val">$${amount} USD</span></div>
      <div class="card-row"><span class="card-label">Approved At</span><span class="card-val">${new Date().toLocaleString('en-US', { dateStyle:'medium', timeStyle:'short' })}</span></div>
    </div>
    <a href="https://flyforpeace.rakasl.com/admin/dashboard.html" class="cta">View Dashboard &rarr;</a>
  </div>
  <div class="fbar"><p>Fly for Peace Admin System &mdash; Automated Notification</p></div>
</div>
</body></html>`;
}
