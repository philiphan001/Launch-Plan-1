import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

const NumberPlayground = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id;

  // State for each field
  const [income, setIncome] = useState("");
  const [savings, setSavings] = useState("");
  const [debt, setDebt] = useState("");
  const [zip, setZip] = useState("");

  // Fetch current financial profile (with auto-create on 404)
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["/api/financial-profiles/user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest(`/api/financial-profiles/user/${userId}`);
      if (response.ok) return response.json();
      if (response.status === 404) {
        // Auto-create a new profile if not found
        const createRes = await apiRequest(`/api/financial-profiles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!createRes.ok) throw new Error("Failed to create financial profile");
        return createRes.json();
      }
      throw new Error("Failed to fetch financial profile");
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (profile) {
      setIncome(profile.householdIncome?.toString() || "");
      setSavings(profile.savingsAmount?.toString() || "");
      setDebt(profile.studentLoanAmount?.toString() || "");
      setZip(profile.zipCode || "");
    }
  }, [profile]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      
      console.log("Starting save mutation...");
      
      // First update the user's zip code if it has changed
      if (zip) {
        console.log("Updating user zip code:", zip);
        const userResponse = await apiRequest(`/api/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zipCode: zip }),
        });
        console.log("User update response:", userResponse.status);
        if (!userResponse.ok) throw new Error("Failed to update user profile");
      }

      // Then update/create the financial profile
      if (profile?.id) {
        console.log("Updating existing financial profile:", profile.id);
        const response = await apiRequest(`/api/financial-profiles/${profile.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            householdIncome: parseInt(income) || 0,
            savingsAmount: parseInt(savings) || 0,
            studentLoanAmount: parseInt(debt) || 0,
          }),
        });
        console.log("Financial profile update response:", response.status);
        if (!response.ok) throw new Error("Failed to update financial profile");
        return response.json();
      } else {
        console.log("Creating new financial profile");
        const response = await apiRequest(`/api/financial-profiles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            householdIncome: parseInt(income) || 0,
            savingsAmount: parseInt(savings) || 0,
            studentLoanAmount: parseInt(debt) || 0,
          }),
        });
        console.log("Financial profile create response:", response.status);
        if (!response.ok) throw new Error("Failed to create financial profile");
        return response.json();
      }
    },
    onSuccess: (data) => {
      console.log("Save mutation succeeded:", data);
      toast({ title: "Profile updated", description: "Your numbers and zip code have been saved." });
      refetch();
    },
    onError: (error) => {
      console.error("Save mutation failed:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-2 text-center">Mess Around With Numbers</h1>
      <p className="text-center text-gray-600 mb-8">Try out different numbers and see how they affect your financial profile.</p>
      {isLoading && (
        <div className="text-center text-gray-500 mb-4">Loading your financial profile...</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 flex flex-col items-center">
          <span className="material-icons text-4xl mb-2 text-blue-500">attach_money</span>
          <h2 className="font-semibold mb-1">What I'm making now</h2>
          <Input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="Annual Income ($)" className="mt-2" />
        </Card>
        <Card className="p-6 flex flex-col items-center">
          <span className="material-icons text-4xl mb-2 text-green-500">savings</span>
          <h2 className="font-semibold mb-1">My Current Savings</h2>
          <Input type="number" value={savings} onChange={e => setSavings(e.target.value)} placeholder="Savings ($)" className="mt-2" />
        </Card>
        <Card className="p-6 flex flex-col items-center">
          <span className="material-icons text-4xl mb-2 text-red-500">account_balance</span>
          <h2 className="font-semibold mb-1">My Loans/Debt</h2>
          <Input type="number" value={debt} onChange={e => setDebt(e.target.value)} placeholder="Loans/Debt ($)" className="mt-2" />
        </Card>
        <Card className="p-6 flex flex-col items-center">
          <span className="material-icons text-4xl mb-2 text-purple-500">location_on</span>
          <h2 className="font-semibold mb-1">Where I live (zip code)</h2>
          <Input type="text" value={zip} onChange={e => setZip(e.target.value)} placeholder="Zip Code" className="mt-2" />
        </Card>
      </div>
      <div className="flex justify-center">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !userId}>
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default NumberPlayground; 