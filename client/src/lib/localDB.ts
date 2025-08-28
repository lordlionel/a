// Base de données locale IndexedDB pour SITAB PWA
export interface LocalConsumer {
  id: string;
  name: string;
  department: string | null;
  createdAt: string;
}

export interface LocalConsumption {
  id: string;
  consumerId: string;
  amount: number;
  date: string;
  createdAt: string;
  consumer?: LocalConsumer;
}

export interface LocalPresence {
  id: string;
  consumerId: string;
  date: string;
  createdAt: string;
  consumer?: LocalConsumer;
}

class LocalDatabase {
  private dbName = 'sitab-pwa-db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Erreur ouverture IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Base de données locale initialisée');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store pour les consommateurs
        if (!db.objectStoreNames.contains('consumers')) {
          const consumerStore = db.createObjectStore('consumers', { keyPath: 'id' });
          consumerStore.createIndex('name', 'name', { unique: false });
          consumerStore.createIndex('department', 'department', { unique: false });
        }

        // Store pour les consommations
        if (!db.objectStoreNames.contains('consumptions')) {
          const consumptionStore = db.createObjectStore('consumptions', { keyPath: 'id' });
          consumptionStore.createIndex('consumerId', 'consumerId', { unique: false });
          consumptionStore.createIndex('date', 'date', { unique: false });
        }

        // Store pour les présences
        if (!db.objectStoreNames.contains('presences')) {
          const presenceStore = db.createObjectStore('presences', { keyPath: 'id' });
          presenceStore.createIndex('consumerId', 'consumerId', { unique: false });
          presenceStore.createIndex('date', 'date', { unique: false });
        }

        console.log('🔧 Schéma de base de données locale créé');
      };
    });
  }

  // Méthodes pour les consommateurs
  async addConsumer(consumer: LocalConsumer): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['consumers'], 'readwrite');
      const store = transaction.objectStore('consumers');
      const request = store.add(consumer);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllConsumers(): Promise<LocalConsumer[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['consumers'], 'readonly');
      const store = transaction.objectStore('consumers');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateConsumer(consumer: LocalConsumer): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['consumers'], 'readwrite');
      const store = transaction.objectStore('consumers');
      const request = store.put(consumer);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteConsumer(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['consumers'], 'readwrite');
      const store = transaction.objectStore('consumers');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Méthodes pour les consommations
  async addConsumption(consumption: LocalConsumption): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['consumptions'], 'readwrite');
      const store = transaction.objectStore('consumptions');
      const request = store.add(consumption);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getConsumptions(date?: string): Promise<LocalConsumption[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['consumptions', 'consumers'], 'readonly');
      const consumptionStore = transaction.objectStore('consumptions');
      const consumerStore = transaction.objectStore('consumers');
      
      let request: IDBRequest;
      if (date) {
        const index = consumptionStore.index('date');
        request = index.getAll(date);
      } else {
        request = consumptionStore.getAll();
      }

      request.onsuccess = async () => {
        const consumptions = request.result as LocalConsumption[];
        
        // Enrichir avec les données des consommateurs
        const enrichedConsumptions = await Promise.all(
          consumptions.map(async (consumption) => {
            const consumerRequest = consumerStore.get(consumption.consumerId);
            return new Promise<LocalConsumption>((resolve) => {
              consumerRequest.onsuccess = () => {
                resolve({
                  ...consumption,
                  consumer: consumerRequest.result
                });
              };
            });
          })
        );

        resolve(enrichedConsumptions);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async deleteConsumption(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['consumptions'], 'readwrite');
      const store = transaction.objectStore('consumptions');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Méthodes pour les présences
  async addPresence(presence: LocalPresence): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['presences'], 'readwrite');
      const store = transaction.objectStore('presences');
      const request = store.add(presence);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPresences(date?: string): Promise<LocalPresence[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['presences', 'consumers'], 'readonly');
      const presenceStore = transaction.objectStore('presences');
      const consumerStore = transaction.objectStore('consumers');
      
      let request: IDBRequest;
      if (date) {
        const index = presenceStore.index('date');
        request = index.getAll(date);
      } else {
        request = presenceStore.getAll();
      }

      request.onsuccess = async () => {
        const presences = request.result as LocalPresence[];
        
        // Enrichir avec les données des consommateurs
        const enrichedPresences = await Promise.all(
          presences.map(async (presence) => {
            const consumerRequest = consumerStore.get(presence.consumerId);
            return new Promise<LocalPresence>((resolve) => {
              consumerRequest.onsuccess = () => {
                resolve({
                  ...presence,
                  consumer: consumerRequest.result
                });
              };
            });
          })
        );

        resolve(enrichedPresences);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async deletePresence(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['presences'], 'readwrite');
      const store = transaction.objectStore('presences');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Utilitaires
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    const stores = ['consumers', 'consumptions', 'presences'];
    const transaction = this.db!.transaction(stores, 'readwrite');
    
    const promises = stores.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
    console.log('🗑️ Base de données locale vidée');
  }

  async getStats(date: string): Promise<{total: number, count700: number, count1000: number}> {
    const consumptions = await this.getConsumptions(date);
    
    return {
      total: consumptions.reduce((sum, c) => sum + c.amount, 0),
      count700: consumptions.filter(c => c.amount === 700).length,
      count1000: consumptions.filter(c => c.amount === 1000).length
    };
  }
}

// Singleton de la base de données locale
export const localDB = new LocalDatabase();

// Hook pour vérifier si on est en mode local
export const useLocalMode = () => {
  return !navigator.onLine || localStorage.getItem('pwa-local-mode') === 'true';
};

// Fonction pour basculer en mode local
export const enableLocalMode = () => {
  localStorage.setItem('pwa-local-mode', 'true');
  window.location.reload();
};

// Fonction pour basculer en mode en ligne
export const disableLocalMode = () => {
  localStorage.setItem('pwa-local-mode', 'false');
  window.location.reload();
};