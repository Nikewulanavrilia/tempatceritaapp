import { login, isUserLoggedIn } from '../../data/model';
export default class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  async handleLogin(email, password) {
    try {
      this.view.clearMessage();
      this.view.setLoading(true);

      await login({ email, password });

      this.view.showSuccess('Login berhasil! Mengalihkan...');
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1000);
    } catch (error) {
      this.view.showError(error.message || 'Gagal login.');
    } finally {
      this.view.setLoading(false);
    }
  }

  checkLoginStatus() {
    if (isUserLoggedIn()) {
      window.location.hash = '#/';
    }
  }
}
