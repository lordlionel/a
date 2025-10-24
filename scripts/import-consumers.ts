import { storage } from '../server/storage';
import fs from 'fs';
import path from 'path';

/**
 * Script pour importer une liste de consommateurs dans la base de données
 */

async function importConsumers() {
  try {
    console.log('📥 Importation des consommateurs...');

    // Lire le fichier contenant les noms
    const filePath = path.join(process.cwd(), 'attached_assets', 'Pasted--AHOUA-ATTIA-AHOMON-ACHI-ALAIN-AHOUSSOU-AKISSI-EDWIVE-AHOUTOU-KOUADIO-RODOLPH-1761266626938_1761266626941.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parser les noms - ils sont entre guillemets et séparés par des virgules
    const namesMatch = fileContent.match(/"([^"]+)"/g);
    if (!namesMatch) {
      throw new Error('Aucun nom trouvé dans le fichier');
    }

    const names = namesMatch.map(name => name.replace(/"/g, '').trim());
    console.log(`📋 ${names.length} noms trouvés dans le fichier`);

    // Départements possibles (vous pouvez les ajuster selon vos besoins)
    const departments = [
      'Production',
      'Maintenance',
      'Qualité',
      'Logistique',
      'Administration',
      'Sécurité',
      'Ressources Humaines'
    ];

    // Importer chaque consommateur
    let imported = 0;
    let skipped = 0;

    for (const name of names) {
      try {
        // Vérifier si le consommateur existe déjà
        const existing = await storage.getConsumers();
        const alreadyExists = existing.some(c => c.name.toLowerCase() === name.toLowerCase());

        if (alreadyExists) {
          console.log(`⏭️  Ignoré (existe déjà): ${name}`);
          skipped++;
          continue;
        }

        // Assigner un département de manière cyclique
        const department = departments[imported % departments.length];

        // Créer le consommateur
        await storage.createConsumer({
          name: name,
          department: department
        });

        imported++;
        console.log(`✅ Importé (${imported}/${names.length}): ${name} - ${department}`);
      } catch (error: any) {
        console.error(`❌ Erreur pour ${name}:`, error.message);
      }
    }

    console.log('\n📊 Résumé de l\'importation:');
    console.log(`   ✅ Importés: ${imported}`);
    console.log(`   ⏭️  Ignorés: ${skipped}`);
    console.log(`   📦 Total: ${names.length}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'importation:', error);
    throw error;
  }
}

// Exécuter l'import
importConsumers().then(() => {
  console.log('\n🎉 Importation terminée avec succès !');
  console.log('\n💡 Prochaine étape: Exécutez "tsx scripts/export-data-for-mobile.ts" pour générer le fichier seed-data.json');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Échec de l\'importation:', error);
  process.exit(1);
});
