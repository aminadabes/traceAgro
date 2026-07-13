package com.controledeestoque.demo.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Converter
@Component
public class CryptoConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES";
    private static String secretKey = "MySecretSuperKeyForAESEncryption12"; // Fallback default of 32 bytes/characters for AES-256 or 16 for AES-128

    @Value("${app.security.encryption-key:MySecretSuperKeyForAESEncryption12}")
    public void setSecretKey(String key) {
        secretKey = key;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty()) return null;
        try {
            byte[] keyBytes = secretKey.substring(0, 16).getBytes(StandardCharsets.UTF_8);
            SecretKeySpec keySpec = new SecretKeySpec(keyBytes, ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            byte[] encrypted = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao criptografar dado", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return null;
        try {
            byte[] keyBytes = secretKey.substring(0, 16).getBytes(StandardCharsets.UTF_8);
            SecretKeySpec keySpec = new SecretKeySpec(keyBytes, ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(dbData));
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao descriptografar dado", e);
        }
    }
}
