"use client";

import {
  getFirebaseAuth,
  getFirestoreDb,
  isFirebaseConfigured,
} from "@/lib/firebase-client";

const STORAGE_KEY = "afrobrawlers-community-content-v3";
const FIRESTORE_COLLECTION = "siteContent";
const FIRESTORE_DOCUMENT = "community";

export const defaultContent = {
  about: "",
  links: {
    whatsapp: "",
    discord: "",
  },
  members: [],
  countries: [],
  events: [],
};

const contentListeners = new Set();
const statusListeners = new Set();
let remoteUnsubscribe;
let currentStatus = "local";

function isBrowser() {
  return typeof window !== "undefined";
}

function cloneDefault() {
  return JSON.parse(JSON.stringify(defaultContent));
}

function normalize(content) {
  const fallback = cloneDefault();
  return {
    ...fallback,
    ...content,
    links: { ...fallback.links, ...(content?.links || {}) },
    members: Array.isArray(content?.members) ? content.members : fallback.members,
    countries: Array.isArray(content?.countries) ? content.countries : fallback.countries,
    events: Array.isArray(content?.events) ? content.events : fallback.events,
  };
}

function getLocalContent() {
  if (!isBrowser()) return cloneDefault();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : cloneDefault();
  } catch {
    return cloneDefault();
  }
}

function publish(content) {
  contentListeners.forEach((listener) => listener(content));
}

function setStatus(status) {
  currentStatus = status;
  statusListeners.forEach((listener) => listener(status));
}

function writeLocal(content, shouldPublish = true) {
  const next = normalize(content);
  if (isBrowser()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  if (shouldPublish) publish(next);
  return next;
}

async function saveToFirestore(content) {
  const db = getFirestoreDb();
  if (!db) {
    // Retain an explicit-save fallback only when Firebase has not been configured.
    return writeLocal(content);
  }

  try {
    setStatus("saving");
    const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");
    await setDoc(
      doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOCUMENT),
      { ...content, updatedAt: serverTimestamp() },
      { merge: true },
    );
    setStatus("synced");
    return content;
  } catch (error) {
    console.error("Unable to save AfroBrawlers content to Firestore.", error);
    setStatus("offline");
    throw error;
  }
}

export const contentStore = {
  get: getLocalContent,
  save(content) {
    return saveToFirestore(normalize(content));
  },
  subscribe(listener) {
    contentListeners.add(listener);
    return () => contentListeners.delete(listener);
  },
  getStatus() {
    return currentStatus;
  },
  subscribeStatus(listener) {
    statusListeners.add(listener);
    return () => statusListeners.delete(listener);
  },
  startRemoteSync() {
    if (!isBrowser() || remoteUnsubscribe) return remoteUnsubscribe || (() => {});

    const db = getFirestoreDb();
    if (!db) {
      setStatus(isFirebaseConfigured() ? "offline" : "local");
      return () => {};
    }

    setStatus("connecting");
    void import("firebase/firestore").then(({ doc, onSnapshot }) => {
      remoteUnsubscribe = onSnapshot(
        doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOCUMENT),
        (snapshot) => {
          if (snapshot.exists()) {
            writeLocal(snapshot.data());
          }
          setStatus("synced");
        },
        (error) => {
          console.error("Unable to read AfroBrawlers content from Firestore.", error);
          setStatus("offline");
        },
      );
    });

    return () => {
      remoteUnsubscribe?.();
      remoteUnsubscribe = undefined;
    };
  },
};

const LOCAL_ADMIN_EMAIL = "admin@email.com";
const LOCAL_ADMIN_PASSWORD = "admin1234";
const AUTH_KEY = "afrobrawlers-admin-auth";

export const adminAuth = {
  async login(email, password) {
    const auth = getFirebaseAuth();
    if (auth) {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
    } else if (email !== LOCAL_ADMIN_EMAIL || password !== LOCAL_ADMIN_PASSWORD) {
      throw new Error("Invalid credentials");
    }

    if (isBrowser()) window.sessionStorage.setItem(AUTH_KEY, "1");
    return true;
  },
  async logout() {
    const auth = getFirebaseAuth();
    if (auth) {
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    }
    if (isBrowser()) window.sessionStorage.removeItem(AUTH_KEY);
  },
  isAuthed() {
    return isBrowser() && window.sessionStorage.getItem(AUTH_KEY) === "1";
  },
  usesFirebaseAuth: isFirebaseConfigured,
};

export function uid() {
  return globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 10);
}
