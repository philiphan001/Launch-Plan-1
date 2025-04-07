"""
Test the find_career_by_title helper function in financial_updated.py
"""
import sys
import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

# Add server/python to the path so we can import the modules
server_python_path = os.path.join(os.getcwd(), 'server', 'python')
print(f"Adding path to sys.path: {server_python_path}")
sys.path.append(server_python_path)
print(f"Current sys.path: {sys.path}")

try:
    from financial_updated import FinancialCalculator
    print("Successfully imported financial_updated module")
except ImportError as e:
    print(f"Failed to import financial_updated module: {str(e)}")
    sys.exit(1)

def test_career_lookup():
    """Test the find_career_by_title method."""
    print("Testing career lookup...")
    
    # Create test careers data
    test_careers = [
        {"title": "Software Engineer", "salaryMedian": 120000},
        {"title": "Data Scientist", "salaryMedian": 130000},
        {"title": "Product Manager", "name": "Product Management", "salaryMedian": 140000}
    ]
    
    # Create a calculator instance with test data
    calculator = FinancialCalculator(25, 10)
    
    # Add careers data in different ways to test all lookup methods
    calculator.careers_map = {
        "doctor": {"title": "Doctor", "salaryMedian": 200000},
        "lawyer": {"title": "Lawyer", "salaryMedian": 180000}
    }
    
    calculator.careersData = test_careers
    
    calculator.input_data = {
        "careersData": [
            {"title": "Teacher", "salaryMedian": 60000},
            {"title": "Nurse", "salaryMedian": 75000}
        ]
    }
    
    # Test lookup from careers_map
    doctor_career = calculator.find_career_by_title("Doctor")
    
    # Test lookup from careersData
    software_engineer_career = calculator.find_career_by_title("Software Engineer")
    
    # Test lookup with different casing
    data_scientist_career = calculator.find_career_by_title("data scientist")
    
    # Test lookup with name field instead of title
    product_manager_career = calculator.find_career_by_title("Product Management")
    
    # Test lookup from input_data.careersData
    teacher_career = calculator.find_career_by_title("Teacher")
    
    # Test lookup for non-existent career
    nonexistent_career = calculator.find_career_by_title("Astronaut")
    
    # Print results
    print(f"\nLookup results:")
    print(f"Doctor: {doctor_career is not None}")
    print(f"Software Engineer: {software_engineer_career is not None}")
    print(f"Data Scientist (lowercase search): {data_scientist_career is not None}")
    print(f"Product Manager (via name field): {product_manager_career is not None}")
    print(f"Teacher (from input_data): {teacher_career is not None}")
    print(f"Nonexistent career: {nonexistent_career is not None}")
    
    # Check if all expected lookups succeeded
    expected_success = [
        doctor_career is not None,
        software_engineer_career is not None,
        data_scientist_career is not None,
        product_manager_career is not None,
        teacher_career is not None,
        nonexistent_career is None  # This should be None
    ]
    
    test_passed = all(expected_success)
    print(f"\nTest {'PASSED' if test_passed else 'FAILED'}")
    
    if not test_passed:
        print("Failed lookups:")
        if doctor_career is None:
            print("- Doctor (from careers_map)")
        if software_engineer_career is None:
            print("- Software Engineer (from careersData)")
        if data_scientist_career is None:
            print("- Data Scientist (lowercase search)")
        if product_manager_career is None:
            print("- Product Manager (via name field)")
        if teacher_career is None:
            print("- Teacher (from input_data)")
        if nonexistent_career is not None:
            print("- Nonexistent career returned data when it should be None")
    
    # Return test results in JSON format
    return {
        "test_passed": test_passed,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    result = test_career_lookup()
    print(f"\nResult JSON: {json.dumps(result, indent=2)}")