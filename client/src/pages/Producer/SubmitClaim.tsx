import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/Layout";
import { useWeb3 } from "@/hooks/useWeb3";
import { useCarbonContract } from "@/hooks/useCarbonContract";
import { useToast } from "@/hooks/use-toast";
import { uploadToIPFS } from "@/lib/ipfs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, ArrowLeftIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form validation schema
const formSchema = z.object({
  co2Offset: z.coerce
    .number()
    .positive("CO2 offset must be a positive number")
    .min(0.01, "CO2 offset must be at least 0.01 tons"),
  projectName: z.string().min(3, "Project name must be at least 3 characters"),
  projectDescription: z.string().min(10, "Description must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitClaim() {
  const [, setLocation] = useLocation();
  const { account, isConnected } = useWeb3();
  const { submitClaim } = useCarbonContract();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      co2Offset: 0,
      projectName: "",
      projectDescription: "",
    },
  });

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      setLocation("/");
    }
  }, [isConnected, setLocation]);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        e.target.value = ""; // Clear the file input
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        e.target.value = ""; // Clear the file input
        return;
      }
      setFile(selectedFile);
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    if (!file) {
      toast({
        title: "Missing documentation",
        description: "Please upload a PDF documentation file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload file to IPFS
      const ipfsHash = await uploadToIPFS(file);
      
      // Create metadata object
      const metadata = {
        projectName: data.projectName,
        description: data.projectDescription,
        co2Offset: data.co2Offset,
        documentationHash: ipfsHash,
        timestamp: Math.floor(Date.now() / 1000)
      };
      
      // Upload metadata to IPFS
      const metadataHash = await uploadToIPFS(new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      
      // Ensure IPFS hash is valid
      if (metadataHash.length !== 46) {
        toast({
          title: "Invalid IPFS hash",
          description: "The IPFS hash must be exactly 46 characters.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Submit claim to smart contract
      const co2OffsetInt = Math.floor(Number(data.co2Offset));
      const transaction = await submitClaim(
        co2OffsetInt,
        data.projectName,
        data.projectDescription,
        metadataHash
      );
      
      console.log("Transaction:", transaction);
      
      toast({
        title: "Claim submitted successfully",
        description: "Your claim has been submitted for review",
      });
      
      // Redirect to dashboard
      setLocation("/producer/dashboard");
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) {
    return null;
  }

  return (
    <Layout
      title="Carbon Producer Portal"
      role="producer"
      navItems={[
        { name: "Dashboard", href: "/producer/dashboard" },
        { name: "Submit Claim", href: "/producer/submit-claim", active: true },
        { name: "My Claims", href: "/producer/my-claims" },
      ]}
    >
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Submit Carbon Offset Claim
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link href="/producer/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Form Container */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* CO2 Offset Input */}
              <FormField
                control={form.control}
                name="co2Offset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CO2 Offset (tons)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="100"
                        {...field}
                      />
                    </FormControl>
                    <p className="mt-2 text-sm text-gray-500">
                      Enter the amount of CO2 offset in metric tons.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Name Input */}
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Reforestation Initiative"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Description Input */}
              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Describe your carbon offset project in detail..."
                        {...field}
                      />
                    </FormControl>
                    <p className="mt-2 text-sm text-gray-500">
                      Provide a detailed description of your carbon offset project and methodologies used.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Documentation Upload */}
              <div>
                <FormLabel htmlFor="file-upload">Documentation (PDF)</FormLabel>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium producer-text hover:producer-text focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-producer"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    {file && (
                      <p className="text-xs text-green-600">
                        Selected file: {file.name}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Upload official documentation verifying your carbon offset project.
                </p>
              </div>

              {/* Blockchain Transaction Information */}
              <Alert className="bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertTitle>Transaction Information</AlertTitle>
                <AlertDescription>
                  Submitting a claim will require a transaction on the Ethereum blockchain. A small gas fee will be charged.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Link href="/producer/dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="ml-3 producer-bg hover:producer-bg-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Claim"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
