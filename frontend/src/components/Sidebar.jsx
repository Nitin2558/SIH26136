import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  LogOut, 
  LogIn, 
  UserPlus, 
  RotateCcw, 
  Sun, 
  Moon, 
  Trophy, 
  Layers, 
  Compass, 
  FileText,
  Users,
  MessageSquare,
  Wallet,
  Sliders
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, onTriggerSplash }) => {
  const { user, logout, demoLogin, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'government': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800';
      case 'startup': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
      case 'expert': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
      case 'validator': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:border-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
      case 'admin': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
      default: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
    }
  };

  const role = user?.role || 'government';
  const isStartupRole = role === 'startup';
  const isValidatorRole = role === 'validator';
  const isExpertRole = role === 'expert';

  const startupSubmenuItems = [
    { key: 'startup-my-work', label: 'My Work', icon: Layers },
    { key: 'startup-explore', label: 'Explore Challenges', icon: Rocket },
    { key: 'startup-collaborations', label: 'Collaborations', icon: Users },
    { key: 'startup-messages', label: 'Messages', icon: MessageSquare },
    { key: 'startup-profile', label: 'Company Profile', icon: ShieldCheck },
    { key: 'startup-payments', label: 'Payments', icon: Wallet }
  ];

  const validatorSubmenuItems = [
    { key: 'validator-assigned', label: 'Assigned Pilots', icon: Rocket },
    { key: 'validator-workspace', label: 'Verification Workspace', icon: ShieldCheck },
    { key: 'validator-reports', label: 'Reports', icon: FileText },
    { key: 'validator-conflict', label: 'Conflict Declaration', icon: Scale },
    { key: 'validator-messages', label: 'Messages', icon: MessageSquare },
    { key: 'validator-profile', label: 'Profile', icon: Award }
  ];

  const expertSubmenuItems = [
    { key: 'expert-assignments', label: 'My Assignments', icon: Rocket },
    { key: 'expert-workspace', label: 'Evaluation Workspace', icon: Sliders },
    { key: 'expert-cross-domain', label: 'Cross-Domain Approvals', icon: Users },
    { key: 'expert-history', label: 'Scoring History', icon: FileText },
    { key: 'expert-conflict', label: 'Conflict Declaration', icon: Scale },
    { key: 'expert-messages', label: 'Messages', icon: MessageSquare },
    { key: 'expert-profile', label: 'Profile', icon: Award }
  ];

  // Role-Scoped Navigation Items for SIH26136
  let primaryNavItems = [];

  if (role === 'government') {
    primaryNavItems = [
      { key: 'govt-dashboard', label: 'Officer Dashboard', icon: Building2 },
      { key: 'officer-money', label: 'Money', icon: Wallet },
      { key: 'submit', label: 'Post a Problem', icon: PlusCircle },
      { key: 'workspace', label: 'Trial Command Center', icon: Layers },
      { key: 'feed', label: 'Problems Feed', icon: Rocket }
    ];
  } else if (role === 'startup') {
    primaryNavItems = [
      { key: 'university', label: 'Startup Dashboard', icon: Rocket }
    ];
  } else if (role === 'expert') {
    primaryNavItems = [
      { key: 'needs-review', label: 'Expert Dashboard', icon: Award }
    ];
  } else if (role === 'validator') {
    primaryNavItems = [
      { key: 'industry', label: 'Validator Dashboard', icon: ShieldCheck }
    ];
  } else if (role === 'admin') {
    primaryNavItems = [
      { key: 'admin', label: 'Procurement Audit Admin', icon: BarChart3 },
      { key: 'govt-dashboard', label: 'Department View', icon: Building2 },
      { key: 'needs-review', label: 'Expert Panel Queue', icon: Award },
      { key: 'industry', label: 'Assessment Lab Queue', icon: ShieldCheck }
    ];
  }

  const isDark = theme === 'dark';

  return (
    <aside 
      className="hidden lg:flex w-64 h-screen sticky top-0 border-r flex-col justify-between p-4 z-40 shrink-0 select-none shadow-sm transition-colors duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
    >
      
      {/* Top Brand Logo & Vertical Navigation Menu */}
      <div className="space-y-4">
        
        {/* Samadhan Setu Brand Header */}
        <div 
          className="flex items-center gap-3 px-1 py-1 cursor-pointer group"
          onClick={() => {
            setActiveTab('landing');
            if (onTriggerSplash) onTriggerSplash();
          }}
          title="Click to replay intro animation"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 border border-blue-400/40 shrink-0 group-hover:scale-105 transition-transform">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                SAMADHAN SETU
              </span>
            </div>
            <p className="text-[10px] font-bold leading-tight text-blue-600 dark:text-blue-400">
              SIH26136 Public Procurement
            </p>
          </div>
        </div>

        {/* Action Button: Quick Post Problem */}
        {role === 'government' && (
          <div className="px-1">
            <button
              onClick={() => setActiveTab('submit')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" /> + Add a problem
            </button>
          </div>
        )}

        {/* Vertical Navigation Links */}
        <nav className="space-y-1 text-xs font-semibold">
          <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider flex items-center justify-between text-blue-700 dark:text-blue-300">
            <span>{role === 'government' ? 'OFFICER WORKSPACE' : `${role.toUpperCase()} WORKSPACE`}</span>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all border shadow-2xs cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-400 border-slate-300 dark:border-slate-700"
              >
                {isDark ? <span>🌙 Dark</span> : <span>☀️ Light</span>}
              </button>
            </div>
          </div>

          {primaryNavItems.map(item => {
            const IconComp = item.icon;
            const isDashboardActive = isStartupRole && item.key === 'university' 
              ? (activeTab === 'university' || activeTab === 'startup' || activeTab === 'startup-overview')
              : (isValidatorRole && item.key === 'industry'
                ? (activeTab === 'industry' || activeTab === 'validator' || activeTab === 'validator-overview')
                : (isExpertRole && item.key === 'needs-review'
                  ? (activeTab === 'needs-review' || activeTab === 'expert' || activeTab === 'expert-overview')
                  : activeTab === item.key));

            return (
              <div key={item.key} className="space-y-1">
                <button
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-3 text-left font-bold cursor-pointer ${
                    isDashboardActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${isDashboardActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                  <span className="text-xs font-bold tracking-tight">
                    {item.label}
                  </span>
                </button>

                {/* Indented Submenu Items for Startup Dashboard */}
                {isStartupRole && item.key === 'university' && (
                  <div className="ml-3 pl-2.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 mt-1.5 mb-2">
                    {startupSubmenuItems.map(subItem => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeTab === subItem.key;

                      return (
                        <button
                          key={subItem.key}
                          onClick={() => setActiveTab(subItem.key)}
                          className={`w-full px-3 py-2 rounded-xl transition-all flex items-center gap-2.5 text-left text-xs cursor-pointer ${
                            isSubActive
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-blue-500 dark:text-blue-400'}`} />
                          <span className="truncate tracking-tight">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Indented Submenu Items for Validator Dashboard */}
                {isValidatorRole && item.key === 'industry' && (
                  <div className="ml-3 pl-2.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 mt-1.5 mb-2">
                    {validatorSubmenuItems.map(subItem => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeTab === subItem.key;

                      return (
                        <button
                          key={subItem.key}
                          onClick={() => setActiveTab(subItem.key)}
                          className={`w-full px-3 py-2 rounded-xl transition-all flex items-center gap-2.5 text-left text-xs cursor-pointer ${
                            isSubActive
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-emerald-500 dark:text-emerald-400'}`} />
                          <span className="truncate tracking-tight">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Indented Submenu Items for Expert Dashboard */}
                {isExpertRole && item.key === 'needs-review' && (
                  <div className="ml-3 pl-2.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 mt-1.5 mb-2">
                    {expertSubmenuItems.map(subItem => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeTab === subItem.key;

                      return (
                        <button
                          key={subItem.key}
                          onClick={() => setActiveTab(subItem.key)}
                          className={`w-full px-3 py-2 rounded-xl transition-all flex items-center gap-2.5 text-left text-xs cursor-pointer ${
                            isSubActive
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-amber-500 dark:text-amber-400'}`} />
                          <span className="truncate tracking-tight">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

      </div>

      {/* Bottom User Profile / Auth Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 relative">
        
        {isAuthenticated ? (
          <div>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl transition-all shadow-2xs cursor-pointer border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold truncate text-slate-900 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {user.role === 'validator' 
                      ? (user.organization || 'Independent Lab, IIT Delhi') 
                      : user.role === 'expert'
                        ? (user.organization || 'Urban Systems, IIT Bombay')
                        : `${user.role} Persona`}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 z-50 animate-in fade-in duration-150 space-y-1">
                
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{user.name}</div>
                  <div className="text-[11px] truncate text-slate-500 dark:text-slate-400">{user.email || user.organization}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>

                {user?.isDemo && (
                  <>
                    <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch SIH26136 Persona
                    </div>
                    {[
                      { key: 'government', label: 'Department Officer' },
                      { key: 'startup', label: 'Startup (ERAER)' },
                      { key: 'expert', label: 'Expert Panel (Dr. Meera Iyer)' },
                      { key: 'validator', label: 'Independent Validator (Prof. Anil Kapoor)' },
                      { key: 'admin', label: 'Procurement Admin' }
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
                        className={`w-full px-4 py-1.5 text-left text-xs capitalize flex items-center justify-between font-bold cursor-pointer ${
                          user.role === rKey ? 'bg-blue-50 dark:bg-blue-950 text-blue-600' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{label}</span>
                        {user.role === rKey && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
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
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('login')}
              className="w-full py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> Register / Sign Up
            </button>
          </div>
        )}

      </div>

    </aside>
  );
};
