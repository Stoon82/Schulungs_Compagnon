import { useState, useEffect, useRef } from 'react';
import { 
  Save, Type, Image, Video, Music, FileText, Move, Trash2, Plus, 
  RotateCw, Lock, Unlock, Layers, ChevronUp, ChevronDown, Copy,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  File, Download
} from 'lucide-react';

function SlideTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    backgroundColor: content?.backgroundColor || '#1a1a2e',
    backgroundImage: content?.backgroundImage || '',
    elements: content?.elements || [],
    slideAspectRatio: content?.slideAspectRatio || '16:9'
  });

  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        title: content?.title || '',
        backgroundColor: content?.backgroundColor || '#1a1a2e',
        backgroundImage: content?.backgroundImage || '',
        elements: content?.elements || [],
        slideAspectRatio: content?.slideAspectRatio || '16:9'
      });
    }
  }, [content, isEditing]);

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

  const addElement = (type) => {
    const newElement = {
      id: Date.now(),
      type,
      x: 50,
      y: 50,
      width: type === 'text' ? 300 : 200,
      height: type === 'text' ? 100 : 150,
      rotation: 0,
      locked: false,
      zIndex: formData.elements.length,
      // Type-specific properties
      ...(type === 'text' && {
        content: 'Text eingeben...',
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'left',
        color: '#ffffff',
        backgroundColor: 'transparent',
        verticalText: false,
        padding: 10
      }),
      ...(type === 'image' && {
        src: '',
        alt: '',
        objectFit: 'cover',
        borderRadius: 0
      }),
      ...(type === 'video' && {
        src: '',
        autoplay: false,
        loop: false,
        muted: true,
        controls: true
      }),
      ...(type === 'audio' && {
        src: '',
        autoplay: false,
        loop: false,
        showWaveform: true
      }),
      ...(type === 'document' && {
        src: '',
        fileName: '',
        fileType: '',
        showPreview: true
      }),
      ...(type === 'shape' && {
        shapeType: 'rectangle',
        fillColor: '#667eea',
        strokeColor: '#ffffff',
        strokeWidth: 0
      })
    };

    handleChange({ elements: [...formData.elements, newElement] });
    setSelectedElement(newElement.id);
  };

  const updateElement = (id, updates) => {
    const newElements = formData.elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    );
    handleChange({ elements: newElements });
  };

  const deleteElement = (id) => {
    handleChange({ elements: formData.elements.filter(el => el.id !== id) });
    if (selectedElement === id) setSelectedElement(null);
  };

  const duplicateElement = (id) => {
    const element = formData.elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: Date.now(),
        x: element.x + 20,
        y: element.y + 20,
        zIndex: formData.elements.length
      };
      handleChange({ elements: [...formData.elements, newElement] });
      setSelectedElement(newElement.id);
    }
  };

  const moveElementLayer = (id, direction) => {
    const elements = [...formData.elements];
    const index = elements.findIndex(el => el.id === id);
    if (index === -1) return;

    if (direction === 'up' && index < elements.length - 1) {
      [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
    } else if (direction === 'down' && index > 0) {
      [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
    }

    // Update zIndex for all elements
    elements.forEach((el, i) => el.zIndex = i);
    handleChange({ elements });
  };

  const handleMouseDown = (e, element) => {
    if (!isEditing || element.locked) return;
    
    setSelectedElement(element.id);
    setIsDragging(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 50, e.clientX - rect.left - dragOffset.x));
    const y = Math.max(0, Math.min(rect.height - 50, e.clientY - rect.top - dragOffset.y));

    updateElement(selectedElement, { x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFileUpload = async (e, elementId, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // In a real app, upload to server and get URL
    // For now, create a local object URL
    const url = URL.createObjectURL(file);
    
    if (type === 'image') {
      updateElement(elementId, { src: url, alt: file.name });
    } else if (type === 'video' || type === 'audio') {
      updateElement(elementId, { src: url });
    } else if (type === 'document') {
      updateElement(elementId, { 
        src: url, 
        fileName: file.name,
        fileType: file.type
      });
    }
  };

  const getAspectRatioStyle = () => {
    switch (formData.slideAspectRatio) {
      case '16:9': return { paddingBottom: '56.25%' };
      case '4:3': return { paddingBottom: '75%' };
      case '1:1': return { paddingBottom: '100%' };
      case '9:16': return { paddingBottom: '177.78%' };
      default: return { paddingBottom: '56.25%' };
    }
  };

  const renderElement = (element) => {
    const isSelected = selectedElement === element.id;
    const baseStyle = {
      position: 'absolute',
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotation}deg)`,
      zIndex: element.zIndex,
      cursor: element.locked ? 'not-allowed' : (isDragging && isSelected ? 'grabbing' : 'grab')
    };

    const selectionStyle = isSelected && isEditing ? {
      outline: '2px solid #8b5cf6',
      outlineOffset: '2px'
    } : {};

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...selectionStyle,
              writingMode: element.verticalText ? 'vertical-rl' : 'horizontal-tb',
              textOrientation: element.verticalText ? 'mixed' : 'initial',
              fontSize: `${element.fontSize}px`,
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight,
              fontStyle: element.fontStyle,
              textDecoration: element.textDecoration,
              textAlign: element.textAlign,
              color: element.color,
              backgroundColor: element.backgroundColor,
              padding: `${element.padding}px`,
              overflow: 'hidden',
              borderRadius: '4px'
            }}
            onMouseDown={(e) => handleMouseDown(e, element)}
            onClick={() => setSelectedElement(element.id)}
          >
            {isEditing && isSelected ? (
              <textarea
                value={element.content}
                onChange={(e) => updateElement(element.id, { content: e.target.value })}
                className="w-full h-full bg-transparent border-none outline-none resize-none"
                style={{
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 'inherit',
                  fontStyle: 'inherit',
                  textAlign: 'inherit',
                  color: 'inherit',
                  writingMode: 'inherit'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="w-full h-full whitespace-pre-wrap">{element.content}</div>
            )}
          </div>
        );

      case 'image':
        return (
          <div
            key={element.id}
            style={{ ...baseStyle, ...selectionStyle }}
            onMouseDown={(e) => handleMouseDown(e, element)}
            onClick={() => setSelectedElement(element.id)}
          >
            {element.src ? (
              <img
                src={element.src}
                alt={element.alt}
                className="w-full h-full"
                style={{ 
                  objectFit: element.objectFit,
                  borderRadius: `${element.borderRadius}px`
                }}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-white/10 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
                <Image className="text-white/50" size={32} />
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div
            key={element.id}
            style={{ ...baseStyle, ...selectionStyle }}
            onMouseDown={(e) => handleMouseDown(e, element)}
            onClick={() => setSelectedElement(element.id)}
          >
            {element.src ? (
              <video
                src={element.src}
                className="w-full h-full object-cover rounded-lg"
                autoPlay={element.autoplay}
                loop={element.loop}
                muted={element.muted}
                controls={element.controls}
              />
            ) : (
              <div className="w-full h-full bg-white/10 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
                <Video className="text-white/50" size={32} />
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div
            key={element.id}
            style={{ ...baseStyle, ...selectionStyle }}
            onMouseDown={(e) => handleMouseDown(e, element)}
            onClick={() => setSelectedElement(element.id)}
            className="bg-white/10 rounded-lg p-4 flex flex-col items-center justify-center"
          >
            <Music className="text-purple-400 mb-2" size={32} />
            {element.src ? (
              <audio
                src={element.src}
                controls
                autoPlay={element.autoplay}
                loop={element.loop}
                className="w-full"
              />
            ) : (
              <p className="text-white/50 text-sm">Audio hochladen</p>
            )}
          </div>
        );

      case 'document':
        return (
          <div
            key={element.id}
            style={{ ...baseStyle, ...selectionStyle }}
            onMouseDown={(e) => handleMouseDown(e, element)}
            onClick={() => setSelectedElement(element.id)}
            className="bg-white/10 rounded-lg p-4 flex flex-col items-center justify-center border border-white/20"
          >
            <FileText className="text-blue-400 mb-2" size={40} />
            {element.fileName ? (
              <>
                <p className="text-white text-sm font-medium truncate w-full text-center">{element.fileName}</p>
                <a 
                  href={element.src} 
                  download={element.fileName}
                  className="mt-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={12} />
                  Download
                </a>
              </>
            ) : (
              <p className="text-white/50 text-sm">Dokument hochladen</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const selectedEl = formData.elements.find(el => el.id === selectedElement);

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Slide Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Folien-Titel
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="z.B. Einführung"
          />
        </div>

        {/* Slide Settings */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Seitenverhältnis
            </label>
            <select
              value={formData.slideAspectRatio}
              onChange={(e) => handleChange({ slideAspectRatio: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="16:9">16:9 (Breitbild)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="1:1">1:1 (Quadrat)</option>
              <option value="9:16">9:16 (Hochformat)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hintergrundfarbe
            </label>
            <input
              type="color"
              value={formData.backgroundColor}
              onChange={(e) => handleChange({ backgroundColor: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hintergrundbild
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  handleChange({ backgroundImage: url });
                }
              }}
              className="w-full text-sm text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-500/20 file:text-purple-400"
            />
          </div>
        </div>

        {/* Element Toolbar */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-sm font-semibold text-white mb-3">Elemente hinzufügen</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addElement('text')}
              className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg flex items-center gap-2"
            >
              <Type size={16} />
              Text
            </button>
            <button
              onClick={() => addElement('image')}
              className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg flex items-center gap-2"
            >
              <Image size={16} />
              Bild
            </button>
            <button
              onClick={() => addElement('video')}
              className="px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg flex items-center gap-2"
            >
              <Video size={16} />
              Video
            </button>
            <button
              onClick={() => addElement('audio')}
              className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg flex items-center gap-2"
            >
              <Music size={16} />
              Audio
            </button>
            <button
              onClick={() => addElement('document')}
              className="px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg flex items-center gap-2"
            >
              <FileText size={16} />
              Dokument
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div 
          className="relative w-full overflow-hidden rounded-lg border border-white/20"
          style={getAspectRatioStyle()}
        >
          <div
            ref={canvasRef}
            className="absolute inset-0"
            style={{
              backgroundColor: formData.backgroundColor,
              backgroundImage: formData.backgroundImage ? `url(${formData.backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedElement(null)}
          >
            {formData.elements.map(renderElement)}
          </div>
        </div>

        {/* Element Properties Panel */}
        {selectedEl && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white">Element-Eigenschaften</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => updateElement(selectedEl.id, { locked: !selectedEl.locked })}
                  className={`p-2 rounded ${selectedEl.locked ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-400'}`}
                  title={selectedEl.locked ? 'Entsperren' : 'Sperren'}
                >
                  {selectedEl.locked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
                <button
                  onClick={() => moveElementLayer(selectedEl.id, 'up')}
                  className="p-2 bg-white/10 text-gray-400 rounded hover:bg-white/20"
                  title="Nach vorne"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveElementLayer(selectedEl.id, 'down')}
                  className="p-2 bg-white/10 text-gray-400 rounded hover:bg-white/20"
                  title="Nach hinten"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  onClick={() => duplicateElement(selectedEl.id)}
                  className="p-2 bg-white/10 text-gray-400 rounded hover:bg-white/20"
                  title="Duplizieren"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => deleteElement(selectedEl.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">X</label>
                <input
                  type="number"
                  value={Math.round(selectedEl.x)}
                  onChange={(e) => updateElement(selectedEl.id, { x: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedEl.y)}
                  onChange={(e) => updateElement(selectedEl.id, { y: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Breite</label>
                <input
                  type="number"
                  value={selectedEl.width}
                  onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) || 100 })}
                  className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Höhe</label>
                <input
                  type="number"
                  value={selectedEl.height}
                  onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) || 100 })}
                  className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1">Rotation (°)</label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedEl.rotation}
                onChange={(e) => updateElement(selectedEl.id, { rotation: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{selectedEl.rotation}°</span>
            </div>

            {/* Type-specific properties */}
            {selectedEl.type === 'text' && (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateElement(selectedEl.id, { fontWeight: selectedEl.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    className={`p-2 rounded ${selectedEl.fontWeight === 'bold' ? 'bg-purple-500/30 text-purple-400' : 'bg-white/10 text-gray-400'}`}
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    onClick={() => updateElement(selectedEl.id, { fontStyle: selectedEl.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`p-2 rounded ${selectedEl.fontStyle === 'italic' ? 'bg-purple-500/30 text-purple-400' : 'bg-white/10 text-gray-400'}`}
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    onClick={() => updateElement(selectedEl.id, { textDecoration: selectedEl.textDecoration === 'underline' ? 'none' : 'underline' })}
                    className={`p-2 rounded ${selectedEl.textDecoration === 'underline' ? 'bg-purple-500/30 text-purple-400' : 'bg-white/10 text-gray-400'}`}
                  >
                    <Underline size={16} />
                  </button>
                  <div className="w-px h-6 bg-white/20 mx-1" />
                  <button
                    onClick={() => updateElement(selectedEl.id, { textAlign: 'left' })}
                    className={`p-2 rounded ${selectedEl.textAlign === 'left' ? 'bg-purple-500/30 text-purple-400' : 'bg-white/10 text-gray-400'}`}
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    onClick={() => updateElement(selectedEl.id, { textAlign: 'center' })}
                    className={`p-2 rounded ${selectedEl.textAlign === 'center' ? 'bg-purple-500/30 text-purple-400' : 'bg-white/10 text-gray-400'}`}
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    onClick={() => updateElement(selectedEl.id, { textAlign: 'right' })}
                    className={`p-2 rounded ${selectedEl.textAlign === 'right' ? 'bg-purple-500/30 text-purple-400' : 'bg-white/10 text-gray-400'}`}
                  >
                    <AlignRight size={16} />
                  </button>
                  <div className="w-px h-6 bg-white/20 mx-1" />
                  <button
                    onClick={() => updateElement(selectedEl.id, { verticalText: !selectedEl.verticalText })}
                    className={`p-2 rounded ${selectedEl.verticalText ? 'bg-purple-500/30 text-purple-400' : 'bg-white/10 text-gray-400'}`}
                    title="Vertikaler Text"
                  >
                    <RotateCw size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Schriftgröße</label>
                    <input
                      type="number"
                      value={selectedEl.fontSize}
                      onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) || 16 })}
                      className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Textfarbe</label>
                    <input
                      type="color"
                      value={selectedEl.color}
                      onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Hintergrund</label>
                    <input
                      type="color"
                      value={selectedEl.backgroundColor === 'transparent' ? '#000000' : selectedEl.backgroundColor}
                      onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedEl.type === 'image' || selectedEl.type === 'video' || selectedEl.type === 'audio' || selectedEl.type === 'document') && (
              <div className="border-t border-white/10 pt-4">
                <label className="block text-xs text-gray-400 mb-2">Datei hochladen</label>
                <input
                  type="file"
                  accept={
                    selectedEl.type === 'image' ? 'image/*' :
                    selectedEl.type === 'video' ? 'video/*' :
                    selectedEl.type === 'audio' ? 'audio/*' :
                    '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'
                  }
                  onChange={(e) => handleFileUpload(e, selectedEl.id, selectedEl.type)}
                  className="w-full text-sm text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-500/20 file:text-purple-400"
                />
              </div>
            )}
          </div>
        )}

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

  // Preview/Display mode
  return (
    <div className="space-y-4">
      {formData.title && (
        <h2 className="text-2xl font-bold text-white">{formData.title}</h2>
      )}
      
      <div 
        className="relative w-full overflow-hidden rounded-lg"
        style={getAspectRatioStyle()}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: formData.backgroundColor,
            backgroundImage: formData.backgroundImage ? `url(${formData.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {formData.elements.map(renderElement)}
        </div>
      </div>
    </div>
  );
}

export default SlideTemplate;
