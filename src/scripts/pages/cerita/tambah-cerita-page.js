import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddStoryPresenter from './tambah-cerita-presenter';

export default class AddStoryPage {
  #presenter;

  constructor() {
    this.#presenter = new AddStoryPresenter(this);
    this.map = null;
    this.selectedLatLng = null;
    this.stream = null;
    this.capturedImage = null;
  }

  async render() {
    return `
    <section class="add-story-container">
      <h2 class="page-title">Tambah Cerita Baru</h2>
      <form id="add-story-form" class="add-story-form">
        <div class="form-group">
          <label for="story-description">Deskripsi</label>
          <textarea id="story-description" placeholder="Deskripsi" required></textarea>
        </div>
        
        <div class="camera-container">
          <video id="camera-preview" autoplay playsinline style="display: none;"></video>
          <canvas id="photo-canvas" style="display: none;"></canvas>
          <img id="captured-image" alt="Foto yang diambil" style="display: none;" />
          
          <div class="camera-buttons">
            <button type="button" id="start-camera" class="btn-camera">Buka Kamera</button>
            <button type="button" id="capture-photo" class="btn-camera" style="display: none;">Ambil Foto</button>
            <button type="button" id="retake-photo" class="btn-camera" style="display: none;">Ambil Ulang</button>
          </div>
          
          <p id="camera-status" class="camera-status"></p>
          
          <div class="file-input-container">
            <p>Atau pilih file dari perangkat:</p>
            <label for="story-image">Pilih Gambar</label>
            <input type="file" id="story-image" accept="image/*" />
          </div>
        </div>
        <div class="form-group">
          <h3>Lokasi Cerita</h3>
          <p>Klik pada peta untuk memilih lokasi cerita Anda</p>
          
          <div class="coordinates-input">
            <div class="coord-group">
              <label for="latitude">Latitude:</label>
              <input type="text" id="latitude" readonly placeholder="Latitude belum dipilih" />
            </div>
            <div class="coord-group">
              <label for="longitude">Longitude:</label>
              <input type="text" id="longitude" readonly placeholder="Longitude belum dipilih" />
            </div>
          </div>
        </div>
        <div id="map" class="story-map" aria-label="Peta untuk memilih lokasi cerita"></div>
        <button type="submit" class="btn btn-kirim">Kirim Cerita</button>
      </form>
      <div id="formMessage" class="message-container"></div>
    </section>
    `;
  }

  async afterRender() {
    this.initMap();
    this.initCameraControls();

    document
      .getElementById('add-story-form')
      .addEventListener('submit', (e) => this.#presenter.handleFormSubmit(e));

    window.addEventListener('hashchange', () => this.cleanup());

    window.addEventListener('beforeunload', () => this.cleanup());
  }

  initMap() {
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

    this.map.on('click', (e) => {
      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
      }

      this.selectedLatLng = e.latlng;
      document.getElementById('latitude').value = e.latlng.lat.toFixed(6);
      document.getElementById('longitude').value = e.latlng.lng.toFixed(6);
      this.currentMarker = L.marker([e.latlng.lat, e.latlng.lng])
        .addTo(this.map)
        .bindPopup(
          `
          <div class="popup-coordinates">
            <strong>Koordinat Lokasi:</strong><br>
            Latitude: ${e.latlng.lat.toFixed(6)}<br>
            Longitude: ${e.latlng.lng.toFixed(6)}
          </div>
        `,
        )
        .openPopup();
    });
  }

  initCameraControls() {
    const startCameraBtn = document.getElementById('start-camera');
    const capturePhotoBtn = document.getElementById('capture-photo');
    const retakePhotoBtn = document.getElementById('retake-photo');
    const videoElement = document.getElementById('camera-preview');
    const canvasElement = document.getElementById('photo-canvas');
    const capturedImgElement = document.getElementById('captured-image');
    const cameraStatus = document.getElementById('camera-status');
    const fileInput = document.getElementById('story-image');

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) {
          this.capturedImage = null;

          if (capturedImgElement) {
            capturedImgElement.style.display = 'none';
            if (capturedImgElement.src) {
              URL.revokeObjectURL(capturedImgElement.src);
              capturedImgElement.src = '';
            }
          }

          this.stopCameraStream();

          if (retakePhotoBtn) retakePhotoBtn.style.display = 'none';
          if (startCameraBtn) startCameraBtn.style.display = 'inline-block';

          cameraStatus.textContent =
            'File gambar dipilih. Kamera dinonaktifkan.';
        }
      });
    }

    startCameraBtn.addEventListener('click', async () => {
      try {
        if (fileInput && fileInput.value) {
          fileInput.value = '';
        }

        this.stopCameraStream();

        cameraStatus.textContent = 'Meminta akses kamera...';

        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        videoElement.srcObject = this.stream;

        videoElement.style.display = 'block';
        capturePhotoBtn.style.display = 'inline-block';
        startCameraBtn.style.display = 'none';
        cameraStatus.textContent = 'Kamera aktif. Ambil foto ceritamu!';
      } catch (error) {
        console.error('Error accessing camera:', error);
        cameraStatus.textContent = `Gagal mengakses kamera: ${error.message}. Gunakan input file sebagai alternatif.`;
      }
    });

    capturePhotoBtn.addEventListener('click', () => {
      if (fileInput && fileInput.value) {
        fileInput.value = '';
      }

      const { videoWidth, videoHeight } = videoElement;

      canvasElement.width = videoWidth;
      canvasElement.height = videoHeight;

      const context = canvasElement.getContext('2d');
      context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

      canvasElement.toBlob(
        (blob) => {
          this.capturedImage = blob;

          const imageUrl = URL.createObjectURL(blob);
          capturedImgElement.src = imageUrl;
          capturedImgElement.style.display = 'block';

          videoElement.style.display = 'none';
          capturePhotoBtn.style.display = 'none';
          retakePhotoBtn.style.display = 'inline-block';

          this.stopCameraStream();

          cameraStatus.textContent = 'Foto berhasil diambil dari kamera';
        },
        'image/jpeg',
        0.95,
      );
    });

    retakePhotoBtn.addEventListener('click', async () => {
      capturedImgElement.style.display = 'none';
      retakePhotoBtn.style.display = 'none';
      startCameraBtn.style.display = 'inline-block';

      if (capturedImgElement.src) {
        URL.revokeObjectURL(capturedImgElement.src);
        capturedImgElement.src = '';
      }

      this.capturedImage = null;
      cameraStatus.textContent = '';
    });
  }

  stopCameraStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
        console.log('Track dihentikan:', track.kind);
      });
      this.stream = null;

      const videoElement = document.getElementById('camera-preview');
      if (videoElement) {
        videoElement.srcObject = null;
      }

      console.log('Kamera stream dinonaktifkan');
    }
  }

  getFormData() {
    const descriptionElement = document.getElementById('story-description');
    const fileInput = document.getElementById('story-image');

    const description = descriptionElement ? descriptionElement.value : '';

    const fileImage =
      fileInput && fileInput.files && fileInput.files.length > 0
        ? fileInput.files[0]
        : null;

    const image = this.capturedImage || fileImage;

    const lat = this.selectedLatLng?.lat;
    const lon = this.selectedLatLng?.lng;

    return { description, image, lat, lon };
  }

  showMessage(message, isError = false) {
    const el = document.getElementById('formMessage');
    el.textContent = message;
    el.className = isError
      ? 'message-container error'
      : 'message-container success';
  }

  cleanup() {
    this.stopCameraStream();

    const capturedImgElement = document.getElementById('captured-image');
    if (capturedImgElement && capturedImgElement.src) {
      URL.revokeObjectURL(capturedImgElement.src);
    }

    window.removeEventListener('hashchange', () => this.cleanup());
    window.removeEventListener('beforeunload', () => this.cleanup());
  }

  destroy() {
    this.cleanup();

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
