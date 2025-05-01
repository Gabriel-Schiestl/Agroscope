import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Failure, Success } from './Result';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const response = context.switchToHttp().getResponse();
        const method = context.switchToHttp().getRequest().method;

        return next.handle().pipe(
            map((data) => {
                if (data instanceof Success) {
                    if (method === 'POST') {
                        response.status(HttpStatus.CREATED);
                    } else {
                        response.status(HttpStatus.OK);
                    }
                    return data.value;
                }

                if (data instanceof Failure) {
                    if (method === 'GET') {
                        response.status(HttpStatus.NOT_FOUND);
                    } else {
                        response.status(HttpStatus.BAD_REQUEST);
                    }
                    return {
                        message: data.error.message,
                        key: data.error.key,
                    };
                }

                return data;
            }),
        );
    }
}
