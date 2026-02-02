import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDJVo2JzF9fko23PujwJfN0B2wBYME7QFY",
    authDomain: "blood-7c771.firebaseapp.com",
    projectId: "blood-7c771",
    storageBucket: "blood-7c771.firebasestorage.app",
    messagingSenderId: "812673918946",
    appId: "1:812673918946:web:0a036596ed17335be93bbb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const donorCollection = collection(db, 'donors');

// Add Donor
const form = document.getElementById('donorForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addDoc(donorCollection, {
            name: document.getElementById('name').value,
            age: document.getElementById('age').value,
            bloodGroup: document.getElementById('bloodGroup').value,
            circle: document.getElementById('circle').value,
            phone: document.getElementById('phone').value,
            lastDonation: document.getElementById('lastDonation').value
        });
        alert("വിജയകരമായി ചേർത്തു!");
        form.reset();
    });
}

// Show List
const donorList = document.getElementById('donorList');
if (donorList) {
    onSnapshot(donorCollection, (snapshot) => {
        donorList.innerHTML = '';
        snapshot.docs.forEach(docSnap => {
            const d = docSnap.data();
            const cleanPhone = d.phone.toString().replace(/\D/g, '');
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${d.name} (${d.bloodGroup})</strong>
                <p>📍 ${d.circle} | 🎂 ${d.age} | 📅 ${d.lastDonation || 'N/A'}</p>
                <div class="actions">
                    <button class="call-btn" onclick="makeCall('${cleanPhone}')">📞 Call</button>
                    <button class="edit-btn" onclick="openEdit('${docSnap.id}','${d.name}','${d.age}','${d.phone}','${d.circle}','${d.lastDonation}')">Edit</button>
                    <button class="delete-btn" onclick="deleteDonor('${docSnap.id}')">Delete</button>
                </div>
            `;
            donorList.appendChild(li);
        });
    });
}

window.makeCall = (phone) => { window.location.href = "tel:" + phone; };

window.deleteDonor = async (id) => { if(confirm("ഒഴിവാക്കണോ?")) await deleteDoc(doc(db, 'donors', id)); };

let editId = null;
window.openEdit = (id, n, a, p, c, d) => {
    editId = id;
    document.getElementById('editName').value = n;
    document.getElementById('editAge').value = a;
    document.getElementById('editPhone').value = p;
    document.getElementById('editCircle').value = c;
    document.getElementById('editDate').value = d;
    document.getElementById('editModal').style.display = 'flex';
};

window.saveEdit = async () => {
    await updateDoc(doc(db, 'donors', editId), {
        name: document.getElementById('editName').value,
        age: document.getElementById('editAge').value,
        phone: document.getElementById('editPhone').value,
        circle: document.getElementById('editCircle').value,
        lastDonation: document.getElementById('editDate').value
    });
    document.getElementById('editModal').style.display = 'none';
};

window.closeModal = () => document.getElementById('editModal').style.display = 'none';

window.filterDonors = () => {
    let q = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('#donorList li').forEach(li => {
        li.style.display = li.innerText.toLowerCase().includes(q) ? 'block' : 'none';
    });
};



