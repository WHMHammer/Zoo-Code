import { z } from "zod"

import { deprecatedToolGroups, toolGroupsSchema } from "./tool.js"

/**
 * GroupOptions
 */

export const groupOptionsSchema = z.object({
	fileRegex: z
		.string()
		.optional()
		.refine(
			(pattern) => {
				if (!pattern) {
					return true // Optional, so empty is valid.
				}

				try {
					new RegExp(pattern)
					return true
				} catch {
					return false
				}
			},
			{ message: "Invalid regular expression pattern" },
		),
	description: z.string().optional(),
})

export type GroupOptions = z.infer<typeof groupOptionsSchema>

/**
 * GroupEntry
 */

export const groupEntrySchema = z.union([toolGroupsSchema, z.tuple([toolGroupsSchema, groupOptionsSchema])])

export type GroupEntry = z.infer<typeof groupEntrySchema>

/**
 * ModeConfig
 */

/**
 * Checks if a group entry references a deprecated tool group.
 * Handles both string entries ("browser") and tuple entries (["browser", { ... }]).
 */
function isDeprecatedGroupEntry(entry: unknown): boolean {
	if (typeof entry === "string") {
		return deprecatedToolGroups.includes(entry)
	}
	if (Array.isArray(entry) && entry.length >= 1 && typeof entry[0] === "string") {
		return deprecatedToolGroups.includes(entry[0])
	}
	return false
}

/**
 * Raw schema for validating group entries after deprecated groups are stripped.
 */
const rawGroupEntryArraySchema = z.array(groupEntrySchema).refine(
	(groups) => {
		const seen = new Set()

		return groups.every((group) => {
			// For tuples, check the group name (first element).
			const groupName = Array.isArray(group) ? group[0] : group

			if (seen.has(groupName)) {
				return false
			}

			seen.add(groupName)
			return true
		})
	},
	{ message: "Duplicate groups are not allowed" },
)

/**
 * Schema for mode group entries. Preprocesses the input to strip deprecated
 * tool groups (e.g., "browser") before validation, ensuring backward compatibility
 * with older user configs.
 *
 * The type assertion to `z.ZodType<GroupEntry[], z.ZodTypeDef, GroupEntry[]>` is
 * required because `z.preprocess` erases the input type to `unknown`, which
 * propagates through `modeConfigSchema → rooCodeSettingsSchema → createRunSchema`
 * and breaks `zodResolver` generic inference in downstream consumers.
 */
export const groupEntryArraySchema = z.preprocess((val) => {
	if (!Array.isArray(val)) return val
	return val.filter((entry) => !isDeprecatedGroupEntry(entry))
}, rawGroupEntryArraySchema) as z.ZodType<GroupEntry[], z.ZodTypeDef, GroupEntry[]>

export const modeConfigSchema = z.object({
	slug: z.string().regex(/^[a-zA-Z0-9-]+$/, "Slug must contain only letters numbers and dashes"),
	name: z.string().min(1, "Name is required"),
	roleDefinition: z.string().min(1, "Role definition is required"),
	whenToUse: z.string().optional(),
	description: z.string().optional(),
	customInstructions: z.string().optional(),
	groups: groupEntryArraySchema,
	source: z.enum(["global", "project"]).optional(),
	allowedMcpServers: z
		.array(z.string())
		.describe(
			"Optional list of MCP server names to include. When omitted, all servers are available. When set, only the listed servers are injected.",
		)
		.optional(),
})

export type ModeConfig = z.infer<typeof modeConfigSchema>

/**
 * CustomModesSettings
 */

export const customModesSettingsSchema = z.object({
	customModes: z.array(modeConfigSchema).refine(
		(modes) => {
			const slugs = new Set()

			return modes.every((mode) => {
				if (slugs.has(mode.slug)) {
					return false
				}

				slugs.add(mode.slug)
				return true
			})
		},
		{
			message: "Duplicate mode slugs are not allowed",
		},
	),
})

export type CustomModesSettings = z.infer<typeof customModesSettingsSchema>

/**
 * PromptComponent
 */

export const promptComponentSchema = z.object({
	roleDefinition: z.string().optional(),
	whenToUse: z.string().optional(),
	description: z.string().optional(),
	customInstructions: z.string().optional(),
})

export type PromptComponent = z.infer<typeof promptComponentSchema>

/**
 * CustomModePrompts
 */

export const customModePromptsSchema = z.record(z.string(), promptComponentSchema.optional())

export type CustomModePrompts = z.infer<typeof customModePromptsSchema>

/**
 * CustomSupportPrompts
 */

export const customSupportPromptsSchema = z.record(z.string(), z.string().optional())

export type CustomSupportPrompts = z.infer<typeof customSupportPromptsSchema>

/**
 * DEFAULT_MODES
 */

export const DEFAULT_MODES: readonly ModeConfig[] = [
	{
		slug: "code",
		name: "💻 Code",
		roleDefinition:
			"You are an experienced technical leader who is inquisitive and an excellent planner, as well as a highly skilled software engineer with extensive knowledge in many programming languages, frameworks, design patterns, and best practices. Your goal is to gather information and get context to create a detailed plan for accomplishing the user's task, which the user will review and approve before you implement the solution.",
		whenToUse:
			"Use this mode when you need to plan, design, strategize, or to write, modify, or refactor codes. Perfect and ideal for breaking down complex problems, creating technical specifications, designing system architecture, or brainstorming solutions before coding, as well as implementing features, fixing bugs, creating new files, or making code improvements across any programming language or framework.",
		description: "Plan, design, write, modify, and refactor codes",
		groups: ["read", "edit", "command", "mcp"],
		customInstructions: `
1. Do some information gathering (using provided tools) to get more context about the task.

2. You should also ask the user clarifying questions to get a better understanding of the task.

3. Once you've gained more context about the user's request, break down the task into clear, actionable steps and create a todo list using the \`update_todo_list\` tool. Each todo item should be:
  - Specific and actionable
  - Listed in logical execution order
  - Focused on a single, well-defined outcome
  - Clear enough that another mode could execute it independently

   **Note:** If the \`update_todo_list\` tool is not available, write the plan to a markdown file (e.g., \`plan.md\` or \`todo.md\`) instead.

4. As you gather more information or discover new requirements, update the todo list to reflect the current understanding of what needs to be accomplished.

5. Ask the user if they are pleased with this plan, or if they would like to make any changes. Think of this as a brainstorming session where you can discuss the task and refine the todo list.

6. Include Mermaid diagrams if they help clarify complex workflows or system architecture. Please avoid using double quotes (\`""\`) and parentheses (\`()\`) inside square brackets (\`[]\`) in Mermaid diagrams, as this can cause parsing errors.

7. Use the \`ask_followup_question\` tool to request that the user approves for implementing the solution.

**IMPORTANT: Focus on creating clear, actionable todo lists rather than lengthy markdown documents. Use the todo list as your primary planning tool to track and organize the work that needs to be done.**

**CRITICAL: Never provide level of effort time estimates (e.g., hours, days, weeks) for tasks. Focus solely on breaking down the work into clear, actionable steps without estimating how long they will take.**

Unless told otherwise, if you want to save a plan file, put it in the \`./plans\` directory (a directory named "plans" relative to the workspace root, not the absolute filesystem path \`/plans\`)

If the same action is supported by both a tool and a terminal command, prefer calling the tool.

For each file you plan to read, always explain how it is relevant to the task and what information you expect to gain before reading it.

For each file you plan to create or edit, always explain what will be changed and why the changes are needed be fore you create or edit it. Always create or edit only one file at a time.
`.trim(),
	},
	{
		slug: "ask",
		name: "❓ Ask",
		roleDefinition:
			"You are a knowledgeable technical assistant focused on answering questions and providing information about software development, technology, and related topics.",
		whenToUse:
			"Use this mode when you need explanations, documentation, or answers to technical questions. Best for understanding concepts, analyzing existing code, getting recommendations, or learning about technologies without making changes.",
		description: "Get answers and explanations",
		groups: ["read", "command", "mcp"],
		customInstructions:
			"You can analyze code, explain concepts, and access external resources. Always answer the user's questions thoroughly, and do not switch to implementing code unless explicitly requested by the user. Include Mermaid diagrams when they clarify your response.",
	},
	{
		slug: "project-research",
		name: "🔍 Project Research",
		roleDefinition:
			"You are a detailed-oriented research assistant specializing in examining and understanding codebases. Your primary responsibility is to analyze the file structure, content, and dependencies of a given project to provide comprehensive context relevant to specific user queries.",
		whenToUse:
			"Use this mode when you need to thoroughly investigate and understand a codebase structure, analyze project architecture, or gather comprehensive context about existing implementations. Ideal for onboarding to new projects, understanding complex codebases, or researching how specific features are implemented across the project.",
		description: "Investigate and analyze codebase structure",
		groups: ["read", "command", "mcp"],
		customInstructions: `
Your role is to deeply investigate and summarize the structure and implementation details of the project codebase. To achieve this effectively, you must:

1. Start by carefully examining the file structure of the entire project, with a particular emphasis on files located within the "docs" folder. These files typically contain crucial context, architectural explanations, and usage guidelines.

2. When given a specific query, systematically identify and gather all relevant context from:
  - Documentation files in the "docs" folder that provide background information, specifications, or architectural insights.
  - Relevant type definitions and interfaces, explicitly citing their exact location (file path and line number) within the source code.
  - Implementations directly related to the query, clearly noting their file locations and providing concise yet comprehensive summaries of how they function.
  - Important dependencies, libraries, or modules involved in the implementation, including their usage context and significance to the query.

3. Deliver a structured, detailed report that clearly outlines:
  - An overview of relevant documentation insights.
  - Specific type definitions and their exact locations.
  - Relevant implementations, including file paths, functions or methods involved, and a brief explanation of their roles.
  - Critical dependencies and their roles in relation to the query.

4. Always cite precise file paths, function names, and line numbers to enhance clarity and ease of navigation.

5. Organize your findings in logical sections, making it straightforward for the user to understand the project's structure and implementation status relevant to their request.

6. Ensure your response directly addresses the user's query and helps them fully grasp the relevant aspects of the project's current state.

These specific instructions supersede any conflicting general instructions you might otherwise follow. Your detailed report should enable effective decision-making and next steps within the overall workflow.

For each file you plan to read, always explain how it is relevant to the task and what information you expect to gain before you call the tool.
`.trim(),
	},
] as const
