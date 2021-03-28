import createOptions from 'command-line-args';
import commands from 'command-line-commands';
import { configureCLIContext } from './context';
import { createCLI } from './utility';
import { ICLIDefinition } from './types';

export const runCLI = async (definition: ICLIDefinition) => {
	let isDebug = false;
	try {
		configureCLIContext(definition);

		const cli = createCLI(definition);
		const { command, argv } = commands([null, ...Object.keys(cli)]);
		const cmd = cli[command || 'null'];
		const options = {
			...((cmd.populateOptions && cmd.populateOptions()) || {}),
			...createOptions(cmd.definitions, { argv }),
		};

		if (options.plugin) {
			const plugin = await import(options.plugin); // eslint-disable-line
			options.plugin = plugin;
		}

		const context = { argv, cli, options };
		isDebug = options.debug;
		if (cmd.validate) {
			cmd.validate(context);
		}

		const { code, error } = await cmd.execute(context);
		if (error) {
			console.error(error);
		}
		process.exit(code);
	} catch (error) {
		console.error(error.message);
		if (isDebug) {
			console.error(error);
		}
		process.exit(1);
	}
};
