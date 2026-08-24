import type { EnvironmentEffectDefinition } from '../contracts/capabilities';

export class EnvironmentEffects {
  private readonly explicit = new Map<string, boolean>();
  private environment?: string;

  constructor(readonly definitions: EnvironmentEffectDefinition[]) {}

  setEnvironment(environment: string): void { this.environment = environment; }
  setEnabled(id: string, enabled: boolean): void {
    if (!this.definitions.some((definition) => definition.id === id)) throw new Error(`Unknown environment effect '${id}'`);
    this.explicit.set(id, enabled);
  }

  isEnabled(id: string): boolean {
    const forced = this.explicit.get(id);
    if (forced !== undefined) return forced;
    const definition = this.definitions.find((candidate) => candidate.id === id);
    return Boolean(definition && (!definition.enabledIn?.length || (this.environment && definition.enabledIn.includes(this.environment))));
  }

  active(): EnvironmentEffectDefinition[] { return this.definitions.filter((definition) => this.isEnabled(definition.id)); }
}
