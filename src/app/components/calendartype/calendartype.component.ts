import { Component, Output, Input, EventEmitter } from '@angular/core';
// import { SelectItem } from 'primeng/primeng';
import { SharedService } from '../../services/index';
@Component({
    selector: 'select-calendar-type',
    templateUrl: './calendartype.component.html',
    styleUrls: ['./calendartype.component.css']
})

export class CalendarTypeComponent {

    // selectCalendarTypes: SelectItem[];
    @Input() selectedCalendarType: string;
    @Output() calendartypeselected = new EventEmitter<string>();
    constructor(private sharedService: SharedService) {
        // this.selectCalendarTypes = [];
        // this.selectCalendarTypes.push({ label: 'All', value: 'all' });
        // this.selectCalendarTypes.push({ label: 'Month', value: 'month' });
        // this.selectCalendarTypes.push({ label: 'Week', value: 'week' });
        // this.selectCalendarTypes.push({ label: 'Day', value: 'day' });
    }

    onChanged(calType: any): void {
        this.selectedCalendarType = calType.value;

        this.calendartypeselected.emit(this.selectedCalendarType);
    }
}
