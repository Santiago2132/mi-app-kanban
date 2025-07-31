// src/App.tsx
import { DndContext, closestCenter, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { useKanbanStore } from './store/kanbanStore';
import Column from './components/Column';
import ThemeToggle from './components/ThemeToggle';
import AddCardModal from './components/AddCardModal';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import { useEffect, useState, useContext } from 'react';
import { saveKanbanData } from './db';
import { Plus } from 'lucide-react';

function AppContent() {
  const { theme } = useContext(ThemeContext);
  const {
    columns,
    moveCard,
    addCard,
    addColumn,
    updateColumn,
    deleteColumn,
    moveColumn,
  } = useKanbanStore();

  const [showModal, setShowModal] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingColumn, setEditingColumn] = useState<{ id: string; title: string; color: string } | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map((col) => col.id));
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  useEffect(() => {
    setColumnOrder(columns.map((col) => col.id));
  }, [columns]);

  useEffect(() => {
    saveKanbanData({ columns });
  }, [columns]);

  // Drag & drop columnas
  const handleColumnDragStart = (event: DragStartEvent) => {
    setDraggedColumnId(event.active.id as string);
  };

  const handleColumnDragEnd = (event: DragEndEvent) => {
    setDraggedColumnId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = columnOrder.indexOf(active.id as string);
    const newIndex = columnOrder.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
    setColumnOrder(newOrder);
    moveColumn(active.id as string, newIndex);
  };

  // Drag & drop tarjetas
  const handleCardDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const sourceColumnId = active.data.current?.columnId;
    const destinationColumnId = over.data.current?.columnId || over.id;
    const cardId = active.id;

    if (sourceColumnId && destinationColumnId) {
      const sourceColumn = columns.find((col) => col.id === sourceColumnId);
      const destinationColumn = columns.find((col) => col.id === destinationColumnId);
      const destinationIndex = over.data.current?.index ?? destinationColumn?.cards.length ?? 0;

      if (sourceColumn && destinationColumn) {
        moveCard(cardId as string, sourceColumnId, destinationColumnId, destinationIndex);
      }
    }
  };

  // Modal para agregar tarjeta
  const handleAddCard = (columnId: string) => {
    setSelectedColumn(columnId);
    setShowModal(true);
  };

  const handleCreateCard = (title: string) => {
    if (title.trim()) {
      const newCard = {
        id: `card-${Date.now()}`,
        title: title.trim(),
      };
      addCard(selectedColumn, newCard);
    }
    setShowModal(false);
    setSelectedColumn('');
  };

  // Modal para agregar columna
  const handleAddColumn = () => {
    setShowColumnModal(true);
    setNewColumnTitle('');
  };

  const handleCreateColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle);
      setShowColumnModal(false);
      setNewColumnTitle('');
    }
  };

  // Editar columna
  const handleEditColumn = (col: any) => {
    setEditingColumn({ id: col.id, title: col.title, color: col.color || '#3b82f6' });
  };
  const handleUpdateColumn = () => {
    if (editingColumn && editingColumn.title.trim()) {
      updateColumn(editingColumn.id, { title: editingColumn.title, color: editingColumn.color });
      setEditingColumn(null);
    }
  };

  // Borrar columna
  const handleDeleteColumn = (colId: string) => {
    if (window.confirm('¿Seguro que quieres borrar esta columna?')) {
      deleteColumn(colId);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100'
    }`}>
      <header className={`flex justify-between items-center p-6 backdrop-blur-sm border-b transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/90 border-gray-700'
          : 'bg-white/90 border-gray-200'
      }`}>
        <div>
          <h1 className={`text-3xl font-bold transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Mi Tablero Kanban
          </h1>
          <p className={`mt-1 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Organiza tus tareas de manera eficiente
          </p>
        </div>
        <ThemeToggle />
      </header>

      <main className="p-6">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            // Detecta si es columna o tarjeta
            if (event.active.data.current?.type === 'column') {
              handleColumnDragEnd(event);
            } else {
              handleCardDragEnd(event);
            }
          }}
          onDragStart={handleColumnDragStart}
        >
          <SortableContext items={columnOrder} strategy={rectSortingStrategy}>
            <div className="flex gap-6 overflow-x-auto pb-6">
              {columnOrder.map((colId) => {
                const column = columns.find((c) => c.id === colId);
                if (!column) return null;
                return (
                  <SortableColumn
                    key={column.id}
                    column={column}
                    onAddCard={() => handleAddCard(column.id)}
                    onEditColumn={() => handleEditColumn(column)}
                    onDeleteColumn={() => handleDeleteColumn(column.id)}
                    isDragging={draggedColumnId === column.id}
                  />
                );
              })}
              {/* Botón para agregar columna */}
              <button
                onClick={handleAddColumn}
                className={`flex flex-col items-center justify-center min-w-[220px] h-[120px] border-2 border-dashed rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-400 hover:text-blue-400 hover:border-blue-400 bg-gray-800/30'
                    : 'border-gray-300 text-gray-400 hover:text-blue-500 hover:border-blue-400 bg-white/50'
                }`}
                title="Agregar columna"
              >
                <Plus size={32} />
                <span className="mt-2 text-sm font-medium">Agregar columna</span>
              </button>
            </div>
          </SortableContext>
        </DndContext>
      </main>

      {showModal && (
        <AddCardModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateCard}
          columnTitle={columns.find((col) => col.id === selectedColumn)?.title || ''}
        />
      )}

      {/* Modal para nueva columna */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-xs shadow-2xl transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Nueva columna
            </h3>
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Nombre de la columna"
              className={`w-full p-2 mb-4 border rounded-lg transition-colors duration-300 ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-800 placeholder-gray-500'
              }`}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateColumn();
                if (e.key === 'Escape') setShowColumnModal(false);
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowColumnModal(false)}
                className={`px-3 py-1 rounded-lg transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateColumn}
                disabled={!newColumnTitle.trim()}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar columna */}
      {editingColumn && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-xs shadow-2xl transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Editar columna
            </h3>
            <input
              type="text"
              value={editingColumn.title}
              onChange={(e) => setEditingColumn({ ...editingColumn, title: e.target.value })}
              placeholder="Nombre de la columna"
              className={`w-full p-2 mb-4 border rounded-lg transition-colors duration-300 ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-800 placeholder-gray-500'
              }`}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdateColumn();
                if (e.key === 'Escape') setEditingColumn(null);
              }}
            />
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Color:</span>
              <input
                type="color"
                value={editingColumn.color}
                onChange={(e) => setEditingColumn({ ...editingColumn, color: e.target.value })}
                className="w-8 h-8 border-none bg-transparent"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingColumn(null)}
                className={`px-3 py-1 rounded-lg transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateColumn}
                disabled={!editingColumn.title.trim()}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente SortableColumn - SOLO el handle de arrastre activa el drag
function SortableColumn({ column, onAddCard, onEditColumn, onDeleteColumn, isDragging }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style}>
      <Column
        column={column}
        onAddCard={onAddCard}
        onEditColumn={onEditColumn}
        onDeleteColumn={onDeleteColumn}
        isDragging={isDragging}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}