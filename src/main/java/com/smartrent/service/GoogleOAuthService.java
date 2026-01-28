package com.smartrent.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Google OAuth Service
 * Handles Google ID token verification
 */
@Slf4j
@Service
public class GoogleOAuthService {

    private final GoogleIdTokenVerifier verifier;

    public GoogleOAuthService(@Value("${google.oauth.client-id:}") String clientId) {
        if (clientId != null && !clientId.isEmpty()) {
            this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
        } else {
            this.verifier = null;
            log.warn("Google OAuth Client ID not configured. Google login will be disabled.");
        }
    }

    /**
     * Verify Google ID token and extract user information
     * @param idTokenString Google ID token from frontend
     * @return GoogleIdToken.Payload if valid, null otherwise
     */
    public GoogleIdToken.Payload verifyToken(String idTokenString) {
        if (verifier == null) {
            log.error("Google OAuth not configured");
            return null;
        }

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                
                // Verify token is not expired
                long exp = payload.getExpirationTimeSeconds();
                if (exp * 1000 < System.currentTimeMillis()) {
                    log.warn("Google ID token has expired");
                    return null;
                }
                
                return payload;
            } else {
                log.warn("Invalid Google ID token");
                return null;
            }
        } catch (Exception e) {
            log.error("Error verifying Google ID token", e);
            return null;
        }
    }
}
