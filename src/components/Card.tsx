// src/components/Card.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Trash2, Edit3, GripVertical } from 'lucide-react';
import { useKanbanStore } from '../store/kanbanStore';

interface CardProps {
  card: { id: string; title: string };
  index: number;
  columnId: string;
  columnColors?: {
    background: string;
    border: string;
    text: string;
    textSecondary: string;
    hover: string;
    cardBg: string;
    buttonBg: string;
    buttonHover: string;
  };
}

export default function Card({ card, index, columnId, columnColors }: CardProps) {
  const { deleteCard, updateCard } = useKanbanStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [isHovered, setIsHovered] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', columnId, index },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== card.title) {
      updateCard(columnId, card.id, editTitle.trim());
    }
    setIsEditing(false);
    setEditTitle(card.title);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(card.title);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      deleteCard(columnId, card.id);
    }
  };

  // Usar colores de la columna o defaults
  const colors = columnColors || {
    background: '#ffffff',
    border: '#e5e7eb',
    text: '#1f2937',
    textSecondary: '#6b7280',
    hover: '#f3f4f6',
    cardBg: '#ffffff',
    buttonBg: 'rgba(0,0,0,0.1)',
    buttonHover: 'rgba(0,0,0,0.15)',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: colors.cardBg,
        borderColor: colors.border,
        color: colors.text,
      }}
      className={`
        rounded-lg p-3 shadow-sm border group relative
        ${isDragging ? 'ring-2 ring-blue-400 scale-105 z-50 shadow-2xl' : ''}
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isDragging ? 0.9 : 1,
        scale: isDragging ? 1.05 : 1,
        boxShadow: isDragging
          ? '0 12px 32px 0 rgba(37, 99, 235, 0.35)'
          : '0 1px 2px 0 rgba(0,0,0,0.05)'
      }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing pt-1 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0"
          style={{ color: colors.textSecondary }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
              className="w-full bg-transparent border-none outline-none text-sm font-medium"
              style={{ color: colors.text }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p 
              className="text-sm font-medium break-words cursor-default"
              style={{ color: colors.text }}
              onClick={(e) => e.stopPropagation()}
            >
              {card.title}
            </p>
          )}
        </div>

        {isHovered && !isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-1 flex-shrink-0"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="p-1 rounded transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                color: colors.textSecondary
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.buttonHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Editar"
              tabIndex={-1}
            >
              <Edit3 size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="p-1 rounded transition-colors hover:bg-red-100"
              title="Eliminar"
              tabIndex={-1}
            >
              <Trash2 size={12} className="text-red-500" />
            </button>
          </motion.div>
        )}

        {/* Indicador visual cuando se arrastra */}
        {isDragging && (
          <div 
            className="absolute inset-0 rounded-lg border-2 border-blue-400 bg-blue-50/20 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 1000 }}
          >
            <div className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full shadow-sm">
              Arrastrando: {card.title.length > 20 ? card.title.substring(0, 20) + '...' : card.title}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}