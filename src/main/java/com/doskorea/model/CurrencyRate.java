package com.doskorea.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

/** Курс валюты: сколько единиц валюты стоит 1 доллар США. Цены в базе хранятся в долларах. */
@Entity
@Table(name = "currency_rates")
public class CurrencyRate {

    @Id
    @Column(length = 3)
    private String code;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal rate;

    @Column(nullable = false)
    private Instant updatedAt;

    public CurrencyRate() {
    }

    public CurrencyRate(String code, BigDecimal rate) {
        this.code = code;
        this.rate = rate;
        this.updatedAt = Instant.now();
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
