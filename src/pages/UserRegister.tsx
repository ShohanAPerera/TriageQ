import React, { useState } from 'react';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { registerUser } from '../services/authStore';
import { Card, CardBody } from '../components/ui/Card';
import type { UserRole } from '../types';

export default function UserRegister() {
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    role: 'Staff' as UserRole,
  });
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 4) return setError('PIN must be 4 digits.');
    if (pin !== confirmPin) return setError('PINs do not match.');
    if (!form.username.trim() || !form.fullName.trim()) return setError('Please fill all fields.');

    try {
      registerUser(form.username.trim(), form.fullName.trim(), form.role, pin);
      setSuccess(true);
      setForm({ username: '', fullName: '', role: 'Staff' });
      setPin('');
      setConfirmPin('');
    } catch (err: any) {
      setError(err.message || 'Failed to register user.');
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">User Registered!</h1>
          <p className="text-gray-500 mt-1">They can now log in using their credentials.</p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="w-full py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors mt-6"
        >
          Register Another User
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus size={24} className="text-red-500" />
          Staff Registration
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create new administrative or staff accounts for the system.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <Card>
          <CardBody>
            <h2 className="font-semibold text-gray-800 mb-4">Account Details</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Sarah Connor"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="e.g. sconnor"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all bg-white"
                  >
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-semibold text-gray-800 mb-4">Security Validation (4-PIN)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  4-Digit PIN <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-center text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm PIN <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-center text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  required
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <button
          type="submit"
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-base transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
        >
          <UserPlus size={18} />
          Register Staff Account
        </button>
      </form>
    </div>
  );
}
