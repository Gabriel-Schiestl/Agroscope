import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanModel } from './Plan.model';
import { LimitModel } from './Limit.model';

export interface UserModelProps {
    id: string;
    name: string;
    email: string;
    limit: LimitModel;
    planId?: string;
    termsAcceptedAt?: Date;
    termsVersion?: string;
}

@Entity('user')
export class UserModel extends BaseEntity implements UserModelProps {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true, name: 'plan_id' })
    planId?: string;

    @ManyToOne(() => PlanModel, (plan) => plan.users, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'plan_id' })
    plan_relation?: PlanModel;

    @OneToOne(() => LimitModel, (limit) => limit.user_relation, {
        nullable: false,
        onDelete: 'CASCADE',
        cascade: ['insert', 'update'],
    })
    limit: LimitModel;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        nullable: true,
        name: 'terms_accepted_at',
    })
    termsAcceptedAt?: Date;

    @Column({ nullable: true, name: 'terms_version' })
    termsVersion?: string;

    setProps(props: UserModelProps): this {
        Object.assign(this, props);

        return this;
    }
}
