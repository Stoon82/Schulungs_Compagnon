import { useState, useEffect } from 'react';
import { Users, Search, MessageCircle, Star, Award, Calendar, Check, X } from 'lucide-react';
import axios from 'axios';

/**
 * MentorMatching Component
 * Connect learners with experienced mentors
 */
function MentorMatching({ currentUser }) {
  const [mentors, setMentors] = useState([]);
  const [myMentor, setMyMentor] = useState(null);
  const [myMentees, setMyMentees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('all');
  const [requests, setRequests] = useState([]);
  const [isMentorMode, setIsMentorMode] = useState(false);

  const expertiseAreas = [
    { id: 'all', label: 'Alle Bereiche' },
    { id: 'hygiene', label: 'Hygiene' },
    { id: 'medication', label: 'Medikamentengabe' },
    { id: 'communication', label: 'Kommunikation' },
    { id: 'documentation', label: 'Dokumentation' },
    { id: 'emergency', label: 'Notfallmanagement' }
  ];

  useEffect(() => {
    fetchMentors();
    fetchMyMentor();
    fetchMyMentees();
    fetchRequests();
  }, []);

  const fetchMentors = async () => {
    try {
      // Mock data - replace with actual API call
      const mockMentors = [
        {
          id: '1',
          name: 'Dr. Sarah Müller',
          avatar: '👩‍⚕️',
          expertise: ['hygiene', 'medication'],
          rating: 4.8,
          mentees: 12,
          experience: '15 Jahre Erfahrung',
          availability: 'Verfügbar',
          bio: 'Spezialisiert auf Hygiene und Medikamentengabe. Freue mich darauf, mein Wissen zu teilen!'
        },
        {
          id: '2',
          name: 'Thomas Weber',
          avatar: '👨‍⚕️',
          expertise: ['emergency', 'communication'],
          rating: 4.9,
          mentees: 8,
          experience: '10 Jahre Erfahrung',
          availability: 'Begrenzt verfügbar',
          bio: 'Notfallpflege-Experte mit Leidenschaft für effektive Kommunikation.'
        },
        {
          id: '3',
          name: 'Anna Schmidt',
          avatar: '👩‍⚕️',
          expertise: ['documentation', 'communication'],
          rating: 4.7,
          mentees: 15,
          experience: '12 Jahre Erfahrung',
          availability: 'Verfügbar',
          bio: 'Helfe gerne bei Dokumentation und Patientenkommunikation.'
        }
      ];
      setMentors(mockMentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchMyMentor = async () => {
    try {
      // Mock data
      const mockMentor = null; // Set to mentor object if user has one
      setMyMentor(mockMentor);
    } catch (error) {
      console.error('Error fetching my mentor:', error);
    }
  };

  const fetchMyMentees = async () => {
    try {
      // Mock data
      const mockMentees = [];
      setMyMentees(mockMentees);
    } catch (error) {
      console.error('Error fetching my mentees:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      // Mock data
      const mockRequests = [];
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const requestMentor = async (mentorId) => {
    try {
      await axios.post('/api/mentor-matching/request', {
        mentorId,
        userId: currentUser.id,
        message: 'Ich würde gerne von Ihnen lernen!'
      });
      alert('Anfrage gesendet!');
    } catch (error) {
      console.error('Error requesting mentor:', error);
      alert('Fehler beim Senden der Anfrage');
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await axios.post(`/api/mentor-matching/accept/${requestId}`);
      fetchRequests();
      fetchMyMentees();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const declineRequest = async (requestId) => {
    try {
      await axios.post(`/api/mentor-matching/decline/${requestId}`);
      fetchRequests();
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExpertise = filterExpertise === 'all' || 
                            mentor.expertise.includes(filterExpertise);
    return matchesSearch && matchesExpertise;
  });

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-orange-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-white">Mentor Matching</h2>
            <p className="text-sm text-gray-400">
              Finden Sie erfahrene Mentoren oder werden Sie selbst einer
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsMentorMode(false)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              !isMentorMode
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Mentoren finden
          </button>
          <button
            onClick={() => setIsMentorMode(true)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              isMentorMode
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Meine Mentees
          </button>
        </div>
      </div>

      {/* Find Mentors Mode */}
      {!isMentorMode && (
        <>
          {/* My Current Mentor */}
          {myMentor && (
            <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Mein Mentor</h3>
              <div className="flex items-center gap-4">
                <div className="text-5xl">{myMentor.avatar}</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-1">{myMentor.name}</h4>
                  <p className="text-sm text-gray-400 mb-2">{myMentor.experience}</p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-white transition-all flex items-center gap-2">
                      <MessageCircle size={16} />
                      Nachricht senden
                    </button>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-white transition-all flex items-center gap-2">
                      <Calendar size={16} />
                      Meeting planen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mentoren durchsuchen..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {expertiseAreas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setFilterExpertise(area.id)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    filterExpertise === area.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {area.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-orange-500/50 transition-all"
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{mentor.avatar}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{mentor.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{mentor.experience}</p>
                  
                  <div className="flex items-center justify-center gap-4 text-sm mb-3">
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star size={14} fill="currentColor" />
                      {mentor.rating}
                    </span>
                    <span className="text-gray-400">
                      {mentor.mentees} Mentees
                    </span>
                  </div>

                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    mentor.availability === 'Verfügbar'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {mentor.availability}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-4 line-clamp-3">{mentor.bio}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.expertise.map((exp) => (
                    <span
                      key={exp}
                      className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs"
                    >
                      {expertiseAreas.find(a => a.id === exp)?.label}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => requestMentor(mentor.id)}
                  disabled={!!myMentor}
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold text-white hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {myMentor ? 'Bereits ein Mentor' : 'Anfrage senden'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mentees Mode */}
      {isMentorMode && (
        <>
          {/* Pending Requests */}
          {requests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Anfragen ({requests.length})</h3>
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{request.user.avatar}</div>
                      <div>
                        <p className="text-white font-semibold">{request.user.name}</p>
                        <p className="text-sm text-gray-400">{request.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(request.id)}
                        className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all"
                        title="Akzeptieren"
                      >
                        <Check size={18} className="text-white" />
                      </button>
                      <button
                        onClick={() => declineRequest(request.id)}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                        title="Ablehnen"
                      >
                        <X size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Mentees */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">
              Meine Mentees ({myMentees.length})
            </h3>
            
            {myMentees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myMentees.map((mentee) => (
                  <div
                    key={mentee.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-4xl">{mentee.avatar}</div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{mentee.name}</h4>
                        <p className="text-sm text-gray-400">Seit {mentee.since}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div className="bg-white/5 rounded p-2 text-center">
                        <p className="text-gray-400">Fortschritt</p>
                        <p className="text-white font-semibold">{mentee.progress}%</p>
                      </div>
                      <div className="bg-white/5 rounded p-2 text-center">
                        <p className="text-gray-400">Meetings</p>
                        <p className="text-white font-semibold">{mentee.meetings}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-white transition-all text-sm flex items-center justify-center gap-2">
                        <MessageCircle size={14} />
                        Chat
                      </button>
                      <button className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-white transition-all text-sm flex items-center justify-center gap-2">
                        <Calendar size={14} />
                        Meeting
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-lg">
                <Users className="mx-auto mb-4 text-gray-500" size={48} />
                <p className="text-gray-400 mb-4">Noch keine Mentees</p>
                <p className="text-sm text-gray-500">
                  Teilen Sie Ihr Wissen und helfen Sie anderen beim Lernen!
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>💡 Mentoring-Vorteile:</strong> Mentoren helfen bei spezifischen Fragen,
          teilen Erfahrungen und unterstützen bei der beruflichen Entwicklung. Als Mentor
          festigen Sie Ihr eigenes Wissen und sammeln Führungserfahrung.
        </p>
      </div>
    </div>
  );
}

export default MentorMatching;
