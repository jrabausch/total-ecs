export declare class IndexPool {
    protected readonly sort: boolean;
    protected count: number;
    protected readonly pending: number[];
    constructor(sort?: boolean);
    get(): number;
    free(index: number): void;
    get size(): number;
}
