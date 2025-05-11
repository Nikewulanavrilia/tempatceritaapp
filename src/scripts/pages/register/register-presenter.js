import { register, isUserLoggedIn } from '../../data/model';
export default class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  checkIfLoggedIn() {
    if (isUserLoggedIn()) {
      window.location.hash = '#/';
    }
  }

  async handleRegister({ name, email, password }) {
    try {
      this.view.clearMessage();
      this.view.setLoading(true);

      await register({ name, email, password });

      this.view.showSuccess('Pendaftaran berhasil! Mengarahkan ke login...');
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 2000);
    } catch (error) {
      this.view.showError(error.message || 'Gagal mendaftar.');
    } finally {
      this.view.setLoading(false);
    }
  }
}
