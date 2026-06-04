import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, getMatters, getEntries } from '@/app/actions'
import { DashboardClient } from './dashboard-client'
import { transformProfile, transformMatter, transformEntry } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const [profile, matters, entries] = await Promise.all([
    getProfile(),
    getMatters(),
    getEntries(),
  ])

  // If no profile or onboarding not completed, redirect to onboarding
  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  const transformedProfile = transformProfile(profile)
  const transformedMatters = (matters || []).map(transformMatter)
  const transformedEntries = (entries || []).map(transformEntry)

  return (
    <DashboardClient
      initialProfile={transformedProfile}
      initialMatters={transformedMatters}
      initialEntries={transformedEntries}
    />
  )
}
