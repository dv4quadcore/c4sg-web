import { Component, ElementRef, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { OrganizationService } from '../common/organization.service';
import { FormConstantsService } from '../../_services/form-constants.service';
import { ImageUploaderService, ImageReaderResponse } from '../../_services/image-uploader.service';
import { ImageDisplayService } from '../../_services/image-display.service';

@Component({
  selector: 'my-create-organization',
  templateUrl: 'organization-create.component.html',
  styleUrls: ['organization-create.component.css']
})

export class OrganizationCreateComponent implements OnInit {
  public categories: String[];
  public countries: any[];
  private editOrg = false;
  public organization = this.initOrganization();
  public organizationForm: FormGroup;
  public formPlaceholder: {[key: string]: any} = {};
  public shortDescMaxLength = 255;
  public states: String[];
  private logoData: ImageReaderResponse;

  // RegEx validators
  private einValidRegEx = /^[1-9]\d?-\d{7}$/;
  // tslint:disable-next-line:max-line-length
  private emailValidRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  public httpValidRegEx = /^https?:\/\//;
  // tslint:disable-next-line:max-line-length
  private urlValidRegEx = /^(https?):\/\/([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+([a-zA-Z]{2,9})(:\d{1,4})?([-\w\/#~:.?+=&%@~]*)$/;
  public zipValidRegEx = /(^\d{5}$)|(^\d{5}-\d{4}$)/;

  constructor(public fb: FormBuilder,
              private organizationService: OrganizationService,
              private fc: FormConstantsService,
              private el: ElementRef,
              private imageDisplay: ImageDisplayService,
              private imageUploader: ImageUploaderService ) { }

  ngOnInit(): void {
    this.getFormConstants();

    // Placeholder values for testing purposes
    // TODO: remove later as needed
    this.organization = {
      logo: '',
      name: 'test org',
      website: 'http://test.org',
      email: 'test@test.org',
      phone: '(000)-123-4567',
      ein: '',
      category: '',
      address1: '1234 test ave',
      address2: '',
      city: 'New York',
      state: 'AK',
      country: 'USA',
      zip: '12345',
      briefDescription: 'this is a short description',
      detailedDescription: 'this is a long description'
    }

    if (this.editOrg) { // edit existing org
      this.initForm();
      // TODO: Pass variable to getOrganization() instead of hard-coded value
      this.organizationService.getOrganization(2)
        .subscribe(
          res => {
            this.organization = res;
            this.editOrg = true;
            this.initForm();
          }, this.handleError
        );
    } else { // add new org
      this.editOrg = null;
      this.initForm();
    }
  }

  private getFormConstants(): void {
    this.categories = this.fc.getCategories();
    this.countries = this.fc.getCountries();
    this.states = this.fc.getStates();
  }

  private initForm(): void {
    this.organizationForm = this.fb.group({
      'photo': [this.organization.logo, []],
      'name': [this.organization.name || '', [Validators.required]],
      'website': [this.organization.website || '', [Validators.pattern(this.urlValidRegEx)]],
      'email': [this.organization.email || '', [Validators.required, Validators.pattern(this.emailValidRegEx)]],
      'phone': [this.organization.phone || '', [Validators.required]],
      'ein': [this.organization.ein || '', [Validators.pattern(this.einValidRegEx)]],
      'category': [this.organization.category || '', [Validators.required]],
      'address1': [this.organization.address1 || '', [Validators.required]],
      'address2': [this.organization.address2 || '', []],
      'city': [this.organization.city || '', []],
      'state': [this.organization.state || '', []],
      'country': [this.organization.country || '', [Validators.required]],
      'zip': [this.organization.zip || '', [Validators.required, Validators.pattern(this.zipValidRegEx)]],
      'shortDescription': [this.organization.briefDescription || '',
        [Validators.required, Validators.maxLength(this.shortDescMaxLength)]
      ],
      'longDescription': [this.organization.detailedDescription || '', [Validators.required]],
    });
  }

  // initialize organization with blank values
  private initOrganization(): any {
    return {
      'logo': '',
      'name': '',
      'website': '',
      'email': '',
      'phone': '',
      'ein': '',
      'category': '',
      'address1': '',
      'address2': '',
      'city': '',
      'state': '',
      'country': '',
      'zip': '',
      'briefDescription': '',
      'detailedDescription': ''
    };
  }

  onUploadLogo(event): void {
    this.imageUploader
        .readImage(event)
        .subscribe(res => { 
          this.organization.logo = res.base64Image
          this.logoData = res
        })
  }

  onSubmit(): void {
    if (this.editOrg) {
    } else {
      this.organizationService
          .getOrganizations()
          .toPromise()
          .then(res => {

            // TODO: Change this according to back-end feature changes
            const results: Array<any> = res;
            const body = this.organizationForm.value;
            
            body.id = results[results.length - 1].id + 1;
            body.description = body.shortDescription;
            body.status = 'A';
            
            this.organizationService
                .saveLogo(body.id, this.logoData.formData)
                .toPromise()
                .then(res => this.organizationService.createOrganization(body))
          })
    }
  }
  
  private handleError(err): void {
    console.error('An error occurred', err);
  }
}
