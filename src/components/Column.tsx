// src/components/Column.tsx
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import Card from './Card';
import { Plus, Edit3, Trash2, GripVertical } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ColumnProps {
  column: { id: string; title: string; cards: { id: string; title: string }[]; color?: string };
  onAddCard: () => void;
  onEditColumn?: () => void;
  onDeleteColumn?: () => void;
  isDragging?: boolean;
  dragHandleProps?: { attributes: any; listeners: any };
}

// Función para determinar si un color es claro u oscuro
function isLightColor(color: string) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 128;
}

// Función para crear una versión más clara/oscura del color
function adjustColor(color: string, amount: number) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function Column({ 
  column, 
  onAddCard, 
  onEditColumn, 
  onDeleteColumn, 
  isDragging, 
  dragHandleProps 
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id }
  });
  const [hovered, setHovered] = useState(false);

  const bgColor = column.color || '#f1f5fd';
  const isLight = isLightColor(bgColor);
  
  // Crear colores dinámicos basados en el color de fondo
  const colors = useMemo(() => ({
    background: bgColor,
    border: adjustColor(bgColor, isLight ? -20 : 20),
    text: isLight ? '#1f2937' : '#f9fafb',
    textSecondary: isLight ? '#6b7280' : '#d1d5db',
    hover: adjustColor(bgColor, isLight ? -10 : 10),
    cardBg: adjustColor(bgColor, isLight ? 10 : -10),
    buttonBg: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    buttonHover: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
  }), [bgColor, isLight]);

  return (
    <motion.div
      ref={setNodeRef}
      className={`
        min-w-[300px] max-w-[300px] rounded-xl border-2 p-4
        backdrop-blur-sm shadow-lg relative
        ${isDragging ? 'ring-2 ring-blue-400 scale-105 z-50' : ''}
      `}
      style={{ 
        background: colors.background, 
        opacity: isDragging ? 0.8 : 1, 
        borderColor: colors.border,
        color: colors.text
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Handle de arrastre */}
          <div
            {...(dragHandleProps?.attributes || {})}
            {...(dragHandleProps?.listeners || {})}
            className="cursor-grab active:cursor-grabbing p-1 rounded transition-colors"
            style={{ 
              backgroundColor: hovered ? colors.buttonHover : 'transparent',
              color: colors.text
            }}
            title="Arrastrar columna"
          >
            <GripVertical size={16} className="opacity-60 hover:opacity-100" />
          </div>
          
          <h2 
            className="text-lg font-semibold"
            style={{ color: colors.text }}
          >
            {column.title}
          </h2>
        </div>
        
        <div className="flex items-center gap-1">
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: colors.buttonBg,
              color: colors.text
            }}
          >
            {column.cards.length}
          </span>
          
          {/* Botones de edición */}
          {hovered && onEditColumn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditColumn();
              }}
              className="p-1 rounded transition-colors"
              style={{ 
                backgroundColor: colors.buttonHover,
                color: colors.textSecondary
              }}
              title="Editar columna"
            >
              <Edit3 size={14} />
            </button>
          )}
          
          {hovered && onDeleteColumn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteColumn();
              }}
              className="p-1 rounded transition-colors hover:bg-red-100"
              title="Eliminar columna"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          )}
        </div>
      </div>
      
      <SortableContext items={column.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[200px]">
          {column.cards.map((card, index) => (
            <div
              key={card.id}
              style={{
                backgroundColor: colors.cardBg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
              className="rounded-lg"
            >
              <Card 
                card={card} 
                index={index} 
                columnId={column.id}
                columnColors={colors}
              />
            </div>
          ))}
        </div>
      </SortableContext>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddCard();
        }}
        className="w-full mt-4 py-2 px-4 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        style={{
          borderColor: colors.border,
          color: colors.textSecondary,
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.buttonHover;
          e.currentTarget.style.color = colors.text;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = colors.textSecondary;
        }}
      >
        <Plus size={16} />
        Agregar tarjeta
      </button>
    </motion.div>
  );
}