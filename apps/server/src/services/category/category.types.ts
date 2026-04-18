export interface CategoryFilters {
    isPublished?: boolean;
}

export interface CategoryFieldsUpdateInput {
    name?: string;
    isPublished?: boolean;
    sortOrder?: number;
}
