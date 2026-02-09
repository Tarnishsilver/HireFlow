import { NextRequest, NextResponse } from 'next/server';
import { tools, executeTool } from '@/lib/copilot/tools';

const apiKey = process.env.MISTRAL_API_KEY;

async function chatComplete(messages: any[], toolsList: any[] = []) {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "mistral-large-latest",
            messages: messages,
            tools: toolsList.length > 0 ? toolsList : undefined,
            tool_choice: toolsList.length > 0 ? "auto" : undefined
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Mistral API Error:", response.status, errorText);
        throw new Error(`Mistral API Error: ${response.status} ${errorText}`);
    }

    return await response.json();
}

export async function POST(request: NextRequest) {
    if (!apiKey) {
        return NextResponse.json({ error: 'Mistral API Key not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { messages } = body;

        // 1. Initial Call to Mistral
        console.log("Sending initial request to Mistral...");
        const chatResponse = await chatComplete(messages, tools);
        const responseMessage = chatResponse.choices?.[0]?.message;

        // 2. Check for Tool Calls
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            const toolCall = responseMessage.tool_calls[0];
            console.log("Tool Call Received:", toolCall);

            // Ensure ID exists (rare edge case with raw API, but good to be safe)
            if (!toolCall.id) {
                toolCall.id = `call_${Math.random().toString(36).substring(7)}`;
            }

            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);

            console.log(`Executing tool: ${functionName}`, functionArgs);

            // 3. Execute Tool
            const toolResult = await executeTool(functionName, functionArgs);
            console.log("Tool Result:", toolResult);

            // 4. Construct Follow-up History
            // STRICTLY formatted for OpenAI/Mistral API
            const assistantMessage = {
                role: "assistant",
                content: responseMessage.content || null,
                tool_calls: [
                    {
                        id: toolCall.id,
                        type: "function",
                        function: {
                            name: functionName,
                            arguments: toolCall.function.arguments // Pass original string
                        }
                    }
                ]
            };

            const toolMessage = {
                role: "tool",
                content: JSON.stringify(toolResult),
                tool_call_id: toolCall.id,
                name: functionName
            };

            const followUpMessages = [...messages, assistantMessage, toolMessage];

            console.log("Sending follow-up request...");

            // 5. Final Call with Tool Result
            const finalResponse = await chatComplete(followUpMessages, tools); // Include tools again just in case chaining is needed
            return NextResponse.json(finalResponse.choices?.[0]?.message);
        }

        // No tool called
        return NextResponse.json(responseMessage);

    } catch (error: any) {
        console.error('Copilot Route Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
