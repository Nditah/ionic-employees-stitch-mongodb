import { Component, OnInit, Input } from '@angular/core';

import { StitchMongoServiceService } from '../../services/stitch-mongo-service.service';

import { AnonymousCredential} from 'mongodb-stitch-browser-sdk';

@Component({
  selector: 'app-employees-per-department',
  templateUrl: './employees-per-department.component.html',
  styleUrls: ['./employees-per-department.component.scss']
})
export class EmployeesPerDepartmentComponent implements OnInit {

  employees: any = null;
  @Input() department: string;

  constructor(private stichMongoService: StitchMongoServiceService) { }

  ngOnInit() {
    this.findEmployeePerDepartment();
  }

  findEmployeePerDepartment() {
    this.stichMongoService.client.auth.loginWithCredential(new AnonymousCredential()).then(user => {
      console.log('user', user);
      return this.stichMongoService.find('employees', {'department': this.department});
      }
    ).then(docs => {
        // Collection is empty.
        if (docs.length !== 0) {
          console.log(docs);
          this.employees = docs;
        }
    }).catch(err => {
        console.error(err);
    });
  }

}