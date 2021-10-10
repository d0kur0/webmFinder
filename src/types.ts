export type Thread = {
	id: number;
	url: string;
	board: string;
	subject: string;
};

export type Threads = Thread[];

export type File = {
	url: string;
	name: string;
	previewUrl: string;
};

export type Files = File[];

export type UrlOverrider = (url: string) => string;

export type VendorMethods = {
	fetchThreads(boardName: string): Promise<Threads>;
	fetchFiles(thread: Thread): Promise<Files>;
};

export type VendorProps = {
	urlOverrider?: UrlOverrider;
	requiredFileTypes?: string[];
};

export type VendorImplementation = (props?: VendorProps) => VendorMethods;