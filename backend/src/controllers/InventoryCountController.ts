import { Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateInventoryCountInput } from '@/validators/inventoryCount.validator';
import { v4 as uuidv4 } from 'uuid';

export class InventoryCountController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId, limit } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      const baseSelect = `
        c.id, c.uuid, c.property_id, c.name, c.protocol, c.responsible_user_name as responsible, c.notes, c.blind_count, c.created_by, c.created_at,
        c.status, c.total_items, c.counted_items, c.divergent_items, c.adjusted_items, c.accuracy_percentage,
        p.name as property_name, p.type as property_type
      `;
      const whereClause = propertyId ? ` AND c.property_id = ?` : '';
      const params: (string | number)[] = propertyId ? [Number(propertyId)] : [];
      const orderLimit = ` ORDER BY c.created_at DESC LIMIT ${Math.min(Number(limit) || 100, 500)}`;

      let rows: any[];
      try {
        const queryWithCount = `
          SELECT ${baseSelect},
            (SELECT COUNT(*) FROM inventory_movements m WHERE m.inventory_count_id = c.id) as movements_count
          FROM inventory_counts c
          JOIN properties p ON p.id = c.property_id AND p.deleted_at IS NULL
          WHERE 1=1 ${whereClause} ${orderLimit}
        `;
        rows = await queryRunner.query(queryWithCount, params);
      } catch (subErr: unknown) {
        const msg = subErr instanceof Error ? subErr.message : String(subErr);
        if (msg.includes('inventory_count_id') || (subErr as { code?: string })?.code === 'ER_BAD_FIELD_ERROR') {
          const querySimple = `
            SELECT ${baseSelect}
            FROM inventory_counts c
            JOIN properties p ON p.id = c.property_id AND p.deleted_at IS NULL
            WHERE 1=1 ${whereClause} ${orderLimit}
          `;
          rows = await queryRunner.query(querySimple, params);
          rows = (rows as any[]).map((r) => ({ ...r, movements_count: 0 }));
        } else {
          throw subErr;
        }
      }

      await queryRunner.release();

      const counts = (rows as any[]).map((r) => ({
        id: String(r.id),
        uuid: r.uuid,
        propertyId: r.property_id,
        propertyName: r.property_name ?? null,
        propertyType: r.property_type ?? 'hotel',
        name: r.name,
        protocol: r.protocol,
        responsible: r.responsible ?? null,
        notes: r.notes ?? null,
        blindCount: Boolean(r.blind_count),
        createdBy: r.created_by,
        createdAt: r.created_at,
        movementsCount: Number(r.movements_count ?? 0),
        status: r.status ?? 'draft',
        totalItems: Number(r.total_items ?? 0),
        countedItems: Number(r.counted_items ?? 0),
        divergentItems: Number(r.divergent_items ?? 0),
        adjustedItems: Number(r.adjusted_items ?? 0),
        accuracyPercentage: r.accuracy_percentage != null ? Number(r.accuracy_percentage) : null,
      }));

      res.json({ success: true, data: { counts } });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!id || !Number.isInteger(id)) {
        throw new AppError('ID inválido', 400);
      }
      const queryRunner = AppDataSource.createQueryRunner();
      const [row] = await queryRunner.query(
        `SELECT c.id, c.uuid, c.property_id, c.name, c.protocol, c.responsible_user_name as responsible, c.notes, c.blind_count, c.created_by, c.created_at,
                c.total_items, c.counted_items, c.divergent_items, c.adjusted_items, c.accuracy_percentage, c.status,
                p.name as property_name, p.type as property_type
         FROM inventory_counts c
         JOIN properties p ON p.id = c.property_id AND p.deleted_at IS NULL
         WHERE c.id = ?`,
        [id]
      );
      await queryRunner.release();
      if (!row) {
        throw new AppError('Contagem não encontrada', 404);
      }
      const r = row as any;
      res.json({
        success: true,
        data: {
          id: String(r.id),
          uuid: r.uuid,
          propertyId: r.property_id,
          propertyName: r.property_name,
          propertyType: r.property_type ?? 'hotel',
          name: r.name,
          protocol: r.protocol,
          responsible: r.responsible,
          notes: r.notes,
          blindCount: Boolean(r.blind_count),
          createdBy: r.created_by,
          createdAt: r.created_at,
          totalItems: Number(r.total_items ?? 0),
          countedItems: Number(r.counted_items ?? 0),
          divergentItems: Number(r.divergent_items ?? 0),
          adjustedItems: Number(r.adjusted_items ?? 0),
          accuracyPercentage: r.accuracy_percentage != null ? Number(r.accuracy_percentage) : null,
          status: r.status ?? 'draft',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna os itens da contagem a partir de inventory_count_items (para exibir em "Detalhes dos Itens").
   */
  async getItemsById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!id || !Number.isInteger(id)) {
        throw new AppError('ID inválido', 400);
      }
      const queryRunner = AppDataSource.createQueryRunner();
      let rows: any[];
      try {
        rows = await queryRunner.query(
          `SELECT ici.id, ici.item_id, ici.system_quantity, ici.first_count_quantity, ici.divergence, ici.status, ici.notes,
                  ii.name as item_name, ii.sku as item_sku, ii.category as item_category
           FROM inventory_count_items ici
           LEFT JOIN inventory_items ii ON ii.id = ici.item_id AND ii.deleted_at IS NULL
           WHERE ici.count_id = ?
           ORDER BY ici.id`,
          [id]
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Unknown column 'item_id'") || (err as { code?: string })?.code === 'ER_BAD_FIELD_ERROR') {
          rows = await queryRunner.query(
            `SELECT ici.id, ici.system_quantity, ici.first_count_quantity, ici.divergence, ici.status, ici.notes,
                    p.name as item_name, p.sku as item_sku
             FROM inventory_count_items ici
             LEFT JOIN products p ON p.id = ici.product_id
             WHERE ici.count_id = ?
             ORDER BY ici.id`,
            [id]
          );
        } else {
          await queryRunner.release();
          throw err;
        }
      }
      await queryRunner.release();

      const items = (rows as any[]).map((r) => ({
        id: String(r.id),
        itemId: r.item_id != null ? Number(r.item_id) : null,
        systemQuantity: Number(r.system_quantity ?? 0),
        countedQuantity: r.first_count_quantity != null ? Number(r.first_count_quantity) : null,
        divergence: r.divergence != null ? Number(r.divergence) : 0,
        status: r.status ?? 'pending',
        notes: r.notes ?? null,
        itemName: r.item_name ?? '',
        itemSku: r.item_sku ?? '',
        itemCategory: r.item_category ?? '',
      }));

      res.json({ success: true, data: { items } });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const data = req.body as CreateInventoryCountInput;
      const userId = req.user?.id ?? null;

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const [property] = await queryRunner.query(
        'SELECT id FROM properties WHERE id = ? AND deleted_at IS NULL',
        [data.propertyId]
      );
      if (!property) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new AppError('Propriedade não encontrada', 404);
      }

      const uuid = uuidv4();
      const responsibleUserId = userId ?? 0;
      const totalItems = (data as { totalItems?: number }).totalItems ?? 0;
      const countedItems = (data as { countedItems?: number }).countedItems ?? 0;
      const divergentItems = (data as { divergentItems?: number }).divergentItems ?? 0;
      const adjustedItems = (data as { adjustedItems?: number }).adjustedItems ?? 0;
      const accuracyPercentage = (data as { accuracyPercentage?: number | null }).accuracyPercentage ?? null;
      const status = (data as { status?: string }).status ?? 'draft';

      await queryRunner.query(
        `INSERT INTO inventory_counts (uuid, property_id, name, protocol, responsible_user_id, responsible_user_name, notes, blind_count, created_by, total_items, counted_items, divergent_items, adjusted_items, accuracy_percentage, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid,
          data.propertyId,
          data.name,
          data.protocol ?? '',
          responsibleUserId,
          data.responsible ?? null,
          data.notes ?? null,
          data.blindCount ? 1 : 0,
          userId,
          totalItems,
          countedItems,
          divergentItems,
          adjustedItems,
          accuracyPercentage,
          status,
        ]
      );

      const countIdResult = await queryRunner.query('SELECT LAST_INSERT_ID() as id');
      const newCountId = (countIdResult as { id: number }[])[0]?.id;

      const countItems = (data as { items?: Array<{ itemId: number; systemQuantity: number; countedQuantity: number | null; status: string; notes?: string | null }> }).items;
      if (newCountId != null && Array.isArray(countItems) && countItems.length > 0) {
        const statusVal = (s: string) => (s === 'counted' ? 'counted' : s === 'divergent' ? 'divergent' : s === 'adjusted' ? 'adjusted' : 'pending');
        try {
          for (const row of countItems) {
            const [itemRow] = await queryRunner.query(
              'SELECT product_id FROM inventory_items WHERE id = ? AND deleted_at IS NULL',
              [row.itemId]
            );
            const productId = (itemRow as { product_id: number | null } | undefined)?.product_id ?? null;
            try {
              await queryRunner.query(
                `INSERT INTO inventory_count_items (count_id, product_id, item_id, system_quantity, first_count_quantity, first_count_by, status, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  newCountId,
                  productId,
                  row.itemId,
                  row.systemQuantity,
                  row.countedQuantity,
                  userId,
                  statusVal(row.status),
                  row.notes ?? null,
                ]
              );
            } catch (insertErr: unknown) {
              const insertMsg = insertErr instanceof Error ? insertErr.message : String(insertErr);
              if (insertMsg.includes("Unknown column 'item_id'") || (insertErr as { code?: string })?.code === 'ER_BAD_FIELD_ERROR') {
                if (productId == null) continue;
                await queryRunner.query(
                  `INSERT INTO inventory_count_items (count_id, product_id, system_quantity, first_count_quantity, first_count_by, status, notes)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [
                    newCountId,
                    productId,
                    row.systemQuantity,
                    row.countedQuantity,
                    userId,
                    statusVal(row.status),
                    row.notes ?? null,
                  ]
                );
              } else {
                throw insertErr;
              }
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!msg.includes("inventory_count_items") && !msg.includes("doesn't exist") && (err as { code?: string })?.code !== 'ER_NO_SUCH_TABLE') {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw err;
          }
        }
      }

      // Aplicar contagem ao estoque: para cada item com divergência, criar movimentação de ajuste e atualizar current_stock
      if (newCountId != null && Array.isArray(countItems) && countItems.length > 0) {
        const protocol = data.protocol ?? 'Contagem';
        const reason = `Ajuste por contagem: ${protocol}`;
        for (const row of countItems) {
          const counted = row.countedQuantity;
          if (counted == null) continue;
          const system = row.systemQuantity ?? 0;
          if (Number(counted) === Number(system)) continue;
          const qtyDiff = Number(counted) - Number(system);

          const [itemRow] = await queryRunner.query(
            'SELECT product_id FROM inventory_items WHERE id = ? AND deleted_at IS NULL',
            [row.itemId]
          );
          const productId = (itemRow as { product_id: number | null } | undefined)?.product_id ?? null;
          if (productId == null) continue;

          try {
            await queryRunner.query(
              `INSERT INTO inventory_movements (item_id, product_id, type, quantity, reason, user_id, inventory_count_id)
               VALUES (?, ?, 'adjustment', ?, ?, ?, ?)`,
              [row.itemId, productId, qtyDiff, reason, userId, newCountId]
            );
          } catch (movErr: unknown) {
            const movMsg = movErr instanceof Error ? movErr.message : String(movErr);
            if (movMsg.includes('inventory_count_id') || (movErr as { code?: string })?.code === 'ER_BAD_FIELD_ERROR') {
              await queryRunner.query(
                `INSERT INTO inventory_movements (item_id, product_id, type, quantity, reason, user_id)
                 VALUES (?, ?, 'adjustment', ?, ?, ?)`,
                [row.itemId, productId, qtyDiff, reason, userId]
              );
            } else {
              await queryRunner.rollbackTransaction();
              await queryRunner.release();
              throw movErr;
            }
          }

          await queryRunner.query(
            'UPDATE inventory_items SET current_stock = ?, updated_at = NOW() WHERE id = ?',
            [counted, row.itemId]
          );
        }
      }

      await queryRunner.commitTransaction();

      const [inserted] = await queryRunner.query(
        'SELECT id, uuid, property_id, name, protocol, responsible_user_name as responsible, notes, blind_count, created_by, created_at FROM inventory_counts WHERE id = ?',
        [newCountId]
      );
      await queryRunner.release();

      const r = inserted as any;
      res.status(201).json({
        success: true,
        data: {
          id: String(r.id),
          uuid: r.uuid,
          propertyId: r.property_id,
          name: r.name,
          protocol: r.protocol,
          responsible: r.responsible,
          notes: r.notes,
          blindCount: Boolean(r.blind_count),
          createdBy: r.created_by,
          createdAt: r.created_at,
        },
      });
    } catch (error) {
      try {
        await queryRunner.rollbackTransaction();
      } catch {
        // ignore
      }
      try {
        await queryRunner.release();
      } catch {
        // ignore
      }
      next(error);
    }
  }
}
