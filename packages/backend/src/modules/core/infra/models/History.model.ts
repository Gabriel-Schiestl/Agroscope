import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';

export interface HistoryModelProps {
    id: string;
    createdAt: Date;
    sickness: string;
    sicknessConfidence?: number;
    crop: string;
    cropConfidence: number;
    handling?: string;
    image: string;
    explanation?: string;
    userId?: string;
    causes?: string;
}

@Entity('history')
export class HistoryModel extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('timestamp', {
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;

    @Column({ name: 'sickness' })
    sickness: string;

    @Column({ nullable: true, name: 'sickness_confidence', type: 'float' })
    sicknessConfidence: number;

    @Column()
    crop: string;

    @Column({ name: 'crop_confidence', type: 'float' })
    cropConfidence: number;

    @Column({ nullable: true })
    handling: string;

    @Column('text')
    image: string;

    @Column({ nullable: true, name: 'explanation' })
    explanation?: string;

    @Column({ nullable: true, name: 'user_id' })
    userId?: string;

    @Column({ name: 'causes' })
    causes: string;

    setProps(props: HistoryModelProps): HistoryModel {
        Object.assign(this, props);
        return this;
    }
}
