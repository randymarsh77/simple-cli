import { ICommand } from '../../../src';

const options = [
	{
		name: 'data',
		type: String,
		description: 'Some data.',
	},
];

interface IExaOptions {
	data: string;
}

const name = 'null';
const summary = 'Logs some data.';

export const exa: ICommand<IExaOptions> = {
	name,
	summary,
	definitions: [...options],
	usage: [
		{
			header: `exa`,
			content: summary,
		},
		{
			header: 'Synopsis',
			content: `$ exa <options>`,
		},
	],
	execute: async ({ options }) => {
		const { data } = options;
		console.log(`Your data is: ${data}`);

		return { code: 0 };
	},
};
