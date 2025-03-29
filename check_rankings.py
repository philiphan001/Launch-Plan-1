import csv

with open('attached_assets/Updated_Most-Recent-Cohorts-Institution.csv') as f:
    reader = csv.DictReader(f)
    top_150_count = 0
    liberal_arts_count = 0
    
    # For debugging
    top_150_examples = []
    liberal_arts_examples = []
    
    for row in reader:
        top_150 = row.get('US News Top 150')
        liberal_arts = row.get('best liberal arts colleges')
        
        if top_150 and top_150.strip():
            top_150_count += 1
            if len(top_150_examples) < 5:
                top_150_examples.append((row.get('name'), top_150))
                
        if liberal_arts and liberal_arts.strip():
            liberal_arts_count += 1
            if len(liberal_arts_examples) < 5:
                liberal_arts_examples.append((row.get('name'), liberal_arts))
    
    print(f'Colleges with US News Top 150 ranking: {top_150_count}')
    print(f'Colleges with Best Liberal Arts ranking: {liberal_arts_count}')
    
    print("\nExample US News Top 150 colleges:")
    for name, rank in top_150_examples:
        print(f"  - {name}: {rank}")
        
    print("\nExample Best Liberal Arts colleges:")
    for name, rank in liberal_arts_examples:
        print(f"  - {name}: {rank}")