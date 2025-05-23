import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { isUserLoggedIn } from '../data/model';
import NotFoundPage from './halaman_not_found/not-found-page';

export default class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }
  async renderPage() {
  const url = getActiveRoute();
  const page = routes[url];
  const publicRoutes = ['/login', '/register'];
  if (!page) {
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await NotFoundPage.render();
        await NotFoundPage.afterRender();
      });
    } else {
      this.#content.innerHTML = await NotFoundPage.render();
      await NotFoundPage.afterRender();
    }
    return;
  }
  if (!isUserLoggedIn() && !publicRoutes.includes(url)) {
    window.location.hash = '#/login';
    return;
  }
  if (document.startViewTransition) {
    document.startViewTransition(async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    });
  } else {
    this.#content.innerHTML = await page.render();
    await page.afterRender();
  }
}
}
