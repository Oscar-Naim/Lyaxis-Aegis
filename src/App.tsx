import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HarnessHUD } from './components/HarnessHUD.tsx';
import { CatalogExplorer } from './components/CatalogExplorer.tsx';
import { AgentSwarmSimulator } from './components/AgentSwarmSimulator.tsx';
import { HarnessInjectorModal } from './components/HarnessInjectorModal.tsx';
import { ScannerView } from './components/ScannerView.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { RemediationViewer } from './components/RemediationViewer.tsx';
import { PipelineIntegration } from './components/PipelineIntegration.tsx';
import { ArchitectureChatbot } from './components/ArchitectureChatbot.tsx';
import { ImplementationPlan } from './components/ImplementationPlan.tsx';
import { SocialCardSimulator } from './components/SocialCardSimulator.tsx';
import { SentinelAutomation } from './components/SentinelAutomation.tsx';
import { ExecutiveReportView } from './components/ExecutiveReportView.tsx';
import { HumanModeView } from './components/HumanModeView.tsx';
import { HackerDevView } from './components/HackerDevView.tsx';
import { SecurityVaultModal } from './components/SecurityVaultModal.tsx';
import { CertificationBadgeModal } from './components/CertificationBadgeModal.tsx';
import { INITIAL_SCAN_RESULT, INITIAL_PIPELINE_RUN } from './data/mockData.ts';
import { ScanResult, PipelineRun, SecurityIssue, PerformanceIssue } from './types/index.ts';
import { SovereignAgent } from './data/sovereignHarnessData.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('harness');
  const [currentScan, setCurrentScan] = useState<ScanResult>(INITIAL_SCAN_RESULT);
  const [pipelineRun, setPipelineRun] = useState<PipelineRun>(INITIAL_PIPELINE_RUN);
  const [isScanning, setIsScanning] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedRemediationId, setSelectedRemediationId] = useState<string | undefined>(undefined);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);
  const [simulatorInitialPrompt, setSimulatorInitialPrompt] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<string | null>(null);

  // Perspective modes & modals
  const [isHumanMode, setIsHumanMode] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const [isInjectorOpen, setIsInjectorOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3800);
  };

  // Run Real-Time SAST / DAST Scan via API
  const handleRunScan = async (targetName: string, sourceCode: string, githubUrl?: string) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName,
          sourceCode,
          githubUrl,
          scanType: 'full',
        }),
      });

      if (!res.ok) throw new Error('Error al ejecutar escaneo');
      const data: ScanResult = await res.json();
      setCurrentScan(data);
      const targetLabel = data.repoDetails ? `${data.repoDetails.owner}/${data.repoDetails.repo}` : data.targetName;
      showNotification(`Auditoría Aegis completada para ${targetLabel}. Score de Seguridad: ${data.securityScore}/100.`);

      // Update pipeline run state based on new findings
      const criticalCount = data.issues.filter(i => i.severity === 'critical').length;
      setPipelineRun(prev => ({
        ...prev,
        branch: data.repoDetails ? data.repoDetails.branch : prev.branch,
        status: criticalCount === 0 ? 'success' : 'failed',
        summary: {
          criticalCount,
          highCount: data.issues.filter(i => i.severity === 'high').length,
          perfScore: data.performanceScore,
          gatePassed: criticalCount === 0,
        }
      }));
    } catch (err) {
      console.error(err);
      showNotification('Hubo un error al conectar con Aegis Engine.');
    } finally {
      setIsScanning(false);
    }
  };

  // Apply automated code remediation
  const handleApplyFix = (issueId: string) => {
    setCurrentScan(prev => {
      const updatedIssues = prev.issues.map(iss => {
        if (iss.id === issueId) {
          return { ...iss, status: 'resolved' as const };
        }
        return iss;
      });

      const remainingCritical = updatedIssues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
      const newSecScore = Math.min(100, prev.securityScore + 14);
      const newOverallScore = Math.min(100, Math.round((newSecScore + prev.performanceScore + (prev.architectureScore || 75)) / 3));
      const passed = remainingCritical === 0;

      return {
        ...prev,
        overallScore: newOverallScore,
        securityScore: newSecScore,
        issues: updatedIssues,
        ciStatus: {
          passed,
          failReason: passed ? undefined : `Bloqueado por ${remainingCritical} incidencia(s) crítica(s) restante(s).`,
          thresholdPolicy: prev.ciStatus.thresholdPolicy,
        }
      };
    });

    showNotification(`Remediación aplicada exitosamente para ${issueId}. Puntuación de seguridad actualizada.`);
  };

  const handleSelectIssueForRemediation = (issue: SecurityIssue | PerformanceIssue) => {
    setSelectedRemediationId(issue.id);
    setActiveTab('remediation');
  };

  const handleAskArchitect = (topic: string, details?: string) => {
    const prompt = details
      ? `¿Cómo solucionar y qué consideraciones arquitectónicas tener en cuenta sobre "${topic}"?\nDetalle técnico:\n${details}`
      : `Explícame en detalle cómo resolver y prevenir "${topic}" en producción.`;
    setChatInitialPrompt(prompt);
    setActiveTab('chat');
  };

  const handleSimulateRun = async (threshold: 'critical' | 'strict' | 'permissive') => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/pipeline/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threshold,
          branch: 'main',
          commitHash: '8b41e9c',
          author: 'dev-team@lyaxis.com'
        })
      });

      const runData: PipelineRun = await res.json();
      setPipelineRun(runData);
      showNotification(`Simulación de CI/CD finalizada: ${runData.status === 'success' ? 'Compuerta Aprobada' : 'Compuerta Bloqueada'}`);
    } catch (err) {
      console.error(err);
      showNotification('Error al simular el pipeline');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleLaunchSimulationFromHUD = (presetPrompt: string) => {
    setSimulatorInitialPrompt(presetPrompt);
    setActiveTab('simulator');
  };

  const handleSelectAgentForSimulation = (agent: SovereignAgent) => {
    setSimulatorInitialPrompt(`Ejecutar directiva de sistema para ${agent.name} (${agent.id}): ${agent.description}`);
    setActiveTab('simulator');
  };

  const resolvedIssueIds = React.useMemo(() => {
    return new Set(
      currentScan.issues
        .filter((i) => i.status === 'resolved')
        .map((i) => i.id)
    );
  }, [currentScan.issues]);

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 flex flex-col font-sans selection:bg-cyan-400/30">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-cyan-400/60 shadow-2xl shadow-cyan-950/70 text-xs text-cyan-200 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isHumanMode={isHumanMode}
        onToggleHumanMode={() => setIsHumanMode(!isHumanMode)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenBadge={() => setIsBadgeOpen(true)}
        onOpenInjector={() => setIsInjectorOpen(true)}
        onExportReport={() => setIsReportOpen(true)}
        isScanning={isScanning}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-7">
        {/* If Human Mode is active, render the plain-Spanish view */}
        {isHumanMode ? (
          <HumanModeView
            currentScan={currentScan}
            onApplyFix={handleApplyFix}
            onSelectIssueForRemediation={handleSelectIssueForRemediation}
            resolvedIssueIds={resolvedIssueIds}
          />
        ) : (
          <>
            {/* Tab 1: Casa Central de Agentes (Harness HUD) */}
            {activeTab === 'harness' && (
              <HarnessHUD
                onNavigateTab={setActiveTab}
                onOpenInjector={() => setIsInjectorOpen(true)}
                onRunQuickSimulation={handleLaunchSimulationFromHUD}
              />
            )}

            {/* Tab 2: Catálogo de Agentes y Skills (34 / 274) */}
            {activeTab === 'catalog' && (
              <CatalogExplorer
                onSelectAgentForSimulation={handleSelectAgentForSimulation}
              />
            )}

            {/* Tab 3: Live Terminal / Simulador de Enjambre */}
            {activeTab === 'simulator' && (
              <AgentSwarmSimulator
                initialPrompt={simulatorInitialPrompt}
                onClearInitialPrompt={() => setSimulatorInitialPrompt(undefined)}
              />
            )}

            {/* Tab 4: Aegis Engine Escáner Forense */}
            {activeTab === 'scanner' && (
              <ScannerView
                currentScan={currentScan}
                isScanning={isScanning}
                onRunScan={handleRunScan}
                onSelectIssueForRemediation={handleSelectIssueForRemediation}
                onAskCopilotAboutIssue={handleAskArchitect}
              />
            )}

            {/* Tab 5: Diagnóstico del Sistema */}
            {activeTab === 'analytics' && (
              <AnalyticsDashboard
                currentScan={currentScan}
                onSelectIssue={handleSelectIssueForRemediation}
                onAskCopilot={handleAskArchitect}
              />
            )}

            {/* Tab 6: Parches & Diff Viewer */}
            {activeTab === 'remediation' && (
              <RemediationViewer
                currentScan={currentScan}
                onApplyFix={handleApplyFix}
                onAskCopilot={handleAskArchitect}
                selectedIssueId={selectedRemediationId}
                resolvedIssueIds={resolvedIssueIds}
              />
            )}

            {/* Tab 7: LYAXIS Architect Plan Maestro */}
            {activeTab === 'architect' && (
              <ImplementationPlan
                currentScan={currentScan}
                onSelectStepForRemediation={() => setActiveTab('remediation')}
              />
            )}

            {/* Tab 8: Social Card & SEO */}
            {activeTab === 'social' && (
              <SocialCardSimulator
                initialData={currentScan.socialCardData}
                targetName={currentScan.targetName}
              />
            )}

            {/* Tab 9: Centinela Autónomo */}
            {activeTab === 'sentinel' && (
              <SentinelAutomation
                targetName={currentScan.targetName}
              />
            )}

            {/* Tab 10: CI/CD Quality Gates */}
            {activeTab === 'pipeline' && (
              <PipelineIntegration
                currentScan={currentScan}
                pipelineRun={pipelineRun}
                onSimulateRun={handleSimulateRun}
                isSimulating={isSimulating}
              />
            )}

            {/* Tab 11: LYAXIS Architect Chat */}
            {activeTab === 'chat' && (
              <ArchitectureChatbot
                currentScan={currentScan}
                initialPrompt={chatInitialPrompt}
                onClearInitialPrompt={() => setChatInitialPrompt(undefined)}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <HarnessInjectorModal
        isOpen={isInjectorOpen}
        onClose={() => setIsInjectorOpen(false)}
        onSuccess={(msg) => showNotification(msg)}
      />

      <SecurityVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />

      <CertificationBadgeModal
        isOpen={isBadgeOpen}
        onClose={() => setIsBadgeOpen(false)}
        overallScore={currentScan.overallScore}
        targetName={currentScan.targetName}
      />

      {isReportOpen && (
        <ExecutiveReportView
          scan={currentScan}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Clean quiet footer */}
      <footer className="border-t border-white/[0.08] bg-[#02050A] py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold tracking-wider">LYAXIS LABS</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Casa Central de Agentes Soberanos &amp; Aegis Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px] font-mono">
            <span>34 Agentes</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>274 Skills</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>0 Proveedores Externos</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-cyan-400">100% Soberano</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
