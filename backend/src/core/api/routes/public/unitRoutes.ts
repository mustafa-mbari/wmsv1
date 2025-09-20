/**
 * @swagger
 * components:
 *   schemas:
 *     Unit:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - symbol
 *         - is_active
 *         - created_at
 *         - updated_at
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the unit of measure
 *           example: "1"
 *         name:
 *           type: string
 *           description: Name of the unit of measure
 *           example: "Kilogram"
 *         symbol:
 *           type: string
 *           description: Symbol or abbreviation for the unit
 *           example: "kg"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the unit of measure
 *           example: "Unit of mass in metric system"
 *         product_count:
 *           type: integer
 *           description: Number of products using this unit
 *           example: 15
 *         is_active:
 *           type: boolean
 *           description: Whether the unit is active
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Unit creation timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Unit last update timestamp
 *           example: "2024-01-15T10:30:00Z"
 *     CreateUnitRequest:
 *       type: object
 *       required:
 *         - name
 *         - symbol
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the unit of measure
 *           example: "Kilogram"
 *         symbol:
 *           type: string
 *           description: Symbol or abbreviation for the unit
 *           example: "kg"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the unit of measure
 *           example: "Unit of mass in metric system"
 *         is_active:
 *           type: boolean
 *           description: Whether the unit should be active
 *           default: true
 *           example: true
 *     UpdateUnitRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the unit of measure
 *           example: "Updated Kilogram"
 *         symbol:
 *           type: string
 *           description: Symbol or abbreviation for the unit
 *           example: "kg"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the unit of measure
 *           example: "Updated unit of mass in metric system"
 *         is_active:
 *           type: boolean
 *           description: Whether the unit should be active
 *           example: false
 */

import { Router, Request, Response } from 'express';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../../utils/logger/logger';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/units:
 *   get:
 *     tags: [Units]
 *     summary: Get all units of measure
 *     description: Retrieve all active units of measure with product counts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Units of measure retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "1"
 *                       name: "Kilogram"
 *                       symbol: "kg"
 *                       description: "Unit of mass in metric system"
 *                       product_count: 15
 *                       is_active: true
 *                       created_at: "2024-01-15T10:30:00Z"
 *                       updated_at: "2024-01-15T10:30:00Z"
 *                   message: "Units of measure retrieved successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all units of measure from database', { 
      source: 'unitRoutes', 
      method: 'getUnits'
    });

    const units = await prisma.units_of_measure.findMany({
      where: {
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const transformedUnits = units.map(unit => ({
      id: unit.id.toString(),
      name: unit.name,
      symbol: unit.symbol,
      description: unit.description,
      product_count: unit._count.products,
      is_active: unit.is_active,
      created_at: unit.created_at.toISOString(),
      updated_at: unit.updated_at.toISOString()
    }));

    logger.info('Units of measure retrieved successfully', { 
      source: 'unitRoutes', 
      method: 'getUnits',
      count: transformedUnits.length
    });

    res.json(createApiResponse(true, transformedUnits, 'Units of measure retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching units of measure', {
      source: 'unitRoutes',
      method: 'getUnits',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to fetch units of measure')
    );
  }
});

/**
 * @swagger
 * /api/units:
 *   post:
 *     tags: [Units]
 *     summary: Create a new unit of measure
 *     description: Create a new unit of measure with symbol and description
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUnitRequest'
 *           examples:
 *             create_unit:
 *               value:
 *                 name: "Kilogram"
 *                 symbol: "kg"
 *                 description: "Unit of mass in metric system"
 *                 is_active: true
 *     responses:
 *       201:
 *         description: Unit of measure created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "1"
 *                     name: "Kilogram"
 *                     symbol: "kg"
 *                     description: "Unit of mass in metric system"
 *                     is_active: true
 *                     created_at: "2024-01-15T10:30:00Z"
 *                   message: "Unit of measure created successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      symbol,
      description,
      is_active = true
    } = req.body;

    logger.info('Creating new unit of measure', { 
      source: 'unitRoutes', 
      method: 'createUnit',
      name,
      symbol
    });

    const newUnit = await prisma.units_of_measure.create({
      data: {
        name,
        symbol,
        description: description || null,
        is_active,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const unitResponse = {
      id: newUnit.id.toString(),
      name: newUnit.name,
      symbol: newUnit.symbol,
      description: newUnit.description,
      is_active: newUnit.is_active,
      created_at: newUnit.created_at.toISOString()
    };

    logger.info('Unit of measure created successfully', { 
      source: 'unitRoutes', 
      method: 'createUnit',
      unitId: newUnit.id.toString(),
      name: newUnit.name
    });

    res.status(HttpStatus.CREATED).json(
      createApiResponse(true, unitResponse, 'Unit of measure created successfully')
    );
  } catch (error) {
    logger.error('Error creating unit of measure', {
      source: 'unitRoutes',
      method: 'createUnit',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to create unit of measure')
    );
  }
});

/**
 * @swagger
 * /api/units/{id}:
 *   put:
 *     tags: [Units]
 *     summary: Update a unit of measure
 *     description: Update an existing unit of measure by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit unique identifier
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUnitRequest'
 *           examples:
 *             update_unit:
 *               value:
 *                 name: "Updated Kilogram"
 *                 symbol: "kg"
 *                 description: "Updated unit of mass in metric system"
 *                 is_active: false
 *     responses:
 *       200:
 *         description: Unit of measure updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "1"
 *                     name: "Updated Kilogram"
 *                     symbol: "kg"
 *                     description: "Updated unit of mass in metric system"
 *                     is_active: false
 *                     created_at: "2024-01-15T10:30:00Z"
 *                     updated_at: "2024-01-15T11:45:00Z"
 *                   message: "Unit of measure updated successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date() };

    const updatedUnit = await prisma.units_of_measure.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(createApiResponse(true, updatedUnit, 'Unit of measure updated successfully'));
  } catch (error) {
    logger.error('Error updating unit of measure', {
      source: 'unitRoutes',
      method: 'updateUnit',
      unitId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to update unit of measure')
    );
  }
});

/**
 * @swagger
 * /api/units/{id}:
 *   delete:
 *     tags: [Units]
 *     summary: Delete a unit of measure
 *     description: Soft delete a unit of measure by setting deleted_at timestamp
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unit unique identifier
 *         example: "1"
 *     responses:
 *       200:
 *         description: Unit of measure deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data: null
 *                   message: "Unit of measure deleted successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.units_of_measure.update({
      where: { id: parseInt(id) },
      data: { 
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });

    res.json(createApiResponse(true, null, 'Unit of measure deleted successfully'));
  } catch (error) {
    logger.error('Error deleting unit of measure', {
      source: 'unitRoutes',
      method: 'deleteUnit',
      unitId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Failed to delete unit of measure')
    );
  }
});

export default router;