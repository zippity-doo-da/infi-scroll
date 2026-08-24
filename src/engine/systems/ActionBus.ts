import type { ActionDefinition } from '../contracts/world';

type Handler = (action: ActionDefinition) => void;
export class ActionBus {
  private readonly handlers = new Set<Handler>();
  subscribe(handler: Handler): () => void { this.handlers.add(handler); return () => this.handlers.delete(handler); }
  dispatch(actions: ActionDefinition[]): void { actions.forEach((action) => this.handlers.forEach((handler) => handler(action))); }
}
