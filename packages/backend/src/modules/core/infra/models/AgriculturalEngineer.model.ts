import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClientModel } from './Client';

export interface AgriculturalEngineerModelProps {
    id: string;
    userId: string;
    clients?: ClientModel[];
}

@Entity('agricultural_engineer')
export class AgriculturalEngineerModel
    implements AgriculturalEngineerModelProps
{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @OneToMany(() => ClientModel, (client) => client.agriculturalEngineer, {
        nullable: true,
    })
    clients?: ClientModel[];

    setProps(props: AgriculturalEngineerModelProps): AgriculturalEngineerModel {
        Object.assign(this, props);
        return this;
    }
}
