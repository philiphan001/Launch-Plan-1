"""
Data loader module for the financial calculator.
Provides functionality to load data from CSV files and other sources.
"""

import csv
import os
import json
from typing import Dict, List, Any, Optional
import re


class DataLoader:
    """
    Loads and manages data from various sources for the financial calculator.
    """
    
    def __init__(self, data_dir: Optional[str] = None):
        """
        Initialize the data loader.
        
        Args:
            data_dir: Directory containing data files (defaults to server/data)
        """
        # Set default data directory if not provided
        if data_dir is None:
            # Default to a 'data' directory in the parent directory of this file
            script_dir = os.path.dirname(os.path.abspath(__file__))
            self.data_dir = os.path.join(script_dir, '..', 'data')
        else:
            self.data_dir = data_dir
        
        # Cache for loaded data
        self._college_data: List[Dict[str, Any]] = []
        self._occupation_data: List[Dict[str, Any]] = []
        self._coli_data: Dict[str, Dict[str, Any]] = {}
        self._irs_data: Dict[str, Dict[str, Any]] = {}
        self._career_path_data: Dict[str, List[Dict[str, Any]]] = {}
        
        # In-memory cache for sample data (used when CSV files are not available)
        self._load_sample_data()
    
    def _load_sample_data(self) -> None:
        """Load sample data into memory for demonstration purposes."""
        # Sample college data
        self._college_data = [
            {
                "id": "1",
                "name": "University of Washington",
                "location": "Seattle, WA",
                "state": "WA",
                "type": "Public Research",
                "tuition": 11465,
                "roomAndBoard": 13485,
                "acceptanceRate": 70,
                "rating": 4.5,
                "size": "large",
                "rank": 58,
                "feesByIncome": {
                    "0-30000": 4000,
                    "30001-48000": 6000,
                    "48001-75000": 9000,
                    "75001-110000": 15000,
                    "110001+": 24950
                }
            },
            {
                "id": "2",
                "name": "Stanford University",
                "location": "Stanford, CA",
                "state": "CA",
                "type": "Private Research",
                "tuition": 56169,
                "roomAndBoard": 17255,
                "acceptanceRate": 5,
                "rating": 4.8,
                "size": "medium",
                "rank": 3,
                "feesByIncome": {
                    "0-30000": 5000,
                    "30001-48000": 7500,
                    "48001-75000": 12000,
                    "75001-110000": 20000,
                    "110001+": 73424
                }
            },
            {
                "id": "3",
                "name": "Harvard University",
                "location": "Cambridge, MA",
                "state": "MA",
                "type": "Private Research",
                "tuition": 55587,
                "roomAndBoard": 18389,
                "acceptanceRate": 4,
                "rating": 4.9,
                "size": "medium",
                "rank": 1,
                "feesByIncome": {
                    "0-30000": 4500,
                    "30001-48000": 7000,
                    "48001-75000": 11500,
                    "75001-110000": 19000,
                    "110001+": 73976
                }
            }
        ]
        
        # Sample occupation data
        self._occupation_data = [
            {
                "id": "1",
                "title": "Software Developer",
                "description": "Design, develop, and test software applications",
                "salary": 107510,
                "growthRate": "fast",
                "education": "Bachelor's",
                "category": "Technology"
            },
            {
                "id": "2",
                "title": "Financial Analyst",
                "description": "Analyze financial data and market trends",
                "salary": 83660,
                "growthRate": "stable",
                "education": "Bachelor's",
                "category": "Finance"
            },
            {
                "id": "3",
                "title": "Registered Nurse",
                "description": "Provide and coordinate patient care",
                "salary": 75330,
                "growthRate": "fast",
                "education": "Bachelor's",
                "category": "Healthcare"
            },
            {
                "id": "4",
                "title": "Marketing Manager",
                "description": "Plan and direct marketing programs",
                "salary": 142170,
                "growthRate": "stable",
                "education": "Bachelor's",
                "category": "Marketing"
            }
        ]
        
        # Sample COLI data (Cost of Living Index)
        self._coli_data = {
            "98101": {
                "zipCode": "98101",
                "city": "Seattle",
                "state": "WA",
                "overall": 176.5,
                "housing": 267.8,
                "groceries": 132.4,
                "transportation": 145.6,
                "utilities": 118.9,
                "healthcare": 124.2
            },
            "94305": {
                "zipCode": "94305",
                "city": "Stanford",
                "state": "CA",
                "overall": 264.3,
                "housing": 454.2,
                "groceries": 138.2,
                "transportation": 156.3,
                "utilities": 127.8,
                "healthcare": 132.5
            },
            "02138": {
                "zipCode": "02138",
                "city": "Cambridge",
                "state": "MA",
                "overall": 182.4,
                "housing": 278.5,
                "groceries": 135.6,
                "transportation": 140.2,
                "utilities": 122.4,
                "healthcare": 128.9
            }
        }
        
        # Sample IRS income and property data
        self._irs_data = {
            "98101": {
                "zipCode": "98101",
                "avgIncome": 110250,
                "medianIncome": 87500,
                "avgHomeValue": 725000,
                "avgInvestments": 215000
            },
            "94305": {
                "zipCode": "94305",
                "avgIncome": 178500,
                "medianIncome": 140000,
                "avgHomeValue": 1850000,
                "avgInvestments": 450000
            },
            "02138": {
                "zipCode": "02138",
                "avgIncome": 125750,
                "medianIncome": 95000,
                "avgHomeValue": 825000,
                "avgInvestments": 275000
            }
        }
        
        # Sample career path data
        self._career_path_data = {
            "Computer Science": [
                {"title": "Software Developer", "id": "1", "years": 0},
                {"title": "Senior Developer", "years": 4, "salary": 130000},
                {"title": "Lead Developer", "years": 8, "salary": 150000},
                {"title": "Software Architect", "years": 12, "salary": 175000}
            ],
            "Finance": [
                {"title": "Financial Analyst", "id": "2", "years": 0},
                {"title": "Senior Financial Analyst", "years": 3, "salary": 105000},
                {"title": "Finance Manager", "years": 6, "salary": 125000},
                {"title": "Finance Director", "years": 10, "salary": 160000}
            ],
            "Nursing": [
                {"title": "Registered Nurse", "id": "3", "years": 0},
                {"title": "Charge Nurse", "years": 3, "salary": 85000},
                {"title": "Nurse Practitioner", "years": 6, "salary": 115000},
                {"title": "Nursing Director", "years": 10, "salary": 130000}
            ],
            "Marketing": [
                {"title": "Marketing Specialist", "id": "4", "years": 0},
                {"title": "Marketing Manager", "years": 4, "salary": 95000},
                {"title": "Senior Marketing Manager", "years": 8, "salary": 120000},
                {"title": "Marketing Director", "years": 12, "salary": 150000}
            ]
        }
    
    def _load_csv_file(self, filename: str) -> List[Dict[str, Any]]:
        """
        Load data from a CSV file.
        
        Args:
            filename: Name of CSV file to load
            
        Returns:
            List of dictionaries containing the CSV data
        """
        file_path = os.path.join(self.data_dir, filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"Warning: File {file_path} not found. Using sample data instead.")
            return []
        
        try:
            with open(file_path, 'r', newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                result = []
                for row in reader:
                    # Convert numeric strings to numbers
                    for key, value in row.items():
                        if isinstance(value, str):
                            # Try to convert to number if appropriate
                            if value.isdigit():
                                row[key] = int(value)
                            elif re.match(r'^-?\d+\.\d+$', value):
                                row[key] = float(value)
                    result.append(row)
                return result
        except Exception as e:
            print(f"Error loading {filename}: {str(e)}")
            return []
    
    def get_college_data(self) -> List[Dict[str, Any]]:
        """
        Get college institutional data.
        
        Returns:
            List of college data
        """
        if not self._college_data:
            # Try to load from CSV file
            data = self._load_csv_file('college_data.csv')
            if data:
                self._college_data = data
        
        return self._college_data
    
    def get_college_by_id(self, college_id: str) -> Optional[Dict[str, Any]]:
        """
        Get college data by ID.
        
        Args:
            college_id: College ID
            
        Returns:
            College data or None if not found
        """
        colleges = self.get_college_data()
        
        # Find college with matching ID
        for college in colleges:
            if str(college.get('id', '')) == str(college_id):
                return college
        
        return None
    
    def get_occupation_data(self) -> List[Dict[str, Any]]:
        """
        Get occupation data.
        
        Returns:
            List of occupation data
        """
        if not self._occupation_data:
            # Try to load from CSV file
            data = self._load_csv_file('occupation_data.csv')
            if data:
                self._occupation_data = data
        
        return self._occupation_data
    
    def get_occupation_by_id(self, occupation_id: str) -> Optional[Dict[str, Any]]:
        """
        Get occupation data by ID.
        
        Args:
            occupation_id: Occupation ID
            
        Returns:
            Occupation data or None if not found
        """
        occupations = self.get_occupation_data()
        
        # Find occupation with matching ID
        for occupation in occupations:
            if str(occupation.get('id', '')) == str(occupation_id):
                return occupation
        
        return None
    
    def get_coli_data(self, zip_code: str) -> Optional[Dict[str, Any]]:
        """
        Get Cost of Living Index data for a specific zip code.
        
        Args:
            zip_code: ZIP code
            
        Returns:
            COLI data or None if not found
        """
        if not self._coli_data:
            # Try to load from CSV file
            data = self._load_csv_file('coli_data.csv')
            if data:
                self._coli_data = {item['zipCode']: item for item in data}
        
        return self._coli_data.get(zip_code)
    
    def get_irs_data(self, zip_code: str) -> Optional[Dict[str, Any]]:
        """
        Get IRS income and property data for a specific zip code.
        
        Args:
            zip_code: ZIP code
            
        Returns:
            IRS data or None if not found
        """
        if not self._irs_data:
            # Try to load from CSV file
            data = self._load_csv_file('irs_data.csv')
            if data:
                self._irs_data = {item['zipCode']: item for item in data}
        
        return self._irs_data.get(zip_code)
    
    def get_career_path_data(self, field_of_study: str) -> List[Dict[str, Any]]:
        """
        Get career path data for a specific field of study.
        
        Args:
            field_of_study: Field of study
            
        Returns:
            List of career path stages or empty list if not found
        """
        if not self._career_path_data:
            # Try to load from CSV file
            data = self._load_csv_file('career_paths.csv')
            if data:
                # Group by field of study
                result = {}
                for item in data:
                    field = item.get('fieldOfStudy', '')
                    if field not in result:
                        result[field] = []
                    result[field].append(item)
                self._career_path_data = result
        
        return self._career_path_data.get(field_of_study, [])
    
    def search_colleges(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Search for colleges by name or other criteria.
        
        Args:
            query: Search query string
            filters: Additional filters
            
        Returns:
            List of matching colleges
        """
        colleges = self.get_college_data()
        
        # Filter by search query
        if query:
            query = query.lower()
            results = [
                college for college in colleges
                if query in college.get('name', '').lower() or
                   query in college.get('location', '').lower()
            ]
        else:
            results = colleges.copy()
        
        # Apply additional filters
        if filters:
            for key, value in filters.items():
                if key == 'maxTuition' and value is not None:
                    results = [c for c in results if c.get('tuition', 0) <= value]
                elif key == 'acceptanceRange' and value is not None:
                    min_rate, max_rate = value
                    results = [
                        c for c in results
                        if c.get('acceptanceRate', 0) >= min_rate and c.get('acceptanceRate', 100) <= max_rate
                    ]
                elif key == 'types' and value:
                    results = [c for c in results if c.get('type', '') in value]
                elif key == 'states' and value:
                    results = [c for c in results if c.get('state', '') in value]
                elif key == 'sizes' and value:
                    results = [c for c in results if c.get('size', '') in value]
        
        return results
    
    def search_occupations(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Search for occupations by title or other criteria.
        
        Args:
            query: Search query string
            filters: Additional filters
            
        Returns:
            List of matching occupations
        """
        occupations = self.get_occupation_data()
        
        # Filter by search query
        if query:
            query = query.lower()
            results = [
                occupation for occupation in occupations
                if query in occupation.get('title', '').lower() or
                   query in occupation.get('description', '').lower()
            ]
        else:
            results = occupations.copy()
        
        # Apply additional filters
        if filters:
            for key, value in filters.items():
                if key == 'minSalary' and value is not None:
                    results = [o for o in results if o.get('salary', 0) >= value]
                elif key == 'categories' and value:
                    results = [o for o in results if o.get('category', '') in value]
                elif key == 'education' and value:
                    results = [o for o in results if o.get('education', '') in value]
                elif key == 'growthRate' and value:
                    results = [o for o in results if o.get('growthRate', '') in value]
        
        return results
