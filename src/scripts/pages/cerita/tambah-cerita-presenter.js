import { addStory } from '../../data/model';
export default class AddStoryPresenter {
  constructor(view) {
    this.view = view;
  }

  async handleFormSubmit(event) {
    event.preventDefault();
    const { description, image, lat, lon } = this.view.getFormData();

    if (!lat || !lon) {
      this.view.showMessage('Silakan pilih lokasi pada peta.', true);
      return;
    }

    if (!image) {
      this.view.showMessage('Silakan ambil foto atau pilih gambar.', true);
      return;
    }

    try {
      this.view.stopCameraStream();

      await addStory({ description, photo: image, lat, lon });
      this.view.showMessage('Cerita berhasil dikirim!');
      this.view.cleanup();

      setTimeout(() => {
        window.location.hash = '/';
      }, 1500);
    } catch (error) {
      this.view.showMessage(error.message, true);
    }
  }
}
