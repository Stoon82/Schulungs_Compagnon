/**
 * IndexedDB utilities for offline data storage
 * Stores user notes, bookmarks, quiz progress, and cached module data
 */

const DB_NAME = 'CompagnonDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  NOTES: 'userNotes',
  BOOKMARKS: 'userBookmarks',
  QUIZ_PROGRESS: 'quizProgress',
  MODULE_CACHE: 'moduleCache',
  PENDING_ACTIONS: 'pendingActions'
};

/**
 * Initialize IndexedDB
 */
export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // User Notes store
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const notesStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id', autoIncrement: true });
        notesStore.createIndex('moduleId', 'moduleId', { unique: false });
        notesStore.createIndex('submoduleId', 'submoduleId', { unique: false });
        notesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // User Bookmarks store
      if (!db.objectStoreNames.contains(STORES.BOOKMARKS)) {
        const bookmarksStore = db.createObjectStore(STORES.BOOKMARKS, { keyPath: 'id', autoIncrement: true });
        bookmarksStore.createIndex('moduleId', 'moduleId', { unique: false });
        bookmarksStore.createIndex('submoduleId', 'submoduleId', { unique: false });
      }

      // Quiz Progress store
      if (!db.objectStoreNames.contains(STORES.QUIZ_PROGRESS)) {
        const quizStore = db.createObjectStore(STORES.QUIZ_PROGRESS, { keyPath: 'id', autoIncrement: true });
        quizStore.createIndex('submoduleId', 'submoduleId', { unique: false });
        quizStore.createIndex('userId', 'userId', { unique: false });
      }

      // Module Cache store
      if (!db.objectStoreNames.contains(STORES.MODULE_CACHE)) {
        const cacheStore = db.createObjectStore(STORES.MODULE_CACHE, { keyPath: 'id' });
        cacheStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // Pending Actions store (for background sync)
      if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
        const actionsStore = db.createObjectStore(STORES.PENDING_ACTIONS, { keyPath: 'id', autoIncrement: true });
        actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Generic CRUD operations
 */
export async function addItem(storeName, item) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getItem(storeName, id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllItems(storeName) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateItem(storeName, item) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteItem(storeName, id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getItemsByIndex(storeName, indexName, value) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * User Notes operations
 */
export async function saveNote(moduleId, submoduleId, content) {
  return addItem(STORES.NOTES, {
    moduleId,
    submoduleId,
    content,
    timestamp: new Date().toISOString()
  });
}

export async function getNotesBySubmodule(submoduleId) {
  return getItemsByIndex(STORES.NOTES, 'submoduleId', submoduleId);
}

export async function getAllNotes() {
  return getAllItems(STORES.NOTES);
}

/**
 * Bookmarks operations
 */
export async function addBookmark(moduleId, submoduleId, title) {
  return addItem(STORES.BOOKMARKS, {
    moduleId,
    submoduleId,
    title,
    createdAt: new Date().toISOString()
  });
}

export async function removeBookmark(id) {
  return deleteItem(STORES.BOOKMARKS, id);
}

export async function getAllBookmarks() {
  return getAllItems(STORES.BOOKMARKS);
}

export async function isBookmarked(submoduleId) {
  const bookmarks = await getItemsByIndex(STORES.BOOKMARKS, 'submoduleId', submoduleId);
  return bookmarks.length > 0;
}

/**
 * Quiz Progress operations
 */
export async function saveQuizProgress(submoduleId, userId, answers, score) {
  return addItem(STORES.QUIZ_PROGRESS, {
    submoduleId,
    userId,
    answers,
    score,
    completedAt: new Date().toISOString()
  });
}

export async function getQuizProgress(submoduleId, userId) {
  const allProgress = await getItemsByIndex(STORES.QUIZ_PROGRESS, 'submoduleId', submoduleId);
  return allProgress.filter(p => p.userId === userId);
}

/**
 * Module Cache operations
 */
export async function cacheModule(moduleId, moduleData) {
  return updateItem(STORES.MODULE_CACHE, {
    id: moduleId,
    data: moduleData,
    cachedAt: new Date().toISOString()
  });
}

export async function getCachedModule(moduleId) {
  return getItem(STORES.MODULE_CACHE, moduleId);
}

export async function clearOldCache(maxAgeMs = 7 * 24 * 60 * 60 * 1000) { // 7 days default
  const db = await initDB();
  const transaction = db.transaction([STORES.MODULE_CACHE], 'readwrite');
  const store = transaction.objectStore(STORES.MODULE_CACHE);
  const index = store.index('cachedAt');
  const cutoffDate = new Date(Date.now() - maxAgeMs).toISOString();

  return new Promise((resolve, reject) => {
    const request = index.openCursor();
    const deletedIds = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.cachedAt < cutoffDate) {
          cursor.delete();
          deletedIds.push(cursor.value.id);
        }
        cursor.continue();
      } else {
        resolve(deletedIds);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Pending Actions operations (for background sync)
 */
export async function addPendingAction(url, method, headers, body) {
  return addItem(STORES.PENDING_ACTIONS, {
    url,
    method,
    headers,
    body,
    timestamp: new Date().toISOString()
  });
}

export async function getAllPendingActions() {
  return getAllItems(STORES.PENDING_ACTIONS);
}

export async function removePendingAction(id) {
  return deleteItem(STORES.PENDING_ACTIONS, id);
}

/**
 * Sync pending actions when back online
 */
export async function syncPendingActions() {
  const actions = await getAllPendingActions();
  const results = [];

  for (const action of actions) {
    try {
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
      });

      if (response.ok) {
        await removePendingAction(action.id);
        results.push({ id: action.id, success: true });
      } else {
        results.push({ id: action.id, success: false, error: 'HTTP error' });
      }
    } catch (error) {
      results.push({ id: action.id, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Get cache size estimate
 */
export async function getCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentage: (estimate.usage / estimate.quota) * 100
    };
  }
  return null;
}

/**
 * Clear all cached data
 */
export async function clearAllData() {
  const db = await initDB();
  const storeNames = Object.values(STORES);

  for (const storeName of storeNames) {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export default {
  initDB,
  STORES,
  addItem,
  getItem,
  getAllItems,
  updateItem,
  deleteItem,
  getItemsByIndex,
  saveNote,
  getNotesBySubmodule,
  getAllNotes,
  addBookmark,
  removeBookmark,
  getAllBookmarks,
  isBookmarked,
  saveQuizProgress,
  getQuizProgress,
  cacheModule,
  getCachedModule,
  clearOldCache,
  addPendingAction,
  getAllPendingActions,
  removePendingAction,
  syncPendingActions,
  getCacheSize,
  clearAllData
};
