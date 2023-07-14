import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { BufferedFile } from './file.model';

@Injectable()
export class MinioClientService {
  defaultBucket: string;

  constructor(private readonly minioService: MinioService) {
    this.defaultBucket = process.env.MINIO_DEFAULT_BUCKET_NAME;
  }

  slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }

  async getListOfBuckets() {
    return await this.minioService.client.listBuckets();
  }

  async getPresignedUrl(bucketName: string, fileName: string) {
    return await this.minioService.client.presignedGetObject(
      bucketName,
      fileName,
    );
  }

  async getFileFromMinio(
    fileName: string,
    bucketName: string = this.defaultBucket,
  ) {
    return await this.minioService.client.getObject(bucketName, fileName);
  }

  getStaticUrl(fileName: string, bucketName: string = this.defaultBucket) {
    return process.env.BASE_URL + '/minio?file=' + fileName;
    const port =
      ['80', '443'].indexOf(process.env.MINIO_PORT) == -1
        ? `:${process.env.MINIO_PORT}`
        : '';
    return process.env.MINIO_URL + '/' + bucketName + '/' + fileName;
  }

  public async upload(
    fileName: string,
    file: BufferedFile,
    bucketName: string = this.defaultBucket,
  ) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );
    const metaData = {
      'Content-Type': file.mimetype,
    };
    let name = fileName + ext;

    const fileBuffer = file.buffer;
    this.minioService.client.putObject(
      bucketName,
      name,
      fileBuffer,
      metaData,
      function (err, res) {
        if (err)
          throw new HttpException(
            'Error uploading file',
            HttpStatus.BAD_REQUEST,
          );
      },
    );

    return {
      url: this.getStaticUrl(name),
      objectName: name,
    };
  }

  async uploadBase64(
    fileName: string,
    base64: string,
    bucketName: string = this.defaultBucket,
  ): Promise<any> {
    const buffer = Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ''),
      'base64',
    );

    const type = 'png';
    const newFilename = `${this.slugify(fileName)}.${type}`;
    return new Promise((resolve, reject) => {
      if (buffer.length > 2097152) {
        reject("File size can't be more than 100kb");
        return {
          status: 400,
          message: 'File size must be less than 100kb',
        };
      }
      this.minioService.client.putObject(
        bucketName,
        newFilename,
        buffer,
        {
          'Content-Type': 'image/png',
        },
        function (err, objInfo) {
          if (err) {
            reject(err);
            return console.log(err);
          } else {
            resolve({
              fileName: newFilename,
              type: type,
              bucketName: bucketName,
            });
          }
        },
      );
    });
  }

  async delete(objetName: string, baseBucket: string = this.defaultBucket) {
    this.minioService.client.removeObject(
      baseBucket,
      objetName,
      function (err, res) {
        if (err)
          throw new HttpException(
            'Oops Something wrong happend',
            HttpStatus.BAD_REQUEST,
          );
      },
    );
  }
}
