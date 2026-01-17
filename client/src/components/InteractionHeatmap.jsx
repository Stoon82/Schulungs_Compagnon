import { useState, useRef } from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

/**
 * InteractionHeatmap - Visual heatmap with export to image
 * Shows interaction intensity across submodules
 */
function InteractionHeatmap({ data, sessionId }) {
  const heatmapRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const exportAsImage = async () => {
    if (!heatmapRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(heatmapRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `heatmap-${sessionId || 'overview'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting heatmap:', error);
      alert('Fehler beim Exportieren der Heatmap');
    } finally {
      setExporting(false);
    }
  };

  const getIntensityColor = (value, max) => {
    const intensity = value / max;
    if (intensity >= 0.8) return 'bg-green-500';
    if (intensity >= 0.6) return 'bg-yellow-500';
    if (intensity >= 0.4) return 'bg-orange-500';
    if (intensity >= 0.2) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getIntensityOpacity = (value, max) => {
    const intensity = value / max;
    return Math.max(0.2, intensity);
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Keine Interaktionsdaten verfügbar</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.total || 0));

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportAsImage}
          disabled={exporting}
          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {exporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400"></div>
              Exportiere...
            </>
          ) : (
            <>
              <ImageIcon size={18} />
              Als Bild exportieren
            </>
          )}
        </button>
      </div>

      {/* Heatmap */}
      <div ref={heatmapRef} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-6">Interaktions-Heatmap</h3>
        
        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 text-sm">
          <span className="text-gray-400">Intensität:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-gray-400">Niedrig</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-400">Gering</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-gray-400">Mittel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-400">Hoch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-400">Sehr hoch</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {data.map((item, index) => (
            <div
              key={index}
              className={`relative rounded-lg p-4 border border-white/10 transition-all hover:scale-105 ${
                getIntensityColor(item.total || 0, maxValue)
              }`}
              style={{
                opacity: getIntensityOpacity(item.total || 0, maxValue)
              }}
            >
              <div className="relative z-10">
                <p className="text-white font-semibold text-sm mb-2 line-clamp-2">
                  {item.name || item.submodule_title}
                </p>
                <div className="space-y-1 text-xs text-white/90">
                  {item.emojis !== undefined && (
                    <div className="flex items-center justify-between">
                      <span>😊 Emojis:</span>
                      <span className="font-semibold">{item.emojis}</span>
                    </div>
                  )}
                  {item.polls !== undefined && (
                    <div className="flex items-center justify-between">
                      <span>📊 Polls:</span>
                      <span className="font-semibold">{item.polls}</span>
                    </div>
                  )}
                  {item.wordclouds !== undefined && (
                    <div className="flex items-center justify-between">
                      <span>☁️ Word Clouds:</span>
                      <span className="font-semibold">{item.wordclouds}</span>
                    </div>
                  )}
                  {item.qa !== undefined && (
                    <div className="flex items-center justify-between">
                      <span>💬 Q&A:</span>
                      <span className="font-semibold">{item.qa}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-white/20">
                    <span className="font-bold">Gesamt:</span>
                    <span className="font-bold">{item.total || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {data.reduce((sum, item) => sum + (item.emojis || 0), 0)}
            </p>
            <p className="text-sm text-gray-400">Gesamt Emojis</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {data.reduce((sum, item) => sum + (item.polls || 0), 0)}
            </p>
            <p className="text-sm text-gray-400">Gesamt Polls</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {data.reduce((sum, item) => sum + (item.wordclouds || 0), 0)}
            </p>
            <p className="text-sm text-gray-400">Gesamt Word Clouds</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {data.reduce((sum, item) => sum + (item.qa || 0), 0)}
            </p>
            <p className="text-sm text-gray-400">Gesamt Q&A</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractionHeatmap;
