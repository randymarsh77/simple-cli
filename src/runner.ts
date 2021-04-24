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

const loadPlugin = async (moduleName: string) => {
	const module = await import(moduleName); // eslint-disable-line
	return module?.execute ? module : module?.default;
};

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

		let pluginModuleName: string | null = null;

		// Try to load plugin from arguments
		const pluginOption = '--plugin';
		if (argv.includes(pluginOption)) {
			const pluginIndex = argv.indexOf(pluginOption);
			pluginModuleName = expand(argv[pluginIndex + 1], aliases);
		}

		// Try to load plugin from defaults
		const defaults = getActiveDefaults();
		if (!pluginModuleName && defaults['plugin']) {
			pluginModuleName = expand(defaults['plugin'], aliases);
		}

		const plugin = pluginModuleName && (await loadPlugin(pluginModuleName));

		const cmd = cli[command || 'null'];
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
