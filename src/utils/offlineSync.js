// src/utils/offlineSync.js
import { toast } from "react-hot-toast";

const DB_NAME = "VisitorOfflineDB";
const DB_VERSION = 1;

// Initialize the IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("checkins")) {
        db.createObjectStore("checkins", { keyPath: "tempId", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("checkouts")) {
        db.createObjectStore("checkouts", { keyPath: "visitorId" });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// Save a pending check-in offline
export const saveOfflineCheckin = async (visitorData) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("checkins", "readwrite");
    const store = transaction.objectStore("checkins");
    const request = store.add({ ...visitorData, timestamp: new Date().toISOString() });

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Save a pending timeout check-out offline
export const saveOfflineCheckout = async (visitorId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("checkouts", "readwrite");
    const store = transaction.objectStore("checkouts");
    const request = store.put({ visitorId, timestamp: new Date().toISOString() });

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Retrieve all offline checkins
export const getOfflineCheckins = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("checkins", "readonly");
    const store = transaction.objectStore("checkins");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Retrieve all offline checkouts
export const getOfflineCheckouts = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("checkouts", "readonly");
    const store = transaction.objectStore("checkouts");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Remove a synced checkin
export const removeOfflineCheckin = async (tempId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("checkins", "readwrite");
    const store = transaction.objectStore("checkins");
    const request = store.delete(tempId);

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Remove a synced checkout
export const removeOfflineCheckout = async (visitorId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("checkouts", "readwrite");
    const store = transaction.objectStore("checkouts");
    const request = store.delete(visitorId);

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Fetch total count of pending sync items
export const getPendingSyncCount = async () => {
  try {
    const checkins = await getOfflineCheckins();
    const checkouts = await getOfflineCheckouts();
    return checkins.length + checkouts.length;
  } catch (error) {
    console.error("Error getting offline pending counts:", error);
    return 0;
  }
};

// Sync both checkins and checkouts to the server when online
export const syncOfflineData = async (serverUrl, token, onSyncComplete) => {
  if (!navigator.onLine) return false;

  try {
    const checkins = await getOfflineCheckins();
    const checkouts = await getOfflineCheckouts();

    if (checkins.length === 0 && checkouts.length === 0) {
      return false;
    }

    let syncedCheckins = 0;
    let syncedCheckouts = 0;

    // 1. Synchronize check-ins
    for (const item of checkins) {
      const { tempId, timestamp, ...payload } = item;
      try {
        const response = await fetch(`${serverUrl}/api/visitors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          await removeOfflineCheckin(tempId);
          syncedCheckins++;
        }
      } catch (error) {
        console.error("Failed to sync check-in item:", item, error);
      }
    }

    // 2. Synchronize check-outs
    for (const item of checkouts) {
      try {
        const response = await fetch(`${serverUrl}/api/visitors/visitors/${item.visitorId}/timeout`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await removeOfflineCheckout(item.visitorId);
          syncedCheckouts++;
        }
      } catch (error) {
        console.error("Failed to sync timeout checkout item:", item, error);
      }
    }

    const totalSynced = syncedCheckins + syncedCheckouts;
    if (totalSynced > 0) {
      toast.success(`Synced ${totalSynced} offline records successfully!`);
      if (onSyncComplete) onSyncComplete();
      return true;
    }
  } catch (error) {
    console.error("Error in syncOfflineData process:", error);
  }
  return false;
};
