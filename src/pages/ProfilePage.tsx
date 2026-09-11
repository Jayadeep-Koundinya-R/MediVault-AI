import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  Heart, 
  ShieldCheck, 
  Phone, 
  Users, 
  Plus, 
  LogOut, 
  Edit3, 
  Check, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import ConfirmDialog from '../components/common/ConfirmDialog';
import FamilyMemberModal from '../components/records/FamilyMemberModal';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, familyMembers, updateProfile, logout, addToast } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(user?.name || 'Rahul Sharma');
  const [editDob, setEditDob] = useState(user?.dateOfBirth || '2002-08-14');
  const [editEmail, setEditEmail] = useState(user?.email || 'rahul.sharma@example.com');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editName, editDob, editEmail);
    setIsEditModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-700 to-indigo-800 text-white flex items-center justify-center text-3xl font-bold shadow-md">
              {user?.name.charAt(0) || 'R'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{user?.name || 'Rahul Sharma'}</h1>
                <Badge variant="success">ABDM Verified</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                <span>ABHA: 91-2345-6789-0123</span>
                <span>&bull;</span>
                <span>rahul.sharma@abdm</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  DOB: {user?.dateOfBirth || '14 Aug 2002'} (Age 24)
                </span>
                <span className="flex items-center gap-1 font-semibold text-teal-800">
                  <Heart className="w-3.5 h-3.5 text-red-500" />
                  Blood: B+
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<LogOut className="w-3.5 h-3.5" />}
              onClick={() => setShowLogoutConfirm(true)}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* ABDM Ayushman Bharat Digital Mission Section */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-300">
              National Digital Health Mission
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">Ayushman Bharat Health Account (ABHA)</h3>
          <p className="text-xs text-teal-200 max-w-xl">
            Linked to National Health Authority (NHA) gateway. Enables consent-based clinical document exchange across empanelled hospitals and diagnostic labs in India.
          </p>
        </div>
        <div className="shrink-0">
          <Link
            to="/app/privacy"
            className="text-xs font-bold bg-white text-teal-950 hover:bg-teal-50 px-3.5 py-2 rounded-lg transition-colors inline-block"
          >
            Manage ABDM Consents &rarr;
          </Link>
        </div>
      </div>

      {/* Emergency Contacts */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-teal-700" />
            <h3 className="text-base font-bold text-slate-900">Emergency & Care Team Contacts</h3>
          </div>
          <span className="text-xs text-slate-400">Accessible in medical crises</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Primary Care Physician</span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">Dr. Ananya Rao, MD</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">+91 98765 43210</p>
            </div>
            <a
              href="tel:+919876543210"
              className="text-xs font-semibold text-teal-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50"
            >
              Call
            </a>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emergency Contact (Sister)</span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">Priya Sharma</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">+91 98765 43211</p>
            </div>
            <a
              href="tel:+919876543211"
              className="text-xs font-semibold text-teal-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50"
            >
              Call
            </a>
          </div>
        </div>
      </Card>

      {/* Family Profiles */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Family Health Profiles</h3>
              <p className="text-xs text-slate-500">Manage health records for your dependents</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsFamilyModalOpen(true)}
          >
            Add Member
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Self */}
          <div className="p-4 rounded-xl border-2 border-teal-600 bg-teal-50/40 relative">
            <div className="absolute top-3 right-3">
              <Badge variant="success">Active</Badge>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm mb-2">
              RS
            </div>
            <h4 className="text-sm font-bold text-slate-900">Rahul Sharma</h4>
            <span className="text-xs text-slate-500">Self (Primary Account)</span>
          </div>

          {/* Family members */}
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm mb-2">
                  {member.name.charAt(0)}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{member.name}</h4>
                <span className="text-xs text-slate-500">{member.relationship} &bull; Born {member.dateOfBirth ? member.dateOfBirth.slice(0, 4) : 'N/A'}</span>
              </div>
              <button
                onClick={() => addToast(`Switched profile view to ${member.name}`, 'info')}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 text-left"
              >
                Switch Profile &rarr;
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Patient Information"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Legal Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Input
            label="Date of Birth"
            type="date"
            value={editDob}
            onChange={(e) => setEditDob(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Family Member Modal */}
      <FamilyMemberModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
      />

      {/* Logout Confirm Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out of MediVault?"
        message="Are you sure you want to sign out? Your demo session data will remain saved on your local device."
        confirmText="Yes, Sign Out"
        cancelText="Stay Signed In"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default ProfilePage;
