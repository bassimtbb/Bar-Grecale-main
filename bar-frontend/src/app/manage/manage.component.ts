import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CategoryControllerService, CategoryDto, ItemControllerService, ItemDto } from '../api-client';

@Component({
  selector: 'app-manage-menu',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.css'
})
export class ManageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly categoryForm = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    iconUrl: ['']
  });

  readonly itemForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    photoUrl: [''],
    categoryId: ['', Validators.required],
    tagLabel: [''],
    tagCssClass: ['']
  });

  categories: CategoryDto[] = [];
  isLoadingCategories = false;
  categoriesLoadError?: string;
  categorySuccess?: string;
  categoryError?: string;
  itemSuccess?: string;
  itemError?: string;
  isSavingCategory = false;
  isSavingItem = false;

  constructor(
    private readonly categoryService: CategoryControllerService,
    private readonly itemService: ItemControllerService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  onSubmitCategory(): void {
    this.categorySuccess = undefined;
    this.categoryError = undefined;

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const value = this.categoryForm.getRawValue();
    const payload: CategoryDto = {
      code: value.code?.trim() || undefined,
      name: value.name?.trim() || undefined,
      iconUrl: value.iconUrl?.trim() || undefined
    };

    this.isSavingCategory = true;
    this.categoryService.add1(payload).subscribe({
      next: category => {
        this.categorySuccess = `Category "${category.name ?? category.code ?? 'New Category'}" created.`;
        this.isSavingCategory = false;
        this.categoryForm.reset();
        if (category) {
          this.categories = [...this.categories, category];
        }
      },
      error: err => {
        console.error('Failed to create category', err);
        this.categoryError = 'Unable to create category. Please try again.';
        this.isSavingCategory = false;
      }
    });
  }

  onSubmitItem(): void {
    this.itemSuccess = undefined;
    this.itemError = undefined;

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const value = this.itemForm.getRawValue();
    const price = typeof value.price === 'number' ? value.price : Number(value.price);
    const payload: ItemDto = {
      name: value.name?.trim() || undefined,
      description: value.description?.trim() || undefined,
      price: isNaN(price) ? undefined : price,
      photoUrl: value.photoUrl?.trim() || undefined,
      category: value.categoryId ? { id: Number(value.categoryId) } as CategoryDto : undefined,
      tag: value.tagLabel?.trim()
        ? { label: value.tagLabel.trim(), cssClass: value.tagCssClass?.trim() || undefined }
        : undefined
    };

    this.isSavingItem = true;
    this.itemService.add(payload).subscribe({
      next: item => {
        this.itemSuccess = `Item "${item.name ?? 'New Item'}" created.`;
        this.isSavingItem = false;
        this.itemForm.reset();
      },
      error: err => {
        console.error('Failed to create item', err);
        this.itemError = 'Unable to create item. Please try again.';
        this.isSavingItem = false;
      }
    });
  }

  refreshCategories(): void {
    this.loadCategories();
  }

  protected categoryControl(controlName: string) {
    return this.categoryForm.get(controlName);
  }

  protected itemControl(controlName: string) {
    return this.itemForm.get(controlName);
  }

  private loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoriesLoadError = undefined;

    this.categoryService.findAll1().subscribe({
      next: categories => {
        this.categories = categories ?? [];
        this.isLoadingCategories = false;
      },
      error: err => {
        console.error('Failed to load categories', err);
        this.categoriesLoadError = 'Unable to load categories for selection.';
        this.isLoadingCategories = false;
      }
    });
  }
}
