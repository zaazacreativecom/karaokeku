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
    if (song.thumbnail_url) return song.thumbnail_url
    
    // Try to get from video_url_full
    let videoId = getYouTubeId(song.video_url_full)
    if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    
    // Try to get from video_url_instrumental
    videoId = getYouTubeId(song.video_url_instrumental)
    if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    
    return null // No thumbnail available
}

export const getHighResThumbnailUrl = (song) => {
    if (song.thumbnail_url) return song.thumbnail_url
    
    let videoId = getYouTubeId(song.video_url_full)
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    videoId = getYouTubeId(song.video_url_instrumental)
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    return null
}
