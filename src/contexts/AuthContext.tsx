import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, RealtimeChannel } from '@supabase/supabase-js'
import { supabase, Profile } from '../lib/supabase'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [presenceChannel, setPresenceChannel] = useState<RealtimeChannel | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error fetching profile:', error)
        }
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        setTimeout(async () => {
          await fetchProfile(session.user.id)
        }, 0)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])
  
  // Presence tracking
  useEffect(() => {
    if (user && !presenceChannel) {
      const channel = supabase.channel(`online-users`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          // Can be used to get all online users
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ online_at: new Date().toISOString() });
          }
        });
      
      setPresenceChannel(channel);

      // Update last_seen every 20 seconds
      const interval = setInterval(async () => {
        if (document.visibilityState === 'visible') {
          await supabase
            .from('profiles')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', user.id);
        }
      }, 20000);

      return () => {
        if (presenceChannel) {
          supabase.removeChannel(presenceChannel);
        }
        clearInterval(interval);
      };
    } else if (!user && presenceChannel) {
      supabase.removeChannel(presenceChannel);
      setPresenceChannel(null);
    }
  }, [user, presenceChannel]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      })

      if (error) throw error
      
      toast.success(t('auth.messages.signup_success'))
    } catch (error: any) {
      toast.error(error.message || t('auth.messages.signup_error'))
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      
      toast.success(t('auth.messages.signin_success'))
    } catch (error: any) {
      toast.error(error.message || t('auth.messages.signin_error'))
      throw error
    }
  }

  const signOut = async () => {
    try {
      if (presenceChannel) {
        await presenceChannel.untrack();
      }
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success(t('auth.messages.signout_success'))
    } catch (error: any) {
      toast.error(error.message || t('auth.messages.signout_error'))
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error(t('auth.messages.no_user_logged_in'))

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, ...updates } : null)
      toast.success(t('auth.messages.profile_update_success'))
    } catch (error: any) {
      toast.error(error.message || t('auth.messages.profile_update_error'))
      throw error
    }
  }
  
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
