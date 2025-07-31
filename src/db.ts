// src/db.ts
const STORAGE_KEY = 'kanban-data';

export function saveKanbanData(data: any): void {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, jsonData);
  } catch (error) {
    console.error('Error saving kanban data:', error);
  }
}

export function loadKanbanData(): any {
  try {
    const jsonData = localStorage.getItem(STORAGE_KEY);
    return jsonData ? JSON.parse(jsonData) : null;
  } catch (error) {
    console.error('Error loading kanban data:', error);
    return null;
  }
}