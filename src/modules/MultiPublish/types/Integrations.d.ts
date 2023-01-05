export interface ArtIntegrations {
	services: {
		vk: ArtService & {
			// Group id
			id: string;
			// Permission token
			token: string;
		};
		telegram: ArtService & {
			// Channel id
			id: string;
		};
		twitter: ArtService & {
			// API token
			token: string;
		};
	};
	preferences: {};
}

export type ArtService = {
	default_tags: string[];
	tags: string[];
	enabled: 1 | 0;
};
