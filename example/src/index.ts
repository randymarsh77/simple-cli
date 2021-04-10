#!/usr/bin/env node

import { runCLI } from '../../src';
import { commands } from './commands';

runCLI({
	name: 'exa',
	version: '1.0.0',
	summary: 'An example CLI.',
	commands,
});
