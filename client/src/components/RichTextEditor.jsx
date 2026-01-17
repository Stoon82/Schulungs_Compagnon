import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Code, 
  List, ListOrdered, Quote, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, Undo, Redo,
  Palette, Highlighter
} from 'lucide-react';

function RichTextEditor({ content, onChange, placeholder = 'Start typing...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-400 underline hover:text-purple-300',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  // Update editor content when prop changes (for preview sync)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const url = window.prompt('URL eingeben:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Bild-URL eingeben:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setColor = () => {
    const color = window.prompt('Farbe eingeben (z.B. #ff0000):');
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  };

  const setHighlight = () => {
    const color = window.prompt('Highlight-Farbe eingeben (z.B. #ffff00):');
    if (color) {
      editor.chain().focus().setHighlight({ color }).run();
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-white/5 border-b border-white/10 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-white/10 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('bold')
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('italic')
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('strike')
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('code')
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Code"
          >
            <Code size={18} />
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-white/10 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-white/10 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Ordered List"
          >
            <ListOrdered size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Blockquote"
          >
            <Quote size={18} />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-white/10 pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive({ textAlign: 'left' })
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive({ textAlign: 'center' })
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive({ textAlign: 'right' })
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Align Right"
          >
            <AlignRight size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive({ textAlign: 'justify' })
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Justify"
          >
            <AlignJustify size={18} />
          </button>
        </div>

        {/* Colors & Highlights */}
        <div className="flex gap-1 border-r border-white/10 pr-2">
          <button
            onClick={setColor}
            className="p-2 rounded text-gray-400 hover:bg-white/10 transition-colors"
            title="Text Color"
          >
            <Palette size={18} />
          </button>
          <button
            onClick={setHighlight}
            className={`p-2 rounded transition-colors ${
              editor.isActive('highlight')
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Highlight"
          >
            <Highlighter size={18} />
          </button>
        </div>

        {/* Insert */}
        <div className="flex gap-1 border-r border-white/10 pr-2">
          <button
            onClick={setLink}
            className={`p-2 rounded transition-colors ${
              editor.isActive('link')
                ? 'bg-purple-500/30 text-purple-400'
                : 'text-gray-400 hover:bg-white/10'
            }`}
            title="Insert Link"
          >
            <LinkIcon size={18} />
          </button>
          <button
            onClick={addImage}
            className="p-2 rounded text-gray-400 hover:bg-white/10 transition-colors"
            title="Insert Image"
          >
            <ImageIcon size={18} />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded text-gray-400 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded text-gray-400 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={18} />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-white/5" />
    </div>
  );
}

export default RichTextEditor;
