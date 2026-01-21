const API_BASE = "https://loto-backend-k9kh.onrender.com/api";
let token = localStorage.getItem("token");

// =========================
// UI helpers
// =========================
function showLogin() {
  document.getElementById("login-section").style.display = "block";
  document.getElementById("register-section").style.display = "none";
}

function showRegister() {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("register-section").style.display = "block";
}

// =========================
// SWITCH LOGIN / REGISTER
// =========================
document.getElementById("show-register-btn").addEventListener("click", showRegister);
document.getElementById("show-login-btn").addEventListener("click", showLogin);

// =========================
// LOGIN
// =========================
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (res.ok && data.token) {
    localStorage.setItem("token", data.token);
    location.reload();
  } else {
    alert(data.error || "Identifiants incorrects");
  }
});

// =========================
// REGISTER
// =========================
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(e.target).entries());

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
  });

  const data = await res.json();

  if (res.ok) {
    alert("Compte créé ! Vous pouvez vous connecter.");
    showLogin();
  } else {
    alert(data.error || "Erreur lors de l'inscription.");
  }
});

// =========================
// FETCH EVENTS PUBLIC
// =========================
async function fetchEventsPublic() {
  const res = await fetch(`${API_BASE}/events-public`);
  return res.json();
}

// =========================
// RENDER EVENTS
// =========================
async function loadEvents() {
  const events = await fetchEventsPublic();
  const container = document.getElementById("events");
  container.innerHTML = "";

  events.forEach(ev => {
    const div = document.createElement("div");
    div.className = "event-card";
    div.innerHTML = `
      <h3>${ev.title}</h3>
      <p>${new Date(ev.date).toLocaleString("fr-FR")} - ${ev.location}</p>
      <p>${ev.description || ""}</p>
      <p>Prix : ${ev.ticket_price} €</p>
      ${
      token
        ? `
        <label>Nombre de cartons :
          <input type="number" id="qty-${ev.id}" min="1" value="1">
        </label>
        <button onclick="reserve(${ev.id}, document.getElementById('qty-${ev.id}').value)">
          Réserver
        </button>
        `
        : `<p style="font-size:0.9rem;color:#555;">Connectez-vous pour réserver.</p>`
    }
    `;
    container.appendChild(div);
  });
}

// =========================
// RESERVE (USER CONNECTÉ)
// =========================
async function reserve(eventId, quantity) {
  if (!token) {
    alert("Vous devez être connecté pour réserver.");
    return;
  }

  const res = await fetch(`${API_BASE}/user/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ event_id: eventId, quantity: Number(quantity) })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Réservation effectuée !");
    await loadUserReservations();
  } else {
    alert(data.error || "Erreur lors de la réservation.");
  }
}

// =========================
// LOAD USER RESERVATIONS
// =========================
async function loadUserReservations() {
  if (!token) return;

  const res = await fetch(`${API_BASE}/user/reservations`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const reservations = await res.json();
  const container = document.getElementById("user-reservations");
  container.innerHTML = "";

  if (reservations.length === 0) {
    container.innerHTML = "<p>Aucune réservation pour le moment.</p>";
    return;
  }

  reservations.forEach(r => {
    const div = document.createElement("div");
    div.className = "event-card";
    div.innerHTML = `
      <p><strong>Événement #${r.event_id}</strong></p>
      <p>Quantité : ${r.quantity}</p>
      <p>Statut : ${r.status}</p>
    `;
    container.appendChild(div);
  });
}

// =========================
// LOGOUT
// =========================
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("token");
  location.reload();
});

// =========================
// INIT
// =========================
async function init() {
  await loadEvents();

  if (!token) {
    // Non connecté : on montre login/register, on cache "Mes réservations"
    document.getElementById("login-section").style.display = "block";
    document.getElementById("register-section").style.display = "none";
    document.getElementById("my-reservations").style.display = "none";
    return;
  }

  // Connecté
  document.getElementById("logout-btn").style.display = "inline-block";
  document.getElementById("login-section").style.display = "none";
  document.getElementById("register-section").style.display = "none";
  document.getElementById("my-reservations").style.display = "block";

  await loadUserReservations();
}

init();

// Pour que reserve() soit accessible depuis le HTML
window.reserve = reserve;
