import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useApp } from '../../context/AppContext';
import { Users } from 'lucide-react';

interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilyMemberModal: React.FC<FamilyMemberModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addFamilyMember } = useApp();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('1980-01-01');
  const [relationship, setRelationship] = useState('Parent');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addFamilyMember({
      name: name.trim(),
      dateOfBirth: dob,
      relationship
    });
    setName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Family Member"
      subtitle="Manage digital health records for your family under one consolidated account."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Legal Name"
          placeholder="e.g. Priya Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Date of Birth"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
        />

        <Select
          label="Relationship"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          options={[
            { value: 'Parent', label: 'Parent' },
            { value: 'Spouse', label: 'Spouse' },
            { value: 'Child', label: 'Child' },
            { value: 'Sibling', label: 'Sibling' },
            { value: 'Other', label: 'Other Family Member' }
          ]}
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full" leftIcon={<Users size={16} />}>
            Add Family Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FamilyMemberModal;
