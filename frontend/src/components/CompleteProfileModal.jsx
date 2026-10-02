import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Building2, 
  Rocket, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi NCR', 'Jammu and Kashmir', 'Ladakh'
];

export const CompleteProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [locationState, setLocationState] = useState(user?.locationState || 'Maharashtra');
  const [role, setRole] = useState(user?.role || 'government');
  const [departmentName, setDepartmentName] = useState(user?.departmentName || '');
  const [companyName, setCompanyName] = useState(user?.companyName || user?.orgName || '');
  const [dpiitNumber, setDpiitNumber] = useState(user?.dpiitNumber || '');
  const [affiliation, setAffiliation] = useState(user?.affiliation || user?.universityName || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !user) return null;

  // Calculate profile completion percentage (Instagram style)
  let score = 30; // Phone verified gives 30%
  if (name.trim()) score += 25;
  if (email.trim()) score += 25;
  if (locationState) score += 20;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      await updateProfile({
        name: name.trim() || user.name,
        email: email.trim(),
        locationState,
        role,
        departmentName: departmentName.trim(),
        companyName: companyName.trim(),
        orgName: companyName.trim(),
        dpiitNumber: dpiitNumber.trim(),
        affiliation: affiliation.trim(),
        universityName: affiliation.trim(),
        institution: institution.trim()
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] overflow-y-auto space-y-5 text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Complete Your Profile</h3>
              <p className="text-[11px] text-slate-500">Optional details to personalize your procurement platform experience</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Instagram Style) */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Profile Strength</span>
            </span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{score}% Complete</span>
          </div>

          <div className="w-full h-2 rounded-full bg-blue-100 dark:bg-blue-900/60 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${score}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Mobile Number Verified: <strong className="font-mono">+91 {user.phone || 'Verified'}</strong></span>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}
        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile saved successfully!</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address (For Status Updates & Alerts)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Location State */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              State / Union Territory
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={locationState}
                onChange={e => setLocationState(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600 transition-all"
              >
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Persona Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Account Type / Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'government', label: 'Department Officer', icon: Building2 },
                { key: 'startup', label: 'Startup', icon: Rocket },
                { key: 'expert', label: 'Expert Panel', icon: Award },
                { key: 'validator', label: 'Independent Validator', icon: ShieldCheck }
              ].map(r => {
                const Icon = r.icon;
                const isSelected = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition-all text-[11px] ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Role Inputs */}
          {role === 'government' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department / Municipal Body
              </label>
              <input 
                type="text"
                value={departmentName}
                onChange={e => setDepartmentName(e.target.value)}
                placeholder="e.g. Urban Development Dept, Municipal Corp of Greater Mumbai"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          )}

          {role === 'startup' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Startup / Entity Name
                </label>
                <input 
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. CleanRoute Technologies Pvt Ltd"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  DPIIT Recognition Number
                </label>
                <input 
                  type="text"
                  value={dpiitNumber}
                  onChange={e => setDpiitNumber(e.target.value)}
                  placeholder="e.g. DIPP-84920"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>
            </div>
          )}

          {role === 'expert' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic Institution / Research Center
              </label>
              <input 
                type="text"
                value={affiliation}
                onChange={e => setAffiliation(e.target.value)}
                placeholder="e.g. IIT Bombay Innovation Cell, COEP Tech, CSIR"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          )}

          {role === 'validator' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Empaneled Testing Lab / Audit Body
              </label>
              <input 
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="e.g. IIT Delhi Clean Mobility Lab, ARAI Pune, NABL Testing Lab"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5"
            >
              {isSaving ? 'Saving...' : 'Save Profile'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>

        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
          💡 You have full access to submit challenges, apply, and validate pilots whether your profile is complete or not.
        </p>

      </div>
    </div>
  );
};
