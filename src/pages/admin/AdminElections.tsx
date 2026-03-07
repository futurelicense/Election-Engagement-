import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { ElectionForm } from '../../components/admin/ElectionForm';
import { useAuth } from '../../context/AuthContext';
import { useElection } from '../../context/ElectionContext';
import { electionService } from '../../services/electionService';
import { Election } from '../../utils/types';
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-react';

export function AdminElections() {
  const { user } = useAuth();
  const { countries, elections, refresh } = useElection();
  if (!user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  const [showForm, setShowForm] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | undefined>();
  const [loading, setLoading] = useState(false);

  const handleEdit = (election: Election) => {
    setSelectedElection(election);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedElection(undefined);
    setShowForm(true);
  };

  const handleSubmit = async (election: Partial<Election>) => {
    try {
      setLoading(true);
      if (selectedElection) {
        await electionService.update(selectedElection.id, {
          countryId: election.countryId,
          type: election.type!,
          date: election.date!,
          status: election.status,
          description: election.description!,
        });
      } else {
        if (!election.countryId || !election.type || !election.date || !election.description) {
          throw new Error('Country, type, date, and description are required');
        }
        await electionService.create({
          countryId: election.countryId,
          type: election.type,
          date: election.date,
          status: election.status || 'upcoming',
          description: election.description,
        });
      }
      await refresh();
      setShowForm(false);
      setSelectedElection(undefined);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save election';
      console.error('Failed to save election:', error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (electionId: string) => {
    if (!confirm('Are you sure you want to delete this election? Candidates and votes linked to it may be affected.')) return;
    try {
      setLoading(true);
      await electionService.delete(electionId);
      await refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete election';
      console.error('Failed to delete election:', error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const getCountryName = (countryId: string) => {
    const c = countries.find((x) => x.id === countryId);
    return c ? `${c.flag} ${c.name}` : countryId;
  };

  const columns = [
    {
      key: 'country',
      header: 'Country',
      width: '180px',
      render: (election: Election) => getCountryName(election.countryId),
    },
    {
      key: 'type',
      header: 'Type',
      width: '140px',
      render: (election: Election) => <Badge variant="info">{election.type}</Badge>,
    },
    {
      key: 'date',
      header: 'Date',
      width: '120px',
      render: (election: Election) => new Date(election.date).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (election: Election) => (
        <Badge variant={election.status === 'ongoing' ? 'success' : election.status === 'completed' ? 'info' : 'info'}>
          {election.status}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (election: Election) => (
        <span className="line-clamp-2 text-sm text-gray-700">{election.description}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (election: Election) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => handleEdit(election)} disabled={loading}>
            <EditIcon className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(election.id)} disabled={loading}>
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout requireFullAdmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Manage Elections</h1>
            <p className="text-gray-600">Create and edit elections per country</p>
          </div>
          <Button variant="primary" onClick={handleAdd} disabled={loading}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Election
          </Button>
        </div>

        <Card className="p-6">
          {loading && elections.length === 0 ? (
            <div className="text-center py-8">Loading...</div>
          ) : elections.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No elections yet.</p>
              <Button variant="primary" className="mt-4" onClick={handleAdd}>
                Add first election
              </Button>
            </div>
          ) : (
            <Table data={elections} columns={columns} />
          )}
        </Card>
      </div>

      <ElectionForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedElection(undefined);
        }}
        onSubmit={handleSubmit}
        election={selectedElection}
        countries={countries}
      />
    </AdminLayout>
  );
}
