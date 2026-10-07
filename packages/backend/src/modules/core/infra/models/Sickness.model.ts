import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { HistoryModel } from './History.model';
import {
    ClimateConditions,
    RainfallDependency,
    Season,
} from '../../domain/models/Sickness';

interface SicknessModelProps {
    id: string;
    name: string;
    description?: string;
    symptoms: string[];
    temperatureMin?: number;
    temperatureMax?: number;
    temperatureOptimal?: number;
    humidityMin?: number;
    humidityMax?: number;
    rainfallDependency?: RainfallDependency;
    favorableSeasons?: Season[];
}

@Entity('sickness')
export class SicknessModel extends BaseEntity implements SicknessModelProps {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column('text', { array: true })
    symptoms: string[];

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'temperature_min' })
    temperatureMin?: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'temperature_max' })
    temperatureMax?: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'temperature_optimal' })
    temperatureOptimal?: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'humidity_min' })
    humidityMin?: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'humidity_max' })
    humidityMax?: number;

    @Column({ type: 'varchar', length: 10, nullable: true, name: 'rainfall_dependency' })
    rainfallDependency?: RainfallDependency;

    @Column('text', { array: true, nullable: true, name: 'favorable_seasons' })
    favorableSeasons?: Season[];

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

    @OneToMany(() => HistoryModel, (history) => history.sickness_relation, {
        nullable: true,
    })
    histories: HistoryModel[];

    get climateConditions(): ClimateConditions | undefined {
        // Colunas nulas chegam do Postgres como `null` (não `undefined`) e
        // DECIMAL chega como string — por isso `!= null` + Number().
        const hasAny =
            this.temperatureMin != null ||
            this.temperatureMax != null ||
            this.temperatureOptimal != null ||
            this.humidityMin != null ||
            this.humidityMax != null ||
            this.rainfallDependency != null ||
            (this.favorableSeasons && this.favorableSeasons.length > 0);

        if (!hasAny) return undefined;

        return {
            temperatureMin: this.temperatureMin != null ? Number(this.temperatureMin) : undefined,
            temperatureMax: this.temperatureMax != null ? Number(this.temperatureMax) : undefined,
            temperatureOptimal: this.temperatureOptimal != null ? Number(this.temperatureOptimal) : undefined,
            humidityMin: this.humidityMin != null ? Number(this.humidityMin) : undefined,
            humidityMax: this.humidityMax != null ? Number(this.humidityMax) : undefined,
            rainfallDependency: this.rainfallDependency ?? undefined,
            favorableSeasons: this.favorableSeasons ?? undefined,
        };
    }

    setProps(props: SicknessModelProps): SicknessModel {
        Object.assign(this, props);
        return this;
    }
}
