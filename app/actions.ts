'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Auth actions
export async function signUp(email: string, password: string, fullName: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
        `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { data, needsEmailConfirmation: !data.session }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { data }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Profile actions
export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function updateProfile(profile: {
  full_name?: string
  law_firm?: string
  hourly_rate?: number
  practice_area?: string
  onboarding_completed?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { data }
}

// Matters actions
export async function getMatters() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('matters')
    .select('*')
    .eq('attorney_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function createMatter(matter: {
  name: string
  client_name: string
  client_email?: string
  matter_type: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('matters')
    .insert({
      ...matter,
      attorney_id: user.id,
      status: 'active',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { data }
}

export async function deleteMatter(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('matters')
    .delete()
    .eq('id', id)
    .eq('attorney_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { success: true }
}

// Activity entries actions
export async function getEntries() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('activity_entries')
    .select(`
      *,
      matter:matters(name)
    `)
    .eq('attorney_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function updateEntry(id: string, updates: {
  narrative?: string
  hours?: number
  status?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('activity_entries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('attorney_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { data }
}

export async function approveEntry(id: string) {
  return updateEntry(id, { status: 'approved' })
}

export async function discardEntry(id: string) {
  return updateEntry(id, { status: 'discarded' })
}

export async function approveAllEntries(matterName?: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated', count: 0 }

  // Build query
  let query = supabase
    .from('activity_entries')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('attorney_id', user.id)
    .eq('status', 'pending')

  // If matterName filter is provided, we need to join with matters
  if (matterName) {
    // First get the matter ID
    const { data: matter } = await supabase
      .from('matters')
      .select('id')
      .eq('attorney_id', user.id)
      .eq('name', matterName)
      .single()

    if (matter) {
      query = query.eq('matter_id', matter.id)
    }
  }

  const { data, error } = await query.select()

  if (error) return { error: error.message, count: 0 }
  
  revalidatePath('/dashboard')
  return { count: data?.length || 0, matterName }
}

// Create demo entries for a new user
export async function createDemoEntries() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  // First create some demo matters
  const demoMatters = [
    { name: 'Hartwell v. Morrison', client_name: 'James Hartwell', matter_type: 'Litigation' },
    { name: 'Meridian Partners — Q3 Restructuring', client_name: 'James Okafor', matter_type: 'Corporate' },
    { name: 'NovaTech IP Licensing', client_name: 'David Lim', matter_type: 'IP' },
    { name: 'Rosario Family Trust', client_name: 'Elena Vasquez', matter_type: 'Estate Planning' },
  ]

  const createdMatters: Record<string, string> = {}

  for (const matter of demoMatters) {
    const { data } = await supabase
      .from('matters')
      .insert({
        ...matter,
        attorney_id: user.id,
        status: 'active',
      })
      .select()
      .single()
    
    if (data) {
      createdMatters[matter.name] = data.id
    }
  }

  // Create demo activity entries
  const demoEntries = [
    {
      source: 'email',
      timestamp_label: '9:47 AM',
      subject: 'RE: Indemnification Clause Review',
      contact: 'Sarah Chen',
      company: 'Morrison Partners',
      hours: 1.0,
      narrative: 'Reviewed and responded to opposing counsel\'s inquiry regarding indemnification clause scope and limitations. Addressed concerns about carve-outs for gross negligence and proposed amended language for mutual indemnity provisions.',
      has_attachment: true,
      status: 'pending',
      matter_id: createdMatters['Hartwell v. Morrison'],
    },
    {
      source: 'email',
      timestamp_label: '10:15 AM',
      subject: 'RE: Discovery Extension Request',
      contact: 'James Hartwell',
      company: 'Hartwell LLC',
      hours: 0.3,
      narrative: 'Received and reviewed opposing counsel\'s request for 30-day extension on discovery production deadline. Drafted response agreeing to extension with conditions regarding rolling production schedule.',
      has_attachment: false,
      status: 'pending',
      matter_id: createdMatters['Hartwell v. Morrison'],
    },
    {
      source: 'meeting',
      timestamp_label: '11:30 AM',
      subject: 'Q3 Restructuring Strategy Call',
      contact: 'James Okafor',
      company: 'Meridian Partners',
      hours: 0.75,
      narrative: 'Conference call with client to discuss Q3 restructuring timeline, debt covenant amendments, and creditor negotiation strategy. Outlined next steps for intercreditor agreement revisions.',
      has_attachment: false,
      status: 'pending',
      matter_id: createdMatters['Meridian Partners — Q3 Restructuring'],
    },
    {
      source: 'slack',
      timestamp_label: '2:42 PM',
      subject: 'Associate Question on Filing Deadline',
      contact: 'Lisa Park',
      company: 'Internal',
      hours: 0.1,
      narrative: 'Responded to internal associate inquiry regarding court filing deadline for motion to compel. Confirmed deadline and provided guidance on service requirements.',
      has_attachment: false,
      status: 'pending',
      matter_id: createdMatters['Meridian Partners — Q3 Restructuring'],
    },
    {
      source: 'email',
      timestamp_label: '3:20 PM',
      subject: 'IP Term Sheet Review',
      contact: 'David Lim',
      company: 'NovaTech Inc.',
      hours: 0.3,
      narrative: 'Reviewed IP licensing term sheet and drafted redline comments on royalty calculation methodology, sublicensing restrictions, and audit rights provisions.',
      has_attachment: true,
      status: 'pending',
      matter_id: createdMatters['NovaTech IP Licensing'],
    },
    {
      source: 'meeting',
      timestamp_label: '4:00 PM',
      subject: 'Trust Amendment Discussion',
      contact: 'Elena Vasquez',
      company: 'Rosario Family',
      hours: 0.05,
      narrative: 'Brief call to confirm beneficiary designation changes and discuss timeline for trust amendment execution.',
      has_attachment: false,
      status: 'pending',
      matter_id: createdMatters['Rosario Family Trust'],
    },
  ]

  for (const entry of demoEntries) {
    if (entry.matter_id) {
      await supabase
        .from('activity_entries')
        .insert({
          ...entry,
          attorney_id: user.id,
        })
    }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
