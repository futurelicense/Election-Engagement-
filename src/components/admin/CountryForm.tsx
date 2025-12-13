import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Country, Election } from '../../utils/types';
import { ELECTION_TYPES } from '../../utils/constants';

interface CountryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (country: Partial<Country>, election: Partial<Election>) => void;
  country?: Country;
  election?: Election;
}

export function CountryForm({
  isOpen,
  onClose,
  onSubmit,
  country,
  election
}: CountryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    flag: '',
    code: '',
    electionType: 'Presidential',
    electionDate: '',
    electionDescription: ''
  });

  // Update form data when country/election changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: country?.name || '',
        flag: country?.flag || '',
        code: country?.code || '',
        electionType: election?.type || 'Presidential',
        electionDate: election?.date || '',
        electionDescription: election?.description || ''
      });
    }
  }, [country, election, isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure all required fields are filled
    if (!formData.name.trim() || !formData.flag.trim() || !formData.code.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      id: country?.id,
      name: formData.name.trim(),
      flag: formData.flag.trim(),
      code: formData.code.trim().toUpperCase()
    }, {
      id: election?.id,
      type: formData.electionType as any,
      date: formData.electionDate,
      description: formData.electionDescription.trim(),
      status: 'upcoming'
    });
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={country ? 'Edit Country' : 'Add Country'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Country Name" value={formData.name} onChange={e => setFormData({
        ...formData,
        name: e.target.value
      })} placeholder="e.g., Nigeria" required />

        <Input label="Flag Emoji" value={formData.flag} onChange={e => setFormData({
        ...formData,
        flag: e.target.value
      })} placeholder="🇳🇬" required />

        <Input label="Country Code" value={formData.code} onChange={e => setFormData({
        ...formData,
        code: e.target.value
      })} placeholder="NG" maxLength={2} required />

        <Select label="Election Type" value={formData.electionType} onChange={e => setFormData({
        ...formData,
        electionType: e.target.value
      })} options={ELECTION_TYPES.map(type => ({
        value: type,
        label: type
      }))} />

        <Input label="Election Date" type="date" value={formData.electionDate} onChange={e => setFormData({
        ...formData,
        electionDate: e.target.value
      })} required />

        <Input label="Election Description" value={formData.electionDescription} onChange={e => setFormData({
        ...formData,
        electionDescription: e.target.value
      })} placeholder="e.g., Nigerian Presidential Election 2025" required />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {country ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>;
}