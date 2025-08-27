/**
 * Local ML Integration Service
 * Replaces Gemini API with local hospital readmission model
 */

interface PatientData {
  [key: string]: any;
}

interface MLPrediction {
  probabilities?: {
    readmitted?: number;
  };
  risk_assessment?: {
    risk_level?: string;
  };
  predictions?: {
    custom_threshold_0_4?: {
      result?: string;
    };
  };
  error?: string;
}

interface MLResponse {
  success: boolean;
  predictions: MLPrediction[];
  message?: string;
}

interface TransformedPatient {
  id: string;
  name: string;
  riskLevel: string;
  riskFactors: string[];
  confidence: string;
  mlProbability: number;
  prediction: string;
}

interface AnalysisResult {
  totalPatients: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  patients: TransformedPatient[];
  source: string;
  model: string;
  timestamp: string | null;
}

class LocalMLService {
  private baseUrl: string;
  private predictEndpoint: string;

  constructor(baseUrl: string = "http://localhost:5001") {
    this.baseUrl = baseUrl;
    this.predictEndpoint = `${baseUrl}/predict`;
  }

  /**
   * Check if the local ML backend is running
   */
  async isBackendRunning(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Send raw CSV data to local ML model and get predictions
   */
  async predictFromCsvData(patientData: PatientData[]): Promise<AnalysisResult> {
    try {
      console.log('🤖 Sending data to local ML backend:', {
        endpoint: this.predictEndpoint,
        patientCount: patientData.length
      });

      const response = await fetch(this.predictEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patients: patientData }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend returned ${response.status}: ${errorText}`);
      }

      const mlResults: MLResponse = await response.json();
      console.log('✅ ML Backend response:', mlResults);

      return this.transformMLToFrontendFormat(mlResults, patientData);

    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Cannot connect to local ML backend. Please ensure it's running on port 5001.");
      }
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error("ML backend timeout. The model may be processing large data.");
      }
      throw new Error(`ML prediction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Transform ML backend results to match Gemini API format expected by frontend
   */
  private transformMLToFrontendFormat(mlResults: MLResponse, originalData: PatientData[]): AnalysisResult {
    if (!mlResults.success || !mlResults.predictions) {
      throw new Error("Invalid response from ML backend");
    }

    const predictions = mlResults.predictions;
    const totalPatients = predictions.length;

    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;

    const transformedPatients: TransformedPatient[] = [];

    predictions.forEach((mlPred, i) => {
      if (mlPred.error) {
        console.warn(`⚠️ Prediction error for patient ${i}:`, mlPred.error);
        return;
      }

      // Get ML probability and risk assessment
      const readmissionProb = mlPred.probabilities?.readmitted || 0.0;

      // Use actual probability for risk categorization (not backend risk_level)
      let frontendRisk: string;
      if (readmissionProb >= 0.70) {  // 70%+ = High Risk
        frontendRisk = 'High';
        highRisk++;
      } else if (readmissionProb >= 0.40) {  // 40-69% = Medium Risk
        frontendRisk = 'Medium';
        mediumRisk++;
      } else {  // Below 40% = Low Risk
        frontendRisk = 'Low';
        lowRisk++;
      }

      // Create patient entry matching frontend format
      const patientEntry: TransformedPatient = {
        id: `P${String(i + 1).padStart(3, '0')}`,
        name: originalData[i]?.name || `Patient ${i + 1}`,
        riskLevel: frontendRisk,
        riskFactors: this.extractRiskFactors(mlPred, originalData[i] || {}),
        confidence: `${(readmissionProb * 100).toFixed(1)}%`,
        mlProbability: readmissionProb,
        prediction: mlPred.predictions?.custom_threshold_0_4?.result || 'UNKNOWN'
      };

      transformedPatients.push(patientEntry);
    });

    return {
      totalPatients,
      highRisk,
      mediumRisk,
      lowRisk,
      patients: transformedPatients,
      source: 'local_ml',
      model: 'Bagging SVM',
      timestamp: null // Will be added by frontend
    };
  }

  /**
   * Extract human-readable risk factors from ML prediction and original data
   */
  private extractRiskFactors(mlPrediction: MLPrediction, originalPatient: PatientData): string[] {
    const riskFactors: string[] = [];

    // Get probability for context
    const prob = mlPrediction.probabilities?.readmitted || 0.0;

    if (prob > 0.7) {
      riskFactors.push("Very high readmission probability");
    } else if (prob > 0.5) {
      riskFactors.push("Elevated readmission risk");
    } else if (prob > 0.3) {
      riskFactors.push("Moderate risk factors detected");
    } else {
      riskFactors.push("Low risk profile");
    }

    // Add specific factors based on original data (if available)
    if (originalPatient.diabetes_med === 1) {
      riskFactors.push("Diabetes medication");
    }
    if (originalPatient.A1Ctest === 1) {
      riskFactors.push("A1C test administered");
    }
    if (originalPatient.change === 1) {
      riskFactors.push("Medication changes");
    }

    return riskFactors.slice(0, 3); // Limit to 3 factors for UI
  }
}

// Export the service
export const localMLService = new LocalMLService();
export default localMLService;
