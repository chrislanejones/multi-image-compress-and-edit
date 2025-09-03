import type { ImageFile } from '../types/types';
import { base64ToBlob } from './format';

// Simple image cache using IndexedDB - much cleaner approach
class SimpleImageCache {
  private dbName = 'ImageHorse-Cache';
  private version = 1;
  private storeName = 'images';
  
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async saveImage(image: ImageFile): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const fileData = await this.fileToBase64(image.file);
      
      const data = {
        id: image.id,
        name: image.name,
        type: image.file.type,
        fileData,
        size: image.size,
        width: image.width,
        height: image.height,
        metadata: image.metadata,
      };
      
      store.put(data);
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.warn('Failed to cache image:', error);
    }
  }

  async getImage(id: string): Promise<ImageFile | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const data = request.result;
          if (data) {
            try {
              const blob = base64ToBlob(data.fileData, data.type);
              const file = new File([blob], data.name, { type: data.type });
              
              resolve({
                id: data.id,
                file,
                url: URL.createObjectURL(blob),
                name: data.name,
                size: data.size,
                width: data.width,
                height: data.height,
                metadata: data.metadata,
              });
            } catch (error) {
              console.warn('Failed to restore image:', error);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
      });
    } catch (error) {
      console.warn('Failed to get cached image:', error);
      return null;
    }
  }

  async getAllImages(): Promise<ImageFile[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const results = request.result;
          const images: ImageFile[] = [];
          
          for (const data of results) {
            try {
              const blob = base64ToBlob(data.fileData, data.type);
              const file = new File([blob], data.name, { type: data.type });
              
              images.push({
                id: data.id,
                file,
                url: URL.createObjectURL(blob),
                name: data.name,
                size: data.size,
                width: data.width,
                height: data.height,
                metadata: data.metadata,
              });
            } catch (error) {
              console.warn(`Failed to restore image ${data.name}:`, error);
            }
          }
          
          resolve(images);
        };
        
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
      });
    } catch (error) {
      console.warn('Failed to get all cached images:', error);
      return [];
    }
  }

  async deleteImage(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      store.delete(id);
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.warn('Failed to delete cached image:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      store.clear();
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.warn('Failed to clear image cache:', error);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }
}

export const imageCache = new SimpleImageCache();