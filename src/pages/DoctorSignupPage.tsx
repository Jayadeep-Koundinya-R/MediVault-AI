import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Stethoscope, ShieldCheck, ArrowRight } from 'lucide-react';

export const DoctorSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signupDoctor } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [medicalRegistrationNumber, setMedicalRegistrationNumber] = useState('');
  const [registrationCountry, setRegistrationCountry] = useState('India');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('5');
  const [bio, setBio] = useState('');
  const [confirmedAccurate, setConfirmedAccurate] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!confirmedAccurate) {
      setError('Please confirm that your professional medical information is accurate.');
      return;
    }

    setIsLoading(true);

    try {
      await signupDoctor({
        fullName: fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`,
        email,
        password,
        phone,
        specialization,
        medicalRegistrationNumber,
        registrationCountry,
        clinicName,
        clinicAddress,
        yearsOfExperience: Number(yearsOfExperience) || 1,
        bio,
      });

      navigate('/doctor/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to create doctor account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-700/50 p-6 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mx-auto mb-3 shadow-clinical-md">
            <Stethoscope size={26} className="text-white" />
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Create your doctor account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register your clinical profile to connect with patients and review health summaries.
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name (with Dr. prefix)"
              placeholder="Dr. Rajesh Varma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Doctor Email Address"
              type="email"
              placeholder="r.varma@hospital.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password (min 8 chars)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Specialization
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Nephrology">Nephrology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Medical Registration Number"
              placeholder="MCI-2015-88491"
              value={medicalRegistrationNumber}
              onChange={(e) => setMedicalRegistrationNumber(e.target.value)}
              required
            />
            <Input
              label="Registration Country"
              placeholder="India"
              value={registrationCountry}
              onChange={(e) => setRegistrationCountry(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Clinic / Hospital Name"
              placeholder="Apollo Health City"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              required
            />
            <Input
              label="Years of Experience"
              type="number"
              min="1"
              max="60"
              placeholder="8"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              required
            />
          </div>

          <Input
            label="Clinic / Practice Address"
            placeholder="Bannerghatta Road, Bengaluru, Karnataka"
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Bio &amp; Clinical Focus
            </label>
            <textarea
              rows={3}
              placeholder="Brief professional background, areas of clinical focus, and patient approach..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          {/* Professional Verification Section */}
          <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 text-xs text-cyan-950 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-cyan-900">
              <ShieldCheck size={16} className="text-cyan-700" />
              <span>Professional Verification</span>
            </div>
            <p className="text-[11px] text-cyan-800 leading-relaxed">
              Your professional information helps establish your doctor profile. New doctor accounts start with pending verification status until verified.
            </p>
            <label className="flex items-start space-x-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedAccurate}
                onChange={(e) => setConfirmedAccurate(e.target.checked)}
                className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 h-4 w-4"
              />
              <span className="text-xs font-semibold text-slate-800">
                I confirm that the professional information provided is accurate.
              </span>
            </label>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
            >
              Create Doctor Account
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have a doctor account?{' '}
          <Link to="/doctor/login" className="font-bold text-cyan-700 hover:underline">
            Doctor Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
