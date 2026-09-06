import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, ButtonComponent],
  templateUrl: './password.component.html',
  styleUrl: './password.component.css',
})
export class PasswordComponent {
  _fb = inject(FormBuilder);

  addressForm!: FormGroup;
  ngOnInit(): void {
    this.intiForm();
  }

  intiForm() {
    this.addressForm = this._fb.group({});
  }

  submition() {
  }
}
