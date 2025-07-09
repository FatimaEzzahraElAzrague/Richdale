'use client';

import { useState, useRef } from 'react';
import { Upload, Wand2, RotateCcw, Download, Loader2, Sparkles, Image as ImageIcon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Canvas from '@/components/Canvas';
import { generateInpainting } from '@/lib/stability';

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [maskData, setMaskData] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<any>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        toast.error('Please upload a JPEG or PNG image');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setGeneratedImage(null);
        setMaskData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        toast.error('Please upload a JPEG or PNG image');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setGeneratedImage(null);
        setMaskData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const clearMask = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
    setMaskData(null);
  };

  const handleGenerate = async () => {
    if (!originalImage || !maskData || !prompt.trim()) {
      toast.error('Please upload an image, draw a mask, and enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateInpainting({
        image: originalImage,
        mask: maskData,
        prompt: prompt.trim(),
      });
      
      setGeneratedImage(result);
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.download = 'inpainted-image.png';
      link.href = generatedImage;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
              AI Image Inpainting
            </h1>
            <p className="text-xl text-gray-300 max-w-lg mx-auto leading-relaxed">
              Transform your images with the power of artificial intelligence. Upload, mask, and reimagine.
            </p>
          </div>

          {/* Step 1: Image Upload */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-bold text-sm">
                1
              </div>
              <h2 className="text-2xl font-bold text-white">Upload Your Image</h2>
            </div>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-white/30 rounded-2xl p-12 text-center hover:border-purple-400 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Drop your image here
              </h3>
              <p className="text-gray-300 mb-2">
                or click to browse your files
              </p>
              <p className="text-sm text-gray-400">
                Supports JPEG and PNG • Max 4MP
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Step 2: Mask Drawing */}
          {originalImage && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-white">Draw Your Mask</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearMask}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
              
              <p className="text-gray-300 mb-6">
                Paint over the areas you want to transform with AI
              </p>
              
              <div className="bg-black/20 rounded-2xl p-6 mb-6">
                <Canvas
                  ref={canvasRef}
                  image={originalImage}
                  brushSize={brushSize}
                  onMaskChange={setMaskData}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-medium">
                    Brush Size
                  </Label>
                  <span className="text-purple-300 font-mono text-sm bg-white/10 px-3 py-1 rounded-full">
                    {brushSize}px
                  </span>
                </div>
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Step 3: Prompt Input */}
          {originalImage && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full text-white font-bold text-sm">
                  3
                </div>
                <h2 className="text-2xl font-bold text-white">Describe Your Vision</h2>
              </div>
              
              <div className="space-y-4">
                <Label className="text-gray-300 text-base">
                  What do you want to appear in the masked area?
                </Label>
                <Textarea
                  placeholder="a majestic mountain landscape at sunset, photorealistic, highly detailed..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 resize-none rounded-xl"
                />
                <div className="flex flex-wrap gap-2">
                  {['a beautiful sunset', 'a red sports car', 'flowers in bloom', 'modern architecture'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setPrompt(suggestion)}
                      className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-full transition-all duration-200 border border-white/10 hover:border-white/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Generate Button */}
          {originalImage && (
            <div className="flex justify-center animate-in slide-in-from-bottom-4 duration-1000">
              <Button
                onClick={handleGenerate}
                disabled={!originalImage || !maskData || !prompt.trim() || isGenerating}
                size="lg"
                className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white border-0 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 min-w-[240px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-3" />
                    <span className="animate-pulse">Generating Magic...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-6 w-6 mr-3" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 5: Generated Result */}
          {generatedImage && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-3xl border border-green-500/20 p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">✨ Your Creation</h2>
                </div>
                <Button
                  onClick={downloadImage}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="bg-black/20 rounded-2xl p-6 group">
                <img
                  src={generatedImage}
                  alt="Generated result"
                  className="w-full h-auto rounded-xl shadow-2xl group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-gray-300 text-sm">
                  <strong className="text-white">Prompt used:</strong> {prompt}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}