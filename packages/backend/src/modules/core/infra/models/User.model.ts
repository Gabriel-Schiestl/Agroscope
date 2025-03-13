import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../../domain/models/User';

export interface UserModelProps {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

@Entity('user')
export class UserModel extends BaseEntity implements UserModelProps {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    role: UserRole;

    setProps(props: UserModelProps): this {
        Object.assign(this, props);

        return this;
    }
}
