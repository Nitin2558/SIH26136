import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Rocket, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Phone,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const SignupPage = ({ setActiveTab, defaultRole = 'government' }) => {
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(defaultRole); // 'government' | 'startup' | 'expert' | 'validator'

  React.useEffect(() => {
    if (defaultRole) {
      setRole(defaultRole);
    }
  }, [defaultRole]);
  
  // Conditional Role Metadata
  const [departmentName, setDepartmentName] = useState('');
  const [designation, setDesignation] = useState('');
  const [startupName, setStartupName] = useState('');
  const [dpiitNumber, setDpiitNumber] = useState('');
  const [sector, setSector] = useState('Smart Cities & CleanTech');
  const [selectedDomains, setSelectedDomains] = useState(['Smart Cities & CleanTech']);
  const [customDomain, setCustomDomain] = useState('');
  const [teamSize, setTeamSize] = useState('12');
  const [workforceSkills, setWorkforceSkills] = useState('Geospatial Fleet AI, Embedded LoRaWAN, Full-Stack GIS');
  const [trlLevel, setTrlLevel] = useState(7);
  const [startupDescription, setStartupDescription] = useState('Scalable technology prototype for outcome-based government sandbox procurement.');
  const [orgName, setOrgName] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = [
    { 
      key: 'government', 
      label: 'Department Officer', 
      desc: 'Posts challenges and manages pilots.', 
      icon: Building2 
    },
    { 
      key: 'startup', 
      label: 'Startup', 
      desc: 'Discovers challenges, applies, and submits pilot evidence.', 
      icon: Rocket 
    },
    { 
      key: 'expert', 
      label: 'Expert Panel', 
      desc: 'Scores startup applications.', 
      icon: Award 
    },
    { 
      key: 'validator', 
      label: 'Independent Validator', 
      desc: 'Verifies pilot evidence and outcomes.', 
      icon: ShieldCheck 
    }
  ];

  const handleRoleRedirect = (userRole) => {
    switch (userRole) {
      case 'government':
        setActiveTab('govt-dashboard');
        break;
      case 'startup':
        setActiveTab('university'); // Startup dashboard
        break;
      case 'expert':
        setActiveTab('needs-review');
        break;
      case 'validator':
        setActiveTab('industry'); // Validator workspace
        break;
      case 'admin':
        setActiveTab('admin');
        break;
      default:
        setActiveTab('feed');
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length !== 10 || !/^[6-9]/.test(cleanDigits)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Role-specific validation
    if (role === 'government' && !departmentName.trim()) {
      setError('Government department name is required.');
      return;
    }
    if (role === 'startup') {
      if (!startupName.trim() || !dpiitNumber.trim()) {
        setError('Startup entity name and DPIIT recognition number are required.');
        return;
      }
      if (!selectedDomains || selectedDomains.length === 0) {
        setError('Operating technology domain is required. Please select at least one registered domain.');
        return;
      }
    }
    if ((role === 'expert' || role === 'validator') && !orgName.trim()) {
      setError('Institution / Organization / Testing Lab name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newUser = await signup({
        name: name.trim(),
        email: email.trim(),
        phone: cleanDigits,
        password,
        role,
        departmentName: role === 'government' ? departmentName.trim() : '',
        designation: designation.trim(),
        startupName: role === 'startup' ? startupName.trim() : '',
        dpiitNumber: role === 'startup' ? dpiitNumber.trim() : '',
        sector: role === 'startup' ? (selectedDomains[0] || sector) : '',
        domains: role === 'startup' ? selectedDomains : [],
        teamSize: role === 'startup' ? (Number(teamSize) || 8) : null,
        workforceSkills: role === 'startup' ? workforceSkills : '',
        trlLevel: role === 'startup' ? (Number(trlLevel) || 7) : null,
        description: role === 'startup' ? startupDescription : '',
        orgName: (role === 'expert' || role === 'validator') ? orgName.trim() : '',
        locationState: 'Maharashtra'
      });

      handleRoleRedirect(newUser.role);
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be registered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-md shadow-blue-600/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create an Account</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Join Maharashtra’s Startup Public Procurement Platform (SIH26136)</p>
      </div>

      {/* Main Signup Form */}
      <div className="civic-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 bg-white dark:bg-slate-900">
        
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Role Selector Segmented Cards */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Select Your Platform Role *
              </label>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold font-mono">
                4 Specialized Roles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roleOptions.map(opt => {
                const IconComp = opt.icon;
                const isSelected = role === opt.key;

                return (
                  <div
                    key={opt.key}
                    onClick={() => setRole(opt.key)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      isSelected 
                        ? 'bg-blue-50/90 dark:bg-blue-950/80 border-2 border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/20 dark:ring-blue-500/30 shadow-sm' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="font-bold flex items-center justify-between gap-2">
                        <span className={`text-xs ${
                          isSelected 
                            ? 'text-blue-950 dark:text-white font-black' 
                            : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {opt.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                      </div>
                      <p className={`text-[11px] leading-relaxed ${
                        isSelected 
                          ? 'text-blue-900 dark:text-blue-200 font-medium' 
                          : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={
                    role === 'government' ? 'e.g. Dr. Sunita Verma' :
                    role === 'startup' ? 'e.g. Priya Patel' :
                    role === 'expert' ? 'e.g. Prof. Arvind Nambiar' :
                    'e.g. Dr. Ritu Sengupta'
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={
                    role === 'government' ? 'sunita.verma@gov.in' :
                    role === 'startup' ? 'priya@cleanroute.tech' :
                    role === 'expert' ? 'arvind.nambiar@iitb.ac.in' :
                    'ritu.sengupta@iitd.ac.in'
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mobile Number (for Fast OTP Sign In) *
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                  +91
                </span>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-r-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all font-mono"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Used to log in securely via 2Factor OTP SMS.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password (Min 6 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Fallback password for non-OTP login.
              </p>
            </div>
          </div>

          {/* Conditional Role Metadata Input Fields */}

          {/* 1. Department Officer Fields */}
          {role === 'government' && (
            <div className="p-4.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border-2 border-sky-300 dark:border-sky-700 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-700 dark:text-sky-300" />
                <span className="text-xs font-black text-sky-950 dark:text-sky-200 uppercase tracking-wider">
                  Department Officer Credentials
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-sky-950 dark:text-sky-200 mb-1">
                    Government Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={departmentName}
                    onChange={e => setDepartmentName(e.target.value)}
                    placeholder="e.g. Department of Urban Infrastructure & Smart Cities Mission"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-sky-600 dark:focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-sky-950 dark:text-sky-200 mb-1">
                    Official Designation / Sanction Authority
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    placeholder="e.g. Director of Urban Modernization / Nodal Officer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-sky-600 dark:focus:border-sky-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Startup Fields */}
          {role === 'startup' && (
            <div className="p-4.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border-2 border-purple-300 dark:border-purple-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                  <span className="text-xs font-black text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                    DPIIT Startup Profile & Domains
                  </span>
                </div>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/80 px-2 py-0.5 rounded-full border border-purple-300 dark:border-purple-700">
                  Domain Selection Required *
                </span>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 dark:text-purple-200 mb-1">
                      Startup Entity / Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={startupName}
                      onChange={e => setStartupName(e.target.value)}
                      placeholder="e.g. CleanRoute Technologies Pvt Ltd"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-purple-600 dark:focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 dark:text-purple-200 mb-1">
                      DPIIT Recognition Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={dpiitNumber}
                      onChange={e => setDpiitNumber(e.target.value)}
                      placeholder="e.g. DIPP-84920"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none focus:border-purple-600 dark:focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Prominent & Required Domain Selection */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-900 dark:text-white">
                      Registered Operating Domains / Sectors *
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {selectedDomains.length} selected (Used for challenge matching)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Select all sectors your startup operates in. Challenges outside your registered domains will require cross-domain collaboration.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Smart Cities & CleanTech',
                      'Water Infrastructure',
                      'Mobility & Public Safety',
                      'Renewable Energy & Healthcare',
                      'Public Service Innovation & Governance'
                    ].map(dom => {
                      const isSelected = selectedDomains.includes(dom);
                      return (
                        <button
                          key={dom}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (selectedDomains.length > 1) {
                                setSelectedDomains(selectedDomains.filter(d => d !== dom));
                              }
                            } else {
                              setSelectedDomains([...selectedDomains, dom]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {dom}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Team Size, Workforce Skills & TRL */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 dark:text-purple-200 mb-1">
                      Team Size (Headcount)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={teamSize}
                      onChange={e => setTeamSize(e.target.value)}
                      placeholder="e.g. 12"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-purple-600 dark:focus:border-purple-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-purple-950 dark:text-purple-200 mb-1">
                      Workforce Skills
                    </label>
                    <input
                      type="text"
                      value={workforceSkills}
                      onChange={e => setWorkforceSkills(e.target.value)}
                      placeholder="e.g. Embedded IoT Firmware, GIS Telematics, React"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-purple-600 dark:focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-950 dark:text-purple-200 mb-1">
                      Technology Readiness Level
                    </label>
                    <select
                      value={trlLevel}
                      onChange={e => setTrlLevel(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-purple-600 dark:focus:border-purple-400"
                    >
                      <option value="5">TRL 5: Component Validation in Relevant Environment</option>
                      <option value="6">TRL 6: Prototype Demonstrated in Relevant Environment</option>
                      <option value="7">TRL 7: System Prototype in Operational Environment</option>
                      <option value="8">TRL 8: System Complete and Qualified</option>
                      <option value="9">TRL 9: Full Commercial & Operational Deployment</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-purple-950 dark:text-purple-200 mb-1">
                      Solution Description / Summary
                    </label>
                    <input
                      type="text"
                      value={startupDescription}
                      onChange={e => setStartupDescription(e.target.value)}
                      placeholder="e.g. AI-driven routing engine and IoT telemetry sensor hardware"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-purple-600 dark:focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Expert Panel Fields */}
          {role === 'expert' && (
            <div className="p-4.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-300 dark:border-indigo-700 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                  Technical Expert Panel Credentials
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                    Academic Institution / Research Center *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. IIT Bombay Innovation Cell / CSIR"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                    Technical Specialization / Domain
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    placeholder="e.g. IoT Edge Telematics & Route Optimization"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Independent Validator Fields */}
          {role === 'validator' && (
            <div className="p-4.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                  Independent Assessment Lab Credentials
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Empaneled Testing Lab / Audit Body *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. IIT Delhi Clean Mobility Assessment Lab / STQC"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                    Accreditation / Testing Standards Focus
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    placeholder="e.g. NABL Empaneled Telematics & Telemetry Verification"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
          >
            Sign In Here
          </button>
        </div>

      </div>

    </div>
  );
};
