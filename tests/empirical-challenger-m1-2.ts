import { SOVEREIGN_AGENTS, SOVEREIGN_SKILLS, SQUADS, HARNESS_METRICS } from '../src/data/sovereignHarnessData.ts';
import { 
  SOVEREIGN_AGENTS as BACKEND_AGENTS, 
  SOVEREIGN_SKILLS as BACKEND_SKILLS, 
  SQUADS as BACKEND_SQUADS, 
  HARNESS_METRICS as BACKEND_METRICS 
} from '../api-src/_shared/sovereignHarnessData.ts';
import { simulateSwarmExecution, injectSovereignHarness, runDoctor } from '../api-src/_shared/sovereignHarnessEngine.ts';

async function runEmpiricalTests() {
  console.log('=== EMPIRICAL CHALLENGER 2 REPORT ===\n');

  // Test 1: Exact Counts
  console.log('--- 1. Exact Counts ---');
  console.log('Frontend Agents Count:', SOVEREIGN_AGENTS.length, 'Expected: 34');
  console.log('Frontend Skills Count:', SOVEREIGN_SKILLS.length, 'Expected: 274');
  console.log('Frontend Squads Count:', SQUADS.length, 'Expected: 6');
  console.log('Backend Agents Count:', BACKEND_AGENTS.length, 'Expected: 34');
  console.log('Backend Skills Count:', BACKEND_SKILLS.length, 'Expected: 274');
  console.log('Backend Squads Count:', BACKEND_SQUADS.length, 'Expected: 6');
  console.log('Frontend HARNESS_METRICS:', HARNESS_METRICS);
  console.log('Backend HARNESS_METRICS:', BACKEND_METRICS);

  // Test 2: Uniqueness
  console.log('\n--- 2. Uniqueness Checks ---');
  const agentIds = SOVEREIGN_AGENTS.map(a => a.id);
  const dupAgentIds = agentIds.filter((id, idx) => agentIds.indexOf(id) !== idx);
  console.log('Duplicate Agent IDs:', dupAgentIds.length === 0 ? 'None (PASS)' : dupAgentIds);

  const skillIds = SOVEREIGN_SKILLS.map(s => s.id);
  const dupSkillIds = skillIds.filter((id, idx) => skillIds.indexOf(id) !== idx);
  console.log('Duplicate Skill IDs:', dupSkillIds.length === 0 ? 'None (PASS)' : dupSkillIds);

  const squadIds = SQUADS.map(s => s.id);
  const dupSquadIds = squadIds.filter((id, idx) => squadIds.indexOf(id) !== idx);
  console.log('Duplicate Squad IDs:', dupSquadIds.length === 0 ? 'None (PASS)' : dupSquadIds);

  // Whitespace and case-sensitivity collision check
  const trimmedAgentIds = new Set(agentIds.map(id => id.trim().toLowerCase()));
  console.log('Case/Whitespace Collisions (Agents):', trimmedAgentIds.size === agentIds.length ? 'None (PASS)' : 'COLLISION FOUND');

  const trimmedSkillIds = new Set(skillIds.map(id => id.trim().toLowerCase()));
  console.log('Case/Whitespace Collisions (Skills):', trimmedSkillIds.size === skillIds.length ? 'None (PASS)' : 'COLLISION FOUND');

  // Test 3: Squad Membership & Distribution
  console.log('\n--- 3. Squad Membership Integrity ---');
  const recognizedSquadIds = new Set(squadIds);
  const invalidAgentSquads = SOVEREIGN_AGENTS.filter(a => !recognizedSquadIds.has(a.squadId));
  console.log('Agents with unrecognized squad:', invalidAgentSquads.length === 0 ? '0 (PASS)' : invalidAgentSquads);

  const invalidSkillSquads = SOVEREIGN_SKILLS.filter(s => !recognizedSquadIds.has(s.squadId));
  console.log('Skills with unrecognized squad:', invalidSkillSquads.length === 0 ? '0 (PASS)' : invalidSkillSquads);

  console.log('\nSquad Breakdown:');
  for (const sq of SQUADS) {
    const ags = SOVEREIGN_AGENTS.filter(a => a.squadId === sq.id);
    const sks = SOVEREIGN_SKILLS.filter(s => s.squadId === sq.id);
    console.log(`- Squad ${sq.id} [${sq.name}]: ${ags.length} agents, ${sks.length} skills`);
  }

  // Test 4: sovereignHarnessEngine.ts Simulation Stress-Testing
  console.log('\n--- 4. sovereignHarnessEngine Simulation Stress-Testing ---');

  // Scenario 4.1: Normal prompt
  try {
    const res1 = await simulateSwarmExecution('Refactorizar autenticación con TDD');
    console.log('Scenario 4.1 (Normal Prompt): SUCCESS, steps:', res1.steps.length, 'status:', res1.status);
  } catch (err: any) {
    console.error('Scenario 4.1 FAILED:', err.message);
  }

  // Scenario 4.2: Empty prompt ("")
  try {
    const res2 = await simulateSwarmExecution('');
    console.log('Scenario 4.2 (Empty string ""): SUCCESS, steps:', res2.steps.length, 'status:', res2.status, 'prompt:', JSON.stringify(res2.taskPrompt));
  } catch (err: any) {
    console.error('Scenario 4.2 (Empty string ""): THREW EXCEPTION:', err.message);
  }

  // Scenario 4.3: Whitespace only prompt ("   ")
  try {
    const res3 = await simulateSwarmExecution('    ');
    console.log('Scenario 4.3 (Whitespace "   "): SUCCESS, steps:', res3.steps.length, 'status:', res3.status);
  } catch (err: any) {
    console.error('Scenario 4.3 (Whitespace "   "): THREW EXCEPTION:', err.message);
  }

  // Scenario 4.4: Extremely long prompt (100,000 characters)
  try {
    const hugePrompt = 'A'.repeat(100000);
    const res4 = await simulateSwarmExecution(hugePrompt);
    console.log('Scenario 4.4 (100k chars prompt): SUCCESS, output slice length:', res4.steps[0].output.length, 'status:', res4.status);
  } catch (err: any) {
    console.error('Scenario 4.4 (100k chars prompt): THREW EXCEPTION:', err.message);
  }

  // Scenario 4.5: Adversarial injection prompt (XSS, SQLi, Null bytes)
  try {
    const maliciousPrompt = `<script>alert('pwned')</script>'; DROP TABLE users; -- \x00\r\n`;
    const res5 = await simulateSwarmExecution(maliciousPrompt);
    console.log('Scenario 4.5 (Malicious characters prompt): SUCCESS, status:', res5.status);
  } catch (err: any) {
    console.error('Scenario 4.5 (Malicious characters prompt): THREW EXCEPTION:', err.message);
  }

  // Scenario 4.6: Null / Undefined prompt (simulating unvalidated API input)
  try {
    const res6 = await simulateSwarmExecution(undefined as any);
    console.log('Scenario 4.6 (undefined prompt): SUCCESS, status:', res6.status);
  } catch (err: any) {
    console.log('Scenario 4.6 (undefined prompt): CRASHED with error ->', err.message);
  }

  try {
    const res7 = await simulateSwarmExecution(null as any);
    console.log('Scenario 4.7 (null prompt): SUCCESS, status:', res7.status);
  } catch (err: any) {
    console.log('Scenario 4.7 (null prompt): CRASHED with error ->', err.message);
  }

  // Scenario 4.8: Passing Agent ID as first parameter (as done in Worker M1 handoff)
  try {
    // If someone calls simulateSwarmExecution with ('non-existent-agent-id', 'task prompt')
    const res8 = await (simulateSwarmExecution as any)('non-existent-agent-id', 'Task Prompt');
    console.log('Scenario 4.8 (Passed non-existent agentId as arg0, task as arg1):');
    console.log('  Reported taskPrompt in result:', JSON.stringify(res8.taskPrompt));
    console.log('  Steps executed:', res8.steps.map((s: any) => `${s.agentId} (${s.agentName})`).join(' -> '));
  } catch (err: any) {
    console.log('Scenario 4.8 THREW EXCEPTION:', err.message);
  }

  // Test 5: Verify brand leakage in catalogs
  console.log('\n--- 5. Commercial Brand Leakage Check in Catalogs ---');
  const FORBIDDEN = ['openai', 'anthropic', 'gemini', 'claude', 'copilot', 'chatgpt', 'mistral', 'llama'];
  const fullCatalogStr = JSON.stringify({ SOVEREIGN_AGENTS, SOVEREIGN_SKILLS, SQUADS });
  const leaks: { brand: string; count: number }[] = [];
  for (const b of FORBIDDEN) {
    const regex = new RegExp(`\\b${b}\\b`, 'gi');
    const matches = fullCatalogStr.match(regex);
    if (matches) {
      leaks.push({ brand: b, count: matches.length });
    }
  }
  console.log('Commercial brand leaks in catalog:', leaks.length === 0 ? '0 (CLEAN)' : leaks);
}

runEmpiricalTests().catch(console.error);
