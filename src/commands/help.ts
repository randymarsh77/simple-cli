import createUsage from 'command-line-usage';
import { options } from '../options/global';
import { ICommandInvocation } from '../types';

const name = 'help';
const summary = 'Get some help for a command.';

export const createHelpCommand = (toolName: string) => ({
	name,
	summary,
	definitions: [...options],
	usage: [
		{
			header: `${toolName} ${name}`,
			content: summary,
		},
		{
			header: 'Synopsis',
			content: `$ ${toolName} ${name} <command>`,
		},
	],
	validate: ({ argv, cli }: ICommandInvocation<any>) => {
		const hasZeroOrOneArgs = !argv || argv.length < 2;
		if (!hasZeroOrOneArgs) {
			throw new Error(`help only accepts 0 or 1 arguments. Found ${argv.length}: ${argv}`);
		}
		const command = argv.length === 1 ? argv[0] : 'help';
		const isValid = cli[command];
		if (!isValid) {
			throw new Error(`Unknown command to get help with: ${command}`);
		}
		return true;
	},
	execute: async ({ argv, cli }: ICommandInvocation<any>) => {
		console.log(createUsage(cli[(argv && argv.length === 1 && argv[0]) || 'help'].usage));
		return {
			code: 0,
		};
	},
});
