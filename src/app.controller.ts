import {
  Controller,
  Get,
  UseInterceptors,
  Post,
  UploadedFile,
  HttpException,
  HttpStatus,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { google } = require('googleapis');
import fs = require('fs');
// const storage = MulterModule({
//   st
// })
// import {drive_v2} from 'googleapis';
@Controller()
export class AppController {
  private path: string;
  private url: string;
  constructor(private readonly appService: AppService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file, @Res() res) {
    this.path = file.path;
    console.log('path', this.path);

    let data;
    await fs.readFile('credentials.json', async (err, content: any) => {
      if (err) {
        throw new InternalServerErrorException('Error client secret file');
      }
      await this.authorize(JSON.parse(content), async auth => {
        await this.uploadImage(auth, file.path, res);
      });
    });
  }
  async uploadImage(auth, path, @Res() response) {
    const drive = google.drive({ version: 'v3', auth });
    const metaData = {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(path),
    };

    const fileMetadata = {
      name: 'image.jpg',
      parents: ['1Fz4i97zoLQYPvmKKZG27F07HIOX1mIrr'],
    };

    await drive.files.create(
      {
        resource: fileMetadata,
        media: metaData,
        fields: 'id',
      },
      async function(err, res) {
        if (err) {
          // Handle error
          throw new HttpException(
            {
              message: 'Internal Server Error',
              status: HttpStatus.BAD_REQUEST,
            },
            HttpStatus.BAD_REQUEST,
          );
        } else {
          response.json(`https://drive.google.com/uc?id=${res.data.id}`);
        }
      },
    );
  }

  authorize(credentials: any, callback: any) {
    const TOKEN_PATH = 'token.json';
    // eslint-disable-next-line @typescript-eslint/camelcase
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      // eslint-disable-next-line @typescript-eslint/camelcase
      redirect_uris[0],
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token: any) => {
      if (err) {
        throw new HttpException(
          {
            message: 'Internal Server Error',
            status: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client); //list files and upload file
      //callback(oAuth2Client, '0B79LZPgLDaqESF9HV2V3YzYySkE');//get file
    });
  }
}
