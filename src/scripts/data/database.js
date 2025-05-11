import { openDB } from 'idb';

const DB_NAME = 'tempath-cerita-db';
const STORE_NAME = 'favorites';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

export const FavoriteStoryDB = {
  async put(story) {
    return (await dbPromise).put(STORE_NAME, story);
  },
  async getAll() {
    return (await dbPromise).getAll(STORE_NAME);
  },
  async delete(id) {
    return (await dbPromise).delete(STORE_NAME, id);
  },
  async get(id) {
    return (await dbPromise).get(STORE_NAME, id);
  },
};
