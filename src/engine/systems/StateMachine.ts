import type { SequenceActionDefinition, StateMachineDefinition } from '../contracts/capabilities';

export interface StateTransitionResult { changed: boolean; state: string; actions: SequenceActionDefinition[] }

export class StateMachine {
  private current: string;

  constructor(readonly definition: StateMachineDefinition) {
    if (!definition.states.includes(definition.initial)) throw new Error(`Unknown initial state '${definition.initial}'`);
    this.current = definition.initial;
  }

  send(event: string): StateTransitionResult {
    const transition = this.definition.transitions.find((candidate) => candidate.event === event && (candidate.from === '*' || candidate.from === this.current));
    if (!transition) return { changed: false, state: this.current, actions: [] };
    if (!this.definition.states.includes(transition.to)) throw new Error(`Unknown state '${transition.to}'`);
    this.current = transition.to;
    return { changed: true, state: this.current, actions: transition.actions ?? [] };
  }

  set(state: string): void {
    if (!this.definition.states.includes(state)) throw new Error(`Unknown state '${state}'`);
    this.current = state;
  }

  get state(): string { return this.current; }
}
