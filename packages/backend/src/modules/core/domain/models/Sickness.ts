import { Agg } from 'src/shared/Agg';

export interface SicknessProps {
  name: string;
  description?: string;
  symptoms: string[];
}

export class Sickness extends Agg<SicknessProps> {
  private constructor(props: SicknessProps, id?: string) {
    super(props, id);
  }

  static create(props: SicknessProps): Sickness {
    const instance = new Sickness(props);
    return instance;
  }

  static load(props: SicknessProps, id: string): Sickness {
    const instance = new Sickness(props, id);
    return instance;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get symptoms(): string[] {
    return this.props.symptoms;
  }
}
