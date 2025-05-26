export function removeProfilePicturesAndImages(html: string): string {
  try {
    // If it's not HTML content, return as is
    if (!html.includes('<') || !html.includes('>')) {
      return html;
    }
    
    // Use DOMParser for safer HTML manipulation
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // We only care about removing tracking pixels now
    // Remove inline images with specific dimensions (likely tracking pixels)
    const images = doc.querySelectorAll('img');
    let modified = false;
    
    images.forEach(img => {
      // Remove tracking pixels (1x1, 2x2 etc) but keep actual content images
      const width = parseInt(img.getAttribute('width') || '100');
      const height = parseInt(img.getAttribute('height') || '100');
      
      if ((width <= 3 && height <= 3) || img.src.includes('tracker') || img.src.includes('pixel')) {
        modified = true;
        img.parentNode?.removeChild(img);
      }
    });
    
    // Return modified HTML if changes were made, otherwise original
    return modified ? doc.body.innerHTML : html;
  } catch (e) {
    console.error('Failed to process HTML content:', e);
    // If parsing fails, return original content
    return html;
  }
}