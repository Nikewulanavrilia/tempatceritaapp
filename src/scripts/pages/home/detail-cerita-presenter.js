import { getStoryById } from '../../data/model';
export default class DetailPresenter {
  constructor(view) {
    this.view = view;
  }

  async loadStoryById(id) {
    try {
      const story = await getStoryById(id);
      this.view.showStoryDetail(story);
    } catch (error) {
      console.error(error);
    }
  }
}
