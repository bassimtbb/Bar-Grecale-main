import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  CategoryControllerService,
  CategoryDto,
  ItemControllerService,
  ItemDto,
  SubcategoryControllerService,
  SubcategoryDto
} from '../api-client';
import { BarIdentity, BarIdentityService, BarTeamMember, BarTimeShift } from '../services/bar-identity.service';

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

  readonly subcategoryForm = this.fb.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
    position: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    itemIds: this.fb.control([] as number[])
  });

  readonly identityForm = this.fb.group({
    name: ['', Validators.required],
    tagline: [''],
    address: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    vatNumber: [''],
    parkingInfo: [''],
    additionalInfo: [''],
    timeShifts: this.fb.array([]),
    team: this.fb.array([])
  });

  categories: CategoryDto[] = [];
  isLoadingCategories = false;
  categoriesLoadError?: string;
  categorySuccess?: string;
  categoryError?: string;
  itemSuccess?: string;
  itemError?: string;
  menuItems: ItemDto[] = [];
  isLoadingItems = false;
  itemsLoadError?: string;
  subcategorySuccess?: string;
  subcategoryError?: string;
  isSavingCategory = false;
  isSavingItem = false;
  isSavingSubcategory = false;
  identitySuccess?: string;
  identityError?: string;
  editingCategoryId?: number;
  editingSubcategoryId?: string;
  editingItemId?: number;
  private readonly itemIndex = new Map<number, ItemDto>();
  selectedPanel: 'identity' | 'menu' = 'identity';

  constructor(
    private readonly categoryService: CategoryControllerService,
    private readonly itemService: ItemControllerService,
    private readonly subcategoryService: SubcategoryControllerService,
    private readonly barIdentityService: BarIdentityService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();
    this.populateIdentityForm();

    this.subcategoryForm.get('categoryId')?.valueChanges.subscribe(() => {
      this.subcategoryForm.get('itemIds')?.setValue([]);
    });
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
    const request$ = this.editingCategoryId != null
      ? this.categoryService.update1(this.editingCategoryId, payload)
      : this.categoryService.add1(payload);

    request$.subscribe({
      next: (category: CategoryDto | undefined) => {
        const label = category?.name ?? category?.code ?? 'Categoria';
        this.categorySuccess = this.editingCategoryId != null
          ? `Categoria "${label}" aggiornata.`
          : `Categoria "${label}" creata.`;
        this.isSavingCategory = false;
        this.resetCategoryForm();
        this.loadCategories();
      },
      error: (err: unknown) => {
        console.error('Failed to save category', err);
        this.categoryError = this.editingCategoryId != null
          ? 'Impossibile aggiornare la categoria. Riprova per favore.'
          : 'Impossibile creare la categoria. Riprova per favore.';
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

    if (this.editingItemId != null) {
      payload.id = this.editingItemId;
    }

    this.isSavingItem = true;
    const request$ = this.editingItemId != null
      ? this.itemService.update(this.editingItemId, payload)
      : this.itemService.add(payload);

    request$.subscribe({
      next: (item: ItemDto | undefined) => {
        const label = item?.name ?? 'Piatto';
        this.itemSuccess = this.editingItemId != null
          ? `Piatto "${label}" aggiornato.`
          : `Piatto "${label}" creato.`;
        this.isSavingItem = false;
        this.resetItemForm();
        this.loadItems();
        this.loadCategories();
      },
      error: (err: unknown) => {
        console.error('Failed to save item', err);
        this.itemError = this.editingItemId != null
          ? 'Impossibile aggiornare il piatto. Riprova per favore.'
          : 'Impossibile creare il piatto. Riprova per favore.';
        this.isSavingItem = false;
      }
    });
  }

  onSubmitSubcategory(): void {
    this.subcategorySuccess = undefined;
    this.subcategoryError = undefined;

    if (this.subcategoryForm.invalid) {
      this.subcategoryForm.markAllAsTouched();
      return;
    }

    const value = this.subcategoryForm.getRawValue();
    const categoryId = value.categoryId ? Number(value.categoryId) : undefined;
    const rawPosition = typeof value.position === 'number' ? value.position : Number(value.position);
    const position = isNaN(rawPosition) ? 0 : rawPosition;
    const itemIds = (value.itemIds ?? []).map(id => Number(id)).filter(id => !isNaN(id));

    if (categoryId == null || isNaN(categoryId)) {
      this.subcategoryError = 'Seleziona una categoria valida.';
      return;
    }

    const payload: SubcategoryDto = {
      name: value.name?.trim() || undefined,
      slug: value.slug?.trim() || undefined,
      position,
      categoryId,
      itemIds
    };

    this.isSavingSubcategory = true;
    const request$ = this.editingSubcategoryId
      ? this.subcategoryService.update(this.editingSubcategoryId, payload)
      : this.subcategoryService.create(payload);

    request$.subscribe({
      next: (subcategory: SubcategoryDto) => {
        const label = subcategory?.name ?? 'Sottocategoria';
        this.subcategorySuccess = this.editingSubcategoryId != null
          ? `Sottocategoria "${label}" aggiornata.`
          : `Sottocategoria "${label}" creata.`;
        this.isSavingSubcategory = false;
        this.resetSubcategoryForm();
        this.loadCategories();
        this.loadItems();
      },
      error: (err: unknown) => {
        console.error('Failed to save subcategory', err);
        this.subcategoryError = this.editingSubcategoryId != null
          ? 'Impossibile aggiornare la sottocategoria. Riprova per favore.'
          : 'Impossibile creare la sottocategoria. Riprova per favore.';
        this.isSavingSubcategory = false;
      }
    });
  }

  onSubmitIdentity(): void {
    this.identitySuccess = undefined;
    this.identityError = undefined;

    if (this.identityForm.invalid) {
      this.identityForm.markAllAsTouched();
      this.timeShifts.controls.forEach(control => (control as FormGroup).markAllAsTouched());
      this.teamMembers.controls.forEach(control => (control as FormGroup).markAllAsTouched());
      this.identityError = 'Completa i campi obbligatori per salvare le informazioni del locale.';
      return;
    }

    const rawValue = this.identityForm.getRawValue();
    const timeShiftsRaw = (rawValue.timeShifts ?? []) as Array<Partial<BarTimeShift>>;
    const cleanedTimeShifts = timeShiftsRaw
      .filter(shift => !!shift && !!(shift.label?.trim() || shift.from?.trim() || shift.to?.trim()))
      .map<BarTimeShift>(shift => ({
        label: shift.label?.trim() ?? '',
        from: shift.from?.trim() ?? '',
        to: shift.to?.trim() ?? ''
      }))
      .filter(shift => shift.label && shift.from && shift.to);

    const teamRaw = (rawValue.team ?? []) as Array<Partial<BarTeamMember>>;
    const cleanedTeam = teamRaw
      .filter(member => !!member && !!(member.name?.trim() || member.role?.trim()))
      .map<BarTeamMember>(member => ({
        name: member.name?.trim() ?? '',
        role: member.role?.trim() ?? ''
      }))
      .filter(member => member.name);

    const payload: BarIdentity = {
      name: rawValue.name?.trim() ?? '',
      tagline: rawValue.tagline?.trim() ?? '',
      address: rawValue.address?.trim() ?? '',
      phone: rawValue.phone?.trim() ?? '',
      email: rawValue.email?.trim() ?? '',
      vatNumber: rawValue.vatNumber?.trim() ?? '',
      parkingInfo: rawValue.parkingInfo?.trim() ?? '',
      additionalInfo: rawValue.additionalInfo?.trim() ?? '',
      timeShifts: cleanedTimeShifts,
      team: cleanedTeam
    };

    this.barIdentityService.updateIdentity(payload);
    this.identityError = undefined;
    this.identitySuccess = 'Identita del locale aggiornata.';
    this.populateIdentityForm();
  }

  refreshCategories(): void {
    this.loadCategories();
    this.loadItems();
  }

  startCategoryEdit(category: CategoryDto): void {
    if (!category) {
      return;
    }
    this.editingCategoryId = category.id;
    this.categoryForm.patchValue({
      code: category.code ?? '',
      name: category.name ?? '',
      iconUrl: category.iconUrl ?? ''
    });
  }

  cancelCategoryEdit(): void {
    this.resetCategoryForm();
  }

  deleteCategory(category: CategoryDto): void {
    if (category?.id == null) {
      return;
    }
    this.categorySuccess = undefined;
    this.categoryError = undefined;

    this.categoryService.delete1(category.id).subscribe({
      next: () => {
        const label = category.name ?? category.code ?? 'Categoria';
        this.categorySuccess = `Categoria "${label}" eliminata.`;
        if (this.editingCategoryId === category.id) {
          this.resetCategoryForm();
        }
        this.loadCategories();
        this.loadItems();
      },
      error: (err: unknown) => {
        console.error('Failed to delete category', err);
        this.categoryError = 'Impossibile eliminare la categoria. Riprova per favore.';
      }
    });
  }

  startSubcategoryEdit(subcategory: SubcategoryDto): void {
    if (!subcategory?.id) {
      return;
    }
    this.editingSubcategoryId = subcategory.id;
    this.subcategoryForm.patchValue({
      name: subcategory.name ?? '',
      slug: subcategory.slug ?? '',
      position: subcategory.position ?? 0,
      categoryId: subcategory.categoryId != null ? String(subcategory.categoryId) : ''
    });
    const itemIds = [...(subcategory.itemIds ?? [])];
    this.subcategoryForm.get('itemIds')?.setValue(itemIds, { emitEvent: false });
  }

  cancelSubcategoryEdit(): void {
    this.resetSubcategoryForm();
  }

  deleteSubcategory(subcategory: SubcategoryDto): void {
    if (!subcategory?.id) {
      return;
    }
    this.subcategorySuccess = undefined;
    this.subcategoryError = undefined;

    this.subcategoryService.delete(subcategory.id).subscribe({
      next: () => {
        const label = subcategory.name ?? 'Sottocategoria';
        this.subcategorySuccess = `Sottocategoria "${label}" eliminata.`;
        if (this.editingSubcategoryId === subcategory.id) {
          this.resetSubcategoryForm();
        }
        this.loadCategories();
        this.loadItems();
      },
      error: (err: unknown) => {
        console.error('Failed to delete subcategory', err);
        this.subcategoryError = 'Impossibile eliminare la sottocategoria. Riprova per favore.';
      }
    });
  }

  startItemEdit(item: ItemDto): void {
    if (item?.id == null) {
      return;
    }
    this.editingItemId = item.id;
    this.itemForm.patchValue({
      name: item.name ?? '',
      description: item.description ?? '',
      price: item.price ?? null,
      photoUrl: item.photoUrl ?? '',
      categoryId: item.category?.id != null ? String(item.category.id) : '',
      tagLabel: item.tag?.label ?? '',
      tagCssClass: item.tag?.cssClass ?? ''
    });
  }

  cancelItemEdit(): void {
    this.resetItemForm();
  }

  deleteItem(item: ItemDto): void {
    if (item?.id == null) {
      return;
    }
    this.itemSuccess = undefined;
    this.itemError = undefined;

    this.itemService._delete(item.id).subscribe({
      next: () => {
        const label = item.name ?? 'Piatto';
        this.itemSuccess = `Piatto "${label}" eliminato.`;
        if (this.editingItemId === item.id) {
          this.resetItemForm();
        }
        this.loadItems();
        this.loadCategories();
      },
      error: (err: unknown) => {
        console.error('Failed to delete item', err);
        this.itemError = 'Impossibile eliminare il piatto. Riprova per favore.';
      }
    });
  }

  categoryControl(controlName: string) {
    return this.categoryForm.get(controlName);
  }

  itemControl(controlName: string) {
    return this.itemForm.get(controlName);
  }

  shiftControl(index: number, controlName: string) {
    return (this.timeShifts.at(index) as FormGroup).get(controlName);
  }

  teamControl(index: number, controlName: string) {
    return (this.teamMembers.at(index) as FormGroup).get(controlName);
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByCategory(index: number, category: CategoryDto): number | string {
    return category.id ?? category.code ?? index;
  }

  trackBySubcategory(index: number, subcategory: SubcategoryDto): string {
    return subcategory.id ?? `${subcategory.slug ?? 'subcategory'}-${index}`;
  }

  trackByItemId(index: number, item: ItemDto): number | string {
    return item.id ?? `${item.name ?? 'item'}-${index}`;
  }

  get timeShiftsControls(): FormGroup[] {
    return this.timeShifts.controls as FormGroup[];
  }

  get teamControls(): FormGroup[] {
    return this.teamMembers.controls as FormGroup[];
  }

  get subcategoryItemOptions(): ItemDto[] {
    const rawCategoryId = this.subcategoryForm.get('categoryId')?.value;
    const categoryId = rawCategoryId !== '' ? Number(rawCategoryId) : NaN;
    if (isNaN(categoryId)) {
      return [];
    }
    return this.menuItems.filter(item => item.category?.id === categoryId);
  }

  subcategoryItems(subcategory: SubcategoryDto | null | undefined): ItemDto[] {
    if (!subcategory?.itemIds?.length) {
      return [];
    }
    return subcategory.itemIds
      .map(id => this.itemIndex.get(id))
      .filter((item): item is ItemDto => !!item);
  }

  categoryItemsWithoutSubcategory(category: CategoryDto): ItemDto[] {
    if (!category?.id) {
      return [];
    }
    const assignedIds = new Set<number>();
    (category.subcategories ?? []).forEach(sub => {
      (sub.itemIds ?? []).forEach(id => {
        if (id != null) {
          assignedIds.add(id);
        }
      });
    });

    return this.menuItems.filter(item => {
      const itemId = item.id;
      return item.category?.id === category.id && (itemId == null || !assignedIds.has(itemId));
    });
  }

  selectPanel(panel: 'identity' | 'menu'): void {
    this.selectedPanel = panel;
  }

  get isIdentityPanel(): boolean {
    return this.selectedPanel === 'identity';
  }

  get isMenuPanel(): boolean {
    return this.selectedPanel === 'menu';
  }

  addTimeShift(): void {
    this.timeShifts.push(this.createTimeShiftGroup());
  }

  removeTimeShift(index: number): void {
    if (this.timeShifts.length > 1) {
      this.timeShifts.removeAt(index);
    }
  }

  addTeamMember(): void {
    this.teamMembers.push(this.createTeamMemberGroup());
  }

  removeTeamMember(index: number): void {
    if (this.teamMembers.length > 1) {
      this.teamMembers.removeAt(index);
    }
  }

  private loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoriesLoadError = undefined;

    this.categoryService.findAll1().subscribe({
      next: (categories: CategoryDto[] | undefined) => {
        this.categories = this.normalizeCategories(categories ?? []);
        this.isLoadingCategories = false;
        this.categoriesLoadError = undefined;
        this.reconcileEditingState();
      },
      error: (err: unknown) => {
        console.error('Failed to load categories', err);
        this.categoriesLoadError = 'Impossibile caricare le categorie per la selezione.';
        this.isLoadingCategories = false;
      }
    });
  }

  private loadItems(): void {
    this.isLoadingItems = true;
    this.itemsLoadError = undefined;

    this.itemService.findAll().subscribe({
      next: (items: ItemDto[] | undefined) => {
        this.menuItems = items ?? [];
        this.rebuildItemIndex();
        this.isLoadingItems = false;
        this.itemsLoadError = undefined;
        this.reconcileItemEditingState();
      },
      error: (err: unknown) => {
        console.error('Failed to load items', err);
        this.itemsLoadError = 'Impossibile caricare i piatti.';
        this.menuItems = [];
        this.itemIndex.clear();
        this.isLoadingItems = false;
      }
    });
  }

  private normalizeCategories(categories: CategoryDto[]): CategoryDto[] {
    return categories.map(category => ({
      ...category,
      subcategories: [...(category.subcategories ?? [])].sort((a, b) => {
        const positionA = a?.position ?? 0;
        const positionB = b?.position ?? 0;
        return positionA - positionB;
      })
    }));
  }

  private rebuildItemIndex(): void {
    this.itemIndex.clear();
    for (const item of this.menuItems) {
      if (item?.id != null) {
        this.itemIndex.set(item.id, item);
      }
    }
  }

  private reconcileEditingState(): void {
    if (this.editingCategoryId != null) {
      const categoryExists = this.categories.some(category => category.id === this.editingCategoryId);
      if (!categoryExists) {
        this.resetCategoryForm();
      }
    }

    if (this.editingSubcategoryId != null) {
      const subcategoryExists = this.categories.some(category =>
        (category.subcategories ?? []).some(subcategory => subcategory.id === this.editingSubcategoryId)
      );
      if (!subcategoryExists) {
        this.resetSubcategoryForm();
      }
    }
  }

  private reconcileItemEditingState(): void {
    if (this.editingItemId != null) {
      const itemExists = this.menuItems.some(item => item.id === this.editingItemId);
      if (!itemExists) {
        this.resetItemForm();
      }
    }
  }

  private resetCategoryForm(): void {
    this.editingCategoryId = undefined;
    this.categoryForm.reset({
      code: '',
      name: '',
      iconUrl: ''
    });
  }

  private resetSubcategoryForm(): void {
    this.editingSubcategoryId = undefined;
    this.subcategoryForm.reset({
      name: '',
      slug: '',
      position: 0,
      categoryId: '',
      itemIds: []
    });
    this.subcategoryForm.get('itemIds')?.setValue([], { emitEvent: false });
  }

  private resetItemForm(): void {
    this.editingItemId = undefined;
    this.itemForm.reset({
      name: '',
      description: '',
      price: null,
      photoUrl: '',
      categoryId: '',
      tagLabel: '',
      tagCssClass: ''
    });
  }

  private populateIdentityForm(): void {
    const identity = this.barIdentityService.identity;

    this.identityForm.patchValue(
      {
        name: identity.name ?? '',
        tagline: identity.tagline ?? '',
        address: identity.address ?? '',
        phone: identity.phone ?? '',
        email: identity.email ?? '',
        vatNumber: identity.vatNumber ?? '',
        parkingInfo: identity.parkingInfo ?? '',
        additionalInfo: identity.additionalInfo ?? ''
      },
      { emitEvent: false }
    );

    this.setFormArray(this.timeShifts, identity.timeShifts, value => this.createTimeShiftGroup(value));
    this.setFormArray(this.teamMembers, identity.team, value => this.createTeamMemberGroup(value));
  }

  private setFormArray<T>(array: FormArray, values: T[], factory: (value?: T) => FormGroup): void {
    while (array.length > 0) {
      array.removeAt(0);
    }

    if (!values || values.length === 0) {
      array.push(factory());
      return;
    }

    values.forEach(value => array.push(factory(value)));
  }

  private createTimeShiftGroup(shift?: BarTimeShift): FormGroup {
    return this.fb.group({
      label: [shift?.label ?? '', Validators.required],
      from: [shift?.from ?? '', Validators.required],
      to: [shift?.to ?? '', Validators.required]
    });
  }

  private createTeamMemberGroup(member?: BarTeamMember): FormGroup {
    return this.fb.group({
      name: [member?.name ?? '', Validators.required],
      role: [member?.role ?? '', Validators.required]
    });
  }

  private get timeShifts(): FormArray {
    return this.identityForm.get('timeShifts') as FormArray;
  }

  private get teamMembers(): FormArray {
    return this.identityForm.get('team') as FormArray;
  }
}
