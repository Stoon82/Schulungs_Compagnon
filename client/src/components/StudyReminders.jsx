import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Clock, Calendar, Check } from 'lucide-react';
import axios from 'axios';

/**
 * StudyReminders Component
 * Schedule and manage study reminders
 */
function StudyReminders({ userId }) {
  const [reminders, setReminders] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    time: '',
    days: [],
    moduleId: '',
    enabled: true
  });

  const weekDays = [
    { id: 'mon', label: 'Mo' },
    { id: 'tue', label: 'Di' },
    { id: 'wed', label: 'Mi' },
    { id: 'thu', label: 'Do' },
    { id: 'fri', label: 'Fr' },
    { id: 'sat', label: 'Sa' },
    { id: 'sun', label: 'So' }
  ];

  useEffect(() => {
    if (userId) {
      fetchReminders();
    }
  }, [userId]);

  const fetchReminders = async () => {
    try {
      // Mock data - replace with actual API call
      const mockReminders = [
        {
          id: '1',
          title: 'Tägliche Wiederholung',
          time: '09:00',
          days: ['mon', 'tue', 'wed', 'thu', 'fri'],
          moduleId: 'module-1',
          enabled: true
        },
        {
          id: '2',
          title: 'Wochenend-Lernsession',
          time: '14:00',
          days: ['sat', 'sun'],
          moduleId: 'module-2',
          enabled: false
        }
      ];
      setReminders(mockReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const createReminder = async () => {
    if (!newReminder.title || !newReminder.time || newReminder.days.length === 0) {
      alert('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      const reminder = {
        ...newReminder,
        id: Date.now().toString(),
        userId
      };

      setReminders([...reminders, reminder]);
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Reset form
      setNewReminder({
        title: '',
        time: '',
        days: [],
        moduleId: '',
        enabled: true
      });
      setIsCreating(false);

      // Save to backend
      await axios.post('/api/study-reminders', reminder);
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const toggleReminder = async (id) => {
    const updatedReminders = reminders.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setReminders(updatedReminders);

    try {
      const reminder = updatedReminders.find(r => r.id === id);
      await axios.put(`/api/study-reminders/${id}`, reminder);
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const deleteReminder = async (id) => {
    setReminders(reminders.filter(r => r.id !== id));

    try {
      await axios.delete(`/api/study-reminders/${id}`);
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const toggleDay = (dayId) => {
    setNewReminder(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(d => d !== dayId)
        : [...prev.days, dayId]
    }));
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="text-blue-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-white">Lern-Erinnerungen</h2>
            <p className="text-sm text-gray-400">
              Planen Sie regelmäßige Lernsessions
            </p>
          </div>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Neu
          </button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="mb-6 bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Titel
            </label>
            <input
              type="text"
              value={newReminder.title}
              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              placeholder="z.B. Tägliche Wiederholung"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Uhrzeit
            </label>
            <input
              type="time"
              value={newReminder.time}
              onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Wochentage
            </label>
            <div className="flex gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                    newReminder.days.includes(day.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={createReminder}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-cyan-600 transition-all"
            >
              Erstellen
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-white transition-all"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Reminders List */}
      {reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-4 rounded-lg border transition-all ${
                reminder.enabled
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/5 border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{reminder.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {reminder.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {reminder.days.length} Tage
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className={`p-2 rounded-lg transition-all ${
                      reminder.enabled
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                    title={reminder.enabled ? 'Deaktivieren' : 'Aktivieren'}
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all"
                    title="Löschen"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex gap-1">
                {weekDays.map((day) => (
                  <div
                    key={day.id}
                    className={`flex-1 text-center py-1 rounded text-xs font-semibold ${
                      reminder.days.includes(day.id)
                        ? 'bg-blue-500/30 text-blue-300'
                        : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    {day.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-lg">
          <Bell className="mx-auto mb-4 text-gray-500" size={48} />
          <p className="text-gray-400 mb-4">Keine Erinnerungen eingerichtet</p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-cyan-600 transition-all inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Erste Erinnerung erstellen
          </button>
        </div>
      )}

      {/* Notification Permission */}
      {'Notification' in window && Notification.permission === 'default' && (
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-sm text-yellow-300 mb-3">
            <strong>🔔 Benachrichtigungen erlauben</strong>
          </p>
          <button
            onClick={() => Notification.requestPermission()}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold text-white transition-all text-sm"
          >
            Erlauben
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>💡 Tipp:</strong> Regelmäßige Lernsessions verbessern die Langzeitretention.
          Wir empfehlen tägliche 15-30 Minuten Sessions statt seltener langer Sessions.
        </p>
      </div>
    </div>
  );
}

export default StudyReminders;
