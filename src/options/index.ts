import { OptionDefinition } from 'command-line-args';
import { options as global } from './global';
import { options as plugin } from './plugin';

export const shared: OptionDefinition[] = [...global, ...plugin];
