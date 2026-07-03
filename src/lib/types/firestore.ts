/**
 * Structural Firestore Timestamp. Both the client SDK and Admin SDK Timestamp
 * classes satisfy this shape, so domain models can be produced by either side
 * without nominal type conflicts. Use format.toDate() to read the value.
 */
export interface Timestamp {
  toDate(): Date;
  toMillis(): number;
  readonly seconds: number;
  readonly nanoseconds: number;
}

/** Serialized form used when a document must cross into a Client Component. */
export type Serialized<T> = {
  [K in keyof T]: T[K] extends Timestamp
    ? string
    : T[K] extends Timestamp | null
      ? string | null
      : T[K];
};
