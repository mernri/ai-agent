import MistralClient from '@mistralai/mistralai'

export function initMistralClient() {
    const client = new MistralClient(process.env.MISTRAL_API_KEY);
    return client
}