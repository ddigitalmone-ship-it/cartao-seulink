import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../supabaseClient';
import { LinkItem, UserProfile } from '../types';
import { Card } from '../components/Card';
import { LanguageToggle } from '../components/LanguageToggle';
import { Plus, Trash2, Save, GripVertical, LogOut, Share2, Eye, LayoutDashboard, Copy } from 'lucide-react';

const COLORS = [
  '#000000', // Black
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#DB2777', // Pink
  '#DC2626', // Red
  '#D97706', // Amber
  '#059669', // Emerald
  '#475569', // Slate
];

const INITIAL_PROFILE: UserProfile = {
  id: '',
  username: '',
  full_name: '',
  bio: '',
  avatar_url: '',
  theme_color: '#000000',
  links: [],
};

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit'); // For mobile

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
      } else {
        // New user setup
        setProfile({
          ...INITIAL_PROFILE,
          id: user!.id,
          username: user!.email?.split('@')[0] || 'user',
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const updates = {
        ...profile,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      setMessage({ type: 'success', text: t.savedSuccess });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    const newLink: LinkItem = {
      id: crypto.randomUUID(),
      title: '',
      url: '',
      active: true,
    };
    setProfile({ ...profile, links: [...profile.links, newLink] });
  };

  const removeLink = (id: string) => {
    setProfile({ ...profile, links: profile.links.filter(l => l.id !== id) });
  };

  const updateLink = (id: string, field: keyof LinkItem, value: string | boolean) => {
    setProfile({
      ...profile,
      links: profile.links.map(l => l.id === id ? { ...l, [field]: value } : l)
    });
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/#/u/${profile.username}`;
    navigator.clipboard.writeText(url);
    alert(t.copied);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">{t.loading}</div>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar / Header */}
      <div className="w-full md:w-64 bg-white border-b md:border-r border-slate-200 flex flex-col justify-between sticky top-0 z-50 md:h-screen">
        <div className="p-4">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800 mb-6">
            <LayoutDashboard className="text-indigo-600" />
            <span>Cartão SeuLink</span>
          </div>
          
          <nav className="flex md:flex-col gap-2">
            <button 
              onClick={() => setActiveTab('edit')}
              className={`flex-1 md:flex-none flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'edit' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={18} /> {t.editor}
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`flex-1 md:flex-none md:hidden flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Eye size={18} /> {t.preview}
            </button>
            <a 
               href={`#/u/${profile.username}`}
               target="_blank"
               className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <ExternalLinkIcon /> {t.viewLive}
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-4">
           <div>
             <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-semibold text-slate-400 uppercase">{t.myLink}</span>
               <button onClick={copyToClipboard} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1">
                 <Copy size={12} /> {t.copy}
               </button>
             </div>
             <div className="bg-slate-100 p-2 rounded text-xs text-slate-500 truncate mb-2 font-mono">
               {profile.username}
             </div>
           </div>

           <LanguageToggle className="w-full justify-center" />

           <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
          >
            <LogOut size={16} /> {t.signOut}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col md:flex-row overflow-hidden relative`}>
        
        {/* Editor Column */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${activeTab === 'edit' ? 'block' : 'hidden md:block'}`}>
          <div className="max-w-2xl mx-auto space-y-8 pb-24">
            
            {/* Header Actions */}
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-bold text-slate-800">{t.profileEditor}</h2>
               <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm shadow-sm transition-all ${
                    saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Save size={18} /> {saving ? t.saving : t.saveChanges}
               </button>
            </div>

            {message && (
              <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.profileDetails}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.username}</label>
                    <input 
                      type="text" 
                      value={profile.username}
                      onChange={(e) => setProfile({...profile, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                      placeholder="username"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.displayName}</label>
                    <input 
                      type="text" 
                      value={profile.full_name}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                      placeholder="John Doe"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.bio}</label>
                <textarea 
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  placeholder={t.bioPlaceholder}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.avatarUrl}</label>
                  <input 
                    type="url" 
                    value={profile.avatar_url}
                    onChange={(e) => setProfile({...profile, avatar_url: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    placeholder="https://example.com/me.jpg"
                  />
                  <p className="text-xs text-slate-400 mt-1">{t.avatarHint}</p>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">{t.themeColor}</label>
                   <div className="flex flex-wrap gap-2">
                      {COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setProfile({...profile, theme_color: color})}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${profile.theme_color === color ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input 
                        type="color"
                        value={profile.theme_color}
                        onChange={(e) => setProfile({...profile, theme_color: e.target.value})}
                        className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                      />
                   </div>
                </div>
              </div>
            </div>

            {/* Links Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-700">{t.links}</h3>
                <button 
                  onClick={addLink}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium text-sm transition-colors"
                >
                  <Plus size={16} /> {t.addLink}
                </button>
              </div>

              <div className="space-y-3">
                {profile.links.map((link, index) => (
                  <div key={link.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-3 text-slate-400 cursor-move">
                        <GripVertical size={20} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <input 
                          type="text" 
                          value={link.title}
                          onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                          placeholder={t.titlePlaceholder}
                          className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-0 transition-colors bg-slate-50 focus:bg-white"
                        />
                        <input 
                          type="url" 
                          value={link.url}
                          onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                          placeholder={t.urlPlaceholder}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-0 transition-colors bg-slate-50 focus:bg-white text-slate-600"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => updateLink(link.id, 'active', !link.active)}
                          className={`p-2 rounded-lg transition-colors ${link.active ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}
                          title={t.toggleVisibility}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => removeLink(link.id)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          title={t.deleteLinkTitle}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {profile.links.length === 0 && (
                   <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                     <p>{t.noLinks}</p>
                     <p className="text-sm">{t.addLinkHint}</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className={`w-full md:w-[450px] bg-slate-200 border-l border-slate-300 flex items-center justify-center relative ${activeTab === 'preview' ? 'block' : 'hidden md:flex'}`}>
           <div className="absolute top-4 right-4 z-10 hidden md:block">
              <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-50">{t.livePreview}</span>
           </div>
           
           <div className="w-full h-full md:h-auto md:w-auto p-4 flex justify-center">
             <div className="w-[320px] h-[650px] bg-black rounded-[40px] border-8 border-slate-800 shadow-2xl overflow-hidden relative">
               {/* Phone Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
               
               {/* Screen Content */}
               <div className="w-full h-full bg-white overflow-y-auto no-scrollbar">
                  <Card profile={profile} preview={true} />
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

// Helper component
const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);