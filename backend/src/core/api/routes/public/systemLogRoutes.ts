import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';
import logger from '../../utils/logger/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/system-logs - Get system logs (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { level, action, module, entity_type, user_id, limit = 100, offset = 0, start_date, end_date } = req.query;

    const where: any = { deleted_at: null };

    if (level) where.level = level;
    if (action) where.action = action;
    if (module) where.module = module;
    if (entity_type) where.entity_type = entity_type;
    if (user_id) where.user_id = parseInt(user_id as string);

    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at.gte = new Date(start_date as string);
      if (end_date) where.created_at.lte = new Date(end_date as string);
    }

    const systemLogs = await prisma.system_logs.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.system_logs.count({ where });

    logger.info('System logs retrieved successfully', {
      source: 'systemLogRoutes',
      method: 'getSystemLogs',
      count: systemLogs.length,
      userId: (req as any).user?.id?.toString()
    });

    res.json(createApiResponse(true, { logs: systemLogs, total }));
  } catch (error: any) {
    logger.error('Error retrieving system logs', {
      source: 'systemLogRoutes',
      method: 'getSystemLogs',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve system logs')
    );
  }
});

// GET /api/system-logs/:id - Get system log by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const systemLog = await prisma.system_logs.findFirst({
      where: {
        id: parseInt(id),
        deleted_at: null
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    if (!systemLog) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'System log not found')
      );
    }

    logger.info('System log retrieved successfully', {
      source: 'systemLogRoutes',
      method: 'getSystemLogById',
      logId: id
    });

    res.json(createApiResponse(true, systemLog));
  } catch (error: any) {
    logger.error('Error retrieving system log', {
      source: 'systemLogRoutes',
      method: 'getSystemLogById',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve system log')
    );
  }
});

// POST /api/system-logs - Create system log
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      level,
      action,
      message,
      context,
      user_id,
      ip_address,
      user_agent,
      module,
      entity_type,
      entity_id
    } = req.body;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const systemLog = await prisma.system_logs.create({
      data: {
        level,
        action,
        message,
        context,
        user_id: user_id || userId,
        ip_address,
        user_agent,
        module,
        entity_type,
        entity_id,
        created_by: userId
      }
    });

    logger.info('System log created successfully', {
      source: 'systemLogRoutes',
      method: 'createSystemLog',
      logId: systemLog.id,
      userId: (req as any).user?.id?.toString()
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, systemLog));
  } catch (error: any) {
    logger.error('Error creating system log', {
      source: 'systemLogRoutes',
      method: 'createSystemLog',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create system log')
    );
  }
});

// GET /api/system-logs/stats/summary - Get log statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const where: any = { deleted_at: null };
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at.gte = new Date(start_date as string);
      if (end_date) where.created_at.lte = new Date(end_date as string);
    }

    const [totalLogs, levelStats, moduleStats, actionStats] = await Promise.all([
      prisma.system_logs.count({ where }),
      prisma.system_logs.groupBy({
        by: ['level'],
        where,
        _count: { level: true }
      }),
      prisma.system_logs.groupBy({
        by: ['module'],
        where: { ...where, module: { not: null } },
        _count: { module: true }
      }),
      prisma.system_logs.groupBy({
        by: ['action'],
        where,
        _count: { action: true }
      })
    ]);

    const stats = {
      total: totalLogs,
      byLevel: levelStats.reduce((acc, item) => {
        acc[item.level] = item._count.level;
        return acc;
      }, {} as Record<string, number>),
      byModule: moduleStats.reduce((acc, item) => {
        if (item.module) acc[item.module] = item._count.module;
        return acc;
      }, {} as Record<string, number>),
      byAction: actionStats.reduce((acc, item) => {
        acc[item.action] = item._count.action;
        return acc;
      }, {} as Record<string, number>)
    };

    logger.info('System log statistics retrieved successfully', {
      source: 'systemLogRoutes',
      method: 'getLogStats',
      userId: (req as any).user?.id?.toString()
    });

    res.json(createApiResponse(true, stats));
  } catch (error: any) {
    logger.error('Error retrieving system log statistics', {
      source: 'systemLogRoutes',
      method: 'getLogStats',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve system log statistics')
    );
  }
});

// DELETE /api/system-logs/:id - Delete system log
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const existingLog = await prisma.system_logs.findFirst({
      where: {
        id: parseInt(id),
        deleted_at: null
      }
    });

    if (!existingLog) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'System log not found')
      );
    }

    await prisma.system_logs.delete({
      where: { id: parseInt(id) }
    });

    logger.info('System log deleted successfully', {
      source: 'systemLogRoutes',
      method: 'deleteSystemLog',
      logId: id,
      userId: (req as any).user?.id?.toString()
    });

    res.json(createApiResponse(true, null, 'System log deleted successfully'));
  } catch (error: any) {
    logger.error('Error deleting system log', {
      source: 'systemLogRoutes',
      method: 'deleteSystemLog',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete system log')
    );
  }
});

export default router;