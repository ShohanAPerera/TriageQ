import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, AlertCircle } from 'lucide-react';
import { loginUser } from '../services/authStore';
import { Card, CardBody } from '../components/ui/Card';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be 4 digits.');
      return;
    }

    try {
      loginUser(username, pin);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/25 mx-auto mb-4">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TriageQ</h1>
          <p className="text-slate-400">Sign in to access the system</p>
        </div>

        <Card className="bg-slate-800 border-slate-700 shadow-xl">
          <CardBody>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  4-Digit PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); // only digits
                      setPin(val);
                    }}
                    placeholder="••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-mono text-center text-2xl tracking-[1em] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    required
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-500">
                    <Lock size={20} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-base transition-colors shadow-lg shadow-red-500/30"
              >
                Access System
              </button>
            </form>
          </CardBody>
        </Card>

        <div className="text-center mt-6 text-slate-500 text-sm">
          Use Username: <strong>admin</strong> | PIN: <strong>1234</strong>
        </div>
      </div>
    </div>
  );
}
