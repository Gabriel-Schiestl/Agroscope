export class RepositoryNoDataFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryNoDataFound';
  }
}
