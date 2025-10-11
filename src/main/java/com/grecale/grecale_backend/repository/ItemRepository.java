package com.grecale.grecale_backend.repository;

import com.grecale.grecale_backend.Domain.entities.Item;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends CrudRepository<Item, Long> {
}