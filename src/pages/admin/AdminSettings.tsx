import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Badge } from '../../components/ui/Badge';
import { useElection } from '../../context/ElectionContext';
import { settingsService } from '../../services/settingsService';
import { SaveIcon, EyeIcon, TrendingUpIcon } from 'lucide-react';

export function AdminSettings() {
  const {
    elections,
    countries
  } = useElection();
  const [settings, setSettings] = useState({
    platformName: 'African Elections',
    supportEmail: 'support@elections.com',
    enableComments: true,
    enableSharing: true,
    enableNotifications: true,
    autoApproveComments: false
  });
  const [featuredElectionId, setFeaturedElectionId] = useState<string>('auto');
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const dbSettings = await settingsService.getAll();
        
        // Set featured election ID
        const featuredId = dbSettings.featured_election_id || 'auto';
        setFeaturedElectionId(featuredId);
        
        // Set banner enabled
        const bannerEnabledValue = dbSettings.banner_enabled !== 'false';
        setBannerEnabled(bannerEnabledValue);
        
        // Set other settings
        if (dbSettings.platform_name) {
          setSettings(prev => ({ ...prev, platformName: dbSettings.platform_name }));
        }
        if (dbSettings.support_email) {
          setSettings(prev => ({ ...prev, supportEmail: dbSettings.support_email }));
        }
        if (dbSettings.enable_comments !== undefined) {
          setSettings(prev => ({ ...prev, enableComments: dbSettings.enable_comments === 'true' }));
        }
        if (dbSettings.enable_sharing !== undefined) {
          setSettings(prev => ({ ...prev, enableSharing: dbSettings.enable_sharing === 'true' }));
        }
        if (dbSettings.enable_notifications !== undefined) {
          setSettings(prev => ({ ...prev, enableNotifications: dbSettings.enable_notifications === 'true' }));
        }
        if (dbSettings.auto_approve_comments !== undefined) {
          setSettings(prev => ({ ...prev, autoApproveComments: dbSettings.auto_approve_comments === 'true' }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save featured election to database
      const featuredIdToSave = featuredElectionId === 'auto' ? null : featuredElectionId;
      if (featuredIdToSave) {
        await settingsService.update('featured_election_id', featuredIdToSave);
      } else {
        // If auto, remove the setting or set to empty
        await settingsService.update('featured_election_id', '');
      }
      
      // Save banner enabled
      await settingsService.update('banner_enabled', bannerEnabled ? 'true' : 'false');
      
      // Save other settings
      await settingsService.update('platform_name', settings.platformName);
      await settingsService.update('support_email', settings.supportEmail);
      await settingsService.update('enable_comments', settings.enableComments ? 'true' : 'false');
      await settingsService.update('enable_sharing', settings.enableSharing ? 'true' : 'false');
      await settingsService.update('enable_notifications', settings.enableNotifications ? 'true' : 'false');
      await settingsService.update('auto_approve_comments', settings.autoApproveComments ? 'true' : 'false');
      
      alert('Settings saved successfully!');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      alert(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  const electionOptions = [{
    value: 'auto',
    label: 'Auto (Nearest Upcoming Election)'
  }, ...elections.map(e => {
    const country = countries.find(c => c.id === e.countryId);
    return {
      value: e.id,
      label: `${country?.flag} ${country?.name} - ${e.description}`
    };
  })];
  const selectedElection = featuredElectionId === 'auto' ? elections.filter(e => e.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] : elections.find(e => e.id === featuredElectionId);
  const selectedCountry = selectedElection ? countries.find(c => c.id === selectedElection.countryId) : null;
  return <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Platform Settings
          </h1>
          <p className="text-gray-600">Configure your election platform</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUpIcon className="w-6 h-6 text-african-green" />
            <h3 className="text-xl font-display font-bold text-gray-900">
              Featured Election Banner
            </h3>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Control which election appears in the featured banner on the home
            page
          </p>

          <div className="space-y-4">
            <Checkbox label="Enable Featured Banner" checked={bannerEnabled} onChange={e => setBannerEnabled(e.target.checked)} />

            {bannerEnabled && <>
                <Select label="Featured Election" value={featuredElectionId} onChange={e => setFeaturedElectionId(e.target.value)} options={electionOptions} />

                {selectedElection && selectedCountry && <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="info">Preview</Badge>
                      <span className="text-sm text-gray-600">
                        This election will be featured on the home page
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{selectedCountry.flag}</span>
                      <div>
                        <p className="font-display font-bold text-gray-900">
                          {selectedCountry.name} Election 2025
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedElection.description}
                        </p>
                      </div>
                    </div>
                  </div>}

                <Button variant="secondary" size="sm" onClick={() => window.open('/', '_blank')} className="w-full sm:w-auto">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Preview on Home Page
                </Button>
              </>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-display font-bold text-gray-900 mb-4">
            General Settings
          </h3>
          <div className="space-y-4">
            <Input label="Platform Name" value={settings.platformName} onChange={e => setSettings({
            ...settings,
            platformName: e.target.value
          })} />
            <Input label="Support Email" type="email" value={settings.supportEmail} onChange={e => setSettings({
            ...settings,
            supportEmail: e.target.value
          })} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-display font-bold text-gray-900 mb-4">
            Feature Toggles
          </h3>
          <div className="space-y-4">
            <Checkbox label="Enable Comments" checked={settings.enableComments} onChange={e => setSettings({
            ...settings,
            enableComments: e.target.checked
          })} />
            <Checkbox label="Enable Social Sharing" checked={settings.enableSharing} onChange={e => setSettings({
            ...settings,
            enableSharing: e.target.checked
          })} />
            <Checkbox label="Enable Push Notifications" checked={settings.enableNotifications} onChange={e => setSettings({
            ...settings,
            enableNotifications: e.target.checked
          })} />
            <Checkbox label="Auto-approve Comments" checked={settings.autoApproveComments} onChange={e => setSettings({
            ...settings,
            autoApproveComments: e.target.checked
          })} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-display font-bold text-gray-900 mb-4">
            Theme Colors
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input type="color" defaultValue="#10B981" className="w-12 h-12 rounded-lg cursor-pointer" />
                <span className="text-sm text-gray-600">#10B981</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input type="color" defaultValue="#3B82F6" className="w-12 h-12 rounded-lg cursor-pointer" />
                <span className="text-sm text-gray-600">#3B82F6</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave}>
            <SaveIcon className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>;
}