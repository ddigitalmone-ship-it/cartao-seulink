import React from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ExternalLink, User as UserIcon } from 'lucide-react';

interface CardProps {
  profile: UserProfile;
  preview?: boolean;
}

export const Card: React.FC<CardProps> = ({ profile, preview = false }) => {
  const { t } = useLanguage();
  const bgColor = profile.theme_color || '#000000';

  // Determine text color based on background luminance roughly
  // For a production app, use a proper contrast utility
  const isDark = ['#000000', '#1e293b', '#0f172a', '#334155'].includes(bgColor.toLowerCase());
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const buttonBg = isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10';
  const buttonText = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div 
      className={`relative w-full max-w-sm mx-auto overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 ${preview ? 'scale-90 md:scale-100' : ''}`}
      style={{ backgroundColor: bgColor, minHeight: '600px' }}
    >
      {/* Header Pattern/Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

      <div className={`relative z-10 flex flex-col items-center pt-12 px-6 pb-8 ${textColor}`}>
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg overflow-hidden mb-4 bg-slate-200">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <UserIcon size={40} />
            </div>
          )}
        </div>

        {/* Info */}
        <h1 className="text-2xl font-bold text-center mb-1">{profile.full_name || 'Your Name'}</h1>
        <p className="text-sm opacity-90 text-center mb-6 max-w-xs font-medium">
          {profile.bio || 'Add a bio to tell people who you are.'}
        </p>

        {/* Links */}
        <div className="w-full space-y-3">
          {profile.links.filter(l => l.active).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full py-3.5 px-4 rounded-xl backdrop-blur-sm transition-all transform hover:-translate-y-1 ${buttonBg} ${buttonText} flex items-center justify-between group`}
            >
              <span className="font-semibold text-sm truncate pr-2">{link.title}</span>
              <ExternalLink size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}

          {profile.links.length === 0 && (
            <div className={`text-center py-4 opacity-70 text-sm border-2 border-dashed rounded-xl ${isDark ? 'border-white/20' : 'border-black/10'}`}>
              {t.noLinksCard}
            </div>
          )}
        </div>
        
        <div className="mt-12 opacity-60 text-xs font-medium">
            {t.linkCardBrand}
        </div>
      </div>
    </div>
  );
};
