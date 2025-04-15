import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from '../../domain/models/Address';
import { Crop, PersonType } from '../../domain/models/Client';
import { AgriculturalEngineerModel } from './AgriculturalEngineer.model';
import { VisitModel } from './Visit.model';

export interface ClientModelProps {
    name: string;
    telephone: string;
    person: PersonType;
    document: string;
    address: Address;
    totalArea: number;
    totalAreaPlanted: number;
    active: boolean;
    actualCrop?: Crop;
    visits?: VisitModel[];
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
    person: PersonType;

    @Column()
    document: string;

    @Column('jsonb')
    address: Address;

    @Column('float')
    totalArea: number;

    @Column('float')
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

    @Column({ nullable: true })
    actualCrop?: Crop;

    @OneToMany(() => VisitModel, (visit) => visit.client, {
        nullable: true,
        cascade: true,
    })
    visits: VisitModel[];

    setProps(props: ClientModelProps): ClientModel {
        Object.assign(this, props);
        return this;
    }
}
