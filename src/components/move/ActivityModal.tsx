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

const LocationPicker = dynamic(() => import("./LocationPicker"), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" size={32} /></div>
});

interface Category {
  id: string;
  name: string;
  group_id: string;
}

interface Group {
  id: string;
  name: string;
  icon_key: string;
  accent_color: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Mountain,
  Waves,
  Zap,
  Flag,
  Music,
  Users,
  Cpu,
  Utensils,
  Beer,
  Search
};

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  categories: Category[];
  editActivity?: any;
  initialDate?: Date;
}

export function ActivityModal({ isOpen, onClose, groups, categories, editActivity, initialDate }: ActivityModalProps) {
  const [step, setStep] = useState<'group' | 'category' | 'details'>('group');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // Subcategories management
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [newSubName, setNewSubName] = useState("");
  const [isManagingSubs, setIsManagingSubs] = useState(false);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);

  // Category management
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const router = useRouter();

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchesGroup = selectedGroup ? c.group_id === selectedGroup.id : true;
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [categories, selectedGroup, search]);
  
  const showNotification = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    time: "10:00",
    endTime: "",
    isAllDay: false,
    location: "",
    lat: "",
    lng: "",
    distance: "",
    elevation: "",
    difficulty: "",
    whatsapp_link: "",
    subcategory_id: "",
    isLocked: false,
    unlockAt: ""
  });
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Use a ref to track the previous isOpen state and editActivity ID
  const prevOpenRef = useRef(false);
  const prevEditIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only initialize/reset when:
    // 1. The modal is being opened (false -> true)
    // 2. The activity being edited has changed
    const isOpening = isOpen && !prevOpenRef.current;
    const activityChanged = editActivity?.id !== prevEditIdRef.current;

    if (isOpening || (isOpen && activityChanged)) {
      if (editActivity) {
        setStep('details');
        
        const cat = categories.find(c => c.id === editActivity.category_id);
        setSelectedCategory(cat || null);
        if (cat) {
           const grp = groups.find(g => g.id === cat.group_id);
           setSelectedGroup(grp || null);
        }

        const dateObj = new Date(editActivity.start_datetime);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        
        const HH = String(dateObj.getHours()).padStart(2, '0');
        const MM = String(dateObj.getMinutes()).padStart(2, '0');

        setFormData({
          id: editActivity.id,
          title: editActivity.title || "",
          description: editActivity.description || "",
          date: `${yyyy}-${mm}-${dd}`,
          time: `${HH}:${MM}`,
          endTime: editActivity.end_datetime ? `${String(new Date(editActivity.end_datetime).getHours()).padStart(2, '0')}:${String(new Date(editActivity.end_datetime).getMinutes()).padStart(2, '0')}` : "",
          isAllDay: editActivity.metadata?.isAllDay || false,
          location: editActivity.location || "",
          lat: editActivity.location_coords?.lat?.toString() || "",
          lng: editActivity.location_coords?.lng?.toString() || "",
          distance: editActivity.metadata?.distance?.toString() || "",
          elevation: editActivity.metadata?.elevation?.toString() || "",
          difficulty: editActivity.metadata?.difficulty || "",
          whatsapp_link: editActivity.whatsapp_link || "",
          subcategory_id: editActivity.subcategory_id || "",
          isLocked: editActivity.metadata?.isLocked || false,
          unlockAt: editActivity.metadata?.unlockAt || ""
        });
      } else {
        // Only reset to step 1 if we are opening a NEW activity creation
        setStep('group');
        setSelectedGroup(null);
        setSelectedCategory(null);
        setSearch("");
        
        const d = initialDate || new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');

        setFormData({
          id: "",
          title: "",
          description: "",
          date: `${yyyy}-${mm}-${dd}`,
          time: "10:00",
          endTime: "",
          isAllDay: false,
          location: "",
          lat: "",
          lng: "",
          distance: "",
          elevation: "",
          difficulty: "",
          whatsapp_link: "",
          subcategory_id: "",
          isLocked: false,
          unlockAt: ""
        });
      }
    }
    
    prevOpenRef.current = isOpen;
    prevEditIdRef.current = editActivity?.id || null;
  }, [isOpen, editActivity, initialDate, categories, groups]);

  // Handle category change: fetch subcategories
  useEffect(() => {
    if (selectedCategory) {
      const fetchSubs = async () => {
        setIsLoadingSubs(true);
        const res = await getSubcategories(selectedCategory.id);
        if (res.success) setSubcategories(res.data || []);
        setIsLoadingSubs(false);
      };
      fetchSubs();
    }
  }, [selectedCategory]);

  const handleAddSub = async () => {
    if (!selectedCategory || !newSubName.trim()) return;
    const res = await addSubcategory(selectedCategory.id, newSubName.trim());
    if (res.success) {
      setSubcategories([...subcategories, res.data]);
      setNewSubName("");
      showNotification("Subcategoria afegida", "success");
    } else {
      showNotification("Error: " + res.error, "error");
    }
  };

  const handleDelSub = async (id: string) => {
    if (!confirm("Eliminar aquesta subcategoria?")) return;
    const res = await deleteSubcategory(id);
    if (res.success) {
      setSubcategories(subcategories.filter(s => s.id !== id));
      if (formData.subcategory_id === id) setFormData({ ...formData, subcategory_id: "" });
      showNotification("Subcategoria eliminada", "success");
    }
  };

  const handleSaveCategory = async () => {
    if (!selectedGroup || !categoryName.trim()) return;
    setIsSavingCategory(true);
    showNotification("Guardant categoria...", "loading");
    
    const res = await saveCategory(categoryName.trim(), selectedGroup.id, editingCategoryId || undefined);
    if (res.success) {
      showNotification("Categoria guardada", "success");
      setIsAddingCategory(false);
      setEditingCategoryId(null);
      setCategoryName("");
      router.refresh();
    } else {
      showNotification("Error: " + res.error, "error");
    }
    setIsSavingCategory(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Estàs segur d'eliminar aquesta categoria?")) return;
    const res = await deleteCategory(id);
    if (res.success) {
      showNotification("Categoria eliminada", "success");
      router.refresh();
    } else {
      showNotification(res.error || "No s'ha pogut eliminar", "error");
    }
  };

  const handleSave = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    showNotification("Guardant activitat...", "loading");
    try {
      const activityData = {
        ...formData,
        distance: formData.distance ? parseFloat(formData.distance) : undefined,
        elevation: formData.elevation ? parseFloat(formData.elevation) : undefined,
        location_coords: (formData.lat && formData.lng) 
           ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) } 
           : null
      };
      
      const res = await saveActivity(activityData as any, selectedCategory.id);
      if (res.success) {
        showNotification("Activitat guardada correctament", "success");
        onClose();
      } else {
        showNotification("Error guardant: " + res.error, "error");
      }
    } catch (e) {
      showNotification("Error crític en desar", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id || !confirm("Estàs segur d'eliminar aquesta activitat permanentment?")) return;
    setIsDeleting(true);
    showNotification("Eliminant activitat...", "loading");
    try {
      const res = await deleteActivity(formData.id);
      if (res.success) {
        showNotification("Activitat eliminada", "success");
        onClose();
      } else {
        showNotification("Error eliminant: " + res.error, "error");
      }
    } catch (e) {
      showNotification("Error crític en eliminar", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGeocode = async () => {
    if (!formData.location) return;
    setIsGeocoding(true);
    showNotification("Cercant coordenades...", "loading");
    try {
       const res = await geocodeLocation(formData.location);
       if (res.success) {
          setFormData(prev => ({ ...prev, lat: res.lat, lng: res.lng }));
          showNotification("Ubicació trobada!", "success");
       } else {
          showNotification("No s'ha pogut trobar la ubicació.", "error");
       }
    } catch (e) {
       showNotification("Error de connexió geolocalitzant.", "error");
    } finally {
       setIsGeocoding(false);
    }
  };

  // Automatic Difficulty Suggestion
  useEffect(() => {
    if (selectedGroup?.name === 'Muntanya i Natura' || selectedGroup?.name === 'Esport i Benestar') {
      const dist = parseFloat(formData.distance) || 0;
      const elev = parseFloat(formData.elevation) || 0;
      
      let suggestion = "";
      if (dist === 0 && elev === 0) suggestion = "";
      else if (dist < 5 && elev < 200) suggestion = "Fàcil / Familiar";
      else if (dist < 12 && elev < 600) suggestion = "Moderat";
      else if (dist < 20 && elev < 1200) suggestion = "Exigent";
      else suggestion = "Molt Exigent / Expert";
      
      if (suggestion && formData.difficulty === "") {
        setFormData(prev => ({ ...prev, difficulty: suggestion }));
      }
    }
  }, [formData.distance, formData.elevation, selectedGroup]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-center md:justify-end items-stretch p-0">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      {/* Backdrop (Invisible but captures clicks to close) */}
      <div className="absolute inset-0 bg-black/10 transition-opacity duration-500" onClick={onClose} />
      
      {/* Drawer / Modal Content */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full md:w-[450px] lg:w-[500px] flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] md:border-y-0 md:border-r-0 md:border-l rounded-none md:rounded-l-3xl md:rounded-r-none overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 md:slide-in-from-right-full duration-300 h-full md:max-h-screen"
      >
        
        {/* Header */}
        <div className="p-8 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface-2)]/50">
           <div>
              <h3 className="text-xl font-display font-black tracking-tight flex items-center gap-2">
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
           <button 
             type="button"
             onClick={onClose} 
             className="p-2 hover:bg-[var(--color-surface-2)] rounded-full transition-colors"
           >
              <X size={20} />
           </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {/* STEP 1: SELECT GROUP */}
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
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110"
                        style={{ backgroundColor: g.accent_color }}
                      >
                         <IconComponent size={20} />
                      </div>
                      <span className="text-xs font-bold text-center leading-tight">{g.name}</span>
                   </button>
                 );
               })}
            </div>
          )}

          {/* STEP 2: SELECT CATEGORY */}
          {step === 'category' && (
            <div className="space-y-6">
               <div className="flex gap-2">
                 <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={18} />
                   <input 
                     type="text" 
                     autoFocus
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     placeholder="Cerca una categoria..." 
                     className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-[var(--color-accent)] transition-all"
                   />
                 </div>
                 <button 
                  type="button"
                  onClick={() => { setIsAddingCategory(true); setEditingCategoryId(null); setCategoryName(""); }}
                  className="p-4 bg-[var(--color-accent)] text-white rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[var(--color-accent-glow)]"
                 >
                   <Plus size={24} />
                 </button>
               </div>

               {isAddingCategory || editingCategoryId ? (
                 <div className="bg-[var(--color-surface-2)] p-6 rounded-3xl border border-[var(--color-accent)]/30 space-y-4 animate-in zoom-in-95">
                    <div className="flex justify-between items-center">
                       <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)]">
                          {editingCategoryId ? "Editar Categoria" : "Nova Categoria"}
                       </h4>
                       <button type="button" onClick={() => { setIsAddingCategory(false); setEditingCategoryId(null); }} className="text-[var(--color-muted)] hover:text-white"><X size={14} /></button>
                    </div>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={categoryName}
                         onChange={e => setCategoryName(e.target.value)}
                         placeholder="Nom de la categoria..."
                         className="flex-1 bg-black/20 border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
                       />
                       <button 
                        type="button"
                        onClick={handleSaveCategory}
                        disabled={isSavingCategory}
                        className="px-6 bg-[var(--color-accent)] text-white rounded-xl text-xs font-bold disabled:opacity-50"
                       >
                         {isSavingCategory ? <Loader2 className="animate-spin" size={16} /> : "Ok"}
                       </button>
                    </div>
                 </div>
               ) : null}

               <div className="grid grid-cols-2 gap-3">
                  {filteredCategories.map(c => (
                    <div key={c.id} className="relative group">
                      <button 
                        type="button"
                        onClick={() => { setSelectedCategory(c); setStep('details'); }}
                        className="w-full flex items-center justify-between p-4 pr-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)] transition-all"
                      >
                         <span className="text-xs font-bold truncate">{c.name}</span>
                         <ChevronRight size={14} className="absolute right-4 text-[var(--color-muted)] group-hover:text-[var(--color-accent)]" />
                      </button>
                      
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditingCategoryId(c.id); setCategoryName(c.name); }}
                          className="p-1.5 bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-accent)] rounded-lg"
                         >
                           <Info size={12} />
                         </button>
                         <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteCategory(c.id); }}
                          className="p-1.5 bg-[var(--color-surface-2)] text-red-500/50 hover:text-red-500 rounded-lg"
                         >
                           <Trash2 size={12} />
                         </button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 'details' && (
             <div className="space-y-6">
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Títol de l'activitat..." 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-transparent border-b border-[var(--color-border)] py-4 text-2xl font-display font-black outline-none focus:border-[var(--color-accent)] transition-all"
                  />

                  {/* Subcategories Selector */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-muted)]">Subcategoria (Opcional)</label>
                      <button 
                        type="button"
                        onClick={() => setIsManagingSubs(!isManagingSubs)}
                        className="text-[10px] text-[var(--color-accent)] font-bold hover:underline"
                      >
                        {isManagingSubs ? "Tancar gestió" : "Gestionar Subcategories"}
                      </button>
                    </div>

                    {isManagingSubs ? (
                      <div className="bg-[var(--color-surface-2)] p-4 rounded-2xl border border-[var(--color-accent)]/20 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Nova subcategoria..."
                            value={newSubName}
                            onChange={e => setNewSubName(e.target.value)}
                            className="flex-1 bg-black/20 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs outline-none"
                          />
                          <button type="button" onClick={handleAddSub} className="p-2 bg-[var(--color-accent)] text-white rounded-xl"><Plus size={16} /></button>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1 pr-2 no-scrollbar">
                           {subcategories.map(s => (
                             <div key={s.id} className="flex justify-between items-center p-2 bg-black/10 rounded-lg">
                               <span className="text-[10px] font-medium">{s.name}</span>
                               <button type="button" onClick={() => handleDelSub(s.id)} className="text-red-500/50 hover:text-red-500"><Trash2 size={12} /></button>
                             </div>
                           ))}
                           {subcategories.length === 0 && <p className="text-[10px] text-center text-[var(--color-muted)] italic">No hi ha subcategories.</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {subcategories.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, subcategory_id: s.id === formData.subcategory_id ? "" : s.id })}
                            className={clsx(
                              "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                              formData.subcategory_id === s.id 
                                ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-lg" 
                                : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                            )}
                          >
                            {s.name}
                          </button>
                        ))}
                        {subcategories.length === 0 && !isLoadingSubs && (
                           <p className="text-[10px] text-[var(--color-muted)] italic">No hi ha subcategories creades.</p>
                        )}
                        {isLoadingSubs && <Loader2 size={12} className="animate-spin text-[var(--color-muted)]" />}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-muted)]">WhatsApp Link (Opcional)</label>
                       <div className="relative">
                          <MessageCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#25D366]" />
                          <input 
                            type="text" 
                            placeholder="https://chat.whatsapp.com/..." 
                            value={formData.whatsapp_link}
                            onChange={e => setFormData({...formData, whatsapp_link: e.target.value})}
                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-[#25D366]" 
                          />
                       </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-muted)]">Data</label>
                       <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={14} />
                          <input 
                            type="date" 
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none" 
                          />
                       </div>
                       <label className="flex items-center gap-2 mt-2 cursor-pointer group">
                         <div className="relative flex items-center justify-center">
                           <input type="checkbox" checked={formData.isAllDay} onChange={e => setFormData({...formData, isAllDay: e.target.checked})} className="peer appearance-none w-4 h-4 border border-[var(--color-border)] rounded bg-[var(--color-surface-2)] checked:bg-[var(--color-accent)] checked:border-[var(--color-accent)] transition-all" />
                           <Check size={10} strokeWidth={4} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                         </div>
                         <span className="text-[10px] uppercase font-black tracking-widest text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors">Tot el dia</span>
                       </label>
                    </div>

                    {!formData.isAllDay && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-muted)]">Hora Inici</label>
                           <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={14} />
                              <input 
                                type="time" 
                                value={formData.time}
                                onChange={e => setFormData({...formData, time: e.target.value})}
                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none" 
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-muted)]">Hora Fi (Opcional)</label>
                           <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] opacity-50" size={14} />
                              <input 
                                type="time" 
                                value={formData.endTime}
                                onChange={e => setFormData({...formData, endTime: e.target.value})}
                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none" 
                              />
                           </div>
                        </div>
                      </div>
                    )}
                  </div>

                   <div className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-muted)] flex justify-between items-center">
                          <span>Ubicació Nominal</span>
                          {formData.location && (
                             <button type="button" onClick={handleGeocode} disabled={isGeocoding} className="text-[var(--color-accent)] hover:underline flex items-center gap-1 normal-case">
                                {isGeocoding ? <Loader2 className="animate-spin" size={10} /> : <MapPin size={10} />} Auto-detectar coordenades
                             </button>
                          )}
                       </label>
                       <div className="relative">
                           <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={14} />
                           <input 
                             type="text" 
                             placeholder="Escull una ubicació..." 
                             value={formData.location}
                             readOnly
                             onClick={() => setIsMapOpen(true)}
                             className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl pl-9 pr-12 py-2.5 text-xs outline-none focus:border-[var(--color-accent)] transition-all cursor-pointer hover:bg-[var(--color-surface-2)]/80" 
                           />
                           <button 
                             type="button" 
                             onClick={() => setIsMapOpen(true)}
                             className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded-xl transition-all hover:scale-110 active:scale-95"
                             title="Obrir mapa"
                           >
                              <Map size={16} />
                           </button>
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-muted)]">Latitud (Opcional)</label>
                          <input 
                            type="number" 
                            step="any"
                            placeholder="Ex: 41.385" 
                            value={formData.lat}
                            onChange={e => setFormData({...formData, lat: e.target.value})}
                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[var(--color-accent)] transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-muted)]">Longitud (Opcional)</label>
                          <input 
                            type="number" 
                            step="any"
                            placeholder="Ex: 2.173" 
                            value={formData.lng}
                            onChange={e => setFormData({...formData, lng: e.target.value})}
                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[var(--color-accent)] transition-all" 
                          />
                        </div>
                     </div>
                  </div>

                  {/* DYNAMIC METADATA (Sport / Nature) */}
                  {(selectedGroup?.name === 'Muntanya i Natura' || selectedGroup?.name === 'Esport i Benestar') && (
                    <div className="p-6 bg-[var(--color-accent-subtle)]/5 border border-[var(--color-accent)]/20 rounded-3xl space-y-4">
                       <div className="flex items-center gap-2 mb-2">
                          <BarChart3 size={16} className="text-[var(--color-accent)]" />
                          <span className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)]">Dades Tècniques</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <input 
                            type="text" 
                            placeholder="Distància (km)" 
                            value={formData.distance}
                            onChange={e => setFormData({...formData, distance: e.target.value})}
                            className="bg-transparent border-b border-[var(--color-border)] py-2 text-xs outline-none focus:border-[var(--color-accent)]" 
                          />
                          <input 
                            type="text" 
                            placeholder="Desnivell (+)" 
                            value={formData.elevation}
                            onChange={e => setFormData({...formData, elevation: e.target.value})}
                            className="bg-transparent border-b border-[var(--color-border)] py-2 text-xs outline-none focus:border-[var(--color-accent)]" 
                          />
                       </div>
                       <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                          <Info size={12} className="text-[var(--color-muted)]" />
                          <input 
                            type="text" 
                            placeholder="Dificultat (suggerida automàticament)" 
                            value={formData.difficulty}
                            onChange={e => setFormData({...formData, difficulty: e.target.value})}
                            className="flex-1 bg-transparent text-[10px] font-bold outline-none uppercase" 
                          />
                       </div>
                    </div>
                  )}

                  {/* Lock & Countdown */}
                  <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Lock size={16} className="text-amber-500" />
                           <span className="text-xs font-black uppercase tracking-widest text-amber-500">Bloqueig d&apos;Activitat</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input 
                             type="checkbox" 
                             checked={formData.isLocked} 
                             onChange={e => setFormData({...formData, isLocked: e.target.checked})} 
                             className="sr-only peer" 
                           />
                           <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                     </div>
                     
                     {formData.isLocked && (
                       <div className="space-y-2 animate-in slide-in-from-top-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-muted)]">Data i Hora de Desbloqueig (Opcional)</label>
                          <div className="relative">
                             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={14} />
                             <input 
                               type="datetime-local" 
                               value={formData.unlockAt}
                               onChange={e => setFormData({...formData, unlockAt: e.target.value})}
                               className="w-full bg-black/20 border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-amber-500" 
                             />
                          </div>
                          <p className="text-[9px] text-[var(--color-muted)] italic">Si s&apos;especifica, l&apos;activitat es desbloquejarà automàticament en aquesta data.</p>
                       </div>
                     )}
                  </div>

                   <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-[var(--color-muted)] flex justify-between items-center">
                          <span>Descripció del plan</span>
                          <span className="text-[9px] lowercase italic opacity-60">**negreta** · *cursiva*</span>
                       </label>
                       <textarea 
                         rows={4}
                         placeholder="Explica de què tracta el plan..." 
                         value={formData.description}
                         onChange={e => setFormData({...formData, description: e.target.value})}
                         className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-4 text-xs outline-none focus:border-[var(--color-accent)] transition-all resize-none no-scrollbar" 
                       />
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-[var(--color-surface-2)]/50 border-t border-[var(--color-border)] flex justify-between gap-4">
           {step !== 'group' && (
             <button 
              type="button"
              onClick={() => step === 'category' ? setStep('group') : setStep('category')}
              className="px-6 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all flex items-center gap-2 shadow-sm"
             >
               <ChevronLeft size={14} strokeWidth={3} /> Enrere
             </button>
           )}
           <div className="flex-1" />
           {step === 'details' && (
             <div className="flex items-center gap-3">
               {editActivity && (
                 <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || loading}
                  className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-3 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center shadow-sm"
                  title="Eliminar activitat"
                 >
                    {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                 </button>
               )}
               <button 
                type="button"
                onClick={handleSave}
                disabled={loading || isDeleting}
                className="bg-[var(--color-accent)] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[var(--color-accent-glow)] hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
               >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : (editActivity ? "Actualitzar" : "Guardar")}
               </button>
             </div>
           )}
        </div>
      </div>
      {isMapOpen && (
        <LocationPicker 
          initialLat={formData.lat ? parseFloat(formData.lat) : undefined}
          initialLng={formData.lng ? parseFloat(formData.lng) : undefined}
          onConfirm={(data) => {
            setFormData(prev => ({
              ...prev,
              location: data.address,
              lat: data.lat.toString(),
              lng: data.lng.toString()
            }));
            setIsMapOpen(false);
          }}
          onCancel={() => setIsMapOpen(false)}
        />
      )}
    </div>,
    document.body
  );
}
