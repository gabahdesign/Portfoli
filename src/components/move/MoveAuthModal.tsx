"use client";

import { useState } from "react";
import { 
  X, Mail, Lock, User, Phone, MapPin, 
  ArrowRight, CheckCircle2, ShieldCheck, 
  LogIn, UserPlus, LogOut, ChevronRight
} from "lucide-react";
import { clsx } from "clsx";
import { 
  initiateMoveRegistration, 
  verifyAndCompleteSignUp, 
  loginMoveUser 
} from "@/app/actions/move_auth";
import { Toast, ToastType } from "../ui/Toast";

interface MoveAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthView = "login" | "register" | "verify";

export function MoveAuthModal({ isOpen, onClose, onSuccess }: MoveAuthModalProps) {
  const [view, setView] = useState<AuthView>("login");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // Registration Data
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    location: "",
    username: "",
    password: "",
  });

  // Verification Code
  const [verificationCode, setVerificationCode] = useState("");

  const showNotification = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showNotification("Iniciant sessió...", "loading");

    const res = await loginMoveUser({
      email: formData.email,
      password: formData.password
    });

    if (res.success) {
      showNotification("Benvingut/da de nou!", "success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } else {
      showNotification(res.error || "Error en el login", "error");
    }
    setLoading(false);
  };

  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showNotification("Preparant el registre...", "loading");

    const res = await initiateMoveRegistration(formData);

    if (res.success) {
      showNotification("S'ha enviat un codi al teu correu!", "success");
      setView("verify");
    } else {
      showNotification(res.error || "Error en el registre", "error");
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) return;

    setLoading(true);
    showNotification("Verificant codi...", "loading");

    const res = await verifyAndCompleteSignUp(formData.email, verificationCode);

    if (res.success) {
      showNotification("Compte verificat! Iniciant sessió...", "success");
      
      // Auto login after verification
      const loginRes = await loginMoveUser({
        email: formData.email,
        password: formData.password
      });

      if (loginRes.success) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } else {
      showNotification(res.error || "Codi incorrecte", "error");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      <div className="relative w-full h-full sm:h-auto sm:max-w-md bg-[var(--color-surface)] sm:border sm:border-white/10 sm:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-2xl transition-all z-20"
        >
          <X size={24} />
        </button>

        <div className="p-8 pt-12 text-center">
          <div className="w-16 h-16 bg-[var(--color-accent)]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[var(--color-accent)] border border-[var(--color-accent)]/20 shadow-[0_0_20px_rgba(132,58,234,0.2)]">
             {view === "login" ? <LogIn size={28} /> : view === "register" ? <UserPlus size={28} /> : <ShieldCheck size={28} />}
          </div>
          
          <h2 className="text-3xl font-display font-black text-white tracking-tight mb-2">
            {view === "login" ? "Hola de nou" : view === "register" ? "Crea un compte" : "Verifica el correu"}
          </h2>
          <p className="text-[var(--color-muted)] text-sm px-4">
            {view === "login" ? "Accedeix per apuntar-te a activitats i seguir el teu progrés." : 
             view === "register" ? "Uneix-te a la comunitat Move per gestionar els teus plans." : 
             "Hem enviat un codi de 6 dígits a " + formData.email}
          </p>
        </div>

        <div className="px-8 pb-10">
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                   <input 
                    type="email" 
                    required
                    placeholder="El teu correu" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[var(--color-accent)] focus:bg-white/10 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                   />
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                   <input 
                    type="password" 
                    required
                    placeholder="Contrasenya" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[var(--color-accent)] focus:bg-white/10 outline-none transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                   />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl shadow-lg shadow-[var(--color-accent-glow)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                Inicia Sessió <ChevronRight size={14} />
              </button>
              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => setView("register")}
                  className="text-xs text-[var(--color-muted)] hover:text-white transition-colors"
                >
                  No tens compte? <span className="text-[var(--color-accent)] font-bold">Registra&apos;t</span>
                </button>
              </div>
            </form>
          )}

          {view === "register" && (
            <form onSubmit={handleInitiateRegister} className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
              <div className="grid grid-cols-2 gap-4">
                 <input 
                  type="text" 
                  required
                  placeholder="Nom" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:border-[var(--color-accent)] focus:bg-white/10 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                 />
                 <input 
                  type="text" 
                  required
                  placeholder="Cognom" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:border-[var(--color-accent)] focus:bg-white/10 outline-none transition-all"
                  value={formData.surname}
                  onChange={(e) => setFormData({...formData, surname: e.target.value})}
                 />
              </div>
              <input 
                type="email" 
                required
                placeholder="Correu electrònic" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:border-[var(--color-accent)] focus:bg-white/10 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                 <input 
                  type="tel" 
                  required
                  placeholder="Telèfon" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:border-[var(--color-accent)] focus:bg-white/10 outline-none transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                 />
                 <input 
                  type="text" 
                  placeholder="Ubicació (opcional)" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:border-[var(--color-accent)] focus:bg-white/10 outline-none transition-all"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                 />
              </div>
              <div className="h-px bg-white/5 my-2" />
              <input 
                type="text" 
                required
                placeholder="Nom d'usuari (Nick)" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:border-[var(--color-accent)] focus:bg-white/10 outline-none transition-all"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
              <input 
                type="password" 
                required
                placeholder="Contrasenya segura" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:border-[var(--color-accent)] focus:bg-white/10 outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <div className="bg-white/5 rounded-xl p-3">
                 <p className="text-[10px] text-[var(--color-muted)] leading-relaxed italic">
                   La contrasenya ha de ser forta (8+ dígits, majúscules, minúscules, números i un símbol).
                 </p>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[var(--color-text)] text-[var(--color-bg)] dark:bg-white dark:text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:bg-[var(--color-accent)] hover:text-white transition-all disabled:opacity-50"
              >
                Crea el compte
              </button>
              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => setView("login")}
                  className="text-xs text-[var(--color-muted)] hover:text-white transition-colors"
                >
                  Ja tens compte? <span className="text-[var(--color-accent)] font-bold">Inicia sessió</span>
                </button>
              </div>
            </form>
          )}

          {view === "verify" && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-center">
                 <input 
                  type="text" 
                  maxLength={6}
                  required
                  placeholder="000 000" 
                  className="w-48 bg-white/5 border border-white/20 rounded-2xl py-5 text-center text-3xl font-black tracking-[0.2em] text-[var(--color-accent)] focus:border-[var(--color-accent)] focus:bg-white/10 outline-none transition-all"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                 />
              </div>
              <p className="text-[10px] text-center text-[var(--color-muted)] uppercase tracking-wider">
                Introdueix el codi de 6 dígits enviat al teu correu.
              </p>
              <button 
                type="submit" 
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl shadow-lg shadow-[var(--color-accent-glow)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                Verifica i Finalitza <CheckCircle2 size={14} />
              </button>
              <button 
                type="button"
                onClick={() => setView("register")}
                className="w-full text-xs text-[var(--color-muted)] hover:text-white transition-colors"
                disabled={loading}
              >
                Torna enrere
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
