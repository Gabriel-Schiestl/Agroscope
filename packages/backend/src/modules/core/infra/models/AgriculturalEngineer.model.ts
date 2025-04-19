import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ClientModel } from './Client.model';

export interface AgriculturalEngineerModelProps {
    id: string;
    userId: string;
    clients?: ClientModel[];
}

@Entity('agricultural_engineer')
export class AgriculturalEngineerModel
    extends BaseEntity
    implements AgriculturalEngineerModelProps
{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @OneToMany(() => ClientModel, (client) => client.agriculturalEngineer, {
        nullable: true,
        cascade: true,
    })
    clients?: ClientModel[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    setProps(props: AgriculturalEngineerModelProps): AgriculturalEngineerModel {
        Object.assign(this, props);
        return this;
    }
}
