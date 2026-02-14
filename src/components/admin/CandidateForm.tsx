import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { FileUpload } from '../ui/FileUpload';
import { Button } from '../ui/Button';
import { Candidate, Election } from '../../utils/types';

interface CandidateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (candidate: Partial<Candidate>) => void;
  candidate?: Candidate;
  elections: Election[];
}

const CANDIDATE_COLORS = [{
  value: '#10B981',
  label: 'Green'
}, {
  value: '#3B82F6',
  label: 'Blue'
}, {
  value: '#F59E0B',
  label: 'Yellow'
}, {
  value: '#EF4444',
  label: 'Red'
}, {
  value: '#8B5CF6',
  label: 'Purple'
}, {
  value: '#EC4899',
  label: 'Pink'
}];

export function CandidateForm({
  isOpen,
  onClose,
  onSubmit,
  candidate,
  elections
}: CandidateFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    bio: '',
    electionId: '',
    color: '#10B981',
    image: ''
  });

  // Update form data when candidate changes (for editing)
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: candidate?.name || '',
        party: candidate?.party || '',
        bio: candidate?.bio || '',
        electionId: candidate?.electionId || elections[0]?.id || '',
        color: candidate?.color || '#10B981',
        image: candidate?.image || ''
      });
    }
  }, [candidate, elections, isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure all required fields are filled
    if (!formData.name.trim() || !formData.party.trim() || !formData.electionId) {
      alert('Please fill in all required fields');
      return;
    }

    // Prepare submission data
    const submitData: any = {
      id: candidate?.id,
      electionId: formData.electionId,
      name: formData.name.trim(),
      party: formData.party.trim(),
      bio: formData.bio.trim(),
      color: formData.color,
    };

    // Only include image if:
    // 1. It's a new candidate (no existing image), OR
    // 2. The image has actually changed from the existing one
    if (!candidate || (formData.image && formData.image.trim() !== (candidate.image || ''))) {
      submitData.image = formData.image && formData.image.trim() ? formData.image.trim() : null;
    }
    // If image hasn't changed, don't send it at all (backend will keep existing)

    onSubmit(submitData);
  };
  const handleImageChange = (_file: File | null, preview: string | null) => {
    setFormData({
      ...formData,
      image: preview || ''
    });
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={candidate ? 'Edit Candidate' : 'Add Candidate'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Election" value={formData.electionId} onChange={e => setFormData({
        ...formData,
        electionId: e.target.value
      })} options={elections.map(e => ({
        value: e.id,
        label: e.description
      }))} />

        <Input label="Candidate Name" value={formData.name} onChange={e => setFormData({
        ...formData,
        name: e.target.value
      })} placeholder="e.g., Adebayo Okonkwo" required />

        <Input label="Party" value={formData.party} onChange={e => setFormData({
        ...formData,
        party: e.target.value
      })} placeholder="e.g., Progressive Alliance" required />

        <Textarea label="Bio" value={formData.bio} onChange={e => setFormData({
        ...formData,
        bio: e.target.value
      })} placeholder="Brief biography..." rows={3} required />

        <Select label="Theme Color" value={formData.color} onChange={e => setFormData({
        ...formData,
        color: e.target.value
      })} options={CANDIDATE_COLORS} />

        <FileUpload label="Candidate Photo" value={formData.image} onChange={handleImageChange} />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {candidate ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>;
}