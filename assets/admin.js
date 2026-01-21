const API_BASE = "https://loto-backend-k9kh.onrender.com/api";
let token = localStorage.getItem("token");
let role = localStorage.getItem("role");

// =========================
// LOGIN ADMIN
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

  if (!res.ok) {
    alert(data.error || "Identifiants incorrects");
    return;
  }

  // 🔥 Vérification du rôle admin
  if (data.role !== "admin") {
    alert("Ce compte n'est pas administrateur.");
    return;
  }

  // 🔥 On stocke le rôle
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);

  location.reload();
});

// =========================
// FETCH EVENTS (ADMIN)
// =========================
async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
}

// =========================
// FETCH RESERVATIONS (ADMIN)
// =========================
async function fetchReservations() {
  const res = await fetch(`${API_BASE}/reservations`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
}

// =========================
// CREATE EVENT
// =========================
async function createEvent(data) {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Erreur création événement");
  return res.json();
}

// =========================
// UPDATE RESERVATION STATUS
// =========================
async function updateReservationStatus(id, status) {
  const res = await fetch(`${API_BASE}/reservations/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Erreur mise à jour statut");
  return res.json();
}

// =========================
// RENDER EVENTS
// =========================
function renderEvents(events) {
  const container = document.getElementById("admin-events");
  container.innerHTML = "";
  events.forEach(ev => {
    const div = document.createElement("div");
    div.className = "event-card";
    div.innerHTML = `
      <h3>${ev.title}</h3>
      <p>${new Date(ev.date).toLocaleString("fr-FR")} - ${ev.location}</p>
      <p>${ev.description || ""}</p>
      <p>Prix: ${ev.ticket_price} € - Places max: ${ev.max_places}</p>
    `;
    container.appendChild(div);
  });
}

// =========================
// RENDER RESERVATIONS
// =========================
function renderReservations(reservations) {
  const container = document.getElementById("admin-reservations");
  container.innerHTML = "";
  reservations.forEach(r => {
    const div = document.createElement("div");
    div.className = "event-card";
    div.innerHTML = `
      <p><strong>${r.name || r.username || "Utilisateur"}</strong> - ${r.quantity} cartons</p>
      <p>Événement #${r.event_id} | Statut : <strong>${r.status}</strong></p>
      <p>
        ${r.user_email || r.email ? `Email : ${r.user_email || r.email}<br>` : ""}
        ${r.user_phone || r.phone ? `Téléphone : ${r.user_phone || r.phone}` : ""}
      </p>
      <button data-id="${r.id}" data-status="confirmed">Confirmer</button>
      <button data-id="${r.id}" data-status="paid">Marquer payé</button>
      <button data-id="${r.id}" data-status="cancelled">Annuler</button>
    `;
    container.appendChild(div);
  });

  container.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
      const id = e.target.getAttribute("data-id");
      const status = e.target.getAttribute("data-status");
      await updateReservationStatus(id, status);
      const reservations = await fetchReservations();
      renderReservations(reservations);
    }
  }, { once: true });
}

// =========================
// INIT ADMIN
// =========================
async function initAdmin() {
  token = localStorage.getItem("token");
  role = localStorage.getItem("role");

  // 🔥 Vérification stricte du rôle admin
  if (!token || role !== "admin") {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("admin-panel").style.display = "none";
    return;
  }

  document.getElementById("login-section").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";

  const form = document.getElementById("event-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.ticket_price = Number(data.ticket_price);
    data.max_places = Number(data.max_places);
    data.date = new Date(data.date).toISOString();

    await createEvent(data);
    form.reset();
    const events = await fetchEvents();
    renderEvents(events);
  });

  const events = await fetchEvents();
  renderEvents(events);

  const reservations = await fetchReservations();
  renderReservations(reservations);
}

document.addEventListener("DOMContentLoaded", initAdmin);
