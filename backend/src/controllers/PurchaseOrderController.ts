import { Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreatePurchaseOrderInput } from '@/validators/purchaseOrder.validator';
import { v4 as uuidv4 } from 'uuid';
import { EventBus } from '@/events/EventBus';

export class PurchaseOrderController {
  private mapDbStatusToUiStep(dbStatus: string | null | undefined, orderType?: string | null): number {
    const s = String(dbStatus || '').toLowerCase();
    const type = String(orderType || '').toLowerCase();
    if (s === 'draft' && type === 'quotation') return 1;
    if (s === 'draft') return 2;
    if (s === 'pending_approval') return 3;
    if (s === 'approved') return 4;
    if (s === 'sent_to_supplier' || s === 'confirmed' || s === 'partial_delivery') return 5;
    if (s === 'delivered') return 6;
    if (s === 'completed') return 7;
    if (s === 'cancelled') return 0;
    return 2;
  }

  private async upsertProductSupplier(
    queryRunner: any,
    supplierId: number | null | undefined,
    productId: number | null | undefined,
    unitPrice: number,
    orderNotes?: string | null
  ): Promise<number | null> {
    if (!supplierId || !productId) return null;
    try {
      await queryRunner.query(
        `INSERT INTO product_suppliers (
          uuid, product_id, supplier_id, unit_price, minimum_quantity, lead_time_days, is_preferred, notes, is_active
        ) VALUES (UUID(), ?, ?, ?, 1, 7, 0, ?, 1)
        ON DUPLICATE KEY UPDATE
          unit_price = VALUES(unit_price),
          notes = COALESCE(VALUES(notes), notes),
          is_active = 1,
          updated_at = CURRENT_TIMESTAMP,
          id = LAST_INSERT_ID(id)`,
        [productId, supplierId, unitPrice, orderNotes ?? null]
      );
      const [idRow] = await queryRunner.query(`SELECT LAST_INSERT_ID() AS id`);
      return Number((idRow as { id: number }).id) || null;
    } catch (error: any) {
      if (error?.code === 'ER_NO_SUCH_TABLE') {
        return null;
      }
      throw error;
    }
  }

  private mapUiStatusToDb(status: string): { dbStatus: string; orderType?: 'quotation' | 'regular' } {
    const s = String(status || '').toLowerCase();
    const map: Record<string, { dbStatus: string; orderType?: 'quotation' | 'regular' }> = {
      cotacao: { dbStatus: 'draft', orderType: 'quotation' },
      quotation: { dbStatus: 'draft', orderType: 'quotation' },
      rascunho: { dbStatus: 'draft', orderType: 'regular' },
      draft: { dbStatus: 'draft', orderType: 'regular' },
      aguardando_aprovacao: { dbStatus: 'pending_approval', orderType: 'regular' },
      pending_approval: { dbStatus: 'pending_approval', orderType: 'regular' },
      aprovado: { dbStatus: 'approved', orderType: 'regular' },
      approved: { dbStatus: 'approved', orderType: 'regular' },
      em_transito: { dbStatus: 'sent_to_supplier', orderType: 'regular' },
      sent_to_supplier: { dbStatus: 'sent_to_supplier', orderType: 'regular' },
      recebido: { dbStatus: 'delivered', orderType: 'regular' },
      delivered: { dbStatus: 'delivered', orderType: 'regular' },
      devolucao_mercadoria: { dbStatus: 'completed', orderType: 'regular' },
      devolver_mercadoria: { dbStatus: 'completed', orderType: 'regular' },
      returned: { dbStatus: 'completed', orderType: 'regular' },
      cancelado: { dbStatus: 'cancelled', orderType: 'regular' },
      cancelled: { dbStatus: 'cancelled', orderType: 'regular' },
    };
    return map[s] ?? { dbStatus: 'draft', orderType: 'regular' };
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId, status, limit } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          o.id, o.uuid, o.primary_property_id as property_id, o.supplier_id, o.status,
          o.protocol as order_number, o.order_date, o.expected_delivery_date,
          o.payment_method_id as payment_method_id, pm.name as payment_method_name,
          o.internal_notes as notes, o.total_value as total_amount, o.created_by,
          COALESCE(o.order_date, o.created_at) as created_at,
          p.name as property_name,
          s.name as supplier_name
        FROM purchase_orders o
        LEFT JOIN properties p ON p.id = o.primary_property_id AND p.deleted_at IS NULL
        LEFT JOIN suppliers s ON s.id = o.supplier_id
        LEFT JOIN payment_methods pm ON pm.id = o.payment_method_id
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      if (propertyId) {
        query += ` AND o.primary_property_id = ?`;
        params.push(Number(propertyId));
      }
      if (status && typeof status === 'string') {
        query += ` AND o.status = ?`;
        params.push(status);
      }
      query += ` ORDER BY o.created_at DESC`;
      const limitNum = limit ? Math.min(Number(limit) || 100, 500) : 100;
      query += ` LIMIT ${limitNum}`;

      const rows = await queryRunner.query(query, params);
      await queryRunner.release();

      const orders = (rows as any[]).map((r) => ({
        id: String(r.id),
        uuid: r.uuid,
        propertyId: r.property_id,
        propertyName: r.property_name,
        supplierId: r.supplier_id,
        supplierName: r.supplier_name,
        status: r.status,
        orderNumber: r.order_number,
        orderDate: r.order_date,
        expectedDeliveryDate: r.expected_delivery_date,
        deliveryAddress: r.delivery_address,
        paymentMethodId: r.payment_method_id != null ? Number(r.payment_method_id) : null,
        paymentMethodName: r.payment_method_name ?? null,
        notes: r.notes,
        totalAmount: r.total_amount != null ? Number(r.total_amount) : null,
        createdBy: r.created_by,
        createdAt: r.created_at,
      }));

      res.json({ success: true, data: { orders } });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      const [orderRow] = await queryRunner.query(
        `SELECT o.id, o.uuid, o.primary_property_id as property_id, o.supplier_id, o.status,
          o.protocol as order_number, o.order_date, o.expected_delivery_date, o.delivery_notes,
          o.payment_method_id as payment_method_id, pm.name as payment_method_name,
          o.payment_installments, o.internal_notes as notes, o.total_value as total_amount, o.created_by,
          COALESCE(o.order_date, o.created_at) as created_at,
          p.name as property_name,
          s.name as supplier_name
         FROM purchase_orders o
         LEFT JOIN properties p ON p.id = o.primary_property_id AND p.deleted_at IS NULL
         LEFT JOIN suppliers s ON s.id = o.supplier_id
         LEFT JOIN payment_methods pm ON pm.id = o.payment_method_id
         WHERE o.id = ?`,
        [Number(id)]
      );
      if (!orderRow) {
        await queryRunner.release();
        throw new AppError('Pedido de compra não encontrado', 404);
      }

      const itemRows = await queryRunner.query(
        `SELECT oi.id, oi.order_id, oi.product_id as inventory_item_id, oi.quantity, oi.unit_price, oi.discount_percentage as discount_percent, oi.total_value as total,
          COALESCE(prod.name, prod.sku) as item_name, prod.sku as item_sku, COALESCE(mu.symbol, mu.code, 'un') as item_unit
         FROM purchase_order_items oi
         LEFT JOIN products prod ON prod.id = oi.product_id
         LEFT JOIN measurement_units mu ON mu.id = prod.primary_unit_id
         WHERE oi.order_id = ?`,
        [Number(id)]
      );
      await queryRunner.release();

      const o = orderRow as any;
      const order = {
        id: String(o.id),
        uuid: o.uuid,
        propertyId: o.property_id,
        propertyName: o.property_name,
        supplierId: o.supplier_id,
        supplierName: o.supplier_name,
        status: o.status,
        orderNumber: o.order_number,
        orderDate: o.order_date,
        expectedDeliveryDate: o.expected_delivery_date,
        deliveryAddress: o.delivery_address,
        deliveryNotes: o.delivery_notes,
        paymentMethodId: o.payment_method_id != null ? Number(o.payment_method_id) : null,
        paymentMethodName: o.payment_method_name ?? null,
        paymentInstallments: o.payment_installments,
        notes: o.notes,
        totalAmount: o.total_amount != null ? Number(o.total_amount) : null,
        createdBy: o.created_by,
        createdAt: o.created_at,
        items: (itemRows as any[]).map((row) => ({
          id: String(row.id),
          inventoryItemId: row.inventory_item_id,
          itemName: row.item_name,
          itemSku: row.item_sku,
          itemUnit: row.item_unit,
          quantity: Number(row.quantity),
          unitPrice: Number(row.unit_price),
          discountPercent: Number(row.discount_percent),
          total: Number(row.total),
        })),
      };
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreatePurchaseOrderInput;
      const userId = req.user?.id ?? null;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const uuid = uuidv4();
        const protocol = `PED-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        let totalValue = 0;
        for (const item of data.items) {
          const total = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
          totalValue += total;
        }

        await queryRunner.query(
          `INSERT INTO purchase_orders (
            uuid, protocol, supplier_id, primary_property_id, order_type, order_date,
            expected_delivery_date, delivery_notes, payment_method_id, payment_installments,
            internal_notes, total_value, status, created_by
          ) VALUES (?, ?, ?, ?, 'regular', ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
          [
            uuid,
            protocol,
            data.supplierId ?? null,
            data.propertyId ?? null,
            data.orderDate,
            data.expectedDeliveryDate ?? null,
            data.deliveryNotes ?? null,
            data.paymentMethodId ?? null,
            data.paymentInstallments ?? 1,
            data.notes ?? null,
            totalValue,
            userId,
          ]
        );

        const [inserted] = await queryRunner.query('SELECT id FROM purchase_orders WHERE uuid = ?', [uuid]);
        const orderId = (inserted as { id: number }).id;

        for (const item of data.items) {
          const itemTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
          const productId = item.inventoryItemId ?? (item as { productId?: number }).productId ?? null;
          const unitId = 1;
          const productSupplierId = await this.upsertProductSupplier(
            queryRunner,
            data.supplierId ?? null,
            productId,
            item.unitPrice,
            data.notes ?? null
          );
          await queryRunner.query(
            `INSERT INTO purchase_order_items (order_id, product_id, product_supplier_id, quantity, unit_id, unit_price, discount_percentage, discount_value, total_value)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
            [
              orderId,
              productId,
              productSupplierId,
              item.quantity,
              unitId,
              item.unitPrice,
              item.discountPercent ?? 0,
              itemTotal,
            ]
          );
        }

        await queryRunner.commitTransaction();
        await queryRunner.release();

        const created = await this.loadOne(orderId);
        const payload = {
          orderId: created.id,
          orderNumber: created.orderNumber,
          propertyId: created.propertyId ?? null,
          propertyName: created.propertyName ?? '',
          supplierName: created.supplierName ?? '',
          totalAmount: created.totalAmount ?? 0,
          totalValue: created.totalAmount ?? 0,
          expectedDeliveryDate: created.expectedDeliveryDate ?? null,
        };
        EventBus.emit('purchase_order.created', payload);
        console.log('[PurchaseOrderController] Evento purchase_order.created emitido. Protocolo:', created.orderNumber);
        res.status(201).json({ success: true, data: created });
      } catch (e) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw e;
      }
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const id = Number(req.params.id);
      if (!id || Number.isNaN(id)) throw new AppError('ID do pedido inválido.', 400);

      const { status, notes } = req.body as { status: string; notes?: string | null };
      if (!status || !String(status).trim()) throw new AppError('Status é obrigatório.', 400);

      const mapped = this.mapUiStatusToDb(status);
      const userId = req.user?.id ?? null;

      const rows = await queryRunner.query(
        `SELECT id, internal_notes, status, order_type FROM purchase_orders WHERE id = ? LIMIT 1`,
        [id]
      );
      if (!rows.length) throw new AppError('Pedido não encontrado.', 404);

      const currentStep = this.mapDbStatusToUiStep(rows[0].status, rows[0].order_type);
      const requestedUi = String(status).toLowerCase();
      const isCancelRequest = requestedUi === 'cancelado' || requestedUi === 'cancelled';
      const isReturnRequest =
        requestedUi === 'devolucao_mercadoria' ||
        requestedUi === 'devolver_mercadoria' ||
        requestedUi === 'returned';

      if (isCancelRequest && currentStep > 4) {
        throw new AppError(
          'Não é permitido cancelar pedidos após a etapa "Aprovado". Use "Devolver Mercadoria" quando aplicável.',
          400
        );
      }
      if (isReturnRequest && currentStep < 6) {
        throw new AppError(
          'A opção "Devolver Mercadoria" só pode ser usada após o pedido estar "Recebido".',
          400
        );
      }

      const previousNotes = rows[0].internal_notes ? String(rows[0].internal_notes) : '';
      const noteText = notes && String(notes).trim()
        ? `${previousNotes}${previousNotes ? '\n' : ''}[STATUS ${new Date().toISOString()}] ${String(notes).trim()}`
        : previousNotes;

      const setParts: string[] = ['status = ?', 'updated_by = ?'];
      const params: Array<string | number | null> = [mapped.dbStatus, userId];

      if (mapped.orderType) {
        setParts.push('order_type = ?');
        params.push(mapped.orderType);
      }

      setParts.push('internal_notes = ?');
      params.push(noteText || null);

      if (mapped.dbStatus === 'approved') {
        setParts.push('approved_by = ?', 'approved_at = CURRENT_TIMESTAMP', 'approval_notes = ?');
        params.push(userId, notes ? String(notes).trim() : null);
      }

      if (mapped.dbStatus === 'cancelled') {
        setParts.push('cancelled_by = ?', 'cancelled_at = CURRENT_TIMESTAMP', 'cancellation_reason = ?');
        params.push(userId, notes ? String(notes).trim() : null);
      }

      params.push(id);
      await queryRunner.query(
        `UPDATE purchase_orders SET ${setParts.join(', ')} WHERE id = ?`,
        params
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();
      res.json({ success: true, message: 'Status do pedido atualizado com sucesso.' });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }

  private async loadOne(id: number): Promise<Record<string, unknown>> {
    const queryRunner = AppDataSource.createQueryRunner();
    const [o] = await queryRunner.query(
      `SELECT o.id, o.uuid, o.primary_property_id as property_id, o.supplier_id, o.protocol as order_number, o.order_date,
        o.expected_delivery_date, o.delivery_notes, o.payment_method_id as payment_method_id, pm.name as payment_method_name,
        o.payment_installments, o.internal_notes as notes, o.total_value as total_amount, o.created_by,
        COALESCE(o.order_date, o.created_at) as created_at,
        p.name as property_name, s.name as supplier_name, o.status
       FROM purchase_orders o
       LEFT JOIN properties p ON p.id = o.primary_property_id AND p.deleted_at IS NULL
       LEFT JOIN suppliers s ON s.id = o.supplier_id
       LEFT JOIN payment_methods pm ON pm.id = o.payment_method_id
       WHERE o.id = ?`,
      [id]
    );
    const items = await queryRunner.query(
      'SELECT id, order_id, product_id as inventory_item_id, quantity, unit_price, discount_percentage as discount_percent, total_value as total FROM purchase_order_items WHERE order_id = ?',
      [id]
    );
    await queryRunner.release();
    const row = o as any;
    return {
      id: String(row.id),
      uuid: row.uuid,
      propertyId: row.property_id,
      propertyName: row.property_name ?? null,
      supplierId: row.supplier_id,
      supplierName: row.supplier_name ?? null,
      status: row.status,
      orderNumber: row.order_number,
      orderDate: row.order_date,
      expectedDeliveryDate: row.expected_delivery_date,
      deliveryAddress: null,
      deliveryNotes: row.delivery_notes ?? null,
      paymentMethodId: row.payment_method_id != null ? Number(row.payment_method_id) : null,
      paymentMethodName: row.payment_method_name ?? null,
      paymentInstallments: row.payment_installments ?? 1,
      notes: row.notes,
      totalAmount: row.total_amount != null ? Number(row.total_amount) : null,
      createdBy: row.created_by,
      createdAt: row.created_at,
      items: (items as any[]).map((i) => ({
        id: String(i.id),
        inventoryItemId: i.inventory_item_id,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price),
        discountPercent: Number(i.discount_percent ?? 0),
        total: Number(i.total),
      })),
    };
  }
}
