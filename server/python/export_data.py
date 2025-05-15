import os
import csv
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """Create a database connection."""
    return psycopg2.connect(os.getenv('DATABASE_URL'))

def export_colleges():
    """Export college data to CSV."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Query colleges table
    cur.execute("""
        SELECT 
            id,
            name,
            location,
            state,
            type,
            tuition,
            room_and_board as "roomAndBoard",
            acceptance_rate as "acceptanceRate",
            rating,
            size,
            rank,
            fees_by_income as "feesByIncome"
        FROM colleges
    """)
    
    colleges = cur.fetchall()
    
    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)
    
    # Write to CSV
    with open('data/college_data.csv', 'w', newline='') as f:
        if colleges:
            writer = csv.DictWriter(f, fieldnames=colleges[0].keys())
            writer.writeheader()
            writer.writerows(colleges)
    
    print(f"Exported {len(colleges)} colleges to college_data.csv")
    
    cur.close()
    conn.close()

def export_careers():
    """Export career data to CSV."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Query careers table
    cur.execute("""
        SELECT 
            id,
            title,
            description,
            salary_median as salary,
            growth_rate as "growthRate",
            education,
            category
        FROM careers
    """)
    
    careers = cur.fetchall()
    
    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)
    
    # Write to CSV
    with open('data/occupation_data.csv', 'w', newline='') as f:
        if careers:
            writer = csv.DictWriter(f, fieldnames=careers[0].keys())
            writer.writeheader()
            writer.writerows(careers)
    
    print(f"Exported {len(careers)} careers to occupation_data.csv")
    
    cur.close()
    conn.close()

if __name__ == '__main__':
    print("Exporting data from database to CSV files...")
    export_colleges()
    export_careers()
    print("Done!") 