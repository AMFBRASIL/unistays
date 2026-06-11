import { Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateInventoryMovementInput, CreateInventoryMovementBulkInput } from '@/validators/inventoryMovement.validator';

export class InventoryMovementController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemId, type, inventoryCountId, limit } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      // Schema: id, item_id, product_id, type, quantity, reason, user_id, created_at [, inventory_count_id]
      let query = `
        SELECT 
          m.id, m.item_id, m.type, m.quantity, m.reason, m.user_id, m.created_at,
          i.name as item_name, i.sku as item_sku, i.unit as item_unit, i.category as item_category,
          i.current_stock as item_current_stock,
          u.name as created_by_name
        FROM inventory_movements m
        JOIN inventory_items i ON i.id = m.item_id AND i.deleted_at IS NULL
        LEFT JOIN users u ON u.id = m.user_id
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      if (itemId) {
        query += ` AND m.item_id = ?`;
        params.push(Number(itemId));
      }
      if (type && typeof type === 'string') {
        query += ` AND m.type = ?`;
        params.push(type);
      }
      if (inventoryCountId) {
        query += ` AND m.inventory_count_id = ?`;
        params.push(Number(inventoryCountId));
      }
      query += ` ORDER BY m.created_at DESC`;
      const limitNum = limit ? Math.min(Number(limit) || 100, 500) : 100;
      query += ` LIMIT ${limitNum}`;

      const rows = await queryRunner.query(query, params);
      await queryRunner.release();

      const movements = (rows as any[]).map((r) => {
        const quantity = Number(r.quantity);
        const currentStock = r.item_current_stock != null ? Number(r.item_current_stock) : null;
        // Para detalhe de contagem: sistema = estoque antes do ajuste (current - quantity); contado = estoque depois (current)
        const systemStock = currentStock != null ? currentStock - quantity : null;
        return {
          id: String(r.id),
          uuid: null,
          itemId: r.item_id,
          itemName: r.item_name,
          itemSku: r.item_sku,
          itemUnit: r.item_unit,
          itemCategory: r.item_category ?? null,
          itemCurrentStock: currentStock,
          systemStockAtCount: systemStock,
          countedStockAtCount: currentStock,
          type: r.type,
          quantity,
          unitCost: null,
          totalCost: null,
          reason: r.reason,
          reference: null,
          notes: null,
          createdBy: r.user_id,
          createdByName: r.created_by_name,
          createdAt: r.created_at,
        };
      });

      res.json({ success: true, data: { movements } });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreateInventoryMovementInput;
      const userId = req.user?.id ?? null;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const [item] = await queryRunner.query(
          'SELECT id, current_stock, product_id FROM inventory_items WHERE id = ? AND deleted_at IS NULL',
          [data.itemId]
        );
        if (!item) {
          throw new AppError('Item de estoque não encontrado', 404);
        }

        const productId = item.product_id != null ? Number(item.product_id) : null;
        if (productId == null) {
          throw new AppError('Item de estoque não está vinculado a um produto do catálogo. Vincule o item a um produto para registrar movimentações.', 400);
        }

        const currentStock = Number(item.current_stock);
        const qty = data.quantity;
        let newStock = currentStock;
        if (data.type === 'in') newStock = currentStock + qty;
        else if (data.type === 'out' || data.type === 'adjustment') newStock = currentStock - qty;
        else if (data.type === 'transfer') newStock = currentStock - qty; // transfer out; another movement can be "in" for destination

        if (newStock < 0) {
          const qtyRequested = data.type === 'in' ? qty : Math.abs(qty);
          throw new AppError(
            `Quantidade insuficiente em estoque. Disponível: ${currentStock}. ${data.type === 'out' || data.type === 'adjustment' ? `Tentativa de baixa: ${qtyRequested}.` : ''} Resultaria em estoque negativo.`,
            400
          );
        }

        // Schema: item_id, product_id (FK -> products.id), type, quantity, reason, user_id [, inventory_count_id]
        const qtySigned = data.type === 'in' ? Math.abs(qty) : -Math.abs(qty);
        const countId = data.inventoryCountId ?? null;
        const insertParams = [data.itemId, productId, data.type, qtySigned, data.reason ?? null, userId];

        const insertWithCountId = async (): Promise<void> => {
          await queryRunner.query(
            `INSERT INTO inventory_movements (item_id, product_id, type, quantity, reason, user_id, inventory_count_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [...insertParams, countId]
          );
        };
        const insertWithoutCountId = async (): Promise<void> => {
          await queryRunner.query(
            `INSERT INTO inventory_movements (item_id, product_id, type, quantity, reason, user_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            insertParams
          );
        };

        if (countId != null) {
          try {
            await insertWithCountId();
          } catch (colErr: unknown) {
            const msg = colErr instanceof Error ? colErr.message : String(colErr);
            if (msg.includes('inventory_count_id') || (colErr as { code?: string })?.code === 'ER_BAD_FIELD_ERROR') {
              await insertWithoutCountId();
            } else {
              throw colErr;
            }
          }
        } else {
          await insertWithoutCountId();
        }

        await queryRunner.query(
          'UPDATE inventory_items SET current_stock = ?, updated_at = NOW() WHERE id = ?',
          [newStock, data.itemId]
        );

        await queryRunner.commitTransaction();

        const [inserted] = await queryRunner.query(
          'SELECT id, item_id, type, quantity, reason, user_id, created_at FROM inventory_movements WHERE id = LAST_INSERT_ID()'
        );
        await queryRunner.release();

        const r = inserted as any;
        res.status(201).json({
          success: true,
          data: {
            id: String(r.id),
            uuid: null,
            itemId: r.item_id,
            type: r.type,
            quantity: Number(r.quantity),
            unitCost: null,
            totalCost: null,
            reason: r.reason,
            reference: null,
            notes: null,
            createdBy: r.user_id,
            createdAt: r.created_at,
          },
        });
      } catch (e) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw e;
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria várias movimentações em uma única transação. Só grava se todas as validações
   * de estoque passarem; caso contrário nada é gravado.
   */
  async createBulk(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { movements: movementsInput } = req.body as CreateInventoryMovementBulkInput;
      const userId = req.user?.id ?? null;
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const itemIds = [...new Set(movementsInput.map((m) => m.itemId))];
        const placeholders = itemIds.map(() => '?').join(',');
        const itemRows = await queryRunner.query(
          `SELECT id, current_stock, product_id FROM inventory_items WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
          itemIds
        ) as { id: number; current_stock: number; product_id: number | null }[];
        const stockByItem: Record<number, number> = {};
        const productIdByItem: Record<number, number> = {};
        for (const row of itemRows) {
          stockByItem[row.id] = Number(row.current_stock ?? 0);
          if (row.product_id != null) productIdByItem[row.id] = row.product_id;
        }

        for (const m of movementsInput) {
          if (stockByItem[m.itemId] === undefined) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw new AppError(`Item de estoque não encontrado: ${m.itemId}`, 404);
          }
          if (productIdByItem[m.itemId] == null) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw new AppError('Item de estoque não está vinculado a um produto do catálogo. Vincule o item a um produto para registrar movimentações.', 400);
          }
          const qty = m.type === 'in' ? Math.abs(m.quantity) : -Math.abs(m.quantity);
          const currentBefore = stockByItem[m.itemId];
          stockByItem[m.itemId] = currentBefore + qty;
          if (stockByItem[m.itemId] < 0) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            const friendlyMsg =
              currentBefore === 0
                ? 'O estoque deste item está zerado. Não é possível prosseguir com a Saída. Faça uma entrada antes ou verifique os itens selecionados.'
                : `Quantidade insuficiente em estoque. Disponível: ${currentBefore}. Tentativa de baixa: ${Math.abs(m.quantity)}. A movimentação completa foi cancelada.`;
            throw new AppError(friendlyMsg, 400);
          }
        }

        const countId = null;
        for (const m of movementsInput) {
          const qtySigned = m.type === 'in' ? Math.abs(m.quantity) : -Math.abs(m.quantity);
          const productId = productIdByItem[m.itemId];
          await queryRunner.query(
            `INSERT INTO inventory_movements (item_id, product_id, type, quantity, reason, user_id, inventory_count_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [m.itemId, productId, m.type, qtySigned, m.reason ?? null, userId, countId]
          );
        }

        for (const [itemIdStr, newStock] of Object.entries(stockByItem)) {
          const itemId = Number(itemIdStr);
          await queryRunner.query(
            'UPDATE inventory_items SET current_stock = ?, updated_at = NOW() WHERE id = ?',
            [newStock, itemId]
          );
        }

        await queryRunner.commitTransaction();
        await queryRunner.release();
        res.status(201).json({
          success: true,
          data: { count: movementsInput.length },
        });
      } catch (e) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw e;
      }
    } catch (error) {
      next(error);
    }
  }
}
