"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, ArrowRight, ArrowLeft, Info } from "lucide-react";

interface StepResumeProps {
  file: File | null;
  onNext: (file: File | null) => void;
  onBack: () => void;
}

export function StepResume({ file: initialFile, onNext, onBack }: StepResumeProps) {
  const [file, setFile] = useState<File | null>(initialFile);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (f: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(f.type)) {
      alert("Please upload a PDF or Word document (.pdf, .docx)");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    setFile(f);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-2 mb-2">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-rose-100 mx-auto">
          <FileText className="h-6 w-6 text-rose-600" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Upload Resume</h3>
        <p className="text-sm text-foreground/60 max-w-md mx-auto leading-relaxed">
          Uploading your resume increases your chances of being matched with future international healthcare opportunities
        </p>
      </div>

      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
            dragActive
              ? "border-primary bg-primary/5 shadow-inner"
              : "border-border hover:border-primary/40"
          }`}
        >
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-sky-100 mx-auto mb-4">
            <Upload className="h-7 w-7 text-sky-600" />
          </div>
          <p className="text-base font-medium text-foreground mb-1">
            Drag and drop your resume here
          </p>
          <p className="text-sm text-foreground/50 mb-4">
            or click to browse your files
          </p>
          <label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center h-10 px-5 py-2 rounded-xl text-sm font-medium border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              Browse Files
            </span>
          </label>
          <p className="text-xs text-foreground/40 mt-4">
            Supported: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>
      ) : (
        <div className="border border-emerald-200/60 bg-emerald-50/40 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{file.name}</p>
              <p className="text-sm text-foreground/50">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-foreground/30 hover:text-destructive transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/70">
          <span className="font-medium text-foreground/80">Optional but recommended.</span>{" "}
          Your resume helps healthcare organizations better understand your qualifications.
          You can always update this later from your profile.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button type="button" onClick={() => onNext(file)} className="rounded-xl">
          {file ? "Next Step" : "Skip & Continue"}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Trust Footer */}
      <p className="text-xs text-center text-foreground/40 leading-relaxed pt-2">
        Your resume will be securely stored and only shared with verified employers with your permission.
      </p>
    </div>
  );
}
