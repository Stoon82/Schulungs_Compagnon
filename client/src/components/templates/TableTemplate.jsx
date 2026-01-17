import { useState, useEffect, useRef } from 'react';
import { Table as TableIcon, Plus, Trash2, Save, GripVertical, ChevronUp, ChevronDown, Upload, Download, ArrowUp, ArrowDown } from 'lucide-react';

function TableTemplate({ content, onChange, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    headers: content?.headers || ['Spalte 1', 'Spalte 2', 'Spalte 3'],
    rows: content?.rows || [
      ['Zeile 1, Spalte 1', 'Zeile 1, Spalte 2', 'Zeile 1, Spalte 3'],
      ['Zeile 2, Spalte 1', 'Zeile 2, Spalte 2', 'Zeile 2, Spalte 3']
    ],
    sortable: content?.sortable || false,
    highlightHeader: content?.highlightHeader || true,
    alternateRows: content?.alternateRows || true
  });

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        title: content?.title || '',
        headers: content?.headers || ['Spalte 1', 'Spalte 2', 'Spalte 3'],
        rows: content?.rows || [
          ['Zeile 1, Spalte 1', 'Zeile 1, Spalte 2', 'Zeile 1, Spalte 3'],
          ['Zeile 2, Spalte 1', 'Zeile 2, Spalte 2', 'Zeile 2, Spalte 3']
        ],
        sortable: content?.sortable || false,
        highlightHeader: content?.highlightHeader || true,
        alternateRows: content?.alternateRows || true
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

  const addColumn = () => {
    const newHeaders = [...formData.headers, `Spalte ${formData.headers.length + 1}`];
    const newRows = formData.rows.map(row => [...row, '']);
    handleChange({ headers: newHeaders, rows: newRows });
  };

  const removeColumn = (index) => {
    if (formData.headers.length <= 1) {
      alert('Mindestens eine Spalte erforderlich');
      return;
    }
    const newHeaders = formData.headers.filter((_, i) => i !== index);
    const newRows = formData.rows.map(row => row.filter((_, i) => i !== index));
    handleChange({ headers: newHeaders, rows: newRows });
  };

  const updateHeader = (index, value) => {
    const newHeaders = [...formData.headers];
    newHeaders[index] = value;
    handleChange({ headers: newHeaders });
  };

  const addRow = () => {
    const newRow = formData.headers.map(() => '');
    handleChange({ rows: [...formData.rows, newRow] });
  };

  const removeRow = (index) => {
    if (formData.rows.length <= 1) {
      alert('Mindestens eine Zeile erforderlich');
      return;
    }
    handleChange({ rows: formData.rows.filter((_, i) => i !== index) });
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...formData.rows];
    newRows[rowIndex][colIndex] = value;
    handleChange({ rows: newRows });
  };

  const moveRow = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.rows.length - 1)
    ) {
      return;
    }

    const newRows = [...formData.rows];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newRows[index], newRows[targetIndex]] = [newRows[targetIndex], newRows[index]];
    handleChange({ rows: newRows });
  };

  const fileInputRef = useRef(null);

  const handleExportCSV = () => {
    // Create CSV content
    const csvRows = [];
    csvRows.push(formData.headers.join(','));
    formData.rows.forEach(row => {
      csvRows.push(row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','));
    });
    const csvContent = csvRows.join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.title || 'tabelle'}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('CSV muss mindestens eine Kopfzeile und eine Datenzeile enthalten');
          return;
        }

        // Parse CSV (simple implementation)
        const parseCSVLine = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result.map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
        };

        const headers = parseCSVLine(lines[0]);
        const rows = lines.slice(1).map(line => parseCSVLine(line));

        handleChange({ headers, rows });
        alert('CSV erfolgreich importiert!');
      } catch (error) {
        alert('Fehler beim Importieren der CSV-Datei');
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tabellentitel (optional)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="z.B. Vergleichstabelle"
          />
        </div>

        {/* Options */}
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.highlightHeader}
              onChange={(e) => handleChange({ highlightHeader: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Kopfzeile hervorheben</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.alternateRows}
              onChange={(e) => handleChange({ alternateRows: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Alternierende Zeilen</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sortable}
              onChange={(e) => handleChange({ sortable: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Sortierbar (Vorschau)</span>
          </label>
        </div>

        {/* Table Editor */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Tabelle bearbeiten</h3>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm flex items-center gap-1"
                title="CSV importieren"
              >
                <Upload size={16} />
                CSV Import
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm flex items-center gap-1"
                title="Als CSV exportieren"
              >
                <Download size={16} />
                CSV Export
              </button>
              <button
                onClick={addColumn}
                className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all text-sm flex items-center gap-1"
              >
                <Plus size={16} />
                Spalte
              </button>
              <button
                onClick={addRow}
                className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all text-sm flex items-center gap-1"
              >
                <Plus size={16} />
                Zeile
              </button>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr>
                <th className="w-16"></th>
                {formData.headers.map((header, index) => (
                  <th key={index} className="p-2">
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => updateHeader(index, e.target.value)}
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                        placeholder={`Spalte ${index + 1}`}
                      />
                      <button
                        onClick={() => removeColumn(index)}
                        className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs"
                        disabled={formData.headers.length <= 1}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="p-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveRow(rowIndex, 'up')}
                        disabled={rowIndex === 0}
                        className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-30"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveRow(rowIndex, 'down')}
                        disabled={rowIndex === formData.rows.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-30"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => removeRow(rowIndex)}
                        disabled={formData.rows.length <= 1}
                        className="p-1 text-red-400 hover:text-red-300 disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="p-2">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                        placeholder="Inhalt"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
    <div className="p-6">
      {formData.title && (
        <h2 className="text-2xl font-bold text-white mb-4">{formData.title}</h2>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={formData.highlightHeader ? 'bg-purple-500/20' : ''}>
              {formData.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-white font-semibold border border-white/10"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {formData.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={
                  formData.alternateRows && rowIndex % 2 === 1
                    ? 'bg-white/5'
                    : ''
                }
              >
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-white border border-white/10"
                  >
                    {cell || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formData.sortable && (
        <p className="text-xs text-gray-400 mt-2">
          💡 Hinweis: Sortierung ist in der Live-Ansicht verfügbar
        </p>
      )}
    </div>
  );
}

export default TableTemplate;
