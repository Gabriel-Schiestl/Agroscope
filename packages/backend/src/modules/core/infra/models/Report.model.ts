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
import { VisitModel } from './Visit.model';
import { ReportStatus } from '../../domain/models/Report';

export interface ReportModelProps {
    id: string;
    title: string;
    content: string;
    status: ReportStatus;
    attachments?: string[];
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

    @ManyToOne(() => VisitModel, (visit) => visit.reports, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'visit_id' })
    visit: VisitModel;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    setProps(props: ReportModelProps): ReportModel {
        Object.assign(this, props);

        return this;
    }
}
