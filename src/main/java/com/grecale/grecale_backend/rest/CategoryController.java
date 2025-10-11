package com.grecale.grecale_backend.rest;

import com.grecale.grecale_backend.Domain.dto.CategoryDto;
import com.grecale.grecale_backend.Domain.entities.Category;
import com.grecale.grecale_backend.services.CategoryService;
import com.grecale.grecale_backend.services.GenericCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/category")
public class CategoryController extends GenericCrudController<Category, CategoryDto> {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @Override
    protected GenericCrudService<Category, CategoryDto> getCrudService() {
        return categoryService;
    }
}