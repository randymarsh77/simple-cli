import fs from 'fs';
import { useCLIContext } from '../context';
import { ICommand } from '../types';

interface IProfile {
	aliases: {
		[index: string]: string;
	};
	defaults: {
		[index: string]: string;
	};
}

interface IConfig {
	currentProfile: string;
	profiles: {
		default: IProfile;
		[profile: string]: IProfile;
	};
}

interface ICachedConfig {
	config?: IConfig;
}

const cache: ICachedConfig = {};
const resolveConfig = (): IConfig => {
	if (!cache.config) {
		const { configFile } = useCLIContext();
		const data = fs.existsSync(configFile) && fs.readFileSync(configFile, 'utf8');
		const saved = ((data && JSON.parse(data)) || {}) as IConfig;
		const config = {
			currentProfile: saved?.currentProfile ?? 'default',
			profiles: {
				...(saved?.profiles ?? {}),
				default: {
					aliases: saved?.profiles?.default?.aliases ?? {},
					defaults: saved?.profiles?.default?.defaults ?? {},
				},
			},
		};
		cache.config = config;
	}

	return cache.config as IConfig;
};

const updateConfig = (updated: IConfig) => {
	cache.config = updated;
	const { configFile } = useCLIContext();
	const data = JSON.stringify(updated, null, '  ');
	fs.writeFileSync(configFile, data, 'utf8');
};

export const getActiveAliases = () => {
	const { currentProfile, profiles } = resolveConfig();
	const profile = profiles[currentProfile] || profiles.default;
	return Object.keys(profile.aliases).map((k) => [k, profile.aliases[k]]);
};

export const getActiveDefaults = () => {
	const { currentProfile, profiles } = resolveConfig();
	const profile = profiles[currentProfile] || profiles.default;
	return profile.defaults;
};

export const getOptionDefault = (option: string) => {
	const { currentProfile, profiles } = resolveConfig();
	const profile = profiles[currentProfile] || profiles.default;
	return profile.defaults[option];
};

const name = 'config';
const summary = 'Stores values to simplify usage.';

const options = [
	{
		name: 'profile',
		type: String,
		description: 'Associate values with a given profile.',
	},
	{
		name: 'default',
		type: String,
		description: 'Set a default value for an option.',
	},
	{
		name: 'alias',
		type: String,
		description: 'Set an alias.',
	},
	{
		name: 'delete',
		type: Boolean,
		description: 'Delete the associate value.',
	},
];

interface IConfigOptions {
	profile?: string;
	default?: string;
	alias?: string;
	delete?: boolean;
}

export const createConfigCommand = (toolName: string): ICommand<IConfigOptions> => ({
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
			content: `$ ${toolName} ${name} <options>`,
		},
	],
	execute: async ({ options }) => {
		const config = resolveConfig();
		const profileKey = options.profile || 'default';
		const profile = config.profiles[profileKey] || { aliases: {}, defaults: {} };
		if (options.alias) {
			if (options.alias.includes('=')) {
				const [alias, value] = options.alias.split('=').map((x) => x.trim());
				profile.aliases[alias] = value;
			} else if (options.delete) {
				const { alias } = options;
				delete profile.aliases[alias];
			} else {
				const { alias } = options;
				const value = profile.aliases[alias];
				console.log(`Alias '${alias}' ${value ? `: '${value}'` : 'is not set'}`);
			}
		}
		if (options.default) {
			if (options.default.includes('=')) {
				const [option, value] = options.default.split('=').map((x) => x.trim());
				profile.defaults[option] = value;
			} else if (options.delete) {
				delete profile.defaults[options.default];
			} else {
				const value = profile.defaults[options.default];
				console.log(`Default '${options.default}' ${value ? `: '${value}'` : 'is not set'}`);
			}
		}

		updateConfig({
			...config,
			profiles: {
				...config.profiles,
				[profileKey]: profile,
			},
		});

		return {
			code: 0,
		};
	},
});
