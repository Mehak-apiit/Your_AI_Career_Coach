import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { aiAPI } from '../../lib/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Sidebar from '../../components/Sidebar';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or DOCX file only.');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      setFile(selectedFile);
      setError('');
      setAnalysis(null);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError('');
    console.log('📤 Uploading file:', file.name, file.type, file.size);
    try {
      const result = await aiAPI.analyzeResume(file);
      console.log('✅ Analysis result:', result.data);
      setAnalysis(result.data);
    } catch (err) {
      console.error('❌ Analysis error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Analysis failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
              Resume Analyzer
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Upload your resume (PDF or DOCX) to get comprehensive AI-powered analysis and personalized improvement suggestions.
            </p>
          </div>

          {/* Upload Section */}
          <Card className="max-w-2xl mx-auto mb-12 p-8 shadow-xl border-0">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Upload className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
              <p className="text-gray-600">Supports PDF and DOCX files (max 5MB)</p>
            </div>

            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors hover:bg-emerald-50 cursor-pointer group"
                onClick={() => document.getElementById('file-upload').click()}
              >
                {file ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                    <div>
                      <p className="font-semibold text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-emerald-500 transition-colors" />
                    <p className="text-lg font-medium text-gray-700 group-hover:text-emerald-700">
                      Click to select or drag and drop your resume
                    </p>
                    <p className="text-sm text-gray-500">PDF, DOCX - Max 5MB</p>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <Button 
                onClick={handleAnalyze}
                disabled={!file || loading}
                size="lg"
                className="w-full justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Results Section */}
          {analysis && (
            <Card className="max-w-4xl mx-auto p-8 shadow-2xl border-0">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Analysis Complete!</h2>
                <p className="text-xl text-gray-600">Your resume has been successfully analyzed</p>
              </div>

              {/* Results */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Strengths</h3>
                  <ul className="space-y-2 mb-6">
                    {analysis.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start text-green-700">
                        <CheckCircle className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    )) || <p className="text-gray-500 italic">No strengths identified</p>}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Improvement Areas</h3>
                  <ul className="space-y-2">
                    {analysis.improvements?.map((improvement, index) => (
                      <li key={index} className="flex items-start text-orange-700">
                        <AlertCircle className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    )) || <p className="text-gray-500 italic">No improvements suggested</p>}
                  </ul>
                </div>
              </div>

              {analysis.overallScore && (
                <div className="mt-12 p-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-emerald-700 mb-2">
                      {analysis.overallScore}%
                    </div>
                    <p className="text-xl text-gray-600">Overall Resume Score</p>
                  </div>
                  <Button onClick={() => setAnalysis(null)} variant="secondary" className="w-full max-w-md mx-auto block">
                    Analyze Another Resume
                  </Button>
                </div>
              )}
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;

