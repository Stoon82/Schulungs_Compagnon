import { useState, useEffect } from 'react';
import { FileText, Video, ExternalLink, Download, BookOpen, Sparkles } from 'lucide-react';
import api from '../services/api';

const iconMap = {
  pdf: FileText,
  video: Video,
  link: ExternalLink
};

function MaterialHub() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const result = await api.getMaterials();
      if (result.success) {
        setMaterials(result.data);
      }
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'Alle' },
    { id: 'basics', name: 'Grundlagen' },
    { id: 'technical', name: 'Technisch' },
    { id: 'practical', name: 'Praxis' },
    { id: 'legal', name: 'Rechtliches' },
    { id: 'ethics', name: 'Ethik' }
  ];

  const filteredMaterials = selectedCategory === 'all'
    ? materials
    : materials.filter(m => m.category === selectedCategory);

  const handleMaterialClick = async (material) => {
    try {
      await api.getMaterial(material.id);
      
      if (material.type === 'link' || material.type === 'video') {
        window.open(material.url, '_blank');
      } else {
        window.open(material.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to access material:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Lade Materialien...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
          <BookOpen size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Material-Hub</h2>
          <p className="text-gray-400">Ressourcen und Lernmaterialien</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map(material => {
          const Icon = iconMap[material.type] || FileText;
          
          return (
            <div
              key={material.id}
              onClick={() => handleMaterialClick(material)}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={24} className="text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">
                    {material.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {material.description}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-300">
                      {material.type.toUpperCase()}
                    </span>
                    {material.type === 'pdf' && (
                      <Download size={14} className="text-gray-400" />
                    )}
                    {(material.type === 'link' || material.type === 'video') && (
                      <ExternalLink size={14} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>Keine Materialien in dieser Kategorie gefunden.</p>
        </div>
      )}

      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 mt-8">
        <div className="flex items-start gap-4">
          <Sparkles size={24} className="text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              KI-generierte Zusammenfassungen
            </h3>
            <p className="text-gray-300 text-sm">
              Nutze den KI-Assistenten, um dir Zusammenfassungen der Materialien erstellen zu lassen.
              Frage einfach: "Fasse das Material [Name] zusammen"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialHub;
