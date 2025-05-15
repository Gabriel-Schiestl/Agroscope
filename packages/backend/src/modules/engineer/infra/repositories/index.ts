import { AgriculturalEngineerImpl } from './AgriculturalEngineerData.repository';

export const repositories = [
    {
        provide: 'AgriculturalEngineerRepository',
        useClass: AgriculturalEngineerImpl,
    },
];
