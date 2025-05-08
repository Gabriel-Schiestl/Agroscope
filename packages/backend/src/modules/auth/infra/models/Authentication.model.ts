import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface AuthenticationModelProps {
    id: string;
    email: string;
    password: string;
    lastLogin?: Date;
    recoveryCode?: string;
    recoveryCodeExpiration?: Date;
    incorrectPasswordAttempts?: number;
    incorrectRecoveryAttempts?: number;
}

@Entity('authentication')
export class AuthenticationModel
    extends BaseEntity
    implements AuthenticationModelProps
{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    lastLogin?: Date;

    @Column({ nullable: true })
    recoveryCode?: string;

    @Column({ nullable: true })
    recoveryCodeExpiration?: Date;

    @Column({ nullable: true })
    incorrectPasswordAttempts?: number;

    @Column({ nullable: true })
    incorrectRecoveryAttempts?: number;

    setProps(props: AuthenticationModelProps): AuthenticationModel {
        Object.assign(this, props);

        return this;
    }
}
