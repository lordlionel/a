import { storage } from '../server/storage';
import fs from 'fs';
import path from 'path';

/**
 * Script pour exporter toutes les données PostgreSQL vers un fichier JSON
 * Ce fichier sera utilisé pour peupler la base SQLite mobile
 */

async function exportData() {
  try {
    console.log('🔄 Exportation des données pour l\'application mobile...');

    // Récupérer toutes les données
    const [consumers, presences, consumptions] = await Promise.all([
      storage.getConsumers(),
      storage.getAllPresences(),
      storage.getAllConsumptions()
    ]);

    const exportData = {
      consumers,
      presences,
      consumptions,
      exportedAt: new Date().toISOString(),
      totalConsumers: consumers.length,
      totalPresences: presences.length,
      totalConsumptions: consumptions.length
    };

    // Créer le dossier assets s'il n'existe pas
    const assetsDir = path.join(process.cwd(), 'client', 'public', 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Sauvegarder dans le fichier
    const outputPath = path.join(assetsDir, 'seed-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log('✅ Exportation réussie !');
    console.log(`📊 Statistiques:`);
    console.log(`   - ${exportData.totalConsumers} consommateurs`);
    console.log(`   - ${exportData.totalPresences} présences`);
    console.log(`   - ${exportData.totalConsumptions} consommations`);
    console.log(`📁 Fichier créé: ${outputPath}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'exportation:', error);
    throw error;
  }
}

// Exécuter l'export
exportData().then(() => {
  console.log('🎉 Export terminé avec succès !');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Échec de l\'export:', error);
  process.exit(1);
});
