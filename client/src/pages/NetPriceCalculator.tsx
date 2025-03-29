import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";

interface College {
  id: string;
  name: string;
  location: string;
  type: string;
  tuition: number;
  roomAndBoard: number;
  feesByIncome: {
    [key: string]: number;
  };
}

const NetPriceCalculator = () => {
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [householdIncome, setHouseholdIncome] = useState("");
  const [householdSize, setHouseholdSize] = useState("4");
  const [householdStructure, setHouseholdStructure] = useState("two_parents");
  const [calculated, setCalculated] = useState(false);
  
  const { data: collegeData, isLoading } = useQuery({
    queryKey: ['/api/colleges'],
    queryFn: async () => {
      // This would be replaced with actual API call
      return [] as College[];
    },
    // Disable actual fetching for now
    enabled: false
  });
  
  const defaultColleges: College[] = [
    {
      id: "1",
      name: "University of Washington",
      location: "Seattle, WA",
      type: "Public Research",
      tuition: 11465,
      roomAndBoard: 13485,
      feesByIncome: {
        "0-30000": 4000,
        "30001-48000": 6000,
        "48001-75000": 9000,
        "75001-110000": 15000,
        "110001+": 24950
      }
    },
    {
      id: "2",
      name: "Stanford University",
      location: "Stanford, CA",
      type: "Private Research",
      tuition: 56169,
      roomAndBoard: 17255,
      feesByIncome: {
        "0-30000": 5000,
        "30001-48000": 7500,
        "48001-75000": 12000,
        "75001-110000": 20000,
        "110001+": 73424
      }
    },
    {
      id: "3",
      name: "Harvard University",
      location: "Cambridge, MA",
      type: "Private Research",
      tuition: 55587,
      roomAndBoard: 18389,
      feesByIncome: {
        "0-30000": 4500,
        "30001-48000": 7000,
        "48001-75000": 11500,
        "75001-110000": 19000,
        "110001+": 73976
      }
    }
  ];
  
  const collegeList = collegeData || defaultColleges;
  
  const selectedCollege = collegeList.find(college => college.id === selectedCollegeId);
  
  const calculateNetPrice = () => {
    if (!selectedCollege || !householdIncome) return null;
    
    // Get the income bracket
    let incomeBracket = "110001+";
    const income = parseInt(householdIncome, 10);
    
    if (income <= 30000) incomeBracket = "0-30000";
    else if (income <= 48000) incomeBracket = "30001-48000";
    else if (income <= 75000) incomeBracket = "48001-75000";
    else if (income <= 110000) incomeBracket = "75001-110000";
    
    return selectedCollege.feesByIncome[incomeBracket];
  };
  
  const netPrice = calculated ? calculateNetPrice() : null;
  
  const handleCalculate = () => {
    setCalculated(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">Net Price Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Your Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="zipCode">Your Zip Code</Label>
                  <Input 
                    id="zipCode" 
                    placeholder="e.g. 98101"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="income">Annual Household Income</Label>
                  <div className="flex items-center mt-1">
                    <span className="mr-2">$</span>
                    <Input 
                      id="income" 
                      placeholder="e.g. 75000"
                      value={householdIncome}
                      onChange={(e) => setHouseholdIncome(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="householdSize">Household Size</Label>
                  <Select 
                    value={householdSize} 
                    onValueChange={setHouseholdSize}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select household size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 person</SelectItem>
                      <SelectItem value="2">2 people</SelectItem>
                      <SelectItem value="3">3 people</SelectItem>
                      <SelectItem value="4">4 people</SelectItem>
                      <SelectItem value="5">5 people</SelectItem>
                      <SelectItem value="6+">6+ people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Household Structure</Label>
                  <RadioGroup 
                    value={householdStructure} 
                    onValueChange={setHouseholdStructure}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="two_parents" id="two_parents" />
                      <Label htmlFor="two_parents">Two Parents</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single_parent" id="single_parent" />
                      <Label htmlFor="single_parent">Single Parent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="independent" id="independent" />
                      <Label htmlFor="independent">Independent Student</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Selected College</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="college">Choose a College</Label>
                  <Select 
                    value={selectedCollegeId} 
                    onValueChange={setSelectedCollegeId}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a college" />
                    </SelectTrigger>
                    <SelectContent>
                      {collegeList.map(college => (
                        <SelectItem key={college.id} value={college.id}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCollege && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {selectedCollege.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {selectedCollege.type}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Published Tuition:</span> ${selectedCollege.tuition.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Room & Board:</span> ${selectedCollege.roomAndBoard.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Total Cost:</span> ${(selectedCollege.tuition + selectedCollege.roomAndBoard).toLocaleString()}
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  disabled={!selectedCollegeId || !zipCode || !householdIncome}
                  onClick={handleCalculate}
                >
                  Calculate Net Price
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Estimated Net Price</h3>
              
              {calculated && netPrice !== null && selectedCollege ? (
                <div>
                  <div className="flex flex-col items-center mb-8">
                    <h4 className="text-xl font-medium text-gray-700 mb-3">{selectedCollege.name}</h4>
                    <div className="bg-primary/10 p-8 rounded-full">
                      <p className="text-3xl font-mono font-bold text-primary">
                        ${netPrice.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Estimated annual cost after financial aid</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-3">Cost Breakdown</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Published Tuition</span>
                          <span className="font-mono">${selectedCollege.tuition.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Room & Board</span>
                          <span className="font-mono">${selectedCollege.roomAndBoard.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-300">
                          <span>Total Cost</span>
                          <span className="font-mono">${(selectedCollege.tuition + selectedCollege.roomAndBoard).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-success">
                          <span>Estimated Financial Aid</span>
                          <span className="font-mono">- ${((selectedCollege.tuition + selectedCollege.roomAndBoard) - netPrice).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-primary font-semibold pt-2 border-t border-gray-300">
                          <span>Your Net Cost</span>
                          <span className="font-mono">${netPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-3">Financing Options</h5>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Federal Student Loans</p>
                          <p className="text-xs text-gray-600">Undergraduate students can borrow up to $12,500 annually in Federal loans.</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Work-Study Opportunities</p>
                          <p className="text-xs text-gray-600">Campus employment can provide $2,000-$5,000 annually to help with expenses.</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Scholarships</p>
                          <p className="text-xs text-gray-600">Many schools offer merit scholarships not included in this estimate.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" className="mr-2">Download Estimate</Button>
                    <Button>Save to My Profile</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <span className="material-icons text-gray-400 text-5xl mb-4">calculate</span>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    {calculated ? "Unable to calculate" : "Enter your information"}
                  </h4>
                  <p className="text-gray-500">
                    {calculated 
                      ? "Please make sure you've selected a college and entered all required information."
                      : "Select a college and fill in your financial information to calculate your estimated net price."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Financial Aid Resources</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="#" className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <h4 className="font-medium text-primary mb-2">FAFSA Application</h4>
                  <p className="text-sm text-gray-600">Complete the Free Application for Federal Student Aid to qualify for grants and loans.</p>
                </a>
                
                <a href="#" className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <h4 className="font-medium text-primary mb-2">Scholarship Search</h4>
                  <p className="text-sm text-gray-600">Find scholarships that match your background, interests, and academic achievements.</p>
                </a>
                
                <a href="#" className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <h4 className="font-medium text-primary mb-2">Financial Aid FAQ</h4>
                  <p className="text-sm text-gray-600">Get answers to common questions about paying for college and financial aid.</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetPriceCalculator;
