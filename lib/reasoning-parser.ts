/**
 * Reasoning parser utility for breaking down AI reasoning into structured steps
 */

export type ReasoningStep = {
  id: string;
  label: string;
  description: string;
  content: string;
  status: 'pending' | 'active' | 'complete';
  icon?: string;
  timestamp?: number;
  duration?: number;
}

export type ReasoningSummary = {
  steps: ReasoningStep[];
  totalDuration?: number;
  toolUsage?: {
    fileSearch: boolean;
    functions: string[];
    mcp: boolean;
  };
  sources?: number;
}

const REASONING_PATTERNS = {
  analysis: /(analyzing|analysis|understanding|examining|looking at|considering)/i,
  search: /(searching|finding|retrieving|querying|looking for|fetching)/i,
  evaluation: /(evaluating|assessing|comparing|weighing|judging)/i,
  synthesis: /(combining|synthesizing|integrating|connecting|relating)/i,
  conclusion: /(concluding|therefore|thus|so|final answer|summary)/i,
  tool: /(using tool|calling function|executing|running)/i,
};

const MAX_DESCRIPTION_LENGTH = 50;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

/**
 * Parses reasoning text into structured steps based on common AI reasoning patterns
 */
export function parseReasoningIntoSteps(reasoningText: string): ReasoningStep[] {
  const steps: ReasoningStep[] = [];
  const lines = reasoningText.split('\n').filter(line => line.trim());

  let currentStep: Partial<ReasoningStep> | null = null;
  let stepIndex = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if this line indicates a new reasoning step
    let matchedPattern: keyof typeof REASONING_PATTERNS | null = null;
    let stepLabel = '';

    for (const [patternKey, regex] of Object.entries(REASONING_PATTERNS)) {
      if (regex.test(trimmedLine)) {
        matchedPattern = patternKey as keyof typeof REASONING_PATTERNS;
        stepLabel = patternKey.charAt(0).toUpperCase() + patternKey.slice(1);
        break;
      }
    }

    // If we found a pattern match or this is the first line, start a new step
    if (matchedPattern || steps.length === 0) {
      // Save previous step if it exists
      if (currentStep?.content) {
        steps.push({
          id: `step-${stepIndex++}`,
          label: currentStep.label || 'Processing',
          description: currentStep.description || '',
          content: currentStep.content.trim(),
          status: 'complete',
          timestamp: Date.now(),
        });
      }

      // Start new step
      currentStep = {
        label: stepLabel || 'Reasoning',
        description: trimmedLine.length > MAX_DESCRIPTION_LENGTH
          ? `${trimmedLine.substring(0, MAX_DESCRIPTION_LENGTH)}...`
          : trimmedLine,
        content: trimmedLine,
        status: 'active',
      };
    } else if (currentStep) {
      // Continue current step
      currentStep.content = `${currentStep.content || ''}
${trimmedLine}`;
      currentStep.description = currentStep.content.length > MAX_DESCRIPTION_LENGTH
        ? `${currentStep.content.substring(0, MAX_DESCRIPTION_LENGTH)}...`
        : currentStep.content;
    }
  }

  // Add the final step
  if (currentStep?.content) {
    steps.push({
      id: `step-${stepIndex}`,
      label: currentStep.label || 'Final Step',
      description: currentStep.description || '',
      content: currentStep.content.trim(),
      status: 'complete',
      timestamp: Date.now(),
    });
  }

  // If no structured steps were found, create a single comprehensive step
  if (steps.length === 0 && reasoningText.trim()) {
    steps.push({
      id: 'reasoning-summary',
      label: 'AI Reasoning',
      description: 'Complete reasoning process',
      content: reasoningText.trim(),
      status: 'complete',
      timestamp: Date.now(),
    });
  }

  return steps;
}

/**
 * Creates a reasoning summary with timing and tool usage information
 */
export function createReasoningSummary(
  reasoningText: string,
  duration?: number,
  toolCalls?: any[]
): ReasoningSummary {
  const steps = parseReasoningIntoSteps(reasoningText);

  // Analyze tool usage
  const toolUsage = {
    fileSearch: false,
    functions: [] as string[],
    mcp: false,
  };

  if (toolCalls) {
    for (const call of toolCalls) {
      if (call.tool_type === 'file_search_call') {
        toolUsage.fileSearch = true;
      } else if (call.tool_type === 'function_call' && call.name) {
        toolUsage.functions.push(call.name);
      } else if (call.tool_type === 'mcp_call') {
        toolUsage.mcp = true;
      }
    }
  }

  return {
    steps,
    totalDuration: duration,
    toolUsage,
    sources: toolUsage.fileSearch ? 1 : 0, // Could be enhanced to count actual sources
  };
}

/**
 * Formats duration in a human-readable way
 */
export function formatDuration(ms: number): string {
  if (ms < MS_PER_SECOND) {
    return `${ms}ms`;
  }
  const seconds = Math.round(ms / MS_PER_SECOND);
  if (seconds < SECONDS_PER_MINUTE) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;
  return `${minutes}m ${remainingSeconds}s`;
}
