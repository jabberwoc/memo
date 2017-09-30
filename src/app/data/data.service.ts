import { Injectable } from '@angular/core';
import { PouchDbService } from './pouch-db.service';
import { Book } from '../entities/book';

@Injectable()
export class DataService {

  constructor(private pouchDbService: PouchDbService) {
    this.pouchDbService.put('1', new Book('1', 'bla blubb', 0));
    this.pouchDbService.fetch()
      .then(res => {
        console.log(res.rows);
      }).catch(e => {
        console.log('error: ' + e);
      });
  }

}
