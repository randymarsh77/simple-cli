import fs from 'fs';
import os from 'os';
import path from 'path';
import { ICLIDefinition } from '../types';

export interface ICLIContext {
	name: string;
	version: string;
	configFile: string;
}

let Context: ICLIContext;

export const configureCLIContext = (definition: ICLIDefinition) => {
	const { name, version, useDataDirectory } = definition;
	const dataDir = useDataDirectory ? path.join(os.homedir(), `.${name}`) : os.homedir();
	const configFileName = useDataDirectory ? `${name}.json` : `.${name}`;
	if (useDataDirectory) {
		fs.mkdirSync(dataDir, { recursive: true });
	}

	Context = {
		name,
		version,
		configFile: path.join(dataDir, configFileName),
	};
};

export const useCLIContext = (): ICLIContext => Context;
