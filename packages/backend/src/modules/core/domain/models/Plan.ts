import { Agg } from 'src/shared/Agg';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';

export interface PlanProps {
    type: string;
    imageLimit: number;
    chatLimit: number;
    features: string[];
    featureFlags: string[];
    price: number;
}

export class Plan extends Agg<PlanProps> {
    static readonly FREE_TYPE = 'FREE';

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
        if (!props.featureFlags) {
            return Res.failure(
                new BusinessException('Feature flags are required'),
            );
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

    get featureFlags(): string[] {
        return this.props.featureFlags;
    }

    hasFeature(feature: string): boolean {
        return this.props.featureFlags.includes(feature);
    }

    get price(): number {
        return this.props.price;
    }
}
