package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.security.UserDetailsImpl;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final String AI_SERVICE_URL = "http://localhost:8000/chat";
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> payload,
                                  @AuthenticationPrincipal UserDetailsImpl userDetails,
                                  HttpServletRequest request) {
        try {
            String message = (String) payload.get("message");
            String conversationId = (String) payload.get("conversationId");

            String authHeader = request.getHeader("Authorization");
            String jwtToken = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwtToken = authHeader.substring(7);
            }

            Map<String, Object> userContext = new HashMap<>();
            if (userDetails != null) {
                userContext.put("userId", userDetails.getId());
                userContext.put("username", userDetails.getUsername());
                userContext.put("email", userDetails.getEmail());
            }
            userContext.put("jwtToken", jwtToken);

            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("message", message);
            aiRequest.put("conversationId", conversationId != null ? conversationId : "default");
            aiRequest.put("userContext", userContext);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(aiRequest, headers);

            ResponseEntity<Map> response = restTemplate.exchange(AI_SERVICE_URL, HttpMethod.POST, entity, Map.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());

        } catch (Exception e) {
            Map<String, Object> errorRes = new HashMap<>();
            errorRes.put("conversationId", payload.get("conversationId"));
            errorRes.put("message", "I'm having trouble communicating with my AI service right now. Please try again in a moment!");
            errorRes.put("intent", "UNKNOWN");
            errorRes.put("products", new Object[]{});
            errorRes.put("orders", new Object[]{});
            return ResponseEntity.status(HttpStatus.OK).body(errorRes);
        }
    }
}
