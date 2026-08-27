import type { ExternalPathString, RelativePathString } from 'expo-router';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

export function ExternalLink(
  props: Omit<ComponentProps<typeof Link>, 'href'> & { href: RelativePathString | ExternalPathString | string },
) {
  return (
    <Link
      target="_blank"
      {...props}
      href={props.href as RelativePathString | ExternalPathString}
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          e.preventDefault();
          WebBrowser.openBrowserAsync(props.href as string);
        }
      }}
    />
  );
}
