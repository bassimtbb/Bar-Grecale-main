package com.grecale.grecale_backend.rest;

import com.grecale.grecale_backend.Domain.dto.ItemDto;
import com.grecale.grecale_backend.Domain.entities.Item;
import com.grecale.grecale_backend.services.GenericCrudService;
import com.grecale.grecale_backend.services.ItemService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/items")
public class ItemController extends GenericCrudController<Item, ItemDto> {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @Override
    protected GenericCrudService<Item, ItemDto> getCrudService() {
        return itemService;
    }
}