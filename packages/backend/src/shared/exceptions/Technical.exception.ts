export class TechnicalException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TechnicalException';
  }
}
