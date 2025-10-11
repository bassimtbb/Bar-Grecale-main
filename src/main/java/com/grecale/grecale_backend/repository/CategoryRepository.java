package com.grecale.grecale_backend.repository;

import com.grecale.grecale_backend.Domain.entities.Category;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface CategoryRepository extends CrudRepository<Category, Long> {
    Optional<Category> findByCode(String code);
}

