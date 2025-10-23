import { database } from './database';
import { nanoid } from 'nanoid';
import type { 
  Consumer, 
  Presence, 
  Consumption,
  InsertConsumer,
  InsertPresence,
  InsertConsumption
} from '@shared/schema';

/**
 * Couche de stockage mobile utilisant SQLite local
 * Remplace les appels API par des requêtes SQLite directes
 */

export class MobileStorage {
  // CONSUMERS
  async getConsumers(): Promise<Consumer[]> {
    const result = await database.query('SELECT * FROM consumers ORDER BY name ASC');
    return result.values || [];
  }

  async getConsumer(id: string): Promise<Consumer | null> {
    const result = await database.query('SELECT * FROM consumers WHERE id = ?', [id]);
    return result.values?.[0] || null;
  }

  async createConsumer(data: InsertConsumer): Promise<Consumer> {
    const id = nanoid();
    const createdAt = new Date().toISOString();
    
    await database.run(
      'INSERT INTO consumers (id, name, department, createdAt) VALUES (?, ?, ?, ?)',
      [id, data.name, data.department || null, createdAt]
    );

    return {
      id,
      name: data.name,
      department: data.department || null,
      createdAt: new Date(createdAt)
    };
  }

  async updateConsumer(id: string, data: Partial<InsertConsumer>): Promise<Consumer> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.department !== undefined) {
      updates.push('department = ?');
      params.push(data.department);
    }

    if (updates.length > 0) {
      params.push(id);
      await database.run(
        `UPDATE consumers SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    const consumer = await this.getConsumer(id);
    if (!consumer) throw new Error('Consumer not found after update');
    return consumer;
  }

  async deleteConsumer(id: string): Promise<void> {
    await database.run('DELETE FROM consumers WHERE id = ?', [id]);
  }

  // PRESENCES
  async getPresencesByDate(date: string): Promise<(Presence & { consumer: Consumer })[]> {
    const result = await database.query(
      `SELECT 
        p.id, p.consumerId, p.date, p.isPresent, p.createdAt,
        c.id as consumer_id, c.name as consumer_name, c.department as consumer_department, c.createdAt as consumer_createdAt
      FROM presences p
      JOIN consumers c ON p.consumerId = c.id
      WHERE p.date = ?
      ORDER BY c.name ASC`,
      [date]
    );

    return (result.values || []).map((row: any) => ({
      id: row.id,
      consumerId: row.consumerId,
      date: row.date,
      isPresent: row.isPresent === 1 || row.isPresent === true,
      createdAt: row.createdAt,
      consumer: {
        id: row.consumer_id,
        name: row.consumer_name,
        department: row.consumer_department,
        createdAt: row.consumer_createdAt
      }
    }));
  }

  async addPresence(data: InsertPresence): Promise<Presence> {
    const id = nanoid();
    const createdAt = new Date().toISOString();
    const isPresentValue = data.isPresent !== false ? 1 : 0;

    try {
      // Check if presence already exists
      const existing = await database.query(
        'SELECT * FROM presences WHERE consumerId = ? AND date = ?',
        [data.consumerId, data.date]
      );

      if (existing.values && existing.values.length > 0) {
        // If isPresent is false, delete the record
        if (data.isPresent === false) {
          await database.run(
            'DELETE FROM presences WHERE consumerId = ? AND date = ?',
            [data.consumerId, data.date]
          );
          return {
            id: existing.values[0].id,
            consumerId: data.consumerId,
            date: data.date,
            isPresent: false,
            createdAt: new Date(existing.values[0].createdAt)
          };
        }
        
        // Update existing
        await database.run(
          'UPDATE presences SET isPresent = ? WHERE consumerId = ? AND date = ?',
          [isPresentValue, data.consumerId, data.date]
        );
        
        return {
          id: existing.values[0].id,
          consumerId: data.consumerId,
          date: data.date,
          isPresent: data.isPresent !== false,
          createdAt: new Date(existing.values[0].createdAt)
        };
      }

      // Create new presence record
      await database.run(
        'INSERT INTO presences (id, consumerId, date, isPresent, createdAt) VALUES (?, ?, ?, ?, ?)',
        [id, data.consumerId, data.date, isPresentValue, createdAt]
      );

      return {
        id,
        consumerId: data.consumerId,
        date: data.date,
        isPresent: data.isPresent !== false,
        createdAt: new Date(createdAt)
      };
    } catch (error: any) {
      console.error('Error adding presence:', error);
      throw error;
    }
  }

  async removePresence(id: string): Promise<void> {
    await database.run('DELETE FROM presences WHERE id = ?', [id]);
  }

  async getAllPresences(): Promise<Presence[]> {
    const result = await database.query('SELECT * FROM presences ORDER BY date DESC');
    return result.values || [];
  }

  async clearAllPresences(): Promise<void> {
    await database.run('DELETE FROM presences');
  }

  // CONSUMPTIONS
  async getConsumptionsByDate(date: string): Promise<(Consumption & { consumer: Consumer })[]> {
    const result = await database.query(
      `SELECT 
        co.id, co.consumerId, co.amount, co.date, co.createdAt,
        c.id as consumer_id, c.name as consumer_name, c.department as consumer_department, c.createdAt as consumer_createdAt
      FROM consumptions co
      JOIN consumers c ON co.consumerId = c.id
      WHERE co.date = ?
      ORDER BY co.createdAt DESC`,
      [date]
    );

    return (result.values || []).map((row: any) => ({
      id: row.id,
      consumerId: row.consumerId,
      amount: row.amount,
      date: row.date,
      createdAt: row.createdAt,
      consumer: {
        id: row.consumer_id,
        name: row.consumer_name,
        department: row.consumer_department,
        createdAt: row.consumer_createdAt
      }
    }));
  }

  async addConsumption(data: InsertConsumption): Promise<Consumption> {
    const id = nanoid();
    const createdAt = new Date().toISOString();

    await database.run(
      'INSERT INTO consumptions (id, consumerId, amount, date, createdAt) VALUES (?, ?, ?, ?, ?)',
      [id, data.consumerId, data.amount, data.date, createdAt]
    );

    return {
      id,
      consumerId: data.consumerId,
      amount: data.amount,
      date: data.date,
      createdAt: new Date(createdAt)
    };
  }

  async deleteConsumption(id: string): Promise<void> {
    await database.run('DELETE FROM consumptions WHERE id = ?', [id]);
  }

  async getAllConsumptions(): Promise<Consumption[]> {
    const result = await database.query('SELECT * FROM consumptions ORDER BY date DESC');
    return result.values || [];
  }

  async clearDailyConsumptions(date: string): Promise<void> {
    await database.run('DELETE FROM consumptions WHERE date = ?', [date]);
  }

  async clearAllConsumptions(): Promise<void> {
    await database.run('DELETE FROM consumptions');
  }

  // STATISTICS
  async getDailyStats(date: string): Promise<{
    totalConsumers: number;
    presentToday: number;
    dailyConsumptions: number;
    dailyRevenue: number;
  }> {
    const [consumersResult, presencesResult, consumptionsResult] = await Promise.all([
      database.query('SELECT COUNT(*) as count FROM consumers'),
      database.query('SELECT COUNT(*) as count FROM presences WHERE date = ?', [date]),
      database.query('SELECT COUNT(*) as count, SUM(amount) as total FROM consumptions WHERE date = ?', [date])
    ]);

    return {
      totalConsumers: consumersResult.values?.[0]?.count || 0,
      presentToday: presencesResult.values?.[0]?.count || 0,
      dailyConsumptions: consumptionsResult.values?.[0]?.count || 0,
      dailyRevenue: consumptionsResult.values?.[0]?.total || 0
    };
  }
}

export const mobileStorage = new MobileStorage();
