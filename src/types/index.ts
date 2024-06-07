import { OptionDefinition } from 'command-line-args';
import createUsage from 'command-line-usage';

export interface ICLIDefinition {
	name: string;
	version: string;
	summary: string;
	commands: ICommand<any>[];
	/**
	 * Default settings file is `~/.name`. If `useDataDirectory` is true, the default settings file is `~/.name/name.json`.
	 */
	useDataDirectory?: boolean;
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
	execute: (args: TArgs, options: any) => TResult;
}

export interface IPluginWithOptions<TOptions, TArgs, TResult> {
	definitions: OptionDefinition[];
	execute: (args: TArgs, options: TOptions) => TResult;
}

interface IPluggableOptions<TPluginArgs, TPluginResult> {
	plugin: IPlugin<TPluginArgs, TPluginResult>;
}

export type IPluggableCommand<TOptions, TPluginArgs, TPluginResult> = ICommand<
	TOptions & IPluggableOptions<TPluginArgs, TPluginResult>
>;
