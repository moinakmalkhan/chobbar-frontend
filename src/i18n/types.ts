import type en from "./dictionaries/en.json";

export type Dictionary = typeof en;

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = T extends string
  ? never
  : { [K in keyof T]: T[K] extends string ? K : Join<K, Paths<T[K]>> }[keyof T];

/** Every valid dotted key in the English dictionary, e.g. "cart.title". */
export type TranslationKey = Paths<Dictionary> & string;
