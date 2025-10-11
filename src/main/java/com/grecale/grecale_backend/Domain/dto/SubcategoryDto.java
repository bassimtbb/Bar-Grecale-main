package com.grecale.grecale_backend.Domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class SubcategoryDto {
    private UUID id;
    private String slug;
    private String name;
    private int position;
    private Long categoryId;
    private List<Long> itemIds = new ArrayList<>();
}
