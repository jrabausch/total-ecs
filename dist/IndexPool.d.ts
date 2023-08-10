export declare class IndexPool {
    protected count: number;
    protected pending: number[];
    get(): number;
    free(index: number): void;
    get size(): number;
}
