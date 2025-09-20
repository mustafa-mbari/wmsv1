import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';
import logger from '../../utils/logger/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/system-settings - Get all system settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { group, is_public, is_editable } = req.query;

    const where: any = { deleted_at: null };
    if (group) where.group = group;
    if (is_public !== undefined) where.is_public = is_public === 'true';
    if (is_editable !== undefined) where.is_editable = is_editable === 'true';

    const settings = await prisma.system_settings.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }]
    });

    logger.info('System settings retrieved successfully', {
      source: 'systemSettingRoutes',
      method: 'getSystemSettings',
      count: settings.length
    });

    res.json(createApiResponse(true, settings));
  } catch (error: any) {
    logger.error('Error retrieving system settings', {
      source: 'systemSettingRoutes',
      method: 'getSystemSettings',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve system settings')
    );
  }
});

// GET /api/system-settings/public - Get public system settings (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { group } = req.query;

    const where: any = {
      deleted_at: null,
      is_public: true
    };
    if (group) where.group = group;

    const settings = await prisma.system_settings.findMany({
      where,
      select: {
        key: true,
        value: true,
        type: true,
        description: true,
        group: true
      },
      orderBy: [{ group: 'asc' }, { key: 'asc' }]
    });

    logger.info('Public system settings retrieved successfully', {
      source: 'systemSettingRoutes',
      method: 'getPublicSystemSettings',
      count: settings.length
    });

    res.json(createApiResponse(true, settings));
  } catch (error: any) {
    logger.error('Error retrieving public system settings', {
      source: 'systemSettingRoutes',
      method: 'getPublicSystemSettings',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve public system settings')
    );
  }
});

// GET /api/system-settings/:key - Get system setting by key
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await prisma.system_settings.findFirst({
      where: {
        key,
        deleted_at: null
      }
    });

    if (!setting) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'System setting not found')
      );
    }

    logger.info('System setting retrieved successfully', {
      source: 'systemSettingRoutes',
      method: 'getSystemSettingByKey',
      key
    });

    res.json(createApiResponse(true, setting));
  } catch (error: any) {
    logger.error('Error retrieving system setting', {
      source: 'systemSettingRoutes',
      method: 'getSystemSettingByKey',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve system setting')
    );
  }
});

// POST /api/system-settings - Create new system setting
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      key,
      value,
      type = 'string',
      description,
      group,
      is_public = false,
      is_editable = true
    } = req.body;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const setting = await prisma.system_settings.create({
      data: {
        key,
        value,
        type,
        description,
        group,
        is_public,
        is_editable,
        created_by: userId,
        updated_by: userId
      }
    });

    logger.info('System setting created successfully', {
      source: 'systemSettingRoutes',
      method: 'createSystemSetting',
      settingId: setting.id,
      key,
      userId: userId?.toString()
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, setting));
  } catch (error: any) {
    logger.error('Error creating system setting', {
      source: 'systemSettingRoutes',
      method: 'createSystemSetting',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create system setting')
    );
  }
});

// PUT /api/system-settings/:key - Update system setting
router.put('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const {
      value,
      type,
      description,
      group,
      is_public,
      is_editable
    } = req.body;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const existingSetting = await prisma.system_settings.findFirst({
      where: {
        key,
        deleted_at: null
      }
    });

    if (!existingSetting) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'System setting not found')
      );
    }

    if (!existingSetting.is_editable) {
      return res.status(HttpStatus.FORBIDDEN).json(
        createApiResponse(false, null, 'This system setting is not editable')
      );
    }

    const setting = await prisma.system_settings.update({
      where: { key },
      data: {
        value,
        type,
        description,
        group,
        is_public,
        is_editable,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    logger.info('System setting updated successfully', {
      source: 'systemSettingRoutes',
      method: 'updateSystemSetting',
      key,
      userId: userId?.toString()
    });

    res.json(createApiResponse(true, setting));
  } catch (error: any) {
    logger.error('Error updating system setting', {
      source: 'systemSettingRoutes',
      method: 'updateSystemSetting',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update system setting')
    );
  }
});

// GET /api/system-settings/groups/list - Get all setting groups
router.get('/groups/list', authenticateToken, async (req, res) => {
  try {
    const groups = await prisma.system_settings.findMany({
      where: {
        deleted_at: null,
        group: { not: null }
      },
      select: { group: true },
      distinct: ['group'],
      orderBy: { group: 'asc' }
    });

    const groupList = groups
      .map(g => g.group)
      .filter(Boolean)
      .sort();

    logger.info('System setting groups retrieved successfully', {
      source: 'systemSettingRoutes',
      method: 'getSettingGroups',
      count: groupList.length
    });

    res.json(createApiResponse(true, groupList));
  } catch (error: any) {
    logger.error('Error retrieving system setting groups', {
      source: 'systemSettingRoutes',
      method: 'getSettingGroups',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve system setting groups')
    );
  }
});

// DELETE /api/system-settings/:key - Delete system setting
router.delete('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const existingSetting = await prisma.system_settings.findFirst({
      where: {
        key,
        deleted_at: null
      }
    });

    if (!existingSetting) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'System setting not found')
      );
    }

    if (!existingSetting.is_editable) {
      return res.status(HttpStatus.FORBIDDEN).json(
        createApiResponse(false, null, 'This system setting cannot be deleted')
      );
    }

    await prisma.system_settings.delete({
      where: { key }
    });

    logger.info('System setting deleted successfully', {
      source: 'systemSettingRoutes',
      method: 'deleteSystemSetting',
      key,
      userId: userId?.toString()
    });

    res.json(createApiResponse(true, null, 'System setting deleted successfully'));
  } catch (error: any) {
    logger.error('Error deleting system setting', {
      source: 'systemSettingRoutes',
      method: 'deleteSystemSetting',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete system setting')
    );
  }
});

export default router;