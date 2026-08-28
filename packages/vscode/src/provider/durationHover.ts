import * as vscode from 'vscode';
import { detectDuration, formatDurationFull } from '@rifen/timelens-core';
import { getSettings } from '../config/settings';

export class DurationHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.Hover | null {
    const settings = getSettings();

    if (!settings.enabled) return null;

    const lineText = document.lineAt(position.line).text;

    // Find the best candidate token/expression at or near the cursor
    const candidate = this.extractCandidate(lineText, position.character, position.line);
    if (!candidate) return null;

    const { token, range } = candidate;

    // Use @rifen/timelens-core for detection
    const duration = detectDuration(token, lineText, settings);

    if (!duration) return null;

    // Use @rifen/timelens-core for formatting
    const formatted = formatDurationFull(duration.value, duration.unit, {
      format: settings.format,
      showBreakdown: settings.showBreakdown,
      showUnitLabel: settings.showUnitLabel
    });

    // Build markdown tooltip — just the human-readable duration
    const lines: string[] = [formatted];

    // Show what the inferred context was
    if (duration.source === 'context' && duration.contextHint) {
      lines.push('');
      lines.push(`*inferred from ${duration.contextHint}*`);
    }

    return new vscode.Hover(lines.join('\n'), range);
  }

  private extractCandidate(
    line: string,
    charPos: number,
    lineNum: number
  ): { token: string; range: vscode.Range } | null {
    // First, try to find a variable assignment pattern: NAME = EXPRESSION
    const assignmentMatch = line.match(/^(\s*)([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (assignmentMatch) {
      const [, leading, varName, expression] = assignmentMatch;
      const varStart = leading.length;
      const varEnd = varStart + varName.length;
      const exprStart = varEnd + (assignmentMatch[0].length - (leading.length + varName.length + expression.length));

      // Check if cursor is on the variable name
      if (charPos >= varStart && charPos <= varEnd) {
        // Return the full expression as the token
        return {
          token: expression.trim(),
          range: new vscode.Range(
            new vscode.Position(lineNum, varStart),
            new vscode.Position(lineNum, varEnd)
          )
        };
      }

      // Check if cursor is on or near the expression
      if (charPos >= exprStart && charPos <= exprStart + expression.length) {
        return {
          token: expression.trim(),
          range: new vscode.Range(
            new vscode.Position(lineNum, exprStart),
            new vscode.Position(lineNum, exprStart + expression.length)
          )
        };
      }
    }

    // Fall back to word-based detection for bare values
    const wordRange = this.getWordRangeAtPosition(line, charPos);
    if (!wordRange) return null;

    const word = line.substring(wordRange.start, wordRange.end);

    // Check if this word is part of an arithmetic expression
    const expressionMatch = this.findContainingExpression(line, wordRange.start, wordRange.end);
    if (expressionMatch) {
      return {
        token: expressionMatch.expression.trim(),
        range: new vscode.Range(
          new vscode.Position(lineNum, expressionMatch.start),
          new vscode.Position(lineNum, expressionMatch.end)
        )
      };
    }

    return {
      token: word,
      range: new vscode.Range(
        new vscode.Position(lineNum, wordRange.start),
        new vscode.Position(lineNum, wordRange.end)
      )
    };
  }

  private getWordRangeAtPosition(line: string, charPos: number): { start: number; end: number } | null {
    // Find word boundaries (alphanumeric, underscore, dots, operators)
    let start = charPos;
    let end = charPos;

    // Expand backward
    while (start > 0 && /[\w\.\$\*]/.test(line[start - 1])) {
      start--;
    }

    // Expand forward
    while (end < line.length && /[\w\.\$\*]/.test(line[end])) {
      end++;
    }

    if (start === end) return null;
    return { start, end };
  }

  private findContainingExpression(
    line: string,
    wordStart: number,
    wordEnd: number
  ): { expression: string; start: number; end: number } | null {
    // Look for arithmetic operators around the word
    const operators = /[\+\-\*\/\(\)]/;

    let start = wordStart;
    let end = wordEnd;

    // Expand backward to find start of expression
    while (start > 0) {
      const char = line[start - 1];
      if (/\s/.test(char)) {
        // Check if previous non-space is an operator
        let i = start - 1;
        while (i >= 0 && /\s/.test(line[i])) i--;
        if (i >= 0 && operators.test(line[i])) {
          start = i + 1;
          continue;
        }
        break;
      }
      if (operators.test(char) || /[\w\.]/.test(char)) {
        start--;
        continue;
      }
      break;
    }

    // Expand forward to find end of expression
    while (end < line.length) {
      const char = line[end];
      if (/\s/.test(char)) {
        // Check if next non-space is an operator
        let i = end;
        while (i < line.length && /\s/.test(line[i])) i++;
        if (i < line.length && operators.test(line[i])) {
          end = i;
          continue;
        }
        break;
      }
      if (operators.test(char) || /[\w\.]/.test(char)) {
        end++;
        continue;
      }
      break;
    }

    // Must contain at least one operator to be an expression
    const expression = line.substring(start, end);
    if (/[\+\-\*\/]/.test(expression)) {
      return { expression, start, end };
    }

    return null;
  }
}