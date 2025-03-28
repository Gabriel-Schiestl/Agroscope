import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from '../../domain/models/Address';
import { PersonType } from '../../domain/models/Client';
import { HistoryModel } from './History.model';
import { AgriculturalEngineerModel } from './AgriculturalEngineer.model';

export interface ClientModelProps {
    name: string;
    telephone: string;
    predictions?: HistoryModel[];
    person: PersonType;
    document: string;
    address: Address;
    totalArea: number;
    totalAreaPlanted: number;
}

@Entity('clients')
export class ClientModel extends BaseEntity implements ClientModelProps {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    telephone: string;

    @OneToMany(() => HistoryModel, (history) => history.client, {
        nullable: true,
    })
    @JoinColumn()
    predictions?: HistoryModel[];

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
    agriculturalEngineer: AgriculturalEngineerModel;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    setProps(props: ClientModelProps): ClientModel {
        Object.assign(this, props);
        return this;
    }
}
