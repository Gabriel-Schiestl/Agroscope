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

  @Column('simple-array')
  symptoms: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  setProps(props: SicknessModelProps): SicknessModel {
    Object.assign(this, props);
    return this;
  }
}
