const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected by auth middleware
router.use(auth);

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         age:
 *           type: integer
 *         country:
 *           type: string
 *         phoneNo:
 *           type: string
 *         about:
 *           type: string
 *         profilePic:
 *           type: string
 *           format: binary
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Profile not found
 */
router.get('/', profileController.getProfile);

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create or update profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: integer
 *               country:
 *                 type: string
 *               phoneNo:
 *                 type: string
 *               about:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Profile created/updated
 */
router.post('/', upload.single('profilePic'), profileController.createProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Profile'
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/', upload.single('profilePic'), profileController.updateProfile);

/**
 * @swagger
 * /api/profile:
 *   delete:
 *     summary: Delete profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted
 */
router.delete('/', profileController.deleteProfile);

module.exports = router;
