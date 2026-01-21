const API_BASE = "https://loto-backend-k9kh.onrender.com/api";

// Récupération du token
const token = localStorage.getItem("token");

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

  if (data.token) {
    localStorage.setItem("token", data.token);
    location.reload();
  } else {
    alert("Identifiants incorrects");
  }
});

// =========================
// FETCH EVENTS (SECURISE)
// =========================
async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
}

// =========================
// FETCH RESERVATIONS (SECURISE)
// =========================
async function fetchReservations() {
  const res = await fetch(`${API_BASE}/reservations`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
}

// =========================
// CREATE EVENT (SECURISE)
// =========================
async function createEvent(data) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur création événement');
  return res.json();
}

// =========================
// UPDATE RESERVATION STATUS (SECURISE)
// =========================
async function updateReservationStatus(id, status) {
  const res = await fetch(`${API_BASE}/reservations/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Erreur mise à jour statut');
  return res.json();
}

// =========================
// RENDER EVENTS
// =========================
function renderEvents(events) {
  const container = document.getElementById('admin-events');
  container.innerHTML = '';
  events.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'event-card';
    div.innerHTML = `
      <h3>${ev.title}</h3>
      <p>${new Date(ev.date).toLocaleString('fr-FR')} - ${ev.location}</p>
      <p>${ev.description || ''}</p>
      <p>Prix: ${ev.ticket_price} € - Places max: ${ev.max_places}</p>
    `;
    container.appendChild(div);
  });
}

// =========================
// RENDER RESERVATIONS
// =========================
function renderReservations(reservations) {
  const container = document.getElementById('admin-reservations');
  container.innerHTML = '';
  reservations.forEach(r => {
    const div = document.createElement('div');
    div.className = 'event-card';
    div.innerHTML = `
      <p><strong>${r.name}</strong> - ${r.quantity} cartons</p>
      <p>Événement #${r.event_id} | Statut : <strong>${r.status}</strong></p>
      <p>${r.phone || ''} - ${r.email || ''}</p>
      <button data-id="${r.id}" data-status="confirmed">Confirmer</button>
      <button data-id="${r.id}" data-status="paid">Marquer payé</button>
      <button data-id="${r.id}" data-status="cancelled">Annuler</button>
    `;
    container.appendChild(div);
  });

  container.addEventListener('click', async (e) => {
    if (e.target.tagName === 'BUTTON') {
      const id = e.target.getAttribute('data-id');
      const status = e.target.getAttribute('data-status');
      await updateReservationStatus(id, status);
      const reservations = await fetchReservations();
      renderReservations(reservations);
    }
  }, { once: true });
}

// =========================
// INITIALISATION ADMIN
// =========================
async function initAdmin() {

  // Si pas de token → on bloque l'accès
  if (!token) {
    document.querySelector("main").innerHTML = `
      <p style="color:red; text-align:center; font-size:1.2rem;">
        Vous devez être connecté pour accéder à l'administration.
      </p>
    `;
    return;
  }

  const form = document.getElementById('event-form');
  form.addEventListener('submit', async (e) => {
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

document.addEventListener('DOMContentLoaded', initAdmin);
