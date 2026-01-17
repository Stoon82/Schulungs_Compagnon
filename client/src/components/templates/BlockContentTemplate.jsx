import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, Save } from 'lucide-react';
import ContentBlock from '../ContentBlock';

/**
 * BlockContentTemplate - Template for creating content using draggable blocks
 * Supports text, image, video, divider, and spacer blocks with drag-and-drop reordering
 */
function BlockContentTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    blocks: content?.blocks || []
  });

  const handleChange = (updates) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    if (onChange) {
      onChange(newData);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      locked: false
    };

    // Set default values based on type
    switch (type) {
      case 'text':
        newBlock.content = '';
        break;
      case 'image':
        newBlock.url = '';
        newBlock.alt = '';
        break;
      case 'video':
        newBlock.url = '';
        break;
      case 'divider':
        newBlock.style = 'solid';
        break;
      case 'spacer':
        newBlock.height = 40;
        break;
      default:
        break;
    }

    handleChange({ blocks: [...formData.blocks, newBlock] });
  };

  const updateBlock = (index, updates) => {
    const newBlocks = [...formData.blocks];
    newBlocks[index] = updates;
    handleChange({ blocks: newBlocks });
  };

  const deleteBlock = (index) => {
    const newBlocks = formData.blocks.filter((_, i) => i !== index);
    handleChange({ blocks: newBlocks });
  };

  const duplicateBlock = (index) => {
    const blockToDuplicate = { ...formData.blocks[index], id: Date.now() };
    const newBlocks = [
      ...formData.blocks.slice(0, index + 1),
      blockToDuplicate,
      ...formData.blocks.slice(index + 1)
    ];
    handleChange({ blocks: newBlocks });
  };

  const moveBlock = useCallback((dragIndex, hoverIndex) => {
    const newBlocks = [...formData.blocks];
    const draggedBlock = newBlocks[dragIndex];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, draggedBlock);
    handleChange({ blocks: newBlocks });
  }, [formData.blocks]);

  const moveBlockUpDown = (index, direction) => {
    if (direction === 'up' && index > 0) {
      moveBlock(index, index - 1);
    } else if (direction === 'down' && index < formData.blocks.length - 1) {
      moveBlock(index, index + 1);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titel
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Titel eingeben"
          />
        </div>

        {/* Add Block Buttons */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-sm font-semibold text-white mb-3">Block hinzufügen</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addBlock('text')}
              className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Text
            </button>
            <button
              onClick={() => addBlock('image')}
              className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Bild
            </button>
            <button
              onClick={() => addBlock('video')}
              className="px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Video
            </button>
            <button
              onClick={() => addBlock('divider')}
              className="px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Trennlinie
            </button>
            <button
              onClick={() => addBlock('spacer')}
              className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Abstand
            </button>
          </div>
        </div>

        {/* Blocks List with Drag and Drop */}
        <DndProvider backend={HTML5Backend}>
          <div className="space-y-3">
            {formData.blocks.length === 0 ? (
              <div className="bg-white/5 rounded-lg p-8 border border-dashed border-white/20 text-center">
                <p className="text-gray-400">Keine Blöcke vorhanden. Fügen Sie einen Block hinzu, um zu beginnen.</p>
              </div>
            ) : (
              formData.blocks.map((block, index) => (
                <ContentBlock
                  key={block.id}
                  block={block}
                  index={index}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                  onDuplicate={duplicateBlock}
                  onMove={moveBlock}
                  isFirst={index === 0}
                  isLast={index === formData.blocks.length - 1}
                />
              ))
            )}
          </div>
        </DndProvider>

        {onSave && (
          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            <span>Speichern</span>
          </button>
        )}
      </div>
    );
  }

  // Preview mode
  return (
    <div className="space-y-6">
      {formData.title && (
        <h2 className="text-3xl font-bold text-white border-b border-white/20 pb-4">
          {formData.title}
        </h2>
      )}

      <div className="space-y-4">
        {formData.blocks.map((block, index) => {
          switch (block.type) {
            case 'text':
              return (
                <div 
                  key={block.id}
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: block.content || '' }}
                />
              );
            case 'image':
              return block.url ? (
                <img
                  key={block.id}
                  src={block.url}
                  alt={block.alt || 'Image'}
                  className="max-w-full h-auto rounded-lg border border-white/10"
                />
              ) : null;
            case 'video':
              return block.url ? (
                <div key={block.id} className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={block.url}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video"
                  />
                </div>
              ) : null;
            case 'divider':
              return (
                <div
                  key={block.id}
                  className={`border-t-2 ${
                    block.style === 'dashed' ? 'border-dashed' :
                    block.style === 'dotted' ? 'border-dotted' :
                    'border-solid'
                  } border-white/20`}
                />
              );
            case 'spacer':
              return (
                <div
                  key={block.id}
                  style={{ height: `${block.height || 40}px` }}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

export default BlockContentTemplate;
