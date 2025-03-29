import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UploadIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

export function CSVUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to array and filter for CSV files
      const selectedFiles = Array.from(e.target.files).filter(file => 
        file.name.endsWith('.csv') || file.type === 'text/csv'
      );
      
      if (selectedFiles.length !== Array.from(e.target.files).length) {
        toast({
          title: "Invalid file type",
          description: "Only CSV files are allowed.",
          variant: "destructive"
        });
      }
      
      setFiles(selectedFiles);
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one CSV file to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('csvFiles', file);
    });

    try {
      const response = await fetch('/api/upload/csv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus('success');
        setStatusMessage(`Successfully uploaded and processed ${data.files.length} files.`);
        toast({
          title: "Upload successful",
          description: "CSV files have been uploaded and processed.",
        });
      } else {
        const error = await response.json();
        setUploadStatus('error');
        setStatusMessage(error.message || 'Failed to upload CSV files.');
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload and process CSV files.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setUploadStatus('error');
      setStatusMessage('An error occurred during upload.');
      toast({
        title: "Upload error",
        description: "An error occurred while uploading CSV files.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload CSV Data</CardTitle>
        <CardDescription>
          Upload college, career, or cost of living data in CSV format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="csvFile">CSV Files</Label>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center cursor-pointer hover:bg-gray-50 transition-colors"
                 onClick={() => document.getElementById('csvFile')?.click()}>
              <UploadIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Click to select or drag CSV files here
              </p>
              <p className="mt-1 text-xs text-gray-400">
                (College data, career data, or cost of living data)
              </p>
              <input
                id="csvFile"
                type="file"
                multiple
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Selected files:</p>
                <ul className="list-disc pl-5 text-sm">
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {uploadStatus !== 'idle' && (
              <div className={`mt-3 p-2 rounded-md ${
                uploadStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <div className="flex items-center">
                  {uploadStatus === 'success' ? 
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" /> : 
                    <XCircleIcon className="h-5 w-5 mr-2 text-red-600" />
                  }
                  <p className="text-sm">{statusMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setFiles([]);
          setUploadStatus('idle');
        }}>Cancel</Button>
        <Button onClick={uploadFiles} disabled={uploading || files.length === 0}>
          {uploading ? "Uploading..." : "Upload and Process"}
        </Button>
      </CardFooter>
    </Card>
  );
}