import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormBuilder, FormGroup } from '@angular/forms';
import config from '../../config/config';
import { StitchMongoService } from '../../services/stitch-mongo.service';
import { ModalController, LoadingController, NavParams } from '@ionic/angular';
import { ObjectId } from 'bson';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { Holiday } from '../../models/holiday.model';
import { IziToastService } from '../../services/izi-toast.service';

@Component({
  selector: 'app-request-holidays-modal',
  templateUrl: './request-holidays-modal.component.html',
  styleUrls: ['./request-holidays-modal.component.scss'],
})
export class RequestHolidaysModalComponent implements OnInit {

  requestHolidaysForm: FormGroup;
  employees: any;
  holidays: Holiday = {
    total: 22,
    not_taken: 22,
    taken: {days: 0, info: []},
  };
  loading: any;

  constructor(private formBuilder: FormBuilder, private stitchMongoService: StitchMongoService, private modalCtrl: ModalController,
              private storage: Storage, private navParams: NavParams, private loadingCtrl: LoadingController, 
              private iziToast: IziToastService) {
    this.createForm();
  }

  ngOnInit() {
    this.fetchEmployees();
    if ((typeof this.navParams.data.modalProps.holidays !== 'undefined') && (this.navParams.data.modalProps.holidays !== null)) {
      // this.requestHolidaysForm.patchValue(this.navParams.data.modalProps.holidays);
      this.holidays = this.navParams.data.modalProps.holidays;
    }
    console.log('holydays', this.holidays);
  }

  createForm() {
    this.requestHolidaysForm = this.formBuilder.group({
      id: new FormControl(new ObjectId()),
      whoFor: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      reason: new FormControl(''),
      status: new FormControl('pending'),
    });
  }

  requestHolidaysFormSubmit() {
    console.log(this.requestHolidaysForm.value);

    const startDate = moment(this.requestHolidaysForm.value.startDate, 'YYYY-MM-DD');
    const endDate = moment(this.requestHolidaysForm.value.endDate, 'YYYY-MM-DD');
    const countDays = Math.abs(startDate.diff(endDate, 'days')) + 1;
    console.log('countDays', countDays);

    /*
    for (const d = moment(startDate); d.diff(endDate) <= 0; d.add(1, 'days')) {
      console.log('d', d.format('YYYY-MM-DD'));
    }
    */

    if (endDate.isSameOrAfter(startDate)) {

      if (countDays <= this.holidays.not_taken) {

        this.holidays.not_taken -= countDays;
        this.holidays.taken.days += countDays;
        this.holidays.taken.info.push(this.requestHolidaysForm.value);

        console.log('holidays sent', this.holidays);

        this.storage.get(config.TOKEN_KEY).then(res => {
          if (res) {
            const objectId = new ObjectId(res);
            console.log('objectId', objectId);
            this.presentLoading('Please wait, adding holiday...');
            this.stitchMongoService.update(config.COLLECTION_KEY, {user_id: objectId}, {$set: { holidays: this.holidays }})
            .then(result => {
              console.log('result', result);
              this.dismissLoading();
              this.dismiss();
              this.iziToast.success('Holiday request', 'Holiday request sent successfully.');
            });
          }
        });
      } else {
        this.iziToast.show('Error', 'You dont have enough vacation days left.',
        'red', 'ico-error', 'assets/avatar.png');
      }
    } else {
      this.iziToast.show('Error', 'The end date cannot be earlier than the start date.',
       'red', 'ico-error', 'assets/avatar.png');
    }
  }

  fetchEmployees() {
    this.stitchMongoService.find(config.COLLECTION_KEY, {})
    .then(docs => {
      this.employees = docs;
      console.log('employees', this.employees);
    });
  }

  dismiss() {
    // Using the injected ModalController this page
    // can "dismiss" itself and pass back data.
    // console.log('dismiss', data);
    this.modalCtrl.dismiss();
  }

  async presentLoading(message) {
    this.loading = await this.loadingCtrl.create({
      message: message,
    });

    return await this.loading.present();
  }

  async dismissLoading() {
    this.loading.dismiss();
    this.loading = null;
  }

}
