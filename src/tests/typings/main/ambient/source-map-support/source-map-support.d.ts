// Compiled using typings@0.6.6
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/0018f1f6c62f7a899c229ce7522e40b47ca43d95/source-map-support/source-map-support.d.ts
// Type definitions for source-map-support 0.2.10
// Project: https://github.com/evanw/source-map-support
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped


declare module 'source-map-support' {
	/**
	 * Output of retrieveSourceMap().
	 */
	export interface UrlAndMap {
		url: string;
		map: string|Buffer;
	}

	/**
	 * Options to install().
	 */
	export interface Options {
		handleUncaughtExceptions?: boolean;
		emptyCacheBetweenOperations?: boolean;
		retrieveFile?: (path: string) => string;
		retrieveSourceMap?: (source: string) => UrlAndMap;
	}

	export interface Position {
		source: string;
		line: number;
		column: number;
	}

	export function wrapCallSite(frame: any /* StackFrame */): any /* StackFrame */;
	export function getErrorSource(error: Error): string;
	export function mapSourcePosition(position: Position): Position;
	export function retrieveSourceMap(source: string): UrlAndMap;

	/**
	 * Install SourceMap support.
	 * @param options Can be used to e.g. disable uncaughtException handler.
	 */
	export function install(options?: Options): void;
}