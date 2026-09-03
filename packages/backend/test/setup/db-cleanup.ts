import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

export async function clearTables(
    app: INestApplication,
    tableNames: string[],
): Promise<void> {
    const dataSource = app.get(DataSource);

    const quotedNames = tableNames.map((name) => `"${name}"`).join(', ');
    await dataSource.query(
        `TRUNCATE TABLE ${quotedNames} RESTART IDENTITY CASCADE`,
    );
}
