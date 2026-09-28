import IFrame from './iframe';
import React, { useCallback, useState } from 'react';
import styles from '../styles/iframe.css?inline';
import { useAppContext } from '../app-context';

type FrameProps = {
  children: React.ReactNode;
};

type TailwindFrameProps = FrameProps & {
  style: React.CSSProperties;
  title: string;
  onResize?: (iframeRoot: HTMLElement) => void;
};

function getFontFaceStyles({
  outfitRegularUrl,
  outfitBoldUrl,
}: {
  outfitRegularUrl: string | undefined;
  outfitBoldUrl: string | undefined;
}) {
  if (!outfitRegularUrl || !outfitBoldUrl) {
    return '';
  }

  const regularUrl = JSON.stringify(outfitRegularUrl);
  const boldUrl = JSON.stringify(outfitBoldUrl);

  return `
    @font-face {
      font-display: swap;
      font-family: "Outfit";
      font-style: normal;
      font-weight: 400;
      src: url(${regularUrl}) format("woff2");
    }

    @font-face {
      font-display: swap;
      font-family: "Outfit";
      font-style: normal;
      font-weight: 700;
      src: url(${boldUrl}) format("woff2");
    }
  `;
}

/**
 * Loads all the CSS styles inside an iFrame. Only shows the visible content as soon as the CSS file with the tailwind classes has loaded.
 */
const TailwindFrame = React.forwardRef<
  HTMLIFrameElement,
  React.PropsWithChildren<TailwindFrameProps>
>(function TailwindFrame(
  { children, onResize, style, title },
  ref: React.ForwardedRef<HTMLIFrameElement>,
) {
  const { outfitRegularUrl, outfitBoldUrl } = useAppContext();
  const fontStyles = getFontFaceStyles({ outfitRegularUrl, outfitBoldUrl });

  const head = (
    <>
      <style dangerouslySetInnerHTML={{ __html: fontStyles + styles }} />
      <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0" name="viewport" />
    </>
  );

  // For now we're using <NewFrame> because using a functional component with portal caused some weird issues with modals
  return (
    <IFrame ref={ref} head={head} style={style} title={title} onResize={onResize}>
      {children}
    </IFrame>
  );
});

type ResizableFrameProps = FrameProps & {
  style: React.CSSProperties;
  title: string;
};

/**
 * This iframe has the same height as it contents and mimics a shadow DOM component
 */
const ResizableFrame = React.forwardRef<
  HTMLIFrameElement,
  React.PropsWithChildren<ResizableFrameProps>
>(function ResizableFrame({ children, style, title }, ref: React.ForwardedRef<HTMLIFrameElement>) {
  const [iframeStyle, setIframeStyle] = useState(style);
  const onResize = useCallback((iframeRoot) => {
    setIframeStyle((current) => {
      return {
        ...current,
        height: `${iframeRoot.scrollHeight}px`,
      };
    });
  }, []);

  return (
    <TailwindFrame ref={ref} style={iframeStyle} title={title} onResize={onResize}>
      {children}
    </TailwindFrame>
  );
});

type CommentsFrameProps = Record<never, any>;

export const CommentsFrame = React.forwardRef<
  HTMLIFrameElement,
  React.PropsWithChildren<CommentsFrameProps>
>(function CommentsFrame({ children }, ref: React.ForwardedRef<HTMLIFrameElement>) {
  const style: React.CSSProperties = {
    width: '100%',
    height: '400px',
  };
  return (
    <ResizableFrame ref={ref} style={style} title="comments-frame">
      {children}
    </ResizableFrame>
  );
});

type PopupFrameProps = FrameProps & {
  title: string;
};

export const PopupFrame: React.FC<PopupFrameProps> = ({ children, title }) => {
  const style: React.CSSProperties = {
    zIndex: '3999999',
    position: 'fixed',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  };

  return (
    <TailwindFrame style={style} title={title}>
      {children}
    </TailwindFrame>
  );
};
