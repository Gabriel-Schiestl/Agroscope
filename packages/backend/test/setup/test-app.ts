import { INestApplication } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { AuthGuard } from '../../src/modules/auth/infra/services/Auth.guard';
import { ResponseInterceptor } from '../../src/shared/Response.interceptor';

export interface ProviderOverride {
    token: string;
    value: unknown;
}

export async function createTestApp(
    overrides: ProviderOverride[] = [],
): Promise<INestApplication> {
    let builder: TestingModuleBuilder = Test.createTestingModule({
        imports: [AppModule],
    });

    for (const override of overrides) {
        builder = builder
            .overrideProvider(override.token)
            .useValue(override.value);
    }

    const moduleFixture = await builder.compile();

    const app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    app.useGlobalInterceptors(app.get(ResponseInterceptor));
    app.useGlobalGuards(app.get(AuthGuard));

    await app.init();

    return app;
}
