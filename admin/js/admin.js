import { auth, db, collection, addDoc, getDocs, orderBy, query, onAuthStateChanged, signOut, Timestamp, doc, updateDoc, deleteDoc } from '../../js/firebase-config.js';
import { donationApprovedHTML, donationAdminNotifHTML } from '../../js/sendEmail.js';

const RESEND_API_KEY = "re_GqjoHFsi_KVtDoA5GevTmmntk9i9KgfMu";
const FROM_ADDRESS   = "noreply@webmindr.online";
const CORS_PROXY     = "https://corsproxy.io/?";
const ADMIN_EMAIL    = "flyforpeaceinfo@gmail.com";

async function sendEmail(to, subject, html) {
    try {
        await fetch(CORS_PROXY + "https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({ from: FROM_ADDRESS, to: Array.isArray(to) ? to : [to], subject, html }),
        });
        console.log("✅ Email sent to:", to);
    } catch(err) {
        console.warn("❌ Email error:", err);
    }
}


// ── Auth Guard ─────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        document.getElementById('auth-guard').style.display = 'flex';
        loadNews();
        loadMembers();
        loadDonations();
        loadMessages();
        loadRepresentatives();
    }
});

// ── Logout ─────────────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => { window.location.href = 'login.html'; });
});

// ── Tab Navigation ──────────────────────────────────────
const navLinks = document.querySelectorAll('.nav-link[data-target]');
const sections = document.querySelectorAll('.content-section');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        link.classList.add('active');
        document.getElementById(link.dataset.target).classList.add('active');
        document.getElementById('page-title').innerText = link.innerText.trim();
    });
});

// ── NEWS ───────────────────────────────────────────────
let selectedImages = []; // Array of base64 strings

// Utility: Image compression
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000; // Increased for better blog quality
                let width = img.width, height = img.height;
                if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function updateImagePreviewStrip() {
    const strip = document.getElementById('image-preview-strip');
    if (!selectedImages.length) {
        strip.innerHTML = '<div style="color: #94a3b8; font-size: 0.8rem; text-align: center; width: 100%; padding-top: 25px;">No images selected</div>';
        return;
    }
    strip.innerHTML = selectedImages.map((img, idx) => `
        <div class="preview-item">
            <img src="${img}" class="preview-thumb">
            <button type="button" class="remove-preview" onclick="removeSelectedImage(${idx})"><i class="fas fa-times"></i></button>
            ${idx === 0 ? '<span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.6); color:#fff; font-size:9px; text-align:center; border-bottom-left-radius:6px; border-bottom-right-radius:6px;">Cover</span>' : ''}
        </div>
    `).join('');
}

window.removeSelectedImage = (index) => {
    selectedImages.splice(index, 1);
    updateImagePreviewStrip();
};

document.getElementById('news-image').addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    
    // If not editing, we might want to allow adding to existing if we implement it that way,
    // but for now let's just replace or append. Let's APPEND.
    for (const file of files) {
        const base64 = await compressImage(file);
        selectedImages.push(base64);
    }
    updateImagePreviewStrip();
    e.target.value = ''; // clear input so same file can be selected again
});

document.getElementById('news-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('post-news-btn');
    const editId = document.getElementById('edit-news-id').value;
    btn.innerText = "Applying...";
    try {
        if (!selectedImages.length) {
            alert("Please upload at least one image (Cover image).");
            btn.innerText = editId ? "Update News" : "Publish News";
            return;
        }

        const payload = {
            title: document.getElementById('news-title').value,
            dateLabel: document.getElementById('news-date').value,
            category: document.getElementById('news-category').value,
            content: document.getElementById('news-desc').value,
            imageBase64: selectedImages[0], // primary for backward compat
            images: selectedImages // full gallery
        };
        if (editId) {
            await updateDoc(doc(db, "news", editId), payload);
            document.getElementById('news-success').innerText = "Successfully updated!";
        } else {
            payload.createdAt = Timestamp.now();
            await addDoc(collection(db, "news"), payload);
            document.getElementById('news-success').innerText = "Successfully published!";
        }
        cancelEdit();
        document.getElementById('news-success').style.display = 'block';
        setTimeout(() => { document.getElementById('news-success').style.display = 'none'; }, 3000);
        loadNews();
    } catch(err) {
        console.error(err);
        btn.innerText = "Error: See Console";
    }
});

function cancelEdit() {
    document.getElementById('news-form').reset();
    document.getElementById('edit-news-id').value = '';
    selectedImages = [];
    updateImagePreviewStrip();
    document.getElementById('form-header-title').innerText = "Post New Announcement";
    document.getElementById('post-news-btn').innerText = "Publish News";
    document.getElementById('cancel-edit-btn').style.display = 'none';
}
document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);

window.editNews = async (id) => {
    const q = query(collection(db, "news")); // simplified, we just need the doc
    const snap = await getDocs(q);
    const data = snap.docs.find(d => d.id === id)?.data();
    if (!data) return;

    document.getElementById('edit-news-id').value = id;
    document.getElementById('news-title').value = data.title;
    document.getElementById('news-date').value = data.dateLabel;
    document.getElementById('news-category').value = data.category || 'Announcement';
    document.getElementById('news-desc').value = data.content;
    
    selectedImages = data.images || (data.imageBase64 ? [data.imageBase64] : []);
    updateImagePreviewStrip();

    document.getElementById('form-header-title').innerText = "Edit Announcement";
    document.getElementById('post-news-btn').innerText = "Update News";
    document.getElementById('cancel-edit-btn').style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
window.deleteNews = async (id) => {
    if (confirm('Delete this news post?')) { await deleteDoc(doc(db, "news", id)); loadNews(); }
};

async function loadNews() {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const tbody = document.getElementById('news-table-body');
    tbody.innerHTML = '';
    snap.forEach((documentObj) => {
        const data = documentObj.data(), id = documentObj.id;
        const safeTitle   = (data.title   || '').replace(/'/g, "\\'");
        const safeDate    = (data.dateLabel|| '').replace(/'/g, "\\'");
        const safeContent = (data.content  || '').replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "");
        tbody.innerHTML += `<tr>
            <td>${data.dateLabel}</td>
            <td><span class="type-pill" style="background: var(--accent); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${data.category || 'Announcement'}</span></td>
            <td><strong>${data.title}</strong></td>
            <td>${data.content.substring(0, 50)}...</td>
            <td>
                <button onclick="editNews('${id}')" style="background:#5ca4cf;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;margin-right:5px;"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="deleteNews('${id}')" style="background:#e74c3c;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
}

// ── MEMBERS ────────────────────────────────────────────
let _allMembers = [];

async function loadMembers() {
    try {
        const q = query(collection(db, "members"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        _allMembers = [];
        snap.forEach(docSnap => {
            _allMembers.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderMemberStats(_allMembers);
        renderMemberCards(_allMembers);
    } catch(err) {
        console.error("Error loading members:", err);
        document.getElementById('members-grid').innerHTML = `<div class="no-members-msg"><i class="fas fa-exclamation-circle"></i><span>Error loading members. Check console.</span></div>`;
    }
}

function renderMemberStats(members) {
    const local = members.filter(m => m.memberType && m.memberType.includes('Local'));
    const intl  = members.filter(m => m.memberType && m.memberType.includes('International'));
    const totalFund = members.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
    document.getElementById('stat-total').textContent  = members.length;
    document.getElementById('stat-local').textContent  = local.length;
    document.getElementById('stat-intl').textContent   = intl.length;
    document.getElementById('stat-fund-members').textContent = `$${totalFund.toFixed(0)}+`;
}

function renderMemberCards(members) {
    const grid = document.getElementById('members-grid');
    if (!members.length) {
        grid.innerHTML = `<div class="no-members-msg"><i class="fas fa-users-slash"></i><span>No members found.</span></div>`;
        return;
    }
    grid.innerHTML = members.map(m => {
        const date = m.createdAt ? m.createdAt.toDate().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : 'N/A';
        const photoEl = m.photoBase64
            ? `<div class="mac-photo"><img src="${m.photoBase64}" alt="${m.name}"></div>`
            : `<div class="mac-photo"><i class="fas fa-user"></i></div>`;
        const amtDisplay = m.currency === 'LKR' ? `LKR ${m.amount}` : `$${m.amount} USD`;
        return `
        <div class="member-admin-card" data-type="${m.memberType || ''}">
            <div class="mac-header">
                ${photoEl}
                <div class="mac-header-info">
                    <h4>${m.name || 'N/A'}</h4>
                    <span class="type-pill">${m.memberType || 'Member'}</span>
                </div>
            </div>
            <div class="mac-body">
                <div class="mac-row"><i class="fas fa-envelope"></i><span>${m.email || '—'}</span></div>
                <div class="mac-row"><i class="fab fa-whatsapp"></i><span>${m.whatsapp || '—'}</span></div>
                ${m.country  ? `<div class="mac-row"><i class="fas fa-globe"></i><span>${m.country}</span></div>` : ''}
                ${m.state    ? `<div class="mac-row"><i class="fas fa-map-marked-alt"></i><span>${m.state}</span></div>` : ''}
                ${m.district ? `<div class="mac-row"><i class="fas fa-map-marker-alt"></i><span>${m.district}</span></div>` : ''}
            </div>
            <div class="mac-footer">
                <span class="mac-fee">${amtDisplay}</span>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                    <span class="mac-date">${date}</span>
                    <button onclick="viewMemberDetail('${m.id}')" style="background:#5ca4cf;color:#fff;border:none;padding:4px 12px;border-radius:6px;font-size:0.8rem;cursor:pointer;"><i class="fas fa-eye"></i> View</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

window.filterMembers = (filter, el) => {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    if (filter === 'all') {
        renderMemberCards(_allMembers);
    } else {
        renderMemberCards(_allMembers.filter(m => (m.memberType || '').includes(filter)));
    }
};

window.viewMemberDetail = (id) => {
    const m = _allMembers.find(x => x.id === id);
    if (!m) return;
    const date = m.createdAt ? m.createdAt.toDate().toLocaleString() : 'N/A';
    const amtDisplay = m.currency === 'LKR' ? `LKR ${m.amount}` : `$${m.amount} USD`;
    const photoHTML = m.photoBase64
        ? `<div class="modal-photo"><img src="${m.photoBase64}" alt="${m.name}"></div>`
        : `<div class="modal-photo" style="font-size:3rem;color:#cbd5e1;"><i class="fas fa-user"></i></div>`;

    document.getElementById('modal-content').innerHTML = `
        <div class="modal-photo-wrap">${photoHTML}</div>
        <h2 style="text-align:center;margin-bottom:4px;">${m.name || 'N/A'}</h2>
        <p style="text-align:center;color:#5ca4cf;font-weight:700;margin-bottom:20px;">${m.memberType || 'Member'}</p>
        <div class="modal-detail-row"><i class="fas fa-envelope"></i><span class="modal-detail-label">Email</span><span class="modal-detail-val">${m.email || '—'}</span></div>
        <div class="modal-detail-row"><i class="fab fa-whatsapp"></i><span class="modal-detail-label">WhatsApp</span><span class="modal-detail-val">${m.whatsapp || '—'}</span></div>
        ${m.phone    ? `<div class="modal-detail-row"><i class="fas fa-phone"></i><span class="modal-detail-label">Phone</span><span class="modal-detail-val">${m.phone}</span></div>` : ''}
        ${m.country  ? `<div class="modal-detail-row"><i class="fas fa-globe"></i><span class="modal-detail-label">Country</span><span class="modal-detail-val">${m.country}</span></div>` : ''}
        ${m.state    ? `<div class="modal-detail-row"><i class="fas fa-map-marked-alt"></i><span class="modal-detail-label">State</span><span class="modal-detail-val">${m.state}</span></div>` : ''}
        ${m.district ? `<div class="modal-detail-row"><i class="fas fa-map-marker-alt"></i><span class="modal-detail-label">District</span><span class="modal-detail-val">${m.district}</span></div>` : ''}
        ${m.address  ? `<div class="modal-detail-row"><i class="fas fa-home"></i><span class="modal-detail-label">Address</span><span class="modal-detail-val">${m.address}</span></div>` : ''}
        <div class="modal-detail-row"><i class="fas fa-tag"></i><span class="modal-detail-label">Amount Paid</span><span class="modal-detail-val" style="color:#27ae60;">${amtDisplay}</span></div>
        <div class="modal-detail-row"><i class="fas fa-calendar"></i><span class="modal-detail-label">Registered</span><span class="modal-detail-val">${date}</span></div>
    `;
    document.getElementById('member-modal').classList.add('show');
};

window.closeMemberModal = () => {
    document.getElementById('member-modal').classList.remove('show');
};
document.getElementById('member-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('member-modal')) closeMemberModal();
});

// ── DONATIONS ──────────────────────────────────────────
let _donationData = {};

async function loadDonations() {
    const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const tbody = document.getElementById('donations-table-body');
    tbody.innerHTML = '';

    let total = 0, approved = 0, pending = 0;

    snap.forEach((docSnap) => {
        const data = docSnap.data(), id = docSnap.id;
        const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleString() : 'N/A';
        const isApproved = data.status === 'Approved';
        const amt = parseFloat(data.amount) || 0;
        total++;
        if (isApproved) approved++; else pending++;

        // Cache
        _donationData[id] = data;
        if (data.slipBase64) {
            window._donationSlips = window._donationSlips || {};
            window._donationSlips[id] = data.slipBase64;
        }

        const slipBtn = data.slipBase64
            ? `<button onclick="viewSlip('${id}')" style="background:#2ecc71;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;"><i class="fas fa-image"></i> View</button>`
            : '<span style="color:#999;font-style:italic;font-size:0.8rem;">No Slip</span>';

        const statusBadge = isApproved
            ? `<span style="padding:3px 10px;border-radius:12px;background:#d5f5e3;color:#27ae60;font-size:0.8rem;font-weight:700;">✓ Approved</span>`
            : `<span style="padding:3px 10px;border-radius:12px;background:#fef9c3;color:#b45309;font-size:0.8rem;font-weight:700;">Pending</span>`;

        const approveBtn = !isApproved
            ? `<button class="approve-btn" onclick="approveDonation('${id}')" id="approve-btn-${id}"><i class="fas fa-check"></i> Approve</button>`
            : `<span style="color:#27ae60;font-size:0.82rem;font-weight:700;">✓ Done</span>`;

        tbody.innerHTML += `<tr>
            <td>${dateStr}</td>
            <td><strong>${data.donorName || '—'}</strong><br><small style="color:#888;">${data.donorEmail || ''}</small></td>
            <td><strong>$${data.amount}</strong></td>
            <td>${data.method}</td>
            <td>${statusBadge}</td>
            <td>${slipBtn}</td>
            <td>${approveBtn}</td>
        </tr>`;
    });

    document.getElementById('stat-fund-total').textContent   = total;
    document.getElementById('stat-fund-approved').textContent = approved;
    document.getElementById('stat-fund-pending').textContent  = pending;
}

window.approveDonation = async (id) => {
    const btn = document.getElementById(`approve-btn-${id}`);
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        await updateDoc(doc(db, "donations", id), {
            status: 'Approved',
            approvedAt: Timestamp.now()
        });

        // Send email to donor if we have their details
        const data = _donationData[id];
        if (data && data.donorEmail) {
            const htmlBody = donationApprovedHTML(data.donorName || 'Valued Donor', data.amount);
            await sendEmail(data.donorEmail, '💚 Your Donation to Fly for Peace Has Been Confirmed', htmlBody);

            // Notify admin too
            const adminHtml = donationAdminNotifHTML(data.donorName || '—', data.donorEmail, data.amount);
            await sendEmail(ADMIN_EMAIL, `[Admin] Donation Approved — $${data.amount}`, adminHtml);
        }

        await loadDonations();
    } catch(err) {
        console.error("Approval error:", err);
        alert("Error approving donation. Check console.");
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Approve';
    }
};

window.viewSlip = (id) => {
    const base64 = window._donationSlips?.[id];
    if (base64) {
        const win = window.open();
        win.document.write(`<iframe src="${base64}" frameborder="0" style="border:0;top:0;left:0;bottom:0;right:0;width:100%;height:100%;" allowfullscreen></iframe>`);
        win.document.title = "Payment Slip Viewer";
    } else {
        alert("Slip data not found or expired.");
    }
};

// ── MESSAGES ───────────────────────────────────────────
async function loadMessages() {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const tbody = document.getElementById('messages-table-body');
    tbody.innerHTML = '';
    snap.forEach((docSnap) => {
        const data = docSnap.data();
        const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleString() : 'N/A';
        tbody.innerHTML += `<tr>
            <td>${dateStr}</td>
            <td><strong>${data.name}</strong></td>
            <td>${data.email}</td>
            <td>${data.message}</td>
        </tr>`;
    });
}

// -- PEACE REPRESENTATIVES ------------------------------

let _allCountries   = [];
let _allReps        = [];
let _repPhotoBase64 = '';

async function compressRepPhoto(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 600;
                let w = img.width, h = img.height;
                if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.75));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

document.getElementById('rep-photo').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    _repPhotoBase64 = await compressRepPhoto(file);
    document.getElementById('rep-photo-preview').innerHTML = `<img src="${_repPhotoBase64}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;object-position:center top;border:3px solid #e2e8f0;">`;
});

async function loadRepresentatives() {
    try {
        const cSnap = await getDocs(query(collection(db, 'peace_countries'), orderBy('name')));
        _allCountries = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const rSnap = await getDocs(query(collection(db, 'peace_representatives'), orderBy('name')));
        _allReps = rSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderCountryList();
        renderRepsByCountry();
    } catch(err) {
        console.error('Error loading representatives:', err);
    }
}

function renderCountryList() {
    const container = document.getElementById('country-list');
    if (!_allCountries.length) {
        container.innerHTML = '<p style="color:#aaa;font-size:0.85rem;">No countries added yet.</p>';
        return;
    }
    container.innerHTML = _allCountries.map(c => `
        <div style="display:flex;align-items:center;gap:8px;background:#f8fafc;border:1px solid var(--border);border-radius:10px;padding:8px 14px;flex-wrap:wrap;">
            <img src="../assets/${c.flagFilename}" alt="${c.name}" style="width:24px;border-radius:3px;" onerror="this.style.display='none'">
            <span style="font-weight:600;font-size:0.9rem;">${c.name}</span>
            <button onclick="editCountry('${c.id}')" style="background:none;border:none;color:#5ca4cf;cursor:pointer;padding:2px 4px;" title="Edit"><i class="fas fa-edit"></i></button>
            <button onclick="deleteCountry('${c.id}')" style="background:none;border:none;color:#e74c3c;cursor:pointer;padding:2px 4px;" title="Delete"><i class="fas fa-trash"></i></button>
            <button onclick="openRepForm('${c.id}')" style="background:var(--accent);color:#fff;border:none;border-radius:6px;padding:3px 10px;cursor:pointer;font-size:0.78rem;font-weight:600;"><i class="fas fa-user-plus"></i> Add Rep</button>
        </div>
    `).join('');
}

function renderRepsByCountry() {
    const container = document.getElementById('reps-by-country');
    if (!_allCountries.length) { container.innerHTML = ''; return; }
    container.innerHTML = _allCountries.map(country => {
        const reps = _allReps.filter(r => r.countryId === country.id);
        const repCards = reps.length === 0
            ? '<p style="color:#aaa;font-style:italic;font-size:0.88rem;">No representatives yet. Click "Add Rep" above to add one.</p>'
            : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;">${reps.map(rep => `
                <div style="border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'">
                    <div style="background:linear-gradient(135deg,#153c5e,#5ca4cf);padding:16px;text-align:center;">
                        ${rep.photoBase64 ? `<img src="${rep.photoBase64}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;object-position:center top;border:3px solid rgba(255,255,255,0.4);">` : '<div style="width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto;"><i class="fas fa-user" style="font-size:2rem;color:rgba(255,255,255,0.7);"></i></div>'}
                        <h4 style="color:#fff;margin:10px 0 4px;font-size:0.95rem;">${rep.name}</h4>
                        <span style="background:rgba(255,255,255,0.2);color:#fff;padding:2px 10px;border-radius:20px;font-size:0.72rem;font-weight:700;">${rep.designation}</span>
                    </div>
                    <div style="padding:12px 14px;font-size:0.82rem;color:#555;">
                        ${rep.state ? `<div style="margin-bottom:4px;"><i class="fas fa-map-marked-alt" style="color:#5ca4cf;width:14px;margin-right:6px;"></i>${rep.state}</div>` : ''}
                        ${rep.city  ? `<div style="margin-bottom:4px;"><i class="fas fa-city" style="color:#5ca4cf;width:14px;margin-right:6px;"></i>${rep.city}</div>` : ''}
                        ${rep.bio   ? `<div style="margin-top:6px;color:#888;font-style:italic;line-height:1.4;">"${rep.bio.substring(0,70)}${rep.bio.length > 70 ? '...' : ''}"</div>` : ''}
                    </div>
                    <div style="padding:10px 14px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">
                        <button onclick="editRep('${rep.id}')" style="background:#5ca4cf;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;"><i class="fas fa-edit"></i> Edit</button>
                        <button onclick="deleteRep('${rep.id}')" style="background:#e74c3c;color:#fff;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:0.8rem;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`).join('')}
            </div>`;
        return `
        <div style="background:#fff;border-radius:16px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.07);border:1px solid var(--border);margin-bottom:24px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <img src="../assets/${country.flagFilename}" alt="${country.name}" style="width:36px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.1);" onerror="this.style.display='none'">
                <h3 style="margin:0;font-size:1.25rem;color:#153c5e;">${country.name}</h3>
                <span style="background:#e8f4fd;color:#5ca4cf;border-radius:20px;padding:3px 12px;font-size:0.78rem;font-weight:700;">${reps.length} Rep${reps.length !== 1 ? 's' : ''}</span>
            </div>
            ${repCards}
        </div>`;
    }).join('');
}

document.getElementById('country-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn    = document.getElementById('country-submit-btn');
    const editId = document.getElementById('edit-country-id').value;
    const payload = {
        name:         document.getElementById('country-name').value.trim(),
        flagFilename: document.getElementById('country-flag-filename').value.trim()
    };
    btn.textContent = 'Saving...';
    try {
        if (editId) {
            await updateDoc(doc(db, 'peace_countries', editId), payload);
        } else {
            await addDoc(collection(db, 'peace_countries'), payload);
        }
        resetCountryForm();
        await loadRepresentatives();
    } catch(err) {
        console.error(err);
        alert('Error saving country. See console.');
    }
    btn.textContent = editId ? 'Update Country' : 'Add Country';
});

function resetCountryForm() {
    document.getElementById('country-form').reset();
    document.getElementById('edit-country-id').value = '';
    document.getElementById('country-submit-btn').textContent = 'Add Country';
    document.getElementById('country-cancel-btn').style.display = 'none';
}
document.getElementById('country-cancel-btn').addEventListener('click', resetCountryForm);

window.editCountry = (id) => {
    const c = _allCountries.find(x => x.id === id);
    if (!c) return;
    document.getElementById('edit-country-id').value      = id;
    document.getElementById('country-name').value          = c.name;
    document.getElementById('country-flag-filename').value = c.flagFilename;
    document.getElementById('country-submit-btn').textContent = 'Update Country';
    document.getElementById('country-cancel-btn').style.display = 'inline-block';
    document.getElementById('country-name').focus();
};

window.deleteCountry = async (id) => {
    const repsInCountry = _allReps.filter(r => r.countryId === id);
    const msg = repsInCountry.length
        ? `This country has ${repsInCountry.length} representative(s). Deleting it will also remove them. Continue?`
        : 'Delete this country?';
    if (!confirm(msg)) return;
    try {
        await Promise.all(repsInCountry.map(r => deleteDoc(doc(db, 'peace_representatives', r.id))));
        await deleteDoc(doc(db, 'peace_countries', id));
        await loadRepresentatives();
    } catch(err) {
        console.error(err);
        alert('Error deleting country.');
    }
};

window.openRepForm = (countryId) => {
    const formSection = document.getElementById('rep-form-section');
    document.getElementById('rep-form').reset();
    document.getElementById('rep-photo-preview').innerHTML = '';
    _repPhotoBase64 = '';
    document.getElementById('edit-rep-id').value    = '';
    document.getElementById('rep-country-id').value = countryId;
    document.getElementById('rep-form-title').textContent = 'Add New Representative';
    document.getElementById('rep-submit-btn').textContent  = 'Save Representative';
    document.getElementById('rep-success').style.display   = 'none';
    formSection.style.display = 'block';
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.editRep = (repId) => {
    const rep = _allReps.find(r => r.id === repId);
    if (!rep) return;
    const formSection = document.getElementById('rep-form-section');
    document.getElementById('rep-form').reset();
    document.getElementById('edit-rep-id').value    = repId;
    document.getElementById('rep-country-id').value = rep.countryId;
    document.getElementById('rep-name').value        = rep.name        || '';
    document.getElementById('rep-designation').value = rep.designation || '';
    document.getElementById('rep-state').value       = rep.state       || '';
    document.getElementById('rep-city').value        = rep.city        || '';
    document.getElementById('rep-bio').value         = rep.bio         || '';
    _repPhotoBase64 = rep.photoBase64 || '';
    document.getElementById('rep-photo-preview').innerHTML = rep.photoBase64
        ? `<img src="${rep.photoBase64}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #e2e8f0;">`
        : '';
    document.getElementById('rep-form-title').textContent = 'Edit Representative';
    document.getElementById('rep-submit-btn').textContent  = 'Update Representative';
    document.getElementById('rep-success').style.display   = 'none';
    formSection.style.display = 'block';
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

document.getElementById('rep-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn    = document.getElementById('rep-submit-btn');
    const editId = document.getElementById('edit-rep-id').value;
    btn.textContent = 'Saving...';
    const payload = {
        countryId:   document.getElementById('rep-country-id').value,
        name:        document.getElementById('rep-name').value.trim(),
        designation: document.getElementById('rep-designation').value.trim(),
        state:       document.getElementById('rep-state').value.trim(),
        city:        document.getElementById('rep-city').value.trim(),
        bio:         document.getElementById('rep-bio').value.trim(),
    };
    if (_repPhotoBase64) payload.photoBase64 = _repPhotoBase64;
    try {
        if (editId) {
            await updateDoc(doc(db, 'peace_representatives', editId), payload);
        } else {
            payload.createdAt = Timestamp.now();
            await addDoc(collection(db, 'peace_representatives'), payload);
        }
        document.getElementById('rep-success').style.display = 'block';
        setTimeout(() => { document.getElementById('rep-success').style.display = 'none'; }, 3000);
        resetRepForm();
        await loadRepresentatives();
    } catch(err) {
        console.error(err);
        alert('Error saving representative. See console.');
    }
    btn.textContent = 'Save Representative';
});

function resetRepForm() {
    document.getElementById('rep-form').reset();
    document.getElementById('edit-rep-id').value    = '';
    document.getElementById('rep-country-id').value = '';
    document.getElementById('rep-photo-preview').innerHTML = '';
    _repPhotoBase64 = '';
    document.getElementById('rep-form-section').style.display = 'none';
    document.getElementById('rep-form-title').textContent = 'Add New Representative';
    document.getElementById('rep-submit-btn').textContent  = 'Save Representative';
}
document.getElementById('rep-cancel-btn').addEventListener('click', resetRepForm);

window.deleteRep = async (repId) => {
    if (!confirm('Delete this representative?')) return;
    try {
        await deleteDoc(doc(db, 'peace_representatives', repId));
        await loadRepresentatives();
    } catch(err) {
        console.error(err);
        alert('Error deleting representative.');
    }
};
