"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useState, useCallback } from "react";
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, Quote, List, ListOrdered, Loader2, Upload, Film, Music, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { VideoNode, AudioNode, IframeNode } from "./TipTapExtensions";

interface TipTapEditorProps {
  content: string | object | null;
  onChange: (json: object) => void;
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Image.configure({
        HTMLAttributes: { class: 'rounded-xl border border-[var(--color-border)] shadow-lg my-6 max-w-full h-auto object-cover' },
      }),
      VideoNode,
      AudioNode,
      IframeNode,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-color-accent hover:text-color-accent-hover underline underline-offset-4 cursor-pointer' },
      }),
      Placeholder.configure({
        placeholder: "Escribe la descripción de este trabajo...",
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-color-muted before:float-left before:h-0 before:pointer-events-none',
      }),
      CharacterCount,
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => { onChange(editor.getJSON()); },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-p:text-[var(--color-text)] prose-headings:font-serif prose-headings:text-[var(--color-text)] max-w-none focus:outline-none min-h-[400px] p-6 bg-[var(--color-bg)] rounded-b-xl border border-t-0 border-[var(--color-border)]",
      },
    },
  });

  const uploadMedia = useCallback(async (file: File) => {
    if (!editor) return;
    
    // Check if it's explicitly supported
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const isAudio = file.type.startsWith("audio/");
    const isPdf = file.type === "application/pdf";
    
    if (!isImage && !isVideo && !isAudio && !isPdf) { 
      alert("Format no suportat. Usa imatges, vídeos, àudio o PDF."); 
      return; 
    }
    
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `works/${fileName}`;
      
      const { error } = await supabase.storage.from("portfolio-media").upload(filePath, file, { upsert: false });
      if (error) throw error;
      
      const { data } = supabase.storage.from("portfolio-media").getPublicUrl(filePath);
      
      if (isImage) {
        editor.chain().focus().setImage({ src: data.publicUrl }).run();
      } else if (isVideo) {
        editor.chain().focus().insertContent({ type: 'video', attrs: { src: data.publicUrl } }).run();
      } else if (isAudio) {
        editor.chain().focus().insertContent({ type: 'audio', attrs: { src: data.publicUrl } }).run();
      } else if (isPdf) {
        editor.chain().focus().insertContent({ type: 'iframe', attrs: { src: data.publicUrl, title: file.name } }).run();
      }
      
    } catch (err: unknown) {
      alert(`Error al pujar el fitxer: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMedia(file);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadMedia(file);
  }, [uploadMedia]);

  const handleLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL del enlace", previousUrl);
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-2 rounded-lg transition-all ${active ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] shadow-inner" : "text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]"}`;

  return (
    <div
      className={`flex flex-col shadow-xl rounded-xl relative transition-all duration-200 ${isDragging ? "ring-2 ring-color-accent ring-offset-2 ring-offset-color-bg" : ""}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
    >
      {/* TOOLBAR */}
      <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-xl px-4 py-3 sticky top-0 z-20 transition-colors overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}><Italic className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))}><UnderlineIcon className="w-4 h-4" /></button>
        <div className="w-px h-6 bg-[var(--color-border)] mx-2" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))}><Heading1 className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}><Heading2 className="w-4 h-4" /></button>
        <div className="w-px h-6 bg-[var(--color-border)] mx-2" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}><List className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}><ListOrdered className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}><Quote className="w-4 h-4" /></button>
        <div className="w-px h-6 bg-[var(--color-border)] mx-2" />
        <button type="button" onClick={handleLink} className={btn(editor.isActive("link"))}><LinkIcon className="w-4 h-4" /></button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`p-2 rounded-lg transition-all ${uploading ? "opacity-50 cursor-not-allowed text-[var(--color-muted)]" : "text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]"}`}
          title="Pujar mèdia (imatge, vídeo, àudio, PDF)"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="flex -space-x-1"><ImageIcon className="w-4 h-4" /><Film className="w-4 h-4 hidden sm:block" /></div>}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*,application/pdf" className="hidden" onChange={handleFileInput} />
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-color-bg/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-color-accent pointer-events-none">
          <div className="text-center">
            <Upload className="w-10 h-10 text-color-accent mx-auto mb-2" />
            <p className="text-color-accent font-bold text-lg">Suelta para subir</p>
          </div>
        </div>
      )}

      <div className="relative"><EditorContent editor={editor} /></div>

      <div className="flex justify-between items-center px-4 py-2 bg-[var(--color-surface)] border border-t-0 border-[var(--color-border)] rounded-b-xl text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">
        <span>{editor.storage.characterCount.characters()} caràcters</span>
        <span>{editor.storage.characterCount.words()} paraules</span>
      </div>
    </div>
  );
}
