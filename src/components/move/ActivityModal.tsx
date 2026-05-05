"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { X, Plus, Check, ChevronRight, ChevronLeft, MapPin, Calendar, Clock, BarChart3, Info, Loader2, Mountain, Waves, Zap, Flag, Music, Users, Cpu, Utensils, Beer, Search, Trash2, Map, MessageCircle, Lock } from "lucide-react";
import { clsx } from "clsx";
import { saveActivity, deleteActivity, geocodeLocation } from "@/app/actions/activities";
import { getSubcategories, addSubcategory, deleteSubcategory } from "@/app/actions/subcategories";
import { saveCategory, deleteCategory } from "@/app/actions/move_categories";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { Toast, ToastType } from "../ui/Toast";
import { Drawer } from "vaul";
import type { MoveActivity, MoveCategory, MoveGroup } from "@/lib/types";

const LocationPicker = dynamic(() => import("./LocationPicker"), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" size={32} /></div>
});

const ICON_MAP: Record<string, React.ElementType> = {
  Mountain, Waves, Zap, Flag, Music, Users, Cpu, Utensils, Beer, Search
};

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: MoveGroup[];
  categories: MoveCategory[];
  editActivity?: MoveActivity | null;
  initialDate?: Date;
}

export function ActivityModal({ isOpen, onClose, groups, categories, editActivity, initialDate }: ActivityModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'group' | 'category' | 'details'>('group');
  const [selectedGroup, setSelectedGroup] = useState<MoveGroup | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MoveCategory | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // Details Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [difficulty, setDifficulty] = useState("Moderat");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [maxCapacity, setMaxCapacity] = useState<string>(""); 
  
  // Metadata fields
  const [distance, setDistance] = useState("");
  const [elevation, setElevation] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockAt, setUnlockAt] = useState("");
  
  // Location Coords
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Subcategories
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [isAddingSubcat, setIsAddingSubcat] = useState(false);
  const [newSubcatName, setNewSubcatName] = useState("");

  // Category Management
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const showNotification = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (editActivity) {
      setTitle(editActivity.title || "");
      setDescription(editActivity.description || "");
      setLocation(editActivity.location || "");
      
      const start = new Date(editActivity.start_datetime);
      setDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      
      if (editActivity.end_datetime) {
        const end = new Date(editActivity.end_datetime);
        setEndTime(end.toTimeString().slice(0, 5));
      } else {
        setEndTime("");
      }

      setDifficulty(editActivity.metadata?.difficulty || "Moderat");
      setWhatsappLink(editActivity.whatsapp_link || "");
      setDistance(editActivity.metadata?.distance?.toString() || "");
      setElevation(editActivity.metadata?.elevation?.toString() || "");
      setIsAllDay(editActivity.metadata?.isAllDay || false);
      setIsLocked(editActivity.metadata?.isLocked || false);
      setUnlockAt(editActivity.metadata?.unlockAt ? new Date(editActivity.metadata.unlockAt).toISOString().split('T')[0] : "");
      setCoords(editActivity.location_coords);
      setSelectedSubcategoryId(editActivity.subcategory_id);
      setMaxCapacity(editActivity.max_capacity?.toString() || "");

      const cat = categories.find(c => c.id === editActivity.category_id);
      if (cat) {
        setSelectedCategory(cat);
        const grp = groups.find(g => g.id === cat.group_id);
        if (grp) setSelectedGroup(grp);
      }
      setStep('details');
    } else {
      resetForm();
      if (initialDate) {
        setDate(initialDate.toISOString().split('T')[0]);
      }
    }
  }, [editActivity, isOpen, initialDate, categories, groups]);

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory.id);
    }
  }, [selectedCategory]);

  async function loadSubcategories(categoryId: string) {
    const data = await getSubcategories(categoryId);
    setSubcategories(data);
  }

  function resetForm() {
    setStep('group');
    setSelectedGroup(null);
    setSelectedCategory(null);
    setTitle("");
    setDescription("");
    setLocation("");
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime("10:00");
    setEndTime("12:00");
    setDifficulty("Moderat");
    setWhatsappLink("");
    setDistance("");
    setElevation("");
    setIsAllDay(false);
    setIsLocked(false);
    setUnlockAt("");
    setCoords(null);
    setSelectedSubcategoryId(null);
    setMaxCapacity("");
  }

  const filteredCategories = useMemo(() => {
    if (!selectedGroup) return [];
    return categories.filter(c => c.group_id === selectedGroup.id && c.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, selectedGroup, search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    
    setLoading(true);
    showNotification("Guardant activitat...", "loading");

    const startDateTime = new Date(`${date}T${startTime}`).toISOString();
    const endDateTime = endTime ? new Date(`${date}T${endTime}`).toISOString() : null;

    const res = await saveActivity({
      id: editActivity?.id,
      category_id: selectedCategory.id,
      title,
      description,
      location,
      location_coords: coords,
      start_datetime: startDateTime,
      end_datetime: endDateTime,
      whatsapp_link: whatsappLink,
      subcategory_id: selectedSubcategoryId,
      max_capacity: maxCapacity ? parseInt(maxCapacity) : null,
      metadata: {
        difficulty,
        distance: distance ? parseFloat(distance) : undefined,
        elevation: elevation ? parseFloat(elevation) : undefined,
        isAllDay,
        isLocked,
        unlockAt: unlockAt ? new Date(unlockAt).toISOString() : undefined
      }
    });

    if (res.success) {
      showNotification("Activitat guardada!", "success");
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1000);
    } else {
      showNotification(res.error || "Error al guardar", "error");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!editActivity || !confirm("Segur que vols eliminar aquesta activitat?")) return;
    
    setIsDeleting(true);
    showNotification("Eliminant...", "loading");
    const res = await deleteActivity(editActivity.id);
    if (res.success) {
      showNotification("Eliminada!", "success");
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1000);
    } else {
      showNotification(res.error || "Error al eliminar", "error");
    }
    setIsDeleting(false);
  };

  const handleAddCategory = async () => {
    if (!selectedGroup || !newCategoryName) return;
    const res = await saveCategory({ name: newCategoryName, group_id: selectedGroup.id });
    if (res.success) {
      setNewCategoryName("");
      setIsAddingCategory(false);
      router.refresh();
    }
  };

  const handleDeleteCategory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Eliminar categoria i TOTES les seves activitats?")) return;
    const res = await deleteCategory(id);
    if (res.success) router.refresh();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[6000]" />
        <Drawer.Content className="bg-[var(--color-surface)] flex flex-col rounded-t-[2.5rem] h-[92%] sm:h-auto sm:max-h-[90vh] sm:max-w-xl fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-1/2 sm:translate-y-1/2 sm:rounded-[2.5rem] z-[6001] outline-none border-t border-white/5 sm:border sm:border-white/10 shadow-2xl">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 my-4 sm:hidden" />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-2xl transition-all z-20 hidden sm:block"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-[var(--color-border)] flex justify-between items-center">
              <div>
                <h3 className="text-xl font-display font-black tracking-tight">
                  {step === 'group' && "Tria un Grup"}
                  {step === 'category' && `Explora ${selectedGroup?.name}`}
                  {step === 'details' && `Detalls de l'Activitat`}
                </h3>
                <p className="text-[10px] text-[var(--color-muted)] uppercase font-black tracking-widest mt-1">
                  {step === 'group' && "Pas 1 de 3"}
                  {step === 'category' && "Pas 2 de 3"}
                  {step === 'details' && "Pas 3 de 3 · " + selectedCategory?.name}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar">
              {step === 'group' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {groups.map(g => {
                    const IconComponent = ICON_MAP[g.icon_key] || Plus;
                    return (
                      <button 
                        key={g.id}
                        type="button"
                        onClick={() => { setSelectedGroup(g); setStep('category'); }}
                        className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]/5 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110" style={{ backgroundColor: g.accent_color }}>
                          <IconComponent size={24} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{g.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 'category' && selectedGroup && (
                <div className="space-y-6">
                  <button onClick={() => setStep('group')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-muted)] hover:text-white transition-colors">
                    <ChevronLeft size={16} /> Tornar als grups
                  </button>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={16} />
                    <input 
                      type="text"
                      placeholder="Cerca categoria..."
                      className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[var(--color-accent)] transition-all"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredCategories.map(c => (
                      <div key={c.id} className="group relative">
                        <button 
                          onClick={() => { setSelectedCategory(c); setStep('details'); }}
                          className="w-full flex items-center justify-between p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]/5 transition-all"
                        >
                          <span className="text-sm font-bold">{c.name}</span>
                          <ChevronRight size={16} className="text-[var(--color-muted)]" />
                        </button>
                        <button onClick={(e) => handleDeleteCategory(c.id, e)} className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-red-500/0 group-hover:text-red-500/50 hover:text-red-500 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {isAddingCategory ? (
                      <div className="flex gap-2 p-2">
                        <input 
                          autoFocus
                          className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm outline-none"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        />
                        <button onClick={handleAddCategory} className="bg-[var(--color-accent)] text-white p-2 rounded-xl"><Check size={20} /></button>
                        <button onClick={() => setIsAddingCategory(false)} className="bg-white/5 p-2 rounded-xl"><X size={20} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setIsAddingCategory(true)} className="w-full p-4 rounded-2xl border border-dashed border-[var(--color-border)] text-[var(--color-muted)] text-xs font-black uppercase tracking-widest hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all flex items-center justify-center gap-2">
                        <Plus size={16} /> Nova Categoria
                      </button>
                    )}
                  </div>
                </div>
              )}

              {step === 'details' && selectedCategory && (
                <form onSubmit={handleSave} className="space-y-8 pb-20">
                   <div className="flex items-center justify-between">
                     <button type="button" onClick={() => setStep('category')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-muted)] hover:text-white transition-colors">
                       <ChevronLeft size={16} /> Canviar categoria
                     </button>
                     {editActivity && (
                       <button type="button" onClick={handleDelete} disabled={isDeleting} className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                         <Trash2 size={18} />
                       </button>
                     )}
                   </div>

                   {/* Main Info */}
                   <div className="space-y-4">
                     <input 
                       required
                       placeholder="Títol de l'activitat"
                       className="w-full bg-transparent text-3xl font-display font-black tracking-tight placeholder:text-white/10 outline-none focus:text-[var(--color-accent)] transition-colors"
                       value={title}
                       onChange={(e) => setTitle(e.target.value)}
                     />
                     <textarea 
                       placeholder="Descripció (opcional, admet markdown)..."
                       className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-5 text-sm min-h-[120px] outline-none focus:border-[var(--color-accent)] transition-all"
                       value={description}
                       onChange={(e) => setDescription(e.target.value)}
                     />
                   </div>

                   {/* Subcategories Selector */}
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] flex items-center gap-2">
                        <Zap size={12} /> Subcategoria
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {subcategories.map(s => (
                          <div key={s.id} className="relative group">
                            <button
                              type="button"
                              onClick={() => setSelectedSubcategoryId(selectedSubcategoryId === s.id ? null : s.id)}
                              className={clsx(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                selectedSubcategoryId === s.id 
                                  ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-lg"
                                  : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-white/20"
                              )}
                            >
                              {s.name}
                            </button>
                            <button 
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Eliminar subcategoria?")) {
                                  await deleteSubcategory(s.id);
                                  loadSubcategories(selectedCategory.id);
                                }
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        {isAddingSubcat ? (
                          <div className="flex items-center gap-1">
                            <input 
                              autoFocus
                              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs outline-none"
                              value={newSubcatName}
                              onChange={(e) => setNewSubcatName(e.target.value)}
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                  await addSubcategory(selectedCategory.id, newSubcatName);
                                  setNewSubcatName("");
                                  setIsAddingSubcat(false);
                                  loadSubcategories(selectedCategory.id);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setIsAddingSubcat(true)}
                            className="px-4 py-2 rounded-xl text-xs font-bold border border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
                          >
                            + Nova
                          </button>
                        )}
                      </div>
                   </div>

                   {/* Settings Grid */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] flex items-center gap-2"><MapPin size={12} /> Ubicació</label>
                        <div className="flex gap-2">
                           <input 
                            required
                            placeholder="On es fa?"
                            className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl px-5 py-4 text-sm outline-none focus:border-[var(--color-accent)] transition-all"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                           />
                           <button 
                            type="button"
                            onClick={() => setIsMapOpen(true)}
                            className={clsx(
                              "p-4 rounded-2xl border transition-all",
                              coords ? "bg-green-500/10 border-green-500/50 text-green-500" : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted)] hover:text-white"
                            )}
                           >
                              <Map size={20} />
                           </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] flex items-center gap-2"><Calendar size={12} /> Data</label>
                        <input 
                          type="date"
                          required
                          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl px-5 py-4 text-sm outline-none focus:border-[var(--color-accent)] transition-all"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] flex items-center gap-2"><Clock size={12} /> Horari</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="time"
                            required
                            className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl px-5 py-4 text-sm outline-none"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                          <span className="text-[var(--color-muted)]">a</span>
                          <input 
                            type="time"
                            className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl px-5 py-4 text-sm outline-none"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] flex items-center gap-2"><BarChart3 size={12} /> Dificultat</label>
                        <select 
                          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl px-5 py-4 text-sm outline-none appearance-none"
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                        >
                          <option>Fàcil</option>
                          <option>Moderat</option>
                          <option>Difícil</option>
                          <option>Expert</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] flex items-center gap-2"><Users size={12} /> Aforament màxim</label>
                        <input 
                          type="number"
                          placeholder="Sense límit"
                          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl px-5 py-4 text-sm outline-none"
                          value={maxCapacity}
                          onChange={(e) => setMaxCapacity(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] flex items-center gap-2"><MessageCircle size={12} /> Grup WhatsApp</label>
                        <input 
                          placeholder="https://chat.whatsapp.com/..."
                          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl px-5 py-4 text-sm outline-none"
                          value={whatsappLink}
                          onChange={(e) => setWhatsappLink(e.target.value)}
                        />
                      </div>
                   </div>

                   {/* Stats Grid */}
                   <div className="p-6 bg-[var(--color-surface-2)] rounded-[2rem] border border-[var(--color-border)]">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-6 flex items-center gap-2">
                        <Info size={12} /> Estadístiques i Visibilitat
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--color-muted)] px-1">Distància (km)</label>
                          <input 
                            type="number" step="0.1"
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm outline-none"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--color-muted)] px-1">Desnivell (m)</label>
                          <input 
                            type="number"
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm outline-none"
                            value={elevation}
                            onChange={(e) => setElevation(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-[var(--color-border)]/50">
                        <label className="flex items-center justify-between cursor-pointer group">
                           <div className="flex items-center gap-3">
                              <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center transition-all", isAllDay ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-[var(--color-muted)]")}>
                                <Clock size={18} />
                              </div>
                              <span className="text-sm font-bold">Tot el dia</span>
                           </div>
                           <input type="checkbox" className="sr-only" checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} />
                           <div className={clsx("w-12 h-6 rounded-full transition-all relative", isAllDay ? "bg-amber-500" : "bg-white/10")}>
                              <div className={clsx("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isAllDay ? "left-7" : "left-1")} />
                           </div>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                           <div className="flex items-center gap-3">
                              <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center transition-all", isLocked ? "bg-red-500/20 text-red-500" : "bg-white/5 text-[var(--color-muted)]")}>
                                <Lock size={18} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold">Activitat Privada</span>
                                <span className="text-[9px] text-[var(--color-muted)]">Requereix codi d&apos;accés per veure detalls</span>
                              </div>
                           </div>
                           <input type="checkbox" className="sr-only" checked={isLocked} onChange={e => setIsLocked(e.target.checked)} />
                           <div className={clsx("w-12 h-6 rounded-full transition-all relative", isLocked ? "bg-red-500" : "bg-white/10")}>
                              <div className={clsx("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isLocked ? "left-7" : "left-1")} />
                           </div>
                        </label>

                        {isLocked && (
                          <div className="mt-2 pl-12 animate-in slide-in-from-top-2 duration-300">
                             <label className="text-[10px] font-bold text-[var(--color-muted)] mb-2 block">S&apos;allibera automàticament el:</label>
                             <input 
                              type="date"
                              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm outline-none"
                              value={unlockAt}
                              onChange={(e) => setUnlockAt(e.target.value)}
                             />
                          </div>
                        )}
                      </div>
                   </div>

                   <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-[2rem] shadow-xl shadow-[var(--color-accent-glow)] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                   >
                     {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                     {editActivity ? "Actualitzar Activitat" : "Publicar Activitat"}
                   </button>
                </form>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>

      {isMapOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/90" onClick={() => setIsMapOpen(false)} />
           <div className="relative w-full max-w-4xl h-[70vh] bg-[var(--color-surface)] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute top-6 right-6 z-[10001]">
                <button onClick={() => setIsMapOpen(false)} className="p-3 bg-black/50 backdrop-blur-md rounded-2xl text-white hover:bg-black transition-colors"><X size={24} /></button>
              </div>
              <LocationPicker 
                initialCoords={coords} 
                onSelect={(locationData) => {
                  setCoords(locationData.coords);
                  if (!location) setLocation(locationData.address);
                  setIsMapOpen(false);
                }} 
              />
           </div>
        </div>,
        document.body
      )}
    </Drawer.Root>
  );
}
