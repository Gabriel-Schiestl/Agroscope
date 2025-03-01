import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';
import { Failure, Success } from './Result';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        const response = context.switchToHttp().getResponse();
        const method = context.switchToHttp().getRequest().method;

        return next.handle().pipe(
            map((data) => {
                if (data instanceof Success) {
                    if (method === 'POST') {
                        response.status(201);
                    } else if (method === 'GET') {
                        response.status(200).json(data.value);
                    }
                } else if (data instanceof Failure) {
                    if (
                        method === 'POST' ||
                        method === 'PUT' ||
                        method === 'PATCH'
                    ) {
                        response.status(400).json({
                            message: data.error.message,
                            key: data.error.key,
                        });
                    } else if (method === 'GET') {
                        response.status(404).json({
                            message: data.error.message,
                            key: data.error.key,
                        });
                    }
                }
            }),
        );
    }
}
