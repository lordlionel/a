// Wrapper API qui bascule entre mode local et en ligne
import { apiRequest } from "@/lib/queryClient";
import { useLocalMode } from "@/lib/localDB";
import { localConsumerAPI, localConsumptionAPI, localPresenceAPI, localStatsAPI } from "@/lib/localApi";
import type { 
  Consumer, 
  InsertConsumer, 
  ConsumerWithPresence, 
  ConsumptionWithConsumer,
  InsertConsumption 
} from "@shared/schema";

const API_BASE = process.env.NODE_ENV === 'production' ? '' : '';

// API en ligne (originale)
const onlineAPI = {
  // Consumers
  consumers: {
    getAll: (): Promise<Consumer[]> =>
      fetch(`${API_BASE}/api/consommateurs`).then(res => res.json()),
    
    create: (consumer: InsertConsumer): Promise<Consumer> =>
      apiRequest("POST", `${API_BASE}/api/consommateurs`, consumer).then(res => res.json()),
    
    delete: (id: string): Promise<void> =>
      apiRequest("DELETE", `${API_BASE}/api/consommateurs/${id}`).then(() => {}),
  },

  // Presences
  presences: {
    getByDate: (date: string): Promise<ConsumerWithPresence[]> =>
      fetch(`${API_BASE}/api/presences/${date}`).then(res => res.json()),
    
    mark: (presence: { consumerId: string; date: string; isPresent: boolean }): Promise<void> =>
      apiRequest("POST", `${API_BASE}/api/presences`, presence).then(() => {}),
  },

  // Consumptions
  consumptions: {
    getByDate: (date?: string): Promise<ConsumptionWithConsumer[]> => {
      const url = date ? `${API_BASE}/api/consommations?date=${date}` : `${API_BASE}/api/consommations`;
      return fetch(url).then(res => res.json());
    },
    
    create: (consumption: InsertConsumption): Promise<void> =>
      apiRequest("POST", `${API_BASE}/api/consommations`, consumption).then(() => {}),
    
    delete: (id: string): Promise<void> =>
      apiRequest("DELETE", `${API_BASE}/api/consommations/${id}`).then(() => {}),
  },

  // Statistics
  statistics: {
    getDaily: (date?: string): Promise<{
      totalConsumers: number;
      presentToday: number;
      dailyConsumptions: number;
      dailyRevenue: number;
    }> => {
      const url = date ? `${API_BASE}/api/statistics?date=${date}` : `${API_BASE}/api/statistics`;
      return fetch(url).then(res => res.json());
    },
  },

  // Reports
  reports: {
    downloadDaily: (date?: string): Promise<void> => {
      const url = date ? `${API_BASE}/api/rapport/journalier?date=${date}` : `${API_BASE}/api/rapport/journalier`;
      return fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Erreur lors du téléchargement');
          return response.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Rapport_Journalier_${date || new Date().toISOString().split('T')[0]}.docx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        });
    },
  },
};

// Fonction pour vérifier le mode
const isLocalMode = () => {
  return !navigator.onLine || localStorage.getItem('pwa-local-mode') === 'true';
};

// Date actuelle formatée
const getCurrentDateString = () => new Date().toISOString().split('T')[0];

// API wrapper qui bascule automatiquement
export const api = {
  // Consumers
  consumers: {
    getAll: async (): Promise<Consumer[]> => {
      if (isLocalMode()) {
        const localConsumers = await localConsumerAPI.getAll();
        return localConsumers.map(c => ({
          ...c,
          createdAt: c.createdAt ? new Date(c.createdAt) : null
        }));
      }
      return onlineAPI.consumers.getAll();
    },
    
    create: async (consumer: InsertConsumer): Promise<Consumer> => {
      if (isLocalMode()) {
        const created = await localConsumerAPI.create({
          ...consumer,
          department: consumer.department || undefined
        });
        return {
          ...created,
          createdAt: created.createdAt ? new Date(created.createdAt) : null
        };
      }
      return onlineAPI.consumers.create(consumer);
    },
    
    delete: async (id: string): Promise<void> => {
      if (isLocalMode()) {
        return localConsumerAPI.delete(id);
      }
      return onlineAPI.consumers.delete(id);
    },
  },

  // Presences - Adaptation pour le mode local
  presences: {
    getByDate: async (date: string): Promise<ConsumerWithPresence[]> => {
      if (isLocalMode()) {
        const [consumers, presences] = await Promise.all([
          localConsumerAPI.getAll(),
          localPresenceAPI.getByDate(date)
        ]);
        
        return consumers.map(consumer => ({
          ...consumer,
          createdAt: consumer.createdAt ? new Date(consumer.createdAt) : null,
          isPresent: presences.some(p => p.consumerId === consumer.id)
        }));
      }
      return onlineAPI.presences.getByDate(date);
    },
    
    mark: async (presence: { consumerId: string; date: string; isPresent: boolean }): Promise<void> => {
      if (isLocalMode()) {
        if (presence.isPresent) {
          await localPresenceAPI.create({ 
            consumerId: presence.consumerId, 
            date: presence.date 
          });
        } else {
          const presences = await localPresenceAPI.getByDate(presence.date);
          const existingPresence = presences.find(p => p.consumerId === presence.consumerId);
          if (existingPresence) {
            await localPresenceAPI.delete(existingPresence.id);
          }
        }
        return;
      }
      return onlineAPI.presences.mark(presence);
    },
  },

  // Consumptions
  consumptions: {
    getByDate: async (date?: string): Promise<ConsumptionWithConsumer[]> => {
      if (isLocalMode()) {
        const localConsumptions = date 
          ? await localConsumptionAPI.getByDate(date)
          : await localConsumptionAPI.getAll();
        
        return localConsumptions.map(c => ({
          ...c,
          createdAt: c.createdAt ? new Date(c.createdAt) : null,
          consumer: c.consumer ? {
            ...c.consumer,
            createdAt: c.consumer.createdAt ? new Date(c.consumer.createdAt) : null
          } : undefined
        }));
      }
      return onlineAPI.consumptions.getByDate(date);
    },
    
    create: async (consumption: InsertConsumption): Promise<void> => {
      if (isLocalMode()) {
        await localConsumptionAPI.create(consumption);
        return;
      }
      return onlineAPI.consumptions.create(consumption);
    },
    
    delete: async (id: string): Promise<void> => {
      if (isLocalMode()) {
        return localConsumptionAPI.delete(id);
      }
      return onlineAPI.consumptions.delete(id);
    },
  },

  // Statistics
  statistics: {
    getDaily: async (date?: string): Promise<{
      totalConsumers: number;
      presentToday: number;
      dailyConsumptions: number;
      dailyRevenue: number;
    }> => {
      if (isLocalMode()) {
        const targetDate = date || getCurrentDateString();
        const [consumers, presences, consumptions] = await Promise.all([
          localConsumerAPI.getAll(),
          localPresenceAPI.getByDate(targetDate),
          localConsumptionAPI.getByDate(targetDate)
        ]);

        return {
          totalConsumers: consumers.length,
          presentToday: presences.length,
          dailyConsumptions: consumptions.length,
          dailyRevenue: consumptions.reduce((sum, c) => sum + c.amount, 0)
        };
      }
      return onlineAPI.statistics.getDaily(date);
    },
  },

  // Reports - Mode local non supporté, utilise les données locales pour générer un rapport simple
  reports: {
    downloadDaily: async (date?: string): Promise<void> => {
      if (isLocalMode()) {
        // En mode local, générer un rapport simple en JSON
        const targetDate = date || getCurrentDateString();
        const [consumptions, stats] = await Promise.all([
          localConsumptionAPI.getByDate(targetDate),
          localStatsAPI.getConsumptionStats(targetDate)
        ]);

        const reportData = {
          date: targetDate,
          consumptions,
          stats,
          mode: 'local'
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], 
          { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Rapport_Local_${targetDate}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
      return onlineAPI.reports.downloadDaily(date);
    },
  },
};