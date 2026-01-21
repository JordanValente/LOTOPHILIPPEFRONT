// =========================
// INITIALISATION ADMIN
// =========================
async function initAdmin() {

  // Si pas de token → on montre le login
  if (!token) {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("admin-panel").style.display = "none";
    return;
  }

  // Si token → on montre l'admin
  document.getElementById("login-section").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";

  // Gestion création d'événement
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

  // Chargement initial
  const events = await fetchEvents();
  renderEvents(events);

  const reservations = await fetchReservations();
  renderReservations(reservations);
}

document.addEventListener('DOMContentLoaded', initAdmin);
