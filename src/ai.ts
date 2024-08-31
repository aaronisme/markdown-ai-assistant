import * as vscode from 'vscode';
import axios from 'axios'; // Make sure to install axios: npm install axios


function processText(text: string): string {
    return text.replaceAll('"', '');
}

export interface AzureOpenAIConfig {
    apiKey: string;
    endpoint: string;
    deploymentName: string;
}

export async function improveText(text: string, config: AzureOpenAIConfig): Promise<string> {
    const userPrompt = "Modify and improve the following text, fix any spelling or grammar errors";
    return baseAzureOpenAIAPI(userPrompt)(text, config);
}


export async function extendText(text: string, config: AzureOpenAIConfig): Promise<string> {
    const userPrompt = "Continue writing the following text, maintaining the style and context";
    return baseAzureOpenAIAPI(userPrompt)(text, config);
}

function baseAzureOpenAIAPI(prompt: string){
    const systemPrompt = "You are a helpful writing assistant that improves, corrects and continues writing text. please note the input text is from markdown file please keep the style and context";
    return async function (text: string, config: AzureOpenAIConfig){
        if (!config.apiKey || !config.endpoint || !config.deploymentName) {
            throw new Error('Azure OpenAI configuration is incomplete. Please check your settings.');
        }
    
        try {
            const response = await axios.post(
                `${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=2024-06-01`,
                {
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `${prompt}: "${text}"` }
                    ],
                    max_tokens: 3096
                },
                {
                    headers: {
                        'api-key': config.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            return processText(response.data.choices[0].message.content.trim());
        } catch (error) {
            console.error('Error calling Azure OpenAI API:', error);
            throw new Error('Failed to enhance text with Azure OpenAI');
        }
    };
}