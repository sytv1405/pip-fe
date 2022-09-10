// modified from: https://github.com/vercel/next.js/issues/2476#issuecomment-926127255
import { Modal, ModalProps } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef, useCallback } from 'react';

import { useTranslation } from 'i18next-config';

/**
 * Throwing an actual error class trips the Next.JS 500 Page, this string literal does not.
 */
const throwFakeErrorToFoolNextRouter = (): never => {
  // eslint-disable-next-line no-throw-literal
  throw 'Abort route change. Please ignore this error.';
};

const PageLeavingPrompt = ({ shouldWarn }: { shouldWarn: boolean }) => {
  const [t] = useTranslation();
  const router = useRouter();
  const [modalLeavingPrompt, setModalLeavingPrompt] = useState<ModalProps>(null);

  const message = t('page_leaving_prompt_message');

  const lastHistoryState = useRef<{ idx: number }>(global.history?.state);
  const isWarned = useRef(false);
  const isReverting = useRef(false);

  useEffect(() => {
    const storeLastHistoryState = (): void => {
      lastHistoryState.current = window.history.state;
    };
    router.events.on('routeChangeComplete', storeLastHistoryState);

    return () => {
      router.events.off('routeChangeComplete', storeLastHistoryState);
    };
  }, [router]);

  /**
   * @experimental HACK - idx is not documented
   * Determines which direction to travel in history.
   */
  const revertTheChangeRouterJustMade = useCallback(() => {
    const state = lastHistoryState.current;
    if (state !== null && window.history.state !== null && state.idx !== window.history.state.idx) {
      isReverting.current = true;
      window.history.go(lastHistoryState.current.idx < window.history.state.idx ? -1 : 1);
    }
  }, []);

  const killRouterEvent = useCallback(() => {
    router.events.emit('routeChangeError');

    throwFakeErrorToFoolNextRouter();
  }, [router]);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (isReverting.current) {
        isReverting.current = false;
        killRouterEvent();
      }

      if (router.asPath !== url && shouldWarn && !isWarned.current) {
        isWarned.current = true;

        setModalLeavingPrompt({
          visible: true,
          onOk: () => {
            router.push(url);
          },
          onCancel: () => {
            setModalLeavingPrompt(null);
            isWarned.current = false;
            revertTheChangeRouterJustMade();
          },
        });

        killRouterEvent();
      }
    };

    const handleBeforeUnload = e => {
      if (shouldWarn && !isWarned.current) {
        const event = e ?? window.event;
        event.returnValue = message;
        return message;
      }
      return null;
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router, killRouterEvent, message, shouldWarn, revertTheChangeRouterJustMade]);

  return (
    <Modal
      centered
      closable={false}
      maskClosable={false}
      title={t('page_leaving_prompt_title')}
      okText={t('button_move_page')}
      {...modalLeavingPrompt}
    >
      {message}
    </Modal>
  );
};

export default PageLeavingPrompt;
