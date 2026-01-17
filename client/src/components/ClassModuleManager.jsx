import { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, Trash2, Lock, Unlock, GripVertical } from 'lucide-react';

/**
 * ClassModuleManager - Manage modules within a class
 * Supports multiple modules with drag-and-drop reordering and locking
 */
function ClassModuleManager({ classId }) {
  const [modules, setModules] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassModules();
    loadAvailableModules();
  }, [classId]);

  const loadClassModules = async () => {
    try {
      const response = await fetch(`/api/module-creator/classes/${classId}/modules`);
      const data = await response.json();
      if (data.success) {
        setModules(data.data);
      }
    } catch (error) {
      console.error('Error loading class modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableModules = async () => {
    try {
      const response = await fetch('/api/module-creator/modules');
      const data = await response.json();
      if (data.success) {
        setAvailableModules(data.data);
      }
    } catch (error) {
      console.error('Error loading available modules:', error);
    }
  };

  const addModule = async (moduleId) => {
    try {
      const response = await fetch(`/api/module-creator/classes/${classId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          orderIndex: modules.length,
          isLocked: true
        })
      });

      const data = await response.json();
      if (data.success) {
        loadClassModules();
      }
    } catch (error) {
      console.error('Error adding module:', error);
    }
  };

  const removeModule = async (classModuleId) => {
    if (!confirm('Möchten Sie dieses Modul wirklich aus der Klasse entfernen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/module-creator/classes/${classId}/modules/${classModuleId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        loadClassModules();
      }
    } catch (error) {
      console.error('Error removing module:', error);
    }
  };

  const toggleLock = async (classModuleId, currentLockStatus) => {
    try {
      const response = await fetch(`/api/module-creator/classes/${classId}/modules/${classModuleId}/lock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !currentLockStatus })
      });

      const data = await response.json();
      if (data.success) {
        loadClassModules();
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const reorderModules = async (dragIndex, hoverIndex) => {
    const newModules = [...modules];
    const draggedModule = newModules[dragIndex];
    newModules.splice(dragIndex, 1);
    newModules.splice(hoverIndex, 0, draggedModule);

    // Update local state immediately
    setModules(newModules);

    // Update order indices
    const moduleOrder = newModules.map((module, index) => ({
      id: module.class_module_id,
      orderIndex: index
    }));

    try {
      await fetch(`/api/module-creator/classes/${classId}/modules/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleOrder })
      });
    } catch (error) {
      console.error('Error reordering modules:', error);
      loadClassModules(); // Reload on error
    }
  };

  if (loading) {
    return <div className="text-white">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Module in dieser Klasse</h3>
        <div className="relative">
          <select
            onChange={(e) => {
              if (e.target.value) {
                addModule(e.target.value);
                e.target.value = '';
              }
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Modul hinzufügen</option>
            {availableModules
              .filter(m => !modules.find(cm => cm.id === m.id))
              .map(module => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
          </select>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="bg-white/5 rounded-lg p-8 border border-dashed border-white/20 text-center">
          <p className="text-gray-400">Keine Module in dieser Klasse. Fügen Sie ein Modul hinzu, um zu beginnen.</p>
        </div>
      ) : (
        <DndProvider backend={HTML5Backend}>
          <div className="space-y-3">
            {modules.map((module, index) => (
              <ModuleItem
                key={module.class_module_id}
                module={module}
                index={index}
                onRemove={removeModule}
                onToggleLock={toggleLock}
                onMove={reorderModules}
              />
            ))}
          </div>
        </DndProvider>
      )}
    </div>
  );
}

function ModuleItem({ module, index, onRemove, onToggleLock, onMove }) {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'MODULE',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'MODULE',
    hover: (item, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-300">
          <GripVertical size={20} />
        </div>
        
        <div className="flex-1">
          <h4 className="text-white font-semibold">{module.title}</h4>
          <p className="text-sm text-gray-400">{module.description}</p>
        </div>

        <div className="flex items-center gap-2">
          {module.is_locked ? (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs flex items-center gap-1">
              <Lock size={12} />
              Gesperrt
            </span>
          ) : (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1">
              <Unlock size={12} />
              Freigegeben
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => onToggleLock(module.class_module_id, module.is_locked)}
          className={`px-3 py-2 rounded-lg transition-all ${
            module.is_locked
              ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
              : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
          }`}
          title={module.is_locked ? 'Freigeben' : 'Sperren'}
        >
          {module.is_locked ? <Unlock size={16} /> : <Lock size={16} />}
        </button>

        <button
          onClick={() => onRemove(module.class_module_id)}
          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
          title="Entfernen"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default ClassModuleManager;
