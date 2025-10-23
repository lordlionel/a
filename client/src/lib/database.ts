import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private dbName = 'sitab.db';
  private isInitialized = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if running on native platform
      const platform = Capacitor.getPlatform();
      console.log('Initializing database on platform:', platform);

      // Create or open database
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false,
        'no-encryption',
        1,
        false
      );

      await this.db.open();
      
      // Create tables if they don't exist
      await this.createTables();
      
      // Load initial data if database is empty
      await this.seedDataIfEmpty();
      
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS consumers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS presences (
        id TEXT PRIMARY KEY,
        consumerId TEXT NOT NULL,
        date TEXT NOT NULL,
        isPresent INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (consumerId) REFERENCES consumers(id) ON DELETE CASCADE,
        UNIQUE(consumerId, date)
      );

      CREATE TABLE IF NOT EXISTS consumptions (
        id TEXT PRIMARY KEY,
        consumerId TEXT NOT NULL,
        amount INTEGER NOT NULL,
        date TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (consumerId) REFERENCES consumers(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_presences_date ON presences(date);
      CREATE INDEX IF NOT EXISTS idx_consumptions_date ON consumptions(date);
      CREATE INDEX IF NOT EXISTS idx_consumptions_consumer ON consumptions(consumerId);
    `;

    await this.db.execute(createTablesSQL);
    console.log('Tables created successfully');
  }

  private async seedDataIfEmpty(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if there are any consumers
    const result = await this.db.query('SELECT COUNT(*) as count FROM consumers');
    const count = result.values?.[0]?.count || 0;

    if (count === 0) {
      console.log('Database is empty, loading seed data...');
      // Seed data will be loaded from a JSON file or imported data
      await this.importSeedData();
    }
  }

  private async importSeedData(): Promise<void> {
    // This will be populated with data exported from PostgreSQL
    try {
      const response = await fetch('/assets/seed-data.json');
      if (response.ok) {
        const seedData = await response.json();
        await this.insertSeedData(seedData);
        console.log('Seed data imported successfully');
      }
    } catch (error) {
      console.log('No seed data file found, skipping import');
    }
  }

  private async insertSeedData(seedData: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Insert consumers
    if (seedData.consumers && seedData.consumers.length > 0) {
      for (const consumer of seedData.consumers) {
        await this.db.run(
          'INSERT OR REPLACE INTO consumers (id, name, department, createdAt) VALUES (?, ?, ?, ?)',
          [consumer.id, consumer.name, consumer.department, consumer.createdAt]
        );
      }
    }

    // Insert presences
    if (seedData.presences && seedData.presences.length > 0) {
      for (const presence of seedData.presences) {
        await this.db.run(
          'INSERT OR REPLACE INTO presences (id, consumerId, date, createdAt) VALUES (?, ?, ?, ?)',
          [presence.id, presence.consumerId, presence.date, presence.createdAt]
        );
      }
    }

    // Insert consumptions
    if (seedData.consumptions && seedData.consumptions.length > 0) {
      for (const consumption of seedData.consumptions) {
        await this.db.run(
          'INSERT OR REPLACE INTO consumptions (id, consumerId, amount, date, createdAt) VALUES (?, ?, ?, ?, ?)',
          [consumption.id, consumption.consumerId, consumption.amount, consumption.date, consumption.createdAt]
        );
      }
    }
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      await this.initialize();
    }
    return await this.db!.query(sql, params);
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      await this.initialize();
    }
    return await this.db!.run(sql, params);
  }

  async execute(sql: string): Promise<any> {
    if (!this.db) {
      await this.initialize();
    }
    return await this.db!.execute(sql);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      await this.sqlite.closeConnection(this.dbName, false);
      this.db = null;
      this.isInitialized = false;
    }
  }
}

export const database = new DatabaseService();
