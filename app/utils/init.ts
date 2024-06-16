import { OpenAI } from "openai";

export const initOpenaiClient = () => {
    const openai_api_key = process.env.OPENAI_API_KEY
    const client = new OpenAI({ apiKey: openai_api_key, timeout: 1000, maxRetries: 3 });
    return client
};
