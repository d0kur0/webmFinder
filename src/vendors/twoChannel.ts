import { File, Thread, VendorImplementation } from "../types";
import { defaultUrlOverrider } from "../utils/defaultUrlOverrider";
import { parse } from "date-fns";

type ThreadsResponse = {
	threads: {
		subject: string;
		num: string;
	}[];
};

type ThreadResponse = {
	threads: {
		posts: {
			date: string;
			files: [{ fullname: string; path: string; thumbnail: string }];
		}[];
	}[];
};

export const twoChannelFactory: VendorImplementation = props => {
	const urlOverrider = props?.urlOverrider || defaultUrlOverrider;

	return {
		async fetchThreads(boardName: string) {
			try {
				const requestUrl = urlOverrider(`https://2ch.hk/${boardName}/threads.json`);
				const response: ThreadsResponse = await fetch(requestUrl).then(r => r.json());

				return response.threads.map(
					(rawThread): Thread => ({
						id: +rawThread.num,
						url: `https://2ch.hk/${boardName}/res/${rawThread.num}.html`,
						board: boardName,
						subject: rawThread.subject,
					})
				);
			} catch (error) {
				console.warn(`twoChannel::fetchThreads error`);
				console.error(error);
				return [];
			}
		},

		async fetchFiles(thread: Thread) {
			try {
				const requestUrl = urlOverrider(
					`https://2ch.hk/${thread.board}/res/${thread.id}.json`
				);

				const response: ThreadResponse = await fetch(requestUrl).then(r => r.json());
				const rawFiles = response.threads?.[0].posts
					.map(({ files, date }) => files.map(file => ({ ...file, date })))
					.flat();

				const files = rawFiles.map<File>(rawFile => ({
					url: `https://2ch.hk${rawFile.path}`,
					name: rawFile.fullname,
					rootThread: thread,
					previewUrl: `https://2ch.hk${rawFile.thumbnail}`,
					date:
						+parse(
							rawFile.date.replace(/\s(.+)\s/, " "),
							"dd/MM/yy HH:mm:ss",
							new Date()
						) / 1000,
				}));

				if (!props?.requiredFileTypes) return files;

				return files.filter(({ url }) => {
					const fileType = url.split(".").pop();
					return props.requiredFileTypes?.includes(fileType || "");
				});
			} catch (error) {
				console.warn(`twoChannel::fetchFiles error`);
				console.error(error);
				return [];
			}
		},
	};
};
