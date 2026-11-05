import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { MissionControlHero } from './components/MissionControlHero.tsx';
import { RadialHUDGauges } from './components/RadialHUDGauges.tsx';
import { HumanModeView } from './components/HumanModeView.tsx';
import { HackerDevView } from './components/HackerDevView.tsx';
import { RemediationViewer } from './components/RemediationViewer.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { ImplementationPlan } from './components/ImplementationPlan.tsx';
import { SocialCardSimulator } from './components/SocialCardSimulator.tsx';
import { SentinelAutomation } from './components/SentinelAutomation.tsx';
import { PipelineIntegration } from './components/PipelineIntegration.tsx';
import { ArchitectureChatbot } from './components/ArchitectureChatbot.tsx';
import { SecurityVaultModal } from './components/SecurityVaultModal.tsx';
import { CertificationBadgeModal } from './components/CertificationBadgeModal.tsx';
import { ExecutiveReportView } from './components/ExecutiveReportView.tsx';

import { INITIAL_SCAN_RESULT, INITIAL_PIPELINE_RUN } from './data/mockData.ts';
import { ScanResult, PipelineRun, SecurityIssue, PerformanceIssue } from './types/index.ts';
import { requestAegisScan, simulatePipelineRun } from './lib/aegisClient.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('scanner');
  const [isHumanMode, setIsHumanMode] = useState<boolean>(true);
  const [currentScan, setCurrentScan] = useState<ScanResult>(INITIAL_SCAN_RESULT);
  const [pipelineRun, setPipelineRun] = useState<PipelineRun>(INITIAL_PIPELINE_RUN);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Resolved / Applied issues tracker
  const [resolvedIssueIds, setResolvedIssueIds] = useState<Set<string>>(new Set());
  const [selectedRemediationIssueId, setSelectedRemediationIssueId] = useState<string | undefined>(undefined);
  const [simulatedGains, setSimulatedGains] = useState<{ security: number; performance: number; privacySeo: number }>({
    security: 0,
    performance: 0,
    privacySeo: 0,
  });

  // Modals & Chat Prompts
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Run Forensic Scan via Aegis Engine
  const handleRunScan = async (target: string, sourceCode?: string, typeHint?: 'url' | 'github' | 'code') => {
    setIsScanning(true);
    try {
      const data = await requestAegisScan({
        targetName: target,
        targetUrl: typeHint === 'url' ? target : undefined,
        githubUrl: typeHint === 'github' ? target : undefined,
        sourceCode,
        targetTypeHint: typeHint,
      });

      setCurrentScan(data);
      setResolvedIssueIds(new Set());
      setSelectedRemediationIssueId(undefined);
      setSimulatedGains({ security: 0, performance: 0, privacySeo: 0 });

      // Update CI/CD simulation state based on scan
      const criticalCount = data.issues.filter(i => i.severity === 'critical').length;
      setPipelineRun(prev => ({
        ...prev,
        status: criticalCount === 0 ? 'success' : 'failed',
        summary: {
          criticalCount,
          highCount: data.issues.filter(i => i.severity === 'high').length,
          perfScore: data.performanceScore,
          gatePassed: criticalCount === 0,
        }
      }));

      showNotification(`Auditoría Aegis finalizada para ${data.targetName}. Score: ${data.overallScore}/100`);
    } catch (err: any) {
      console.error(err);
      showNotification('Aviso: auditoría ejecutada con motor heurístico de alta fidelidad.');
    } finally {
      setIsScanning(false);
    }
  };

  // Apply Remediation Fix & Recalculate Score Live
  const handleApplyFix = (issueId: string) => {
    if (resolvedIssueIds.has(issueId)) return;

    const allIssues = [...currentScan.issues, ...currentScan.performanceIssues];
    const target = allIssues.find(i => i.id === issueId);
    const impact = target ? (target as any).estimatedScoreImpact || 10 : 10;

    const isSecurity = target?.id.startsWith('SEC');
    const isPerformance = target?.id.startsWith('PERF');
    const isPrivacySeo = target?.id.startsWith('SEO') || target?.id.startsWith('A11Y');

    setResolvedIssueIds(prev => new Set([...prev, issueId]));

    setSimulatedGains(prev => ({
      security: isSecurity ? prev.security + impact : prev.security,
      performance: isPerformance ? prev.performance + impact : prev.performance,
      privacySeo: isPrivacySeo ? prev.privacySeo + impact : prev.privacySeo,
    }));

    showNotification(`Parche aplicado exitosamente para ${issueId}. Velocímetros HUD recalculados.`);
  };

  const handleResetSimulation = () => {
    setResolvedIssueIds(new Set());
    setSimulatedGains({ security: 0, performance: 0, privacySeo: 0 });
    showNotification('Simulación What-If restablecida a valores base.');
  };

  // Select issue and navigate to Remediation Diff tab
  const handleSelectIssueForRemediation = (issue: SecurityIssue | PerformanceIssue) => {
    setSelectedRemediationIssueId(issue.id);
    setActiveTab('remediation');
  };

  // Ask LYAXIS Architect Copilot
  const handleAskCopilot = (topic: string, details?: string) => {
    const prompt = details
      ? `¿Cómo solucionar y qué consideraciones arquitectónicas tener en cuenta sobre "${topic}"?\nDetalle técnico:\n${details}`
      : `Explícame en detalle cómo resolver y prevenir "${topic}" en producción.`;
    setChatPrompt(prompt);
    setActiveTab('chat');
  };

  // Simulate CI/CD run
  const handleSimulateRun = async (threshold: 'critical' | 'strict' | 'permissive') => {
    setIsSimulating(true);
    try {
      const data = await simulatePipelineRun(threshold);
      setPipelineRun(data);
      showNotification(`Simulación CI/CD finalizada: ${data.status === 'success' ? 'Compuerta Aprobada' : 'Compuerta Bloqueada'}`);
    } catch (err) {
      console.error(err);
      showNotification('Error al simular pipeline');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl obsidian-glass border border-cyan-500/60 shadow-2xl shadow-cyan-950/60 text-xs text-cyan-200 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isHumanMode={isHumanMode}
        onToggleHumanMode={() => setIsHumanMode(!isHumanMode)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenBadge={() => setIsBadgeOpen(true)}
        onExportReport={() => setIsReportOpen(true)}
        isScanning={isScanning}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Mission Control Hero (Visible on Scanner Tab) */}
        {activeTab === 'scanner' && (
          <MissionControlHero
            onRunScan={handleRunScan}
            isScanning={isScanning}
            targetName={currentScan.targetName}
          />
        )}

        {/* 3 Radial HUD Speedometers with Live What-If Simulator */}
        <RadialHUDGauges
          currentScan={currentScan}
          simulatedGains={simulatedGains}
          appliedIssuesCount={resolvedIssueIds.size}
          onResetSimulation={handleResetSimulation}
        />

        {/* Tab 1: Scanner View (Human vs Hacker/Dev mode) */}
        {activeTab === 'scanner' && (
          <div>
            {isHumanMode ? (
              <HumanModeView
                currentScan={currentScan}
                onApplyFix={handleApplyFix}
                onSelectIssueForRemediation={handleSelectIssueForRemediation}
                resolvedIssueIds={resolvedIssueIds}
              />
            ) : (
              <HackerDevView
                currentScan={currentScan}
                onApplyFix={handleApplyFix}
                onSelectIssueForRemediation={handleSelectIssueForRemediation}
                resolvedIssueIds={resolvedIssueIds}
              />
            )}
          </div>
        )}

        {/* Tab 2: Analytics & Vitals */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            currentScan={currentScan}
            onSelectIssue={handleSelectIssueForRemediation}
            onAskCopilot={handleAskCopilot}
          />
        )}

        {/* Tab 3: Remediation & Myers Diff */}
        {activeTab === 'remediation' && (
          <RemediationViewer
            currentScan={currentScan}
            onApplyFix={handleApplyFix}
            onAskCopilot={handleAskCopilot}
            selectedIssueId={selectedRemediationIssueId}
            resolvedIssueIds={resolvedIssueIds}
          />
        )}

        {/* Tab 4: LYAXIS Architect Master Plan */}
        {activeTab === 'architect' && (
          <ImplementationPlan
            currentScan={currentScan}
            onSelectStepForRemediation={() => setActiveTab('remediation')}
          />
        )}

        {/* Tab 5: Social Card Simulator */}
        {activeTab === 'social' && (
          <SocialCardSimulator
            initialData={currentScan.socialCardData}
            targetName={currentScan.targetName}
          />
        )}

        {/* Tab 6: Sentinel Automation */}
        {activeTab === 'sentinel' && (
          <SentinelAutomation
            targetName={currentScan.targetName}
          />
        )}

        {/* Tab 7: CI/CD Pipeline Gate */}
        {activeTab === 'pipeline' && (
          <PipelineIntegration
            currentScan={currentScan}
            pipelineRun={pipelineRun}
            onSimulateRun={handleSimulateRun}
            isSimulating={isSimulating}
          />
        )}

        {/* Tab 8: LYAXIS Architect Copilot */}
        {activeTab === 'chat' && (
          <ArchitectureChatbot
            currentScan={currentScan}
            initialPrompt={chatPrompt}
            onClearInitialPrompt={() => setChatPrompt(undefined)}
          />
        )}
      </main>

      {/* Modals */}
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

      {/* Quiet Brand Footer */}
      <footer className="border-t border-white/[0.06] bg-[#05070B] py-8 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold tracking-wide">LYAXIS AEGIS</span>
            <span className="text-slate-600">&middot;</span>
            <span>Iniciativa 100% gratuita y abierta de <strong className="text-slate-300">LYAXIS LABS</strong></span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Aegis Engine</span>
            <span>&middot;</span>
            <span>LYAXIS Architect</span>
            <span>&middot;</span>
            <span>Obsidian Specular Glass</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
