import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserModel } from './User.model';

export interface LimitModelProps {
    id: string;
    userId: string;
    imageCount: number;
    chatCount: number;
    lastAnalysis?: Date;
    lastMessage?: Date;
}

@Entity('limit')
export class LimitModel extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => UserModel, (user) => user.limit_relation, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user_relation?: UserModel;

    @Column({ name: 'image_count', type: 'int', default: 0 })
    imageCount: number;

    @Column({ name: 'chat_count', type: 'int', default: 0 })
    chatCount: number;

    @Column({ name: 'last_analysis', nullable: true, type: 'timestamp' })
    lastAnalysis?: Date;

    @Column({ name: 'last_message', nullable: true, type: 'timestamp' })
    lastMessage?: Date;

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

    setProps(props: LimitModelProps): LimitModel {
        Object.assign(this, props);
        return this;
    }
}
