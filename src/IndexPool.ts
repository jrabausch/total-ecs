export class IndexPool {
  protected count: number = 0;
  protected readonly pending: number[] = [];

  constructor(
    protected readonly sort: boolean = false
  ) {
  }

  get(): number {
    if (this.pending.length) {
      return this.pending.pop()!;
    }
    return this.count++;
  }

  free(index: number): void {
    this.pending.push(index);
    this.sort && this.pending.sort((a, b) => b - a);
  }

  get size(): number {
    return this.count;
  }
}
