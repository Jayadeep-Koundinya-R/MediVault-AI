import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { doctorService } from '../../services/doctorService';
import { DoctorProfile } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Stethoscope, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const { addToast } = useApp();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('1');
  const [bio, setBio] = useState('');

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const p = await doctorService.getDoctorProfile();
      setProfile(p);
      setFullName(p.fullName);
      setPhone(p.phone || '');
      setSpecialization(p.specialization);
      setClinicName(p.clinicName);
      setClinicAddress(p.clinicAddress || '');
      setYearsOfExperience(String(p.yearsOfExperience || 1));
      setBio(p.bio || '');
    } catch (e) {
      console.warn('Profile load note:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await doctorService.updateDoctorProfile({
        fullName,
        phone,
        specialization,
        clinicName,
        clinicAddress,
        yearsOfExperience: Number(yearsOfExperience) || 1,
        bio,
      });
      setProfile(updated);
      addToast('Doctor profile updated successfully');
    } catch (err: any) {
      addToast(err?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  const isVerified = profile?.verificationStatus === 'verified';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-clinical flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-display font-extrabold text-2xl shadow-clinical-sm">
            <Stethoscope size={28} />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xl text-slate-900">
              {profile?.fullName}
            </h1>
            <p className="text-xs text-slate-500">
              Registration: {profile?.medicalRegistrationNumber} · {profile?.registrationCountry}
            </p>
          </div>
        </div>

        <div>
          {isVerified ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Verified Doctor ✓</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold">
              <Clock size={14} className="text-amber-600" />
              <span>Verification Pending</span>
            </span>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-clinical">
        <h2 className="font-display font-bold text-base text-slate-900 mb-4">
          Professional Clinical Information
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name (with Dr. prefix)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Clinical Specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
            />
            <Input
              label="Years of Experience"
              type="number"
              min="1"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Clinic / Hospital Name"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              required
            />
            <Input
              label="Registration Number (Read-only)"
              value={profile?.medicalRegistrationNumber || ''}
              disabled
            />
          </div>

          <Input
            label="Clinic Address"
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Bio &amp; Clinical Focus
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6"
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
