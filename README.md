# Markdown AI Assistant

Markdown AI Assistant is a Visual Studio Code extension designed to enhance your Markdown writing experience using Azure OpenAI. With this tool, you can easily select text and generate AI-powered enhancements or continuations directly within the editor.

## Features

- Enhance or continue selected Markdown text using Azure OpenAI.
- Inline display of original and enhanced text with accept/reject buttons.
- Configurable Azure OpenAI settings (API key, endpoint, deployment name).

## Installation

1. Visit the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/).
2. Search for Markdown AI Assistant.
3. Click `Install` to add the extension.

## Configuration

To use the Markdown Assistant extension, you need to configure your Azure OpenAI settings:

1. Open the settings in VS Code (`Ctrl+,` or `Cmd+,` on macOS).
2. Search for Markdown Assistant or navigate to `Extensions > Markdown Assistant`.
3. Set the following configuration options:
   - **API Key**: Your Azure OpenAI API key.
   - **Endpoint**: Your Azure OpenAI endpoint.
   - **Deployment Name**: Your Azure OpenAI deployment name.

Alternatively, you can set these options directly in your `settings.json` file.

## Usage

![](https://raw.githubusercontent.com/aaronisme/markdown-assistant/main/images/sample.png)

1. Select the text you wish to enhance or continue writing in your Markdown file.
2. Click `Improve Writing` to enhance the selected text; this will fix any typos or grammatical issues.
3. Click `Continue Writing` to expand the text based on your selection.
4. Choose `Accept` or `Reject` for the generated recommendation.