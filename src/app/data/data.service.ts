import { Injectable } from '@angular/core';
import { PouchDbService } from './pouch-db.service';
import { Book } from '../entities/book';

@Injectable()
export class DataService {

  constructor(private pouchDbService: PouchDbService) {
    this.pouchDbService.fetch()
    .then(res => {
      console.log(res);
    }).catch(e => {
      console.log('error: ' + e);
    });
  }

}
