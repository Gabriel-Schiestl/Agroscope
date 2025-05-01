import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { EventStatus, EventType } from '../../domain/models/CalendarEvent';
import { CalendarModel } from './Calendar.model';

export interface CalendarEventModelProps {
    id: string;
    title: string;
    type: EventType;
    status: EventStatus;
    date: Date;
    time: string;
    clientId?: string;
    location?: string;
    description?: string;
    reportId?: string;
}

@Entity('calendar_event')
export class CalendarEventModel
    extends BaseEntity
    implements CalendarEventModelProps
{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    type: EventType;

    @Column()
    status: EventStatus;

    @Column()
    date: Date;

    @Column()
    time: string;

    @Column({ nullable: true, name: 'client_id' })
    clientId?: string;

    @Column({ nullable: true })
    location?: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true, name: 'report_id' })
    reportId?: string;

    @ManyToOne(() => CalendarModel, (calendar) => calendar.events, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'calendar_id' })
    calendar: CalendarEventModel;

    setProps(props: CalendarEventModelProps): CalendarEventModel {
        Object.assign(this, props);
        return this;
    }
}
