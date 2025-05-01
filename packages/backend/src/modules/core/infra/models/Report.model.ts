import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    BaseEntity,
} from 'typeorm';
import { ReportStatus } from '../../domain/models/Report';

export interface ReportModelProps {
    id: string;
    title: string;
    content: string;
    status: ReportStatus;
    clientId: string;
    engineerId: string;
    attachments?: string[];
    eventId?: string;
    createdAt?: Date;
}

@Entity('reports')
export class ReportModel extends BaseEntity implements ReportModelProps {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column()
    status: ReportStatus;

    @Column({ type: 'jsonb', nullable: true })
    attachments: string[];

    @Column({ name: 'client_id' })
    clientId: string;

    @Column({ name: 'engineer_id' })
    engineerId: string;

    @Column({ name: 'event_id', nullable: true })
    eventId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    setProps(props: ReportModelProps): ReportModel {
        Object.assign(this, props);

        return this;
    }
}
