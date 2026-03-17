/**
 * Document Routes
 * Handles document upload, listing, and deletion
 */

import { Router } from 'express';
import { deleteDocument, getDocuments, upload, uploadDocument } from '../controllers/documentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.delete('/:id', deleteDocument);

export default router;
