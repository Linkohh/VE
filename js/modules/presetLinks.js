const drawer = document.getElementById('preset-import-drawer');
const closeBtn = document.getElementById('preset-import-close');
const applyBtn = document.getElementById('preset-import-apply');
const input = document.getElementById('preset-import-input');
const dropZone = drawer?.querySelector('.preset-import-drop') ?? null;

function updateBodyScrollLock() {
  const needsLock = document.querySelectorAll('[data-scroll-lock="true"]').length > 0;
  document.body.classList.toggle('overflow-hidden', needsLock);
}

function setDrawerVisible(visible) {
  if (!drawer) return;
  drawer.classList.toggle('hidden', !visible);
  drawer.setAttribute('aria-hidden', visible ? 'false' : 'true');
  drawer.dataset.scrollLock = visible ? 'true' : 'false';
  updateBodyScrollLock();
}

export function openPresetImport() {
  if (!drawer) return;
  setDrawerVisible(true);
  input?.focus({ preventScroll: true });
}

export function closePresetImport() {
  if (!drawer) return;
  setDrawerVisible(false);
  if (input) {
    input.value = '';
  }
}

export function togglePresetImport(forceState) {
  if (!drawer) return;
  const isOpen = !drawer.classList.contains('hidden');
  const shouldOpen = typeof forceState === 'boolean' ? forceState : !isOpen;
  if (shouldOpen) {
    openPresetImport();
  } else {
    closePresetImport();
  }
}

function emitPresetEvent(name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

function handleApply() {
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;
  emitPresetEvent('vibeme:preset:import-link', { href: value });
  closePresetImport();
}

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = (event) => reject(event instanceof Error ? event : new Error('Failed to read preset file'));
    reader.readAsText(file);
  });
}

async function handleDroppedFiles(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  try {
    const text = await readFileText(file);
    emitPresetEvent('vibeme:preset:import-file', { file, text });
    closePresetImport();
  } catch (error) {
    console.error('[preset-import] Failed to read file', error);
  }
}

function handleKeydown(event) {
  if (!drawer || drawer.classList.contains('hidden')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closePresetImport();
  }
}

if (drawer) {
  drawer.dataset.scrollLock = 'false';
  closeBtn?.addEventListener('click', () => closePresetImport());
  applyBtn?.addEventListener('click', handleApply);

  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleApply();
    }
  });

  drawer.addEventListener('click', (event) => {
    if (event.target === drawer) {
      closePresetImport();
    }
  });

  if (dropZone) {
    ['dragenter', 'dragover'].forEach((type) => {
      dropZone.addEventListener(type, (event) => {
        event.preventDefault();
        dropZone.classList.add('is-active');
      });
    });

    ['dragleave', 'drop'].forEach((type) => {
      dropZone.addEventListener(type, (event) => {
        event.preventDefault();
        dropZone.classList.remove('is-active');
      });
    });

    dropZone.addEventListener('drop', (event) => {
      const files = event.dataTransfer?.files;
      if (files) {
        handleDroppedFiles(files);
      }
    });
  }

  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('vibeme:preset:open', () => openPresetImport());
  document.addEventListener('vibeme:preset:close', () => closePresetImport());
  document.addEventListener('vibeme:preset:toggle', () => togglePresetImport());
}
