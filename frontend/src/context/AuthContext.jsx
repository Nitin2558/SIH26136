import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_USER_PERSONAS = {
  government: {
    id: 'usr-govt-1',
    name: 'Dr. Sunita Verma',
    email: 'sunita.verma@gov.in',
    role: 'government',
    departmentName: 'Department of Urban Infrastructure & Smart Cities, Maharashtra',
    designation: 'Director of Urban Modernization',
    locationState: 'Maharashtra',
    isDemo: true
  },
  startup: {
    id: 'usr-startup-1',
    name: 'Aarav Sharma (CleanRoute)',
    email: 'aarav@cleanroute.tech',
    role: 'startup',
    startupId: 'start-1',
    companyName: 'CleanRoute Technologies Pvt Ltd',
    dpiitNumber: 'DIPP-84920',
    locationState: 'Maharashtra',
    isDemo: true
  },
  expert: {
    id: 'usr-expert-1',
    name: 'Dr. Meera Iyer',
    email: 'meera.iyer@iitb.ac.in',
    role: 'expert',
    designation: 'Expert Panel Member',
    organization: 'Urban Systems, IIT Bombay',
    affiliation: 'Urban Systems, IIT Bombay',
    expertise: 'Urban Infrastructure, AI/ML, Cyber Security',
    empanelmentId: 'EXP-MOHUA-2024-918',
    isDemo: true
  },
  validator: {
    id: 'usr-validator-1',
    name: 'Prof. Anil Kapoor',
    email: 'anil.kapoor@iitd.ac.in',
    role: 'validator',
    organization: 'Independent Lab, IIT Delhi',
    institution: 'Independent Lab, IIT Delhi',
    domain: 'Urban Logistics, IoT, Data Analytics',
    expertise: 'Urban Logistics, IoT, Data Analytics',
    designation: 'Chief Technical Auditor & Lab Director',
    isDemo: true
  },
  admin: {
    id: 'usr-admin-1',
    name: 'Procurement Oversight Admin',
    email: 'admin@procure-innovate.gov.in',
    role: 'admin',
    isDemo: true
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('civic_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('civic_token') || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('civic_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('civic_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('civic_token', token);
    } else {
      localStorage.removeItem('civic_token');
    }
  }, [token]);

  // Real API Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      const userData = { ...data.user, isDemo: false };
      setUser(userData);
      setToken(data.token);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  // Real API Signup
  const signup = async (userDataInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDataInput)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      const userData = { ...data.user, isDemo: false };
      setUser(userData);
      setToken(data.token);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Access for Hackathon Judges
  const demoLogin = async (roleKey) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoRole: roleKey })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const userData = { ...data.user, isDemo: true };
        setUser(userData);
        setToken(data.token);
        return userData;
      }
    } catch (err) {
      console.warn('Backend login fallback to local persona:', err);
    } finally {
      setLoading(false);
    }

    const fallbackUser = { ...(DEMO_USER_PERSONAS[roleKey] || DEMO_USER_PERSONAS.government), isDemo: true };
    setUser(fallbackUser);
    setToken('demo-judge-token');
    return fallbackUser;
  };

  // 2Factor Real Mobile SMS / Voice Call OTP Dispatch
  const sendMobileOtp = async (phone, method = 'sms') => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, method })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  // 2Factor Real Mobile SMS / Voice Call OTP Verification & Direct Login
  const verifyMobileOtp = async ({ sessionId, otp, phone, role, method = 'sms' }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, otp, phone, role, method })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OTP verification failed.');
      }
      const userData = { ...data.user, isDemo: false };
      setUser(userData);
      setToken(data.token);
      return { user: userData, isNewUser: data.isNewUser };
    } finally {
      setLoading(false);
    }
  };

  // Update Profile (Name, Email, Organization, Location - like Instagram)
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }
      const updated = { ...user, ...data.user };
      setUser(updated);
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civic_user');
    localStorage.removeItem('civic_token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      isAuthenticated: !!user,
      login, 
      signup, 
      sendMobileOtp,
      verifyMobileOtp,
      updateProfile,
      demoLogin, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
