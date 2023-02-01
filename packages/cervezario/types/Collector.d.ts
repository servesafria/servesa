export class Collector {
    constructor(config?: {});
    config: {
        getSpec: (_: any) => {};
        getParentName: (_: any) => any;
        pickExtends: (spec: any) => any;
    };
    collect: (...input: any[]) => {
        specs: any[];
        names: any[];
    };
    #private;
}
