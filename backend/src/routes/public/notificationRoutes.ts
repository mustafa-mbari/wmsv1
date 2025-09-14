import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { authenticateToken } from '../../middleware/authMiddleware';
import logger from '../../utils/logger/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/notifications - Get all notifications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;
    const { status, type, limit = 50, offset = 0 } = req.query;

    const where: any = {
      deleted_at: null,
      OR: [
        { user_id: userId },
        { email: req.user?.email }
      ]
    };

    if (status) where.status = status;
    if (type) where.type = type;

    const notifications = await prisma.notifications.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.notifications.count({ where });

    logger.info('Notifications retrieved successfully', {
      source: 'notificationRoutes',
      method: 'getNotifications',
      userId: userId?.toString(),
      count: notifications.length
    });

    res.json(createApiResponse(true, { notifications, total }));
  } catch (error: any) {
    logger.error('Error retrieving notifications', {
      source: 'notificationRoutes',
      method: 'getNotifications',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve notifications')
    );
  }
});

// GET /api/notifications/:id - Get notification by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const notification = await prisma.notifications.findFirst({
      where: {
        id: parseInt(id),
        deleted_at: null,
        OR: [
          { user_id: userId },
          { email: req.user?.email }
        ]
      }
    });

    if (!notification) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Notification not found')
      );
    }

    logger.info('Notification retrieved successfully', {
      source: 'notificationRoutes',
      method: 'getNotificationById',
      notificationId: id,
      userId: userId?.toString()
    });

    res.json(createApiResponse(true, notification));
  } catch (error: any) {
    logger.error('Error retrieving notification', {
      source: 'notificationRoutes',
      method: 'getNotificationById',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to retrieve notification')
    );
  }
});

// POST /api/notifications - Create new notification
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, title, message, data, user_id, email, phone, priority, metadata } = req.body;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const notification = await prisma.notifications.create({
      data: {
        type,
        title,
        message,
        data,
        user_id: user_id || userId,
        email,
        phone,
        priority: priority || 'normal',
        metadata,
        created_by: userId,
        updated_by: userId
      }
    });

    logger.info('Notification created successfully', {
      source: 'notificationRoutes',
      method: 'createNotification',
      notificationId: notification.id,
      userId: userId?.toString()
    });

    res.status(HttpStatus.CREATED).json(createApiResponse(true, notification));
  } catch (error: any) {
    logger.error('Error creating notification', {
      source: 'notificationRoutes',
      method: 'createNotification',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create notification')
    );
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const existingNotification = await prisma.notifications.findFirst({
      where: {
        id: parseInt(id),
        deleted_at: null,
        OR: [
          { user_id: userId },
          { email: req.user?.email }
        ]
      }
    });

    if (!existingNotification) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Notification not found')
      );
    }

    const notification = await prisma.notifications.update({
      where: { id: parseInt(id) },
      data: {
        read_at: new Date(),
        updated_by: userId,
        updated_at: new Date()
      }
    });

    logger.info('Notification marked as read', {
      source: 'notificationRoutes',
      method: 'markAsRead',
      notificationId: id,
      userId: userId?.toString()
    });

    res.json(createApiResponse(true, notification));
  } catch (error: any) {
    logger.error('Error marking notification as read', {
      source: 'notificationRoutes',
      method: 'markAsRead',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to mark notification as read')
    );
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id ? parseInt(req.user.id) : undefined;

    const existingNotification = await prisma.notifications.findFirst({
      where: {
        id: parseInt(id),
        deleted_at: null,
        OR: [
          { user_id: userId },
          { email: req.user?.email }
        ]
      }
    });

    if (!existingNotification) {
      return res.status(HttpStatus.NOT_FOUND).json(
        createApiResponse(false, null, 'Notification not found')
      );
    }

    await prisma.notifications.delete({
      where: { id: parseInt(id) }
    });

    logger.info('Notification deleted successfully', {
      source: 'notificationRoutes',
      method: 'deleteNotification',
      notificationId: id,
      userId: userId?.toString()
    });

    res.json(createApiResponse(true, null, 'Notification deleted successfully'));
  } catch (error: any) {
    logger.error('Error deleting notification', {
      source: 'notificationRoutes',
      method: 'deleteNotification',
      error: error.message
    });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete notification')
    );
  }
});

export default router;