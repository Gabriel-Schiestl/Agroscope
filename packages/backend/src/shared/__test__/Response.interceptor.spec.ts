import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { Res } from '../Result';
import { ResponseInterceptor } from '../Response.interceptor';

describe('ResponseInterceptor', () => {
    const interceptor = new ResponseInterceptor();

    const buildContext = (method: string, response: any): ExecutionContext =>
        ({
            switchToHttp: () => ({
                getResponse: () => response,
                getRequest: () => ({ method }),
            }),
        }) as unknown as ExecutionContext;

    const buildResponse = () => ({ status: jest.fn() });

    it('should respond 201 with the value on a successful POST', async () => {
        const response = buildResponse();
        const context = buildContext('POST', response);
        const next = { handle: () => of(Res.success({ id: '1' })) };

        const result = await firstValueFrom(
            interceptor.intercept(context, next as any),
        );

        expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
        expect(result).toEqual({ id: '1' });
    });

    it('should respond 200 with the value on a successful GET', async () => {
        const response = buildResponse();
        const context = buildContext('GET', response);
        const next = { handle: () => of(Res.success({ id: '1' })) };

        const result = await firstValueFrom(
            interceptor.intercept(context, next as any),
        );

        expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
        expect(result).toEqual({ id: '1' });
    });

    it('should respond with a "No content" message when the success value is falsy', async () => {
        const response = buildResponse();
        const context = buildContext('POST', response);
        const next = { handle: () => of(Res.success(undefined)) };

        const result = await firstValueFrom(
            interceptor.intercept(context, next as any),
        );

        expect(result).toEqual({ message: 'No content' });
    });

    it('should respond 404 on a failed GET', async () => {
        const response = buildResponse();
        const context = buildContext('GET', response);
        const next = {
            handle: () => of(Res.failure({ message: 'not found' } as any)),
        };

        const result = await firstValueFrom(
            interceptor.intercept(context, next as any),
        );

        expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
        expect(result).toEqual({ message: 'not found', key: undefined });
    });

    it('should respond 400 on a failed non-GET request', async () => {
        const response = buildResponse();
        const context = buildContext('POST', response);
        const next = {
            handle: () => of(Res.failure({ message: 'bad input' } as any)),
        };

        const result = await firstValueFrom(
            interceptor.intercept(context, next as any),
        );

        expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(result).toEqual({ message: 'bad input', key: undefined });
    });

    it('should pass through data that is neither a Success nor a Failure', async () => {
        const response = buildResponse();
        const context = buildContext('GET', response);
        const next = { handle: () => of({ raw: true }) };

        const result = await firstValueFrom(
            interceptor.intercept(context, next as any),
        );

        expect(result).toEqual({ raw: true });
        expect(response.status).not.toHaveBeenCalled();
    });
});
