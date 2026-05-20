export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://carrental.sangvish.com/backend';
export const PLACEHOLDER_IMAGE = "/suv-car.png"; // Premium placeholder

// We use direct URL to bypass Next.js rewrite issues which might require a dev server restart
export const API_BASE_URL = BACKEND_URL;

export const getImageUrl = (path: string) => {
    if (!path) return PLACEHOLDER_IMAGE;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    if (path.startsWith('/images/') || path.startsWith('images/')) {
        return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    }
    return path;
};
