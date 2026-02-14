import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { CountryForm } from '../../components/admin/CountryForm';
import { useElection } from '../../context/ElectionContext';
import { countryService } from '../../services/countryService';
import { Country, Election } from '../../utils/types';
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-react';

export function AdminCountries() {
  const { countries, elections, getElectionByCountry, refresh } = useElection();
  const [showForm, setShowForm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
  const [loading, setLoading] = useState(false);

  const handleEdit = (country: Country) => {
    setSelectedCountry(country);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedCountry(undefined);
    setShowForm(true);
  };

  const handleSubmit = async (country: Partial<Country>, election?: Partial<Election>) => {
    try {
      setLoading(true);
      if (selectedCountry) {
        // Always send the actual form values, not fallback values
        // Backend will handle retaining existing if needed
        const updateData: Partial<Country> = {
          name: country.name !== undefined ? country.name : selectedCountry.name,
          flag: country.flag !== undefined ? country.flag : selectedCountry.flag,
          code: country.code !== undefined ? country.code : selectedCountry.code,
        };
        console.log('Updating country:', selectedCountry.id, updateData);
        console.log('Original country data:', selectedCountry);
        console.log('Form country data:', country);
        await countryService.update(selectedCountry.id, updateData);
        if (election && election.id) {
          // Update election if provided
          // This would require electionService
        }
      } else {
        if (!country.name || !country.flag || !country.code) {
          throw new Error('Name, flag, and code are required');
        }
        const newCountry = await countryService.create(country as Omit<Country, 'id'>);
        if (election) {
          // Create election for new country
          // This would require electionService
        }
      }
      await refresh();
      setShowForm(false);
      setSelectedCountry(undefined);
    } catch (error: any) {
      console.error('Failed to save country:', error);
      alert(error.message || 'Failed to save country');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (countryId: string) => {
    if (!confirm('Are you sure you want to delete this country?')) return;

    try {
      setLoading(true);
      await countryService.delete(countryId);
      await refresh();
    } catch (error: any) {
      console.error('Failed to delete country:', error);
      alert(error.message || 'Failed to delete country');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'flag',
      header: 'Flag',
      width: '80px',
      render: (country: Country) => <span className="text-3xl">{country.flag}</span>,
    },
    {
      key: 'name',
      header: 'Country',
      width: '200px',
    },
    {
      key: 'code',
      header: 'Code',
      width: '100px',
    },
    {
      key: 'election',
      header: 'Next Election',
      render: (country: Country) => {
        const election = getElectionByCountry(country.id);
        return election ? (
          <div>
            <Badge variant="info">{election.type}</Badge>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(election.date).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <span className="text-sm text-gray-500">No election scheduled</span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (country: Country) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(country)}
            disabled={loading}
          >
            <EditIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(country.id)}
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
              Manage Countries
            </h1>
            <p className="text-gray-600">Add and manage countries with upcoming elections</p>
          </div>
          <Button variant="primary" onClick={handleAdd} disabled={loading}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Country
          </Button>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table data={countries} columns={columns} />
          )}
        </Card>
      </div>

      <CountryForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedCountry(undefined);
        }}
        onSubmit={handleSubmit}
        country={selectedCountry}
        election={selectedCountry ? getElectionByCountry(selectedCountry.id) : undefined}
      />
    </AdminLayout>
  );
}
