export class PropertyState {
  private readonly targets = new Map<string, Map<string, string | number | boolean>>();

  set(target: string, property: string, value: string | number | boolean): void {
    const state = this.targets.get(target) ?? new Map();
    state.set(property, value);
    this.targets.set(target, state);
  }

  get(target: string, property: string): string | number | boolean | undefined { return this.targets.get(target)?.get(property); }
  snapshot(target: string): Readonly<Record<string, string | number | boolean>> { return Object.fromEntries(this.targets.get(target) ?? []); }
}
