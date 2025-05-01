import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { SicknessModel } from './Sickness.model';

interface KnowledgeModelProps {
    id: string;
    sicknessId: string;
    handling: string;
}

@Entity('knowledge')
export class KnowledgeModel extends BaseEntity implements KnowledgeModelProps {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'sickness_id' })
    sicknessId: string;

    @OneToOne(() => SicknessModel)
    @JoinColumn({ name: 'sickness_id' })
    sickness: SicknessModel;

    @Column({ type: 'text' })
    handling: string;

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

    setProps(props: KnowledgeModelProps): KnowledgeModel {
        Object.assign(this, props);
        return this;
    }
}
