// src/components/AddCardModal.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

    interface AddCardModalProps {
    onClose: () => void;
    onSubmit: (title: string) => void;
    columnTitle: string;
    }

    export default function AddCardModal({ onClose, onSubmit, columnTitle }: AddCardModalProps) {
    const [title, setTitle] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
        onSubmit(title);
        }
    };

    return (
        <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Agregar tarjeta a "{columnTitle}"
                </h3>
                <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título de la tarjeta
                </label>
                <textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Describe tu tarea..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                            bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            resize-none"
                    rows={3}
                    autoFocus
                />
                </div>

                <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 
                            hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                            transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={!title.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 
                            disabled:bg-gray-300 disabled:cursor-not-allowed
                            text-white rounded-lg transition-colors"
                >
                    Crear tarjeta
                </button>
                </div>
            </form>
            </motion.div>
        </motion.div>
        </AnimatePresence>
    );
    }