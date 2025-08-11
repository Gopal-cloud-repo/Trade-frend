package com.angelone.trading.controller;

import com.angelone.trading.dto.LoginRequest;
import com.angelone.trading.dto.LoginResponse;
import com.angelone.trading.dto.RegisterRequest;
import com.angelone.trading.entity.User;
import com.angelone.trading.repository.UserRepository;
import com.angelone.trading.security.JwtTokenHelper;
import com.angelone.trading.service.AngelOneApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenHelper jwtTokenHelper;
    private final AngelOneApiService angelOneApiService;
    private final MarketDataService marketDataService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );
        
        User user = (User) authentication.getPrincipal();
        String token = jwtTokenHelper.generateToken(user);
        
        // Try to authenticate with Angel One API
        angelOneApiService.authenticateUser(user);
        
        // Initialize WebSocket connection for real-time data
        if (user.getAngelOneToken() != null) {
            marketDataService.initializeAngelOneWebSocket(user.getAngelOneToken(), user.getAngelOneClientId());
        }
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(user);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setName(registerRequest.getName());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(User.Role.USER);
        user.setAccountBalance(BigDecimal.valueOf(250000)); // Demo balance
        
        user = userRepository.save(user);
        
        String token = jwtTokenHelper.generateToken(user);
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(user);
        
        return ResponseEntity.ok(response);
    }
}