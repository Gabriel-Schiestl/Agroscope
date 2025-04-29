import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { CalendarEventModel } from './CalendarEvent.model';

export interface CalendarModelProps {
    id: string;
    userId: string;
    name?: string;
    events: CalendarEventModel[];
    createdAt?: Date;
    updatedAt?: Date;
}

@Entity('calendar')
export class CalendarModel extends BaseEntity implements CalendarModelProps {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ nullable: true })
    name?: string;

    @OneToMany(() => CalendarEventModel, (event) => event.calendar, {
        cascade: true,
    })
    events: CalendarEventModel[];

    @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    setProps(props: CalendarModelProps): CalendarModel {
        Object.assign(this, props);
        return this;
    }
}
