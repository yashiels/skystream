/**
 * Custom hook for managing streaming modal URL routing
 * Handles URL updates when modal opens/closes and deep linking
 */

import { useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  generateMovieUrl,
  generateTVUrl,
  parseStreamingUrl,
  updateBrowserUrl,
  isStreamingUrl,
} from './urlRouting';

/**
 * Hook to manage streaming modal URL routing
 * @param {object} _playerModal - Current player modal state (reserved for future use)
 * @param {function} onOpenModal - Callback to open modal with content
 * @returns {object} Object with methods to handle URL routing
 */
export const useStreamingUrl = (_playerModal, onOpenModal) => {
  const pathname = usePathname();
  const router = useRouter();

  // Handle deep linking - when user navigates directly to a streaming URL
  useEffect(() => {
    if (isStreamingUrl(pathname)) {
      const parsedUrl = parseStreamingUrl(pathname);
      if (parsedUrl && onOpenModal) {
        // Trigger modal opening with parsed content
        // The actual content will be fetched by the page component
        onOpenModal(parsedUrl);
      }
    }
  }, [pathname, onOpenModal]);

  // Update URL when modal opens
  const handleModalOpen = useCallback((content, season = null, episode = null) => {
    if (!content || !content.id) return;

    let url;
    if (content.type === 'tv') {
      url = generateTVUrl(content, season || 1, episode || 1);
    } else {
      url = generateMovieUrl(content);
    }

    if (url) {
      updateBrowserUrl(url, `${content.title} - SkyStream`);
    }
  }, []);

  // Restore URL when modal closes
  const handleModalClose = useCallback(() => {
    // Go back to the previous page (home or search)
    router.back();
  }, [router]);

  return {
    handleModalOpen,
    handleModalClose,
    isStreamingUrl: isStreamingUrl(pathname),
    parsedUrl: parseStreamingUrl(pathname),
  };
};

export default useStreamingUrl;
