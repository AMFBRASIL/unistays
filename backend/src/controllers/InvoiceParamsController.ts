import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateInvoiceParamsInput, UpdateInvoiceParamsInput } from '@/validators/invoiceParams.validator';
import { v4 as uuidv4 } from 'uuid';

interface InvoiceParamsResponse {
  id: number;
  uuid: string;
  propertyId: number | null;
  
  // Dados da Empresa
  companyName: string | null;
  cnpj: string | null;
  stateRegistration: string | null;
  municipalRegistration: string | null;
  address: string | null;
  number: string | null;
  complement: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  
  // Certificado Digital
  certificatePath: string | null;
  certificatePassword: string | null; // Não retornar a senha descriptografada
  
  // Configurações de Emissão
  nfProvider: string;
  serie: string;
  environment: 'production' | 'homologation';
  autoEmit: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export class InvoiceParamsController {
  async getCurrent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId: propertyIdParam } = req.query;
      const propertyId = propertyIdParam ? parseInt(propertyIdParam as string, 10) : null;
      const queryRunner = AppDataSource.createQueryRunner();

      const params: any[] = [];
      const query = `
        SELECT 
          ip.id,
          ip.uuid,
          ip.property_id as propertyId,
          ip.company_name as companyName,
          ip.cnpj,
          ip.state_registration as stateRegistration,
          ip.municipal_registration as municipalRegistration,
          ip.address,
          ip.number,
          ip.complement,
          ip.city,
          ip.state,
          ip.zip_code as zipCode,
          ip.phone,
          ip.email,
          ip.certificate_path as certificatePath,
          ip.certificate_password as certificatePassword,
          ip.nf_provider as nfProvider,
          ip.serie,
          ip.environment,
          ip.auto_emit as autoEmit,
          ip.created_at as createdAt,
          ip.updated_at as updatedAt
        FROM invoice_params ip
        WHERE ip.property_id ${propertyId ? '= ?' : 'IS NULL'}
        LIMIT 1
      `;

      if (propertyId) {
        params.push(propertyId);
      }

      const results = await queryRunner.query(query, params);
      await queryRunner.release();

      if (results.length === 0) {
        res.json({
          success: true,
          data: null,
        });
        return;
      }

      const row = results[0];
      
      // Não retornar a senha do certificado (ou retornar indicador de que existe)
      const response: InvoiceParamsResponse = {
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        companyName: row.companyName,
        cnpj: row.cnpj,
        stateRegistration: row.stateRegistration,
        municipalRegistration: row.municipalRegistration,
        address: row.address,
        number: row.number,
        complement: row.complement,
        city: row.city,
        state: row.state,
        zipCode: row.zipCode,
        phone: row.phone,
        email: row.email,
        certificatePath: row.certificatePath,
        certificatePassword: row.certificatePassword ? '***' : null, // Não retornar senha real
        nfProvider: row.nfProvider || 'sefaz',
        serie: row.serie || '1',
        environment: row.environment || 'homologation',
        autoEmit: row.autoEmit === 1 || row.autoEmit === true,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const data: CreateInvoiceParamsInput | UpdateInvoiceParamsInput = req.body;
      const propertyId = data.propertyId || null;

      // Verificar se já existe configuração para esta propriedade (ou global)
      const existing = await queryRunner.query(
        `SELECT id, certificate_password FROM invoice_params WHERE property_id ${propertyId ? '= ?' : 'IS NULL'}`,
        propertyId ? [propertyId] : []
      );

      // Processar senha do certificado (manter existente se não for fornecida)
      let certificatePassword: string | null = null;
      if (data.certificatePassword !== undefined) {
        if (data.certificatePassword && data.certificatePassword !== '***') {
          // Se uma nova senha foi fornecida (não é o placeholder '***'), usar a nova
          certificatePassword = data.certificatePassword;
        } else if (existing.length > 0 && existing[0].certificate_password) {
          // Se é o placeholder '***' ou vazio, manter a senha existente
          certificatePassword = existing[0].certificate_password;
        }
      }

      if (existing.length > 0) {
        // UPDATE
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (data.companyName !== undefined) {
          updateFields.push('company_name = ?');
          updateValues.push(data.companyName || null);
        }
        if (data.cnpj !== undefined) {
          updateFields.push('cnpj = ?');
          updateValues.push(data.cnpj || null);
        }
        if (data.stateRegistration !== undefined) {
          updateFields.push('state_registration = ?');
          updateValues.push(data.stateRegistration || null);
        }
        if (data.municipalRegistration !== undefined) {
          updateFields.push('municipal_registration = ?');
          updateValues.push(data.municipalRegistration || null);
        }
        if (data.address !== undefined) {
          updateFields.push('address = ?');
          updateValues.push(data.address || null);
        }
        if (data.number !== undefined) {
          updateFields.push('number = ?');
          updateValues.push(data.number || null);
        }
        if (data.complement !== undefined) {
          updateFields.push('complement = ?');
          updateValues.push(data.complement || null);
        }
        if (data.city !== undefined) {
          updateFields.push('city = ?');
          updateValues.push(data.city || null);
        }
        if (data.state !== undefined) {
          updateFields.push('state = ?');
          updateValues.push(data.state || null);
        }
        if (data.zipCode !== undefined) {
          updateFields.push('zip_code = ?');
          updateValues.push(data.zipCode || null);
        }
        if (data.phone !== undefined) {
          updateFields.push('phone = ?');
          updateValues.push(data.phone || null);
        }
        if (data.email !== undefined) {
          updateFields.push('email = ?');
          updateValues.push(data.email || null);
        }
        if (data.certificatePath !== undefined) {
          updateFields.push('certificate_path = ?');
          updateValues.push(data.certificatePath || null);
        }
        if (certificatePassword !== null) {
          updateFields.push('certificate_password = ?');
          updateValues.push(certificatePassword);
        }
        if (data.nfProvider !== undefined) {
          updateFields.push('nf_provider = ?');
          updateValues.push(data.nfProvider || 'sefaz');
        }
        if (data.serie !== undefined) {
          updateFields.push('serie = ?');
          updateValues.push(data.serie || '1');
        }
        if (data.environment !== undefined) {
          updateFields.push('environment = ?');
          updateValues.push(data.environment);
        }
        if (data.autoEmit !== undefined) {
          updateFields.push('auto_emit = ?');
          updateValues.push(data.autoEmit ? 1 : 0);
        }

        updateFields.push('updated_at = NOW()');
        updateValues.push(existing[0].id);

        const updateQuery = `UPDATE invoice_params SET ${updateFields.join(', ')} WHERE id = ?`;
        await queryRunner.query(updateQuery, updateValues);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        res.json({
          success: true,
          message: 'Parâmetros de nota fiscal atualizados com sucesso',
        });
      } else {
        // INSERT
        const uuid = uuidv4();
        const insertQuery = `
          INSERT INTO invoice_params (
            uuid, property_id,
            company_name, cnpj, state_registration, municipal_registration,
            address, number, complement, city, state, zip_code, phone, email,
            certificate_path, certificate_password,
            nf_provider, serie, environment, auto_emit
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const insertValues = [
          uuid,
          propertyId,
          data.companyName || null,
          data.cnpj || null,
          data.stateRegistration || null,
          data.municipalRegistration || null,
          data.address || null,
          data.number || null,
          data.complement || null,
          data.city || null,
          data.state || null,
          data.zipCode || null,
          data.phone || null,
          data.email || null,
          data.certificatePath || null,
          certificatePassword,
          data.nfProvider || 'sefaz',
          data.serie || '1',
          data.environment || 'homologation',
          data.autoEmit ? 1 : 0,
        ];

        await queryRunner.query(insertQuery, insertValues);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        res.json({
          success: true,
          message: 'Parâmetros de nota fiscal criados com sucesso',
        });
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      
      if (error instanceof AppError) {
        next(error);
      } else {
        console.error('Erro ao salvar parâmetros de nota fiscal:', error);
        next(new AppError('Erro ao salvar parâmetros de nota fiscal', 500));
      }
    }
  }
}
