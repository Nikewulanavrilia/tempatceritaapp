import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import HomePage from '../pages/home/home-page';
import DetailPage from '../pages/home/detail-cerita-page';
import AddStoryPage from '../pages/cerita/tambah-cerita-page';
import FavoritesPage from '../pages/home/favorites-page';
import NotFoundPage from '../pages/halaman_not_found/not-found-page';

const routes = {
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/': new HomePage(),
  '/detail/:id': new DetailPage(),
  '/add-story': new AddStoryPage(),
  '/favorites': new FavoritesPage(),
  '*': NotFoundPage,
};
export default routes;
