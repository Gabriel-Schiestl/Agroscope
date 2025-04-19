import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { SicknessModel } from './Sickness.model';
import { ClientModel } from './Client.model';
import { UserModel } from './User.model';

export interface HistoryModelProps {
    id: string;
    createdAt: Date;
    sickness: SicknessModel;
    handling?: string;
    image: string;
    clientId?: string;
    userId?: string;
}

@Entity('history')
export class HistoryModel extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true })
    sicknessId?: string;

    @ManyToOne(() => SicknessModel, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sicknessId' })
    sickness: SicknessModel;

    @Column({ nullable: true })
    handling: string;

    @Column('text')
    image: string;

    @Column({ nullable: true })
    clientId?: string;

    @Column({ nullable: true })
    userId?: string;

    setProps(props: HistoryModelProps): HistoryModel {
        Object.assign(this, props);
        return this;
    }
}
