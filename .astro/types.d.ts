declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;
	export type CollectionEntry<C extends keyof AnyEntryMap> = Flatten<AnyEntryMap[C]>;

	// TODO: Remove this when having this fallback is no longer relevant. 2.3? 3.0? - erika, 2023-04-04
	/**
	 * @deprecated
	 * `astro:content` no longer provide `image()`.
	 *
	 * Please use it through `schema`, like such:
	 * ```ts
	 * import { defineCollection, z } from "astro:content";
	 *
	 * defineCollection({
	 *   schema: ({ image }) =>
	 *     z.object({
	 *       image: image(),
	 *     }),
	 * });
	 * ```
	 */
	export const image: never;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog copy": {
"complete-guide-fullstack-development.md": {
	id: "complete-guide-fullstack-development.md";
  slug: "complete-guide-fullstack-development";
  body: string;
  collection: "blog copy";
  data: any
} & { render(): Render[".md"] };
"essential-data-structures-algorithms.md": {
	id: "essential-data-structures-algorithms.md";
  slug: "essential-data-structures-algorithms";
  body: string;
  collection: "blog copy";
  data: any
} & { render(): Render[".md"] };
"how-to-become-frontend-master.md": {
	id: "how-to-become-frontend-master.md";
  slug: "how-to-become-frontend-master";
  body: string;
  collection: "blog copy";
  data: any
} & { render(): Render[".md"] };
"kitchensink.mdx": {
	id: "kitchensink.mdx";
  slug: "kitchensink";
  body: string;
  collection: "blog copy";
  data: any
} & { render(): Render[".mdx"] };
};
"blog": {
"rallye de lisieux.md": {
	id: "rallye de lisieux.md";
  slug: "rallye-de-lisieux";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"rallye du treport.md": {
	id: "rallye du treport.md";
  slug: "rallye-du-treport";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};
"sponsors": {
"CrediAgricole.md": {
	id: "CrediAgricole.md";
  slug: "crediagricole";
  body: string;
  collection: "sponsors";
  data: InferEntrySchema<"sponsors">
} & { render(): Render[".md"] };
"Dekra.md": {
	id: "Dekra.md";
  slug: "dekra";
  body: string;
  collection: "sponsors";
  data: InferEntrySchema<"sponsors">
} & { render(): Render[".md"] };
"bigmatt.md": {
	id: "bigmatt.md";
  slug: "bigmatt";
  body: string;
  collection: "sponsors";
  data: InferEntrySchema<"sponsors">
} & { render(): Render[".md"] };
"cesi.md": {
	id: "cesi.md";
  slug: "cesi";
  body: string;
  collection: "sponsors";
  data: InferEntrySchema<"sponsors">
} & { render(): Render[".md"] };
"ismans.md": {
	id: "ismans.md";
  slug: "ismans";
  body: string;
  collection: "sponsors";
  data: InferEntrySchema<"sponsors">
} & { render(): Render[".md"] };
};
"team": {
"Khaled al jundi.md": {
	id: "Khaled al jundi.md";
  slug: "khaled-al-jundi";
  body: string;
  collection: "team";
  data: InferEntrySchema<"team">
} & { render(): Render[".md"] };
"Pierre engerant.md": {
	id: "Pierre engerant.md";
  slug: "pierre-engerant";
  body: string;
  collection: "team";
  data: InferEntrySchema<"team">
} & { render(): Render[".md"] };
"Xavier tellier.md": {
	id: "Xavier tellier.md";
  slug: "xavier-tellier";
  body: string;
  collection: "team";
  data: InferEntrySchema<"team">
} & { render(): Render[".md"] };
"baptiste cassette.md": {
	id: "baptiste cassette.md";
  slug: "baptiste-cassette";
  body: string;
  collection: "team";
  data: InferEntrySchema<"team">
} & { render(): Render[".md"] };
"charles-perrard.md": {
	id: "charles-perrard.md";
  slug: "charles-perrard";
  body: string;
  collection: "team";
  data: InferEntrySchema<"team">
} & { render(): Render[".md"] };
"gregoire_olliver.md": {
	id: "gregoire_olliver.md";
  slug: "gregoire_olliver";
  body: string;
  collection: "team";
  data: InferEntrySchema<"team">
} & { render(): Render[".md"] };
"mathis aymard.md": {
	id: "mathis aymard.md";
  slug: "mathis-aymard";
  body: string;
  collection: "team";
  data: InferEntrySchema<"team">
} & { render(): Render[".md"] };
"willian beguin.md": {
	id: "willian beguin.md";
  slug: "willian-beguin";
  body: string;
  collection: "team";
  data: InferEntrySchema<"team">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		"timeline": {
};

	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
