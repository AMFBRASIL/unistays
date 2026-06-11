import { Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateChartOfAccountInput, UpdateChartOfAccountInput } from '@/validators/chartOfAccounts.validator';
import { v4 as uuidv4 } from 'uuid';

interface ChartOfAccountResponse {
  id: number;
  uuid: string;
  code: string;
  name: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string | null;
  parentAccountId: number | null;
  parentAccount?: { id: number; name: string; code: string } | null;
  description: string | null;
  allowSubAccounts: boolean;
  allowTransactions: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ChartOfAccountsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, accountType, isActive } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          coa.id,
          coa.uuid,
          coa.code,
          coa.name,
          coa.account_type as accountType,
          coa.category,
          coa.parent_account_id as parentAccountId,
          coa.description,
          coa.allow_sub_accounts as allowSubAccounts,
          coa.allow_transactions as allowTransactions,
          coa.is_active as isActive,
          coa.created_at as createdAt,
          coa.updated_at as updatedAt,
          parent.id as parent_id,
          parent.name as parent_name,
          parent.code as parent_code
        FROM chart_of_accounts coa
        LEFT JOIN chart_of_accounts parent ON coa.parent_account_id = parent.id AND parent.deleted_at IS NULL
        WHERE coa.deleted_at IS NULL
      `;

      const params: any[] = [];

      if (search) {
        query += ` AND (
          coa.name LIKE ? OR 
          coa.code LIKE ? OR
          coa.description LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (accountType) {
        query += ` AND coa.account_type = ?`;
        params.push(accountType);
      }

      if (isActive !== undefined) {
        query += ` AND coa.is_active = ?`;
        params.push(isActive === 'true' ? 1 : 0);
      }

      // Ordenar por código (hierarquia natural)
      query += ` ORDER BY coa.code ASC`;

      const accounts = await queryRunner.query(query, params);
      await queryRunner.release();

      const accountsResponse: ChartOfAccountResponse[] = accounts.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        code: row.code,
        name: row.name,
        accountType: row.accountType,
        category: row.category,
        parentAccountId: row.parentAccountId,
        parentAccount: row.parent_id ? {
          id: row.parent_id,
          name: row.parent_name,
          code: row.parent_code,
        } : null,
        description: row.description,
        allowSubAccounts: row.allowSubAccounts === 1 || row.allowSubAccounts === true,
        allowTransactions: row.allowTransactions === 1 || row.allowTransactions === true,
        isActive: row.isActive === 1 || row.isActive === true,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { accounts: accountsResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      const query = `
        SELECT 
          coa.id,
          coa.uuid,
          coa.code,
          coa.name,
          coa.account_type as accountType,
          coa.category,
          coa.parent_account_id as parentAccountId,
          coa.description,
          coa.allow_sub_accounts as allowSubAccounts,
          coa.allow_transactions as allowTransactions,
          coa.is_active as isActive,
          coa.created_at as createdAt,
          coa.updated_at as updatedAt,
          parent.id as parent_id,
          parent.name as parent_name,
          parent.code as parent_code
        FROM chart_of_accounts coa
        LEFT JOIN chart_of_accounts parent ON coa.parent_account_id = parent.id AND parent.deleted_at IS NULL
        WHERE coa.id = ? AND coa.deleted_at IS NULL
      `;

      const results = await queryRunner.query(query, [parseInt(id, 10)]);
      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Conta contábil não encontrada', 404);
      }

      const row = results[0];

      const accountResponse: ChartOfAccountResponse = {
        id: row.id,
        uuid: row.uuid,
        code: row.code,
        name: row.name,
        accountType: row.accountType,
        category: row.category,
        parentAccountId: row.parentAccountId,
        parentAccount: row.parent_id ? {
          id: row.parent_id,
          name: row.parent_name,
          code: row.parent_code,
        } : null,
        description: row.description,
        allowSubAccounts: row.allowSubAccounts === 1 || row.allowSubAccounts === true,
        allowTransactions: row.allowTransactions === 1 || row.allowTransactions === true,
        isActive: row.isActive === 1 || row.isActive === true,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: accountResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const data: CreateChartOfAccountInput = req.body;

      // Verificar se código já existe
      const existingAccount = await queryRunner.query(
        `SELECT id FROM chart_of_accounts WHERE code = ? AND deleted_at IS NULL`,
        [data.code]
      );

      if (existingAccount.length > 0) {
        throw new AppError('Já existe uma conta contábil com este código', 400);
      }

      // Se parentAccountId foi fornecido, verificar se existe e se permite subcontas
      if (data.parentAccountId) {
        const parentAccount = await queryRunner.query(
          `SELECT id, allow_sub_accounts FROM chart_of_accounts WHERE id = ? AND deleted_at IS NULL`,
          [data.parentAccountId]
        );

        if (parentAccount.length === 0) {
          throw new AppError('Conta pai não encontrada', 404);
        }

        if (parentAccount[0].allow_sub_accounts === 0 || parentAccount[0].allow_sub_accounts === false) {
          throw new AppError('A conta pai não permite criação de subcontas', 400);
        }

        // Verificar se não está tentando criar loop circular
        // (conta não pode ser pai de si mesma, direta ou indiretamente)
        if (data.parentAccountId === data.parentAccountId) {
          // Isso não deveria acontecer na criação, mas deixamos a validação
        }
      }

      const uuid = uuidv4();

      const insertQuery = `
        INSERT INTO chart_of_accounts (
          uuid, code, name, account_type, category, 
          parent_account_id, description, 
          allow_sub_accounts, allow_transactions, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await queryRunner.query(insertQuery, [
        uuid,
        data.code,
        data.name,
        data.accountType,
        data.category || null,
        data.parentAccountId || null,
        data.description || null,
        data.allowSubAccounts !== undefined ? (data.allowSubAccounts ? 1 : 0) : 1,
        data.allowTransactions !== undefined ? (data.allowTransactions ? 1 : 0) : 1,
        data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
      ]);

      await queryRunner.commitTransaction();

      // Retornar conta criada
      const created = await queryRunner.query(
        `SELECT 
          id, uuid, code, name, account_type as accountType, category,
          parent_account_id as parentAccountId, description,
          allow_sub_accounts as allowSubAccounts,
          allow_transactions as allowTransactions,
          is_active as isActive,
          created_at as createdAt, updated_at as updatedAt
        FROM chart_of_accounts WHERE uuid = ?`,
        [uuid]
      );

      const row = created[0];
      const accountResponse: ChartOfAccountResponse = {
        id: row.id,
        uuid: row.uuid,
        code: row.code,
        name: row.name,
        accountType: row.accountType,
        category: row.category,
        parentAccountId: row.parentAccountId,
        description: row.description,
        allowSubAccounts: row.allowSubAccounts === 1 || row.allowSubAccounts === true,
        allowTransactions: row.allowTransactions === 1 || row.allowTransactions === true,
        isActive: row.isActive === 1 || row.isActive === true,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.status(201).json({
        success: true,
        data: accountResponse,
        message: 'Conta contábil criada com sucesso',
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id } = req.params;
      const data: UpdateChartOfAccountInput = req.body;

      // Verificar se conta existe
      const existingAccount = await queryRunner.query(
        `SELECT id, code FROM chart_of_accounts WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingAccount.length === 0) {
        throw new AppError('Conta contábil não encontrada', 404);
      }

      // Se código foi alterado, verificar se não existe outro com o mesmo código
      if (data.code && data.code !== existingAccount[0].code) {
        const codeExists = await queryRunner.query(
          `SELECT id FROM chart_of_accounts WHERE code = ? AND id != ? AND deleted_at IS NULL`,
          [data.code, parseInt(id, 10)]
        );

        if (codeExists.length > 0) {
          throw new AppError('Já existe uma conta contábil com este código', 400);
        }
      }

      // Se parentAccountId foi fornecido, verificar se existe e se permite subcontas
      if (data.parentAccountId !== undefined) {
        if (data.parentAccountId !== null) {
          // Verificar se não está tentando tornar a conta pai de si mesma
          if (data.parentAccountId === parseInt(id, 10)) {
            throw new AppError('Uma conta não pode ser pai de si mesma', 400);
          }

          const parentAccount = await queryRunner.query(
            `SELECT id, allow_sub_accounts FROM chart_of_accounts WHERE id = ? AND deleted_at IS NULL`,
            [data.parentAccountId]
          );

          if (parentAccount.length === 0) {
            throw new AppError('Conta pai não encontrada', 404);
          }

          if (parentAccount[0].allow_sub_accounts === 0 || parentAccount[0].allow_sub_accounts === false) {
            throw new AppError('A conta pai não permite criação de subcontas', 400);
          }

          // TODO: Verificar loops circulares (não permitir que a conta se torne avô de si mesma)
        }
      }

      // Construir UPDATE dinamicamente
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.code !== undefined) {
        updateFields.push('code = ?');
        updateValues.push(data.code);
      }
      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      if (data.accountType !== undefined) {
        updateFields.push('account_type = ?');
        updateValues.push(data.accountType);
      }
      if (data.category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(data.category);
      }
      if (data.parentAccountId !== undefined) {
        updateFields.push('parent_account_id = ?');
        updateValues.push(data.parentAccountId);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }
      if (data.allowSubAccounts !== undefined) {
        updateFields.push('allow_sub_accounts = ?');
        updateValues.push(data.allowSubAccounts ? 1 : 0);
      }
      if (data.allowTransactions !== undefined) {
        updateFields.push('allow_transactions = ?');
        updateValues.push(data.allowTransactions ? 1 : 0);
      }
      if (data.isActive !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(data.isActive ? 1 : 0);
      }

      if (updateFields.length === 0) {
        throw new AppError('Nenhum campo fornecido para atualização', 400);
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(parseInt(id, 10));

      const updateQuery = `UPDATE chart_of_accounts SET ${updateFields.join(', ')} WHERE id = ?`;

      await queryRunner.query(updateQuery, updateValues);
      await queryRunner.commitTransaction();

      // Retornar conta atualizada
      const updated = await queryRunner.query(
        `SELECT 
          coa.id, coa.uuid, coa.code, coa.name, coa.account_type as accountType, coa.category,
          coa.parent_account_id as parentAccountId, coa.description,
          coa.allow_sub_accounts as allowSubAccounts,
          coa.allow_transactions as allowTransactions,
          coa.is_active as isActive,
          coa.created_at as createdAt, coa.updated_at as updatedAt,
          parent.id as parent_id, parent.name as parent_name, parent.code as parent_code
        FROM chart_of_accounts coa
        LEFT JOIN chart_of_accounts parent ON coa.parent_account_id = parent.id AND parent.deleted_at IS NULL
        WHERE coa.id = ?`,
        [parseInt(id, 10)]
      );

      const row = updated[0];
      const accountResponse: ChartOfAccountResponse = {
        id: row.id,
        uuid: row.uuid,
        code: row.code,
        name: row.name,
        accountType: row.accountType,
        category: row.category,
        parentAccountId: row.parentAccountId,
        parentAccount: row.parent_id ? {
          id: row.parent_id,
          name: row.parent_name,
          code: row.parent_code,
        } : null,
        description: row.description,
        allowSubAccounts: row.allowSubAccounts === 1 || row.allowSubAccounts === true,
        allowTransactions: row.allowTransactions === 1 || row.allowTransactions === true,
        isActive: row.isActive === 1 || row.isActive === true,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: accountResponse,
        message: 'Conta contábil atualizada com sucesso',
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id } = req.params;

      // Verificar se conta existe
      const existingAccount = await queryRunner.query(
        `SELECT id FROM chart_of_accounts WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingAccount.length === 0) {
        throw new AppError('Conta contábil não encontrada', 404);
      }

      // Verificar se há subcontas (soft delete em cascata não funciona, então verificamos manualmente)
      const subAccounts = await queryRunner.query(
        `SELECT COUNT(*) as count FROM chart_of_accounts WHERE parent_account_id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (subAccounts[0].count > 0) {
        throw new AppError('Não é possível excluir uma conta que possui subcontas. Exclua as subcontas primeiro.', 400);
      }

      // Soft delete
      await queryRunner.query(
        `UPDATE chart_of_accounts SET deleted_at = NOW() WHERE id = ?`,
        [parseInt(id, 10)]
      );

      await queryRunner.commitTransaction();

      res.json({
        success: true,
        message: 'Conta contábil excluída com sucesso',
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      next(error);
    } finally {
      await queryRunner.release();
    }
  }
}
