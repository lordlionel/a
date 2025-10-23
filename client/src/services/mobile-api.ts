import { mobileStorage } from '@/lib/mobile-storage';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType } from "docx";

/**
 * API mobile - remplace les appels HTTP par des opérations locales SQLite
 */

export const mobileApi = {
  // CONSUMERS
  consumers: {
    getAll: async () => {
      return await mobileStorage.getConsumers();
    },
    
    create: async (data: any) => {
      return await mobileStorage.createConsumer(data);
    },
    
    update: async (id: string, data: any) => {
      return await mobileStorage.updateConsumer(id, data);
    },
    
    delete: async (id: string) => {
      await mobileStorage.deleteConsumer(id);
    },
  },

  // PRESENCES
  presences: {
    getByDate: async (date: string) => {
      return await mobileStorage.getPresencesByDate(date);
    },
    
    add: async (data: any) => {
      return await mobileStorage.addPresence(data);
    },
    
    remove: async (id: string) => {
      await mobileStorage.removePresence(id);
    },
    
    clearAll: async () => {
      await mobileStorage.clearAllPresences();
    },
  },

  // CONSUMPTIONS
  consumptions: {
    getByDate: async (date: string) => {
      return await mobileStorage.getConsumptionsByDate(date);
    },
    
    add: async (data: any) => {
      return await mobileStorage.addConsumption(data);
    },
    
    delete: async (id: string) => {
      await mobileStorage.deleteConsumption(id);
    },
    
    clearDaily: async (date: string) => {
      await mobileStorage.clearDailyConsumptions(date);
    },
    
    clearAll: async () => {
      await mobileStorage.clearAllConsumptions();
    },
    
    // Génération de rapport Word en mode mobile
    downloadReport: async (date: string) => {
      try {
        // Récupérer les données
        const consumptions = await mobileStorage.getConsumptionsByDate(date);
        const stats = await mobileStorage.getDailyStats(date);

        // Créer le document Word
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                text: "RAPPORT JOURNALIER - CANTINE",
                heading: "Heading1",
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                text: `Date: ${new Date(date).toLocaleDateString('fr-FR')}`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: "Statistiques du jour:",
                heading: "Heading2",
                spacing: { before: 200, after: 200 },
              }),
              new Paragraph({
                text: `Nombre de consommations: ${stats.dailyConsumptions}`,
              }),
              new Paragraph({
                text: `Recette totale: ${stats.dailyRevenue} F`,
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: "Détail des consommations:",
                heading: "Heading2",
                spacing: { before: 200, after: 200 },
              }),
            ],
          }],
        });

        // Générer le buffer
        const buffer = await Packer.toBuffer(doc);
        
        // Convertir en base64
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        // Sauvegarder le fichier
        const fileName = `rapport_${date}.docx`;
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Documents,
        });

        // Partager le fichier
        await Share.share({
          title: `Rapport du ${date}`,
          text: `Rapport de cantine pour le ${date}`,
          url: result.uri,
          dialogTitle: 'Partager le rapport',
        });

        return { success: true, message: 'Rapport généré et partagé avec succès' };
      } catch (error) {
        console.error('Error generating mobile report:', error);
        throw error;
      }
    },
  },

  // STATISTICS
  statistics: {
    getByDate: async (date: string) => {
      return await mobileStorage.getDailyStats(date);
    },
  },
};
