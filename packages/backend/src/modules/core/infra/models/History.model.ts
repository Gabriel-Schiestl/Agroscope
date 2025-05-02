import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { SicknessModel } from './Sickness.model';

export interface HistoryModelProps {
    id: string;
    createdAt: Date;
    sickness: SicknessModel;
    sicknessConfidence?: number;
    crop: string;
    cropConfidence: number;
    handling?: string;
    image: string;
    clientId?: string;
    userId?: string;
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

    @Column({ nullable: true, name: 'sickness_id' })
    sicknessId?: string;

    @ManyToOne(() => SicknessModel, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sickness_id' })
    sickness: SicknessModel;

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

    @Column({ nullable: true, name: 'client_id' })
    clientId?: string;

    @Column({ nullable: true, name: 'user_id' })
    userId?: string;

    setProps(props: HistoryModelProps): HistoryModel {
        Object.assign(this, props);
        return this;
    }
}
