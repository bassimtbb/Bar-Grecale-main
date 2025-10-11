package com.grecale.grecale_backend.services;

import com.grecale.grecale_backend.Domain.dto.ItemDto;
import com.grecale.grecale_backend.Domain.entities.Item;
import com.grecale.grecale_backend.repository.ItemRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class ItemService extends GenericCrudService<Item, ItemDto> {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    protected CrudRepository<Item, Long> getRepository() {
        return itemRepository;
    }
}