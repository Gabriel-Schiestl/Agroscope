import { Agg } from 'src/shared/Agg';

interface KnowledgeProps {
  sicknessId: string;
  handling: string;
}

export class Knowledge extends Agg<KnowledgeProps> {
  constructor(props: KnowledgeProps, id?: string) {
    super(props, id);
  }

  static create(props: KnowledgeProps): Knowledge {
    const instance = new Knowledge(props);
    return instance;
  }

  static load(props: KnowledgeProps, id: string): Knowledge {
    const instance = new Knowledge(props, id);
    return instance;
  }

  changeHandling(handling: string): void {
    this.props.handling = handling;
  }

  get sicknessId(): string {
    return this.props.sicknessId;
  }

  get handling(): string {
    return this.props.handling;
  }
}
