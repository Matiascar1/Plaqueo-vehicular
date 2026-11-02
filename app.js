const $ = selector => document.querySelector(selector);
let currentPlate = '';

function normalizePlate(value) {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length < 5 || clean.length > 7) return null;
  return clean.length === 6 ? `${clean.slice(0, 3)}-${clean.slice(3)}` : clean;
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function preparePlate(plate) {
  currentPlate = plate;
  $('#plateInput').value = plate;
  $('#preparedPlate strong').textContent = plate;
  document.querySelectorAll('[data-copy="true"]').forEach(link => {
    link.classList.add('ready');
    link.firstChild.textContent = `Copiar ${plate} y abrir `;
  });
  showToast(`${plate} preparada para las consultas`);
}

$('#plateForm').addEventListener('submit', event => {
  event.preventDefault();
  const plate = normalizePlate($('#plateInput').value);
  if (!plate) return showToast('Ingresa una placa válida');
  preparePlate(plate);
  $('#consultas').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.addEventListener('click', async event => {
  const link = event.target.closest('[data-copy="true"]');
  if (!link || !currentPlate) return;
  try {
    await navigator.clipboard.writeText(currentPlate.replace('-', ''));
    showToast(`${currentPlate} copiada. Pégala en el portal oficial.`);
  } catch {
    showToast(`Placa preparada: ${currentPlate}`);
  }
});
