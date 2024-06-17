import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { initOpenaiClient } from "@/app/utils/init";

// http://localhost:3000/api/openai/add-message-to-thread
export async function POST(req: NextRequest) {
    try {
        const { threadId, content, role, attachment }: {
            threadId: string;
            content: string;
            role: 'assistant' | 'user';
            attachment?: OpenAI.Beta.Threads.MessageCreateParams.Attachment;
        } = await req.json();

        if (!threadId || !content || !role) {
            return NextResponse.json({ error: 'Thread ID, content, and role are required' }, { status: 400 });
        }

        const client = initOpenaiClient();
        const attachments = attachment ? [attachment] : null;
        const threadMessages = await client.beta.threads.messages.create(threadId, { content, role, attachments });

        return NextResponse.json(threadMessages, { status: 200 });
    } catch (error) {
        console.error(`\n❌ Failed to add message to thread: ${error}`);
        return NextResponse.json({ error: 'Failed to add message to thread' }, { status: 500 });
    }
}
