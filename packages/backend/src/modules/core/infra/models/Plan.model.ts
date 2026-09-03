import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { UserModel } from './User.model';

interface PlanModelProps {
    id: string;
    type: string;
    imageLimit: number;
    chatLimit: number;
    features: string[];
    featureFlags: string[];
    price: number;
}

@Entity('plan')
export class PlanModel extends BaseEntity implements PlanModelProps {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    type: string;

    @Column({ name: 'image_limit', type: 'int' })
    imageLimit: number;

    @Column({ name: 'chat_limit', type: 'int' })
    chatLimit: number;

    @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
    features: string[];

    @Column({
        type: 'jsonb',
        name: 'feature_flags',
        default: () => "'[]'::jsonb",
    })
    featureFlags: string[];

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'updated_at',
    })
    updatedAt: Date;

    @OneToMany(() => UserModel, (user) => user.plan_relation, {
        nullable: true,
    })
    users: UserModel[];

    setProps(props: PlanModelProps): PlanModel {
        Object.assign(this, props);
        return this;
    }
}
