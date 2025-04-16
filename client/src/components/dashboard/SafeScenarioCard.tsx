import { ScenarioData } from "./ScenarioCard";
import ScenarioCard from "./ScenarioCard";
import { useState, useEffect } from "react";

interface SafeScenarioCardProps {
  scenario: ScenarioData | null | undefined;
  index: number;
  onViewDetails: (scenario: ScenarioData) => void;
  onEdit: (scenario: ScenarioData) => void;
  ageSliderActive?: boolean;
  ageSliderValue?: number;
}

/**
 * A wrapper component for ScenarioCard that ensures data is valid and clean
 * before rendering the actual ScenarioCard component
 */
const SafeScenarioCard = (props: SafeScenarioCardProps) => {
  const { scenario, index, onViewDetails, onEdit, ageSliderActive, ageSliderValue } = props;
  const [validatedScenario, setValidatedScenario] = useState<ScenarioData | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);

  // Validate and prepare the data
  useEffect(() => {
    // Don't proceed if no scenario data is available
    if (!scenario) {
      console.warn("No scenario data provided at index", index);
      setIsValid(false);
      return;
    }

    try {
      // Create a deep copy with guaranteed valid fields
      const cleanScenario: ScenarioData = {
        id: scenario.id || 0,
        title: scenario.title || `Scenario ${index + 1}`,
        description: scenario.description || "No description available",
        tags: {
          education: scenario.tags?.education || "",
          career: scenario.tags?.career || "",
          location: scenario.tags?.location || "",
        },
        projectionData: {
          ages: Array.isArray(scenario.projectionData?.ages) ? 
                [...scenario.projectionData.ages] : 
                [0, 1, 2, 3, 4, 5], // Default ages if none provided
                
          netWorth: Array.isArray(scenario.projectionData?.netWorth) ? 
                    [...scenario.projectionData.netWorth] : 
                    [0, 0, 0, 0, 0, 0], // Default netWorth if none provided
                    
          income: Array.isArray(scenario.projectionData?.income) ? 
                  [...scenario.projectionData.income] : 
                  [0, 0, 0, 0, 0, 0], // Default income if none provided
                  
          expenses: Array.isArray(scenario.projectionData?.expenses) ? 
                    [...scenario.projectionData.expenses] : 
                    [0, 0, 0, 0, 0, 0], // Default expenses if none provided
        }
      };

      // Ensure arrays are the same length
      const maxLength = Math.max(
        cleanScenario.projectionData.ages.length,
        cleanScenario.projectionData.netWorth.length,
        cleanScenario.projectionData.income.length,
        cleanScenario.projectionData.expenses.length
      );

      // Pad arrays to ensure consistent length
      const padArray = (arr: number[], length: number): number[] => {
        if (arr.length >= length) return arr;
        return [...arr, ...Array(length - arr.length).fill(0)];
      };

      cleanScenario.projectionData.ages = padArray(cleanScenario.projectionData.ages, maxLength);
      cleanScenario.projectionData.netWorth = padArray(cleanScenario.projectionData.netWorth, maxLength);
      cleanScenario.projectionData.income = padArray(cleanScenario.projectionData.income, maxLength);
      cleanScenario.projectionData.expenses = padArray(cleanScenario.projectionData.expenses, maxLength);

      // Set the cleaned scenario and mark as valid
      setValidatedScenario(cleanScenario);
      setIsValid(true);
      
    } catch (error) {
      console.error("Error validating scenario data:", error);
      setIsValid(false);
    }
  }, [scenario, index]);

  // Render error fallback if data is invalid
  if (!isValid || !validatedScenario) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-full flex flex-col justify-center items-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800">Data Error</h3>
          <p className="text-sm text-red-600 mt-2">
            The scenario data at position {index + 1} could not be loaded.
          </p>
          <p className="text-xs text-red-500 mt-4">
            This may be due to corrupted or missing data.
          </p>
        </div>
      </div>
    );
  }

  // Render the actual ScenarioCard with validated data
  return (
    <ScenarioCard
      scenario={validatedScenario}
      index={index}
      onViewDetails={onViewDetails}
      onEdit={onEdit}
      ageSliderActive={ageSliderActive}
      ageSliderValue={ageSliderValue}
    />
  );
};

export default SafeScenarioCard;