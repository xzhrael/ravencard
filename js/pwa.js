let deferredInstallPrompt = null;

export function initPWA() {
  if ('serviceWorker' in navigator) {
    let isRefreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!isRefreshing) {
        isRefreshing = true;
        window.location.reload();
      }
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          reg.update();
        })
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

  // Handle dual-platform install guide tabs
  const tabAndroid = document.getElementById('tab-btn-android');
  const tabIos = document.getElementById('tab-btn-ios');
  const stepsAndroid = document.getElementById('install-steps-android');
  const stepsIos = document.getElementById('install-steps-ios');

  function switchInstallTab(target) {
    const isIos = target === 'ios';
    if (tabIos && tabAndroid) {
      tabIos.classList.toggle('active', isIos);
      tabAndroid.classList.toggle('active', !isIos);
      tabIos.setAttribute('aria-selected', isIos ? 'true' : 'false');
      tabAndroid.setAttribute('aria-selected', !isIos ? 'true' : 'false');
    }
    if (stepsIos && stepsAndroid) {
      stepsIos.classList.toggle('hidden', !isIos);
      stepsAndroid.classList.toggle('hidden', isIos);
    }
  }

  if (tabAndroid) tabAndroid.addEventListener('click', () => switchInstallTab('android'));
  if (tabIos) tabIos.addEventListener('click', () => switchInstallTab('ios'));

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
    showToast('RavenCard terpasang di layar utama.');
  });
}

export function openInstallGuide() {
  const installModal = document.getElementById('install-modal');
  if (installModal) {
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const tabAndroid = document.getElementById('tab-btn-android');
    const tabIos = document.getElementById('tab-btn-ios');
    const stepsAndroid = document.getElementById('install-steps-android');
    const stepsIos = document.getElementById('install-steps-ios');

    if (tabIos && tabAndroid && stepsIos && stepsAndroid) {
      tabIos.classList.toggle('active', isApple);
      tabAndroid.classList.toggle('active', !isApple);
      stepsIos.classList.toggle('hidden', !isApple);
      stepsAndroid.classList.toggle('hidden', isApple);
    }

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
