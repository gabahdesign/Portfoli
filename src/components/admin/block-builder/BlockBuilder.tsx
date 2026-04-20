"use client";

import React, { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Settings2, 
  Type, 
  Image as ImageIcon, 
  FileText, 
  LayoutGrid, 
  Maximize, 
  MoveHorizontal,
  Video as VideoIcon,
  Music,
  Check,
  Upload,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { TipTapEditor } from '../TipTapEditor';
import { createClient } from '@/lib/supabase/client';
import { Toast, ToastType } from '@/components/ui/Toast';

// Types
export type BlockType = 'text' | 'media' | 'pdf' | 'gallery' | 'spacer';

export interface Block {
  id: string;
  type: BlockType;
  content: any;
  settings: {
    backgroundColor?: string;
    padding?: string;
    fullWidth?: boolean;
    hidden?: boolean;
  };
}

interface BlockBuilderProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  showNotification?: (message: string, type: ToastType) => void;
}

// SORTABLE WRAPPER
function SortableBlock({ 
  block, 
  onDelete, 
  onUpdateContent, 
  onUpdateSettings,
  isEditing,
  setEditingId,
  handleUpload
}: { 
  block: Block, 
  onDelete: () => void,
  onUpdateContent: (content: any) => void,
  onUpdateSettings: (settings: any) => void,
  isEditing: boolean,
  setEditingId: (id: string | null) => void,
  handleUpload: (file: File) => Promise<string>
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={clsx(
        "group relative border border-transparent hover:border-[var(--color-accent)]/30 rounded-2xl transition-all mb-4 bg-[var(--color-surface)]/30",
        isDragging && "opacity-50 scale-[0.98] shadow-2xl",
        isEditing && "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/20"
      )}
    >
      {/* DRAG HANDLE & ACTIONS */}
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-[var(--color-muted)] hover:text-[var(--color-accent)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-sm">
          <GripVertical size={16} />
        </div>
      </div>

      <div className="absolute -right-12 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <button 
          onClick={() => setEditingId(isEditing ? null : block.id)}
          className={clsx("p-2 border rounded-lg shadow-sm transition-all", isEditing ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "bg-[var(--color-bg)] text-[var(--color-muted)] border-[var(--color-border)] hover:text-[var(--color-accent)]")}
         >
          <Settings2 size={16} />
         </button>
         <button 
          onClick={onDelete}
          className="p-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-red-500 rounded-lg shadow-sm transition-all"
         >
          <Trash2 size={16} />
         </button>
      </div>

      {/* BLOCK CONTENT RENDERER */}
      <div 
        className="p-1 min-h-[60px]"
        style={{ 
          backgroundColor: block.settings.backgroundColor || 'transparent',
          padding: block.settings.padding || '1rem' 
        }}
      >
        <div className={clsx(block.settings.fullWidth ? "w-full" : "max-w-4xl mx-auto")}>
          {renderBlockContent(block, onUpdateContent, isEditing, handleUpload)}
        </div>
      </div>

      {/* SETTINGS PANEL (INLINE) */}
      {isEditing && (
        <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-bg)]/80 rounded-b-2xl animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex flex-wrap gap-6 items-center">
              <div>
                 <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2">Fons Secció</label>
                 <div className="flex gap-2">
                    {['transparent', 'var(--color-surface)', 'var(--color-accent-subtle)', '#000000'].map(c => (
                      <button 
                        key={c}
                        onClick={() => onUpdateSettings({ ...block.settings, backgroundColor: c })}
                        className={clsx("w-6 h-6 rounded-full border border-white/10 relative", block.settings.backgroundColor === c && "ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg)]")}
                        style={{ backgroundColor: c }}
                      >
                        {block.settings.backgroundColor === c && <Check size={10} className="absolute inset-0 m-auto text-[var(--color-accent)]" />}
                      </button>
                    ))}
                 </div>
              </div>

              <div>
                 <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2">Espaiat (Padding)</label>
                 <select 
                   value={block.settings.padding}
                   onChange={(e) => onUpdateSettings({ ...block.settings, padding: e.target.value })}
                   className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[10px] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--color-accent)]"
                 >
                    <option value="1rem">Petit</option>
                    <option value="2.5rem">Normal</option>
                    <option value="5rem">Gran</option>
                    <option value="0">Sense espai</option>
                 </select>
              </div>

              <div className="flex gap-4">
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={block.settings.fullWidth} 
                      onChange={(e) => onUpdateSettings({ ...block.settings, fullWidth: e.target.checked })}
                      className="peer appearance-none w-4 h-4 border border-[var(--color-border)] rounded checked:bg-[var(--color-accent)]" 
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] group-hover:text-white">Ample Total</span>
                 </label>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function renderBlockContent(
  block: Block, 
  onUpdate: (content: any) => void, 
  isEditing: boolean,
  handleUpload: (file: File) => Promise<string>
) {
  // Inner upload handling removed - now passed from parent

  switch (block.type) {
    case 'text':
      return (
        <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] overflow-hidden">
           <TipTapEditor 
             content={block.content.json || block.content.text || ""} 
             onChange={(json) => onUpdate({ ...block.content, json })} 
           />
        </div>
      );
    case 'media':
      return (
        <div className="group relative">
           {block.content.url ? (
             <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl bg-black/20 aspect-video flex items-center justify-center">
                {block.content.mimeType?.startsWith('video') ? (
                  <video src={block.content.url} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={block.content.url} className="w-full h-full object-cover" alt="" />
                )}
                {isEditing && (
                  <button 
                    onClick={() => onUpdate({ ...block.content, url: null })}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
             </div>
           ) : (
             <label className="flex flex-col items-center gap-4 py-12 border-2 border-dashed border-[var(--color-border)] rounded-3xl cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,video/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await handleUpload(file);
                      onUpdate({ ...block.content, url, mimeType: file.type });
                    }
                  }}
                />
                <Upload className="text-[var(--color-muted)] animate-bounce" size={32} />
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text)]">Pujar Mèdia</p>
                  <p className="text-[10px] text-[var(--color-muted)]">Imatges o Vídeos</p>
                </div>
             </label>
           )}
        </div>
      );
    case 'gallery':
      const items = block.content.items || [];
      return (
        <div className="space-y-4">
           {items.length > 0 ? (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((url: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-[var(--color-border)] relative group">
                     <img src={url} className="w-full h-full object-cover" alt="" />
                     {isEditing && (
                       <button 
                        onClick={() => onUpdate({ ...block.content, items: items.filter((_: any, i: number) => i !== idx) })}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                       >
                         <Trash2 size={12} />
                       </button>
                     )}
                  </div>
                ))}
                {isEditing && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all">
                     <Plus size={20} className="text-[var(--color-muted)]" />
                     <input 
                       type="file" 
                       multiple 
                       className="hidden" 
                       accept="image/*" 
                       onChange={async (e) => {
                         const files = Array.from(e.target.files || []);
                         const urls = await Promise.all(files.map(handleUpload));
                         onUpdate({ ...block.content, items: [...items, ...urls] });
                       }}
                     />
                  </label>
                )}
             </div>
           ) : (
              <label className="flex flex-col items-center gap-4 py-12 border-2 border-dashed border-[var(--color-border)] rounded-3xl cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all">
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  accept="image/*"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    const urls = await Promise.all(files.map(handleUpload));
                    onUpdate({ ...block.content, items: urls });
                  }}
                />
                <LayoutGrid className="text-[var(--color-muted)]" size={32} />
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text)]">Crear Galeria</p>
                  <p className="text-[10px] text-[var(--color-muted)]">Selecciona múltiples imatges</p>
                </div>
              </label>
           )}
        </div>
      );
    case 'pdf':
      return (
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:border-[var(--color-accent)]/30 transition-all">
           <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                 <FileText size={24} />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] mb-1">Document PDF</p>
                 {block.content.url ? (
                   <input 
                     type="text" 
                     value={block.content.title || ""} 
                     onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
                     placeholder="Títol del document..."
                     className="w-full bg-transparent border-none text-sm font-bold text-[var(--color-text)] focus:outline-none p-0"
                   />
                 ) : (
                   <p className="text-sm font-bold text-[var(--color-muted)]">Cap fitxer seleccionat</p>
                 )}
              </div>
              {!block.content.url ? (
                <label className="bg-[var(--color-accent)] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-[var(--color-accent-glow)]">
                   Pujar PDF
                   <input 
                     type="file" 
                     className="hidden" 
                     accept="application/pdf"
                     onChange={async (e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         const url = await handleUpload(file);
                         onUpdate({ ...block.content, url, title: file.name.replace('.pdf', '') });
                       }
                     }}
                   />
                </label>
              ) : (
                <button 
                  onClick={() => onUpdate({ ...block.content, url: null })}
                  className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
           </div>
           
           {block.content.url && isEditing && (
             <div className="mt-2 pt-4 border-t border-[var(--color-border)]/50 space-y-4">
                <div>
                   <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2">Descripció</label>
                   <textarea 
                     value={block.content.description || ""}
                     onChange={(e) => onUpdate({ ...block.content, description: e.target.value })}
                     placeholder="Descripció breu del document (opcional)..."
                     className="w-full bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-lg p-3 text-[10px] text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] resize-none"
                     rows={2}
                   />
                </div>
                <div>
                   <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2">Estil de Visualització</label>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => onUpdate({ ...block.content, display: 'card' })}
                        className={clsx("flex-1 px-3 py-2 rounded-lg text-[10px] font-bold border transition-all", (block.content.display || 'card') === 'card' ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "bg-[var(--color-bg)] text-[var(--color-muted)] border-[var(--color-border)]")}
                      >
                        Targeta Premium
                      </button>
                      <button 
                        onClick={() => onUpdate({ ...block.content, display: 'embed' })}
                        className={clsx("flex-1 px-3 py-2 rounded-lg text-[10px] font-bold border transition-all", block.content.display === 'embed' ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "bg-[var(--color-bg)] text-[var(--color-muted)] border-[var(--color-border)]")}
                      >
                        Document Net (Embed)
                      </button>
                   </div>
                </div>
             </div>
           )}
        </div>
      );
    case 'spacer':
       return isEditing ? (
         <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-muted)]">Espai Separador</span>
         </div>
       ) : <div className="h-4" />;
    default:
      return <div className="text-red-500 text-xs text-center p-4">Bloc no suportat: {block.type}</div>;
  }
}

// MAIN COMPONENT
export function BlockBuilder({ blocks, onChange }: BlockBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showNotification = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleUpload = async (file: File) => {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `blocks/${fileName}`;
    
    showNotification("Pujant fitxer...", "loading");
    
    try {
      const { error } = await supabase.storage.from("portfolio-media").upload(filePath, file);
      if (error) throw error;
      
      const { data } = supabase.storage.from("portfolio-media").getPublicUrl(filePath);
      showNotification("Fitxer pujat correctament!", "success");
      return data.publicUrl;
    } catch (err) {
      console.error(err);
      showNotification("Error en la pujada", "error");
      throw err;
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).slice(2, 9),
      type,
      content: type === 'text' ? { text: "" } : {},
      settings: {
        backgroundColor: 'transparent',
        padding: '2.5rem',
        fullWidth: false
      }
    };
    onChange([...blocks, newBlock]);
    setEditingId(newBlock.id);
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    onChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {blocks.map((block) => (
              <SortableBlock 
                key={block.id} 
                block={block} 
                onDelete={() => deleteBlock(block.id)}
                onUpdateContent={(content) => updateBlock(block.id, { content })}
                onUpdateSettings={(settings) => updateBlock(block.id, { settings })}
                isEditing={editingId === block.id}
                setEditingId={setEditingId}
                handleUpload={handleUpload}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* ADD BLOCK BUTTONS */}
      <div className="mt-12 p-8 border-2 border-dashed border-[var(--color-border)] rounded-3xl flex flex-col items-center bg-[var(--color-bg)]/30">
         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-muted)] mb-8">Afegir nou mòdul de contingut</span>
         <div className="flex flex-wrap justify-center gap-4">
            {[
              { type: 'text', label: 'Paràgraf', icon: Type },
              { type: 'media', label: 'Imatge/Vídeo', icon: ImageIcon },
              { type: 'gallery', label: 'Galeria', icon: LayoutGrid },
              { type: 'pdf', label: 'Document PDF', icon: FileText },
              { type: 'spacer', label: 'Separador', icon: MoveHorizontal },
            ].map((tool) => (
              <button
                key={tool.type}
                onClick={() => addBlock(tool.type as BlockType)}
                className="flex flex-col items-center gap-3 px-6 py-5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 rounded-2xl transition-all group w-32"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-muted)] group-hover:text-[var(--color-accent)] group-hover:scale-110 transition-all border border-[var(--color-border)]">
                   <tool.icon size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] group-hover:text-[var(--color-text)]">{tool.label}</span>
              </button>
            ))}
         </div>
      </div>
    </div>
  );
}
