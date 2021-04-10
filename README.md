# simple-cli

A simple, batteries-included CLI framework for NodeJS and TypeScript.

## Tell me more

**Disclaimer: Still in development**

#### TLDR

This project is in TypeScript, it provides a simplified way to define custom commands and use some bundled commands, along with the execution logic of the application, including alias expansion, option defaults, and a third-party plugin interface as primary pillars of the design.

#### The long version

I don't know about you, but when I want to make a CLI, it's to get something _done_. A quick and dirty script proves useful enough to warrant evolution. A process or resource needs to be codified for structured interactions. Typically, I choose a language I'm proficient in, my company has domain knowledge with, something that requires minimal overhead for consumers to install and run, will work on macOS / Windows / Linux, and finally, a language with a large ecosystem and supporting packages that make writing a program more of stacking up a bunch of blocks.

Luckily, the future is now and a good number of languages meet this criteria. I still find myself reaching for JS/TS when the primary goal is minimal development time.

As for assembling blocks, well, there probably are some options at this level of abstraction. However, in my experience, I'm aware of several popular argument parsing libraries, but not a good, well-known equivalent of `create-react-app` or `nextJS` for CLI. Or, maybe just not one that has the features _I_ want. So, this framework is the collection of a few blocks pre-assembled into a foundation that facilitates building robust, and powerful CLI applications on top of.

This framework is all about the common features and extensibility, the _simplest_ way to just say, "yes, I want those features in this CLI", and then start building so you can _get that thing done_ and it will be awesome.

## Features

### Help

`help` is the most basic common command. Print out information about all the commands or a specific one, every CLI needs this.

### Configuration

`config` provides 3 functions out-of-the box to provide a user-level persistent storage of convenience optimizations.

1. Profiles: You might use the same tool in a number of different ways or contexts, so a profile saves and restores a group of configuration under an alias.
1. Aliases: Take a long string of text or set of options and provide a short alias. Your aliases will be expanded from the original `argv` before being parsed into commands and options.
1. Defaults: Are you running a command using the same value for an option? Set it as a default and your option will be populated from this value. Aliases will be expanded, and therefore can act as a semantic-identifier for a more volatile or dynamic parameter.

### Plugins

Why stop with what your code does? Provide an API your command can interop with and then let your users load arbitrary modules with the functions they want.

The primary use-case this feature was designed around is time-series analysis. I wanted to run common analysis tasks on time-series data (a list of time, value pairs). Specifying how to source this data and process it has a number of _general_ parameters and then an arbitrary number of source-specific parameters. For instance, I might always want to configure the range of time to look at, and what kind of analysis to run. The input format is always the same, and thus the processing is common. I generalized a tool to do time-series analysis: [@tsa-tools/cli](https://github.com/randymarsh77/tsa-cli). However, it's also reasonable to want to swap out the actual data source and run this code in other contexts. For example, I want to look at performance of some servers using Grafana: [tsa-plugin-grafana](https://github.com/randymarsh77/tsa-plugin-grafana). If you want to run analysis on... ? Just make a module to source the data given some input parameters and use the existing CLI.
