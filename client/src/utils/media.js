/**
 * Media utilities
 */

export const getYouTubeId = (url) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
}

export const getThumbnailUrl = (song) => {
    if (song.thumbnail_url) {
        // Assuming API serves static files at root or /uploads
        // Need base URL. Since this is utils, we might not have access to env easily or circular dependency.
        // Helper to strip localhost/origin if present (fixes database having absolute URLs)
        const cleanUrl = (url) => {
            if (!url) return '';
            // If it points to localhost (any port), strip it to make it relative
            if (url.includes('localhost')) {
                return url.replace(/^http(s)?:\/\/localhost(:\d+)?/, '');
            }
            return url;
        }

        if (song.thumbnail_url.startsWith('http') && !song.thumbnail_url.includes('localhost')) {
            return song.thumbnail_url
        }
        
        const relativePath = cleanUrl(song.thumbnail_url);
        return relativePath.startsWith('/') ? relativePath : `/${relativePath}`
    }
    
    // Try to get from video_url_full
    let videoId = getYouTubeId(song.video_url_full)
    if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    
    // Try to get from video_url_instrumental
    videoId = getYouTubeId(song.video_url_instrumental)
    if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    
    return null // No thumbnail available
}

export const getHighResThumbnailUrl = (song) => {
    if (song.thumbnail_url) {
        if (song.thumbnail_url.startsWith('http') && !song.thumbnail_url.includes('localhost')) {
            return song.thumbnail_url
        }
        // Strip localhost if present
        const relativePath = song.thumbnail_url.replace(/^http(s)?:\/\/localhost(:\d+)?/, '');
        return relativePath.startsWith('/') ? relativePath : `/${relativePath}`
    }
    
    let videoId = getYouTubeId(song.video_url_full)
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    videoId = getYouTubeId(song.video_url_instrumental)
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    return null
}
