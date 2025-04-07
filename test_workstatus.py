#!/usr/bin/env python3
"""
Test script for workStatus JSON parsing.
This will investigate how "no" workStatus values are parsed from JSON.
"""

import sys
import json
import os

def test_workstatus_parsing():
    """Test how various workStatus values are parsed from JSON."""
    
    # Test various representations of "no" workStatus
    test_cases = [
        {"description": "String 'no'", "json": '{"workStatus": "no"}'},
        {"description": "String 'No' (capitalized)", "json": '{"workStatus": "No"}'},
        {"description": "Null/None value", "json": '{"workStatus": null}'},
        {"description": "Empty string", "json": '{"workStatus": ""}'},
        {"description": "String 'false'", "json": '{"workStatus": "false"}'},
        {"description": "Boolean false", "json": '{"workStatus": false}'},
        {"description": "Missing workStatus", "json": '{}'}
    ]
    
    print("Testing workStatus parsing from JSON...\n")
    
    for i, test_case in enumerate(test_cases):
        print(f"Test {i+1}: {test_case['description']}")
        print(f"  JSON: {test_case['json']}")
        
        try:
            # Parse the JSON
            parsed = json.loads(test_case['json'])
            
            # Check what type and value we get
            work_status = parsed.get('workStatus', None)
            print(f"  Parsed value: {work_status}")
            print(f"  Type: {type(work_status)}")
            
            # Check whether conditions for "not working" would be triggered
            no_work_values = ['no', 'false', 'null', 'none', '0', 'n', '']
            is_not_working = False
            
            if isinstance(work_status, str):
                work_status_clean = work_status.lower().strip()
                is_not_working = work_status_clean in no_work_values
                print(f"  String workStatus: '{work_status}' cleaned to '{work_status_clean}'")
                print(f"  Is in no_work_values: {work_status_clean in no_work_values}")
            elif work_status is False or work_status is None or work_status == 0:
                is_not_working = True
                print(f"  Non-string workStatus detected: {work_status}")
            
            print(f"  Is not working evaluation: {is_not_working}")
            print()
            
        except Exception as e:
            print(f"  Error: {str(e)}")
            print()

    # Test the case of default setting in the calculator.py
    print("Testing the calculator.py default setting logic:")
    test_cases_defaults = [
        {"description": "workStatus is None", "workStatus": None},
        {"description": "workStatus is missing", "workStatus_present": False},
        {"description": "workStatus is 'no'", "workStatus": "no"},
        {"description": "workStatus is empty string", "workStatus": ""},
    ]
    
    for i, test_case in enumerate(test_cases_defaults):
        print(f"Test {i+1}: {test_case['description']}")
        
        # Recreate the logic from calculator.py
        milestone = {}
        if test_case.get("workStatus_present", True):
            milestone["workStatus"] = test_case.get("workStatus")
        
        print(f"  Initial milestone: {milestone}")
        
        # The condition from calculator.py:
        if 'workStatus' not in milestone or milestone['workStatus'] is None:
            milestone['workStatus'] = 'full-time'
            print(f"  -> Condition triggered, added default workStatus: 'full-time'")
        else:
            print(f"  -> Condition not triggered, workStatus remains: {milestone.get('workStatus')}")
        
        print(f"  Final milestone: {milestone}")
        print()

if __name__ == "__main__":
    test_workstatus_parsing()