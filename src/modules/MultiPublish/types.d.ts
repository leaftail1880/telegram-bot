export interface ArtIntegrations {
	services: {
		vk: ArtService & {
			// Group id
			id: number;
			// Permission token
			token: string;
		};
		telegram: ArtService & {
			// Channel id
			id: number;
		};
		twitter: ArtService & {
			// API token
			token: string;
		};
	};
	preferences: {
		groups: number[];
	};
}
export type Language = keyof typeof import("./index.js").ART["languages"];

export type ArtService = {
	default_tags: string[];
	tags: string[];
	enabled: 1 | 0;
	lang: Language;
};

export type AttachFunction = (ctx: Context) => any;
export type PostFunction = (ctx: Context) => any;

export interface ArtSceneCache {
	file_id?: string;
	waiting_lang?: Language;
	descriptions: Record<Language, string> | {};
	tags: Record<string, string[]>;
}
