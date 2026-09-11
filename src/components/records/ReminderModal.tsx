import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useApp } from '../../context/AppContext';
import { Bell } from 'lucide-react';

export interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  drugName?: string;
  dosage?: string;
  medicineName?: string;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  drugName,
  dosage,
  medicineName
}) => {
  const effectiveDrugName = drugName || medicineName || 'Metformin';
  const effectiveDosage = dosage || '500 mg';
  const { addToast } = useApp();
  const [frequency, setFrequency] = useState('twice');
  const [time, setTime] = useState('08:30');
  const [startDate, setStartDate] = useState('2026-08-18');
  const [endDate, setEndDate] = useState('2026-09-18');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(`Reminder set for ${effectiveDrugName} ${effectiveDosage} at ${time}`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Set Reminder: ${effectiveDrugName}`}
      subtitle={`Configure dosage notification alarms for ${effectiveDosage}.`}
      maxWidth="sm"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <Select
          label="Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          options={[
            { value: 'once', label: 'Once daily' },
            { value: 'twice', label: 'Twice daily' },
            { value: 'thrice', label: 'Three times daily' },
            { value: 'weekly', label: 'Once weekly' }
          ]}
        />

        <Input
          label="Reminder Time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full" leftIcon={<Bell size={16} />}>
            Set Reminder
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReminderModal;
