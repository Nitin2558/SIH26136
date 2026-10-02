import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Rocket, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Edit3
} from 'lucide-react';

export const LoginPage = ({ setActiveTab }) => {
  const { sendMobileOtp, verifyMobileOtp, demoLogin } = useAuth();

  // Mobile Auth State
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('government');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpInputRefs = useRef([]);

  // Countdown timer for OTP Resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleRoleRedirect = (userRole) => {
    switch (userRole) {
      case 'government':
        setActiveTab('govt-dashboard');
        break;
      case 'startup':
      case 'university':
        setActiveTab('university');
        break;
      case 'validator':
      case 'industry':
        setActiveTab('industry');
        break;
      case 'expert':
        setActiveTab('needs-review');
        break;
      case 'admin':
        setActiveTab('admin');
        break;
      default:
        setActiveTab('govt-dashboard');
        break;
    }
  };

  // Step 1: Send OTP via 2Factor
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');
    
    if (cleanDigits.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!/^[6-9]/.test(cleanDigits)) {
      setError('Indian mobile numbers must start with 6, 7, 8, or 9.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await sendMobileOtp(cleanDigits);
      setSessionId(res.sessionId);
      setStep('otp');
      setCountdown(30);
      setSuccessMsg(`Verification code dispatched to +91 ${cleanDigits.slice(0, 3)}****${cleanDigits.slice(-3)}`);
      // Focus first OTP input
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 150);
    } catch (err) {
      setError(err.message || 'Failed to dispatch OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle OTP input changes with auto-focus shifting
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    if (value.length > 1) {
      // Handle paste of 6 digits
      const pastedDigits = value.slice(0, 6).split('');
      pastedDigits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      if (otpInputRefs.current[nextIndex]) {
        otpInputRefs.current[nextIndex].focus();
      }
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  // Step 3: Verify OTP and Login / Auto-provision
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('').trim();
    if (fullOtp.length < 4) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const cleanDigits = phone.replace(/\D/g, '');
      const res = await verifyMobileOtp({
        sessionId,
        otp: fullOtp,
        phone: cleanDigits,
        role
      });
      handleRoleRedirect(res.user.role);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (roleKey) => {
    setError('');
    const loggedUser = await demoLogin(roleKey);
    handleRoleRedirect(loggedUser.role);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-600/25">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Mobile OTP Sign In</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">SIH26136 — Fast & Passwordless 2Factor Authentication</p>
      </div>

      {/* Main Login Card */}
      <div className="civic-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6">
        
        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex flex-col gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
            {error.toLowerCase().includes('register') && (
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className="self-start text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create a new account now →
              </button>
            )}
          </div>
        )}

        {/* Success / Notification */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Phone Number Input */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-5 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Indian Mobile Number
              </label>
              
              <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
                <div className="px-3 py-2.5 bg-slate-100 dark:bg-slate-750 border-r border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shrink-0 select-none">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  className="w-full px-3.5 py-2.5 bg-transparent text-slate-900 dark:text-slate-100 text-sm tracking-wider font-mono focus:outline-none placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5">
                We'll send a 6-digit verification code to your mobile phone.
              </p>
            </div>

            {/* Role Select Pill (Only for new accounts) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Persona
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
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold ring-1 ring-blue-600'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] truncate">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simple Primary Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || phone.replace(/\D/g, '').length !== 10}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Requesting OTP...</span>
                </>
              ) : (
                <>
                  <span>Request OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Input */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[11px] text-slate-500">Verification code sent to</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                  +91 {phone.slice(0, 3)}****{phone.slice(-3)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Enter 6-Digit Security Code
              </label>
              
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpInputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-11 h-12 sm:w-12 sm:h-13 text-center text-xl font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 text-slate-900 dark:text-slate-100 transition-all shadow-2xs"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-500">Didn't receive the code?</span>
              {countdown > 0 ? (
                <span className="text-slate-400 font-mono font-medium">
                  Resend in {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.join('').trim().length < 4}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Enter Platform</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          🔒 Secured by 2Factor.in Gateway • Zero-Password Encryption
        </div>

      </div>

      {/* Demo Mode Judge Quick Access Box */}
      <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Hackathon Judge Quick Access (Demo Mode)</span>
        </div>
        <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal">
          For presentation evaluation without testing real SMS on personal phones, click any role persona below:
        </p>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => handleQuickDemo('government')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 hover:border-amber-400 text-slate-700 dark:text-slate-200 font-medium text-left flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Building2 className="w-3.5 h-3.5 text-sky-600" /> Department Officer
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('startup')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 hover:border-amber-400 text-slate-700 dark:text-slate-200 font-medium text-left flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Rocket className="w-3.5 h-3.5 text-purple-600" /> Startup
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('expert')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 hover:border-amber-400 text-slate-700 dark:text-slate-200 font-medium text-left flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Award className="w-3.5 h-3.5 text-amber-600" /> Expert Panel
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('validator')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 hover:border-amber-400 text-slate-700 dark:text-slate-200 font-medium text-left flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Independent Validator
          </button>
        </div>
      </div>

    </div>
  );
};

