import React, { useEffect, useRef } from 'react';
import { BoldIcon, ItalicIcon, LinkIcon, ListIcon } from 'lucide-react';
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}
export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = 'Write your content...',
  error
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>}

      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-2 border-gray-200 border-b-0 rounded-t-xl bg-gray-50">
        <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Bold">
          <BoldIcon className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Italic">
          <ItalicIcon className="w-4 h-4" />
        </button>
        <button type="button" onClick={insertLink} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Insert Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Bullet List">
          <ListIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div ref={editorRef} contentEditable onInput={handleInput} className={`min-h-[200px] px-4 py-3 border-2 border-gray-200 rounded-b-xl focus:border-african-blue focus:ring-2 focus:ring-african-blue/20 outline-none transition-all ${error ? 'border-african-red' : ''}`} data-placeholder={placeholder} style={{
      emptyContent: placeholder
    }} />

      {error && <p className="mt-1 text-sm text-african-red">{error}</p>}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
        }
        [contenteditable] a {
          color: #10B981;
          text-decoration: underline;
        }
        [contenteditable] strong {
          font-weight: bold;
        }
        [contenteditable] em {
          font-style: italic;
        }
        [contenteditable] ul {
          list-style: disc;
          margin-left: 1.5rem;
        }
      `}</style>
    </div>;
}