import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert(t.regSuccess);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8">
           <div className="text-center mb-8">
             <h1 className="text-3xl font-bold text-slate-800 mb-2">Cartão SeuLink</h1>
             <p className="text-slate-500">
               {isLogin ? t.welcomeBack : t.createAccount}
             </p>
           </div>

           {error && (
             <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center justify-center">
               {error}
             </div>
           )}

           <form onSubmit={handleAuth} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">{t.email}</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="email" 
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                   placeholder="you@example.com"
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">{t.password}</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="password" 
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                   placeholder="••••••••"
                 />
               </div>
             </div>

             <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
             >
               {loading ? <Loader2 className="animate-spin" /> : (
                 <>
                   {isLogin ? t.signIn : t.signUp}
                   <ArrowRight size={18} />
                 </>
               )}
             </button>
           </form>

           <div className="mt-6 text-center">
             <button 
               onClick={() => setIsLogin(!isLogin)}
               className="text-sm text-indigo-600 font-medium hover:underline"
             >
               {isLogin ? t.noAccount : t.hasAccount}
             </button>
           </div>
        </div>
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
           {t.protectedBy}
        </div>
      </div>
    </div>
  );
};