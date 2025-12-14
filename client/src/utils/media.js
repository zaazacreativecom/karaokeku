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
        if (song.thumbnail_url.startsWith('http')) return song.thumbnail_url
        // Assuming API serves static files at root or /uploads
        // Need base URL. Since this is utils, we might not have access to env easily or circular dependency.
        // But better to use VITE_API_URL
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
        // If API_URL is .../api, we might need to strip /api if files are at root
        // But usually server serves static at root. 
        // My previous code: app.use('/uploads', express.static(...))
        // So http://localhost:3000/uploads/... works.
        const BASE_URL = API_URL.replace('/api', '')
        return `${BASE_URL}${song.thumbnail_url.startsWith('/') ? '' : '/'}${song.thumbnail_url}`
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
        if (song.thumbnail_url.startsWith('http')) return song.thumbnail_url
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
        const BASE_URL = API_URL.replace('/api', '')
        return `${BASE_URL}${song.thumbnail_url.startsWith('/') ? '' : '/'}${song.thumbnail_url}`
    }
    
    let videoId = getYouTubeId(song.video_url_full)
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    videoId = getYouTubeId(song.video_url_instrumental)
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    return null
}
