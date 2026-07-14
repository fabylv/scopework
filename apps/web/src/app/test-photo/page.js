'use client';

import { useState, useRef } from 'react';

const SEVERITY_COLORS = {
  minor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  moderate: 'bg-orange-100 text-orange-800 border-orange-300',
  major: 'bg-red-100 text-red-800 border-red-300',
};

const SEVERITY_ICONS = {
  minor: '🟡',
  moderate: '🟠',
  major: '🔴',
};

export default function TestPhotoPage() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [model, setModel] = useState('openai');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const form = new FormData();
      form.append('photo', file);
      form.append('model', model);

      const res = await fetch('/api/analyze-photo', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏗️ ScopeWork</h1>
          <p className="text-gray-500 mt-1">AI Photo Analysis — Test Lab</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload a Property Photo</h2>

          {/* Photo Preview */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-colors mb-4"
            style={{ minHeight: '200px' }}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full object-cover max-h-80" />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <span className="text-4xl mb-2">📷</span>
                <span className="text-sm">Tap to choose a photo</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Model Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
            <div className="flex gap-2">
              {['openai', 'anthropic', 'google'].map((m) => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    model === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {m === 'openai' ? 'GPT-4o' : m === 'anthropic' ? 'Claude' : 'Gemini'}
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '🔍 Analyzing...' : '🔍 Analyze Photo'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Analysis Results</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                via {result.model === 'openai' ? 'GPT-4o' : result.model === 'anthropic' ? 'Claude' : 'Gemini'}
              </span>
            </div>

            {/* Photo Quality */}
            {result.photoQuality === 'needs_improvement' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="font-medium text-yellow-800">📷 Photo needs improvement</p>
                {result.photoFeedback && (
                  <p className="text-yellow-700 text-sm mt-1">{result.photoFeedback}</p>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="font-medium text-green-800">✅ Photo quality is good</p>
              </div>
            )}

            {/* Repairs */}
            {result.repairs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No repairs detected in this photo.</p>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  {result.repairs.length} repair{result.repairs.length !== 1 ? 's' : ''} detected
                </p>
                <div className="space-y-3">
                  {result.repairs.map((repair, i) => (
                    <div
                      key={i}
                      className={`border rounded-xl p-4 ${SEVERITY_COLORS[repair.severity]}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">
                            {SEVERITY_ICONS[repair.severity]} {repair.type}
                          </p>
                          <p className="text-sm opacity-80 mt-0.5">📍 {repair.location}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-medium capitalize">{repair.severity}</span>
                          <p className="text-xs opacity-70 mt-0.5">
                            {Math.round(repair.confidence * 100)}% confidence
                          </p>
                        </div>
                      </div>

                      {repair.needsCloserPhoto && repair.guidance && (
                        <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                          <p className="text-xs font-medium">📸 Better photo needed:</p>
                          <p className="text-xs mt-0.5 opacity-80">{repair.guidance}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
