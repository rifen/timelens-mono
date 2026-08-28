import * as vscode from 'vscode';
import { DurationHoverProvider } from './provider/durationHover';

export function activate(context: vscode.ExtensionContext) {
  console.log('TimeLens: activating...');
  
  // Register hover provider for all languages (we filter in the provider)
  const selector: vscode.DocumentSelector = '*';
  
  const provider = new DurationHoverProvider();
  const disposable = vscode.languages.registerHoverProvider(selector, provider);
  
  context.subscriptions.push(disposable);
  
  // Register a command to manually toggle (optional)
  const toggleCmd = vscode.commands.registerCommand('timelens.toggle', () => {
    const config = vscode.workspace.getConfiguration('timelens');
    const current = config.get('enabled', true);
    config.update('enabled', !current, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`TimeLens ${!current ? 'enabled' : 'disabled'}`);
  });
  
  context.subscriptions.push(toggleCmd);
  
  console.log('TimeLens: activated');
}

export function deactivate() {
  console.log('TimeLens: deactivated');
}