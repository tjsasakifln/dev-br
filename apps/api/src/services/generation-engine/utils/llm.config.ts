import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";

/**
 * Centralized configuration for Large Language Models (LLMs).
 * This ensures that we can easily swap models or update settings in one place.
 *
 * IMPORTANT: Make sure to have the following environment variables in your
 * /apps/api/.env file:
 * OPENAI_API_KEY="sk-..."
 * ANTHROPIC_API_KEY="sk-ant-..."
 */

// Instance for OpenAI models (GPT-4, etc.)
export const openai = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o", // Using the latest powerful and cost-effective model
  temperature: 0.1, // Low temperature for more predictable, code-generation tasks
});

// Instance for Anthropic models (Claude, etc.)
export const anthropic = new ChatAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  modelName: "claude-3-opus-20240229", // The most powerful Claude model
  temperature: 0.1,
});