import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';
import { Card } from '../components/Card';
import { LanguageToggle } from '../components/LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { Share2, Contact, X } from 'lucide-react';

// Props will actually come from the router rendering this
interface PublicProfileProps {
  username?: string;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({ username: propUsername }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState<string | null>(propUsername || null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // If username wasn't passed as prop, try to parse from hash
    if (!username) {
        const hashParts = window.location.hash.split('/');
        // expected: #/u/username
        if (hashParts.length >= 3 && hashParts[1] === 'u') {
            setUsername(hashParts[2]);
        }
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      fetchProfile(username);
    }
  }, [username]);

  const fetchProfile = async (uName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', uName)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError('Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const downloadVCard = () => {
    if (!profile) return;
    
    // Simple vCard 3.0 generation
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name}
NOTE:${profile.bio}
URL:${window.location.href}
${profile.avatar_url ? `PHOTO;VALUE=URI:${profile.avatar_url}` : ''}
END:VCARD`;

    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.username}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-24 w-24 bg-slate-200 rounded-full mb-4"></div>
            <div className="h-6 w-32 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">404</h2>
            <p>{error === 'Profile not found' ? t.profileNotFound : t.userNotFound}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-8 px-4 relative">
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      <Card profile={profile} />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
        <button 
          onClick={downloadVCard}
          className="flex items-center gap-2 bg-white text-slate-800 px-5 py-3 rounded-full shadow-lg font-semibold hover:bg-slate-50 transition-transform hover:scale-105 active:scale-95 border border-slate-100"
        >
          <Contact size={20} className="text-indigo-600" />
          <span>{t.saveContact}</span>
        </button>

        <button 
          onClick={() => setShowQR(true)}
          className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform hover:scale-110 active:scale-95"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl transform transition-all scale-100">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-slate-100">
                    <img src={profile.avatar_url || 'https://picsum.photos/200'} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">@{profile.username}</h3>
                <p className="text-slate-500 text-sm">{t.scanToVisit}</p>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-xl border-2 border-slate-100">
              <QRCodeSVG 
                value={window.location.href} 
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
