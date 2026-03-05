import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Election } from '../../utils/types';
import { Country } from '../../utils/types';
import { ELECTION_TYPES } from '../../utils/constants';

interface ElectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (election: Partial<Election>) => void;
  election?: Election;
  countries: Country[];
}

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

export function ElectionForm({
  isOpen,
  onClose,
  onSubmit,
  election,
  countries,
}: ElectionFormProps) {
  const [formData, setFormData] = useState({
    countryId: '',
    type: 'Presidential' as Election['type'],
    date: '',
    status: 'upcoming' as Election['status'],
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        countryId: election?.countryId || countries[0]?.id || '',
        type: election?.type || 'Presidential',
        date: election?.date ? election.date.slice(0, 10) : '',
        status: election?.status || 'upcoming',
        description: election?.description || '',
      });
    }
  }, [election, countries, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.countryId || !formData.type || !formData.date.trim() || !formData.description.trim()) {
      alert('Please fill in country, type, date, and description');
      return;
    }
    onSubmit({
      id: election?.id,
      countryId: formData.countryId,
      type: formData.type,
      date: formData.date,
      status: formData.status,
      description: formData.description.trim(),
    });
  };

  const typeOptions = ELECTION_TYPES.map((t) => ({ value: t, label: t }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={election ? 'Edit Election' : 'Add Election'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Select
          label="Country"
          options={[{ value: '', label: 'Select country' }, ...countries.map((c) => ({ value: c.id, label: `${c.flag} ${c.name}` }))]}
          value={formData.countryId}
          onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
          required
        />
        <Select
          label="Election Type"
          options={typeOptions}
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Election['type'] })}
          required
        />
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Election['status'] })}
        />
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the election"
          required
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary">
            {election ? 'Update Election' : 'Create Election'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
