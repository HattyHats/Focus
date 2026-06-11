'use client';
import { useState, useEffect } from 'react';
import { ListTodo, X, Plus } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function TodoListWidget({ id, onRemove , workspaces = [], onMove }) {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`focus_dashboard_todo_${id}`);
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch (e) {}
    }
  }, [id]);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem(`focus_dashboard_todo_${id}`, JSON.stringify(newTasks));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newTasks = [...tasks, { id: Date.now(), text: inputValue, done: false }];
    saveTasks(newTasks);
    setInputValue('');
  };

  const toggleTask = (taskId) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    saveTasks(newTasks);
  };

  const removeTask = (taskId) => {
    saveTasks(tasks.filter(t => t.id !== taskId));
  };

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <ListTodo size={18} /> To-Do List
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <form onSubmit={addTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Add a task..."
            style={{
              flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)',
              background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', outline: 'none'
            }}
          />
          <button type="submit" style={{ 
            background: 'var(--accent-color)', color: '#fff', borderRadius: '4px', padding: '0.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Plus size={18} />
          </button>
        </form>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
          {tasks.map(task => (
            <div key={task.id} style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', 
              padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' 
            }}>
              <input 
                type="checkbox" 
                checked={task.done} 
                onChange={() => toggleTask(task.id)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span style={{ 
                flex: 1, 
                textDecoration: task.done ? 'line-through' : 'none',
                color: task.done ? 'var(--text-secondary)' : 'var(--text-primary)',
                fontSize: '0.95rem'
              }}>
                {task.text}
              </span>
              <button onClick={() => removeTask(task.id)} style={{ color: 'var(--danger-color)', opacity: 0.7 }}>
                <X size={14} />
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem', fontSize: '0.9rem' }}>
              No tasks yet. You're all caught up!
            </div>
          )}
        </div>
      </div>
    </>
  );
}
