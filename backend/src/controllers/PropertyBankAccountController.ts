import { NextFunction, Response } from 'express';
import { randomUUID } from 'crypto';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';

type AccountType = 'checking' | 'savings' | 'payment';
type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export class PropertyBankAccountController {
  private async ensureTable(queryRunner: any): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS property_bank_accounts (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid VARCHAR(36) NOT NULL,
        property_id INT(10) UNSIGNED NOT NULL,
        bank_name VARCHAR(120) NOT NULL,
        account_holder VARCHAR(255) NOT NULL,
        holder_document VARCHAR(30) DEFAULT NULL,
        account_type ENUM('checking','savings','payment') NOT NULL DEFAULT 'checking',
        branch VARCHAR(20) DEFAULT NULL,
        account_number VARCHAR(30) NOT NULL,
        account_digit VARCHAR(10) DEFAULT NULL,
        pix_key_type ENUM('cpf','cnpj','email','phone','random') DEFAULT NULL,
        pix_key VARCHAR(255) DEFAULT NULL,
        is_default TINYINT(1) NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        notes TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uk_property_bank_accounts_uuid (uuid),
        KEY idx_property_bank_accounts_property (property_id),
        KEY idx_property_bank_accounts_active (is_active),
        CONSTRAINT fk_property_bank_accounts_property
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await this.ensureTable(queryRunner);

      const propertyIdParam = req.query.propertyId ? Number(req.query.propertyId) : null;
      const params: unknown[] = [];
      let where = 'WHERE pba.deleted_at IS NULL';

      if (propertyIdParam && Number.isFinite(propertyIdParam)) {
        where += ' AND pba.property_id = ?';
        params.push(propertyIdParam);
      }

      const rows = await queryRunner.query(
        `
        SELECT
          pba.id,
          pba.uuid,
          pba.property_id AS propertyId,
          p.name AS propertyName,
          pba.bank_name AS bankName,
          pba.account_holder AS accountHolder,
          pba.holder_document AS holderDocument,
          pba.account_type AS accountType,
          pba.branch,
          pba.account_number AS accountNumber,
          pba.account_digit AS accountDigit,
          pba.pix_key_type AS pixKeyType,
          pba.pix_key AS pixKey,
          pba.is_default AS isDefault,
          pba.is_active AS isActive,
          pba.notes,
          pba.created_at AS createdAt,
          pba.updated_at AS updatedAt
        FROM property_bank_accounts pba
        INNER JOIN properties p ON p.id = pba.property_id AND p.deleted_at IS NULL
        ${where}
        ORDER BY p.name ASC, pba.is_default DESC, pba.bank_name ASC
        `,
        params
      );

      res.json({
        success: true,
        data: {
          accounts: rows.map((row: any) => ({
            ...row,
            isDefault: Boolean(row.isDefault),
            isActive: Boolean(row.isActive),
          })),
        },
      });
    } catch (error) {
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async createOrUpdate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.ensureTable(queryRunner);
      const {
        id,
        propertyId,
        bankName,
        accountHolder,
        holderDocument,
        accountType,
        branch,
        accountNumber,
        accountDigit,
        pixKeyType,
        pixKey,
        isDefault,
        isActive,
        notes,
      } = req.body as Record<string, unknown>;

      const pid = Number(propertyId);
      if (!pid || !Number.isFinite(pid) || pid <= 0) {
        throw new AppError('propertyId inválido.', 400);
      }
      if (!String(bankName || '').trim()) throw new AppError('Banco é obrigatório.', 400);
      if (!String(accountHolder || '').trim()) throw new AppError('Titular é obrigatório.', 400);
      if (!String(accountNumber || '').trim()) throw new AppError('Número da conta é obrigatório.', 400);

      const type = String(accountType || 'checking') as AccountType;
      if (!['checking', 'savings', 'payment'].includes(type)) {
        throw new AppError('Tipo de conta inválido.', 400);
      }

      const pixTypeRaw = pixKeyType == null || String(pixKeyType).trim() === '' ? null : String(pixKeyType);
      if (pixTypeRaw && !['cpf', 'cnpj', 'email', 'phone', 'random'].includes(pixTypeRaw)) {
        throw new AppError('Tipo de chave PIX inválido.', 400);
      }

      const defaultFlag = Boolean(isDefault) ? 1 : 0;
      const activeFlag = isActive === false ? 0 : 1;
      const cleanId = id ? Number(id) : null;

      if (defaultFlag) {
        if (cleanId && Number.isFinite(cleanId)) {
          await queryRunner.query(
            `UPDATE property_bank_accounts
                SET is_default = 0
              WHERE property_id = ?
                AND id <> ?
                AND deleted_at IS NULL`,
            [pid, cleanId]
          );
        } else {
          await queryRunner.query(
            `UPDATE property_bank_accounts
                SET is_default = 0
              WHERE property_id = ?
                AND deleted_at IS NULL`,
            [pid]
          );
        }
      }

      if (cleanId && Number.isFinite(cleanId)) {
        await queryRunner.query(
          `
          UPDATE property_bank_accounts
          SET
            property_id = ?,
            bank_name = ?,
            account_holder = ?,
            holder_document = ?,
            account_type = ?,
            branch = ?,
            account_number = ?,
            account_digit = ?,
            pix_key_type = ?,
            pix_key = ?,
            is_default = ?,
            is_active = ?,
            notes = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND deleted_at IS NULL
          `,
          [
            pid,
            String(bankName).trim(),
            String(accountHolder).trim(),
            holderDocument ? String(holderDocument).trim() : null,
            type,
            branch ? String(branch).trim() : null,
            String(accountNumber).trim(),
            accountDigit ? String(accountDigit).trim() : null,
            pixTypeRaw as PixKeyType | null,
            pixKey ? String(pixKey).trim() : null,
            defaultFlag,
            activeFlag,
            notes ? String(notes).trim() : null,
            cleanId,
          ]
        );
      } else {
        await queryRunner.query(
          `
          INSERT INTO property_bank_accounts (
            uuid, property_id, bank_name, account_holder, holder_document,
            account_type, branch, account_number, account_digit, pix_key_type, pix_key,
            is_default, is_active, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            randomUUID(),
            pid,
            String(bankName).trim(),
            String(accountHolder).trim(),
            holderDocument ? String(holderDocument).trim() : null,
            type,
            branch ? String(branch).trim() : null,
            String(accountNumber).trim(),
            accountDigit ? String(accountDigit).trim() : null,
            pixTypeRaw as PixKeyType | null,
            pixKey ? String(pixKey).trim() : null,
            defaultFlag,
            activeFlag,
            notes ? String(notes).trim() : null,
          ]
        );
      }

      await queryRunner.commitTransaction();
      res.json({ success: true, message: 'Conta bancária salva com sucesso.' });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      next(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.ensureTable(queryRunner);
      const id = Number(req.params.id);
      if (!id || !Number.isFinite(id)) throw new AppError('ID inválido.', 400);

      await queryRunner.query(
        `UPDATE property_bank_accounts
            SET deleted_at = CURRENT_TIMESTAMP, is_active = 0, is_default = 0
          WHERE id = ? AND deleted_at IS NULL`,
        [id]
      );

      await queryRunner.commitTransaction();
      res.json({ success: true, message: 'Conta bancária removida com sucesso.' });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      next(error);
    } finally {
      await queryRunner.release();
    }
  }
}

