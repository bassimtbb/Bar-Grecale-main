/**
 * Subcategory DTO (manual extension of generated models).
 */
export interface SubcategoryDto {
    id?: string;
    slug?: string;
    name?: string;
    position?: number;
    categoryId?: number;
    itemIds?: Array<number>;
}
