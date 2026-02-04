import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app);
const donorCollection = collection(db, 'donors');

// 1. Add Donor - ആഡ് ചെയ്യുന്ന യൂണിറ്റിന്റെ ID കൂടി ഉൾപ്പെടുത്തിയിട്ടുണ്ട്
const form = document.getElementById('donorForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const sessionUserId = sessionStorage.getItem("userId");
        
        if (!sessionUserId) {
            alert("ദയവായി ലോഗിൻ ചെയ്യുക!");
            window.location.href = "login.html";
            return;
        }

        try {
            await addDoc(donorCollection, {
                name: document.getElementById('name').value,
                age: document.getElementById('age').value,
                bloodGroup: document.getElementById('bloodGroup').value,
                circle: document.getElementById('circle').value,
                unit: document.getElementById('unit').value,
                phone: document.getElementById('phone').value,
                lastDonation: document.getElementById('lastDonation').value,
                addedBy: sessionUserId, // ഈ യൂണിറ്റിനെ അടയാളപ്പെടുത്തുന്നു
                createdAt: serverTimestamp()
            });
            alert("വിജയകരമായി ചേർത്തു!");
            form.reset();
        } catch (error) {
            console.error("Error:", error);
            alert("സേവ് ചെയ്യാൻ സാധിച്ചില്ല.");
        }
    });
}

// 2. Show List - സ്വന്തം ഡാറ്റയ്ക്ക് മാത്രം ബട്ടണുകൾ കാണിക്കുന്നു
const donorList = document.getElementById('donorList');
if (donorList) {
    onSnapshot(donorCollection, (snapshot) => {
        const currentUserId = sessionStorage.getItem("userId"); // ലോഗിൻ ചെയ്തയാളുടെ ID
        donorList.innerHTML = '';
        
        snapshot.docs.forEach(docSnap => {
            const d = docSnap.data();
            const isOwner = d.addedBy === currentUserId; // ഈ യൂണിറ്റാണോ ആഡ് ചെയ്തതെന്ന് നോക്കുന്നു
            const cleanPhone = d.phone ? d.phone.toString().replace(/\D/g, '') : '';
            
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${d.name} (${d.bloodGroup})</strong>
                <p>📍 ${d.circle} | 🩸 ${d.unit} | 🎂 ${d.age} | 📅 ${d.lastDonation || 'N/A'}</p>
                <div class="actions">
                    <button class="call-btn" onclick="makeCall('${cleanPhone}')">📞 Call</button>
                    
                    ${isOwner ? `
                        <button class="edit-btn" onclick="openEdit('${docSnap.id}','${d.name}','${d.age}','${d.phone}','${d.circle}','${d.unit}','${d.lastDonation}')">Edit</button>
                        <button class="delete-btn" onclick="deleteDonor('${docSnap.id}')">Delete</button>
                    ` : ''} 
                </div>
            `;
            donorList.appendChild(li);
        });
    });
}

// 3. Window Functions
window.makeCall = (phone) => { if(phone) window.location.href = "tel:" + phone; };

window.deleteDonor = async (id) => { 
    if(confirm("ഒഴിവാക്കണോ?")) {
        try {
            await deleteDoc(doc(db, 'donors', id)); 
            alert("ഒഴിവാക്കി!");
        } catch (e) {
            alert("നിങ്ങൾക്ക് ഇതിന് അനുവാദമില്ല.");
        }
    }
};

let editId = null;
window.openEdit = (id, n, a, p, c, u, d) => {
    editId = id;
    document.getElementById('editName').value = n;
    document.getElementById('editAge').value = a;
    document.getElementById('editPhone').value = p;
    document.getElementById('editCircle').value = c;
    document.getElementById('editUnit').value = u;
    document.getElementById('editDate').value = d;
    document.getElementById('editModal').style.display = 'flex';
};

window.saveEdit = async () => {
    try {
        await updateDoc(doc(db, 'donors', editId), {
            name: document.getElementById('editName').value,
            age: document.getElementById('editAge').value,
            phone: document.getElementById('editPhone').value,
            circle: document.getElementById('editCircle').value,
            unit: document.getElementById('editUnit').value,
            lastDonation: document.getElementById('editDate').value
        });
        document.getElementById('editModal').style.display = 'none';
        alert("മാറ്റങ്ങൾ സേവ് ചെയ്തു!");
    } catch (e) {
        alert("നിങ്ങൾക്ക് ഇതിന് അനുവാദമില്ല.");
    }
};

window.closeModal = () => document.getElementById('editModal').style.display = 'none';

window.filterDonors = () => {
    let q = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('#donorList li').forEach(li => {
        li.style.display = li.innerText.toLowerCase().includes(q) ? 'block' : 'none';
    });
};

window.openNav = () => document.getElementById("mySidebar").style.width = "250px";
window.closeNav = () => document.getElementById("mySidebar").style.width = "0";
window.openInfoModal = () => { document.getElementById("infoModal").style.display = "flex"; window.closeNav(); };
window.closeInfoModal = () => document.getElementById("infoModal").style.display = "none";

window.logout = () => {
    if(confirm("Logout ചെയ്യണോ?")) {
        sessionStorage.clear();
        window.location.replace("login.html");
    }
};

window.onclick = (event) => {
    const infoModal = document.getElementById("infoModal");
    if (event.target == infoModal) infoModal.style.display = "none";
};
