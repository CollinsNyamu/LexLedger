'use client';

import { useState } from 'react';
import { useApp } from './app-context';
import { Eye, EyeOff } from 'lucide-react';

interface FeaturePillProps {
  text: string;
  color: string;
  delay: number;
}

function FeaturePill({ text, color, delay }: FeaturePillProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1A1D28] border border-[#252836] animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm text-[#B0AFA8]">{text}</span>
    </div>
  );
}

export function AuthPage() {
  const { setView, setProfile, loginWithPreset } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'create'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Create account form state
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithPreset();
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    
    setProfile({
      fullName,
      email: workEmail,
      lawFirm: '',
      hourlyRate: 0,
      practiceArea: '',
    });
    setView('onboarding');
  };

  const isCreateValid = fullName && workEmail && password && confirmPassword;

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-[#0D0F18] flex-col justify-center px-16">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-[#E8E6DF] mb-12">
            HOURLY<span className="text-[#4F7EF7]">.</span>
          </h1>
          <div className="space-y-3">
            <FeaturePill 
              text="Captures emails, calls & messages automatically" 
              color="#4F7EF7" 
              delay={200}
            />
            <FeaturePill 
              text="AI drafts your billing narratives" 
              color="#22C48A" 
              delay={400}
            />
            <FeaturePill 
              text="Recover hours you would have lost" 
              color="#E8A838" 
              delay={600}
            />
          </div>
        </div>
      </div>

      {/* Right panel - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0C0E14]">
        <div className="w-full max-w-md bg-[#13151E] border border-[#1E2130] rounded-2xl p-8">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <h1 className="text-3xl font-bold text-[#E8E6DF]">
              HOURLY<span className="text-[#4F7EF7]">.</span>
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#1E2130] mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'text-[#E8E6DF] border-b-2 border-[#4F7EF7]'
                  : 'text-[#4A4F62] hover:text-[#6B7080]'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'create'
                  ? 'text-[#E8E6DF] border-b-2 border-[#4F7EF7]'
                  : 'text-[#4A4F62] hover:text-[#6B7080]'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7080] mb-2">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] placeholder-[#4A4F62] focus:border-[#4F7EF7] focus:outline-none transition-colors"
                  placeholder="you@lawfirm.com"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B7080] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] placeholder-[#4A4F62] focus:border-[#4F7EF7] focus:outline-none transition-colors pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A4F62] hover:text-[#6B7080] transition-colors"
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#4F7EF7] text-white font-medium rounded-lg hover:bg-[#3D6AE0] transition-colors mt-6"
              >
                Log in
              </button>
              <p className="text-center text-xs text-[#4A4F62] mt-4">
                Forgot password?
              </p>
            </form>
          )}

          {/* Create Account Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7080] mb-2">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] placeholder-[#4A4F62] focus:border-[#4F7EF7] focus:outline-none transition-colors"
                  placeholder="Jane Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B7080] mb-2">Work email</label>
                <input
                  type="email"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] placeholder-[#4A4F62] focus:border-[#4F7EF7] focus:outline-none transition-colors"
                  placeholder="you@lawfirm.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B7080] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] placeholder-[#4A4F62] focus:border-[#4F7EF7] focus:outline-none transition-colors pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A4F62] hover:text-[#6B7080] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#6B7080] mb-2">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className={`w-full px-4 py-2.5 bg-[#0C0E14] border rounded-lg text-[#E8E6DF] placeholder-[#4A4F62] focus:outline-none transition-colors pr-10 ${
                      passwordError ? 'border-red-500' : 'border-[#1E2130] focus:border-[#4F7EF7]'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A4F62] hover:text-[#6B7080] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-xs mt-2">{passwordError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={!isCreateValid}
                className={`w-full py-3 bg-[#4F7EF7] text-white font-medium rounded-lg transition-colors mt-6 ${
                  isCreateValid ? 'hover:bg-[#3D6AE0]' : 'opacity-35 cursor-not-allowed'
                }`}
              >
                Create account →
              </button>
              <p className="text-center text-[10px] text-[#4A4F62] mt-4">
                By creating an account you agree to our Terms of Service
              </p>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          opacity: 0;
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
