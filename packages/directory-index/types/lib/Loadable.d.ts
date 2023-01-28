export class Loadable2 {
    static extension: string;
    static load(file: any): Promise<any>;
    static create(spec: any): Promise<Loadable2>;
    static init(obj: any, ...args: any[]): Promise<void>;
    constructor(spec: any);
    spec: any;
    init(): void;
}
export class Loadable {
    static extension: string;
    static create(spec: any, args: any): Promise<Loadable>;
    static autoInit: boolean;
    static init(obj: any): Promise<void>;
    constructor(spec: any, args?: {});
    spec: any;
    init(): Promise<void>;
    load(): Promise<void>;
    #private;
}
