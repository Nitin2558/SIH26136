import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/translation';
import { 
  Building2, 
  Rocket, 
  Award, 
  ShieldCheck, 
  Scale, 
  Sparkles, 
  ChevronDown, 
  PlusCircle,
  BarChart3,
  Menu,
  X,
  LogOut,
  LogIn,
  UserPlus,
  Globe,
  Trophy,
  Sun,
  Moon,
  Layers,
  Compass,
  Users,
  MessageSquare,
  Wallet
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, currentLang, onChangeLang, onOpenProfileModal }) => {
  const { user, logout, demoLogin, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, changeLanguage } = useLanguage();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'government': return 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      case 'startup': return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'expert': return 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'validator': return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'admin': return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      default: return 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0 shrink" onClick={() => setActiveTab('landing')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 p-0.5 shadow-sm shadow-blue-600/20 flex items-center justify-center text-white shrink-0">
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white truncate">
                  SAMADHAN SETU
                </span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                  SIH26136
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Startup Public Procurement Mechanism
              </p>
            </div>
          </div>

          {/* Controls: Live Map + Multilingual + Role Badge */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

            {/* Live Pilot Map Explorer (Hidden for Startups, Validators & Experts to avoid clutter) */}
            {user?.role !== 'startup' && user?.role !== 'validator' && user?.role !== 'expert' && (
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Open Interactive Geographic Testbed Explorer"
              >
                <Compass className={`w-3.5 h-3.5 ${activeTab === 'map' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                <span className="hidden sm:inline">Testbed Map</span>
              </button>
            )}

            {/* Language Selector Dropdown */}
            <div translate="no" className="notranslate flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold max-w-[110px] sm:max-w-none">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <select
                value={lang || currentLang || 'en'}
                onChange={e => {
                  const newL = e.target.value;
                  changeLanguage(newL);
                  if (onChangeLang) onChangeLang(newL);
                }}
                translate="no"
                className="notranslate bg-transparent border-none text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer pr-0.5 w-full truncate"
              >
                {SUPPORTED_LANGUAGES.map(lItem => (
                  <option key={lItem.code} value={lItem.code} translate="no" className="notranslate bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {lItem.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {user && (
              <span className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${getRoleBadgeColor(user.role)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {user.role === 'expert' ? 'EXPERT PANEL PERSONA' : `${user.role} PERSONA`}
              </span>
            )}

            {/* User Auth Profile & Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{user.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user.role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in duration-150 space-y-1">
                    
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{user.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email || user.departmentName || user.companyName}
                      </div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getRoleBadgeColor(user.role)}`}>
                        {user.role} View
                      </span>
                    </div>

                    {user?.isDemo && (
                      <>
                        <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Switch SIH26136 Demo Persona
                        </div>
                        {[
                          { key: 'government', label: 'Department Officer (Dr. Sunita Verma)' },
                          { key: 'startup', label: 'Startup (ERAER / CleanRoute)' },
                          { key: 'expert', label: 'Expert Panel (Dr. Meera Iyer - IIT Bombay)' },
                          { key: 'validator', label: 'Independent Validator (Prof. Anil Kapoor - IIT Delhi)' },
                          { key: 'admin', label: 'Procurement Oversight Admin' }
                        ].map(({ key: rKey, label }) => (
                          <button
                            key={rKey}
                            onClick={async () => {
                              await demoLogin(rKey);
                              setProfileDropdownOpen(false);
                              if (rKey === 'government') setActiveTab('govt-dashboard');
                              else if (rKey === 'startup') setActiveTab('university');
                              else if (rKey === 'expert') setActiveTab('needs-review');
                              else if (rKey === 'validator') setActiveTab('industry');
                              else if (rKey === 'admin') setActiveTab('admin');
                            }}
                            className={`w-full px-4 py-1.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer ${
                              user.role === rKey ? 'font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50' : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span className="truncate">{label}</span>
                            {user.role === rKey && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>}
                          </button>
                        ))}
                      </>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                          setActiveTab('login');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register / Sign Up
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Full Navigation Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 py-4 px-4 space-y-4 bg-white dark:bg-slate-900 animate-in slide-in-from-top duration-200 shadow-2xl max-h-[85vh] overflow-y-auto">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            {user ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase ${getRoleBadgeColor(user.role)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {user.role} Persona
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-500">Public Visitor</span>
            )}

            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-amber-400 border-slate-300 dark:border-slate-700"
            >
              {isDark ? <span>🌙 Dark</span> : <span>☀️ Light</span>}
            </button>
          </div>

          {user?.role === 'government' && (
            <button
              onClick={() => { setActiveTab('submit'); setMobileMenuOpen(false); }}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" /> Post Outcome Challenge
            </button>
          )}

          <div className="space-y-1 text-xs font-semibold">
            {user?.role === 'startup' ? (
              <>
                <button
                  onClick={() => { setActiveTab('university'); setMobileMenuOpen(false); }}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left flex items-center gap-3 font-bold ${activeTab === 'university' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Rocket className="w-4 h-4 shrink-0" />
                  <span>Startup Dashboard</span>
                </button>
                <div className="ml-3 pl-2.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1">
                  {[
                    { key: 'startup-my-work', label: 'My Work', icon: Layers },
                    { key: 'startup-explore', label: 'Explore Challenges', icon: Rocket },
                    { key: 'startup-collaborations', label: 'Collaborations', icon: Users },
                    { key: 'startup-messages', label: 'Messages', icon: MessageSquare },
                    { key: 'startup-profile', label: 'Company Profile', icon: ShieldCheck },
                    { key: 'startup-payments', label: 'Payments', icon: Wallet }
                  ].map(sItem => {
                    const SIcon = sItem.icon;
                    const isSActive = activeTab === sItem.key;
                    return (
                      <button
                        key={sItem.key}
                        onClick={() => { setActiveTab(sItem.key); setMobileMenuOpen(false); }}
                        className={`w-full py-2 px-3 rounded-xl text-left flex items-center gap-2.5 font-semibold text-xs ${isSActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        <SIcon className={`w-3.5 h-3.5 shrink-0 ${isSActive ? 'text-white' : 'text-blue-500'}`} />
                        <span>{sItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveTab('feed'); setMobileMenuOpen(false); }}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left flex items-center gap-3 font-bold ${activeTab === 'feed' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Rocket className="w-4 h-4 shrink-0" />
                  <span>Outcome Challenges Feed</span>
                </button>

                <button
                  onClick={() => { setActiveTab('impact'); setMobileMenuOpen(false); }}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left flex items-center gap-3 font-bold ${activeTab === 'impact' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Trophy className="w-4 h-4 shrink-0" />
                  <span>Procurement Impact Analytics</span>
                </button>
              </>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
