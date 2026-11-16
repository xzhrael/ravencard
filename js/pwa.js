let deferredInstallPrompt = null;

export function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .catch((err) => {
          console.error('[PWA] Service worker registration failed:', err);
        });
    });
  }

  setupInstallPrompt();
}

function setupInstallPrompt() {
  const installBtn = document.getElementById('install-app-btn');
  const installBanner = document.getElementById('pwa-install-banner');
  const bannerInstallBtn = document.getElementById('banner-install-btn');
  const bannerDismissBtn = document.getElementById('banner-dismiss-btn');
  const installHelpBtn = document.getElementById('install-help-btn');
  const installModal = document.getElementById('install-modal');
  const closeInstallModalBtn = document.getElementById('close-install-modal-btn');

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (isStandalone) {
    if (installBtn) installBtn.style.display = 'none';
    if (installBanner) installBanner.style.display = 'none';
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    // Suppress default mini-infobar on mobile Chrome to use custom prompt
    e.preventDefault();
    deferredInstallPrompt = e;

    if (installBtn) {
      installBtn.classList.remove('hidden');
      installBtn.setAttribute('aria-hidden', 'false');
    }

    const bannerDismissed = localStorage.getItem('ravencard_pwa_banner_dismissed');
    if (installBanner && !bannerDismissed) {
      setTimeout(() => {
        installBanner.classList.add('visible');
      }, 1500);
    }
  });

  const triggerInstall = async () => {
    if (!deferredInstallPrompt) {
      // Fall back to guide modal when the browser does not support install prompts
      openInstallGuide();
      return;
    }

    try {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;

      if (outcome === 'accepted') {
        if (installBanner) installBanner.classList.remove('visible');
        if (installBtn) installBtn.classList.add('hidden');
      }
      deferredInstallPrompt = null;
    } catch (err) {
      console.error('[PWA] Installation prompt failed:', err);
    }
  };

  if (installBtn) installBtn.addEventListener('click', triggerInstall);
  if (bannerInstallBtn) bannerInstallBtn.addEventListener('click', triggerInstall);

  if (bannerDismissBtn && installBanner) {
    bannerDismissBtn.addEventListener('click', () => {
      installBanner.classList.remove('visible');
      localStorage.setItem('ravencard_pwa_banner_dismissed', 'true');
    });
  }

  if (installHelpBtn) {
    installHelpBtn.addEventListener('click', () => openInstallGuide());
  }

  if (closeInstallModalBtn && installModal) {
    closeInstallModalBtn.addEventListener('click', () => {
      installModal.classList.remove('active');
    });
  }

  if (installModal) {
    installModal.addEventListener('click', (e) => {
      if (e.target === installModal) {
        installModal.classList.remove('active');
      }
    });
  }

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (installBtn) installBtn.classList.add('hidden');
    if (installBanner) installBanner.classList.remove('visible');
    showToast('Aplikasi berhasil dipasang di layar utama Android!');
  });
}

export function openInstallGuide() {
  const installModal = document.getElementById('install-modal');
  if (installModal) {
    installModal.classList.add('active');
  }
}

export function showToast(message, duration = 3000) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}
