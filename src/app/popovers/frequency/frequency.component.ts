import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-frequency',
  templateUrl: './frequency.component.html',
  styleUrls: ['./frequency.component.scss'],
})
export class FrequencyComponent implements OnInit {

  options = {
    enabled: true,
    repeat: 'daily',
    count: 1,
    when: {text: 'always', value: 'always'},
    condition: {text: 'sameDay', value: 'The same day of the month'},
    days: {}
  };

  frequencyMap = {
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
    annually: 'year'
  };

  dateText;
  toggle = true;
  numberEvents = 1;
  untilDate = '';

  constructor(private popoverCtrl: PopoverController, private navParams: NavParams) {
    this.dateText = this.frequencyMap.daily;
  }

  ngOnInit() {
    if ((typeof this.navParams.data.popoverProps.frequency !== 'undefined') && (this.navParams.data.popoverProps.frequency !== null)) {
      this.options.enabled = this.navParams.data.popoverProps.frequency.enabled;
      this.options.repeat = this.navParams.data.popoverProps.frequency.repeat;
      this.options.count = this.navParams.data.popoverProps.frequency.count;
      this.options.when = this.navParams.data.popoverProps.frequency.when;
      if (this.options.when.text === 'numberEvents') {
        this.numberEvents =  parseInt(this.options.when.value, 10);
      }
      if (this.options.when.text === 'untilDate') {
        this.untilDate = this.options.when.value;
      }
      if (this.options.repeat === 'weekly') {
        this.options.days = this.navParams.data.popoverProps.frequency.days;
      }
      if (this.options.repeat === 'monthly') {
        this.options.condition = this.navParams.data.popoverProps.frequency.condition;
        if (this.options.condition.text === 'thirdTuesday') {
          this.toggle = !this.toggle;
        }
      }
    }
  }

  onSelectChange(selected) {
    console.log('FrequencyComponent::onSelectChange(selectedValue) | method called', selected.detail.value);
    this.dateText = this.frequencyMap[selected.detail.value];
    if ((this.dateText === 'day') || (this.dateText === 'year')) {
      if (typeof this.options.days !== 'undefined') {
        delete this.options.days;
      }
      if (typeof this.options.condition !== 'undefined') {
        delete this.options.condition;
      }
    }
  }

  selectedWeekday(event) {
    console.log('FrequencyComponent::selectedWeekday(event) | method called', event);
    this.options.days = event;
  }

  onClickAccept() {
    if (this.options.when.text === 'untilDate') {
      this.options.when.value = this.untilDate;
    }
    if (this.options.when.text === 'numberEvents') {
      this.options.when.value = this.numberEvents.toString();
    }
    if (this.options.repeat !== 'monthly') {
      delete this.options.condition;
    }
    console.log('FrequencyComponent::onClickAccept() | method called', this.options);
    this.popoverCtrl.dismiss(this.options);
  }

  ionChangeCondition1(event) {
    console.log('FrequencyComponent::ionChangeCondition1(event) | method called', event);
    if (event.detail.checked) {
      this.options.condition.text = 'sameDay';
      this.options.condition.value = 'The same day of the month';
    }
  }

  ionChangeCondition2(event) {
    console.log('FrequencyComponent::ionChangeCondition2(event) | method called', event);
    if (event.detail.checked) {
      this.options.condition.text = 'thirdTuesday';
      this.options.condition.value = 'The third Tuesday of the month';
    }
  }

  onSelectWhenChange(selected) {
    console.log('FrequencyComponent::onSelectWhenChange(selectedValue) | method called', selected.detail.value);
  }

}
