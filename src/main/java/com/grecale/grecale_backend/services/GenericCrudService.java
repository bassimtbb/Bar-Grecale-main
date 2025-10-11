package com.grecale.grecale_backend.services;


import com.grecale.grecale_backend.Domain.dto.GenericDto;
import com.grecale.grecale_backend.Domain.entities.GenericEntity;
import com.grecale.grecale_backend.exception.ResourceNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.ParameterizedType;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * Generuc crud service.
 * @param <T> entity.
 * @param <U> dto.
 */
public abstract class GenericCrudService<T extends GenericEntity, U extends GenericDto> {

    private final Class<T> entityClazz;
    private final Class<U> dtoClazz;

    @Autowired
    protected ModelMapper modelMapper;

    /**
     * constructor.
     */
    public GenericCrudService() {
        this.entityClazz = (Class<T>) ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments()[0];
        this.dtoClazz = (Class<U>) ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments()[1];
    }

    /**
     * Interrogates the database to retrieve all T entities.
     *
     * @return the list of found applications. Can be empty.
     */
    @Transactional(readOnly = true)
    public List<U> findAll() {
        Iterable entities = this.getRepository().findAll();

        return (List<U>) StreamSupport.stream(entities.spliterator(), false)
                .map(elt -> this.convertToDto((T) elt))
                .collect(Collectors.toList());
    }



    /**
     * Ask the database to create the given entity.
     *
     * @param entityDto the entity to create.
     * @return the created entity in DTO format.
     */
    public U add(U entityDto) throws ResourceNotFoundException {
        T entity = this.convertToEntity(entityDto);
        T created = (T) this.getRepository().save(entity);
        return this.convertToDto(created);
    }

    /**
     * Ask the database to update the given entity.
     *
     * @param entityDto the entity to create.
     * @return the created entity in DTO format.
     * @throws ResourceNotFoundException if error
     */
    public U update(Long id ,U entityDto) throws ResourceNotFoundException {
        if (id== null || this.findById(id) == null) {
            throw new ResourceNotFoundException("no " + this.dtoClazz.getName() + " entry found with id " + entityDto.getId());
        }
        entityDto.setId(id);
        T entity = this.convertToEntity(entityDto);
        T updated = (T) this.getRepository().save(entity);
        return this.convertToDto(updated);
    }


    /**
     * Interrogates the database to find an entity matching the id.
     *
     * @param id the id of the wanted entity.
     * @return the found entity. deleteNull otherwise.
     */
    public U findById(Long id) {
        T entity = (T) (this.getRepository().findById(id)).orElse(null);
        return this.convertToDto(entity);
    }

    /**
     * Delete the entity in the database matching the given id.
     *
     * @param id the id of the entity to delete.
     * @return true if entity deleted
     */
    public boolean delete(long id) {
        try {
            this.getRepository().deleteById(id);
        } catch (Exception e) {
            return false;
        }
        return true;
    }

    /**
     * abstract class that return crudRepository auto wired in sub classes.
     *
     * @return crudRepository.
     */
    protected abstract CrudRepository getRepository();

    public void setModelMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    /**
     * Convert entity to DTO Object.
     *
     * @param entity map database table.
     * @return dto object.
     */
    protected U convertToDto(T entity) {
        if (entity != null) {
            return modelMapper.map(entity, dtoClazz);
        }
        return null;
    }

    /**
     * Convert DTO Object to entity.
     *
     * @param entityDto object.
     * @return entity map database table.
     */
    protected T convertToEntity(U entityDto) {
        if (entityDto != null) {
            return modelMapper.map(entityDto, entityClazz);
        }
        return null;
    }

}
