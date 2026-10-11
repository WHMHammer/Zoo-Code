import type { ModelInfo } from "../model.js"

/**
 * OpenAI Codex Provider
 *
 * This provider uses OAuth authentication via ChatGPT Plus/Pro subscription
 * instead of direct API keys. Requests are routed to the Codex backend at
 * https://chatgpt.com/backend-api/codex/responses
 *
 * Key differences from openai-native:
 * - Uses OAuth Bearer tokens instead of API keys
 * - Subscription-based pricing (no per-token costs)
 * - Limited model subset available
 * - Custom routing to Codex backend
 */

export type OpenAiCodexModelId = keyof typeof openAiCodexModels

export const openAiCodexDefaultModelId: OpenAiCodexModelId = "gpt-6.1-sol"

/**
 * Models available through the Codex OAuth flow.
 * These models are accessible to ChatGPT Plus/Pro subscribers.
 * Costs are 0 as they are covered by the subscription.
 */
export const openAiCodexModels = {
	// https://github.com/openai/codex/blob/main/codex-rs/models-manager/models.json
	"gpt-6.1-sol": {
		maxTokens: 128000,
		// Use Codex's supported maximum rather than its 272K default compaction budget.
		contextWindow: 872000,
		supportsImages: true,
		supportsPromptCache: true,
		supportsReasoningEffort: ["low", "medium", "high", "xhigh", "max"],
		requiredReasoningEffort: true,
		reasoningEffort: "low",
		inputPrice: 0,
		cacheWritesPrice: 50 * 0.0332,
		cacheReadsPrice: 2.5 * 0.0332,
		outputPrice: 250 * 0.0332,
		supportsVerbosity: true,
		supportsTemperature: false,
		description:
			"GPT-6.1 Sol: Near-Astra performance for complex coding and professional work via ChatGPT subscription",
	},
	"gpt-6-astra": {
		maxTokens: 128000,
		contextWindow: 872000,
		supportsImages: true,
		supportsPromptCache: true,
		supportsReasoningEffort: ["low", "medium", "high", "xhigh", "max"],
		requiredReasoningEffort: true,
		reasoningEffort: "low",
		inputPrice: 0,
		cacheWritesPrice: 250 * 0.0332,
		cacheReadsPrice: 25 * 0.0332,
		outputPrice: 1250 * 0.0332,
		supportsVerbosity: true,
		supportsTemperature: false,
		description: "GPT-6 Astra: OpenAI's most capable model for complex, demanding work via ChatGPT subscription",
	},
	"gpt-6-luna": {
		maxTokens: 128000,
		contextWindow: 372000,
		supportsImages: true,
		supportsPromptCache: true,
		supportsReasoningEffort: ["none", "low", "medium", "high", "xhigh", "max"],
		reasoningEffort: "medium",
		inputPrice: 0,
		cacheWritesPrice: 2.5 * 0.0332,
		cacheReadsPrice: 0.25 * 0.0332,
		outputPrice: 12.5 * 0.0332,
		supportsVerbosity: true,
		supportsTemperature: false,
		description: "GPT-6 Luna: The fastest, most affordable member of the GPT-6 family via ChatGPT subscription",
	},
} as const satisfies Record<string, ModelInfo>
