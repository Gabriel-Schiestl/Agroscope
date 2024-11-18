import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

interface KnowledgeModelProps {
  id: string;
  sicknessId: string;
  handling: string;
}

@Entity('knowledge')
export class KnowledgeModel extends BaseEntity implements KnowledgeModelProps {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  sicknessId: string;

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
