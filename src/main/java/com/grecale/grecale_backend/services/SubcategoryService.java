package com.grecale.grecale_backend.services;

import com.grecale.grecale_backend.Domain.dto.SubcategoryDto;
import com.grecale.grecale_backend.Domain.entities.Category;
import com.grecale.grecale_backend.Domain.entities.Item;
import com.grecale.grecale_backend.Domain.entities.Subcategory;
import com.grecale.grecale_backend.exception.ResourceNotFoundException;
import com.grecale.grecale_backend.repository.CategoryRepository;
import com.grecale.grecale_backend.repository.ItemRepository;
import com.grecale.grecale_backend.repository.SubcategoryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Transactional
public class SubcategoryService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SubcategoryService.class);

    private final SubcategoryRepository subcategoryRepository;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<SubcategoryDto> findAll() {
        return subcategoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubcategoryDto findById(UUID id) throws ResourceNotFoundException {
        return toDto(resolveSubcategory(id));
    }

    public SubcategoryDto create(SubcategoryDto dto) throws ResourceNotFoundException {
        Subcategory subcategory = new Subcategory();
        applyDto(subcategory, dto);
        Subcategory saved = subcategoryRepository.save(subcategory);
        return toDto(saved);
    }

    public SubcategoryDto update(UUID id, SubcategoryDto dto) throws ResourceNotFoundException {
        Subcategory subcategory = resolveSubcategory(id);
        applyDto(subcategory, dto);
        Subcategory saved = subcategoryRepository.save(subcategory);
        return toDto(saved);
    }

    public void delete(UUID id) throws ResourceNotFoundException {
        Subcategory subcategory = resolveSubcategory(id);
        // Detach linked items before deleting to avoid foreign key issues
        for (Item item : new ArrayList<>(subcategory.getItems())) {
            item.setSubcategory(null);
            itemRepository.save(item);
        }
        subcategoryRepository.delete(subcategory);
    }

    private void applyDto(Subcategory subcategory, SubcategoryDto dto) throws ResourceNotFoundException {
        subcategory.setSlug(dto.getSlug());
        subcategory.setName(dto.getName());
        subcategory.setPosition(dto.getPosition());

        if (dto.getCategoryId() == null) {
            throw new ResourceNotFoundException("categoryId must be provided for a subcategory");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + dto.getCategoryId()));
        subcategory.setCategory(category);

        if (dto.getItemIds() != null) {
            syncItems(subcategory, dto.getItemIds());
        }
    }

    private void syncItems(Subcategory subcategory, List<Long> requestedItemIds) {
        Set<Long> targetIds = requestedItemIds == null ? Collections.emptySet() : new LinkedHashSet<>(requestedItemIds);

        // Detach items no longer linked
        for (Iterator<Item> iterator = subcategory.getItems().iterator(); iterator.hasNext(); ) {
            Item current = iterator.next();
            Long itemId = current.getId();
            if (itemId == null || !targetIds.contains(itemId)) {
                current.setSubcategory(null);
                itemRepository.save(current);
                iterator.remove();
            }
        }

        if (targetIds.isEmpty()) {
            return;
        }

        Iterable<Item> fetched = itemRepository.findAllById(targetIds);
        List<Item> fetchedList = StreamSupport.stream(fetched.spliterator(), false).collect(Collectors.toList());

        Set<Long> foundIds = fetchedList.stream()
                .map(Item::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        for (Long targetId : targetIds) {
            if (!foundIds.contains(targetId)) {
                LOGGER.warn("Requested item with id {} not found while assigning to subcategory {}", targetId, subcategory.getId());
            }
        }

        for (Item item : fetchedList) {
            item.setSubcategory(subcategory);
            if (!subcategory.getItems().contains(item)) {
                subcategory.getItems().add(item);
            }
            itemRepository.save(item);
        }
    }

    private Subcategory resolveSubcategory(UUID id) throws ResourceNotFoundException {
        return subcategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found with id " + id));
    }

    private SubcategoryDto toDto(Subcategory subcategory) {
        if (subcategory == null) {
            return null;
        }
        SubcategoryDto dto = new SubcategoryDto();
        dto.setId(subcategory.getId());
        dto.setSlug(subcategory.getSlug());
        dto.setName(subcategory.getName());
        dto.setPosition(subcategory.getPosition());
        dto.setCategoryId(subcategory.getCategory() != null ? subcategory.getCategory().getId() : null);
        if (subcategory.getItems() != null) {
            List<Long> itemIds = subcategory.getItems().stream()
                    .map(Item::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            dto.setItemIds(itemIds);
        }
        return dto;
    }
}

