package com.grecale.grecale_backend.repository;

import com.grecale.grecale_backend.Domain.entities.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubcategoryRepository extends JpaRepository<Subcategory, UUID> {

    List<Subcategory> findByCategoryId(Long categoryId);

}
