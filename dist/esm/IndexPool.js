export class IndexPool {
    constructor(sort = false) {
        this.sort = sort;
        this.count = 0;
        this.pending = [];
    }
    get() {
        if (this.pending.length) {
            return this.pending.pop();
        }
        return this.count++;
    }
    free(index) {
        this.pending.push(index);
        this.sort && this.pending.sort((a, b) => b - a);
    }
    get size() {
        return this.count;
    }
}
