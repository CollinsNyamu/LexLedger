'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type AuthTab = 'login' | 'create';
type Role = 'attorney' | 'client';

export function AuthPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [role, setRole] = useState<Role>('attorney');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = '/';
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (role === 'client') {
      setError('Client accounts require an invitation link from your law firm.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = '/';
      return;
    }

    setNotice('Account created. Check your email to confirm your address, then sign in.');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0C0E14] text-[#E8E6DF] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2">LexLedger.</h1>
        <p className="text-[#6B7080] mb-8">AI Revenue Recovery & Client Transparency</p>

        <div className="flex gap-3 mb-6">
          <button onClick={() => setActiveTab('login')} className="flex-1 rounded-lg bg-[#1A1D28] py-3">
            Log in
          </button>
          <button onClick={() => setActiveTab('create')} className="flex-1 rounded-lg bg-[#1A1D28] py-3">
            Create account
          </button>
        </div>

        {error && <div className="mb-4 text-red-400">{error}</div>}
        {notice && <div className="mb-4 text-green-400">{notice}</div>}

        {activeTab === 'create' && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setRole('attorney')}
              className={`rounded-lg border p-3 ${role === 'attorney' ? 'border-blue-500' : 'border-[#1E2130]'}`}
            >
              Attorney
            </button>
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`rounded-lg border p-3 ${role === 'client' ? 'border-blue-500' : 'border-[#1E2130]'}`}
            >
              Client
            </button>
          </div>
        )}

        <form onSubmit={activeTab === 'login' ? handleLogin : handleCreateAccount} className="space-y-4">
          {activeTab === 'create' && (
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg bg-[#13151E] border border-[#1E2130] px-4 py-3"
              required
            />
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-lg bg-[#13151E] border border-[#1E2130] px-4 py-3"
            required
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-lg bg-[#13151E] border border-[#1E2130] px-4 py-3"
            required
          />

          <button
            disabled={loading}
            className="w-full rounded-lg bg-[#4F7EF7] py-3 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : activeTab === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}