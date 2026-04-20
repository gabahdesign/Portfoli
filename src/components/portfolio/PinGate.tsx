"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

interface PinGateProps {
  onUnlock: (pin: string) => Promise<boolean>;
  title?: string;
  description?: string;
}

export function PinGate({ 
  onUnlock, 
  title = "Acceso Protegido", 
  description = "Este contenido es confidencial y requiere un PIN de acceso proporcionado directamente." 
}: PinGateProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinStr = pin.join("");
    if (pinStr.length < 4) {
      setError(true);
      return;
    }

    setLoading(true);
    const success = await onUnlock(pinStr);
    if (!success) {
      setError(true);
      setPin(["", "", "", ""]);
      document.getElementById("pin-0")?.focus();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full flex items-center justify-center mb-8 shadow-2xl relative transition-colors">
        <div className="absolute inset-0 border border-[var(--color-accent)] rounded-full animate-ping opacity-20"></div>
        <Lock className="w-8 h-8 text-[var(--color-accent)]" />
      </div>
      
      <h2 className="text-4xl font-display font-black text-[var(--color-text)] mb-4 text-center tracking-tight">{title}</h2>
      <p className="text-[var(--color-muted)] text-center max-w-md leading-relaxed mb-10 font-medium">
        {description}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8">
        <div className="flex gap-4" dir="ltr">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-16 text-center text-2xl font-mono font-bold text-[var(--color-text)] bg-[var(--color-surface)] border-2 rounded-2xl focus:outline-none transition-all ${
                error 
                  ? 'border-red-500/50 focus:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-shake' 
                  : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-glow)]'
              }`}
              autoFocus={index === 0}
            />
          ))}
        </div>
        
        {error && (
          <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-2">
            El PIN introducido es incorrecto. Inténtalo de nuevo.
          </p>
        )}

        <button 
          type="submit" 
          disabled={loading || pin.join("").length < 4}
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold px-10 py-4 rounded-xl transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--color-accent-glow)] whitespace-nowrap"
        >
          {loading ? "Verificant..." : "Desbloquejar Contingut"}
        </button>
      </form>
    </div>
  );
}
