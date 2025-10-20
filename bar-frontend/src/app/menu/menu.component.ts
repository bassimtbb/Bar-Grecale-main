import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { CategoryControllerService, CategoryDto, ItemControllerService, ItemDto, SubcategoryDto } from '../api-client';

const ALL_CATEGORY_ID = 'all';
const ALL_SUBCATEGORY_ID = 'all';

interface MenuSubcategory {
  id: string;
  label: string;
  itemIds: number[];
}

interface MenuCategory {
  id: string;
  label: string;
  subcategories: MenuSubcategory[];
}

export class MenuTag {
  constructor(public label: string, public cssClass: string) {}
}

export class MenuItem {
  constructor(
    public id: number | undefined,
    public title: string,
    public categoryId: string,
    public description: string,
    public photoUrl?: string,
    public price?: number,
    public tag?: MenuTag
  ) {}
}

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  categories: MenuCategory[] = [];
  displayItems: MenuItem[] = [];
  menuItems: ItemDto[] = [];
  activeCategory = ALL_CATEGORY_ID;
  activeSubcategory = ALL_SUBCATEGORY_ID;
  isLoading = false;
  loadError?: string;
  readonly initialVisibleCount = 6;
  readonly paginationStep = 6;
  visibleLimit = this.initialVisibleCount;

  private readonly subcategoryMap = new Map<string, MenuSubcategory>();

  constructor(
    private readonly itemApi: ItemControllerService,
    private readonly categoryService: CategoryControllerService
  ) {}

  ngOnInit(): void {
    this.fetchMenuData();
  }

  get filteredItems(): MenuItem[] {
    return this.displayItems.filter(item => {
      const matchesCategory = this.activeCategory === ALL_CATEGORY_ID || item.categoryId === this.activeCategory;
      if (!matchesCategory) {
        return false;
      }

      if (this.activeSubcategory === ALL_SUBCATEGORY_ID) {
        return true;
      }

      const subcategory = this.subcategoryMap.get(this.activeSubcategory);
      if (!subcategory) {
        return false;
      }

      return item.id !== undefined && subcategory.itemIds.includes(item.id);
    });
  }

  get categoryFilters(): { id: string; label: string }[] {
      return [{ id: ALL_CATEGORY_ID, label: 'Tutti' }, ...this.categories.map(category => ({ id: category.id, label: category.label }))];
  }

  get subcategoryFilters(): { id: string; label: string }[] {
    if (this.activeCategory === ALL_CATEGORY_ID) {
      return [];
    }

    const category = this.categories.find(cat => cat.id === this.activeCategory);
    if (!category || category.subcategories.length === 0) {
      return [];
    }

    return [
      { id: ALL_SUBCATEGORY_ID, label: 'Tutti' },
      ...category.subcategories.map(subcategory => ({ id: subcategory.id, label: subcategory.label }))
    ];
  }

  setCategoryFilter(filter: string): void {
    this.activeCategory = filter;
    this.activeSubcategory = ALL_SUBCATEGORY_ID;
    this.resetVisibleLimit();
  }

  setSubcategoryFilter(filter: string): void {
    this.activeSubcategory = filter;
    this.resetVisibleLimit();
  }

  isCategoryActive(filter: string): boolean {
    return this.activeCategory === filter;
  }

  isSubcategoryActive(filter: string): boolean {
    return this.activeSubcategory === filter;
  }

  private fetchMenuData(): void {
    this.isLoading = true;

    forkJoin({
      categories: this.categoryService.findAll1(),
      items: this.itemApi.findAll()
    }).subscribe({
      next: ({ categories, items }) => {
        this.categories = this.buildMenuCategories(categories ?? []);
        this.menuItems = items ?? [];
        this.displayItems = this.menuItems.map(item => this.toMenuItem(item));
        this.resetVisibleLimit();
        this.isLoading = false;
      },
      error: err => {
        console.error('Failed to load menu data', err);
        this.loadError = 'Unable to load menu data right now.';
        this.isLoading = false;
      }
    });
  }

  get visibleItems(): MenuItem[] {
    return this.filteredItems.slice(0, this.visibleLimit);
  }

  get canShowMore(): boolean {
    return this.filteredItems.length > this.visibleLimit;
  }

  showMore(): void {
    this.visibleLimit = Math.min(this.visibleLimit + this.paginationStep, this.filteredItems.length);
  }

  private buildMenuCategories(source: CategoryDto[]): MenuCategory[] {
    this.subcategoryMap.clear();
    const seen = new Set<string>();
    const categories: MenuCategory[] = [];

    for (const dto of source) {
      const category = this.toMenuCategory(dto);
      if (seen.has(category.id)) {
        continue;
      }
      seen.add(category.id);
      categories.push(category);
    }

    return categories;
  }

  private toMenuCategory(category: CategoryDto): MenuCategory {
    const id = this.getCategoryKey(category);
    const label = category.name?.trim() || category.code || `Category ${id}`;
    const subcategories = (category.subcategories ?? []).map(subcategory => this.toMenuSubcategory(subcategory, id));

    return {
      id,
      label,
      subcategories
    };
  }

  private toMenuSubcategory(subcategory: SubcategoryDto, categoryId: string): MenuSubcategory {
    const id = subcategory.id ? String(subcategory.id) : `${categoryId}-${subcategory.slug ?? 'subcategory'}`;
    const label = subcategory.name?.trim() || subcategory.slug || 'Subcategory';
    const itemIds = subcategory.itemIds?.map(itemId => Number(itemId)) ?? [];

    const menuSubcategory: MenuSubcategory = {
      id,
      label,
      itemIds
    };

    this.subcategoryMap.set(id, menuSubcategory);
    return menuSubcategory;
  }

  private toMenuItem(item: ItemDto): MenuItem {
    const id = typeof item.id === 'number' ? item.id : undefined;
    const title = item.name?.trim() || 'Untitled item';
        const description = item.description?.trim() || 'Nessuna descrizione disponibile';
    const categoryId = this.getCategoryKey(item.category ?? undefined);
    const tagLabel = item.tag?.label?.trim();
    const tagClass = item.tag?.cssClass?.trim();
    const tag = tagLabel ? new MenuTag(tagLabel, tagClass || 'menu-tag-default') : undefined;
    const photoUrl = item.photoUrl?.trim() || undefined;
    const price = typeof item.price === 'number' && item.price > 0 ? item.price : undefined;

    return new MenuItem(id, title, categoryId, description, photoUrl, price, tag);
  }

  private getCategoryKey(category?: CategoryDto | null): string {
    if (!category) {
      return 'uncategorized';
    }

    if (category.id !== undefined && category.id !== null) {
      return String(category.id);
    }

    if (category.code) {
      return category.code;
    }

    if (category.name) {
      return category.name.toLowerCase().replace(/\s+/g, '-');
    }

    return 'uncategorized';
  }

  private resetVisibleLimit(): void {
    this.visibleLimit = this.initialVisibleCount;
  }
}
