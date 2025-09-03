import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth.middlewares.js';
import { uploadFiles } from '../middlewares/multer.middlewares.js';
import { getDocuments, uploadDocument, viewDocument, deleteDocument } from '../controllers/document.controllers.js';

const router = Router();

// Get all documents
router.get('/documents', isAuth, getDocuments);

// Upload new document
router.post('/documents/upload', isAuth, uploadFiles, uploadDocument);

// View/Download a document
router.get('/documents/:id/view', isAuth, viewDocument);

// Delete a document
router.delete('/documents/:id', isAuth, deleteDocument);

export default router;
