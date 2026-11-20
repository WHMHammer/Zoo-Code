import { openAiCodexServiceTierSchema, type ModelInfo } from "../model.js"
import { providerIdentifiers } from "../provider-identifiers.js"
import {
	API_MODEL_ID_FIELD,
	apiModelIdProviderModelShape,
	createModelIdAccessor,
	createProviderDefinition,
} from "./common.js"

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

export const openAiCodexDefaultModelId: OpenAiCodexModelId = "gpt-6.2-sol"

/**
 * Models available through the Codex OAuth flow.
 * These models are accessible to ChatGPT Plus/Pro subscribers.
 * Costs are 0 as they are covered by the subscription.
 */
export const openAiCodexModels = {
	"gpt-6.2-sol": {
		maxTokens: 128_000,
		contextWindow: 872_000,
		supportsImages: true,
		supportsPromptCache: true,
		supportsReasoningEffort: ["low", "medium"],
		requiredReasoningEffort: true,
		reasoningEffort: "medium",
		inputPrice: 0,
		cacheWritesPrice: 50 * 0.0332,
		cacheReadsPrice: 2.5 * 0.0332,
		outputPrice: 250 * 0.0332,
		supportsVerbosity: true,
		supportsTemperature: false,
	},
	"gpt-6.2-astra": {
		maxTokens: 128_000,
		contextWindow: 872_000,
		supportsImages: true,
		supportsPromptCache: true,
		supportsReasoningEffort: ["medium", "high", "xhigh"],
		requiredReasoningEffort: true,
		reasoningEffort: "medium",
		inputPrice: 0,
		cacheWritesPrice: 200 * 0.0332,
		cacheReadsPrice: 10 * 0.0332,
		outputPrice: 1_000 * 0.0332,
		supportsVerbosity: true,
		supportsTemperature: false,
	},
} as const satisfies Record<string, ModelInfo>

export const OPEN_AI_CODEX_SERVICE_TIER_KEY = "openAiCodexServiceTier"

export const openAiCodexProviderDefinition = createProviderDefinition({
	apiProvider: providerIdentifiers.openaiCodex,
	modelIdKey: API_MODEL_ID_FIELD,
	getModelId: createModelIdAccessor(API_MODEL_ID_FIELD),
	getDefaultModelId: () => openAiCodexDefaultModelId,
	schema: {
		...apiModelIdProviderModelShape,
		// Codex "Fast" mode maps to the Responses API priority service tier.
		[OPEN_AI_CODEX_SERVICE_TIER_KEY]: openAiCodexServiceTierSchema.optional(),
	},
})
