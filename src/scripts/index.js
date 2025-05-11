import '../styles/styles.css';

import App from './pages/app';
import { logout, isUserLoggedIn, subscribeToPushNotification, unsubscribeFromPushNotification } from './data/model';
import CONFIG from './config';
import { FavoriteStoryDB } from './data/database';


function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

async function updateNavLinks() {
  const navList = document.getElementById('nav-list');
  const headerButtons = document.getElementById('header-buttons');
  if (!navList || !headerButtons) return;

  const isMobile = window.innerWidth <= 1000;

  let isSubscribed = false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    isSubscribed = !!sub;
  } catch (err) {
    console.error('❌ Gagal cek status notifikasi:', err);
  }

  const notifButton = `
    <button id="notification-toggle-button" class="btn ${isSubscribed ? 'btn-warning' : 'btn-success'}">
      ${isSubscribed ? 'Stop Notifikasi' : 'Aktifkan Notifikasi'}
    </button>`;

  if (isUserLoggedIn()) {
    if (isMobile) {
      navList.innerHTML = `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/add-story">Tambah Cerita</a></li>
        <li><a href="#/favorites">Cerita Favorite</a></li>
        <li>${notifButton}</li>
        <li><button id="logout-nav-button" class="btn btn-danger">Logout</button></li>
      `;
      headerButtons.innerHTML = '';
    } else {
      navList.innerHTML = `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/add-story">Tambah Cerita</a></li>
        <li><a href="#/favorites">Cerita Favorite</a></li>
      `;
      headerButtons.innerHTML = `
        ${notifButton}
        <button id="logout-header-button" class="btn btn-danger">Logout</button>
      `;
    }

    const logoutButton =
      document.getElementById('logout-header-button') ||
      document.getElementById('logout-nav-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        logout();
        updateNavLinks();
        window.location.hash = '/login';
      });
    }

    const toggleNotifButton = document.getElementById('notification-toggle-button');
    if (toggleNotifButton) {
      toggleNotifButton.addEventListener('click', async () => {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();

          if (sub) {
            await unsubscribeFromPushNotification(sub.endpoint);
            await sub.unsubscribe();
            alert('🔕 Berhenti langganan notifikasi.');
          } else {
            const convertedKey = urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);
            const newSub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedKey,
            });
            await subscribeToPushNotification(newSub.toJSON());
            alert('✅ Notifikasi berhasil diaktifkan.');
          }

          updateNavLinks();
        } catch (error) {
          alert('⚠️ Gagal mengubah status notifikasi.');
          console.error(error);
        }
      });
    }
  } else {
    navList.innerHTML = `
      <li><a href="#/login">Login</a></li>
      <li><a href="#/register">Register</a></li>
    `;
    headerButtons.innerHTML = '';
  }
}

function updateHeaderButtons() {}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();
  updateHeaderButtons();
  updateNavLinks();

  window.addEventListener('resize', () => {
    updateNavLinks();
  });

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    updateHeaderButtons();
    updateNavLinks();
  });

  const mainContent = document.querySelector('#main-content');
  const skipLink = document.querySelector('.skip-link');

  if (skipLink && mainContent) {
    skipLink.addEventListener('click', function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    });
  }
});

window.removeFavorite = async (id) => {
  await FavoriteStoryDB.delete(id);
  alert('❌ Cerita dihapus dari favorit');
  window.location.reload();
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then(() => console.log('✅ Service Worker registered'))
    .catch((error) => console.error('❌ Gagal daftar Service Worker:', error));
}
