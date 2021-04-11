import createOptions, { OptionDefinition } from 'command-line-args';
import commands from 'command-line-commands';
import { getActiveAliases, getActiveDefaults } from './commands/config';
import { configureCLIContext } from './context';
import { shared } from './options';
import { createCLI } from './utility';
import { ICLIDefinition } from './types';

const expand = (value: string, aliases: string[][]) =>
	value &&
	aliases.reduce((acc, v) => {
		const [alias, replacement] = v;
		return acc.replace(alias, replacement);
	}, value);

export const runCLI = async (definition: ICLIDefinition) => {
	let isDebug = false;
	try {
		configureCLIContext(definition);
		const cli = createCLI(definition);

		// Don't support alias expansion for config command, or you can't read/set aliases.
		const skipAliasExpansion = process.argv.length >= 3 && process.argv[2] === 'config';
		const aliases = getActiveAliases();
		if (!skipAliasExpansion) {
			process.argv = process.argv.map((x, i) => {
				if (i <= 1) {
					return x;
				}

				return expand(x, aliases);
			});
		}

		const { command, argv } = commands([null, ...Object.keys(cli)]);

		const pluginOption = '--plugin';
		let plugin: any = null;
		if (argv.includes(pluginOption)) {
			const pluginIndex = argv.indexOf(pluginOption);
			const moduleName = argv[pluginIndex + 1];
			const module = await import(moduleName); // eslint-disable-line
			plugin = module?.execute ? module : module?.default;
		}

		const cmd = cli[command || 'null'];
		const defaults = getActiveDefaults();
		const optionDefinitions = [
			...shared,
			...cmd.definitions,
			...((plugin?.definitions ?? []) as OptionDefinition[]),
		].map((x) => {
			x.defaultValue = expand(defaults[x.name], aliases) ?? x.defaultValue;
			return x;
		});
		const options = {
			...((cmd.populateOptions && cmd.populateOptions()) || {}),
			...((plugin?.populateOptions && plugin.populateOptions()) || {}),
			...createOptions(optionDefinitions, { argv }),
			plugin,
		};

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
