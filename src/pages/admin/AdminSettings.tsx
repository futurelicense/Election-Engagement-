import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useElection } from '../../context/ElectionContext';
import { settingsService } from '../../services/settingsService';
import { SaveIcon, EyeIcon, TrendingUpIcon, PaletteIcon, MoonIcon, SunIcon, TypeIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Theme, THEME_PRESETS, FONT_OPTIONS, DEFAULT_THEME } from '../../utils/theme';

export function AdminSettings() {
  const { user } = useAuth();
  const {
    elections,
    countries
  } = useElection();
  if (!user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  const [settings, setSettings] = useState({
    platformName: 'Nigeria Election',
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
  const { theme: activeTheme, setTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState<Theme>(activeTheme);

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
        if (dbSettings.theme) {
          try {
            const saved = JSON.parse(dbSettings.theme) as Partial<Theme>;
            setLocalTheme({ ...DEFAULT_THEME, ...saved });
          } catch {}
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
      await settingsService.update('theme', JSON.stringify(localTheme));
      setTheme(localTheme);

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
  return <AdminLayout requireFullAdmin>
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

        {/* ── Theme & Appearance ── */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <PaletteIcon className="w-6 h-6 text-african-green" />
            <h3 className="text-xl font-display font-bold text-gray-900">Theme & Appearance</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">Customize colors, fonts, and dark mode for the entire site.</p>

          {/* Preset themes */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Preset Themes</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEME_PRESETS.map((preset) => {
                const isActive =
                  localTheme.primary === preset.theme.primary &&
                  localTheme.secondary === preset.theme.secondary &&
                  localTheme.darkMode === preset.theme.darkMode;
                return (
                  <button
                    key={preset.name}
                    onClick={() => setLocalTheme(preset.theme)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      isActive
                        ? 'border-african-green bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {/* Color swatch strip */}
                    <div className="flex gap-1 mb-2">
                      {[preset.theme.primary, preset.theme.secondary, preset.theme.accent].map((c, i) => (
                        <div
                          key={i}
                          className="h-4 flex-1 rounded"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      {preset.theme.darkMode && (
                        <div className="h-4 w-4 rounded bg-slate-900 flex items-center justify-center">
                          <MoonIcon className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{preset.name}</p>
                    <p className="text-xs text-gray-500">{preset.description}</p>
                    {isActive && (
                      <span className="text-xs text-african-green font-medium">Active</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom colors */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Custom Colors</p>
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  { label: 'Primary', key: 'primary' },
                  { label: 'Secondary', key: 'secondary' },
                  { label: 'Accent', key: 'accent' },
                  { label: 'Danger', key: 'danger' },
                ] as Array<{ label: string; key: keyof Theme }>
              ).map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localTheme[key] as string}
                      onChange={(e) => setLocalTheme({ ...localTheme, [key]: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                    />
                    <span className="text-sm text-gray-600 font-mono">{localTheme[key] as string}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fonts */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TypeIcon className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-700">Fonts</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Body Font</label>
                <select
                  value={localTheme.bodyFont}
                  onChange={(e) => setLocalTheme({ ...localTheme, bodyFont: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-african-green"
                  style={{ fontFamily: localTheme.bodyFont }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Display / Heading Font</label>
                <select
                  value={localTheme.displayFont}
                  onChange={(e) => setLocalTheme({ ...localTheme, displayFont: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-african-green"
                  style={{ fontFamily: localTheme.displayFont }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dark mode toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              {localTheme.darkMode ? (
                <MoonIcon className="w-5 h-5 text-indigo-500" />
              ) : (
                <SunIcon className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                <p className="text-xs text-gray-500">Switch the site to a dark background</p>
              </div>
            </div>
            <button
              onClick={() => setLocalTheme({ ...localTheme, darkMode: !localTheme.darkMode })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                localTheme.darkMode ? 'bg-african-green' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  localTheme.darkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Live preview strip */}
          <div className="mt-4 p-4 rounded-xl border border-gray-200 overflow-hidden">
            <p className="text-xs text-gray-500 mb-2">Preview</p>
            <div
              className="rounded-lg p-3 flex items-center gap-3"
              style={{ backgroundColor: localTheme.darkMode ? '#1e293b' : '#f8fafc' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: localTheme.primary }}
              >A</div>
              <div className="flex-1">
                <p
                  className="text-sm font-bold"
                  style={{ fontFamily: localTheme.displayFont, color: localTheme.darkMode ? '#f1f5f9' : '#111827' }}
                >
                  Election Platform
                </p>
                <p className="text-xs" style={{ color: localTheme.secondary }}>Live results available</p>
              </div>
              <button
                className="px-3 py-1 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: localTheme.primary }}
              >Vote</button>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: localTheme.accent }}
              >Breaking</span>
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