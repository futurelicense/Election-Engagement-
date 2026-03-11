import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminService, BotRun } from '../../services/adminService';
import { formatDistanceToNow } from 'date-fns';
import { BotIcon, PlayIcon, RefreshCwIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

export function AdminBot() {
  const [runs, setRuns] = useState<BotRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<{ ok: boolean; message: string; actions?: { type: string; detail?: string }[] } | null>(null);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBotRuns(50);
      setRuns(data);
    } catch (e) {
      console.error('Failed to load bot runs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleRunNow = async () => {
    try {
      setRunning(true);
      setLastResult(null);
      const result = await adminService.runBotNow();
      setLastResult(result);
      await loadRuns();
    } catch (e: any) {
      setLastResult({ ok: false, message: e?.message || 'Request failed' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Bot engagement
            </h1>
            <p className="text-gray-600">
              View automated bot runs and trigger a run manually. The cron runs on schedule (e.g. every 10 minutes) when deployed.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={loadRuns}
              disabled={loading}
              className="inline-flex items-center gap-2"
            >
              <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleRunNow}
              disabled={running}
              className="inline-flex items-center gap-2"
            >
              {running ? (
                <>
                  <RefreshCwIcon className="w-4 h-4 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  Run now
                </>
              )}
            </Button>
          </div>
        </div>

        {lastResult && (
          <Card className={`p-4 ${lastResult.ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-start gap-3">
              {lastResult.ok ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p className={`font-medium ${lastResult.ok ? 'text-green-800' : 'text-red-800'}`}>
                  {lastResult.message}
                </p>
                {lastResult.actions && lastResult.actions.length > 0 && (
                  <ul className="mt-2 text-sm text-gray-700 space-y-1">
                    {lastResult.actions.map((a, i) => (
                      <li key={i}>
                        <span className="font-medium">{a.type}</span>
                        {a.detail && <span className="text-gray-600"> — {a.detail}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BotIcon className="w-5 h-5" />
            Recent runs
          </h2>
          {loading && runs.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <RefreshCwIcon className="w-8 h-8 animate-spin mr-2" />
              Loading…
            </div>
          ) : runs.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">
              No bot runs yet. Trigger a run with &quot;Run now&quot; or wait for the scheduled cron.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 pr-4 font-semibold text-gray-700">Time</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-700">Trigger</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-700">Status</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-700">Message</th>
                    <th className="pb-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 pr-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${run.trigger === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                          {run.trigger}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {run.success ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-sm">
                            <CheckCircleIcon className="w-4 h-4" /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 text-sm">
                            <XCircleIcon className="w-4 h-4" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-700 max-w-xs truncate">
                        {run.message}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {run.actions && run.actions.length > 0 ? (
                          <span title={run.actions.map((a) => `${a.type}${a.detail ? `: ${a.detail}` : ''}`).join(', ')}>
                            {run.actions.map((a) => a.type).join(', ')}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
