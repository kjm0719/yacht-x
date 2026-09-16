import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Video, X, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';

export function PostWritePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState<'FEED' | 'REEL'>('FEED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    
    // Validate REEL type (only 1 video allowed)
    if (postType === 'REEL') {
      const videoFile = selectedFiles.find(f => f.type.startsWith('video/'));
      if (!videoFile) {
        setError('릴스는 반드시 1개의 동영상 파일이 필요합니다.');
        return;
      }
      if (selectedFiles.length > 1) {
        setError('릴스는 1개의 동영상만 업로드할 수 있습니다.');
        return;
      }
      setFiles([videoFile]);
      setPreviews([{ url: URL.createObjectURL(videoFile), type: 'video' }]);
      setError('');
      return;
    }

    // Validate FEED type (up to 10 media items)
    if (files.length + selectedFiles.length > 10) {
      setError('피드는 최대 10개의 미디어만 업로드할 수 있습니다.');
      return;
    }

    const newPreviews = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));

    setFiles(prev => [...prev, ...selectedFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setError('');
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('미디어를 선택해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('type', postType);
      files.forEach(file => {
        formData.append('media', file);
      });

      // Extract hashtags from caption (e.g., #nexus #capstone)
      const tags = caption.match(/#[a-zA-Z0-9가-힣]+/g)?.map(t => t.slice(1)) || [];
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }

      await apiClient.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '업로드에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between font-semibold">
          <h1 className="text-lg">새 게시물 만들기</h1>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || files.length === 0}
            className="text-pink-500 hover:text-pink-600 disabled:opacity-50 transition"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '공유하기'}
          </button>
        </div>

        <div className="p-4 space-y-6">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Type Selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setPostType('FEED'); setFiles([]); setPreviews([]); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition ${
                postType === 'FEED' 
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-500' 
                  : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              피드 (Feed)
            </button>
            <button
              type="button"
              onClick={() => { setPostType('REEL'); setFiles([]); setPreviews([]); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition ${
                postType === 'REEL' 
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-500' 
                  : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              릴스 (Reels)
            </button>
          </div>

          {/* Media Upload Area */}
          <div className="space-y-4">
            {previews.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {previews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
                    {preview.type === 'video' ? (
                      <video src={preview.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={preview.url} className="w-full h-full object-cover" alt="preview" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(postType === 'FEED' && previews.length < 10) && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <ImagePlus className="w-8 h-8 mb-2" />
                    <span className="text-xs">추가하기</span>
                  </button>
                )}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
              >
                {postType === 'FEED' ? <ImagePlus className="w-12 h-12 mb-4" /> : <Video className="w-12 h-12 mb-4" />}
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  컴퓨터에서 {postType === 'FEED' ? '사진 또는 동영상' : '동영상'} 선택
                </p>
                <p className="text-sm mt-2">클릭하여 업로드</p>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple={postType === 'FEED'}
              accept={postType === 'FEED' ? "image/*,video/*" : "video/*"}
            />
          </div>

          {/* Caption Input */}
          <div className="flex gap-4 items-start">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="문구 입력... (#해시태그 포함 가능)"
              className="w-full bg-transparent border-0 focus:ring-0 p-0 resize-none h-32 text-sm placeholder-gray-400"
              maxLength={2200}
            />
          </div>
          <div className="text-right text-xs text-gray-400">
            {caption.length} / 2,200
          </div>
        </div>
      </div>
    </div>
  );
}
