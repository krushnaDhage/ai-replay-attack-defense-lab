package com.replaylab.backend.response;

import com.replaylab.backend.risk.RiskSeverity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Deterministic response policy engine.
 * All actions are predefined — no LLM or dynamic command execution.
 */
@Component
@Slf4j
public class ResponsePolicyEngine {

    public ResponseResult determineResponse(RiskSeverity severity, String prediction) {
        List<String> actions = new ArrayList<>();
        boolean blocked = false;
        boolean incidentRequired = false;
        String transactionStatus = "SUCCESS";

        switch (severity) {
            case NORMAL -> {
                actions.add("ALLOW_REQUEST");
                blocked = false;
                incidentRequired = false;
                transactionStatus = "SUCCESS";
                log.info("RESPONSE: NORMAL — request allowed");
            }
            case SUSPICIOUS -> {
                actions.add("LOG_EVENT");
                actions.add("FLAG_FOR_REVIEW");
                blocked = false;
                incidentRequired = false;
                transactionStatus = "SUCCESS_FLAGGED";
                log.warn("RESPONSE: SUSPICIOUS — request allowed with flag");
            }
            case HIGH -> {
                actions.add("REJECT_REQUEST");
                actions.add("ALERT_ADMINISTRATOR");
                actions.add("LOG_EVIDENCE");
                blocked = true;
                incidentRequired = true;
                transactionStatus = "BLOCKED";
                log.warn("RESPONSE: HIGH — request rejected");
            }
            case CRITICAL -> {
                actions.add("REJECT_REQUEST");
                actions.add("INVALIDATE_NONCE");
                actions.add("RESTRICT_SESSION");
                actions.add("CREATE_SECURITY_INCIDENT");
                actions.add("ALERT_ADMINISTRATOR");
                actions.add("STORE_FORENSIC_EVIDENCE");
                blocked = true;
                incidentRequired = true;
                transactionStatus = "BLOCKED";
                log.error("RESPONSE: CRITICAL — request blocked, incident created, session restricted");
            }
        }

        return new ResponseResult(
            severity,
            prediction,
            blocked,
            incidentRequired,
            actions,
            transactionStatus
        );
    }
}
