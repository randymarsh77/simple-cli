import { OptionDefinition } from 'command-line-args';
import createUsage from 'command-line-usage';

export interface ICLIDefinition {
	name: string;
	version: string;
	summary: string;
	commands: ICommand<any>[];
}

export interface ICLI {
	null: ICommand<any>;
	[index: string]: ICommand<any>;
}

export interface ICommandInvocation<T> {
	argv: string[];
	cli: ICLI;
	options: T;
}

export interface ICommandResult {
	code: number;
	error?: string | Error;
}

export interface ICommand<T> {
	name: string;
	summary: string;
	definitions: OptionDefinition[];
	usage: createUsage.Section[];
	populateOptions?: () => Partial<T>;
	validate?: (invocation: ICommandInvocation<T>) => boolean;
	execute: (invocation: ICommandInvocation<T>) => Promise<ICommandResult>;
}

export interface IPlugin<TArgs, TResult> {
	execute: (args: TArgs) => TResult;
}

interface IPluggableOptions<TPluginArgs, TPluginResult> {
	plugin: IPlugin<TPluginArgs, TPluginResult>;
}

export type IPluggableCommand<TOptions, TPluginArgs, TPluginResult> = ICommand<
	TOptions & IPluggableOptions<TPluginArgs, TPluginResult>
>;
