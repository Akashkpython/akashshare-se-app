import React, { useState, useEffect } from 'react';
import { FileText, Image, Video, Music, Archive, Code, File as FileIcon, Play, Pause } from 'lucide-react';

const FilePreview = ({ file, onDownload, onPreview }) => {
  const [previewData, setPreviewData] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  useEffect(() => {
    // Reset preview when file changes
    setPreviewData(null);
    setPreviewType(null);
    setAudioPlaying(false);
    
    // Cleanup audio element if it exists
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    
    return () => {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
    };
  }, [file]);

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6 text-blue-400" />;
    if (fileType.startsWith('video/')) return <Video className="w-6 h-6 text-purple-400" />;
    if (fileType.startsWith('audio/')) return <Music className="w-6 h-6 text-yellow-400" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar') || fileType.includes('7z')) return <Archive className="w-6 h-6 text-gray-400" />;
    if (fileType.includes('text') || fileType.includes('json') || fileType.includes('xml') || fileType.includes('markdown') || fileType.includes('md')) return <FileText className="w-6 h-6 text-green-400" />;
    if (fileType.includes('javascript') || fileType.includes('python') || fileType.includes('java') || fileType.includes('html') || fileType.includes('css') || fileType.includes('cpp') || fileType.includes('c')) return <Code className="w-6 h-6 text-orange-400" />;
    return <FileIcon className="w-6 h-6 text-gray-400" />;
  };

  const getPreviewType = (fileType) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('text/') || fileType.includes('json') || fileType.includes('xml') || fileType.includes('markdown') || fileType.includes('md')) return 'text';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('audio/')) return 'audio';
    if (fileType.includes('pdf')) return 'pdf';
    return 'none';
  };

  const handlePreview = async () => {
    if (!onPreview) return;
    
    const preview = getPreviewType(file.type);
    setPreviewType(preview);
    
    if (preview !== 'none') {
      setLoading(true);
      try {
        await onPreview(file);
      } catch (error) {
        console.error('Preview error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleAudioPlayback = () => {
    if (previewData && previewType === 'audio') {
      if (audioPlaying) {
        audioElement.pause();
        setAudioPlaying(false);
      } else {
        audioElement.play();
        setAudioPlaying(true);
      }
    }
  };

  const handleAudioLoad = (e) => {
    const audio = e.target;
    setAudioElement(audio);
    
    audio.addEventListener('ended', () => {
      setAudioPlaying(false);
    });
    
    audio.addEventListener('play', () => {
      setAudioPlaying(true);
    });
    
    audio.addEventListener('pause', () => {
      setAudioPlaying(false);
    });
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (previewData) {
      switch (previewType) {
        case 'image':
          return (
            <div className="flex justify-center">
              <img 
                src={previewData} 
                alt="Preview" 
                className="max-h-48 max-w-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  setPreviewData(null);
                }}
              />
            </div>
          );
        case 'text':
          return (
            <div className="bg-gray-800 p-3 rounded max-h-32 overflow-y-auto text-sm">
              <pre className="text-gray-200 whitespace-pre-wrap">{previewData}</pre>
            </div>
          );
        case 'video':
          return (
            <div className="flex justify-center">
              <video 
                src={previewData} 
                controls 
                className="max-h-48 max-w-full rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  setPreviewData(null);
                }}
              />
            </div>
          );
        case 'audio':
          return (
            <div className="flex flex-col items-center space-y-2 p-4">
              <button 
                onClick={toggleAudioPlayback}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {audioPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <audio 
                src={previewData} 
                onLoadedMetadata={handleAudioLoad}
                className="w-full"
              />
            </div>
          );
        case 'pdf':
          return (
            <div className="flex flex-col items-center space-y-2 p-4">
              <iframe 
                src={previewData} 
                className="w-full h-48 rounded-lg"
                title="PDF Preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                  setPreviewData(null);
                }}
              />
            </div>
          );
        default:
          return null;
      }
    }

    return null;
  };

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-800">
        <div className="flex items-center space-x-2">
          {getFileIcon(file.type)}
          <div>
            <p className="text-white font-medium truncate max-w-xs">{file.name}</p>
            <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {getPreviewType(file.type) !== 'none' && (
            <button
              onClick={handlePreview}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              Preview
            </button>
          )}
          <button
            onClick={() => onDownload && onDownload(file)}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            Download
          </button>
        </div>
      </div>
      
      {previewData && (
        <div className="p-3 bg-gray-900 border-t border-gray-700">
          {renderPreview()}
        </div>
      )}
    </div>
  );
};

export default FilePreview;