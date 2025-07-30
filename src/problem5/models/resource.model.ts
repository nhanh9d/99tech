import { runQuery, getQuery, allQuery } from '../database/connection';
import { Resource, ResourceFilters } from '../types/resource.types';

export class ResourceModel {
  static async create(
    resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>
  ): Promise<number> {
    const { name, description, category, price, quantity } = resource;

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO resources (name, description, category, price, quantity)
        VALUES (?, ?, ?, ?, ?)
      `;

      runQuery(sql, [name, description, category, price, quantity])
        .then(() => {
          // Get the last inserted ID
          getQuery<{ id: number }>('SELECT last_insert_rowid() as id')
            .then((result) => resolve(result?.id || 0))
            .catch(reject);
        })
        .catch(reject);
    });
  }

  static async findAll(filters: ResourceFilters = {}): Promise<Resource[]> {
    let sql = 'SELECT * FROM resources WHERE 1=1';
    const params: any[] = [];

    if (filters.name) {
      sql += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.min_price !== undefined) {
      sql += ' AND price >= ?';
      params.push(filters.min_price);
    }

    if (filters.max_price !== undefined) {
      sql += ' AND price <= ?';
      params.push(filters.max_price);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }

    return allQuery<Resource>(sql, params);
  }

  static async findById(id: number): Promise<Resource | undefined> {
    const sql = 'SELECT * FROM resources WHERE id = ?';
    return getQuery<Resource>(sql, [id]);
  }

  static async update(
    id: number,
    updates: Partial<Omit<Resource, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> {
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }

    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }

    if (updates.price !== undefined) {
      fields.push('price = ?');
      values.push(updates.price);
    }

    if (updates.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(updates.quantity);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const sql = `UPDATE resources SET ${fields.join(', ')} WHERE id = ?`;

    try {
      const result = await runQuery(sql, values);
      return result.changes > 0;
    } catch (_error) {
      return false;
    }
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM resources WHERE id = ?';

    try {
      await runQuery(sql, [id]);
      return true;
    } catch (_error) {
      return false;
    }
  }
}
