package com.angelone.trading.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class RegisterRequest {
    @Email
    @NotBlank
    private String email;
    
    @NotBlank
    @Size(min = 2, max = 50)
    private String name;
    
    @NotBlank
    @Size(min = 6, max = 100)
    private String password;
}