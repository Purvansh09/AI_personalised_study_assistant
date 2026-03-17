/**
 * Document Controller
 * Handles document upload, listing, and deletion
 */

import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const prisma = new PrismaClient();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Please upload PDF, TXT, or DOCX files.'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * Extract text from uploaded file
 */
async function extractText(filePath: string, mimeType: string): Promise<string> {
    if (mimeType === 'text/plain') {
        return fs.readFileSync(filePath, 'utf-8');
    }

    if (mimeType === 'application/pdf') {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    }

    // For DOCX, extract basic text (plain text fallback)
    if (
        mimeType === 'application/msword' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        // Basic DOCX text extraction - read as buffer and extract visible text
        const content = fs.readFileSync(filePath, 'utf-8');
        // Strip XML tags for basic extraction
        return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    throw new Error('Unsupported file type for text extraction');
}

/**
 * Upload a document
 * POST /api/documents/upload
 */
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const { originalname, mimetype, size, filename, path: filePath } = req.file;

        // Extract text content from the file
        let textContent = '';
        try {
            textContent = await extractText(filePath, mimetype);
        } catch (extractError) {
            console.error('Text extraction error:', extractError);
            textContent = '[Text extraction failed - file content could not be read]';
        }

        // Save document metadata and text to database
        const document = await prisma.document.create({
            data: {
                userId,
                filename,
                originalName: originalname,
                mimeType: mimetype,
                size,
                textContent,
            },
        });

        // Clean up the uploaded file (we stored the text content in DB)
        try {
            fs.unlinkSync(filePath);
        } catch (e) {
            console.warn('Could not delete temp file:', e);
        }

        console.log(`📄 Document uploaded: ${originalname} by user ${userId}`);

        res.status(201).json({
            message: 'Document uploaded successfully',
            document: {
                id: document.id,
                originalName: document.originalName,
                mimeType: document.mimeType,
                size: document.size,
                uploadedAt: document.uploadedAt,
                textPreview: textContent.slice(0, 200) + (textContent.length > 200 ? '...' : ''),
            },
        });
    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
};

/**
 * Get all documents for the user
 * GET /api/documents
 */
export const getDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const documents = await prisma.document.findMany({
            where: { userId },
            orderBy: { uploadedAt: 'desc' },
            select: {
                id: true,
                originalName: true,
                mimeType: true,
                size: true,
                uploadedAt: true,
            },
        });

        res.json({ documents });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: 'Failed to get documents' });
    }
};

/**
 * Delete a document
 * DELETE /api/documents/:id
 */
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        // Verify document belongs to user
        const document = await prisma.document.findFirst({
            where: { id, userId },
        });

        if (!document) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }

        await prisma.document.delete({
            where: { id },
        });

        console.log(`🗑️ Document deleted: ${document.originalName}`);
        res.json({ message: 'Document deleted' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
};
