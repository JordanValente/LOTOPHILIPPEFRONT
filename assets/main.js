const API_BASE = "https://loto-backend-k9kh.onrender.com/api";

async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`);
  return res.json();
}

function renderEvents(events) {
  const list = document.getElementById('events-list');
  const select = document.getElementById('event-select');
  list.innerHTML = '';
  select.innerHTML = '';

  events.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'event-card';
    div.innerHTML = `
      <h3>${ev.title}</h3>
      <p><strong>Date :</strong> ${new Date(ev.date).toLocaleString('fr-FR')}</p>
      <p><strong>Lieu :</strong> ${ev.location}</p>
      <p>${ev.description || ''}</p>
      <p><strong>Prix du carton :</strong> ${ev.ticket_price} €</p>
    `;
    list.appendChild(div);

    const option = document.createElement('option');
    option.value = ev.id;
    option.textContent = `${ev.title} - ${new Date(ev.date).toLocaleDateString('fr-FR')}`;
    select.appendChild(option);
  });
}

async function init() {
  const events = await fetchEvents();
  renderEvents(events);

  const form = document.getElementById('reservation-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.quantity = Number(data.quantity);

    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const msgDiv = document.getElementById('reservation-message');
    if (!res.ok) {
      const err = await res.json();
      msgDiv.textContent = `Erreur : ${err.error || 'Impossible d\'enregistrer la réservation'}`;
      msgDiv.className = 'error';
      return;
    }

    msgDiv.textContent = 'Votre réservation a bien été enregistrée. Vous serez contacté pour confirmation.';
    msgDiv.className = 'success';
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', init);
