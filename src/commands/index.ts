import { ICommand } from '../types';
import { createHelpCommand } from './help';
import { createConfigCommand } from './config';

export const createCommonCommands = (toolName: string): ICommand<any>[] => [
	createHelpCommand(toolName),
	createConfigCommand(toolName),
];
