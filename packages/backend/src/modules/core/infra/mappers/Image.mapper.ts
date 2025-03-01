import { Injectable } from '@nestjs/common';
import { ImageModel } from '../models/Image.model';

@Injectable()
export class ImageMapper {
    domainToModel(base64: string, prediction: string): ImageModel {
        return new ImageModel().setProps(base64, prediction);
    }
}
