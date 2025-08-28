// API locale pour le mode PWA
import { localDB, LocalConsumer, LocalConsumption, LocalPresence } from './localDB';

// Génération d'ID unique
const generateId = () => crypto.randomUUID();

// Date formatée pour les créations
const getCurrentISOString = () => new Date().toISOString();
const getCurrentDateString = () => new Date().toISOString().split('T')[0];

// Interface API locale pour les consommateurs
export const localConsumerAPI = {
  async getAll(): Promise<LocalConsumer[]> {
    await localDB.init();
    return localDB.getAllConsumers();
  },

  async create(data: { name: string; department?: string }): Promise<LocalConsumer> {
    await localDB.init();
    const consumer: LocalConsumer = {
      id: generateId(),
      name: data.name.trim(),
      department: data.department?.trim() || null,
      createdAt: getCurrentISOString()
    };
    
    await localDB.addConsumer(consumer);
    return consumer;
  },

  async update(id: string, data: { name?: string; department?: string }): Promise<LocalConsumer> {
    await localDB.init();
    const consumers = await localDB.getAllConsumers();
    const existing = consumers.find(c => c.id === id);
    
    if (!existing) {
      throw new Error(`Consommateur ${id} non trouvé`);
    }

    const updated: LocalConsumer = {
      ...existing,
      name: data.name?.trim() || existing.name,
      department: data.department?.trim() || existing.department
    };

    await localDB.updateConsumer(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await localDB.init();
    await localDB.deleteConsumer(id);
  }
};

// Interface API locale pour les consommations
export const localConsumptionAPI = {
  async getAll(): Promise<LocalConsumption[]> {
    await localDB.init();
    return localDB.getConsumptions();
  },

  async getByDate(date: string): Promise<LocalConsumption[]> {
    await localDB.init();
    return localDB.getConsumptions(date);
  },

  async create(data: { consumerId: string; amount: number; date?: string }): Promise<LocalConsumption> {
    await localDB.init();
    const consumption: LocalConsumption = {
      id: generateId(),
      consumerId: data.consumerId,
      amount: data.amount,
      date: data.date || getCurrentDateString(),
      createdAt: getCurrentISOString()
    };
    
    await localDB.addConsumption(consumption);
    
    // Retourner avec les données du consommateur
    const consumptions = await localDB.getConsumptions(consumption.date);
    return consumptions.find(c => c.id === consumption.id)!;
  },

  async delete(id: string): Promise<void> {
    await localDB.init();
    await localDB.deleteConsumption(id);
  }
};

// Interface API locale pour les présences
export const localPresenceAPI = {
  async getAll(): Promise<LocalPresence[]> {
    await localDB.init();
    return localDB.getPresences();
  },

  async getByDate(date: string): Promise<LocalPresence[]> {
    await localDB.init();
    return localDB.getPresences(date);
  },

  async create(data: { consumerId: string; date?: string }): Promise<LocalPresence> {
    await localDB.init();
    const presence: LocalPresence = {
      id: generateId(),
      consumerId: data.consumerId,
      date: data.date || getCurrentDateString(),
      createdAt: getCurrentISOString()
    };
    
    await localDB.addPresence(presence);
    
    // Retourner avec les données du consommateur
    const presences = await localDB.getPresences(presence.date);
    return presences.find(p => p.id === presence.id)!;
  },

  async delete(id: string): Promise<void> {
    await localDB.init();
    await localDB.deletePresence(id);
  }
};

// Interface API locale pour les statistiques
export const localStatsAPI = {
  async getConsumptionStats(date: string) {
    await localDB.init();
    return localDB.getStats(date);
  }
};

// Utilitaires pour la gestion des données
export const localDataUtils = {
  async clearAll(): Promise<void> {
    await localDB.init();
    await localDB.clearAll();
  },

  async importData(data: {
    consumers?: LocalConsumer[];
    consumptions?: LocalConsumption[];
    presences?: LocalPresence[];
  }): Promise<void> {
    await localDB.init();

    // Importer les consommateurs
    if (data.consumers) {
      for (const consumer of data.consumers) {
        try {
          await localDB.addConsumer(consumer);
        } catch (error) {
          console.warn('Consommateur déjà existant:', consumer.name);
        }
      }
    }

    // Importer les consommations
    if (data.consumptions) {
      for (const consumption of data.consumptions) {
        try {
          await localDB.addConsumption(consumption);
        } catch (error) {
          console.warn('Consommation déjà existante:', consumption.id);
        }
      }
    }

    // Importer les présences
    if (data.presences) {
      for (const presence of data.presences) {
        try {
          await localDB.addPresence(presence);
        } catch (error) {
          console.warn('Présence déjà existante:', presence.id);
        }
      }
    }

    console.log('✅ Import local terminé');
  },

  async exportData() {
    await localDB.init();
    
    return {
      consumers: await localDB.getAllConsumers(),
      consumptions: await localDB.getConsumptions(),
      presences: await localDB.getPresences()
    };
  }
};