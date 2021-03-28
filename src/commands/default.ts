import createUsage from 'command-line-usage';
import { useCLIContext } from '../context';
import { options } from '../options/global';
import { ICommand } from '../types';

interface IDefaultCommandOptions {
	version: boolean;
}

export const createDefaultCommand = (
	toolName: string,
	toolDescription: string,
	commands: ICommand<any>[]
): ICommand<IDefaultCommandOptions> => ({
	name: 'null',
	summary: `Lists information about ${toolName}`,
	definitions: [
		...options,
		{ name: 'version', alias: 'v', type: Boolean, description: 'Print the version number.' },
	],
	usage: [
		{
			header: toolName,
			content: toolDescription,
		},
		{
			header: 'Synopsis',
			content: `$ ${toolName} <command> <options>`,
		},
		{
			header: 'Command List',
			content: commands.map(({ name, summary }) => ({ name, summary })),
		},
	],
	execute: async ({ options, cli }) => {
		const { version } = useCLIContext();
		console.log(options.version ? version : createUsage(cli.null.usage));
		return {
			code: 0,
		};
	},
});
