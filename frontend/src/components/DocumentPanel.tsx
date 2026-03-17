/**
 * DocumentPanel Component
 * Upload, list, select, and delete study documents
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckSquare,
    FileText,
    Loader2,
    Square,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { documentApi } from '../services/api';
import { Document } from '../types';

interface DocumentPanelProps {
    selectedDocIds: string[];
    onSelectionChange: (docIds: string[]) => void;
}

export const DocumentPanel: React.FC<DocumentPanelProps> = ({
    selectedDocIds,
    onSelectionChange,
}) => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Fetch documents
    const { data, isLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: documentApi.list,
    });

    const documents = data?.documents || [];

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: documentApi.upload,
        onMutate: () => setIsUploading(true),
        onSuccess: (data) => {
            toast.success(`Uploaded: ${data.document.originalName}`);
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
        onError: () => {
            toast.error('Failed to upload document');
        },
        onSettled: () => setIsUploading(false),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: documentApi.delete,
        onSuccess: (_, deletedId) => {
            toast.success('Document deleted');
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            // Remove from selection if it was selected
            if (selectedDocIds.includes(deletedId)) {
                onSelectionChange(selectedDocIds.filter(id => id !== deletedId));
            }
        },
        onError: () => {
            toast.error('Failed to delete document');
        },
    });

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadMutation.mutate(file);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Toggle document selection
    const toggleSelection = (docId: string) => {
        if (selectedDocIds.includes(docId)) {
            onSelectionChange(selectedDocIds.filter(id => id !== docId));
        } else {
            onSelectionChange([...selectedDocIds, docId]);
        }
    };

    // Format file size
    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Get file icon color based on type
    const getFileColor = (mimeType: string): string => {
        if (mimeType === 'application/pdf') return 'text-red-500';
        if (mimeType === 'text/plain') return 'text-blue-500';
        return 'text-purple-500';
    };

    return (
        <div className="border-t border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="p-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Documents
                </h3>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-500/30 transition-colors"
                    title="Upload document"
                >
                    {isUploading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Upload size={14} />
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Upload progress */}
            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 pb-2"
                    >
                        <div className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400">
                            <Loader2 size={12} className="animate-spin" />
                            <span>Uploading & extracting text...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Document list */}
            <div className="px-2 pb-2 space-y-1 max-h-48 overflow-y-auto">
                {isLoading ? (
                    <div className="text-center py-3">
                        <Loader2 size={16} className="animate-spin mx-auto text-gray-400" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-3 text-gray-400 dark:text-gray-500">
                        <FileText size={20} className="mx-auto mb-1 opacity-50" />
                        <p className="text-xs">No documents uploaded</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {documents.map((doc: Document) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className={`
                                    group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-xs
                                    ${selectedDocIds.includes(doc.id)
                                        ? 'bg-primary-50 dark:bg-primary-500/10 border border-primary-300 dark:border-primary-500/30'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                                    }
                                `}
                                onClick={() => toggleSelection(doc.id)}
                            >
                                {/* Selection checkbox */}
                                <div className="flex-shrink-0">
                                    {selectedDocIds.includes(doc.id) ? (
                                        <CheckSquare size={14} className="text-primary-500" />
                                    ) : (
                                        <Square size={14} className="text-gray-400" />
                                    )}
                                </div>

                                {/* File icon */}
                                <FileText size={14} className={`flex-shrink-0 ${getFileColor(doc.mimeType)}`} />

                                {/* File info */}
                                <div className="flex-1 min-w-0">
                                    <p className="truncate font-medium text-gray-700 dark:text-gray-300">
                                        {doc.originalName}
                                    </p>
                                    <p className="text-gray-400 dark:text-gray-500">
                                        {formatSize(doc.size)}
                                    </p>
                                </div>

                                {/* Delete button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteMutation.mutate(doc.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded transition-all"
                                >
                                    <Trash2 size={12} className="text-red-500" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Selection info */}
            {selectedDocIds.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-3 pb-2"
                >
                    <div className="flex items-center justify-between text-xs bg-primary-50 dark:bg-primary-500/10 rounded-lg px-2 py-1.5">
                        <span className="text-primary-600 dark:text-primary-400 font-medium">
                            {selectedDocIds.length} doc{selectedDocIds.length > 1 ? 's' : ''} selected
                        </span>
                        <button
                            onClick={() => onSelectionChange([])}
                            className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default DocumentPanel;
