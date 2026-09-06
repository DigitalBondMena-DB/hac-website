import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css',
})
export class AddressComponent {
  _fb = inject(FormBuilder);

  addressForm!: FormGroup;
  ngOnInit(): void {
    this.intiForm();
  }

  intiForm() {
    this.addressForm = this._fb.group({
      /* all form control here  */
    });
  }

  submition() {
  }
}
