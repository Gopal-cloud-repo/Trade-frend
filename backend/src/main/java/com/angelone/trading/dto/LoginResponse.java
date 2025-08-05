package com.angelone.trading.dto;

import com.angelone.trading.entity.User;
import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private User user;
}