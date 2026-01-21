const API_BASE = "https://loto-backend-k9kh.onrender.com/api";
let token = localStorage.getItem("token");

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

  if (data.token) {
    localStorage.setItem("token", data.token);
    location.reload();
  } else {
    alert("Identifiants incorrects");
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

  if (res.ok) {
    alert("Compte créé ! Vous pouvez vous connecter.");
  } else {
    alert("Erreur lors de l'inscription.");
  }
});

// =========================
// FETCH EVENTS
// =========================
async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events-public`);
  return res.json();
}

// =========================
// USER RESERVATION
// =========================
async function reserve(eventId, quantity) {
  const res = await fetch(`${API_BASE}/user/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ event_id: eventId, quantity })
  });

  if (res.ok) {
    alert("Réservation effectuée !");
    loadUserReservations();
  } else {
    alert("Erreur lors de la réservation.");
  }
}

// =========================
// LOAD USER RESERVATIONS
// =========================
async function loadUserReservations() {
  const res = await fetch(`${API_BASE}/user/reservations`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const reservations = await res.json();
  const container = document.getElementById("user-reservations");
  container.innerHTML = "";

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
// DISPLAY EVENTS
// =========================
async function loadEvents() {
  const events = await fetchEvents();
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

      <label>Nombre de cartons :
        <input type="number" id="qty-${ev.id}" min="1" value="1">
      </label>
      <button onclick="reserve(${ev.id}, document.getElementById('qty-${ev.id}').value)">
        Réserver
      </button>
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
  if (!token) {
    document.getElementById("login-section").style.display = "block";
    return;
  }

  document.getElementById("logout-btn").style.display = "inline-block";
  document.getElementById("login-section").style.display = "none";
  document.getElementById("events-section").style.display = "block";
  document.getElementById("my-reservations").style.display = "block";

  await loadEvents();
  await loadUserReservations();
}

init();
