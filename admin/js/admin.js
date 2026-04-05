import { auth, db, collection, addDoc, getDocs, orderBy, query, onAuthStateChanged, signOut, Timestamp, doc, updateDoc, deleteDoc } from '../../js/firebase-config.js';

// Auth Guard
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        document.getElementById('auth-guard').style.display = 'flex';
        loadNews();
        loadDonations();
        loadMessages();
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'login.html';
    });
});

// Tab Navigation
const navLinks = document.querySelectorAll('.nav-link[data-target]');
const sections = document.querySelectorAll('.content-section');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        link.classList.add('active');
        document.getElementById(link.dataset.target).classList.add('active');
        document.getElementById('page-title').innerText = link.innerText;
    });
});

// Submit News
document.getElementById('news-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('post-news-btn');
    const editId = document.getElementById('edit-news-id').value;
    
    btn.innerText = "Applying...";
    
    try {
        const fileInput = document.getElementById('news-image');
        let imageBase64 = null;
        
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            imageBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 600;
                        let width = img.width;
                        let height = img.height;
                        
                        if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Automatically slice size dynamically
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            });
        }
        
        const payload = {
            title: document.getElementById('news-title').value,
            dateLabel: document.getElementById('news-date').value,
            content: document.getElementById('news-desc').value,
        };
        if (imageBase64) payload.imageBase64 = imageBase64; // only overwrite image if new provided

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
        loadNews(); // Refresh table
    } catch(err) {
        console.error(err);
        btn.innerText = "Error: See Console";
    }
});

function cancelEdit() {
    document.getElementById('news-form').reset();
    document.getElementById('edit-news-id').value = '';
    document.getElementById('form-header-title').innerText = "Post New Announcement";
    document.getElementById('post-news-btn').innerText = "Publish News";
    document.getElementById('cancel-edit-btn').style.display = 'none';
}
document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);

// Global Handlers
window.editNews = (id, title, dateLabel, content) => {
    document.getElementById('edit-news-id').value = id;
    document.getElementById('news-title').value = title;
    document.getElementById('news-date').value = dateLabel;
    document.getElementById('news-desc').value = content;
    
    document.getElementById('form-header-title').innerText = "Edit Announcement";
    document.getElementById('post-news-btn').innerText = "Update News";
    document.getElementById('cancel-edit-btn').style.display = 'block';
    document.getElementById('news-image').required = false; // image optional during edit
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteNews = async (id) => {
    if(confirm('Are you certain you want to delete this news post?')) {
        await deleteDoc(doc(db, "news", id));
        loadNews();
    }
};

// Load News
async function loadNews() {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const tbody = document.getElementById('news-table-body');
    tbody.innerHTML = '';
    querySnapshot.forEach((documentObj) => {
        const data = documentObj.data();
        const id = documentObj.id;
        
        // Escape content safely for onclick insertion and handle old missing data
        const safeTitle = (data.title || '').replace(/'/g, "\\'");
        const safeDate = (data.dateLabel || '').replace(/'/g, "\\'");
        const safeContent = (data.content || '').replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "");
        
        tbody.innerHTML += `<tr>
            <td>${data.dateLabel}</td>
            <td><strong>${data.title}</strong></td>
            <td>${data.content.substring(0, 50)}...</td>
            <td>
                <button onclick="editNews('${id}', '${safeTitle}', '${safeDate}', '${safeContent}')" style="background:#5ca4cf;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;margin-right:5px;"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="deleteNews('${id}')" style="background:#e74c3c;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
}

// Load Donations
async function loadDonations() {
    const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const tbody = document.getElementById('donations-table-body');
    tbody.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleString() : 'N/A';
        tbody.innerHTML += `<tr>
            <td>${dateStr}</td>
            <td>Anonymous</td>
            <td><strong>$${data.amount}</strong></td>
            <td>${data.method}</td>
        </tr>`;
    });
}

// Load Messages
async function loadMessages() {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const tbody = document.getElementById('messages-table-body');
    tbody.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleString() : 'N/A';
        tbody.innerHTML += `<tr>
            <td>${dateStr}</td>
            <td><strong>${data.name}</strong></td>
            <td>${data.email}</td>
            <td>${data.message.substring(0, 80)}...</td>
        </tr>`;
    });
}
