import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

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

    setProps(props: SicknessModelProps): SicknessModel {
        Object.assign(this, props);
        return this;
    }
}
