package com.doskorea.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class Spec {

    @Column(name = "spec_name", length = 80)
    private String name;

    @Column(name = "spec_value", length = 300)
    private String value;

    public Spec() {
    }

    public Spec(String name, String value) {
        this.name = name;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}