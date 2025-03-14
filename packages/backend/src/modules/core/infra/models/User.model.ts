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

    @Column()
    email: string;

    setProps(props: UserModelProps): this {
        Object.assign(this, props);

        return this;
    }
}
