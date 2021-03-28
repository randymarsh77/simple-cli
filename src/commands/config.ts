import fs from 'fs';
import os from 'os';
import path from 'path';
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
		const { name } = useCLIContext();
		const configFileName = path.join(os.homedir(), `.${name}`);
		if (fs.existsSync(configFileName)) {
			const data = fs.readFileSync(configFileName, 'utf8');
			const saved = JSON.parse(data) as IConfig;
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
	}

	return cache.config as IConfig;
};

const updateConfig = (updated: IConfig) => {
	cache.config = updated;
	const { name } = useCLIContext();
	const configFileName = path.join(os.homedir(), `.${name}`);
	const data = JSON.stringify(updated, null, '  ');
	fs.writeFileSync(configFileName, data, 'w');
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
];

interface IConfigOptions {
	profile: string;
	default: string;
	alias: string;
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
			const [alias, value] = options.alias.split('=').map((x) => x.trim());
			profile.aliases[alias] = value;
		}
		if (options.default) {
			const [option, value] = options.default.split('=').map((x) => x.trim());
			profile.defaults[option] = value;
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
