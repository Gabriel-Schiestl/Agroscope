import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('image')
export class ImageModel extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    image: string;

    @Column('text')
    prediction: string;

    setProps(image: string, prediction: string): this {
        Object.assign(this, { image, prediction });
        return this;
    }
}
