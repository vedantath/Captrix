'use client';
import FileInput from "@/components/FileInput"
import FormField from "@/components/FormField"
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import { getThumbnailUploadUrl, getVideoUploadUrl, saveVideoDetails } from "@/lib/actions/video";
import { useFileInput } from "@/lib/hooks/useFileInput";
import { useRouter } from "next/navigation";
// import { boolean } from "drizzle-orm/gel-core";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const uploadFileToBunny = (file: File, uploadUrl: string, accessKey: string): Promise<void> => {
    return fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
            'AccessKey': accessKey,
        },
        body: file,
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
    })
}

const page = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: '',
    });

    const video = useFileInput(MAX_VIDEO_SIZE);
    const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);

    useEffect(() => {
        if (video.Duration != null || 0) {
            setVideoDuration(video.Duration)
        }
    }, [video.Duration])

    useEffect(() => {
        const checkForRecordedVideo = async () => {
            try {
                const stored = sessionStorage.getItem('recordedVideo');
                if (!stored) return;

                const { url, name, type, duration } = JSON.parse(stored);
                const blob = await fetch(url).then((res) => res.blob());
                const file = new File([blob], name, { type, lastModified: Date.now() });

                if (video.inputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    video.inputRef.current.files = dataTransfer.files;

                    const event = new Event('change', { bubbles: true });
                    video.inputRef.current.dispatchEvent(event);

                    video.handleFileChange({
                        target: { files: dataTransfer.files }
                    } as ChangeEvent<HTMLInputElement>);
                }

                if (duration) {
                    setVideoDuration(duration);
                }

                sessionStorage.removeItem('recordedVideo');
                URL.revokeObjectURL(url); // Clean up the URL
            } catch (e) {
                console.error("Error loading recorded video:", e);
            }
        }
        checkForRecordedVideo();
    }, [video]);

    const [error, setError] = useState('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prevState) => ({ ...prevState, [name]: value }));
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (!formData.title || !formData.description) {
                setError('Please fill in all details');
                return;
            }
            if (!video.File || !thumbnail.File) {
                setError('Please upload video and thumbnail');
                return;
            }

            // Get Upload URL
            const {
                videoId,
                uploadUrl: videoUploadUrl,
                accessKey: videoAccessKey,
            } = await getVideoUploadUrl();

            if (!videoUploadUrl || !videoAccessKey) {
                throw new Error('Failed to get video upload credentials');
            }

            // Upload video to Bunny
            await uploadFileToBunny(video.File, videoUploadUrl, videoAccessKey);
            const {
                uploadUrl: thumbnailUploadUrl,
                accessKey: thumbnailAccessKey,
                cdnUrl: thumbnailCdnUrl,
            } = await getThumbnailUploadUrl(videoId);

            if (!thumbnailUploadUrl || !thumbnailAccessKey) {
                throw new Error('Failed to get thumbnail upload credentials');
            }

            // Attach thumbnail
            await uploadFileToBunny(thumbnail.File, thumbnailUploadUrl, thumbnailAccessKey);
        
            // Create a new DB entry for video details (urls, data)
            await saveVideoDetails({
                videoId,
                thumbnailUrl: thumbnailCdnUrl,
                ...formData,
                duration: videoDuration
            })

            router.push(`/`);
        } catch (error) {
            console.log("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    }


  return (
    <div className='wrapper-md upload-page'>
        <h1>Upload a video</h1>

        {error && <div className="error-field">{error}</div>}

        <form className="rounded-20 shadow-10 gap-6 w-full flex flex-col px-5 py-7.5" onSubmit={handleSubmit}>
            <FormField 
                id="title"
                label="Title"
                placeholder="Enter a title for your video"
                value={formData.title}
                onChange={handleInputChange}
            />

            <FormField 
                id="description"
                label="Description"
                placeholder="Describe your video"
                value={formData.description}
                as="textarea"
                onChange={handleInputChange}
            />

            <FileInput 
                id="video"
                label="Video"
                accept="video/*"
                file={video.file}
                previewUrl={video.previewUrl}
                inputRef={video.inputRef}
                onChange={video.handleFileChange}
                onReset={video.resetFile}
                type="video"
            />

            <FileInput 
                id="thumbnail"
                label="Thumbnail"
                accept="image/*"
                file={thumbnail.file}
                previewUrl={thumbnail.previewUrl}
                inputRef={thumbnail.inputRef}
                onChange={thumbnail.handleFileChange}
                onReset={thumbnail.resetFile}
                type="image"
            />

            <FormField 
                id="visibility"
                label="Visibility"
                value={formData.visibility}
                as="select"
                options={[
                    { value: 'public', label: 'Public' },
                    { value: 'private', label: 'Private' },
                ]}
                onChange={handleInputChange}
            />

            <button type="submit" disabled={isSubmitting} className="submit-button">
                {isSubmitting ? 'Uploading...' : 'Upload Video'}
            </button>
        </form>


    </div>
  )
}

export default page