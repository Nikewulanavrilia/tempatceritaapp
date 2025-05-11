import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  HOME: `${CONFIG.BASE_URL}/stories`,
  DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

export async function register({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(
      responseJson.message || 'Terjadi kesalahan saat pendaftaran',
    );
  }

  return responseJson;
}

export async function login({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || 'Email atau password salah');
  }

  localStorage.setItem('token', responseJson.loginResult.token);
  localStorage.setItem('user', JSON.stringify(responseJson.loginResult));

  return responseJson;
}

export function isUserLoggedIn() {
  return !!localStorage.getItem('token');
}

export async function getStories({ page, size, location = 0 } = {}) {
  const token = localStorage.getItem('token');
  const url = new URL(`${CONFIG.BASE_URL}/stories`);

  if (page) url.searchParams.append('page', page);
  if (size) url.searchParams.append('size', size);
  url.searchParams.append('location', location);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || 'Gagal mengambil data cerita');
  }

  return responseJson.listStory;
}

export async function getStoryById(id) {
  const token = localStorage.getItem('token');

  const response = await fetch(ENDPOINTS.DETAIL(id), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || 'Gagal mengambil detail cerita');
  }

  return responseJson.story;
}
export async function addStory({ description, photo, lat, lon }) {
  const token = localStorage.getItem('token');
  const formData = new FormData();

  formData.append('description', description);
  formData.append('photo', photo);
  formData.append('lat', lat);
  formData.append('lon', lon);

  const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message || 'Gagal menambahkan cerita');
  }

  return responseJson;
}
export async function subscribeToPushNotification(subscription) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    }),
  });

  const responseJson = await response.json();
  if (!response.ok) {
    throw new Error(responseJson.message || 'Gagal subscribe notifikasi');
  }

  return responseJson;
}

export async function unsubscribeFromPushNotification(endpoint) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint }),
  });

  const responseJson = await response.json();
  if (!response.ok) {
    throw new Error(responseJson.message || 'Gagal unsubscribe notifikasi');
  }

  return responseJson;
}


export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.hash = '#/login';
}
