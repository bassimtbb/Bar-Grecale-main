package com.grecale.grecale_backend.Domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CategoryDto extends GenericDto {
    private String code;
    private String name;
    private String iconUrl;
    private List<SubcategoryDto> subcategories = new ArrayList<>();
}
