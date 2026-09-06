import type { QueryRunner } from 'typeorm';

const ACTIVE_TASK_STATUSES = ['pending', 'in_progress', 'blocked'] as const;
const RELEASABLE_UNIT_STATUSES = ['cleaning', 'maintenance', 'arrangement', 'blocked'] as const;

export class HousekeepingUnitSync {
  static categoryToUnitStatus(category: string): 'cleaning' | 'maintenance' | 'arrangement' {
    const c = String(category || '').toLowerCase();
    if (c === 'maintenance') return 'maintenance';
    if (c === 'arrangement') return 'arrangement';
    return 'cleaning';
  }

  static async applyTaskToUnit(
    queryRunner: QueryRunner,
    unitId: number | null | undefined,
    taskStatus: string,
    taskCategory: string,
  ): Promise<void> {
    if (!unitId) return;

    const units = await queryRunner.query(
      `SELECT id, status FROM units WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
      [unitId],
    );
    if (!units.length) return;

    const unit = units[0];
    if (unit.status === 'occupied') return;

    const status = String(taskStatus).toLowerCase();

    if (status === 'completed') {
      await this.releaseUnitIfNoActiveTasks(queryRunner, unitId);
      return;
    }

    if (status === 'blocked') {
      await queryRunner.query(
        `UPDATE units SET status = 'blocked', updated_at = NOW()
         WHERE id = ? AND status != 'occupied'`,
        [unitId],
      );
      return;
    }

    if (status === 'pending' || status === 'in_progress') {
      const unitStatus = this.categoryToUnitStatus(taskCategory);
      await queryRunner.query(
        `UPDATE units SET status = ?, updated_at = NOW()
         WHERE id = ? AND status != 'occupied'`,
        [unitStatus, unitId],
      );
    }
  }

  static async releaseUnitIfNoActiveTasks(
    queryRunner: QueryRunner,
    unitId: number,
    excludeTaskId?: number,
  ): Promise<void> {
    const params: number[] = [unitId];
    let excludeSql = '';
    if (excludeTaskId != null) {
      excludeSql = ' AND id != ?';
      params.push(excludeTaskId);
    }

    const active = await queryRunner.query(
      `SELECT id, status, category FROM housekeeping_tasks
       WHERE unit_id = ? AND deleted_at IS NULL
         AND status IN ('pending', 'in_progress', 'blocked')
         ${excludeSql}
       ORDER BY FIELD(status, 'in_progress', 'blocked', 'pending'), created_at DESC
       LIMIT 1`,
      params,
    );

    if (!active.length) {
      await queryRunner.query(
        `UPDATE units SET status = 'available', updated_at = NOW()
         WHERE id = ? AND status IN ('cleaning', 'maintenance', 'arrangement', 'blocked')`,
        [unitId],
      );
      return;
    }

    const next = active[0];
    await this.applyTaskToUnit(queryRunner, unitId, next.status, next.category);
  }
}

export { ACTIVE_TASK_STATUSES, RELEASABLE_UNIT_STATUSES };
