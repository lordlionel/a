import { database } from './database';
import { isNative } from './platform';

/**
 * Initialise la base de données mobile au démarrage de l'application
 */
export async function initializeMobileApp(): Promise<void> {
  if (isNative()) {
    try {
      console.log('🚀 Initialisation de l\'application mobile...');
      await database.initialize();
      console.log('✅ Application mobile initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation mobile:', error);
      throw error;
    }
  } else {
    console.log('🌐 Mode web - pas d\'initialisation mobile nécessaire');
  }
}
