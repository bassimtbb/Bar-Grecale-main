package com.grecale.grecale_backend.rest;

import com.grecale.grecale_backend.Domain.dto.SubcategoryDto;
import com.grecale.grecale_backend.exception.ResourceNotFoundException;
import com.grecale.grecale_backend.services.SubcategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subcategories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SubcategoryController {

    private final SubcategoryService subcategoryService;

    @GetMapping
    public ResponseEntity<List<SubcategoryDto>> findAll() {
        List<SubcategoryDto> subcategories = subcategoryService.findAll();
        return ResponseEntity.ok(subcategories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubcategoryDto> findById(@PathVariable UUID id) throws ResourceNotFoundException {
        SubcategoryDto dto = subcategoryService.findById(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<SubcategoryDto> create(@Valid @RequestBody SubcategoryDto dto) throws ResourceNotFoundException {
        SubcategoryDto created = subcategoryService.create(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubcategoryDto> update(@PathVariable UUID id, @Valid @RequestBody SubcategoryDto dto) throws ResourceNotFoundException {
        SubcategoryDto updated = subcategoryService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) throws ResourceNotFoundException {
        subcategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
