from pydantic import BaseModel
from typing import Dict, List, Optional, Any

class FeaturesInput(BaseModel):
    requestFrequency: float = 0.0
    transactionIdReuse: int = 0
    nonceReuse: int = 0
    timestampAge: float = 0.0
    requestInterval: float = 60.0
    ipChanged: int = 0
    sessionChanged: int = 0
    behaviorDeviation: float = 0.0
    previousRequestCount: int = 0
    duplicateRequestCount: int = 0
    sessionSequenceDeviation: float = 0.0
    transactionFrequency: float = 0.0
    sessionDuration: float = 60.0
    loginTimeDeviation: float = 0.0
    deviceDeviation: int = 0

class PredictRequest(BaseModel):
    features: FeaturesInput

class PredictResponse(BaseModel):
    prediction: str                        # NORMAL | SUSPICIOUS | REPLAY_ATTACK
    confidence: float                      # 0.0 – 1.0
    riskScore: float                       # 0.0 – 100.0
    importantFeatures: List[str]
    featureImportance: Dict[str, float]
    classProbabilities: Dict[str, float]
    isolationScore: Optional[float] = None
    fromMlService: bool = True

class HealthResponse(BaseModel):
    status: str
    modelLoaded: bool
    version: str
    classes: List[str]
    featuresExpected: List[str]
