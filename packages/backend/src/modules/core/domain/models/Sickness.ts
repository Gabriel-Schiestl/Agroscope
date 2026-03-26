import { Agg } from 'src/shared/Agg';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';

export interface SicknessProps {
  name: string;
  description?: string;
  symptoms: string[];
}

export class Sickness extends Agg<SicknessProps> {
  private constructor(props: SicknessProps, id?: string) {
    super(props, id);
  }

  static create(props: SicknessProps): Result<BusinessException, Sickness> {
    if (!props.name) {
      return Res.failure(new BusinessException('Name is required'));
    }
    if (!props.symptoms || props.symptoms.length === 0) {
      return Res.failure(new BusinessException('Symptoms are required'));
    }

    return Res.success(new Sickness(props));
  }

  static load(props: SicknessProps, id: string): Sickness {
    const instance = new Sickness(props, id);
    return instance;
  }

  static isSickness(entity: any): entity is Sickness {
    return entity instanceof Sickness;
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
