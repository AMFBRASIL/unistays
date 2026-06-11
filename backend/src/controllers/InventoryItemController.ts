import { Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateInventoryItemInput, UpdateInventoryItemInput } from '@/validators/inventoryItem.validator';
import { v4 as uuidv4 } from 'uuid';

interface InventoryItemRow {
  id: number;
  uuid: string;
  property_id: number;
  product_id?: number | null;
  name: string;
  category: string | null;
  sku: string | null;
  barcode?: string | null;
  brand?: string | null;
  description?: string | null;
  model?: string | null;
  image_url?: string | null;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock: number | null;
  reorder_point?: number | null;
  cost_price: number | null;
  selling_price: number | null;
  supplier: string | null;
  location: string | null;
  shelf_position?: string | null;
  notes: string | null;
  temperature_control?: number;
  humidity_control?: number;
  track_batch?: number;
  track_serial?: number;
  expiration_alert?: number;
  expiration_days?: number | null;
  created_at: Date;
  updated_at: Date;
  property_name?: string;
}

function mapRow(row: InventoryItemRow) {
  const current = Number(row.current_stock);
  const min = Number(row.min_stock);
  const max = row.max_stock != null ? Number(row.max_stock) : null;
  let status: 'normal' | 'low' | 'critical' | 'overstock' = 'normal';
  if (max != null && current > max) status = 'overstock';
  else if (current <= 0 || (min > 0 && current < min * 0.5)) status = 'critical';
  else if (min > 0 && current < min) status = 'low';

  return {
    id: String(row.id),
    uuid: row.uuid,
    propertyId: row.property_id,
    productId: row.product_id ?? undefined,
    propertyName: row.property_name ?? undefined,
    name: row.name,
    category: row.category,
    sku: row.sku,
    barcode: row.barcode ?? null,
    brand: row.brand ?? null,
    description: row.description ?? null,
    model: row.model ?? null,
    imageUrl: row.image_url ?? null,
    unit: row.unit,
    currentStock: current,
    minStock: Number(row.min_stock),
    maxStock: max,
    reorderPoint: row.reorder_point != null ? Number(row.reorder_point) : null,
    unitCost: row.cost_price != null ? Number(row.cost_price) : null,
    sellingPrice: row.selling_price != null ? Number(row.selling_price) : null,
    supplier: row.supplier,
    location: row.location,
    shelfPosition: row.shelf_position ?? null,
    notes: row.notes,
    temperatureControl: row.temperature_control === 1,
    humidityControl: row.humidity_control === 1,
    trackBatch: row.track_batch === 1,
    trackSerial: row.track_serial === 1,
    expirationAlert: row.expiration_alert === 1,
    expirationDays: row.expiration_days ?? null,
    status,
    lastPurchase: null as string | null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class InventoryItemController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, propertyId, category } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          i.id, i.uuid, i.property_id, i.product_id,
          COALESCE(prod.name, i.name) as name,
          COALESCE(pc.name, i.category) as category,
          COALESCE(prod.sku, i.sku) as sku,
          i.barcode, i.brand, i.description, i.model, COALESCE(prod.image_url, i.image_url) as image_url,
          COALESCE(mu.symbol, mu.code, i.unit) as unit,
          i.current_stock, i.min_stock, i.max_stock, i.reorder_point,
          COALESCE(i.cost_price, prod.cost_price) as cost_price,
          COALESCE(i.selling_price, prod.sale_price) as selling_price,
          i.supplier, i.location, i.shelf_position, i.notes,
          i.temperature_control, i.humidity_control, i.track_batch, i.track_serial, i.expiration_alert, i.expiration_days,
          i.created_at, i.updated_at,
          p.name as property_name
        FROM inventory_items i
        LEFT JOIN properties p ON p.id = i.property_id AND p.deleted_at IS NULL
        LEFT JOIN products prod ON i.product_id = prod.id
        LEFT JOIN product_categories pc ON prod.category_id = pc.id
        LEFT JOIN measurement_units mu ON prod.primary_unit_id = mu.id
        WHERE i.deleted_at IS NULL
      `;
      const params: (string | number)[] = [];

      if (search && typeof search === 'string') {
        query += ` AND (i.name LIKE ? OR i.sku LIKE ? OR i.category LIKE ?)`;
        const term = `%${search}%`;
        params.push(term, term, term);
      }
      if (propertyId) {
        query += ` AND i.property_id = ?`;
        params.push(Number(propertyId));
      }
      if (category && typeof category === 'string') {
        query += ` AND i.category = ?`;
        params.push(category);
      }

      query += ` ORDER BY i.name ASC`;

      const rows = await queryRunner.query(query, params);
      await queryRunner.release();

      const items = (rows as InventoryItemRow[]).map(mapRow);
      res.json({ success: true, data: { items } });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();
      const rows = await queryRunner.query(
        `SELECT i.id, i.uuid, i.property_id, i.product_id,
          COALESCE(prod.name, i.name) as name,
          COALESCE(pc.name, i.category) as category,
          COALESCE(prod.sku, i.sku) as sku,
          i.barcode, i.brand, i.description, i.model, COALESCE(prod.image_url, i.image_url) as image_url,
          COALESCE(mu.symbol, mu.code, i.unit) as unit,
          i.current_stock, i.min_stock, i.max_stock, i.reorder_point,
          COALESCE(i.cost_price, prod.cost_price) as cost_price,
          COALESCE(i.selling_price, prod.sale_price) as selling_price,
          i.supplier, i.location, i.shelf_position, i.notes,
          i.temperature_control, i.humidity_control, i.track_batch, i.track_serial, i.expiration_alert, i.expiration_days,
          i.created_at, i.updated_at,
          p.name as property_name
         FROM inventory_items i
         LEFT JOIN properties p ON p.id = i.property_id AND p.deleted_at IS NULL
         LEFT JOIN products prod ON i.product_id = prod.id
         LEFT JOIN product_categories pc ON prod.category_id = pc.id
         LEFT JOIN measurement_units mu ON prod.primary_unit_id = mu.id
         WHERE i.id = ? AND i.deleted_at IS NULL`,
        [Number(id)]
      );
      await queryRunner.release();

      if (!rows || rows.length === 0) {
        throw new AppError('Item de estoque não encontrado', 404);
      }
      res.json({ success: true, data: mapRow(rows[0] as InventoryItemRow) });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreateInventoryItemInput;
      const uuid = uuidv4();
      const queryRunner = AppDataSource.createQueryRunner();

      let name = data.name ?? null;
      let category = data.category ?? null;
      let sku = data.sku ?? null;
      let unit = data.unit ?? 'un';
      let imageUrl = data.imageUrl ?? null;
      let costPrice = data.costPrice ?? null;
      let sellingPrice = data.sellingPrice ?? null;
      let productId: number | null = data.productId ?? null;

      if (data.productId != null) {
        const productRows = await queryRunner.query(
          `SELECT prod.id, prod.name, prod.sku, prod.cost_price, prod.sale_price, prod.image_url,
            pc.name as category_name, COALESCE(mu.symbol, mu.code, 'un') as unit_symbol
           FROM products prod
           LEFT JOIN product_categories pc ON prod.category_id = pc.id
           LEFT JOIN measurement_units mu ON prod.primary_unit_id = mu.id
           WHERE prod.id = ?`,
          [data.productId]
        );
        if (!productRows || productRows.length === 0) {
          await queryRunner.release();
          throw new AppError('Produto não encontrado no catálogo', 404);
        }
        const prod = productRows[0] as { name: string; sku: string; cost_price: number; sale_price: number; image_url: string | null; category_name: string | null; unit_symbol: string };
        name = prod.name;
        sku = prod.sku;
        category = prod.category_name ?? null;
        unit = prod.unit_symbol ?? 'un';
        imageUrl = prod.image_url ?? imageUrl;
        costPrice = costPrice ?? (prod.cost_price != null ? Number(prod.cost_price) : null);
        sellingPrice = sellingPrice ?? (prod.sale_price != null ? Number(prod.sale_price) : null);
      } else if (!name || String(name).trim() === '') {
        await queryRunner.release();
        throw new AppError('Informe o produto (productId) ou o nome do item', 400);
      }

      await queryRunner.query(
        `INSERT INTO inventory_items (
          uuid, property_id, product_id, name, category, sku, barcode, brand, description, model, image_url,
          unit, current_stock, min_stock, max_stock, reorder_point,
          cost_price, selling_price, supplier, location, shelf_position, notes,
          temperature_control, humidity_control, track_batch, track_serial, expiration_alert, expiration_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid,
          data.propertyId,
          productId,
          name,
          category,
          sku,
          data.barcode ?? null,
          data.brand ?? null,
          data.description ?? null,
          data.model ?? null,
          imageUrl,
          unit,
          data.currentStock ?? 0,
          data.minStock ?? 0,
          data.maxStock ?? null,
          data.reorderPoint ?? null,
          costPrice,
          sellingPrice,
          data.supplier ?? null,
          data.location ?? null,
          data.shelfPosition ?? null,
          data.notes ?? null,
          data.temperatureControl ? 1 : 0,
          data.humidityControl ? 1 : 0,
          data.trackBatch ? 1 : 0,
          data.trackSerial ? 1 : 0,
          data.expirationAlert ? 1 : 0,
          data.expirationDays ?? null,
        ]
      );

      const [inserted] = await queryRunner.query(
        'SELECT id FROM inventory_items WHERE uuid = ?',
        [uuid]
      );
      await queryRunner.release();

      const row = inserted as InventoryItemRow & { id: number };
      const withProperty = await this.loadOneWithProperty(row.id);
      res.status(201).json({ success: true, data: mapRow(withProperty) });
    } catch (error) {
      next(error);
    }
  }

  private async loadOneWithProperty(id: number): Promise<InventoryItemRow> {
    const queryRunner = AppDataSource.createQueryRunner();
    const rows = await queryRunner.query(
      `SELECT i.id, i.uuid, i.property_id, i.product_id,
        COALESCE(prod.name, i.name) as name,
        COALESCE(pc.name, i.category) as category,
        COALESCE(prod.sku, i.sku) as sku,
        i.barcode, i.brand, i.description, i.model, COALESCE(prod.image_url, i.image_url) as image_url,
        COALESCE(mu.symbol, mu.code, i.unit) as unit,
        i.current_stock, i.min_stock, i.max_stock, i.reorder_point,
        COALESCE(i.cost_price, prod.cost_price) as cost_price,
        COALESCE(i.selling_price, prod.sale_price) as selling_price,
        i.supplier, i.location, i.shelf_position, i.notes,
        i.temperature_control, i.humidity_control, i.track_batch, i.track_serial, i.expiration_alert, i.expiration_days,
        i.created_at, i.updated_at,
        p.name as property_name
       FROM inventory_items i
       LEFT JOIN properties p ON p.id = i.property_id AND p.deleted_at IS NULL
       LEFT JOIN products prod ON i.product_id = prod.id
       LEFT JOIN product_categories pc ON prod.category_id = pc.id
       LEFT JOIN measurement_units mu ON prod.primary_unit_id = mu.id
       WHERE i.id = ? AND i.deleted_at IS NULL`,
      [id]
    );
    await queryRunner.release();
    return rows[0] as InventoryItemRow;
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateInventoryItemInput;
      const queryRunner = AppDataSource.createQueryRunner();

      const [existing] = await queryRunner.query(
        'SELECT id FROM inventory_items WHERE id = ? AND deleted_at IS NULL',
        [Number(id)]
      );
      if (!existing) {
        await queryRunner.release();
        throw new AppError('Item de estoque não encontrado', 404);
      }

      const fields: string[] = [];
      const values: unknown[] = [];

      if (data.propertyId !== undefined) { fields.push('property_id = ?'); values.push(data.propertyId); }
      if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
      if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
      if (data.sku !== undefined) { fields.push('sku = ?'); values.push(data.sku); }
      if (data.barcode !== undefined) { fields.push('barcode = ?'); values.push(data.barcode); }
      if (data.brand !== undefined) { fields.push('brand = ?'); values.push(data.brand); }
      if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
      if (data.model !== undefined) { fields.push('model = ?'); values.push(data.model); }
      if (data.imageUrl !== undefined) { fields.push('image_url = ?'); values.push(data.imageUrl); }
      if (data.unit !== undefined) { fields.push('unit = ?'); values.push(data.unit); }
      if (data.currentStock !== undefined) { fields.push('current_stock = ?'); values.push(data.currentStock); }
      if (data.minStock !== undefined) { fields.push('min_stock = ?'); values.push(data.minStock); }
      if (data.maxStock !== undefined) { fields.push('max_stock = ?'); values.push(data.maxStock); }
      if (data.reorderPoint !== undefined) { fields.push('reorder_point = ?'); values.push(data.reorderPoint); }
      if (data.costPrice !== undefined) { fields.push('cost_price = ?'); values.push(data.costPrice); }
      if (data.sellingPrice !== undefined) { fields.push('selling_price = ?'); values.push(data.sellingPrice); }
      if (data.supplier !== undefined) { fields.push('supplier = ?'); values.push(data.supplier); }
      if (data.location !== undefined) { fields.push('location = ?'); values.push(data.location); }
      if (data.shelfPosition !== undefined) { fields.push('shelf_position = ?'); values.push(data.shelfPosition); }
      if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }
      if (data.temperatureControl !== undefined) { fields.push('temperature_control = ?'); values.push(data.temperatureControl ? 1 : 0); }
      if (data.humidityControl !== undefined) { fields.push('humidity_control = ?'); values.push(data.humidityControl ? 1 : 0); }
      if (data.trackBatch !== undefined) { fields.push('track_batch = ?'); values.push(data.trackBatch ? 1 : 0); }
      if (data.trackSerial !== undefined) { fields.push('track_serial = ?'); values.push(data.trackSerial ? 1 : 0); }
      if (data.expirationAlert !== undefined) { fields.push('expiration_alert = ?'); values.push(data.expirationAlert ? 1 : 0); }
      if (data.expirationDays !== undefined) { fields.push('expiration_days = ?'); values.push(data.expirationDays); }

      if (fields.length > 0) {
        values.push(id);
        await queryRunner.query(
          `UPDATE inventory_items SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
          values
        );
      }
      await queryRunner.release();

      const updated = await this.loadOneWithProperty(Number(id));
      res.json({ success: true, data: mapRow(updated) });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();
      const [existing] = await queryRunner.query(
        'SELECT id FROM inventory_items WHERE id = ? AND deleted_at IS NULL',
        [Number(id)]
      );
      if (!existing) {
        await queryRunner.release();
        throw new AppError('Item de estoque não encontrado', 404);
      }
      await queryRunner.query('UPDATE inventory_items SET deleted_at = NOW() WHERE id = ?', [id]);
      await queryRunner.release();
      res.json({ success: true, message: 'Item removido com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}
