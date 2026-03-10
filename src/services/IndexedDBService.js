import { openDB } from 'idb';

const DB_NAME = 'NambaleMagnetMMS';
const STORE_NAME = 'sync-visitors';

// Initialize the IndexedDB
export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// Add a visitor form payload to the offline queue
export const addVisitorToQueue = async (visitorData) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Add an ID and timestamp
    const payload = { 
        ...visitorData, 
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        capturedAt: new Date().toISOString() 
    };
    await store.add(payload);
    await tx.done;
    return true;
  } catch (error) {
    console.error("Failed to add to IndexedDB queue:", error);
    return false;
  }
};

// Retrieve all queued visitors
export const getQueuedVisitors = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return await store.getAll();
  } catch (error) {
    console.error("Failed to retrieve from IndexedDB queue:", error);
    return [];
  }
};

// Remove a specific visitor from the queue after successful sync
export const removeVisitorFromQueue = async (id) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.delete(id);
    await tx.done;
  } catch (error) {
    console.error(`Failed to remove item ${id} from IndexedDB queue:`, error);
  }
};
