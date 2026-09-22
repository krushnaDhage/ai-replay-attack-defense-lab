package com.replaylab.backend.ml;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class MlServiceClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ml-service.url}")
    private String mlServiceUrl;

    /**
     * Calls the Python ML service /predict endpoint.
     * Returns MlPredictionResult or a fallback if service is unavailable.
     */
    public MlPredictionResult predict(MlFeatures features) {
        try {
            String url = mlServiceUrl + "/predict";
            Map<String, Object> requestBody = Map.of("features", features.toMap());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String prediction = (String) body.getOrDefault("prediction", "UNKNOWN");
                double confidence = toDouble(body.getOrDefault("confidence", 0.5));
                double riskScore = toDouble(body.getOrDefault("riskScore", 50.0));

                @SuppressWarnings("unchecked")
                List<String> importantFeatures = (List<String>) body.getOrDefault("importantFeatures", List.of());

                @SuppressWarnings("unchecked")
                Map<String, Double> featureImportance = (Map<String, Double>) body.getOrDefault("featureImportance", Map.of());

                log.info("ML prediction: {} (confidence: {:.3f}, risk: {:.1f})", prediction, confidence, riskScore);
                return new MlPredictionResult(prediction, confidence, riskScore, importantFeatures, featureImportance, true);
            }
        } catch (Exception e) {
            log.warn("ML service unavailable, using fallback heuristic: {}", e.getMessage());
        }

        // Fallback: rule-based heuristic when ML service is down
        return fallbackPrediction(features);
    }

    private MlPredictionResult fallbackPrediction(MlFeatures f) {
        double riskScore = 0;
        java.util.List<String> important = new java.util.ArrayList<>();

        if (f.nonceReuse() > 0) { riskScore += 40; important.add("nonceReuse"); }
        if (f.transactionIdReuse() > 0) { riskScore += 35; important.add("transactionIdReuse"); }
        if (f.requestFrequency() > 10) { riskScore += 15; important.add("requestFrequency"); }
        if (f.timestampAge() > 300) { riskScore += 10; important.add("timestampAge"); }

        riskScore = Math.min(riskScore, 100);
        double confidence = riskScore / 100.0;
        String prediction = riskScore > 80 ? "REPLAY_ATTACK" : riskScore > 40 ? "SUSPICIOUS" : "NORMAL";

        return new MlPredictionResult(prediction, confidence, riskScore, important, Map.of(), false);
    }

    private double toDouble(Object val) {
        if (val instanceof Number n) return n.doubleValue();
        return 0.0;
    }
}
