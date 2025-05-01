import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface UserModelProps {
    id: string;
    name: string;
    email: string;
}

@Entity('user')
export class UserModel extends BaseEntity implements UserModelProps {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;

    setProps(props: UserModelProps): this {
        Object.assign(this, props);

        return this;
    }
}
