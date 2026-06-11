import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateSupplierInput, UpdateSupplierInput } from '@/validators/supplier.validator';
import { v4 as uuidv4 } from 'uuid';

/** Deriva document_type (cpf/cnpj/other) a partir do número do documento (apenas dígitos). */
function documentTypeFromNumber(num: string | null | undefined): 'cpf' | 'cnpj' | 'other' {
  if (!num) return 'other';
  const digits = String(num).replace(/\D/g, '');
  if (digits.length === 11) return 'cpf';
  if (digits.length === 14) return 'cnpj';
  return 'other';
}

interface SupplierResponse {
  id: number;
  uuid: string;
  propertyId: number | null;
  code: string;
  categoryId: number;
  category?: {
    id: number;
    code: string;
    name: string;
    icon: string | null;
    colorFrom: string | null;
    colorTo: string | null;
  };
  name: string;
  tradeName: string | null;
  cnpj: string | null;
  stateRegistration: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  zipCode: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  paymentTerms: number | null;
  deliveryDays: number | null;
  minOrderValue: number | null;
  notes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SupplierController {
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const supplierId = Number(req.params.id);
      const propertyId = req.query.propertyId ? Number(req.query.propertyId) : null;
      if (!supplierId || Number.isNaN(supplierId)) {
        throw new AppError('Fornecedor inválido', 400);
      }

      const queryRunner = AppDataSource.createQueryRunner();
      try {
        let propertyJoin = '';
        if (propertyId && Number.isFinite(propertyId)) {
          propertyJoin = ' AND ii.property_id = ?';
        }

        const rows = await queryRunner.query(
          `
          SELECT DISTINCT
            ps.id,
            ps.product_id as productId,
            ps.supplier_id as supplierId,
            ps.unit_price as unitPrice,
            ps.lead_time_days as leadTimeDays,
            ps.is_preferred as isPreferred,
            ps.is_active as isActive,
            p.name as productName,
            p.sku as productSku
          FROM product_suppliers ps
          INNER JOIN products p ON p.id = ps.product_id
          LEFT JOIN inventory_items ii ON ii.product_id = ps.product_id ${propertyJoin}
          WHERE ps.supplier_id = ?
            AND ps.is_active = 1
          ORDER BY p.name ASC
          `,
          propertyJoin ? [propertyId, supplierId] : [supplierId]
        );

        res.json({
          success: true,
          data: {
            products: (rows as any[]).map((row) => ({
              id: row.id,
              productId: row.productId,
              supplierId: row.supplierId,
              unitPrice: row.unitPrice != null ? Number(row.unitPrice) : null,
              leadTimeDays: row.leadTimeDays != null ? Number(row.leadTimeDays) : null,
              isPreferred: Boolean(row.isPreferred),
              isActive: Boolean(row.isActive),
              productName: row.productName,
              productSku: row.productSku,
            })),
          },
        });
      } catch (error: any) {
        if (error?.code === 'ER_NO_SUCH_TABLE') {
          res.json({ success: true, data: { products: [] } });
          return;
        }
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, categoryId, status, propertyId } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      // Verificar qual estrutura está sendo usada (category_id vs coluna ENUM category)
      let hasCategoryIdColumn = false;
      try {
        await queryRunner.query('SELECT category_id FROM suppliers LIMIT 0');
        hasCategoryIdColumn = true;
      } catch {
        // Tabela usa coluna ENUM category em vez de category_id
      }
      // Documento: coluna cnpj vs document_type + document_number
      let hasDocumentColumns = false;
      try {
        await queryRunner.query('SELECT document_type, document_number FROM suppliers LIMIT 0');
        hasDocumentColumns = true;
      } catch {
        // Tabela usa coluna cnpj
      }
      let hasFlatContactColumns = false;
      try {
        await queryRunner.query('SELECT whatsapp FROM suppliers LIMIT 0');
        hasFlatContactColumns = true;
      } catch {
        // Tabela usa contact_whatsapp, address_*, etc.
      }
      let hasPropertyIdColumn = false;
      try {
        await queryRunner.query('SELECT property_id FROM suppliers LIMIT 0');
        hasPropertyIdColumn = true;
      } catch {
        // Tabela não tem property_id (migração não aplicada)
      }

      const docSelect = hasDocumentColumns
        ? 's.document_type as documentType, s.document_number as documentNumber,'
        : 's.cnpj,';
      const contactSelect = hasFlatContactColumns
        ? 's.email, s.phone, s.whatsapp, s.website, s.contact_name as contactName, s.contact_email as contactEmail, s.contact_phone as contactPhone, s.zip_code as zipCode, s.address, s.city, s.state,'
        : 's.contact_email as email, s.contact_phone as phone, s.contact_whatsapp as whatsapp, s.website, s.contact_name as contactName, s.contact_email as contactEmail, s.contact_phone as contactPhone, s.address_postal_code as zipCode, s.address_street as address, s.address_city as city, s.address_state as state,';
      const propertyIdSelect = hasPropertyIdColumn ? 's.property_id as propertyId,' : 'NULL as propertyId,';

      let query: string;
      if (hasCategoryIdColumn) {
        query = `
          SELECT 
            s.id,
            s.uuid,
            ${propertyIdSelect}
            s.code,
            s.category_id as categoryId,
            s.name,
            s.trade_name as tradeName,
            ${docSelect}
            s.state_registration as stateRegistration,
            ${contactSelect}
            s.payment_terms as paymentTerms,
            s.delivery_days as deliveryDays,
            s.min_order_value as minOrderValue,
            s.notes,
            s.status,
            s.created_at as createdAt,
            s.updated_at as updatedAt,
            sc.id as category_id,
            sc.code as category_code,
            sc.name as category_name,
            sc.icon as category_icon,
            sc.color_from as category_color_from,
            sc.color_to as category_color_to
          FROM suppliers s
          LEFT JOIN supplier_categories sc ON sc.id = s.category_id
        `;
      } else {
        query = `
          SELECT 
            s.id,
            s.uuid,
            ${propertyIdSelect}
            s.code,
            NULL as categoryId,
            s.category,
            s.name,
            s.trade_name as tradeName,
            ${docSelect}
            s.state_registration as stateRegistration,
            ${contactSelect}
            s.payment_terms as paymentTerms,
            s.delivery_days as deliveryDays,
            s.min_order_value as minOrderValue,
            s.notes,
            s.status,
            s.created_at as createdAt,
            s.updated_at as updatedAt,
            sc.id as category_id,
            sc.code as category_code,
            sc.name as category_name,
            sc.icon as category_icon,
            sc.color_from as category_color_from,
            sc.color_to as category_color_to
          FROM suppliers s
          LEFT JOIN supplier_categories sc ON sc.code = s.category
        `;
      }

      const params: any[] = [];
      if (search || categoryId || status || propertyId) {
        query += ` WHERE 1=1`;
      }
      if (search) {
        const docSearch = hasDocumentColumns ? 's.document_number' : 's.cnpj';
        const emailSearch = hasFlatContactColumns ? 's.email' : 's.contact_email';
        const phoneSearch = hasFlatContactColumns ? 's.phone' : 's.contact_phone';
        query += ` AND (
          s.name LIKE ? OR 
          s.trade_name LIKE ? OR 
          s.code LIKE ? OR
          ${docSearch} LIKE ? OR 
          ${emailSearch} LIKE ? OR
          ${phoneSearch} LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
      if (categoryId) {
        if (hasCategoryIdColumn) {
          query += ` AND s.category_id = ?`;
          params.push(parseInt(categoryId as string, 10));
        } else {
          // Se não tem category_id, buscar pelo código da categoria
          const categoryData = await queryRunner.query(
            `SELECT code FROM supplier_categories WHERE id = ?`,
            [parseInt(categoryId as string, 10)]
          );
          if (categoryData.length > 0 && categoryData[0].code) {
            query += ` AND s.category = ?`;
            params.push(categoryData[0].code);
          }
        }
      }
      if (status) {
        query += ` AND s.status = ?`;
        params.push(status);
      }
      if (propertyId && hasPropertyIdColumn) {
        query += ` AND s.property_id = ?`;
        params.push(parseInt(propertyId as string, 10));
      }

      query += ` ORDER BY s.created_at DESC`;

      const suppliers = await queryRunner.query(query, params);
      await queryRunner.release();

      // Mapear resultados
      const suppliersResponse: SupplierResponse[] = suppliers.map((row: any) => {
        // Mapear categoryId: se não existe category_id, buscar pelo código da categoria
        let finalCategoryId = row.categoryId;
        if (!finalCategoryId && row.category && row.category_id) {
          finalCategoryId = row.category_id;
        }
        
        return {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          code: row.code,
          categoryId: finalCategoryId,
          category: row.category_id ? {
            id: row.category_id,
            code: row.category_code,
            name: row.category_name,
            icon: row.category_icon,
            colorFrom: row.category_color_from,
            colorTo: row.category_color_to,
          } : undefined,
        name: row.name,
        tradeName: row.tradeName,
        cnpj: row.documentNumber ?? row.cnpj,
        stateRegistration: row.stateRegistration,
        email: row.email,
        phone: row.phone,
        whatsapp: row.whatsapp,
        website: row.website,
        contactName: row.contactName,
        contactEmail: row.contactEmail,
        contactPhone: row.contactPhone,
        zipCode: row.zipCode,
        address: row.address,
        city: row.city,
        state: row.state,
        paymentTerms: row.paymentTerms ? Number(row.paymentTerms) : null,
        deliveryDays: row.deliveryDays ? Number(row.deliveryDays) : null,
        minOrderValue: row.minOrderValue ? Number(row.minOrderValue) : null,
        notes: row.notes,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        };
      });

      res.json({
        success: true,
        data: { suppliers: suppliersResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      try {
        // Verificar qual estrutura está sendo usada (category_id vs coluna ENUM category)
        let hasCategoryIdColumn = false;
        try {
          await queryRunner.query('SELECT category_id FROM suppliers LIMIT 0');
          hasCategoryIdColumn = true;
        } catch {
          // Tabela usa coluna ENUM category
        }
        let hasDocumentColumns = false;
        try {
          await queryRunner.query('SELECT document_type, document_number FROM suppliers LIMIT 0');
          hasDocumentColumns = true;
        } catch {
          // Tabela usa coluna cnpj
        }
        let hasFlatContactColumns = false;
        try {
          await queryRunner.query('SELECT whatsapp FROM suppliers LIMIT 0');
          hasFlatContactColumns = true;
        } catch {
          // Tabela usa contact_whatsapp, address_*, etc.
        }
        let hasPropertyIdColumn = false;
        try {
          await queryRunner.query('SELECT property_id FROM suppliers LIMIT 0');
          hasPropertyIdColumn = true;
        } catch {
          // Tabela não tem property_id
        }
        const docSelect = hasDocumentColumns
          ? 's.document_type as documentType, s.document_number as documentNumber,'
          : 's.cnpj,';
        const contactSelectGetById = hasFlatContactColumns
          ? 's.email, s.phone, s.whatsapp, s.website, s.contact_name as contactName, s.contact_email as contactEmail, s.contact_phone as contactPhone, s.zip_code as zipCode, s.address, s.city, s.state,'
          : 's.contact_email as email, s.contact_phone as phone, s.contact_whatsapp as whatsapp, s.website, s.contact_name as contactName, s.contact_email as contactEmail, s.contact_phone as contactPhone, s.address_postal_code as zipCode, s.address_street as address, s.address_city as city, s.address_state as state,';
        const propertyIdSelectGetById = hasPropertyIdColumn ? 's.property_id as propertyId,' : 'NULL as propertyId,';

        let query: string;
        if (hasCategoryIdColumn) {
          query = `
            SELECT 
              s.id,
              s.uuid,
              ${propertyIdSelectGetById}
              s.code,
              s.category_id as categoryId,
              s.name,
              s.trade_name as tradeName,
              ${docSelect}
              s.state_registration as stateRegistration,
              ${contactSelectGetById}
              s.payment_terms as paymentTerms,
              s.delivery_days as deliveryDays,
              s.min_order_value as minOrderValue,
              s.notes,
              s.status,
              s.created_at as createdAt,
              s.updated_at as updatedAt,
              sc.id as category_id,
              sc.code as category_code,
              sc.name as category_name,
              sc.icon as category_icon,
              sc.color_from as category_color_from,
              sc.color_to as category_color_to
            FROM suppliers s
            LEFT JOIN supplier_categories sc ON sc.id = s.category_id
            WHERE s.id = ?
          `;
        } else {
          query = `
            SELECT 
              s.id,
              s.uuid,
              ${propertyIdSelectGetById}
              s.code,
              NULL as categoryId,
              s.category,
              s.name,
              s.trade_name as tradeName,
              ${docSelect}
              s.state_registration as stateRegistration,
              ${contactSelectGetById}
              s.payment_terms as paymentTerms,
              s.delivery_days as deliveryDays,
              s.min_order_value as minOrderValue,
              s.notes,
              s.status,
              s.created_at as createdAt,
              s.updated_at as updatedAt,
              sc.id as category_id,
              sc.code as category_code,
              sc.name as category_name,
              sc.icon as category_icon,
              sc.color_from as category_color_from,
              sc.color_to as category_color_to
            FROM suppliers s
            LEFT JOIN supplier_categories sc ON sc.code = s.category
            WHERE s.id = ?
          `;
        }

        const results = await queryRunner.query(query, [parseInt(id, 10)]);

        if (results.length === 0) {
          throw new AppError('Fornecedor não encontrado', 404);
        }

        const row = results[0];

        // Mapear categoryId: se não existe category_id, buscar pelo código da categoria
        let finalCategoryId = row.categoryId;
        if (!finalCategoryId && row.category && row.category_id) {
          finalCategoryId = row.category_id;
        }

        const supplierResponse: SupplierResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          code: row.code,
          categoryId: finalCategoryId,
          category: row.category_id ? {
            id: row.category_id,
            code: row.category_code,
            name: row.category_name,
            icon: row.category_icon,
            colorFrom: row.category_color_from,
            colorTo: row.category_color_to,
          } : undefined,
          name: row.name,
          tradeName: row.tradeName,
          cnpj: row.documentNumber ?? row.cnpj,
          stateRegistration: row.stateRegistration,
          email: row.email,
          phone: row.phone,
          whatsapp: row.whatsapp,
          website: row.website,
          contactName: row.contactName,
          contactEmail: row.contactEmail,
          contactPhone: row.contactPhone,
          zipCode: row.zipCode,
          address: row.address,
          city: row.city,
          state: row.state,
          paymentTerms: row.paymentTerms ? Number(row.paymentTerms) : null,
          deliveryDays: row.deliveryDays ? Number(row.deliveryDays) : null,
          minOrderValue: row.minOrderValue ? Number(row.minOrderValue) : null,
          notes: row.notes,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: supplierResponse,
        });
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateSupplierInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar se a tabela supplier_categories existe e se a categoria existe
        const categoryCheck = await queryRunner.query(
          `SELECT id FROM supplier_categories WHERE id = ?`,
          [data.categoryId]
        );

        if (categoryCheck.length === 0) {
          throw new AppError('Categoria não encontrada', 400);
        }

        // Verificar qual estrutura está sendo usada (category_id vs coluna ENUM category)
        let hasCategoryIdColumn = false;
        try {
          await queryRunner.query('SELECT category_id FROM suppliers LIMIT 0');
          hasCategoryIdColumn = true;
        } catch {
          // Tabela usa coluna ENUM category
        }
        let hasDocumentColumns = false;
        try {
          await queryRunner.query('SELECT document_type, document_number FROM suppliers LIMIT 0');
          hasDocumentColumns = true;
        } catch {
          // Tabela usa coluna cnpj
        }
        // Contato/endereço: flat (email, phone, whatsapp, address, city, state, zip_code) vs contact_* (contact_email, contact_phone, contact_whatsapp, address_street, address_city, address_state, address_postal_code)
        let hasFlatContactColumns = false;
        try {
          await queryRunner.query('SELECT whatsapp FROM suppliers LIMIT 0');
          hasFlatContactColumns = true;
        } catch {
          // Tabela usa contact_whatsapp, address_*, etc.
        }
        // company_name: tabela 004_merge exige NOT NULL; API envia name (razão social) -> preencher company_name com data.name
        let hasCompanyNameColumn = false;
        try {
          await queryRunner.query('SELECT company_name FROM suppliers LIMIT 0');
          hasCompanyNameColumn = true;
        } catch {
          // Tabela não tem company_name
        }
        let hasPropertyIdColumnCreate = false;
        try {
          await queryRunner.query('SELECT property_id FROM suppliers LIMIT 0');
          hasPropertyIdColumnCreate = true;
        } catch {
          // Tabela não tem property_id
        }
        const docType = documentTypeFromNumber(data.cnpj);

        // Gerar código se não fornecido (baseado no nome)
        let code = data.code;
        if (!code || code.trim() === '') {
          const namePrefix = data.name.substring(0, 3).toUpperCase().replace(/\s/g, '');
          const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          code = `${namePrefix}${randomSuffix}`;
          
          // Verificar se código já existe
          const existingCode = await queryRunner.query(
            `SELECT id FROM suppliers WHERE code = ?`,
            [code]
          );
          
          if (existingCode.length > 0) {
            code = `${namePrefix}${Date.now().toString().slice(-3)}`;
          }
        }

        // Montar endereço completo se necessário
        const addressParts = [
          data.address
        ].filter(Boolean);
        const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

        const uuid = uuidv4();
        
        // Buscar o código da categoria para usar no ENUM se necessário
        let categoryCode = null;
        if (!hasCategoryIdColumn) {
          const categoryData = await queryRunner.query(
            `SELECT code FROM supplier_categories WHERE id = ?`,
            [data.categoryId]
          );
          if (categoryData.length > 0) {
            categoryCode = categoryData[0].code;
          }
        }

        // Construir query baseado na estrutura disponível
        let insertQuery: string;
        let insertParams: any[];

        const docCols = hasDocumentColumns
          ? 'document_type, document_number,'
          : 'cnpj,';
        const docVals = hasDocumentColumns ? '?, ?,' : '?,';
        const docParams = hasDocumentColumns
          ? [docType, data.cnpj || null]
          : [data.cnpj || null];

        const contactCols = hasFlatContactColumns
          ? 'email, phone, whatsapp, website, contact_name, contact_email, contact_phone, zip_code, address, city, state,'
          : 'contact_name, contact_email, contact_phone, contact_whatsapp, website, address_street, address_city, address_state, address_postal_code,';
        const contactVals = hasFlatContactColumns
          ? '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,'
          : '?, ?, ?, ?, ?, ?, ?, ?, ?,';
        const contactParams = hasFlatContactColumns
          ? [data.email || null, data.phone || null, data.whatsapp || null, data.website || null, data.contactName || null, data.contactEmail || null, data.contactPhone || null, data.zipCode || null, fullAddress, data.city || null, data.state || null]
          : [data.contactName || null, data.email || null, data.phone || null, data.whatsapp || null, data.website || null, fullAddress, data.city || null, data.state || null, data.zipCode || null];

        const nameCols = hasCompanyNameColumn ? 'name, company_name, trade_name,' : 'name, trade_name,';
        const nameVals = hasCompanyNameColumn ? '?, ?, ?,' : '?, ?,';
        const nameParams = hasCompanyNameColumn ? [data.name, data.name, data.tradeName || null] : [data.name, data.tradeName || null];

        const propIdCol = hasPropertyIdColumnCreate ? 'property_id, ' : '';
        const propIdVal = hasPropertyIdColumnCreate ? '?, ' : '';
        const propIdParam = hasPropertyIdColumnCreate ? [data.propertyId ?? null] : [];
        if (hasCategoryIdColumn) {
          insertQuery = `
            INSERT INTO suppliers (
              uuid, ${propIdCol}code, category_id, ${nameCols} ${docCols} state_registration,
              ${contactCols}
              payment_terms, delivery_days, min_order_value, notes, status,
              created_at, updated_at
            ) VALUES (?, ${propIdVal}?, ?, ${nameVals} ${docVals} ?, ${contactVals} ?, ?, ?, ?, ?, NOW(), NOW())
          `;
          insertParams = [
            uuid,
            ...propIdParam,
            code,
            data.categoryId,
            ...nameParams,
            ...docParams,
            data.stateRegistration || null,
            ...contactParams,
            data.paymentTerms || null,
            data.deliveryDays || null,
            data.minOrderValue || null,
            data.notes || null,
            data.status || 'active',
          ];
        } else {
          if (!categoryCode) {
            throw new AppError('Não foi possível determinar o código da categoria. Execute o script de migração SQL.', 400);
          }
          insertQuery = `
            INSERT INTO suppliers (
              uuid, ${propIdCol}code, category, ${nameCols} ${docCols} state_registration,
              ${contactCols}
              payment_terms, delivery_days, min_order_value, notes, status,
              created_at, updated_at
            ) VALUES (?, ${propIdVal}?, ?, ${nameVals} ${docVals} ?, ${contactVals} ?, ?, ?, ?, ?, NOW(), NOW())
          `;
          insertParams = [
            uuid,
            ...propIdParam,
            code,
            categoryCode,
            ...nameParams,
            ...docParams,
            data.stateRegistration || null,
            ...contactParams,
            data.paymentTerms || null,
            data.deliveryDays || null,
            data.minOrderValue || null,
            data.notes || null,
            data.status || 'active',
          ];
        }

        const result = await queryRunner.query(insertQuery, insertParams);
        const supplierId = result.insertId;

        await queryRunner.commitTransaction();

        // Buscar fornecedor criado com categoria
        const docSelectCreate = hasDocumentColumns
          ? 's.document_type as documentType, s.document_number as documentNumber,'
          : 's.cnpj,';
        const contactSelectCreate = hasFlatContactColumns
          ? 's.email, s.phone, s.whatsapp, s.website, s.contact_name as contactName, s.contact_email as contactEmail, s.contact_phone as contactPhone, s.zip_code as zipCode, s.address, s.city, s.state,'
          : 's.contact_email as email, s.contact_phone as phone, s.contact_whatsapp as whatsapp, s.website, s.contact_name as contactName, s.contact_email as contactEmail, s.contact_phone as contactPhone, s.address_postal_code as zipCode, s.address_street as address, s.address_city as city, s.address_state as state,';
        const propertyIdSelectCreate = hasPropertyIdColumnCreate ? 's.property_id as propertyId,' : 'NULL as propertyId,';
        let selectQuery: string;
        if (hasCategoryIdColumn) {
          selectQuery = `
            SELECT 
              s.id, s.uuid, ${propertyIdSelectCreate} s.code, s.category_id as categoryId, s.name, s.trade_name as tradeName, ${docSelectCreate}
              s.state_registration as stateRegistration, ${contactSelectCreate}
              s.payment_terms as paymentTerms,
              s.delivery_days as deliveryDays, s.min_order_value as minOrderValue, s.notes, s.status,
              s.created_at as createdAt, s.updated_at as updatedAt,
              sc.id as category_id, sc.code as category_code, sc.name as category_name,
              sc.icon as category_icon, sc.color_from as category_color_from, sc.color_to as category_color_to
            FROM suppliers s
            LEFT JOIN supplier_categories sc ON sc.id = s.category_id
            WHERE s.id = ?
          `;
        } else {
          selectQuery = `
            SELECT 
              s.id, s.uuid, ${propertyIdSelectCreate} s.code, NULL as categoryId, s.category, s.name, s.trade_name as tradeName, ${docSelectCreate}
              s.state_registration as stateRegistration, ${contactSelectCreate}
              s.payment_terms as paymentTerms,
              s.delivery_days as deliveryDays, s.min_order_value as minOrderValue, s.notes, s.status,
              s.created_at as createdAt, s.updated_at as updatedAt,
              sc.id as category_id, sc.code as category_code, sc.name as category_name,
              sc.icon as category_icon, sc.color_from as category_color_from, sc.color_to as category_color_to
            FROM suppliers s
            LEFT JOIN supplier_categories sc ON sc.code = s.category
            WHERE s.id = ?
          `;
        }

        const createdSupplier = await queryRunner.query(selectQuery, [supplierId]);
        await queryRunner.release();

        const row = createdSupplier[0];
        
        // Mapear categoryId: se não existe category_id, buscar pelo código da categoria
        let finalCategoryId = row.categoryId;
        if (!finalCategoryId && row.category && row.category_id) {
          finalCategoryId = row.category_id;
        }
        
        const supplierResponse: SupplierResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          code: row.code,
          categoryId: finalCategoryId || data.categoryId, // Usar o ID original se não vier na query
          category: row.category_id ? {
            id: row.category_id,
            code: row.category_code,
            name: row.category_name,
            icon: row.category_icon,
            colorFrom: row.category_color_from,
            colorTo: row.category_color_to,
          } : undefined,
          name: row.name,
          tradeName: row.tradeName,
          cnpj: row.documentNumber ?? row.cnpj,
          stateRegistration: row.stateRegistration,
          email: row.email,
          phone: row.phone,
          whatsapp: row.whatsapp,
          website: row.website,
          contactName: row.contactName,
          contactEmail: row.contactEmail,
          contactPhone: row.contactPhone,
          zipCode: row.zipCode,
          address: row.address,
          city: row.city,
          state: row.state,
          paymentTerms: row.paymentTerms ? Number(row.paymentTerms) : null,
          deliveryDays: row.deliveryDays ? Number(row.deliveryDays) : null,
          minOrderValue: row.minOrderValue ? Number(row.minOrderValue) : null,
          notes: row.notes,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.status(201).json({
          success: true,
          data: supplierResponse,
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateSupplierInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar qual estrutura está sendo usada (category_id vs coluna ENUM category)
        let hasCategoryIdColumn = false;
        try {
          await queryRunner.query('SELECT category_id FROM suppliers LIMIT 0');
          hasCategoryIdColumn = true;
        } catch {
          // Tabela usa coluna ENUM category
        }
        let hasDocumentColumns = false;
        try {
          await queryRunner.query('SELECT document_type, document_number FROM suppliers LIMIT 0');
          hasDocumentColumns = true;
        } catch {
          // Tabela usa coluna cnpj
        }
        let hasFlatContactColumns = false;
        try {
          await queryRunner.query('SELECT whatsapp FROM suppliers LIMIT 0');
          hasFlatContactColumns = true;
        } catch {
          // Tabela usa contact_whatsapp, address_*, etc.
        }
        let hasPropertyIdColumnUpdate = false;
        try {
          await queryRunner.query('SELECT property_id FROM suppliers LIMIT 0');
          hasPropertyIdColumnUpdate = true;
        } catch {
          // Tabela não tem property_id
        }
        let hasCompanyNameColumnUpdate = false;
        try {
          await queryRunner.query('SELECT company_name FROM suppliers LIMIT 0');
          hasCompanyNameColumnUpdate = true;
        } catch {
          // Tabela não tem company_name
        }
        const docSelectUpdate = hasDocumentColumns
          ? 's.document_type as documentType, s.document_number as documentNumber,'
          : 's.cnpj,';
        const contactSelectUpdate = hasFlatContactColumns
          ? 's.email, s.phone, s.whatsapp, s.website, s.contact_name as contactName, s.contact_email as contactEmail, s.contact_phone as contactPhone, s.zip_code as zipCode, s.address, s.city, s.state,'
          : 's.contact_email as email, s.contact_phone as phone, s.contact_whatsapp as whatsapp, s.website, s.contact_name as contactName, s.contact_email as contactEmail, s.contact_phone as contactPhone, s.address_postal_code as zipCode, s.address_street as address, s.address_city as city, s.address_state as state,';
        const propertyIdSelectUpdate = hasPropertyIdColumnUpdate ? 's.property_id as propertyId,' : 'NULL as propertyId,';

        // Verificar se o fornecedor existe
        const checkQuery = `SELECT id FROM suppliers WHERE id = ?`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Fornecedor não encontrado', 404);
        }

        // Se estiver alterando a categoria, verificar se existe
        let categoryCode: string | null = null;
        if (data.categoryId !== undefined) {
          const categoryCheck = await queryRunner.query(
            `SELECT id, code FROM supplier_categories WHERE id = ?`,
            [data.categoryId]
          );

          if (categoryCheck.length === 0) {
            throw new AppError('Categoria não encontrada', 400);
          }

          if (!hasCategoryIdColumn && categoryCheck.length > 0) {
            categoryCode = categoryCheck[0].code;
          }
        }

        // Montar endereço completo se necessário
        const addressParts = [
          data.address
        ].filter(Boolean);
        const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : (data.address || null);

        // Construir query de update dinamicamente
        const updateFields: string[] = [];
        const updateParams: any[] = [];

        if (hasPropertyIdColumnUpdate && data.propertyId !== undefined) { updateFields.push('property_id = ?'); updateParams.push(data.propertyId); }
        if (data.code !== undefined) { updateFields.push('code = ?'); updateParams.push(data.code); }
        if (data.categoryId !== undefined) {
          if (hasCategoryIdColumn) {
            updateFields.push('category_id = ?');
            updateParams.push(data.categoryId);
          } else {
            if (categoryCode) {
              updateFields.push('category = ?');
              updateParams.push(categoryCode);
            } else {
              throw new AppError('Não foi possível determinar o código da categoria. Execute o script de migração SQL.', 400);
            }
          }
        }
        if (data.name !== undefined) {
          updateFields.push('name = ?'); updateParams.push(data.name);
          if (hasCompanyNameColumnUpdate) { updateFields.push('company_name = ?'); updateParams.push(data.name); }
        }
        if (data.tradeName !== undefined) { updateFields.push('trade_name = ?'); updateParams.push(data.tradeName); }
        if (data.cnpj !== undefined) {
          if (hasDocumentColumns) {
            const docType = documentTypeFromNumber(data.cnpj);
            updateFields.push('document_type = ?'); updateParams.push(docType);
            updateFields.push('document_number = ?'); updateParams.push(data.cnpj);
          } else {
            updateFields.push('cnpj = ?'); updateParams.push(data.cnpj);
          }
        }
        if (data.stateRegistration !== undefined) { updateFields.push('state_registration = ?'); updateParams.push(data.stateRegistration); }
        if (data.email !== undefined) {
          if (hasFlatContactColumns) { updateFields.push('email = ?'); updateParams.push(data.email); }
          else { updateFields.push('contact_email = ?'); updateParams.push(data.email); }
        }
        if (data.phone !== undefined) {
          if (hasFlatContactColumns) { updateFields.push('phone = ?'); updateParams.push(data.phone); }
          else { updateFields.push('contact_phone = ?'); updateParams.push(data.phone); }
        }
        if (data.whatsapp !== undefined) {
          if (hasFlatContactColumns) { updateFields.push('whatsapp = ?'); updateParams.push(data.whatsapp); }
          else { updateFields.push('contact_whatsapp = ?'); updateParams.push(data.whatsapp); }
        }
        if (data.website !== undefined) { updateFields.push('website = ?'); updateParams.push(data.website); }
        if (data.contactName !== undefined) { updateFields.push('contact_name = ?'); updateParams.push(data.contactName); }
        if (data.contactEmail !== undefined) { updateFields.push('contact_email = ?'); updateParams.push(data.contactEmail); }
        if (data.contactPhone !== undefined) { updateFields.push('contact_phone = ?'); updateParams.push(data.contactPhone); }
        if (data.zipCode !== undefined) {
          if (hasFlatContactColumns) { updateFields.push('zip_code = ?'); updateParams.push(data.zipCode); }
          else { updateFields.push('address_postal_code = ?'); updateParams.push(data.zipCode); }
        }
        if (fullAddress !== undefined) {
          if (hasFlatContactColumns) { updateFields.push('address = ?'); updateParams.push(fullAddress); }
          else { updateFields.push('address_street = ?'); updateParams.push(fullAddress); }
        }
        if (data.city !== undefined) {
          if (hasFlatContactColumns) { updateFields.push('city = ?'); updateParams.push(data.city); }
          else { updateFields.push('address_city = ?'); updateParams.push(data.city); }
        }
        if (data.state !== undefined) {
          if (hasFlatContactColumns) { updateFields.push('state = ?'); updateParams.push(data.state); }
          else { updateFields.push('address_state = ?'); updateParams.push(data.state); }
        }
        if (data.paymentTerms !== undefined) { updateFields.push('payment_terms = ?'); updateParams.push(data.paymentTerms); }
        if (data.deliveryDays !== undefined) { updateFields.push('delivery_days = ?'); updateParams.push(data.deliveryDays); }
        if (data.minOrderValue !== undefined) { updateFields.push('min_order_value = ?'); updateParams.push(data.minOrderValue); }
        if (data.notes !== undefined) { updateFields.push('notes = ?'); updateParams.push(data.notes); }
        if (data.status !== undefined) { updateFields.push('status = ?'); updateParams.push(data.status); }

        updateFields.push('updated_at = NOW()');
        updateParams.push(parseInt(id, 10));

        if (updateFields.length === 1) {
          throw new AppError('Nenhum campo para atualizar', 400);
        }

        const updateQuery = `UPDATE suppliers SET ${updateFields.join(', ')} WHERE id = ?`;
        await queryRunner.query(updateQuery, updateParams);

        await queryRunner.commitTransaction();

        // Buscar fornecedor atualizado com categoria
        let selectQuery: string;
        if (hasCategoryIdColumn) {
          selectQuery = `
            SELECT 
              s.id, s.uuid, ${propertyIdSelectUpdate} s.code, s.category_id as categoryId, s.name, s.trade_name as tradeName, ${docSelectUpdate}
              s.state_registration as stateRegistration, ${contactSelectUpdate}
              s.payment_terms as paymentTerms,
              s.delivery_days as deliveryDays, s.min_order_value as minOrderValue, s.notes, s.status,
              s.created_at as createdAt, s.updated_at as updatedAt,
              sc.id as category_id, sc.code as category_code, sc.name as category_name,
              sc.icon as category_icon, sc.color_from as category_color_from, sc.color_to as category_color_to
            FROM suppliers s
            LEFT JOIN supplier_categories sc ON sc.id = s.category_id
            WHERE s.id = ?
          `;
        } else {
          selectQuery = `
            SELECT 
              s.id, s.uuid, ${propertyIdSelectUpdate} s.code, NULL as categoryId, s.category, s.name, s.trade_name as tradeName, ${docSelectUpdate}
              s.state_registration as stateRegistration, ${contactSelectUpdate}
              s.payment_terms as paymentTerms,
              s.delivery_days as deliveryDays, s.min_order_value as minOrderValue, s.notes, s.status,
              s.created_at as createdAt, s.updated_at as updatedAt,
              sc.id as category_id, sc.code as category_code, sc.name as category_name,
              sc.icon as category_icon, sc.color_from as category_color_from, sc.color_to as category_color_to
            FROM suppliers s
            LEFT JOIN supplier_categories sc ON sc.code = s.category
            WHERE s.id = ?
          `;
        }

        const updatedSupplier = await queryRunner.query(selectQuery, [parseInt(id, 10)]);
        await queryRunner.release();

        const row = updatedSupplier[0];
        
        // Mapear categoryId: se não existe category_id, buscar pelo código da categoria
        let finalCategoryId = row.categoryId;
        if (!finalCategoryId && row.category && row.category_id) {
          finalCategoryId = row.category_id;
        }
        if (!finalCategoryId && data.categoryId !== undefined) {
          finalCategoryId = data.categoryId;
        }
        
        const supplierResponse: SupplierResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          code: row.code,
          categoryId: finalCategoryId,
          category: row.category_id ? {
            id: row.category_id,
            code: row.category_code,
            name: row.category_name,
            icon: row.category_icon,
            colorFrom: row.category_color_from,
            colorTo: row.category_color_to,
          } : undefined,
          name: row.name,
          tradeName: row.tradeName,
          cnpj: row.documentNumber ?? row.cnpj,
          stateRegistration: row.stateRegistration,
          email: row.email,
          phone: row.phone,
          whatsapp: row.whatsapp,
          website: row.website,
          contactName: row.contactName,
          contactEmail: row.contactEmail,
          contactPhone: row.contactPhone,
          zipCode: row.zipCode,
          address: row.address,
          city: row.city,
          state: row.state,
          paymentTerms: row.paymentTerms ? Number(row.paymentTerms) : null,
          deliveryDays: row.deliveryDays ? Number(row.deliveryDays) : null,
          minOrderValue: row.minOrderValue ? Number(row.minOrderValue) : null,
          notes: row.notes,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: supplierResponse,
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();

      try {
        // Verificar se o fornecedor existe
        const checkQuery = `SELECT id, name FROM suppliers WHERE id = ?`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Fornecedor não encontrado', 404);
        }

        // Soft delete
        const deleteQuery = `DELETE FROM suppliers WHERE id = ?`;
        await queryRunner.query(deleteQuery, [parseInt(id, 10)]);

        await queryRunner.release();

        res.json({
          success: true,
          message: 'Fornecedor excluído com sucesso',
        });
      } catch (error) {
        await queryRunner.release();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }
}
