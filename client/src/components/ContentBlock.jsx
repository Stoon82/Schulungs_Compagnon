import { useState } from 'react';
import { GripVertical, Trash2, Copy, Lock, Unlock, ChevronDown, ChevronUp, Type, Image as ImageIcon, Video, Minus, Space } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

/**
 * ContentBlock - Base component for modular content blocks
 * Supports: Text, Image, Video, Divider, Spacer blocks
 */
function ContentBlock({ 
  block,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  isFirst,
  isLast
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLocked, setIsLocked] = useState(block.locked || false);

  const handleUpdate = (updates) => {
    onUpdate(index, { ...block, ...updates });
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Text-Inhalt
            </label>
            {isLocked ? (
              <div 
                className="prose prose-invert max-w-none p-4 bg-white/5 rounded-lg border border-white/10"
                dangerouslySetInnerHTML={{ __html: block.content || '' }}
              />
            ) : (
              <RichTextEditor
                content={block.content || ''}
                onChange={(content) => handleUpdate({ content })}
              />
            )}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bild-URL
              </label>
              <input
                type="text"
                value={block.url || ''}
                onChange={(e) => handleUpdate({ url: e.target.value })}
                disabled={isLocked}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alt-Text
              </label>
              <input
                type="text"
                value={block.alt || ''}
                onChange={(e) => handleUpdate({ alt: e.target.value })}
                disabled={isLocked}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                placeholder="Bildbeschreibung"
              />
            </div>
            {block.url && (
              <div className="mt-3">
                <img 
                  src={block.url} 
                  alt={block.alt || 'Preview'} 
                  className="max-w-full h-auto rounded-lg border border-white/10"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video-URL (YouTube, Vimeo, oder direkt)
              </label>
              <input
                type="text"
                value={block.url || ''}
                onChange={(e) => handleUpdate({ url: e.target.value })}
                disabled={isLocked}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            {block.url && (
              <div className="mt-3 aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={block.url}
                  className="w-full h-full"
                  allowFullScreen
                  title="Video preview"
                />
              </div>
            )}
          </div>
        );

      case 'divider':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trennlinie-Stil
            </label>
            <select
              value={block.style || 'solid'}
              onChange={(e) => handleUpdate({ style: e.target.value })}
              disabled={isLocked}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <option value="solid">Durchgezogen</option>
              <option value="dashed">Gestrichelt</option>
              <option value="dotted">Gepunktet</option>
            </select>
            <div className="mt-4">
              <div 
                className={`border-t-2 ${
                  block.style === 'dashed' ? 'border-dashed' : 
                  block.style === 'dotted' ? 'border-dotted' : 
                  'border-solid'
                } border-white/20`}
              />
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Höhe: {block.height || 40}px
            </label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={block.height || 40}
              onChange={(e) => handleUpdate({ height: parseInt(e.target.value) })}
              disabled={isLocked}
              className="w-full"
            />
            <div 
              className="bg-white/5 border border-dashed border-white/20 rounded flex items-center justify-center text-gray-500 text-sm"
              style={{ height: `${block.height || 40}px` }}
            >
              Abstand: {block.height || 40}px
            </div>
          </div>
        );

      default:
        return <p className="text-gray-400">Unbekannter Block-Typ</p>;
    }
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'text': return <Type size={16} />;
      case 'image': return <ImageIcon size={16} />;
      case 'video': return <Video size={16} />;
      case 'divider': return <Minus size={16} />;
      case 'spacer': return <Space size={16} />;
      default: return null;
    }
  };

  const getBlockLabel = () => {
    switch (block.type) {
      case 'text': return 'Text-Block';
      case 'image': return 'Bild-Block';
      case 'video': return 'Video-Block';
      case 'divider': return 'Trennlinie';
      case 'spacer': return 'Abstand';
      default: return 'Block';
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      {/* Block Header */}
      <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-300"
            title="Ziehen zum Verschieben"
          >
            <GripVertical size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            {getBlockIcon()}
            <span className="text-sm font-medium text-white">{getBlockLabel()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Move Up/Down */}
          <button
            onClick={() => onMove(index, 'up')}
            disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Nach oben"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={() => onMove(index, 'down')}
            disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Nach unten"
          >
            <ChevronDown size={16} />
          </button>

          {/* Collapse/Expand */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-gray-400 hover:text-gray-300"
            title={isCollapsed ? 'Ausklappen' : 'Einklappen'}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          {/* Lock/Unlock */}
          <button
            onClick={() => {
              setIsLocked(!isLocked);
              handleUpdate({ locked: !isLocked });
            }}
            className="p-1 text-gray-400 hover:text-gray-300"
            title={isLocked ? 'Entsperren' : 'Sperren'}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>

          {/* Duplicate */}
          <button
            onClick={() => onDuplicate(index)}
            className="p-1 text-blue-400 hover:text-blue-300"
            title="Duplizieren"
          >
            <Copy size={16} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(index)}
            className="p-1 text-red-400 hover:text-red-300"
            title="Löschen"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Block Content */}
      {!isCollapsed && (
        <div className="p-4">
          {renderBlockContent()}
        </div>
      )}
    </div>
  );
}

export default ContentBlock;
