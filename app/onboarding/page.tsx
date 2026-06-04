import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, getMatters } from '@/app/actions'
import { OnboardingClient } from './onboarding-client'
import { transformProfile, transformMatter } from '@/lib/types'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const [profile, matters] = await Promise.all([
    getProfile(),
    getMatters(),
  ])

  // If onboarding already completed, go to dashboard
  if (profile?.onboarding_completed) {
    redirect('/dashboard')
  }

  const transformedProfile = profile ? transformProfile(profile) : null
  const transformedMatters = (matters || []).map(transformMatter)

  return (
    <OnboardingClient
      initialProfile={transformedProfile}
      initialMatters={transformedMatters}
      userEmail={user.email || ''}
      userName={user.user_metadata?.full_name || ''}
    />
  )
}
