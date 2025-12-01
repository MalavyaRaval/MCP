import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import {  CreateMessageResultSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new McpServer({
    name: "My MCP Server",
    version: "1.0.0",
})

// First Resource
server.resource(
    "users", 
    "users://all",
    {
        description: "Get all users data from the database",
        title: "Users",
        mimeType: "application/json"
    }, async uri => {

        const users = await import ("./data/users.json", {
        with: {
            type: "json"
        }
    }).then(m => m.default)

        return {
            contents: [
                {
                    uri: uri.href, text: JSON.stringify(users), MimeType: "application/json"
                },
            ]
        }
    }
)

// First Resource Template
server.resource("user-details", new ResourceTemplate("users://{userID}/profile", { list: undefined}), 
{
        description: "Get a user's details from the database",
        title: "User Details",
        mimeType: "application/json"
    }, async (uri, {userID}) => {

        const users = await import ("./data/users.json", {
        with: {
            type: "json"
        },
    }).then(m => m.default)

    const user = users.find(u => u.id === parseInt(userID as string))

    if (user == null){
        return {
            contents: [
                {
                    uri: uri.href,
                    text: JSON.stringify({ error: "User not found" }),
                    mimeType: "application/json"
                }
            ]
        }
    }

        return {
            contents: [
                {
                    uri: uri.href,
                    text: JSON.stringify(user),
                    mimeType: "application/json"
                },
            ]
        }
    })


// First Tool
server.tool("create-user", "Create a new user in the database", {
    name : z.string(),
    email: z.string(),
    address: z.string(),
    phone: z.string()

},{
    title: "Create User",    // next 4 lines and this line is optional
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,

}, async (params) => {
    try {
        const id = await createUser(params)
        return {
            content: [
                {
                    type: 'text', text: `User ${id} created successfully`
                }
            ]
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text', text: "Failed to save user"
                }
            ]
        }
    }
})

// First Prompt
server.prompt("generate-fake-user", "Generate a fake user based on a given name", 
    {name: z.string()}, ({ name }) => {
    return {
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Generate a fake user with the name ${name}. Provide the email, address, and phone number.`,
                },
            },
        ],
    }
    }

)

// Create Random User
server.tool("create-random-user", "Create a random user with fake data", {
    title: "Create Random User",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
}, async () => {
    const res = await server.server.request({
        method: "sampling/createMessage",
        params: {
            messages: [{
                role: "user",
                content: {
                    type: "text",
                    text: "Generate a fake user with random name, email, address, and phone number."
            }
    }], maxTokens: 500
        },
    }, CreateMessageResultSchema
)
    if (res.content.type !== "text") {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to generate user data"
                }
            ]
        }
    }
    try {
        const fakeuser = JSON.parse(res.content.text.trim().replace(/^```json/, "").replace(/```$/, "").trim())

        const id = await createUser(fakeuser)
        return {
            content: [
                {
                    type: "text",
                    text: `User ${id} created successfully`
                }
            ]
        }

        } catch{return {
            content: [
                {
                    type: "text",
                    text: "Failed to generate user data why still success on the website"
                }
            ]
        }}
    }

)



async function createUser(user: { name: string; email: string; address: string; phone: string })
{
    
    const users = await import ("./data/users.json", {
        with: {
            type: "json"
        }
    }).then(m => m.default)

    const id = users.length + 1

    users.push({id, ...user})

    await fs.writeFile("./src/data/users.json", JSON.stringify(users, null, 2))

    return id
}


async function main() {
    const transport = new StdioServerTransport()
    await server.connect(transport)
}

main()