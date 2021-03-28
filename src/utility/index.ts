import { createCommonCommands } from '../commands';
import { createDefaultCommand } from '../commands/default';
import { ICLI, ICLIDefinition } from '../types';

export const createCLI = ({ name, summary, commands }: ICLIDefinition) =>
	commands.concat(createCommonCommands(name)).reduce<ICLI>(
		(cli, cmd) => {
			cli[cmd.name] = cmd;
			return cli;
		},
		{ null: createDefaultCommand(name, summary, commands) }
	);
