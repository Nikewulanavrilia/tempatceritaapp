import { FavoriteStoryDB } from "../../data/database";

export default class FavoritesPage {
  async render() {
    return `<div class="container">
      <h2 class="page-title">Cerita Favorit</h2>
      <div id="favorites-container" class="story-list"></div>
    </div>`;
  }

  async afterRender() {
  const container = document.getElementById('favorites-container');
  const stories = await FavoriteStoryDB.getAll();

  if (!stories.length) {
    container.innerHTML = '<p>Tidak ada cerita favorit.</p>';
    return;
  }

  container.innerHTML = stories.map((story) => `
    <div class="story-card" data-id="${story.id}">
      <img src="${story.photoUrl}" alt="Foto ${story.name}" class="story-image" onerror="this.style.display='none'" />
      <div class="story-content">
        <h3>${story.name}</h3>
        <p class="story-description">${story.description || 'Tidak ada deskripsi.'}</p>
        <p class="story-date">Tanggal: ${new Date(story.createdAt).toLocaleDateString('id-ID')}</p>
        <div class="action-buttons">
          <button onclick="removeFavorite('${story.id}')" class="btn btn-danger">Hapus</button>
        </div>
      </div>
    </div>
  `).join('');
  container.querySelectorAll('.story-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() !== 'button') {
        const id = card.getAttribute('data-id');
        window.location.hash = `/detail/${id}`;
      }
    });
  });
}
}
