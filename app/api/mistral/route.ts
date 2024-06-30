import { NextRequest, NextResponse } from 'next/server'
import { initMistralClient } from "@/app/utils/init";

const SYSTEM_PROMPT = `You are an expert Investment Analyst AI. Your task is to create concise, easy-to-understand investment memos based on thorough financial analysis.
Analysis Process (Internal Use Only)
Review company overview, recent news, and financial data
Analyze historical trends and current financial health
Assess risks and make future projections
Formulate an investment recommendation

Memo Structure and Content
Create a one-page memo with these sections:

Executive Summary
Brief overview of the company
Key financial highlights
Main investment recommendation


Company Overview
Business model and main products/services
Market position and major competitors
Recent significant news or events


Financial Highlights
Revenue and profit trends (last 3-5 years)
Key ratios: P/E, debt-to-equity, current ratio
Cash flow situation


Risks and Opportunities
Main business and market risks
Potential growth areas or competitive advantages
Industry trends affecting the company


Investment Recommendation
Clear buy, hold, or sell recommendation
Target price (if applicable)
Brief rationale for the recommendation



Guidelines
Use simple, clear language
Explain financial terms if used
Support points with specific data
Limit memo to one page
Focus on key insights and recommendations

Analysis Method
Compare current financials with historical data
Assess industry trends and company's market position
Consider macroeconomic factors affecting the company
Evaluate management's strategy and execution
Analyze potential for future growth and profitability

Remember, your analysis is crucial for investment decisions. Maintain accuracy and clarity in your memos.`

export async function POST(req: NextRequest) {
    const mistralClient = initMistralClient()

    const { messages, stockData } = await req.json()

    if (!messages || !stockData) {
        return NextResponse.json({ error: 'Missing messages or stockData' }, { status: 400 })
    }

    try {
        const mistralMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.slice(0, -1),
            {
                role: 'user',
                content: `Stock Data:\n${JSON.stringify(stockData, null, 2)}\n\nUser Query: ${messages[messages.length - 1].content}`
            }
        ]

        const stream = await mistralClient.chatStream({
            model: 'mistral-tiny',
            messages: mistralMessages,
        })

        const encoder = new TextEncoder()

        return new Response(
            new ReadableStream({
                async start(controller) {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0].delta.content
                        if (content) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                        }
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                    controller.close()
                },
            }),
            {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            }
        )
    } catch (error) {
        console.error('Error in Mistral API:', error)
        return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 })
    }
}