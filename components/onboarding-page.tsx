'use client';

import { useState } from 'react';
import { useApp } from './app-context';
import { PRACTICE_AREAS, PLATFORMS } from '@/lib/types';
import type { Matter } from '@/lib/types';
import { Check, X, Mail, Calendar, MessageSquare, Video, Phone, Users } from 'lucide-react';

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ['Profile', 'Connect', 'Matters', 'Launch'];
  
  return (
    <div className="flex items-center gap-3">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        
        return (
          <div key={step} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  isCompleted
                    ? 'bg-[#4F7EF7] text-white'
                    : isActive
                    ? 'border-2 border-[#4F7EF7] text-[#4F7EF7]'
                    : 'border border-[#4A4F62] text-[#4A4F62]'
                }`}
              >
                {isCompleted ? <Check size={14} /> : stepNum}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  isActive ? 'text-[#E8E6DF]' : 'text-[#4A4F62]'
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-[#1E2130]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlatformIcon({ name, color }: { name: string; color: string }) {
  const iconProps = { size: 20, color };
  switch (name) {
    case 'Gmail':
      return <Mail {...iconProps} />;
    case 'Google Calendar':
      return <Calendar {...iconProps} />;
    case 'Slack':
      return <MessageSquare {...iconProps} />;
    case 'Microsoft Teams':
      return <Users {...iconProps} />;
    case 'Zoom':
      return <Video {...iconProps} />;
    case 'WhatsApp':
      return <Phone {...iconProps} />;
    default:
      return <Mail {...iconProps} />;
  }
}

export function OnboardingPage() {
  const {
    onboardingStep,
    setOnboardingStep,
    profile,
    setProfile,
    connectedPlatforms,
    connectPlatform,
    disconnectPlatform,
    matters,
    addMatter,
    removeMatter,
    setView,
  } = useApp();

  // Step 1 state
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [lawFirm, setLawFirm] = useState(profile?.lawFirm || '');
  const [hourlyRate, setHourlyRate] = useState(profile?.hourlyRate?.toString() || '');
  const [practiceArea, setPracticeArea] = useState(profile?.practiceArea || '');

  // Step 3 state
  const [matterName, setMatterName] = useState('');
  const [clientName, setClientName] = useState('');
  const [matterType, setMatterType] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const isStep1Valid = fullName && email && lawFirm && hourlyRate && practiceArea;
  const isStep2Valid = connectedPlatforms.length > 0;
  const isStep3Valid = matters.length > 0;

  const handleNext = () => {
    if (onboardingStep === 1) {
      setProfile({
        fullName,
        email,
        lawFirm,
        hourlyRate: parseFloat(hourlyRate) || 0,
        practiceArea,
      });
    }
    if (onboardingStep < 4) {
      setOnboardingStep((onboardingStep + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (onboardingStep > 1) {
      setOnboardingStep((onboardingStep - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleAddMatter = async () => {
    if (!matterName || !clientName || !matterType || !clientEmail) return;
  
    await addMatter({
      id: '',
      name: matterName,
      clientName,
      matterType,
      clientEmail,
    });
  
    setMatterName('');
    setClientName('');
    setMatterType('');
    setClientEmail('');
  };

  const canContinue = () => {
    switch (onboardingStep) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      case 4: return true;
      default: return false;
    }
  };

  const firstName = fullName.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-[#0C0E14] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1E2130] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#E8E6DF]">
            HOURLY<span className="text-[#4F7EF7]">.</span>
          </h1>
          <div className="flex flex-col items-end gap-1">
            <StepIndicator currentStep={onboardingStep} />
            <span className="text-xs text-[#4A4F62]">Step {onboardingStep} of 4</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Step 1: Profile */}
          {onboardingStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#E8E6DF] mb-2">Complete your profile</h2>
                <p className="text-[#6B7080]">Tell us about yourself and your practice.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#6B7080] mb-2">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] focus:border-[#4F7EF7] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6B7080] mb-2">Work email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] focus:border-[#4F7EF7] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6B7080] mb-2">Law firm</label>
                  <input
                    type="text"
                    value={lawFirm}
                    onChange={(e) => setLawFirm(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] focus:border-[#4F7EF7] focus:outline-none transition-colors"
                    placeholder="Smith & Associates LLP"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#6B7080] mb-2">Hourly rate</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7080]">$</span>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] font-mono focus:border-[#4F7EF7] focus:outline-none transition-colors"
                        placeholder="450"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#6B7080] mb-2">Practice area</label>
                    <select
                      value={practiceArea}
                      onChange={(e) => setPracticeArea(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] focus:border-[#4F7EF7] focus:outline-none transition-colors"
                    >
                      <option value="">Select...</option>
                      {PRACTICE_AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Connect Platforms */}
          {onboardingStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#E8E6DF] mb-2">Connect your platforms</h2>
                <p className="text-[#6B7080]">We&apos;ll automatically capture billable activity from these sources.</p>
              </div>
              <div className="space-y-3">
                {PLATFORMS.map((platform) => {
                  const isConnected = connectedPlatforms.includes(platform.name);
                  return (
                    <div
                      key={platform.name}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        platform.available
                          ? isConnected
                            ? 'bg-[#0E2030] border-[#4F7EF7]'
                            : 'bg-[#13151E] border-[#1E2130]'
                          : 'bg-[#13151E] border-[#1E2130] opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${platform.color}20` }}
                        >
                          <PlatformIcon name={platform.name} color={platform.color} />
                        </div>
                        <div>
                          <h3 className="text-[#E8E6DF] font-medium">{platform.name}</h3>
                          <p className="text-sm text-[#6B7080]">{platform.description}</p>
                        </div>
                      </div>
                      {platform.available ? (
                        <button
                          onClick={() =>
                            isConnected
                              ? disconnectPlatform(platform.name)
                              : connectPlatform(platform.name)
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isConnected
                              ? 'bg-[#4F7EF7] text-white'
                              : 'bg-transparent border border-[#1E2130] text-[#E8E6DF] hover:border-[#4F7EF7]'
                          }`}
                        >
                          {isConnected ? 'Connected ✓' : 'Connect'}
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-[#1E2130] text-[#4A4F62] text-xs rounded-full">
                          Coming soon
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Matters */}
          {onboardingStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#E8E6DF] mb-2">Add your matters</h2>
                <p className="text-[#6B7080]">Create matters to organize your billable time.</p>
              </div>
              
              {/* Add Matter Form */}
              <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#6B7080] mb-2">Matter name</label>
                    <input
                      type="text"
                      value={matterName}
                      onChange={(e) => setMatterName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] focus:border-[#4F7EF7] focus:outline-none transition-colors"
                      placeholder="Smith v. Jones"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6B7080] mb-2">Client name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] focus:border-[#4F7EF7] focus:outline-none transition-colors"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#6B7080] mb-2">Matter type</label>
                    <select
                      value={matterType}
                      onChange={(e) => setMatterType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] focus:border-[#4F7EF7] focus:outline-none transition-colors"
                    >
                      <option value="">Select...</option>
                      {PRACTICE_AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#6B7080] mb-2">Client contact email</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0C0E14] border border-[#1E2130] rounded-lg text-[#E8E6DF] focus:border-[#4F7EF7] focus:outline-none transition-colors"
                      placeholder="contact@acme.com"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleAddMatter}
                    disabled={!matterName || !clientName || !matterType || !clientEmail}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      matterName && clientName && matterType && clientEmail
                        ? 'bg-[#4F7EF7] text-white hover:bg-[#3D6AE0]'
                        : 'bg-[#1E2130] text-[#4A4F62] cursor-not-allowed'
                    }`}
                  >
                    Add matter
                  </button>
                </div>
              </div>

              {/* Added Matters List */}
              {matters.length > 0 && (
                <div className="space-y-3">
                  {matters.map((matter) => (
                    <div
                      key={matter.id}
                      className="flex items-center justify-between p-4 bg-[#0E2030] border border-[#4F7EF7] rounded-xl"
                    >
                      <div>
                        <h3 className="text-[#E8E6DF] font-medium">{matter.name}</h3>
                        <p className="text-sm text-[#6B7080]">
                          {matter.clientName} · {matter.matterType} · {matter.clientEmail}
                        </p>
                      </div>
                      <button
                        onClick={() => void removeMatter(matter.id)}
                        className="p-2 text-[#4A4F62] hover:text-[#E8E6DF] transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Launch */}
          {onboardingStep === 4 && (
            <div className="text-center space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4F7EF7]/10 rounded-2xl">
                <span className="text-3xl text-[#4F7EF7]">✦</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#E8E6DF] mb-2">
                  You&apos;re all set, {firstName}.
                </h2>
                <p className="text-[#6B7080]">
                  Your workflow is active. First entries will appear within the minute.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="space-y-4 text-left">
                <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-5">
                  <h3 className="text-xs uppercase text-[#4A4F62] tracking-wider mb-3">Your profile</h3>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-[#E8E6DF]">{fullName}</p>
                    <p className="text-[#6B7080]">{lawFirm}</p>
                    <p className="text-[#6B7080]">
                      <span className="font-mono">${parseFloat(hourlyRate).toLocaleString()}</span>/hr · {practiceArea}
                    </p>
                  </div>
                </div>

                <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-5">
                  <h3 className="text-xs uppercase text-[#4A4F62] tracking-wider mb-3">Connected platforms</h3>
                  <div className="space-y-2">
                    {connectedPlatforms.map((platform) => (
                      <div key={platform} className="flex items-center gap-2 text-sm">
                        <Check size={14} className="text-[#22C48A]" />
                        <span className="text-[#E8E6DF]">{platform}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-5">
                  <h3 className="text-xs uppercase text-[#4A4F62] tracking-wider mb-3">Matters</h3>
                  <div className="space-y-2">
                    {matters.map((matter) => (
                      <div key={matter.id} className="text-sm">
                        <span className="text-[#E8E6DF]">{matter.name}</span>
                        <span className="text-[#6B7080]"> · {matter.clientName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                  onClick={() => setView('dashboard')}
                  className="w-full py-3 bg-[#4F7EF7] text-white font-medium rounded-lg hover:bg-[#3D6AE0] transition-colors"
                >
                  Go to dashboard →
                </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      {onboardingStep < 4 && (
        <footer className="border-t border-[#1E2130] px-6 py-4">
          <div className="max-w-xl mx-auto flex justify-between">
            <button
              onClick={handleBack}
              disabled={onboardingStep === 1}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                onboardingStep === 1
                  ? 'text-[#4A4F62] cursor-not-allowed'
                  : 'text-[#E8E6DF] border border-[#2A2D3E] hover:border-[#4F7EF7]'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canContinue()}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                canContinue()
                  ? 'bg-[#4F7EF7] text-white hover:bg-[#3D6AE0]'
                  : 'bg-[#4F7EF7] text-white opacity-35 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
