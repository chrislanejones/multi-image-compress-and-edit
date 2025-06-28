"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useImageContext } from '../../context/ImageContext';
import ImageEditor from '@/components/image-editor';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const imageId = params.imageId as string;
  
  const {
    images,
    selectedImage,
    selectedImageId,
    selectImage,
    updateImageUrl,
    navigateImage,
    removeAllImages,
    setEditMode,
  } = useImageContext();

  useEffect(() => {
    if (imageId && images.length > 0) {
      const image = images.find(img => img.id === imageId);
      if (image && selectedImageId !== imageId) {
        selectImage(image);
      } else if (!image) {
        router.push('/gallery');
      }
    } else if (images.length === 0) {
      router.push('/');
    }
  }, [imageId, images, selectedImageId, selectImage, router]);

  useEffect(() => {
    if (images.length > 0 && !selectedImage) {
      router.push('/gallery');
    }
  }, [selectedImage, images.length, router]);

  const handleImageChange = (newImageUrl: string) => {
    if (selectedImage) {
      updateImageUrl(selectedImage.id, newImageUrl);
    }
  };

  const handleDownload = () => {
    if (selectedImage) {
      const a = document.createElement('a');
      a.href = selectedImage.url;
      a.download = selectedImage.file.name || 'image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleClose = () => {
    setEditMode(false);
    router.push('/gallery');
  };

  const handleNavigateImage = (direction: "next" | "prev" | "next10" | "prev10") => {
    navigateImage(direction);
    const currentIndex = images.findIndex(img => img.id === selectedImageId);
    let newIndex;
    
    switch (direction) {
      case "next":
        newIndex = (currentIndex + 1) % images.length;
        break;
      case "prev":
        newIndex = (currentIndex - 1 + images.length) % images.length;
        break;
      case "next10":
        newIndex = Math.min(currentIndex + 10, images.length - 1);
        break;
      case "prev10":
        newIndex = Math.max(currentIndex - 10, 0);
        break;
      default:
        return;
    }
    
    if (newIndex !== currentIndex) {
      const newImage = images[newIndex];
      router.push(`/edit/${newImage.id}`);
    }
  };

  if (!selectedImage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Loading image...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ImageEditor
        imageUrl={selectedImage.url}
        onImageChange={handleImageChange}
        onDownload={handleDownload}
        onClose={handleClose}
        fileName={selectedImage.file.name}
        fileType={selectedImage.file.type}
        fileSize={selectedImage.file.size}
        allImages={images}
        currentImageId={selectedImage.id}
        onSelectImage={(image) => router.push(`/edit/${image.id}`)}
        onNavigateImage={handleNavigateImage}
        onRemoveAll={removeAllImages}
        onUploadNew={() => router.push('/')}
        onEditModeChange={(isEditMode) => setEditMode(isEditMode)}
      />
    </div>
  );
}
