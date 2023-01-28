/**
 * Deep merge conf objects
 * @param  {object} ...objects conf objects to merge
 * @returns {object} merged conf object
 */
export function mergeConf(...objects: any[]): object;
export function report(...args: any[]): void;
export function reportAgain(...args: any[]): void;
/**
 * Get items of array or object sorted according to a function applied to each item
 * @param  {array} arr an array or object to sort
 * @param  {function} fn the items in arr will be sorted by fn(item)
 * @returns {array} sorted array
 */
export function sortBy(arr: any[], fn: Function): any[];
/**
 * @param  {any} ...items
 * @returns {array} a flat array, with null and undefined values removed
 */
export function toFlatArray(...items: any[]): any[];
/**
 * @returns {string} a random string
 */
export function randomString(): string;
export function callbackify(fn: any): (...args: any[]) => Promise<void>;
export function promisify(fn: any): (...args: any[]) => any;
export function splitKeys(obj: any, sep?: string): {};
export function mapKeys(obj: any, fn: any): {};
