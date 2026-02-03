import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { CandidateForm } from '../../components/admin/CandidateForm';
import { useElection } from '../../context/ElectionContext';
import { candidateService } from '../../services/candidateService';
import { Candidate } from '../../utils/types';
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-react';

export function AdminCandidates() {
  const { candidates, elections, refresh } = useElection();
  const [showForm, setShowForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>();
  const [loading, setLoading] = useState(false);

  const handleEdit = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedCandidate(undefined);
    setShowForm(true);
  };

  const handleSubmit = async (candidate: Partial<Candidate>) => {
    try {
      setLoading(true);
      if (selectedCandidate) {
        // Ensure all required fields are included
        const updateData: Partial<Candidate> = {
          electionId: candidate.electionId || selectedCandidate.electionId,
          name: candidate.name || selectedCandidate.name,
          party: candidate.party || selectedCandidate.party,
          image: candidate.image !== undefined ? candidate.image : selectedCandidate.image,
          bio: candidate.bio !== undefined ? candidate.bio : selectedCandidate.bio,
          color: candidate.color || selectedCandidate.color,
        };
        console.log('Updating candidate:', selectedCandidate.id, updateData);
        await candidateService.update(selectedCandidate.id, updateData);
      } else {
        if (!candidate.electionId || !candidate.name || !candidate.party || !candidate.color) {
          throw new Error('Election ID, name, party, and color are required');
        }
        await candidateService.create(candidate as Omit<Candidate, 'id'>);
      }
      await refresh();
      setShowForm(false);
      setSelectedCandidate(undefined);
    } catch (error: any) {
      console.error('Failed to save candidate:', error);
      alert(error.message || 'Failed to save candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (candidateId: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    try {
      setLoading(true);
      await candidateService.delete(candidateId);
      await refresh();
    } catch (error: any) {
      console.error('Failed to delete candidate:', error);
      alert(error.message || 'Failed to delete candidate');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'image',
      header: 'Photo',
      width: '80px',
      render: (candidate: Candidate) => (
        <img
          src={candidate.image || '/placeholder.png'}
          alt={candidate.name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ),
    },
    {
      key: 'name',
      header: 'Name',
      width: '200px',
    },
    {
      key: 'party',
      header: 'Party',
    },
    {
      key: 'election',
      header: 'Election',
      render: (candidate: Candidate) => {
        const election = elections.find(e => e.id === candidate.electionId);
        return election ? (
          <Badge variant="info">{election.description}</Badge>
        ) : (
          '-'
        );
      },
    },
    {
      key: 'color',
      header: 'Color',
      width: '100px',
      render: (candidate: Candidate) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full border-2 border-gray-200"
            style={{ backgroundColor: candidate.color }}
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (candidate: Candidate) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(candidate)}
            disabled={loading}
          >
            <EditIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(candidate.id)}
            disabled={loading}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Manage Candidates
            </h1>
            <p className="text-gray-600">Add and manage election candidates</p>
          </div>
          <Button variant="primary" onClick={handleAdd} disabled={loading}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table data={candidates} columns={columns} />
          )}
        </Card>
      </div>

      <CandidateForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        candidate={selectedCandidate}
        elections={elections}
      />
    </AdminLayout>
  );
}
