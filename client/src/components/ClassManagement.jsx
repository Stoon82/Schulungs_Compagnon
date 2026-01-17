import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Share2, Play, Calendar, Users, BookOpen } from 'lucide-react';

function ClassManagement({ adminUser, onStartSession }) {
  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  useEffect(() => {
    loadClasses();
    loadModules();
  }, [adminUser]);

  const loadClasses = async () => {
    try {
      const response = await fetch(`/api/session-management/admin/${adminUser.id}/classes`);
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      const response = await fetch('/api/module-creator/modules');
      const data = await response.json();
      if (data.success) {
        setModules(data.data);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const handleCreateClass = () => {
    setEditingClass({
      name: '',
      description: '',
      moduleId: '',
      startDate: '',
      endDate: '',
      maxParticipants: ''
    });
    setShowCreateModal(true);
  };

  const handleSaveClass = async (classData) => {
    try {
      const url = classData.id
        ? `/api/session-management/classes/${classData.id}`
        : `/api/session-management/admin/${adminUser.id}/classes`;
      
      const method = classData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });

      const data = await response.json();
      if (data.success) {
        loadClasses();
        setShowCreateModal(false);
        setEditingClass(null);
      }
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!confirm('Klasse wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/session-management/classes/${classId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        loadClasses();
      }
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const handleStartSession = async (classItem) => {
    try {
      const response = await fetch('/api/session-management/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: classItem.id,
          startedBy: adminUser.id,
          presentationMode: 'manual'
        })
      });

      const data = await response.json();
      if (data.success) {
        onStartSession(data.data);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Meine Klassen</h2>
          <p className="text-gray-400">Verwalten Sie Ihre Schulungssitzungen</p>
        </div>
        <button
          onClick={handleCreateClass}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Neue Klasse
        </button>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-4">Noch keine Klassen erstellt</p>
          <button
            onClick={handleCreateClass}
            className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
          >
            Erste Klasse erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {classItem.name}
                    </h3>
                    {classItem.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {classItem.description}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    classItem.access_level === 'owner'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {classItem.access_level === 'owner' ? 'Eigentümer' : 'Geteilt'}
                  </span>
                </div>

                {classItem.module_title && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <BookOpen size={16} />
                    <span>{classItem.module_title}</span>
                  </div>
                )}

                {classItem.start_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={16} />
                    <span>{new Date(classItem.start_date).toLocaleDateString('de-DE')}</span>
                  </div>
                )}

                {classItem.max_participants && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users size={16} />
                    <span>Max. {classItem.max_participants} Teilnehmer</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleStartSession(classItem)}
                    className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={16} />
                    <span>Starten</span>
                  </button>
                  
                  {classItem.access_level === 'owner' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingClass(classItem);
                          setShowCreateModal(true);
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(classItem.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <ClassModal
          classData={editingClass}
          modules={modules}
          onSave={handleSaveClass}
          onClose={() => {
            setShowCreateModal(false);
            setEditingClass(null);
          }}
        />
      )}
    </div>
  );
}

function ClassModal({ classData, modules, onSave, onClose }) {
  const [formData, setFormData] = useState(classData);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">
            {formData.id ? 'Klasse bearbeiten' : 'Neue Klasse erstellen'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Klassenname *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="z.B. 'KI-Grundlagen Workshop'"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
              placeholder="Beschreiben Sie die Schulung..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Modul
            </label>
            <select
              value={formData.moduleId}
              onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Kein Modul ausgewählt</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Startdatum
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enddatum
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max. Teilnehmer
            </label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              min="1"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Unbegrenzt"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClassManagement;
