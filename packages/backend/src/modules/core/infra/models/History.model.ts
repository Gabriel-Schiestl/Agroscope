import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface HistoryModelProps {
    id: string;
    createdAt: Date;
    prediction: string;
    handling?: string;
    image: string;
}

@Entity('history')
export class HistoryModel extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column()
    prediction: string;

    @Column({ nullable: true })
    handling: string;

    @Column('text')
    image: string;

    setProps(props: HistoryModelProps): HistoryModel {
        Object.assign(this, props);
        return this;
    }
}
