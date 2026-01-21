const API_BASE = 'http://localhost:3000/api';

async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`);
  return res.json();
}

async function fetchReservations() {
  const res = await fetch(`${API_BASE}/reservations`);
  return res.json();
}

async function createEvent(data) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur création événement');
  return res.json();
}

async function updateReservationStatus(id, status) {
  const res = await fetch(`${API_BASE}/reservations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Erreur mise à jour statut');
  return res.json();
}

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

async function initAdmin() {
  const form = document.getElementById('event-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.ticket_price = Number(data.ticket_price);
    data.max_places = Number(data.max_places);
    // datetime-local -> ISO
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
