// src/store/kanbanStore.ts
import { create } from 'zustand';
import { loadKanbanData } from '../db';

interface Card {
  id: string;
  title: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
  color?: string;
}

interface KanbanState {
  columns: Column[];
  addCard: (columnId: string, card: Card) => void;
  moveCard: (cardId: string, sourceColumnId: string, destinationColumnId: string, index: number) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  updateCard: (columnId: string, cardId: string, newTitle: string) => void;
  setColumns: (columns: Column[]) => void;
  addColumn: (title: string) => void;
  updateColumn: (columnId: string, data: { title?: string; color?: string }) => void;
  deleteColumn: (columnId: string) => void;
  moveColumn: (columnId: string, newIndex: number) => void;
}

export const useKanbanStore = create<KanbanState>((set) => {
  // Intenta cargar columnas desde localStorage
  const persisted = loadKanbanData();
  const initialColumns =
    persisted && persisted.columns
      ? persisted.columns
      : [
          { id: 'todo', title: 'Por hacer', cards: [] },
          { id: 'in-progress', title: 'En progreso', cards: [] },
          { id: 'done', title: 'Completado', cards: [] },
        ];

  return {
    columns: initialColumns,
    addCard: (columnId, card) =>
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
        ),
      })),
    moveCard: (cardId, sourceColumnId, destinationColumnId, index) =>
      set((state) => {
        const sourceColumn = state.columns.find((col) => col.id === sourceColumnId);
        const destinationColumn = state.columns.find((col) => col.id === destinationColumnId);
        if (!sourceColumn || !destinationColumn) return state;

        const card = sourceColumn.cards.find((c) => c.id === cardId);
        if (!card) return state;

        const newSourceCards = sourceColumn.cards.filter((c) => c.id !== cardId);
        const newDestinationCards = [...destinationColumn.cards];
        newDestinationCards.splice(index, 0, card);

        return {
          columns: state.columns.map((col) =>
            col.id === sourceColumnId
              ? { ...col, cards: newSourceCards }
              : col.id === destinationColumnId
              ? { ...col, cards: newDestinationCards }
              : col
          ),
        };
      }),
    deleteCard: (columnId, cardId) =>
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) } : col
        ),
      })),
    updateCard: (columnId, cardId, newTitle) =>
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId
            ? { ...col, cards: col.cards.map((c) => c.id === cardId ? { ...c, title: newTitle } : c) }
            : col
        ),
      })),
    setColumns: (columns) => set({ columns }),
    addColumn: (title) =>
      set((state) => ({
        columns: [
          ...state.columns,
          {
            id: `col-${Date.now()}`,
            title: title.trim() || 'Nueva columna',
            cards: [],
            color: '#f1f5fd',
          },
        ],
      })),
    updateColumn: (columnId, data) =>
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId ? { ...col, ...data } : col
        ),
      })),
    deleteColumn: (columnId) =>
      set((state) => ({
        columns: state.columns.filter((col) => col.id !== columnId),
      })),
    moveColumn: (columnId, newIndex) =>
      set((state) => {
        const idx = state.columns.findIndex((col) => col.id === columnId);
        if (idx === -1) return state;
        const newColumns = [...state.columns];
        const [removed] = newColumns.splice(idx, 1);
        newColumns.splice(newIndex, 0, removed);
        return { columns: newColumns };
      }),
  };
});