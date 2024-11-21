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

  @Column()
  sicknessId: string;

  @OneToOne(() => SicknessModel)
  @JoinColumn({ name: 'sicknessId' })
  sickness: SicknessModel;

  @Column({ type: 'text' })
  handling: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  setProps(props: KnowledgeModelProps): KnowledgeModel {
    Object.assign(this, props);
    return this;
  }
}
