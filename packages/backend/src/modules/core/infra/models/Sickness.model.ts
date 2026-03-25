import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { HistoryModel } from './History.model';

interface SicknessModelProps {
    id: string;
    name: string;
    description?: string;
    symptoms: string[];
}

@Entity('sickness')
export class SicknessModel extends BaseEntity implements SicknessModelProps {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column('text', { array: true })
    symptoms: string[];

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'updated_at',
    })
    updatedAt: Date;

    @OneToMany(() => HistoryModel, (history) => history.sickness_relation, {
        nullable: true,
    })
    histories: HistoryModel[];

    setProps(props: SicknessModelProps): SicknessModel {
        Object.assign(this, props);
        return this;
    }
}
