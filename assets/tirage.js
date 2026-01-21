let remainingNumbers = [];
let drawnNumbers = [];
let maxNumber = 90; // valeur par défaut

function initNumbers() {
  remainingNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
  drawnNumbers = [];
  updateHistory();
  document.getElementById("roulette").textContent = "--";
}

function drawNumber() {
  if (remainingNumbers.length === 0) {
    alert("Tous les numéros ont été tirés !");
    return;
  }

  const roulette = document.getElementById("roulette");
  let count = 0;

  const interval = setInterval(() => {
    const random = Math.floor(Math.random() * maxNumber) + 1;
    roulette.textContent = random;
    count++;

    if (count > 20) {
      clearInterval(interval);

      const index = Math.floor(Math.random() * remainingNumbers.length);
      const number = remainingNumbers.splice(index, 1)[0];
      drawnNumbers.push(number);

      roulette.textContent = number;
      updateHistory();
    }
  }, 50);
}

function updateHistory() {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";

  drawnNumbers.forEach(num => {
    const span = document.createElement("span");
    span.textContent = num;
    historyDiv.appendChild(span);
  });
}

function setVariant(max) {
  if (max === "custom") {
    document.getElementById("custom-range-container").style.display = "block";
    maxNumber = Number(document.getElementById("custom-range").value);
  }
  else if (max === "normal") {
    document.getElementById("custom-range-container").style.display = "none";
    maxNumber = 90; // valeur par défaut
  }
  else {
    document.getElementById("custom-range-container").style.display = "none";
    maxNumber = Number(max);
  }

  initNumbers();
}


document.addEventListener("DOMContentLoaded", () => {
  initNumbers();

  document.getElementById("draw-btn").addEventListener("click", drawNumber);
  document.getElementById("reset-btn").addEventListener("click", initNumbers);

  // Gestion des variantes
  document.querySelectorAll(".variant-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setVariant(btn.dataset.max);
    });
  });

  // Curseur personnalisé
  const range = document.getElementById("custom-range");
  const valueDisplay = document.getElementById("custom-value");

  range.addEventListener("input", () => {
    valueDisplay.textContent = range.value;
    maxNumber = Number(range.value);
    initNumbers();
  });
});
