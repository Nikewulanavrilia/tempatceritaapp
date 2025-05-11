import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DetailPresenter from './detail-cerita-presenter';
import { FavoriteStoryDB } from '../../data/database';
export default class DetailPage {
  #presenter;
  constructor() {
    this.#presenter = new DetailPresenter(this);
    this.map = null;
  }
  async render() {
    return `
      <section class="detail-container">
        <div id="detail-story"></div>
      </section>
    `;
  }
  async afterRender() {
    const url = window.location.hash.split('/');
    const id = url[2];
    this.#presenter.loadStoryById(id);
  }
  showStoryDetail(story) {
  const container = document.getElementById('detail-story');
  container.innerHTML = `
    <h2 class="page-title">Detail Cerita ${story.name}</h2>
    <div id="map" class="story-map-top"></div>
    <div class="story-detail-wrapper">
      <div class="story-left">
        <img src="${story.photoUrl}" alt="Foto detail cerita: ${story.name}" class="story-image"/>
      </div>
      <div class="story-right">
        <div class="story-content">
          <h3>${story.name}</h3>
          ${story.description ? `<p class="story-description">${story.description}</p>` : ''}
          <p class="story-date">Tanggal: ${new Date(story.createdAt).toLocaleDateString('id-ID')}</p>
        </div>
        <div class="favorite-action">
          <button id="save-favorite-button" class="btn btn-primary">Simpan ke Favorit</button>
        </div>
      </div>
    </div>
    <div class="back-button-container">
      <button id="back-button" class="btn-back">Kembali ke Beranda</button>
    </div>
  `;

  const saveButton = document.getElementById('save-favorite-button');
  saveButton.addEventListener('click', async () => {
  try {
    const completeStory = {
      id: story.id,
      name: story.name,
      description: story.description,
      createdAt: story.createdAt,
      photoUrl: story.photoUrl || '',     
      lat: story.lat || null,
      lon: story.lon || null,
    };
    await FavoriteStoryDB.put(completeStory);
    alert('✅ Cerita disimpan ke favorit!');
    window.location.hash = '/favorites';
  } catch (err) {
    alert('❌ Gagal menyimpan cerita');
    console.error(err);
  }
});
  document.getElementById('back-button').addEventListener('click', () => {
    window.location.hash = '/';
  });

  this.initMap(story.lat, story.lon, story.name);
}

  initMap(lat, lon, name) {
    this.createMap(lat, lon, name);
  }

  createMap(lat, lon, name) {
    this.map = L.map('map').setView([lat, lon], 13);

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

    L.marker([lat, lon])
      .addTo(this.map)
      .bindPopup(`<b>Lokasi Cerita</b><br>${name}`)
      .openPopup();
  }
}
