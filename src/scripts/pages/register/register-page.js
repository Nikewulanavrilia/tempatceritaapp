import RegisterPresenter from './register-presenter';
export default class RegisterPage {
  #presenter;

  constructor() {
    this.#presenter = new RegisterPresenter(this);
  }

  async render() {
    return `
      <section class="auth-section">
      <div class="form-container">
        <h2 class="form-title">Daftar Akun Baru</h2>
        <form id="registerForm" class="auth-form">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" placeholder="Contoh: Nike Wulan Avrilia" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="Contoh: nikewulan@gmail.com" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" minlength="6" placeholder="********" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Daftar</button>
          </div>
          <p class="form-footer">Sudah punya akun? <a href="#/login">Masuk Sekarang</a></p>
        </form>
        <div id="errorMessage" role="alert" class="message-container"></div>
      </div>
    </section>
    `;
  }

  async afterRender() {
    this.#presenter.checkIfLoggedIn();

    document.getElementById('registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      this.#presenter.handleRegister({ name, email, password });
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
    button.textContent = isLoading ? 'Memproses...' : 'Daftar';
    button.disabled = isLoading;
  }
}
