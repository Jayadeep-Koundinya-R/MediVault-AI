import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { familyService } from '../services/familyService';
import { FamilyRelationship } from '../types';
import { 
  Users, 
  UserPlus, 
  Heart, 
  ArrowRight, 
  Check, 
  X, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  Lock,
  Mail
} from 'lucide-react';

export const FamilyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addToast } = useApp();

  const [familyMembers, setFamilyMembers] = useState<FamilyRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Member Form
  const [addMode, setAddMode] = useState<'invite' | 'create'>('create');
  const [name, setName] = useState('');
  const [relationshipType, setRelationshipType] = useState('Mother');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFamily = async () => {
    setIsLoading(true);
    try {
      const res = await familyService.getFamilyMembers();
      setFamilyMembers(res);
    } catch (e) {
      console.warn('Load family note:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFamily();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await familyService.addFamilyMember({
        name,
        relationshipType,
        email: addMode === 'invite' ? email : undefined,
      });
      addToast(addMode === 'invite' ? 'Family invitation sent!' : 'Family profile created!');
      setShowAddModal(false);
      setName('');
      setEmail('');
      await loadFamily();
    } catch (err: any) {
      addToast(err?.message || 'Failed to add family member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptInvite = async (id: string) => {
    try {
      await familyService.acceptFamilyInvitation(id);
      addToast('Family invitation accepted');
      await loadFamily();
    } catch (err: any) {
      addToast(err?.message || 'Failed to accept invitation', 'error');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Remove this family member? Shared records will immediately become inaccessible.')) return;
    try {
      await familyService.revokeFamilyAccess(id);
      addToast('Family access revoked');
      await loadFamily();
    } catch (err: any) {
      addToast(err?.message || 'Failed to revoke access', 'error');
    }
  };

  const incomingInvites = familyMembers.filter(
    (f) => f.memberUserId === user?.id && f.status === 'pending'
  );
  const activeMembers = familyMembers.filter((f) => f.status === 'accepted');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">
            My Family
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Care for loved ones by connecting health records with clear, consent-driven privacy boundaries.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-clinical-sm"
        >
          <UserPlus size={15} />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Incoming Invitations (Prompt Section 54) */}
      {incomingInvites.length > 0 && (
        <div className="bg-cyan-50 rounded-2xl border border-cyan-200 p-5 space-y-3 shadow-clinical-sm">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-900">
            <Mail size={16} className="text-cyan-700" />
            <span>Family Connection Invitations ({incomingInvites.length})</span>
          </div>

          <div className="divide-y divide-cyan-100">
            {incomingInvites.map((inv) => (
              <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {inv.memberName} wants to connect as your {inv.relationshipType}.
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Accepting allows you to choose what health data to share with each other.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAcceptInvite(inv.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-colors shadow-clinical-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRevoke(inv.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Family Members Grid (Prompt Section 50, 56) */}
      {activeMembers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center shadow-clinical">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto mb-3">
            <Heart size={30} />
          </div>
          <h2 className="font-display font-bold text-base text-slate-900 mb-1">
            Add your first family member
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
            Consolidate your parents’, spouse’s, or children’s medical history while giving each adult full control over their health privacy.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs inline-flex items-center space-x-2 shadow-clinical-sm transition-colors"
          >
            <UserPlus size={15} />
            <span>Add Family Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMembers.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-clinical-sm flex flex-col justify-between hover:border-cyan-400 transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-900 font-display font-extrabold text-lg flex items-center justify-center">
                      {m.memberName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{m.memberName}</h3>
                      <span className="text-xs font-semibold text-cyan-700">{m.relationshipType}</span>
                    </div>
                  </div>

                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Connected
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1 mb-4">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Recent health updates:</span>
                    <span className="font-medium text-slate-800">
                      {m.lastUpdateDate
                        ? new Date(m.lastUpdateDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Shared safety flags:</span>
                    <span className="font-bold text-amber-700">{m.sharedFlagsCount || 0}</span>
                  </div>
                </div>

                {/* Permissions Breakdown */}
                <div className="mb-4">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Shared Permissions:
                  </span>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {m.permissions?.shareSummary && (
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                        Summary
                      </span>
                    )}
                    {m.permissions?.shareLabs && (
                      <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md font-medium border border-blue-200">
                        Labs
                      </span>
                    )}
                    {m.permissions?.sharePrescriptions && (
                      <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md font-medium border border-indigo-200">
                        Prescriptions
                      </span>
                    )}
                    {m.permissions?.shareVaccinations && (
                      <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md font-medium border border-purple-200">
                        Vaccinations
                      </span>
                    )}
                    {!m.permissions?.shareSummary && !m.permissions?.shareLabs && !m.permissions?.sharePrescriptions && (
                      <span className="text-slate-400 italic">No records shared yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleRevoke(m.id)}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Revoke Access
                </button>

                <button
                  onClick={() => navigate(`/app/family/${m.id}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-clinical-sm"
                >
                  <span>View Records</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Family Member Modal (Prompt Section 51) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div>
              <h3 className="font-display font-extrabold text-xl text-slate-900">
                Add Family Member
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Maintain family health history with explicit consent.
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAddMode('create')}
                className={`py-1.5 rounded-lg transition-all ${
                  addMode === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Create Family Profile
              </button>
              <button
                type="button"
                onClick={() => setAddMode('invite')}
                className={`py-1.5 rounded-lg transition-all ${
                  addMode === 'invite' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Invite by Email
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Family Member Name
                </label>
                <input
                  type="text"
                  placeholder="Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship
                </label>
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              {addMode === 'invite' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    MediVault Account Email
                  </label>
                  <input
                    type="email"
                    placeholder="priya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    They will receive a request and choose what records to share.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors shadow-clinical-sm"
                >
                  {isSubmitting ? 'Adding...' : addMode === 'invite' ? 'Send Invitation' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
