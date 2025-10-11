package com.grecale.grecale_backend.Domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ItemDto extends GenericDto {
    private String name;
    private String description;
    private BigDecimal price;
    private String photoUrl;
    private ItemTagDto tag;
    private CategoryDto category;
}
