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

export const openAiCodexDefaultModelId: OpenAiCodexModelId = "gpt-5.6-sol"

/**
 * Models available through the Codex OAuth flow.
 * These models are accessible to ChatGPT Plus/Pro subscribers.
 * Costs are 0 as they are covered by the subscription.
 */
export const openAiCodexModels = {
	"gpt-5.6-sol": {
		maxTokens: 128_000,
		contextWindow: 1_050_000,
		includedTools: ["apply_patch"],
		excludedTools: ["apply_diff", "write_to_file"],
		supportsImages: true,
		supportsPromptCache: true,
		supportsReasoningEffort: ["none", "low", "medium", "high", "xhigh", "max"],
		reasoningEffort: "max",
		// Subscription-based: no per-token costs
		inputPrice: 125 * 0.065,
		cacheReadsPrice: 12.5 * 0.065,
		cacheWritesPrice: 125 * 0.065,
		outputPrice: 750 * 0.065,
		longContextPricing: {
			thresholdTokens: 272_000,
			inputPriceMultiplier: 2,
			outputPriceMultiplier: 1.5,
		},
		supportsVerbosity: true,
		supportsTemperature: false,
	},
	"gpt-5.6-terra": {
		maxTokens: 128_000,
		contextWindow: 1_050_000,
		includedTools: ["apply_patch"],
		excludedTools: ["apply_diff", "write_to_file"],
		supportsImages: true,
		supportsPromptCache: true,
		supportsReasoningEffort: ["none", "low", "medium", "high", "xhigh", "max"],
		reasoningEffort: "max",
		// Subscription-based: no per-token costs
		inputPrice: 50 * 0.065,
		cacheReadsPrice: 5 * 0.065,
		cacheWritesPrice: 50 * 0.065,
		outputPrice: 300 * 0.065,
		longContextPricing: {
			thresholdTokens: 272_000,
			inputPriceMultiplier: 2,
			outputPriceMultiplier: 1.5,
		},
		supportsVerbosity: true,
		supportsTemperature: false,
	},
	"gpt-5.6-luna": {
		maxTokens: 128_000,
		contextWindow: 1_050_000,
		includedTools: ["apply_patch"],
		excludedTools: ["apply_diff", "write_to_file"],
		supportsImages: true,
		supportsPromptCache: true,
		supportsReasoningEffort: ["none", "low", "medium", "high", "xhigh", "max"],
		reasoningEffort: "max",
		// Subscription-based: no per-token costs
		inputPrice: 5 * 0.065,
		cacheReadsPrice: 0.5 * 0.065,
		cacheWritesPrice: 5 * 0.065,
		outputPrice: 30 * 0.065,
		longContextPricing: {
			thresholdTokens: 272_000,
			inputPriceMultiplier: 2,
			outputPriceMultiplier: 1.5,
		},
		supportsVerbosity: true,
		supportsTemperature: false,
	},
} as const satisfies Record<string, ModelInfo>
