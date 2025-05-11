import LoginPresenter from './login-presenter';
export default class LoginPage {
  #presenter;

  constructor() {
    this.#presenter = new LoginPresenter(this);
  }

  async render() {
    return `
      <section class="auth-section">
      <div class="form-container">
        <h2 class="form-title">Login</h2>
        <form id="loginForm" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="Contoh: nikewulan@gmail.com" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="********" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Masuk</button>
          </div>
          <p class="form-footer">Belum punya akun? <a href="#/register">Daftar Sekarang</a></p>
        </form>
        <div id="errorMessage" role="alert" class="message-container"></div>
      </div>
    </section>
    `;
  }

  async afterRender() {
    this.#presenter.checkLoginStatus();

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      this.#presenter.handleLogin(email, password);
    });
  }

  showError(message) {
    const el = document.getElementById('errorMessage');
    el.textContent = message;
    el.classList.remove('success');
    el.classList.add('error');
  }

  showSuccess(message) {
    const el = document.getElementById('errorMessage');
    el.textContent = message;
    el.classList.remove('error');
    el.classList.add('success');
  }

  clearMessage() {
    const el = document.getElementById('errorMessage');
    el.textContent = '';
    el.classList.remove('error', 'success');
  }

  setLoading(isLoading) {
    const button = document.querySelector('button[type="submit"]');
    button.textContent = isLoading ? 'Memproses...' : 'Masuk';
    button.disabled = isLoading;
  }
}
