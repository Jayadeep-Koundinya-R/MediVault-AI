import { User, AccountType, DoctorProfile } from '../types';
import { DEMO_USER } from '../data/seedData';
import { supabase } from '../lib/supabase/client';

const AUTH_STORAGE_KEY = 'healthvault_auth_user';

export const authService = {
  getCurrentUser(): User | null {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  async getSessionToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  },

  async login(email: string, password: string, expectedAccountType?: AccountType): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message || "We couldn't log you in. Check your email and password.");
      }

      if (!data.user) {
        throw new Error('Login failed: user data unavailable.');
      }

      // Fetch profile from Supabase to strictly verify account_type
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const accountType: AccountType = (profile?.account_type as AccountType) || 'patient';

      // Strict account separation enforcement
      if (expectedAccountType === 'doctor' && accountType !== 'doctor') {
        await supabase.auth.signOut();
        throw new Error('This account is registered as a patient account.');
      }

      if (expectedAccountType === 'patient' && accountType === 'doctor') {
        await supabase.auth.signOut();
        throw new Error('This account is registered as a doctor account. Please use Doctor Sign In.');
      }

      const { data: consent } = await supabase
        .from('health_consents')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const authenticatedUser: User = {
        id: data.user.id,
        name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
        email: data.user.email || email,
        dateOfBirth: profile?.date_of_birth || '1990-01-01',
        createdAt: data.user.created_at,
        accountType,
        abhaId: profile?.phone ? `91-${profile.phone.slice(-4)}-2026-4491` : '91-8472-1920-4491',
        consentGiven: accountType === 'doctor' ? true : (consent?.consented ?? true),
        consentDate: consent?.consented_at || undefined,
      };

      this.setCurrentUser(authenticatedUser);
      return authenticatedUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg || "We couldn't log you in. Check your email and password and try again.");
    }
  },

  async signup(name: string, email: string, password: string, dateOfBirth: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name,
            date_of_birth: dateOfBirth,
            account_type: 'patient',
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Registration failed. Please check your details.');
      }

      const userId = data.user?.id || `user_${Date.now()}`;

      // Ensure profile record has account_type = 'patient'
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: name,
            email: email.trim(),
            date_of_birth: dateOfBirth,
            account_type: 'patient',
          });
      } catch (e) {
        console.warn('Profile upsert note:', e);
      }

      const newUser: User = {
        id: userId,
        name,
        email,
        dateOfBirth,
        createdAt: new Date().toISOString(),
        accountType: 'patient',
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        consentGiven: false, // Must complete consent step
      };

      this.setCurrentUser(newUser);
      return newUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg || 'Registration failed. Please try again.');
    }
  },

  async signupDoctor(params: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    specialization: string;
    medicalRegistrationNumber: string;
    registrationCountry: string;
    clinicName: string;
    clinicAddress?: string;
    yearsOfExperience: number;
    bio?: string;
  }): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            account_type: 'doctor',
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Doctor registration failed.');
      }

      if (!data.user) {
        throw new Error('Registration failed: user profile could not be created.');
      }

      const userId = data.user.id;

      // Create/update profile row
      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: params.fullName,
          email: params.email.trim(),
          phone: params.phone,
          account_type: 'doctor',
        });

      // Create doctor_profiles row
      await supabase
        .from('doctor_profiles')
        .upsert({
          user_id: userId,
          full_name: params.fullName,
          email: params.email.trim(),
          phone: params.phone,
          specialization: params.specialization,
          medical_registration_number: params.medicalRegistrationNumber,
          registration_country: params.registrationCountry || 'India',
          clinic_name: params.clinicName,
          clinic_address: params.clinicAddress || '',
          years_of_experience: Number(params.yearsOfExperience) || 1,
          bio: params.bio || '',
          verification_status: 'pending', // Pending by default
        });

      const doctorUser: User = {
        id: userId,
        name: params.fullName,
        email: params.email,
        dateOfBirth: '1980-01-01',
        createdAt: new Date().toISOString(),
        accountType: 'doctor',
        consentGiven: true, // Doctors don't need DPDP patient consent
      };

      this.setCurrentUser(doctorUser);
      return doctorUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg || 'Doctor registration failed. Please try again.');
    }
  },

  async loginDemoDoctor(): Promise<User> {
    const demoEmail = 'demo.dr.ananya@healthvault.local';
    const demoPass = 'DoctorVault2026!';

    try {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass,
      });

      if (error && (error.message.includes('Invalid login') || error.message.includes('not found') || error.message.includes('credentials'))) {
        // Sign up demo doctor
        const signUpRes = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPass,
          options: {
            data: {
              full_name: 'Dr. Ananya Rao',
              account_type: 'doctor',
            },
          },
        });

        const activeUser = signUpRes.data.user;
        if (activeUser) {
          await supabase
            .from('profiles')
            .upsert({
              id: activeUser.id,
              full_name: 'Dr. Ananya Rao',
              email: demoEmail,
              phone: '+91 98450 12345',
              account_type: 'doctor',
            });

          await supabase
            .from('doctor_profiles')
            .upsert({
              user_id: activeUser.id,
              full_name: 'Dr. Ananya Rao',
              email: demoEmail,
              phone: '+91 98450 12345',
              specialization: 'General Medicine',
              medical_registration_number: 'MCI-2014-98421',
              registration_country: 'India',
              clinic_name: 'CityCare Hospital',
              clinic_address: 'Indiranagar, Bengaluru',
              years_of_experience: 10,
              bio: 'Senior Consultant Physician specializing in preventive medicine and metabolic disorders.',
              verification_status: 'verified', // Pre-verified for demo
            });

          const docUser: User = {
            id: activeUser.id,
            name: 'Dr. Ananya Rao',
            email: demoEmail,
            dateOfBirth: '1982-06-15',
            createdAt: new Date().toISOString(),
            accountType: 'doctor',
            consentGiven: true,
          };

          this.setCurrentUser(docUser);
          return docUser;
        }
      } else if (data?.user) {
        const docUser: User = {
          id: data.user.id,
          name: 'Dr. Ananya Rao',
          email: demoEmail,
          dateOfBirth: '1982-06-15',
          createdAt: data.user.created_at,
          accountType: 'doctor',
          consentGiven: true,
        };
        this.setCurrentUser(docUser);
        return docUser;
      }
    } catch (e) {
      console.warn('Demo doctor login note:', e);
    }

    const fallbackDoc: User = {
      id: 'doctor_demo_01',
      name: 'Dr. Ananya Rao',
      email: demoEmail,
      dateOfBirth: '1982-06-15',
      createdAt: new Date().toISOString(),
      accountType: 'doctor',
      consentGiven: true,
    };
    this.setCurrentUser(fallbackDoc);
    return fallbackDoc;
  },

  async loginDemo(): Promise<User> {
    const demoEmail = 'demo.rahul@healthvault.local';
    const demoPass = 'HealthVaultDemo2026!';

    try {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass,
      });

      if (error && (error.message.includes('Invalid login') || error.message.includes('not found') || error.message.includes('credentials'))) {
        const signUpRes = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPass,
          options: {
            data: {
              full_name: 'Rahul Sharma',
              date_of_birth: '1985-04-12',
              account_type: 'patient',
            },
          },
        });

        let activeUser = data?.user || signUpRes.data.user;
        let activeSession = data?.session || signUpRes.data.session;

        if (activeSession?.access_token && activeUser) {
          await fetch('/api/demo/seed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${activeSession.access_token}`,
            },
          }).catch((e) => console.warn('Demo seed call note:', e));

          const demoUser: User = {
            id: activeUser.id,
            name: 'Rahul Sharma',
            email: demoEmail,
            dateOfBirth: '1985-04-12',
            createdAt: new Date().toISOString(),
            accountType: 'patient',
            abhaId: '91-8472-1920-4491',
            consentGiven: true,
            consentDate: new Date().toISOString(),
          };

          this.setCurrentUser(demoUser);
          return demoUser;
        }
      } else if (data?.session?.access_token && data.user) {
        await fetch('/api/demo/seed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.session.access_token}`,
          },
        }).catch((e) => console.warn('Demo seed call note:', e));

        const demoUser: User = {
          id: data.user.id,
          name: 'Rahul Sharma',
          email: demoEmail,
          dateOfBirth: '1985-04-12',
          createdAt: new Date().toISOString(),
          accountType: 'patient',
          abhaId: '91-8472-1920-4491',
          consentGiven: true,
          consentDate: new Date().toISOString(),
        };

        this.setCurrentUser(demoUser);
        return demoUser;
      }
    } catch (e) {
      console.warn('Supabase remote demo auth fallback to local demo user:', e);
    }

    this.setCurrentUser(DEMO_USER);
    return DEMO_USER;
  },

  async recordConsent(): Promise<User> {
    const user = this.getCurrentUser() || DEMO_USER;
    const token = await this.getSessionToken();

    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          consented: true,
          version: '1.0',
        }),
      });
    } catch (e) {
      console.warn('Remote consent record note:', e);
    }

    const updated: User = {
      ...user,
      consentGiven: true,
      consentDate: new Date().toISOString(),
    };
    this.setCurrentUser(updated);
    return updated;
  },

  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      return !error;
    } catch {
      return Boolean(email && email.includes('@'));
    }
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out note:', e);
    }
    this.setCurrentUser(null);
  },
};
