const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
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
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function track(name, detail = {}) {
  document.dispatchEvent(new CustomEvent('plaqueo:track', { detail: { name, ...detail } }));
  if (typeof window.plaqueoTrack === 'function') window.plaqueoTrack(name, detail);
}

function preparePlate(plate) {
  currentPlate = plate;
  $('#plateInput').value = plate;
  $('#preparedPlate').textContent = plate;
  $$('[data-copy="true"]').forEach(link => link.classList.add('ready'));
  showToast(`${plate} preparada para las consultas`);
  track('plate_prepared');
}

function setStepState(step, state) {
  step.dataset.state = state;
  step.classList.remove('state-ok', 'state-warn', 'state-pending');
  step.classList.add(`state-${state}`);
  step.querySelectorAll('[data-result]').forEach(button => button.classList.toggle('selected', button.dataset.result === state));
  updateSummary();
  track('step_result', { step: step.dataset.step, state });
}

function updateSummary() {
  const steps = $$('.check-step');
  const counts = { ok: 0, warn: 0, pending: 0 };
  steps.forEach(step => counts[step.dataset.state]++);
  $('#okCount').textContent = counts.ok;
  $('#warnCount').textContent = counts.warn;
  $('#pendingCount').textContent = counts.pending;
  $('#progressBar').style.width = `${((steps.length - counts.pending) / steps.length) * 100}%`;

  const traffic = $('#traffic');
  traffic.className = 'traffic';
  if (counts.warn > 0) {
    traffic.classList.add('danger');
    traffic.querySelector('strong').textContent = 'Revisa estas observaciones';
    $('#summaryText').textContent = `Encontraste ${counts.warn} punto${counts.warn === 1 ? '' : 's'} que merece${counts.warn === 1 ? '' : 'n'} aclaración antes de pagar.`;
  } else if (counts.pending > 0) {
    traffic.classList.add('pending');
    traffic.querySelector('strong').textContent = 'Faltan verificaciones';
    $('#summaryText').textContent = `Aún quedan ${counts.pending} revisión${counts.pending === 1 ? '' : 'es'} pendiente${counts.pending === 1 ? '' : 's'}.`;
  } else {
    traffic.classList.add('ok');
    traffic.querySelector('strong').textContent = 'Sin alertas visibles registradas';
    $('#summaryText').textContent = 'Marcaste todas las revisiones sin alertas visibles. Confirma igualmente los documentos y la inspección presencial.';
  }
}

function buildShareText() {
  const lines = [`Checklist Plaqueo Vehicular${currentPlate ? ` — ${currentPlate}` : ''}`];
  const labels = { ok: 'Sin alerta visible', warn: 'Con observación', pending: 'Pendiente' };
  $$('.check-step').forEach((step, index) => {
    lines.push(`${index + 1}. ${step.querySelector('h3').textContent}: ${labels[step.dataset.state]}`);
  });
  lines.push('Resultado orientativo. Verifica siempre en las entidades oficiales.');
  lines.push('https://matiascar1.github.io/Plaqueo-vehicular/');
  return lines.join('\n');
}

function resetChecklist() {
  currentPlate = '';
  $('#plateForm').reset();
  $('#preparedPlate').textContent = 'Sin ingresar';
  $$('[data-copy="true"]').forEach(link => link.classList.remove('ready'));
  $$('.check-step').forEach(step => {
    setStepState(step, 'pending');
    step.querySelector('textarea').value = '';
    step.querySelectorAll('input[type="checkbox"]').forEach(input => { input.checked = false; });
  });
  showToast('Checklist reiniciado');
}

$('#plateForm').addEventListener('submit', event => {
  event.preventDefault();
  const plate = normalizePlate($('#plateInput').value);
  if (!plate) return showToast('Ingresa una placa válida');
  preparePlate(plate);
  $('#checklist').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.addEventListener('click', async event => {
  const result = event.target.closest('[data-result]');
  if (result) {
    setStepState(result.closest('.check-step'), result.dataset.result);
    return;
  }

  const sourceLink = event.target.closest('[data-copy="true"]');
  if (sourceLink) {
    if (currentPlate) {
      try {
        await navigator.clipboard.writeText(currentPlate.replace('-', ''));
        showToast(`${currentPlate} copiada. Pégala en el portal oficial.`);
      } catch {
        showToast(`Placa preparada: ${currentPlate}`);
      }
    } else {
      showToast('El enlace se abrirá. Ingresa la placa directamente en el portal.');
    }
    track('official_source_open', { source: sourceLink.href });
  }
});

$('#downloadPdf').addEventListener('click', () => {
  const previousTitle = document.title;
  document.title = `Checklist-vehicular-${currentPlate || 'sin-placa'}`;
  document.body.classList.add('printing-checklist');
  track('pdf_requested');
  setTimeout(() => window.print(), 150);
  window.addEventListener('afterprint', () => {
    document.title = previousTitle;
    document.body.classList.remove('printing-checklist');
  }, { once: true });
});

$('#shareSummary').addEventListener('click', async () => {
  const text = buildShareText();
  track('share_requested');
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Checklist Plaqueo Vehicular', text, url: 'https://matiascar1.github.io/Plaqueo-vehicular/' });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

$('#resetChecklist').addEventListener('click', resetChecklist);
updateSummary();
