import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AppError } from '@/middlewares/error.middleware';

export class PageController {
    async getNavigation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Fetch Groups with their Pages ordered by index
            const groups = await AppDataSource.query(`
        SELECT * FROM page_groups ORDER BY order_index ASC
      `);

            const pages = await AppDataSource.query(`
        SELECT * FROM pages ORDER BY order_index ASC
      `);

            // Construct nested structure
            const navigation = groups.map((group: any) => ({
                ...group,
                items: pages.filter((page: any) => page.group_id === group.id)
            }));

            // Find orphaned pages (if any) or pages without groups? 
            // For now, assume all pages have groups as per schema relation.

            res.json({
                success: true,
                data: navigation
            });
        } catch (error) {
            next(error);
        }
    }

    // --- CRUD for Groups ---

    async getGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const groups = await AppDataSource.query(`
        SELECT * FROM page_groups ORDER BY order_index ASC
      `);
            res.json({ success: true, data: groups });
        } catch (error) {
            next(error);
        }
    }

    async createGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { title, icon, order_index } = req.body;
            const result = await AppDataSource.query(`
        INSERT INTO page_groups (title, icon, order_index) VALUES (?, ?, ?)
      `, [title, icon || null, order_index || 0]);

            const newId = result.insertId;
            const newGroup = await AppDataSource.query('SELECT * FROM page_groups WHERE id = ?', [newId]);

            res.status(201).json({ success: true, data: newGroup[0] });
        } catch (error) {
            next(error);
        }
    }

    async updateGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { title, icon, order_index } = req.body;

            await AppDataSource.query(`
        UPDATE page_groups 
        SET title = ?, icon = ?, order_index = ?
        WHERE id = ?
      `, [title, icon, order_index, id]);

            const updatedGroup = await AppDataSource.query('SELECT * FROM page_groups WHERE id = ?', [id]);
            res.json({ success: true, data: updatedGroup[0] });
        } catch (error) {
            next(error);
        }
    }

    async deleteGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await AppDataSource.query('DELETE FROM page_groups WHERE id = ?', [id]);
            res.json({ success: true, message: 'Group deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    // --- CRUD for Pages ---

    async getPages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Optional: Filter by group_id
            const { group_id } = req.query;

            let query = 'SELECT * FROM pages';
            let params: any[] = [];

            if (group_id) {
                query += ' WHERE group_id = ?';
                params.push(group_id);
            }

            query += ' ORDER BY order_index ASC';

            const pages = await AppDataSource.query(query, params);
            res.json({ success: true, data: pages });
        } catch (error) {
            next(error);
        }
    }

    async createPage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { group_id, title, route, icon, badge, order_index } = req.body;

            const result = await AppDataSource.query(`
        INSERT INTO pages (group_id, title, route, icon, badge, order_index) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [group_id, title, route, icon, badge || null, order_index || 0]);

            const newId = result.insertId;
            const newPage = await AppDataSource.query('SELECT * FROM pages WHERE id = ?', [newId]);

            res.status(201).json({ success: true, data: newPage[0] });
        } catch (error) {
            next(error);
        }
    }

    async updatePage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { group_id, title, route, icon, badge, order_index } = req.body;

            await AppDataSource.query(`
        UPDATE pages 
        SET group_id = ?, title = ?, route = ?, icon = ?, badge = ?, order_index = ?
        WHERE id = ?
      `, [group_id, title, route, icon, badge || null, order_index, id]);

            const updatedPage = await AppDataSource.query('SELECT * FROM pages WHERE id = ?', [id]);
            res.json({ success: true, data: updatedPage[0] });
        } catch (error) {
            next(error);
        }
    }

    async deletePage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await AppDataSource.query('DELETE FROM pages WHERE id = ?', [id]);
            res.json({ success: true, message: 'Page deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}
