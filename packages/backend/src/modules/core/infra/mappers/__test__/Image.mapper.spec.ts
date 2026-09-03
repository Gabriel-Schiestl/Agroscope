import { ImageModel } from '../../models/Image.model';
import { ImageMapper } from '../Image.mapper';

describe('ImageMapper', () => {
    it('should map a base64 image and prediction to an ImageModel', () => {
        const model = ImageMapper.domainToModel('base64-data', 'Ferrugem');

        expect(model).toBeInstanceOf(ImageModel);
        expect(model.image).toBe('base64-data');
        expect(model.prediction).toBe('Ferrugem');
    });
});
