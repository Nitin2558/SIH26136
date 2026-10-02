import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Award,
  DollarSign,
  Scale,
  Sparkles
} from 'lucide-react';

export const AdminDashboardPage = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reseeding, setReseeding] = useState(false);
  const [reseedMsg, setReseedMsg] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/users').then(res => res.json()).catch(() => ({})),
      fetch('/api/admin/audit-logs').then(res => res.json()).catch(() => ({}))
    ])
      .then(([userData, logData]) => {
        if (userData.users) setUsersList(userData.users);
        if (logData.logs) setLogs(logData.logs);
      })
      .catch(err => console.error('Error fetching admin data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReseed = async () => {
    setReseeding(true);
    setReseedMsg('');
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setReseedMsg('✓ Database successfully re-seeded with CleanRoute demo scenario and SIH26136 outcome challenges.');
        fetchData();
      }
    } catch (err) {
      console.error('Error re-seeding:', err);
    } finally {
      setReseeding(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="civic-card p-6 md:p-8 rounded-3xl border border-rose-200 dark:border-rose-900 bg-gradient-to-r from-rose-50/70 via-pink-50/70 to-slate-50 dark:from-rose-950/40 dark:via-pink-950/40 dark:to-slate-900 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">
                  Procurement Oversight & Audit Control Console
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  SIH26136 Admin
                </span>
              </div>
              <p className="text-xs text-rose-950 dark:text-rose-200 font-medium mt-0.5">
                Full lifecycle audit logs, stakeholder permissions, milestone release monitoring, and demo data management.
              </p>
            </div>
          </div>

          <button
            onClick={handleReseed}
            disabled={reseeding}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Reset database to CleanRoute demo scenario"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
            {reseeding ? 'Re-Seeding Demo...' : 'Reset & Re-Seed Demo Scenario'}
          </button>
        </div>
      </div>

      {reseedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5 border border-emerald-300 dark:border-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-bold">{reseedMsg}</span>
        </div>
      )}

      {/* Audit Trail Logs */}
      <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-600" /> Tamper-Evident Procurement Audit Trail ({logs.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chronological log of milestone releases, 3rd party validations, expert scoring, and Rule 194 authorizations.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs font-medium">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">No audit logs recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div>
                  <div className="text-slate-900 dark:text-slate-100 font-bold">
                    [{log.action || 'PROCUREMENT_EVENT'}] • {new Date(log.timestamp).toLocaleString()}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    User: {log.user || 'System'} • Target: {log.target || log.details || 'General'}
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                  {log.status || 'VERIFIED'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stakeholders & User Roles Roster */}
      <div className="civic-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" /> Empaneled Stakeholders & Verified Roles ({usersList.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {usersList.map(u => (
            <div key={u.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{u.name}</div>
              <div className="text-blue-700 dark:text-blue-400 font-mono text-[11px]">{u.email}</div>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-semibold uppercase">Role:</span>
                <span className="px-2 py-0.5 rounded font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {u.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
