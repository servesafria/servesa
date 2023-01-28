export function scanDirectory({ path, from, to, extensions }: {
    path?: string;
    from?: string;
    to?: string;
    extensions?: string[];
}): any[];
export * from "@servesa/utils";
export function pathToName(path: string, from?: string, to?: string): any;
export function isIndexPath(path: string, from?: string): boolean;
export function parsePath(path: any, from?: string, extension?: string): {
    file: any;
    name: any;
    extension: string;
    isIndex: boolean;
};
export function ancestorsOfName(name: string): string[];
