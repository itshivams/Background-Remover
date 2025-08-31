'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import './globals.css'


type Mode = 'transparent' | 'color' | 'image'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function prettyBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B','KB','MB','GB','TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function Home() {
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [bgFile, setBgFile] = useState<File | null>(null)
  const [mainPreview, setMainPreview] = useState<string | null>(null)
  const [bgPreview, setBgPreview] = useState<string | null>(null)
  const [bgMode, setBgMode] = useState<Mode>('transparent')
  const [color, setColor] = useState<string>('#ffffff')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'background'>('upload')

  const onDropMain = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]; if (!file) return
    setMainFile(file); setResultUrl(null)
    const url = URL.createObjectURL(file); setMainPreview(url)
    setActiveTab('background')
  }, [])

  const onDropBg = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]; if (!file) return
    setBgFile(file)
    const url = URL.createObjectURL(file); setBgPreview(url)
  }, [])

  const {getRootProps: getMainRootProps, getInputProps: getMainInputProps, isDragActive: isMainActive} = useDropzone({
    onDrop: onDropMain, multiple: false, accept: {'image/*': []}
  })
  const {getRootProps: getBgRootProps, getInputProps: getBgInputProps, isDragActive: isBgActive} = useDropzone({
    onDrop: onDropBg, multiple: false, accept: {'image/*': []}
  })

  async function handleProcess() {
    setError(null); setResultUrl(null)
    if (!mainFile) { setError('Please upload a main image first.'); return }
    try {
      setProcessing(true)
      const fd = new FormData()
      fd.append('image', mainFile)
      fd.append('background_mode', bgMode)
      if (bgMode === 'color') fd.append('color', color)
      if (bgMode === 'image') {
        if (!bgFile) { setProcessing(false); setError('Upload a background image or choose a different mode.'); return }
        fd.append('background_image', bgFile)
      }
      const res = await fetch(`${API_URL}/process`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const url = URL.createObjectURL(blob); setResultUrl(url)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally { setProcessing(false) }
  }

  function handleDownload() {
    if (!resultUrl) return
    const a = document.createElement('a'); a.href = resultUrl; a.download = 'processed.png'; a.click()
  }

  function handleReset() {
    setMainFile(null);
    setBgFile(null);
    setMainPreview(null);
    setBgPreview(null);
    setResultUrl(null);
    setActiveTab('upload');
    setError(null);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Shivamtrix Background Remover
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Remove image backgrounds instantly with AI-powered precision. 
            Replace with transparency, solid colors, or custom backgrounds.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Process Steps */}
          <div className="w-full lg:w-1/2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              {/* Process Steps Indicator */}
              <div className="flex justify-between items-center mb-8 relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-700 -translate-y-1/2 -z-10"></div>
                <div className={`flex flex-col items-center relative ${activeTab === 'upload' ? 'text-blue-400' : 'text-gray-500'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'upload' ? 'bg-blue-500' : 'bg-gray-700'}`}>
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <span className="text-xs mt-2">Upload</span>
                </div>
                <div className={`flex flex-col items-center relative ${activeTab === 'background' ? 'text-blue-400' : 'text-gray-500'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'background' ? 'bg-blue-500' : mainFile ? 'bg-gray-600' : 'bg-gray-700'}`}>
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <span className="text-xs mt-2">Background</span>
                </div>
                <div className={`flex flex-col items-center relative ${resultUrl ? 'text-blue-400' : 'text-gray-500'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${resultUrl ? 'bg-blue-500' : processing ? 'bg-blue-500/50 animate-pulse' : 'bg-gray-700'}`}>
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <span className="text-xs mt-2">Result</span>
                </div>
              </div>

              {/* Upload Section */}
              {activeTab === 'upload' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Upload Your Image</h2>
                  <div 
                    {...getMainRootProps()} 
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      isMainActive 
                        ? 'border-blue-500 bg-blue-500/20 scale-[1.02]' 
                        : 'border-gray-600 hover:border-blue-400/70 hover:bg-gray-700/50'
                    }`}
                  >
                    <input {...getMainInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Drag & drop your image here</p>
                        <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
                        <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, WebP (max 10MB)</p>
                      </div>
                    </div>
                  </div>
                  
                  {mainPreview && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-300">Preview</h3>
                        <button 
                          onClick={() => { setMainFile(null); setMainPreview(null); }} 
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="relative rounded-xl overflow-hidden border border-gray-700/50 bg-gray-900">
                        <img src={mainPreview} alt="Main preview" className="w-full object-contain max-h-64" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-2 px-3 text-xs flex justify-between">
                          <span>{mainFile?.name}</span>
                          <span>{mainFile && prettyBytes(mainFile.size)}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('background')}
                        className="mt-4 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all font-medium flex items-center justify-center"
                      >
                        Continue to Background Options
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Background Options */}
              {activeTab === 'background' && mainPreview && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Background Options</h2>
                    <button 
                      onClick={() => setActiveTab('upload')}
                      className="text-sm text-gray-400 hover:text-gray-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Change image
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center ${
                        bgMode === 'transparent' 
                          ? 'border-blue-500 bg-blue-500/20' 
                          : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                      }`}
                      onClick={() => setBgMode('transparent')}
                    >
                      <div className="w-12 h-12 mb-2 bg-checker-pattern bg-8x8 bg-gray-800 border border-gray-600 rounded-md flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-900/80 rounded-sm"></div>
                      </div>
                      <span className="text-sm">Transparent</span>
                    </div>

                    <div 
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center ${
                        bgMode === 'color' 
                          ? 'border-blue-500 bg-blue-500/20' 
                          : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                      }`}
                      onClick={() => setBgMode('color')}
                    >
                      <div 
                        className="w-12 h-12 mb-2 rounded-md border border-gray-600" 
                        style={{backgroundColor: color}}
                      ></div>
                      <span className="text-sm">Color</span>
                    </div>

                    <div 
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center ${
                        bgMode === 'image' 
                          ? 'border-blue-500 bg-blue-500/20' 
                          : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                      }`}
                      onClick={() => setBgMode('image')}
                    >
                      <div className="w-12 h-12 mb-2 bg-gray-800 border border-gray-600 rounded-md flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm">Image</span>
                    </div>
                  </div>

                  {/* Color Picker */}
                  {bgMode === 'color' && (
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                      <label className="text-sm font-medium mb-2 block">Select Background Color</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={color} 
                          onChange={(e) => setColor(e.target.value)} 
                          className="w-12 h-12 rounded-lg cursor-pointer" 
                          aria-label="Background color" 
                        />
                        <input 
                          type="text" 
                          value={color} 
                          onChange={(e) => setColor(e.target.value)} 
                          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm w-32" 
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>
                  )}

                  {/* Background Image Upload */}
                  {bgMode === 'image' && (
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                      <label className="text-sm font-medium mb-2 block">Upload Background Image</label>
                      <div 
                        {...getBgRootProps()} 
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                          isBgActive 
                            ? 'border-blue-500 bg-blue-500/20' 
                            : 'border-gray-600 hover:border-blue-400/70 hover:bg-gray-700/50'
                        }`}
                      >
                        <input {...getBgInputProps()} />
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-300">Drag & drop background image</p>
                          <p className="text-xs text-gray-500">or click to select</p>
                        </div>
                      </div>
                      
                      {bgPreview && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-300">Background Preview</span>
                            <button 
                              onClick={() => { setBgFile(null); setBgPreview(null); }} 
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                            <img src={bgPreview} alt="BG preview" className="w-full object-contain max-h-40" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-1 px-2 text-xs">
                              {bgFile?.name} • {bgFile && prettyBytes(bgFile.size)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    onClick={handleProcess} 
                    disabled={processing || (bgMode === 'image' && !bgFile)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                        </svg>
                        Remove Background & Process
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-900/30 border border-red-800/50 text-red-200 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Result Preview */}
          <div className="w-full lg:w-1/2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl h-full">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              
              {!mainPreview ? (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500 border-2 border-dashed border-gray-700 rounded-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Upload an image to see the preview</p>
                </div>
              ) : !resultUrl ? (
                <div className="relative h-96 bg-checker-pattern bg-8x8 rounded-2xl border border-gray-700 overflow-hidden">
                  <img src={mainPreview} alt="Original" className="w-full h-full object-contain" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-2 px-4 text-sm">
                    Original Image • {mainFile && prettyBytes(mainFile.size)}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative h-96 bg-checker-pattern bg-8x8 rounded-2xl border border-gray-700 overflow-hidden">
                    <img src={resultUrl} alt="Result" className="w-full h-full object-contain" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-2 px-4 text-sm flex justify-between items-center">
                      <span>Processed Image</span>
                      <span>Background: {bgMode}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleDownload}
                      className="py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 transition-all font-medium flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download PNG
                    </button>
                    
                    <button 
                      onClick={handleReset}
                      className="py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all font-medium flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Process New Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

       
      </div>

      <style jsx global>{`
        .bg-checker-pattern {
          background-image: 
            linear-gradient(45deg, #222 25%, transparent 25%),
            linear-gradient(-45deg, #222 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #222 75%),
            linear-gradient(-45deg, transparent 75%, #222 75%);
        }
        .bg-8x8 {
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        }
      `}</style>
    </main>
  )
}