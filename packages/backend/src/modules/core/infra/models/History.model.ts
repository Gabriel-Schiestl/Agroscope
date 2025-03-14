import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { SicknessModel } from './Sickness.model';
import { ClientModel } from './Client';

export interface HistoryModelProps {
    id: string;
    createdAt: Date;
    sickness: SicknessModel;
    handling?: string;
    image: string;
}

@Entity('history')
export class HistoryModel extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @OneToOne(() => SicknessModel, { onDelete: 'CASCADE' })
    sickness: SicknessModel;

    @Column({ nullable: true })
    handling: string;

    @Column('text')
    image: string;

    @ManyToOne(() => ClientModel, (client) => client.predictions)
    client: ClientModel;

    setProps(props: HistoryModelProps): HistoryModel {
        Object.assign(this, props);
        return this;
    }
}
