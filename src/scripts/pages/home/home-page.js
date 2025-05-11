import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import HomePresenter from './home-presenter';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL(
    'leaflet/dist/images/marker-icon-2x.png',
    import.meta.url,
  ).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url)
    .href,
});
export default class HomePage {
  #presenter;

  constructor() {
    this.#presenter = new HomePresenter(this);
    this.map = null;
    this.markers = [];
  }

  async render() {
    return `
      <section class="home-container">
        <h2 class="page-title">Peta Lokasi Cerita</h2>
        <div id="map" class="story-map"></div>
        <h2 class="page-title">Ruang Cerita</h2>
        <div id="story-list" class="story-list"></div>
        <div id="loading" class="loading">Memuat cerita...</div>
        <div id="errorMessage" class="message-container"></div>
        <div class="load-more-container">
          <button id="load-more-button" class="btn-load-more">Lihat Lebih Banyak</button>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.initMap();
    this.#presenter.loadInitialStories();

    document
      .getElementById('load-more-button')
      .addEventListener('click', async () => {
        document.getElementById('load-more-button').style.display = 'none';
        await this.#presenter.loadAllRemainingStories();
      });
  }

  initMap() {
    this.createMap();
  }

  createMap() {
    const defaultPosition = [-2.5489, 118.0149];
    this.map = L.map('map').setView(defaultPosition, 5);

    const osmLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
        name: 'OpenStreetMap Standard',
      },
    );

    const osmHOT = L.tileLayer(
      'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
        name: 'OpenStreetMap Humanitarian',
      },
    );

    const cartoDB = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap contributors, &copy; CartoDB',
        name: 'CartoDB Light',
      },
    );

    const esriWorldImagery = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        name: 'ESRI Satelit',
      },
    );

    const baseLayers = {
      'Peta Standar': osmLayer,
      'Peta Humanitarian': osmHOT,
      'Peta Light': cartoDB,
      'Citra Satelit': esriWorldImagery,
    };

    osmLayer.addTo(this.map);

    L.control.layers(baseLayers, {}, { collapsed: false }).addTo(this.map);
  }

  addMarkers(stories) {
    if (!this.map || !stories.length) return;

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        marker.bindPopup(`
          <div class="marker-popup">
            <h4>${story.name}</h4>
            <img src="${story.photoUrl}" alt="Foto lokasi cerita: ${story.name}" style="width:100%;max-width:200px;">
            <p>${story.description ? story.description.substring(0, 100) + (story.description.length > 100 ? '...' : '') : ''}</p>
          </div>
        `);
        this.markers.push(marker);
      }
    });

    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }

  showStories(stories) {
    const container = document.getElementById('story-list');
    const html = stories
      .map(
        (story) => `
      <div class="story-card" data-id="${story.id}">
        <img src="${story.photoUrl}" alt="Foto cerita: ${story.name}" class="story-image" />
        <div class="story-content">
          <h3>${story.name}</h3>
          <p class="story-description">${story.description}</p>
          <p class="story-date">Tanggal: ${new Date(story.createdAt).toLocaleDateString('id-ID')}</p>
        </div>
      </div>
    `,
      )
      .join('');
    container.innerHTML += html;

    container.querySelectorAll('.story-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        window.location.hash = `/detail/${id}`;
      });
    });

    this.addMarkers(stories);
  }

  showError(message) {
    const el = document.getElementById('errorMessage');
    if (el) {
      el.textContent = message;
      el.classList.add('error');
    } else {
      console.error('Elemen dengan ID errorMessage tidak ditemukan:', message);
    }
  }

  showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
  }

  hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }
}
