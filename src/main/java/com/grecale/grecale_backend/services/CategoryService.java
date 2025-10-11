package com.grecale.grecale_backend.services;

import com.grecale.grecale_backend.Domain.dto.CategoryDto;
import com.grecale.grecale_backend.Domain.dto.SubcategoryDto;
import com.grecale.grecale_backend.Domain.entities.Category;
import com.grecale.grecale_backend.Domain.entities.Item;
import com.grecale.grecale_backend.Domain.entities.Subcategory;
import com.grecale.grecale_backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService extends GenericCrudService<Category, CategoryDto> {

    private final CategoryRepository categoryRepository;

    @Override
    protected CrudRepository<Category, Long> getRepository() {
        return categoryRepository;
    }

    @Override
    protected CategoryDto convertToDto(Category entity) {
        CategoryDto dto = super.convertToDto(entity);
        if (dto == null || entity == null) {
            return dto;
        }

        if (entity.getSubcategories() != null) {
            List<SubcategoryDto> subcategoryDtos = entity.getSubcategories().stream()
                    .map(subcategory -> toSubcategoryDto(subcategory, entity.getId()))
                    .collect(Collectors.toList());
            dto.setSubcategories(subcategoryDtos);
        } else {
            dto.setSubcategories(new ArrayList<>());
        }

        return dto;
    }

    @Override
    protected Category convertToEntity(CategoryDto dto) {
        Category entity = super.convertToEntity(dto);
        if (entity != null) {
            if (dto.getId() != null) {
                categoryRepository.findById(dto.getId())
                        .ifPresent(existing -> {
                            List<Subcategory> existingSubcategories = existing.getSubcategories();
                            List<Item> existingItems = existing.getItems();
                            entity.setSubcategories(existingSubcategories == null ? new ArrayList<>() : new ArrayList<>(existingSubcategories));
                            entity.setItems(existingItems == null ? new ArrayList<>() : new ArrayList<>(existingItems));
                        });
            } else {
                entity.setSubcategories(new ArrayList<>());
                entity.setItems(new ArrayList<>());
            }
        }
        return entity;
    }

    private SubcategoryDto toSubcategoryDto(Subcategory subcategory, Long categoryId) {
        if (subcategory == null) {
            return null;
        }

        SubcategoryDto dto = new SubcategoryDto();
        dto.setId(subcategory.getId());
        dto.setSlug(subcategory.getSlug());
        dto.setName(subcategory.getName());
        dto.setPosition(subcategory.getPosition());
        dto.setCategoryId(categoryId);

        if (subcategory.getItems() != null) {
            List<Long> itemIds = subcategory.getItems().stream()
                    .map(Item::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            dto.setItemIds(itemIds);
        } else {
            dto.setItemIds(new ArrayList<>());
        }

        return dto;
    }
}
