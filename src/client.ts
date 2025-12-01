import { input, select, confirm } from "@inquirer/prompts"; // Importing confirm
import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { PromptMessage, Prompt } from "@modelcontextprotocol/sdk/types.js"; // Importing types
import { generateText } from "ai";
import { MockSpeechModelV2 } from "ai/test";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import "dotenv/config";

// Removed unnecessary import for text (stream/consumers)
const mcp = new Client({
    name: "text-client-video",
    version: "1.0.0",
}, {
    capabilities: { sampling: {} }
})

const transport = new StdioClientTransport({
    command: "node",
    args: ["build/server.js"],
    stderr: "ignore",
})

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY || "",
});

async function main() {
    await mcp.connect(transport)

    // Fetch resources and templates
    const [{ tools }, { prompts }, { resources }, resourcetemplates] = 
    await Promise.all([
        mcp.listTools(),
        mcp.listPrompts(),
        mcp.listResources(),
        mcp.listResourceTemplates(),
    ])

    // Log resources and templates to inspect the structure
    console.log("Resources:", resources);
    console.log("Resource Templates:", resourcetemplates);

    console.log("You are connected");

    while (true) {
        const option = await select({
            message: "What would you like to do?",
            choices: ["Query", "Tools", "Prompts", "Resources"],
        });

        switch (option) {
            case "Tools":
                const toolName = await select({
                    message: "Select a tool",
                    choices: tools.map(tool => ({
                        name: tool.annotations?.title || tool.name,
                        value: tool.name,
                        description: tool.description,
                    })),
                });

                const tool = tools.find(t => t.name === toolName);
                if (tool == null) {
                    console.log("Tool not found");
                } else {
                    await handleTool(tool);
                }
                break;

            case "Resources":
                const resourceuri = await select({
                    message: "Select a resource",
                    choices: [
                        ...resources.map(resource => ({
                            name: resource.name,
                            value: resource.uri,
                            description: resource.description,
                        })),
                        ...resourcetemplates.map(template => ({
                            name: template.name,
                            value: template.uriTemplate,
                            description: template.description,
                        }))
                    ]
                });

                const uri = resources.find(r => r.uri === resourceuri)?.uri ?? 
                           resourcetemplates.find(r => r.uriTemplate === resourceuri)?.uriTemplate;
                
                if (uri == null) {
                    console.log("Resource not found");
                } else {
                    await handleResource(uri);
                }
                break;

            case "Prompts":
                const promptName = await select({
                    message: "Select a prompt",
                    choices: prompts.map(prompt => ({
                        name: prompt.name,
                        value: prompt.name,
                        description: prompt.description,
                    })),
                });

                const prompt = prompts.find(p => p.name === promptName);
                if (prompt == null) {
                    console.log("Prompt not found");
                } else {
                    await handlePrompt(prompt);
                }
                break;
        }
    }
}

async function handleTool(tool: any) {
    const args: Record<string, string> = {}
    for (const [key, value] of Object.entries(tool.inputSchema.properties ?? {})) {
        args[key] = await input({
            message: `Enter value for ${key} (${(value as { type: string }).type}):`,
        })
    }

    const res = await mcp.callTool({
        name: tool.name,
        arguments: args,
    })

    console.log((res.content as [{ text: string }])[0].text)
}

async function handleResource(uri: string) {
    let finalUri = uri
    const paramMatches = uri.matchAll(/{([^}]+)}/g)

    if (paramMatches != null) {
        for (const paramMatch of paramMatches) {
            const paramName = paramMatch[1]  
            const paramValue = await input({
                message: `Enter value for ${paramName}:`,
            })
            finalUri = finalUri.replace(`{${paramName}}`, paramValue)
        }
    }

    const res = await mcp.readResource({
        uri: finalUri,
    })

    console.log(JSON.stringify(JSON.parse(res.contents[0].text as string), null, 2))
}

async function handlePrompt(prompt: Prompt) {
    const args: Record<string, string> = {}
    for (const arg of prompt.arguments ?? []) {
        args[arg.name] = await input({
            message: `Enter value for ${arg.name}:`,
        })
    }

    const res = await mcp.getPrompt({
        name: prompt.name,
        arguments: args,
    })

    for (const message of res.messages) {
        await handleServerMessagePrompt(message);
    }
}

async function handleServerMessagePrompt(message: PromptMessage) {
    if (message.content.type !== "text") return
    
    console.log(message.content.text)

    const run = await confirm({
        message: "Would you like to run the above prompt?",
        default: true,
    })

    if (!run) return

    const {text} = await generateText({
        model: google("gemini-2.0-v2"),
        prompt: message.content.text,
    })

    return text
}

main()
