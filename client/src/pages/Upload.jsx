import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { UploadCloud, Trash2, ArrowUpRight } from 'lucide-react';
import CategorySelector from '../components/CategorySelector';
import TagInput from '../components/TagInput';

const Upload = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  
  // File upload state variables
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    setError('');
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only image files (.jpeg, .jpg, .png, .webp, .gif) are supported!');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setError('Please add an image and title.');
      return;
    }
    if (categories.length === 0) {
      setError('Please select or create at least one category.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('caption', description.trim());
      formData.append('categories', categories.join(','));
      formData.append('tags', tags.join(','));
      formData.append('image', file);

      const { data } = await API.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate(`/pin/${data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error uploading pin. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-xl md:text-2xl font-extrabold text-white font-display mb-6">Create new post</h1>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 bg-[#18181b]/50 border border-white/5 backdrop-blur-xl rounded-[32px] p-6 md:p-10 shadow-2xl relative">
        
        {/* Left Side: Drag-and-drop Image Upload Zone */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`w-full aspect-[3/4] md:aspect-[4/5] max-h-[480px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group select-none ${
              previewUrl ? 'border-transparent bg-zinc-950/20' : 
              isDragActive ? 'border-violet-600 bg-violet-650/5 scale-[0.99]' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/10'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />

            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="w-full h-full object-contain rounded-2xl"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-red-650 hover:bg-red-700 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center p-6">
                <div className="w-16 h-16 rounded-full bg-[#0f0f11] border border-[#27272a] flex items-center justify-center mb-5 text-zinc-400 group-hover:scale-105 transition-transform shadow-xl">
                  <UploadCloud className="w-7 h-7 text-zinc-400" />
                </div>
                <h3 className="text-zinc-200 text-sm font-bold font-sans mb-1">
                  Drag and drop or click to upload
                </h3>
                <p className="text-zinc-550 text-[10px] font-semibold mb-4 uppercase tracking-wider">
                  JPG, PNG or WEBP (max. 10MB)
                </p>
              </div>
            )}
          </div>
          
          {error && (
            <p className="text-red-400 text-xs font-semibold mt-3 text-center w-full">
              {error}
            </p>
          )}
        </div>

        {/* Right Side: Metadata form fields */}
        <div className="w-full md:w-1/2 flex flex-col justify-between py-1.5">
          <div className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider font-sans">Title</label>
              <input
                type="text"
                placeholder="Give your post a title"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-650 text-xs focus:border-violet-600 focus:outline-none transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
              <span className="text-[10px] text-zinc-600 float-right mt-1 font-sans">
                {title.length}/100 characters
              </span>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider font-sans">Description</label>
              <textarea
                placeholder="Tell us about your inspiration..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-650 text-xs focus:border-violet-600 focus:outline-none transition-all resize-none animate-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
              <span className="text-[10px] text-zinc-600 float-right mt-1 font-sans">
                {description.length}/500 characters
              </span>
            </div>

            {/* Smart Category Selector component */}
            <CategorySelector selectedCategories={categories} onChange={setCategories} />

            {/* Smart Tag Input component */}
            <TagInput selectedTags={tags} onChange={setTags} />

          </div>

          {/* Cancel and Publish actions */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={uploading}
              className="flex-1 py-2.5 border border-zinc-800 hover:bg-[#18181b] text-zinc-400 hover:text-white text-xs font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file || !title}
              className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-750 hover:to-fuchsia-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/10 active:scale-98 transition-all disabled:opacity-50 disabled:scale-100 flex justify-center items-center gap-1.5 cursor-pointer"
            >
              {uploading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              ) : (
                <>
                  <span>Publish</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};

export default Upload;
