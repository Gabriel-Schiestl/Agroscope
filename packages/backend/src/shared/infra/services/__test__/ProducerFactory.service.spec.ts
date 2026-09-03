import { ClientProxy } from '@nestjs/microservices';
import { ProducerFactoryServiceImpl } from '../ProducerFactory.service';

describe('ProducerFactoryServiceImpl', () => {
    let imageClient: jest.Mocked<ClientProxy>;
    let emailClient: jest.Mocked<ClientProxy>;
    let factory: ProducerFactoryServiceImpl;

    beforeEach(() => {
        imageClient = { emit: jest.fn() } as unknown as jest.Mocked<ClientProxy>;
        emailClient = { emit: jest.fn() } as unknown as jest.Mocked<ClientProxy>;
        factory = new ProducerFactoryServiceImpl(imageClient, emailClient);
    });

    it('should create an image producer that emits through the image client', () => {
        const producer = factory.createProducer('image');
        producer.sendMessage('image.predicted', { foo: 'bar' });

        expect(imageClient.emit).toHaveBeenCalledWith('image.predicted', {
            foo: 'bar',
        });
        expect(emailClient.emit).not.toHaveBeenCalled();
    });

    it('should create an email producer that emits through the email client', () => {
        const producer = factory.createProducer('email');
        producer.sendMessage('token', { to: 'user@example.com' });

        expect(emailClient.emit).toHaveBeenCalledWith('token', {
            to: 'user@example.com',
        });
        expect(imageClient.emit).not.toHaveBeenCalled();
    });

    it('should throw for an unsupported producer type', () => {
        expect(() => factory.createProducer('unknown' as any)).toThrow(
            'Tipo de produtor não suportado: unknown',
        );
    });
});
