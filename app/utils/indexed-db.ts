// app/utils/indexed-db.ts
"use client";

import { base64ToBlob } from "./image";
import type { StoredImage, ImageRecord } from "../types/types";

class IndexedDBStore<T extends { id: string }> {
  constructor(
    private dbName: string,
    private version: number,
    private storeName: string
  ) {}

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);
      req.onerror = () => reject(new Error("IDB open failed"));
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName))
          db.createObjectStore(this.storeName, { keyPath: "id" });
      };
    });
  }

  private async transaction<R>(
    mode: IDBTransactionMode,
    cb: (store: IDBObjectStore) => IDBRequest<R>
  ): Promise<R> {
    const db = await this.openDB();
    const tx = db.transaction([this.storeName], mode);
    const store = tx.objectStore(this.storeName);
    const req = cb(store);
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  }

  async put(item: T) {
    await this.transaction("readwrite", (s) => s.put(item));
  }
  async get(id: string) {
    return this.transaction("readonly", (s) => s.get(id));
  }
  async getAll() {
    return this.transaction("readonly", (s) => s.getAll());
  }
  async delete(id: string) {
    await this.transaction("readwrite", (s) => s.delete(id));
  }
  async clear() {
    await this.transaction("readwrite", (s) => s.clear());
  }
}

const store = new IndexedDBStore<StoredImage>("ImageEditorDB", 1, "images");

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
  });
}

export const imageDB = {
  async saveImage(rec: ImageRecord) {
    const fileData = await fileToBase64(rec.file);
    await store.put({
      id: rec.id,
      name: rec.file.name,
      type: rec.file.type,
      fileData,
      width: rec.width,
      height: rec.height,
      lastModified: rec.file.lastModified,
      metadata: rec.metadata,
    });
  },
  async getAllImages() {
    const stored = await store.getAll();
    return stored.map((s) => {
      const blob = base64ToBlob(s.fileData, s.type);
      return {
        id: s.id,
        file: new File([blob], s.name, { type: s.type }),
        url: URL.createObjectURL(blob),
        width: s.width,
        height: s.height,
        metadata: s.metadata,
      };
    });
  },
  async getImageById(id: string) {
    const s = await store.get(id);
    if (!s) return null;
    const blob = base64ToBlob(s.fileData, s.type);
    return {
      id: s.id,
      file: new File([blob], s.name, { type: s.type }),
      url: URL.createObjectURL(blob),
      width: s.width,
      height: s.height,
      metadata: s.metadata,
    };
  },
  async deleteImage(id: string) {
    await store.delete(id);
  },
  async deleteAllImages() {
    await store.clear();
  },
};
