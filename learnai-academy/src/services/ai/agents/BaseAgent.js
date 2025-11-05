export class BaseAgent {
  constructor({ name = 'BaseAgent' } = {}) { this.name = name; }
  async respond(input) { return `${this.name} received: ${input}`; }
}
