import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { streamingServices } from '@skystream/api';
import { PLAYER_DEFAULTS } from '@skystream/shared';
import { spacing, fontSize, borderRadius } from '../theme';

// Derive videasy domains from the single source of truth in @skystream/shared
const _videasyHost = PLAYER_DEFAULTS.videasyBaseUrl.replace(/^https?:\/\//, ''); // e.g. 'player.videasy.to'
const _videasyRoot = _videasyHost.split('.').slice(-2).join('.'); // e.g. 'videasy.to'

const ALLOWED_DOMAINS = [
  _videasyHost, // 'player.videasy.to'
  `www.${_videasyRoot}`, // 'www.videasy.to'
  _videasyRoot, // 'videasy.to'
  'player.videasy.net', // legacy compat
  'www.videasy.net', // legacy compat
  'videasy.net', // legacy compat
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'vidplay.online',
  'rabbitstream.net',
  'megacloud.tv',
  'dokicloud.one',
  'rapid-cloud.co',
  'mcloud.bz',
  'filemoon.sx',
  'streamtape.com',
  'dood.wf',
  'mp4upload.com',
  'mixdrop.co',
  'upstream.to',
];

const AD_BLOCK_JS = `
(function() {
  // Block window.open (ad popups)
  window.open = function() { return null; };

  // Block ad-related redirects
  var origAssign = Object.getOwnPropertyDescriptor(Location.prototype, 'assign');
  var origReplace = Object.getOwnPropertyDescriptor(Location.prototype, 'replace');

  if (origAssign) {
    Object.defineProperty(window.location, 'assign', {
      value: function(url) {
        if (url && url.includes && (url.includes('videasy') || url.includes('player.videasy'))) {
          origAssign.value.call(this, url);
        }
      }
    });
  }

  if (origReplace) {
    Object.defineProperty(window.location, 'replace', {
      value: function(url) {
        if (url && url.includes && (url.includes('videasy') || url.includes('player.videasy'))) {
          origReplace.value.call(this, url);
        }
      }
    });
  }

  // Remove ad overlay elements periodically
  function removeAds() {
    var selectors = [
      'iframe[src*="ad"]',
      'iframe[src*="pop"]',
      'div[class*="popup"]',
      'div[class*="overlay"][onclick]',
      'div[id*="ad-"]',
      'a[target="_blank"][rel*="nofollow"]',
    ];
    selectors.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        el.remove();
      });
    });
  }

  // Run on load and periodically
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeAds);
  } else {
    removeAds();
  }
  setInterval(removeAds, 2000);

  true;
})();
`;

export default function PlayerScreen({ colors }) {
  const navigation = useNavigation();
  const route = useRoute();
  const webViewRef = useRef(null);
  const { content, contentType, season: initialSeason, episode: initialEpisode } = route.params;

  const [season, setSeason] = useState(initialSeason ?? 1);
  const [episode, setEpisode] = useState(initialEpisode ?? 1);
  const [loading, setLoading] = useState(true);

  const getUrl = useCallback(
    (s, e) => {
      if (contentType === 'movie') {
        return streamingServices.getVideasyMovieUrl(content.id);
      }
      return streamingServices.getVideasyTVUrl(content.id, s, e);
    },
    [content, contentType]
  );

  const [currentUrl, setCurrentUrl] = useState(() => getUrl(season, episode));
  const isTV = contentType === 'tv';

  const handleSeasonChange = useCallback(
    delta => {
      const newSeason = Math.max(1, season + delta);
      setSeason(newSeason);
      setEpisode(1);
      setCurrentUrl(getUrl(newSeason, 1));
      setLoading(true);
    },
    [season, getUrl]
  );

  const handleEpisodeChange = useCallback(
    delta => {
      const newEpisode = Math.max(1, episode + delta);
      setEpisode(newEpisode);
      setCurrentUrl(getUrl(season, newEpisode));
      setLoading(true);
    },
    [episode, season, getUrl]
  );

  const handleNavigationRequest = useCallback(request => {
    const { url, isTopFrame } = request;

    if (!url || url === 'about:blank') return true;

    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;

      if (ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) {
        return true;
      }

      if (isTopFrame) {
        return false;
      }

      return false;
    } catch {
      return false;
    }
  }, []);

  const handleOpenWindow = useCallback(() => {
    // Block all popup windows — these are ad popups
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topBar, { backgroundColor: colors.bgSecondary }]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.titleText, { color: colors.textPrimary }]} numberOfLines={1}>
            {content.title || content.name}
          </Text>

          <View style={styles.spacer} />
        </View>

        {isTV && (
          <View style={[styles.episodeBar, { backgroundColor: colors.bgTertiary }]}>
            <View style={styles.episodeControl}>
              <Text style={[styles.episodeLabel, { color: colors.textSecondary }]}>Season</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepButton, { borderColor: colors.border }]}
                  onPress={() => handleSeasonChange(-1)}
                >
                  <Icon name="remove" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.stepValue, { color: colors.textPrimary }]}>{season}</Text>
                <TouchableOpacity
                  style={[styles.stepButton, { borderColor: colors.border }]}
                  onPress={() => handleSeasonChange(1)}
                >
                  <Icon name="add" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.episodeControl}>
              <Text style={[styles.episodeLabel, { color: colors.textSecondary }]}>Episode</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepButton, { borderColor: colors.border }]}
                  onPress={() => handleEpisodeChange(-1)}
                >
                  <Icon name="remove" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.stepValue, { color: colors.textPrimary }]}>{episode}</Text>
                <TouchableOpacity
                  style={[styles.stepButton, { borderColor: colors.border }]}
                  onPress={() => handleEpisodeChange(1)}
                >
                  <Icon name="add" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.playerContainer}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          )}
          <WebView
            ref={webViewRef}
            key={currentUrl}
            source={{ uri: currentUrl }}
            style={styles.webView}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            javaScriptEnabled
            domStorageEnabled
            bounces={false}
            scrollEnabled={false}
            setSupportMultipleWindows={false}
            javaScriptCanOpenWindowsAutomatically={false}
            onLoadEnd={() => setLoading(false)}
            onShouldStartLoadWithRequest={handleNavigationRequest}
            onOpenWindow={handleOpenWindow}
            injectedJavaScript={AD_BLOCK_JS}
            userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  closeButton: {
    padding: spacing.sm,
  },
  titleText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  spacer: {
    width: 40,
  },
  episodeBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  episodeControl: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  episodeLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
});
