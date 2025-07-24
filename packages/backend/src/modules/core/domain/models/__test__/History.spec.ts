import { History } from '../History';
import { Sickness } from '../Sickness';

describe('History Domain', () => {
    const sickness = Sickness.create({
        name: 'Ferrugem',
        description: 'Doença fúngica',
        symptoms: ['manchas'],
    });
    const validProps = {
        sickness,
        handling: 'Pulverização',
        sicknessConfidence: 0.9,
        crop: 'Milho',
        cropConfidence: 0.95,
        image: 'img.png',
        clientId: 'client-1',
        userId: 'user-1',
    };

    it('should create a history successfully', () => {
        const history = History.create(validProps);
        expect(history).toBeInstanceOf(History);
        expect(history.sickness).toBe(sickness);
        expect(history.handling).toBe(validProps.handling);
        expect(history.sicknessConfidence).toBe(validProps.sicknessConfidence);
        expect(history.crop).toBe(validProps.crop);
        expect(history.cropConfidence).toBe(validProps.cropConfidence);
        expect(history.image).toBe(validProps.image);
        expect(history.clientId).toBe(validProps.clientId);
        expect(history.userId).toBe(validProps.userId);
        expect(history.id).toBeDefined();
        expect(history.createdAt).toBeInstanceOf(Date);
    });

    it('should load a history with given id', () => {
        const now = new Date();
        const history = History.load(
            { ...validProps, createdAt: now },
            'custom-id',
        );
        expect(history).toBeInstanceOf(History);
        expect(history.id).toBe('custom-id');
        expect(history.createdAt).toBe(now);
    });
});
