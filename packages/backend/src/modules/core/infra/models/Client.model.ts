import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from '../../domain/models/Address';
import { Crop, PersonType } from '../../domain/models/Client';
import { AgriculturalEngineerModel } from './AgriculturalEngineer.model';

export interface ClientModelProps {
    name: string;
    telephone: string;
    email: string;
    person: PersonType;
    document: string;
    address: Address;
    totalArea: number;
    totalAreaPlanted: number;
    active: boolean;
    actualCrop?: Crop;
    createdAt?: Date;
}

@Entity('clients')
export class ClientModel extends BaseEntity implements ClientModelProps {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    telephone: string;

    @Column()
    email: string;

    @Column()
    person: PersonType;

    @Column()
    document: string;

    @Column('jsonb')
    address: Address;

    @Column('float', { name: 'total_area' })
    totalArea: number;

    @Column('float', { name: 'total_area_planted' })
    totalAreaPlanted: number;

    @ManyToOne(
        () => AgriculturalEngineerModel,
        (engineer) => engineer.clients,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'agricultural_engineer_id' })
    agriculturalEngineer: AgriculturalEngineerModel;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'active', default: true })
    active: boolean;

    @Column({ nullable: true, name: 'actual_crop' })
    actualCrop?: Crop;

    setProps(props: ClientModelProps): ClientModel {
        Object.assign(this, props);
        return this;
    }
}
