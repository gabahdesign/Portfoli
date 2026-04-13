"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

type CvItem = { title?: string; place?: string; subtitle?: string; date?: string; date_start?: string; date_end?: string; description?: string; name?: string; level?: string; items?: string[] };

const SECTIONS = [
  { type: "experiencia", label: "Experiència Professional" },
  { type: "educacion", label: "Formació Acadèmica" },
  { type: "idiomas", label: "Idiomes" },
  { type: "habilidades", label: "Eines i Software" },
];

function normalizeContent(raw: any): CvItem[] {
  if (!raw) return [];
  // If array directly (seed format)
  if (Array.isArray(raw)) return raw;
  // If object with language keys {ca:[...], es:[...]}
  const localized = raw.ca || raw.es || raw.en || [];
  return Array.isArray(localized) ? localized : [];
}

export default function AdminCV() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, { id: string | null; items: CvItem[] }>>({
    experiencia: { id: null, items: [] },
    educacion: { id: null, items: [] },
    idiomas: { id: null, items: [] },
    habilidades: { id: null, items: [] },
  });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("cv_sections").select("*").order("sort_order", { ascending: true });
    if (data) {
      const newSections = { ...sections };
      for (const row of data) {
        if (newSections[row.type] !== undefined) {
          newSections[row.type] = { id: row.id, items: normalizeContent(row.content) };
        }
      }
      setSections(newSections);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (type: string) => {
    const sec = sections[type];
    setSaving(type);
    const payload = { type, content: sec.items };
    if (sec.id) {
      await supabase.from("cv_sections").update(payload).eq("id", sec.id);
    } else {
      const { data } = await supabase.from("cv_sections").insert([payload]).select().single();
      if (data) setSections(prev => ({ ...prev, [type]: { ...prev[type], id: data.id } }));
    }
    setSaving(null);
  };

  const updateSection = (type: string, items: CvItem[]) => {
    setSections(prev => ({ ...prev, [type]: { ...prev[type], items } }));
  };

  const addItem = (type: string) => {
    const blank: CvItem = type === "idiomas"
      ? { name: "", level: "" }
      : type === "habilidades"
      ? { name: "", level: "" }
      : { title: "", place: "", date_start: "", date_end: "", description: "" };
    updateSection(type, [...sections[type].items, blank]);
  };

  const removeItem = (type: string, idx: number) => {
    updateSection(type, sections[type].items.filter((_, i) => i !== idx));
  };

  const updateItem = (type: string, idx: number, field: string, value: string) => {
    const items = [...sections[type].items];
    items[idx] = { ...items[idx], [field]: value };
    updateSection(type, items);
  };

  if (loading) return <div className="p-4 md:p-8 text-[var(--color-muted)] animate-pulse">Carregant seccions del CV...</div>;

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 w-full">
      <div className="mb-8 border-b border-[var(--color-border)] pb-5">
        <h1 className="text-3xl font-black text-[var(--color-text)] tracking-tight">Constructor de CV</h1>
        <p className="text-[var(--color-muted)] text-sm mt-1">Edita i desa cada secció independentment.</p>
      </div>

      <div className="space-y-8">
        {SECTIONS.map(({ type, label }) => {
          const sec = sections[type];
          const isLang = type === "idiomas";
          const isSkill = type === "habilidades";
          const isSaving = saving === type;

          return (
            <div key={type} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
              {/* Section Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <div>
                  <h2 className="font-bold text-[var(--color-text)]">{label}</h2>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">{sec.items.length} entrades</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addItem(type)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all text-[var(--color-muted)] hover:text-[var(--color-accent)] border border-[var(--color-border)] hover:border-[var(--color-accent)]"
                  >
                    <Plus className="w-4 h-4" /> Afegir
                  </button>
                  <button
                    onClick={() => handleSave(type)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: "var(--color-accent)" }}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Desar
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-[var(--color-border)]">
                {sec.items.length === 0 && (
                  <p className="text-[var(--color-muted)] text-sm text-center py-8">
                    Cap entrada. Fes clic a "Afegir" per crear-ne una.
                  </p>
                )}
                {sec.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start px-6 py-4 hover:bg-[var(--color-surface-2)] transition-colors group">
                    <div className="flex-1 grid gap-2">
                      {(isLang || isSkill) ? (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={item.name ?? ""}
                            onChange={e => updateItem(type, idx, "name", e.target.value)}
                            placeholder="Nom (ex: English)"
                            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors"
                          />
                          <input
                            value={item.level ?? ""}
                            onChange={e => updateItem(type, idx, "level", e.target.value)}
                            placeholder="Nivell (ex: Natiu / Expert)"
                            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              value={item.title ?? ""}
                              onChange={e => updateItem(type, idx, "title", e.target.value)}
                              placeholder="Títol del càrrec / estudis"
                              className="col-span-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors"
                            />
                            <input
                              value={item.date_start ?? ""}
                              onChange={e => updateItem(type, idx, "date_start", e.target.value)}
                              placeholder="Inici (ex: 2021)"
                              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              value={item.place ?? item.subtitle ?? ""}
                              onChange={e => updateItem(type, idx, "place", e.target.value)}
                              placeholder="Empresa / Centre"
                              className="col-span-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors"
                            />
                            <input
                              value={item.date_end ?? ""}
                              onChange={e => updateItem(type, idx, "date_end", e.target.value)}
                              placeholder="Fi (o buit = Actual)"
                              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none transition-colors font-mono"
                            />
                          </div>
                          <textarea
                            value={item.description ?? ""}
                            onChange={e => updateItem(type, idx, "description", e.target.value)}
                            placeholder="Descripció breu..."
                            rows={2}
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-muted)] focus:border-[var(--color-accent)] outline-none transition-colors resize-none"
                          />
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(type, idx)}
                      className="mt-1 p-2 rounded-lg text-[var(--color-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
