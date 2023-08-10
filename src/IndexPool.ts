export class IndexPool {

  protected count: number = 0;
  protected pending: number[] = [];

  get(): number {
    if (this.pending.length) {
      return this.pending.pop()!;
    }
    return this.count++;
  }

  free(index: number): void {
    this.pending.push(index);
    this.pending.sort((a, b) => b - a);
  }

  get size(): number {
    return this.count;
  }
}
