package com.grecale.grecale_backend.rest;

import com.grecale.grecale_backend.Domain.dto.GenericDto;
import com.grecale.grecale_backend.Domain.entities.GenericEntity;
import com.grecale.grecale_backend.exception.ResourceNotFoundException;
import com.grecale.grecale_backend.services.GenericCrudService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * generic service controller.
 * @param <T> entity.
 * @param <U> dto.
 */
@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public abstract class GenericCrudController<T extends GenericEntity, U extends GenericDto> {


    /**
     * {@link GenericCrudService#findById }.
     *
     * @param id the id of the wanted entity.
     * @return the found entity. deleteNull otherwise.
     */
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Successfully retrieve entity")})
    @GetMapping("/{id}")
    public ResponseEntity<U> findById(@PathVariable("id") long id) {
        U entityDto = this.getCrudService().findById(id);
        return new ResponseEntity<U>(entityDto, entityDto != null ? HttpStatus.OK : HttpStatus.NO_CONTENT);
    }
    /**
     * {@link GenericCrudService#add }.
     *
     * @param u the entity to create.
     * @return the created entity in DTO format.
     */
    @ApiResponses(value = {@ApiResponse(responseCode = "201", description = "Successfully created entity")})
    @PostMapping
    public ResponseEntity<U> add(@Valid @RequestBody U u) throws ResourceNotFoundException {
        U entityDto = this.getCrudService().add(u);
        return new ResponseEntity<U>(entityDto, HttpStatus.CREATED);
    }

    /**
     * {@link GenericCrudService#update }.
     *
     * @param u the entity to create.
     * @return the created entity in DTO format.
     * @throws ResourceNotFoundException if error.
     */
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Successfully updated entity")})
    @PutMapping("/{id}")
    public ResponseEntity<U> update(@PathVariable("id") Long id, @Valid @RequestBody U u) throws ResourceNotFoundException {
        System.out.println(id );
        System.out.println(u );
        U entityDto = this.getCrudService().update(id,u);
        System.out.println(entityDto);

        return new ResponseEntity<U>(entityDto, HttpStatus.OK);

    }


    /**
     * {@link GenericCrudService#delete }.
     *
     * @param id the id of the entity to delete.
     * @return true if entity deleted
     */
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Successfully delete entity")})
    @DeleteMapping("/{id}")
    public ResponseEntity delete(@PathVariable("id") long id) {
        boolean deleted = this.getCrudService().delete(id);
        return new ResponseEntity(deleted, deleted ? HttpStatus.OK : HttpStatus.NOT_MODIFIED);
    }

    /**
     * {@link GenericCrudService#findAll() }.
     * @return the list of found applications. Can be empty.
     */
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Successfully retrieve list")})
    @GetMapping("/all")
    public ResponseEntity<List<U>> findAll() {
        List<U> entityDtoList = this.getCrudService().findAll();
        return new ResponseEntity<>(entityDtoList, entityDtoList != null ? HttpStatus.OK : HttpStatus.NO_CONTENT);
    }

    /**
     * return the crudService injected in sub-classes.
     *
     * @return crud service.
     */
    protected abstract GenericCrudService<T, U> getCrudService();
}
