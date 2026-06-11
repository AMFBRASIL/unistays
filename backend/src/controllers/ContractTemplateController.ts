import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '@/config/database';
import { AppError } from '@/middlewares/error.middleware';
import { v4 as uuidv4 } from 'uuid';

type ContractStatus = 'draft' | 'active' | 'archived';

export class ContractTemplateController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const moduleKey = (req.query.moduleKey as string) || null;
      const propertyId = req.query.propertyId ? Number(req.query.propertyId) : null;

      const params: any[] = [];
      let where = 'WHERE 1=1';

      if (moduleKey) {
        where += ' AND ct.module_key = ?';
        params.push(moduleKey);
      }

      if (propertyId) {
        where += ' AND (ct.property_id = ? OR ct.property_id IS NULL)';
        params.push(propertyId);
      }

      const rows = await AppDataSource.query(
        `SELECT
          ct.id,
          ct.uuid,
          ct.property_id as propertyId,
          ct.module_key as moduleKey,
          ct.name,
          ct.description,
          ct.content,
          ct.status,
          ct.is_active as isActive,
          ct.version_no as versionNo,
          ct.created_at as createdAt,
          ct.updated_at as updatedAt
         FROM contract_templates ct
         ${where}
         ORDER BY ct.updated_at DESC`,
        params
      );

      const ids = (rows as { id: number }[]).map((r) => r.id).filter((id) => !Number.isNaN(id));
      let variablesByTemplateId = new Map<
        number,
        { variableKey: string; variableLabel: string | null; sourceKey: string | null; isRequired: boolean }[]
      >();

      if (ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');
        const varRows = await AppDataSource.query(
          `SELECT
            contract_template_id AS contractTemplateId,
            variable_key AS variableKey,
            variable_label AS variableLabel,
            source_key AS sourceKey,
            is_required AS isRequired
           FROM contract_template_variables
           WHERE contract_template_id IN (${placeholders})
           ORDER BY contract_template_id ASC, id ASC`,
          ids
        );

        for (const v of varRows as {
          contractTemplateId: number;
          variableKey: string;
          variableLabel: string | null;
          sourceKey: string | null;
          isRequired: number | boolean;
        }[]) {
          const tid = Number(v.contractTemplateId);
          if (Number.isNaN(tid)) continue;
          const list = variablesByTemplateId.get(tid) || [];
          list.push({
            variableKey: v.variableKey,
            variableLabel: v.variableLabel,
            sourceKey: v.sourceKey,
            isRequired: Boolean(Number(v.isRequired)),
          });
          variablesByTemplateId.set(tid, list);
        }
      }

      const contracts = (rows as Record<string, unknown>[]).map((row) => {
        const id = Number(row.id);
        return {
          ...row,
          variables: variablesByTemplateId.get(id) || [],
        };
      });

      res.json({
        success: true,
        data: { contracts },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        propertyId = null,
        moduleKey,
        name,
        description = null,
        content,
        status = 'draft',
        isActive = true,
        variables = [],
      } = req.body || {};

      if (!moduleKey || !name || !content) {
        throw new AppError('Campos obrigatórios: moduleKey, name e content.', 400);
      }

      const allowedStatus: ContractStatus[] = ['draft', 'active', 'archived'];
      const safeStatus: ContractStatus = allowedStatus.includes(status) ? status : 'draft';
      const uuid = uuidv4();

      const insertResult = await AppDataSource.query(
        `INSERT INTO contract_templates
          (uuid, property_id, module_key, name, description, content, status, is_active, version_no, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NULL, NULL)`,
        [uuid, propertyId, moduleKey, name, description, content, safeStatus, isActive ? 1 : 0]
      );

      const contractId = insertResult?.insertId;

      if (Array.isArray(variables) && variables.length > 0) {
        for (const variable of variables) {
          if (!variable?.variableKey) continue;
          await AppDataSource.query(
            `INSERT INTO contract_template_variables
              (contract_template_id, variable_key, variable_label, source_key, is_required)
             VALUES (?, ?, ?, ?, ?)`,
            [
              contractId,
              variable.variableKey,
              variable.variableLabel || null,
              variable.sourceKey || null,
              variable.isRequired ? 1 : 0,
            ]
          );
        }
      }

      await AppDataSource.query(
        `INSERT INTO contract_template_versions
          (contract_template_id, version_no, content, change_note, changed_by)
         VALUES (?, 1, ?, ?, NULL)`,
        [contractId, content, 'Versão inicial']
      );

      res.status(201).json({
        success: true,
        message: 'Contrato criado com sucesso.',
        data: { id: contractId, uuid },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) throw new AppError('ID inválido.', 400);

      const {
        moduleKey,
        name,
        description,
        content,
        status,
        isActive,
        variables,
      } = req.body || {};

      const rows = await AppDataSource.query(
        `SELECT id, version_no as versionNo, content FROM contract_templates WHERE id = ? LIMIT 1`,
        [id]
      );
      if (!rows.length) throw new AppError('Contrato não encontrado.', 404);

      const current = rows[0];
      const nextVersion = content && content !== current.content ? Number(current.versionNo || 1) + 1 : Number(current.versionNo || 1);

      const updateFields: string[] = [];
      const updateParams: any[] = [];

      if (moduleKey !== undefined) {
        updateFields.push('module_key = ?');
        updateParams.push(moduleKey);
      }
      if (name !== undefined) {
        updateFields.push('name = ?');
        updateParams.push(name);
      }
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateParams.push(description || null);
      }
      if (content !== undefined) {
        updateFields.push('content = ?');
        updateParams.push(content);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }
      if (isActive !== undefined) {
        updateFields.push('is_active = ?');
        updateParams.push(isActive ? 1 : 0);
      }

      if (content !== undefined && content !== current.content) {
        updateFields.push('version_no = ?');
        updateParams.push(nextVersion);
      }

      if (updateFields.length > 0) {
        updateParams.push(id);
        await AppDataSource.query(
          `UPDATE contract_templates SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
          updateParams
        );
      }

      if (content !== undefined && content !== current.content) {
        await AppDataSource.query(
          `INSERT INTO contract_template_versions
            (contract_template_id, version_no, content, change_note, changed_by)
           VALUES (?, ?, ?, ?, NULL)`,
          [id, nextVersion, content, 'Atualização de conteúdo']
        );
      }

      if (Array.isArray(variables)) {
        await AppDataSource.query(`DELETE FROM contract_template_variables WHERE contract_template_id = ?`, [id]);
        for (const variable of variables) {
          if (!variable?.variableKey) continue;
          await AppDataSource.query(
            `INSERT INTO contract_template_variables
              (contract_template_id, variable_key, variable_label, source_key, is_required)
             VALUES (?, ?, ?, ?, ?)`,
            [id, variable.variableKey, variable.variableLabel || null, variable.sourceKey || null, variable.isRequired ? 1 : 0]
          );
        }
      }

      res.json({
        success: true,
        message: 'Contrato atualizado com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  }
}
