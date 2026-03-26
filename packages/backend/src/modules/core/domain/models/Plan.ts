import { Agg } from 'src/shared/Agg';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';

export interface PlanProps {
    type: string;
    imageLimit: number;
    chatLimit: number;
    features: string[];
    price: number;
}

export class Plan extends Agg<PlanProps> {
    private constructor(props: PlanProps, id?: string) {
        super(props, id);
    }

    static create(props: PlanProps): Result<BusinessException, Plan> {
        if (!props.type) {
            return Res.failure(new BusinessException('Type is required'));
        }
        if (props.imageLimit < 0) {
            return Res.failure(new BusinessException('Image limit is invalid'));
        }
        if (props.chatLimit < 0) {
            return Res.failure(new BusinessException('Chat limit is invalid'));
        }
        if (props.price < 0) {
            return Res.failure(new BusinessException('Price is invalid'));
        }
        if (!props.features) {
            return Res.failure(new BusinessException('Features are required'));
        }

        return Res.success(new Plan(props));
    }

    static load(props: PlanProps, id: string): Plan {
        const instance = new Plan(props, id);
        return instance;
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

    get features(): string[] {
        return this.props.features;
    }

    get price(): number {
        return this.props.price;
    }
}
