import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateCompanyInput, UpdateCompanyInput } from '@/validators/company.validator';
import { v4 as uuidv4 } from 'uuid';

interface CompanyResponse {
  id: number;
  uuid: string;
  type: string;
  name: string;
  tradeName: string | null;
  cnpj: string | null;
  stateRegistration: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  zipCode: string | null;
  address: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  country: string;
  commissionPercentage: number | null;
  paymentTerms: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CompanyController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, type, status } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          id,
          uuid,
          type,
          name,
          trade_name as tradeName,
          cnpj,
          state_registration as stateRegistration,
          email,
          phone,
          website,
          contact_name as contactName,
          contact_email as contactEmail,
          contact_phone as contactPhone,
          zip_code as zipCode,
          address,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          country,
          commission_percentage as commissionPercentage,
          payment_terms as paymentTerms,
          notes,
          status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM companies
        WHERE deleted_at IS NULL
      `;

      const params: any[] = [];
      if (search) {
        query += ` AND (
          name LIKE ? OR 
          trade_name LIKE ? OR 
          cnpj LIKE ? OR 
          email LIKE ? OR
          phone LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
      if (type) {
        query += ` AND type = ?`;
        params.push(type);
      }
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC`;

      const companies = await queryRunner.query(query, params);
      await queryRunner.release();

      // Mapear resultados
      const companiesResponse: CompanyResponse[] = companies.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        type: row.type,
        name: row.name,
        tradeName: row.tradeName,
        cnpj: row.cnpj,
        stateRegistration: row.stateRegistration,
        email: row.email,
        phone: row.phone,
        website: row.website,
        contactName: row.contactName,
        contactEmail: row.contactEmail,
        contactPhone: row.contactPhone,
        zipCode: row.zipCode,
        address: row.address,
        street: row.street,
        number: row.number,
        complement: row.complement,
        neighborhood: row.neighborhood,
        city: row.city,
        state: row.state,
        country: row.country || 'Brasil',
        commissionPercentage: row.commissionPercentage ? Number(row.commissionPercentage) : null,
        paymentTerms: row.paymentTerms,
        notes: row.notes,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { companies: companiesResponse },
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
        const query = `
          SELECT 
            id,
            uuid,
            type,
            name,
            trade_name as tradeName,
            cnpj,
            state_registration as stateRegistration,
            email,
            phone,
            website,
            contact_name as contactName,
            contact_email as contactEmail,
            contact_phone as contactPhone,
            zip_code as zipCode,
            address,
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            country,
            commission_percentage as commissionPercentage,
            payment_terms as paymentTerms,
            notes,
            status,
            created_at as createdAt,
            updated_at as updatedAt
          FROM companies
          WHERE id = ? AND deleted_at IS NULL
        `;

        const results = await queryRunner.query(query, [parseInt(id, 10)]);

        if (results.length === 0) {
          throw new AppError('Empresa não encontrada', 404);
        }

        const row = results[0];

        const companyResponse: CompanyResponse = {
          id: row.id,
          uuid: row.uuid,
          type: row.type,
          name: row.name,
          tradeName: row.tradeName,
          cnpj: row.cnpj,
          stateRegistration: row.stateRegistration,
          email: row.email,
          phone: row.phone,
          website: row.website,
          contactName: row.contactName,
          contactEmail: row.contactEmail,
          contactPhone: row.contactPhone,
          zipCode: row.zipCode,
          address: row.address,
          street: row.street,
          number: row.number,
          complement: row.complement,
          neighborhood: row.neighborhood,
          city: row.city,
          state: row.state,
          country: row.country || 'Brasil',
          commissionPercentage: row.commissionPercentage ? Number(row.commissionPercentage) : null,
          paymentTerms: row.paymentTerms,
          notes: row.notes,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: companyResponse,
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
      const data: CreateCompanyInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Montar endereço completo se necessário
        const addressParts = [
          data.street,
          data.number,
          data.complement
        ].filter(Boolean);
        const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : (data.address || null);

        const uuid = uuidv4();
        const insertQuery = `
          INSERT INTO companies (
            uuid, type, name, trade_name, cnpj, state_registration,
            email, phone, website, contact_name, contact_email, contact_phone,
            zip_code, address, street, number, complement, neighborhood,
            city, state, country, commission_percentage, payment_terms, notes, status,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const insertParams: any[] = [
          uuid,
          data.type,
          data.name,
          data.tradeName || null,
          data.cnpj || null,
          data.stateRegistration || null,
          data.email || null,
          data.phone || null,
          data.website || null,
          data.contactName || null,
          data.contactEmail || null,
          data.contactPhone || null,
          data.zipCode || null,
          fullAddress,
          data.street || null,
          data.number || null,
          data.complement || null,
          data.neighborhood || null,
          data.city || null,
          data.state || null,
          data.country || 'Brasil',
          data.commissionPercentage || null,
          data.paymentTerms || null,
          data.notes || null,
          data.status || 'active',
        ];

        const result = await queryRunner.query(insertQuery, insertParams);
        const companyId = result.insertId;

        await queryRunner.commitTransaction();

        // Buscar empresa criada
        const selectQuery = `
          SELECT 
            id, uuid, type, name, trade_name as tradeName, cnpj,
            state_registration as stateRegistration, email, phone, website,
            contact_name as contactName, contact_email as contactEmail, contact_phone as contactPhone,
            zip_code as zipCode, address, street, number, complement, neighborhood,
            city, state, country, commission_percentage as commissionPercentage,
            payment_terms as paymentTerms, notes, status,
            created_at as createdAt, updated_at as updatedAt
          FROM companies
          WHERE id = ?
        `;

        const createdCompany = await queryRunner.query(selectQuery, [companyId]);
        await queryRunner.release();

        const row = createdCompany[0];
        const companyResponse: CompanyResponse = {
          id: row.id,
          uuid: row.uuid,
          type: row.type,
          name: row.name,
          tradeName: row.tradeName,
          cnpj: row.cnpj,
          stateRegistration: row.stateRegistration,
          email: row.email,
          phone: row.phone,
          website: row.website,
          contactName: row.contactName,
          contactEmail: row.contactEmail,
          contactPhone: row.contactPhone,
          zipCode: row.zipCode,
          address: row.address,
          street: row.street,
          number: row.number,
          complement: row.complement,
          neighborhood: row.neighborhood,
          city: row.city,
          state: row.state,
          country: row.country || 'Brasil',
          commissionPercentage: row.commissionPercentage ? Number(row.commissionPercentage) : null,
          paymentTerms: row.paymentTerms,
          notes: row.notes,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.status(201).json({
          success: true,
          data: companyResponse,
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
      const data: UpdateCompanyInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar se a empresa existe
        const checkQuery = `SELECT id FROM companies WHERE id = ? AND deleted_at IS NULL`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Empresa não encontrada', 404);
        }

        // Montar endereço completo se necessário
        const addressParts = [
          data.street,
          data.number,
          data.complement
        ].filter(Boolean);
        const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : (data.address || null);

        // Construir query de update dinamicamente
        const updateFields: string[] = [];
        const updateParams: any[] = [];

        if (data.type !== undefined) { updateFields.push('type = ?'); updateParams.push(data.type); }
        if (data.name !== undefined) { updateFields.push('name = ?'); updateParams.push(data.name); }
        if (data.tradeName !== undefined) { updateFields.push('trade_name = ?'); updateParams.push(data.tradeName); }
        if (data.cnpj !== undefined) { updateFields.push('cnpj = ?'); updateParams.push(data.cnpj); }
        if (data.stateRegistration !== undefined) { updateFields.push('state_registration = ?'); updateParams.push(data.stateRegistration); }
        if (data.email !== undefined) { updateFields.push('email = ?'); updateParams.push(data.email); }
        if (data.phone !== undefined) { updateFields.push('phone = ?'); updateParams.push(data.phone); }
        if (data.website !== undefined) { updateFields.push('website = ?'); updateParams.push(data.website); }
        if (data.contactName !== undefined) { updateFields.push('contact_name = ?'); updateParams.push(data.contactName); }
        if (data.contactEmail !== undefined) { updateFields.push('contact_email = ?'); updateParams.push(data.contactEmail); }
        if (data.contactPhone !== undefined) { updateFields.push('contact_phone = ?'); updateParams.push(data.contactPhone); }
        if (data.zipCode !== undefined) { updateFields.push('zip_code = ?'); updateParams.push(data.zipCode); }
        if (fullAddress !== undefined) { updateFields.push('address = ?'); updateParams.push(fullAddress); }
        if (data.street !== undefined) { updateFields.push('street = ?'); updateParams.push(data.street); }
        if (data.number !== undefined) { updateFields.push('number = ?'); updateParams.push(data.number); }
        if (data.complement !== undefined) { updateFields.push('complement = ?'); updateParams.push(data.complement); }
        if (data.neighborhood !== undefined) { updateFields.push('neighborhood = ?'); updateParams.push(data.neighborhood); }
        if (data.city !== undefined) { updateFields.push('city = ?'); updateParams.push(data.city); }
        if (data.state !== undefined) { updateFields.push('state = ?'); updateParams.push(data.state); }
        if (data.country !== undefined) { updateFields.push('country = ?'); updateParams.push(data.country); }
        if (data.commissionPercentage !== undefined) { updateFields.push('commission_percentage = ?'); updateParams.push(data.commissionPercentage); }
        if (data.paymentTerms !== undefined) { updateFields.push('payment_terms = ?'); updateParams.push(data.paymentTerms); }
        if (data.notes !== undefined) { updateFields.push('notes = ?'); updateParams.push(data.notes); }
        if (data.status !== undefined) { updateFields.push('status = ?'); updateParams.push(data.status); }

        updateFields.push('updated_at = NOW()');
        updateParams.push(parseInt(id, 10));

        if (updateFields.length === 1) {
          // Apenas updated_at foi adicionado, não há campos para atualizar
          throw new AppError('Nenhum campo para atualizar', 400);
        }

        const updateQuery = `UPDATE companies SET ${updateFields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
        await queryRunner.query(updateQuery, updateParams);

        await queryRunner.commitTransaction();

        // Buscar empresa atualizada
        const selectQuery = `
          SELECT 
            id, uuid, type, name, trade_name as tradeName, cnpj,
            state_registration as stateRegistration, email, phone, website,
            contact_name as contactName, contact_email as contactEmail, contact_phone as contactPhone,
            zip_code as zipCode, address, street, number, complement, neighborhood,
            city, state, country, commission_percentage as commissionPercentage,
            payment_terms as paymentTerms, notes, status,
            created_at as createdAt, updated_at as updatedAt
          FROM companies
          WHERE id = ?
        `;

        const updatedCompany = await queryRunner.query(selectQuery, [parseInt(id, 10)]);
        await queryRunner.release();

        const row = updatedCompany[0];
        const companyResponse: CompanyResponse = {
          id: row.id,
          uuid: row.uuid,
          type: row.type,
          name: row.name,
          tradeName: row.tradeName,
          cnpj: row.cnpj,
          stateRegistration: row.stateRegistration,
          email: row.email,
          phone: row.phone,
          website: row.website,
          contactName: row.contactName,
          contactEmail: row.contactEmail,
          contactPhone: row.contactPhone,
          zipCode: row.zipCode,
          address: row.address,
          street: row.street,
          number: row.number,
          complement: row.complement,
          neighborhood: row.neighborhood,
          city: row.city,
          state: row.state,
          country: row.country || 'Brasil',
          commissionPercentage: row.commissionPercentage ? Number(row.commissionPercentage) : null,
          paymentTerms: row.paymentTerms,
          notes: row.notes,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: companyResponse,
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
        // Verificar se a empresa existe
        const checkQuery = `SELECT id, name FROM companies WHERE id = ? AND deleted_at IS NULL`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Empresa não encontrada', 404);
        }

        // Soft delete
        const deleteQuery = `UPDATE companies SET deleted_at = NOW() WHERE id = ?`;
        await queryRunner.query(deleteQuery, [parseInt(id, 10)]);

        await queryRunner.release();

        res.json({
          success: true,
          message: 'Empresa excluída com sucesso',
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
