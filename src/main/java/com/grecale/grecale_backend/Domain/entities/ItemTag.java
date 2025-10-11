package com.grecale.grecale_backend.Domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemTag {
    @Column(name = "tag_label")
    private String label;

    @Column(name = "tag_css_class")
    private String cssClass;
}
