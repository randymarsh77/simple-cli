export interface ICLIContext {
	name: string;
	version: string;
}

let Context: ICLIContext;

export const configureCLIContext = (context: ICLIContext) => {
	Context = context;
};

export const useCLIContext = (): ICLIContext => Context;
