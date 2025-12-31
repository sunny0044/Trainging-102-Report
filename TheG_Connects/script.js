// ===== Login =====
const loginPage = document.getElementById('loginPage');
const mainPage = document.getElementById('mainPage');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

const validUser = { username: 'admin', password: '1234' };

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if(u === validUser.username && p === validUser.password){
    loginPage.classList.remove('active');
    mainPage.classList.add('active');
  } else {
    alert('Invalid username or password!');
  }
});

logoutBtn.addEventListener('click', ()=>{
  mainPage.classList.remove('active');
  loginPage.classList.add('active');
});

// ===== JSONBin Setup =====
const BIN_ID = "68eb9707ae596e708f0fa600";
const API_KEY = "$2a$10$21GdhAHpV4hScDTNLvDqhuYgsK8l/HB2ByFWmmIyys1yTzewUmBEm";
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ===== Add Business Profile =====
document.getElementById('businessForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const newProfile = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    contact: document.getElementById('contact').value,
    instagram: document.getElementById('instagram').value,
    about: document.getElementById('about').value
  };

  try{
    const res = await fetch(BASE_URL, { headers:{ "X-Master-Key": API_KEY } });
    const data = await res.json();
    const profiles = data.record || [];
    profiles.push(newProfile);
    await fetch(BASE_URL, {
      method: "PUT",
      headers:{ "Content-Type":"application/json", "X-Master-Key": API_KEY },
      body: JSON.stringify(profiles)
    });
    displayProfiles();
    document.getElementById('businessForm').reset();
  }catch(err){ console.error(err); alert('Check API Key or BIN ID'); }
});

// ===== Display Profiles =====
async function displayProfiles(){
  try{
    const res = await fetch(BASE_URL, { headers:{ "X-Master-Key": API_KEY } });
    const data = await res.json();
    const profiles = data.record || [];
    const container = document.getElementById('profilesContainer');
    container.innerHTML = '';

    if(profiles.length === 0){
      document.getElementById('emptyState').style.display='block';
      return;
    } else {
      document.getElementById('emptyState').style.display='none';
    }

    profiles.forEach(p=>{
      const template = document.getElementById('profile-template').content.cloneNode(true);
      template.querySelector('.card-name').textContent = p.name;
      template.querySelector('.card-about').textContent = p.about;
      template.querySelector('.card-email').textContent = p.email;
      template.querySelector('.card-email').href = `mailto:${p.email}`;
      template.querySelector('.card-contact').textContent = p.contact;
      template.querySelector('.card-contact').href = `tel:${p.contact}`;
      template.querySelector('.card-instagram').textContent = p.instagram;
      template.querySelector('.card-instagram').href = `https://instagram.com/${p.instagram}`;

      // Promote click simulation
      template.querySelector('.promoteBtn').addEventListener('click', ()=>{
        let views = parseInt(template.querySelector('.stat-views').textContent);
        views+= Math.floor(Math.random()*50)+10; // simulate Meta AI reach
        template.querySelector('.stat-views').textContent = views;
        alert(`Meta AI Promotion ran! Estimated new reach: ${views}`);
      });

      // Collaborate button
      template.querySelector('.collaborateBtn').addEventListener('click', ()=>{
        alert(`Collaboration request sent to ${p.name}!`);
      });

      container.appendChild(template);
    });
  }catch(err){ console.error(err); }
}

displayProfiles();

// ===== Search =====
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', e=>{
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.profile-card').forEach(card=>{
    const name = card.querySelector('.card-name').textContent.toLowerCase();
    const about = card.querySelector('.card-about').textContent.toLowerCase();
    card.style.display = (name.includes(q) || about.includes(q)) ? '' : 'none';
  });
});
