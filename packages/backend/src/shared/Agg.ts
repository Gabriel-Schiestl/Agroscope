import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';

export class Agg<P> extends AggregateRoot {
  private readonly _id?: string;
  protected readonly props: P;

  protected constructor(props: P, id?: string) {
    super();
    this._id = id || uuid();
    this.props = props;
  }

  get id() {
    return this._id;
  }
}
