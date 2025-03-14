import { Injectable } from '@nestjs/common';
import { ImageModel } from '../models/Image.model';

export class ImageMapper {
    static domainToModel(base64: string, prediction: string): ImageModel {
        return new ImageModel().setProps(base64, prediction);
    }
}
