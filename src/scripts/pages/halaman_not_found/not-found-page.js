const NotFoundPage = {
  async render() {
    return `
      <section class="not-found-page">
        <h2>404</h2>
        <p>Halaman yang Anda cari tidak ditemukan.</p>
        <a href="#/" class="btn btn-primary">Kembali ke Beranda</a>
      </section>
    `;
  },

  async afterRender() {}
};

export default NotFoundPage;
