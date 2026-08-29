#!/usr/bin/env node

/**
 * TimeScope Core Bridge for Neovim
 * 
 * Reads JSON from stdin: { token: string, line: string }
 * Returns JSON on stdout: { text: string, hint?: string } | null
 */

import { detectDuration, formatDurationFull } from '@rifen/timescope-core';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line: string) => {
  try {
    const { token, line: context } = JSON.parse(line);
    const result = detectDuration(token, context);
    
    if (result) {
      const formatted = formatDurationFull(result.value, result.unit, {
        format: 'compact',
        showBreakdown: true,
        showUnitLabel: true
      });
      
      const response = {
        text: formatted,
        hint: result.contextHint || undefined
      };
      
      console.log(JSON.stringify(response));
    } else {
      console.log(JSON.stringify(null));
    }
  } catch (err) {
    console.error(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
  }
});