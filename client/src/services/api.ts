import { apiRequest } from "@/lib/queryClient";
import { isNative } from "@/lib/platform";
import { mobileApi } from "./mobile-api";
import type { 
  Consumer, 
  InsertConsumer, 
  ConsumerWithPresence, 
  ConsumptionWithConsumer,
  InsertConsumption 
} from "@shared/schema";

const API_BASE = process.env.NODE_ENV === 'production' ? '' : '';

// API Web (HTTP)
const webApi = {
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
    clearDailyConsumptions: (date?: string): Promise<{ message: string; cleared: number; remaining: number }> => {
      const url = date ? `${API_BASE}/api/clear-daily-consumptions?date=${date}` : `${API_BASE}/api/clear-daily-consumptions`;
      return apiRequest("DELETE", url).then(res => {
        return res.json();
      });
    },
  },
};

// API qui s'adapte automatiquement entre mode web et mobile
function createAdaptiveApi() {
  // Si on est en mode natif (mobile), utiliser l'API locale SQLite
  if (isNative()) {
    return {
      consumers: {
        getAll: () => mobileApi.consumers.getAll(),
        create: (data: InsertConsumer) => mobileApi.consumers.create(data),
        delete: (id: string) => mobileApi.consumers.delete(id),
      },
      presences: {
        getByDate: (date: string) => mobileApi.presences.getByDate(date),
        mark: (data: { consumerId: string; date: string; isPresent: boolean }) => 
          mobileApi.presences.add(data),
      },
      consumptions: {
        getByDate: (date?: string) => 
          mobileApi.consumptions.getByDate(date || new Date().toISOString().split('T')[0]),
        create: (data: InsertConsumption) => mobileApi.consumptions.add(data),
        delete: (id: string) => mobileApi.consumptions.delete(id),
      },
      statistics: {
        getDaily: (date?: string) => 
          mobileApi.statistics.getByDate(date || new Date().toISOString().split('T')[0]),
      },
      reports: {
        downloadDaily: (date?: string) => 
          mobileApi.consumptions.downloadReport(date || new Date().toISOString().split('T')[0]),
        clearDailyConsumptions: (date?: string) => 
          mobileApi.consumptions.clearDaily(date || new Date().toISOString().split('T')[0])
            .then(() => ({ message: 'Supprimé', cleared: 0, remaining: 0 })),
      },
    };
  }
  
  // Mode web - utiliser les appels HTTP normaux
  return webApi;
}

// Export de l'API adaptative
export const api = createAdaptiveApi();
