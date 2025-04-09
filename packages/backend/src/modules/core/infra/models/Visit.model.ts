import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    BaseEntity,
} from 'typeorm';
import { ClientModel } from './Client.model';
import { ReportModel } from './Report.model';
import { VisitStatus } from '../../domain/models/Visit';

export interface VisitModelProps {
    id: string;
    status: VisitStatus;
    notes?: string;
    scheduledDate?: Date;
    reports?: ReportModel[];
    createdAt?: Date;
}

@Entity('visits')
export class VisitModel extends BaseEntity implements VisitModelProps {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'timestamp', nullable: true })
    scheduledDate: Date;

    @Column()
    status: VisitStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @ManyToOne(() => ClientModel, (client) => client.visits, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'client_id' })
    client: ClientModel;

    @OneToMany(() => ReportModel, (report) => report.visit, {
        nullable: true,
        cascade: true,
    })
    reports: ReportModel[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'created_at' })
    updatedAt: Date;

    setProps(props: VisitModelProps): VisitModel {
        Object.assign(this, props);

        return this;
    }
}
