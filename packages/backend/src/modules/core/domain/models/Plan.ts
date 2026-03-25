import { Agg } from 'src/shared/Agg';

export interface PlanProps {
  type: string;
  imageLimit: number;
  chatLimit: number;
}

export class Plan extends Agg<PlanProps> {
  private constructor(props: PlanProps, id?: string) {
    super(props, id);
  }

  static create(props: PlanProps): Plan {
    const instance = new Plan(props);
    return instance;
  }

  static load(props: PlanProps, id: string): Plan {
    const instance = new Plan(props, id);
    return instance;
  }

  static isPlan(entity: any): entity is Plan {
    return entity instanceof Plan;
  }

  get type(): string {
    return this.props.type;
  }

  get imageLimit(): number {
    return this.props.imageLimit;
  }

  get chatLimit(): number {
    return this.props.chatLimit;
  }
}
