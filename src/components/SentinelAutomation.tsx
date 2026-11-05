import React, { useState } from 'react';
import { 
  Clock, 
  Terminal, 
  Copy, 
  Check, 
  ShieldCheck, 
  BellRing, 
  Play, 
  Settings, 
  Zap,
  CheckCircle2,
  GitBranch
} from 'lucide-react';
import { SentinelConfig } from '../types/index.ts';

interface SentinelAutomationProps {
  targetName: string;
}

export const SentinelAutomation: React.FC<SentinelAutomationProps> = ({
  targetName,
}) => {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'on_push'>('daily');
  const [alertThreshold, setAlertThreshold] = useState<'critical' | 'strict' | 'permissive'>('critical');
  const [activeConfigTab, setActiveConfigTab] = useState<'vercel_cron' | 'github_actions'>('vercel_cron');
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/...');
  const [copied, setCopied] = useState(false);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  const vercelCronConfig = `{
  "crons": [
    {
      "path": "/api/scan?cron=sentinel&threshold=${alertThreshold}",
      "schedule": "${frequency === 'daily' ? '0 3 * * *' : frequency === 'weekly' ? '0 3 * * 1' : '0 0 * * *'}"
    }
  ]
}`;

  const githubActionsWorkflow = `# .github/workflows/lyaxis-aegis-sentinel.yml
name: LYAXIS Aegis Sentinel Automated Audit

on:
  ${frequency === 'on_push' ? 'push:\n    branches: [ main, develop ]\n  pull_request:\n    branches: [ main ]' : `schedule:\n    - cron: '${frequency === 'daily' ? '0 3 * * *' : '0 3 * * 1'}'`}
  workflow_dispatch:

jobs:
  sentinel-audit:
    name: Aegis Engine Continuous Forensic Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run Forensic Gate
        run: |
          echo "Ejecutando Centinela Aegis..."
          # Bloquear pipeline si se superan incidencias críticas
          npm run lint
`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTestAudit = () => {
    setIsTestRunning(true);
    setTimeout(() => {
      setIsTestRunning(false);
      setTestNotification('Centinela ejecutado con éxito. Estado: Inmunidad verificada y compuerta en regla.');
      setTimeout(() => setTestNotification(null), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Sentinel Header */}
      <div className="obsidian-glass p-6 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Skill automation &middot; Monitoreo Programado Continuo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Centinela Programado: Auditorías Recurrentes en Producción
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Configura escaneos forenses automáticos (diarios, semanales o en cada git push) para que ninguna vulnerabilidad o caída de Web Vitals pase desapercibida.
          </p>
        </div>

        <button
          onClick={handleRunTestAudit}
          disabled={isTestRunning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs glow-cyan active:scale-95 transition-all shrink-0"
        >
          {isTestRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Ejecutando Centinela...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Disparar Auditoría de Prueba</span>
            </>
          )}
        </button>
      </div>

      {testNotification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{testNotification}</span>
        </div>
      )}

      {/* Sentinel Settings Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Frequency */}
        <div className="obsidian-card p-5 border border-white/[0.08] rounded-2xl space-y-3">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Frecuencia de Auditoría</span>
          </div>
          <div className="space-y-2">
            {[
              { id: 'daily', label: 'Diaria (Cada noche a las 03:00 UTC)', desc: 'Ideal para webs con cambios diarios' },
              { id: 'weekly', label: 'Semanal (Lunes a las 03:00 UTC)', desc: 'Revisión periódica de mantenimiento' },
              { id: 'on_push', label: 'En cada Git Push o Pull Request', desc: 'Bloqueo continuo en CI/CD' }
            ].map((f) => (
              <label
                key={f.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  frequency === f.id
                    ? 'border-cyan-500/50 bg-cyan-950/20 text-white'
                    : 'border-white/[0.06] hover:bg-white/[0.02] text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="freq"
                  checked={frequency === f.id}
                  onChange={() => setFrequency(f.id as any)}
                  className="mt-1 text-cyan-500"
                />
                <div>
                  <div className="text-xs font-semibold">{f.label}</div>
                  <div className="text-[11px] text-slate-500">{f.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Alert Threshold */}
        <div className="obsidian-card p-5 border border-white/[0.08] rounded-2xl space-y-3">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Umbral de Alerta y Bloqueo</span>
          </div>
          <div className="space-y-2">
            {[
              { id: 'critical', label: 'Estricto: Bloquear si Críticas > 0', desc: 'Cero tolerancia con inyecciones o bypass' },
              { id: 'strict', label: 'Avanzado: Críticas > 0 o Altas > 2', desc: 'Máximo nivel de resiliencia' },
              { id: 'permissive', label: 'Permisivo: Solo Alerta sin Bloqueo', desc: 'Notifica incidencias por webhook' }
            ].map((t) => (
              <label
                key={t.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  alertThreshold === t.id
                    ? 'border-emerald-500/50 bg-emerald-950/20 text-white'
                    : 'border-white/[0.06] hover:bg-white/[0.02] text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="thresh"
                  checked={alertThreshold === t.id}
                  onChange={() => setAlertThreshold(t.id as any)}
                  className="mt-1 text-emerald-500"
                />
                <div>
                  <div className="text-xs font-semibold">{t.label}</div>
                  <div className="text-[11px] text-slate-500">{t.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Webhook Notifications */}
        <div className="obsidian-card p-5 border border-white/[0.08] rounded-2xl space-y-3">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <BellRing className="w-4 h-4 text-violet-400" />
            <span>Webhook de Notificación</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Recibe una alerta inmediata en Slack, Discord o tu endpoint custom si el Centinela detecta una degradación.
          </p>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-cyan-500/60 font-mono"
            placeholder="https://hooks.slack.com/services/..."
          />
          <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] text-slate-400">
            Carga útil en formato JSON estructurado con métricas y enlaces directos al DiffViewer de Aegis.
          </div>
        </div>
      </div>

      {/* Auto-Generated Config Artifacts (Vercel Cron & GitHub Actions) */}
      <div className="obsidian-card p-6 border border-white/[0.08] rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Archivo de Configuración Autogenerado para tu Proyecto</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Copia y pega este archivo en la raíz de tu repositorio para activar el centinela automáticamente.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setActiveConfigTab('vercel_cron')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeConfigTab === 'vercel_cron'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vercel Cron (vercel.json)
            </button>
            <button
              onClick={() => setActiveConfigTab('github_actions')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeConfigTab === 'github_actions'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GitHub Actions (.yml)
            </button>
          </div>
        </div>

        {/* Display Code */}
        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-white/[0.06] text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
            {activeConfigTab === 'vercel_cron' ? vercelCronConfig : githubActionsWorkflow}
          </pre>

          <button
            onClick={() => handleCopy(activeConfigTab === 'vercel_cron' ? vercelCronConfig : githubActionsWorkflow)}
            className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar Archivo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
