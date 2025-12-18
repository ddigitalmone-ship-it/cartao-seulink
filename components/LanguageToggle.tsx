import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC<{ className?: string, dark?: boolean }> = ({ className = '', dark = false }) => {
  const { language, setLanguage } = useLanguage();

  const toggle = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  const baseStyles = "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border";
  const themeStyles = dark 
    ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700" 
    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm";

  return (
    <button 
      onClick={toggle}
      className={`${baseStyles} ${themeStyles} ${className}`}
      title="Mudar idioma / Switch language"
    >
      <Globe size={14} />
      <span>{language}</span>
    </button>
  );
};
