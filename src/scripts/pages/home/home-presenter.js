import { getStories } from '../../data/model';

export default class HomePresenter {
  constructor(view) {
    this.view = view;
  }

  async loadInitialStories() {
    try {
      this.view.showLoading();
      const stories = await getStories({ size: 9, location: 1 });
      this.view.showStories(stories);
    } catch (error) {
      this.view.showError(error.message);
    } finally {
      this.view.hideLoading();
    }
  }

  async loadAllRemainingStories() {
    try {
      this.view.showLoading();
      const stories = await getStories({ location: 1 });
      const remainingStories = stories.slice(9);
      this.view.showStories(remainingStories);
    } catch (error) {
      this.view.showError(error.message);
    } finally {
      this.view.hideLoading();
    }
  }
}
