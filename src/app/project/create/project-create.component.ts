import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Project } from '../common/project';
import { ProjectService } from '../common/project.service';
import { ProjectCreateService } from './project-create.service';
import { ImageUploaderService, ImageReaderResponse } from '../../_services/image-uploader.service';
import { ImageDisplayService } from '../../_services/image-display.service';

@Component({
  selector: 'my-create-project',
  templateUrl: 'project-create.component.html',
  styleUrls: ['project-create.component.css']
})

export class ProjectCreateComponent implements OnInit {

  project: any = {};
  params: Params;
  showAddress = false;
  selectedState = '';
  public file_srcs: string[] = [];
  public debug_size_before: string[] = [];
  public debug_size_after: string[] = [];
  states: any = this.createService.states;
  countries: any = this.createService.countries;
  private imageData: ImageReaderResponse;

  // create form and validation
  createProjectForm = this.fb.group({
    name: ['', Validators.required],
    organizationId: ['', Validators.required],
    description: ['', Validators.required],
    location: ['remote'],
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    zip: ''
  });

  constructor(private projectService: ProjectService,
              private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              public fb: FormBuilder,
              private changeDetectorRef: ChangeDetectorRef,
              private createService: ProjectCreateService,
              private imageDisplay: ImageDisplayService,
              private imageUploader: ImageUploaderService) {
  }

  ngOnInit(): void {
    this.project.image = '';
  }

  onUploadImage(event): void {
    this.imageUploader
        .readImage(event)
        .subscribe(res => {
          this.project.image = res.base64Image;
          this.imageData = res;
        });
  }

  // retrieve info from form
  createProject(): void {

    const project = this.createProjectForm.value;
    let id: number;
    this.projectService
      .getProjects()
      .toPromise()
      .then(res => {
        id = res[res.length - 1].id + 1;
        return this.projectService
          .saveImage(id, this.imageData.formData) // TODO: this should be based on project.id
          .toPromise();
      }, this.handleError)
      .then(res => {
        return this.projectService
          .add(project)
          .toPromise();
      }, this.handleError)
      .then(res => {
        console.log('Successfully created project');
        this.router.navigate(['/project/view/' + id]); // TODO: change to project.id
      })
      .catch(this.handleError);
  }

  private handleError(err): void {
    console.error('An error occurred', err);
  }

}
