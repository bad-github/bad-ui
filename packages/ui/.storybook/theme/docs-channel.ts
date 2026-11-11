import { Channel, type ChannelHandler, type ChannelTransport } from 'storybook/internal/channels';
import { MANAGER_THEME_CHANGED, PREVIEW_THEME_READY } from './events';

const messageKey = 'bad-ui/docs-theme-channel';

/** 为 Docs 与其嵌套 iframe 建立专用 channel，不替换 Storybook 自身的通道。 */
export function createDocsThemeChannel(role: 'docs' | 'preview') {
  let handler: ChannelHandler | undefined;
  const getFrames = () => Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe[id^="iframe--"]'));
  const transport: ChannelTransport = {
    setHandler(next) {
      handler = next;
    },
    send(event) {
      const targets = role === 'docs' ? getFrames().map((frame) => frame.contentWindow) : [window.parent];
      // postMessage 仅作 channel 的传输层；不修改组件、DOM 配色或 iframe 地址。
      for (const target of targets) target?.postMessage({ key: messageKey, event }, window.location.origin);
    },
  };
  const channel = new Channel({ transport });
  const receive = (message: MessageEvent) => {
    if (message.origin !== window.location.origin) return;
    const allowedSource =
      role === 'docs'
        ? getFrames().some((frame) => frame.contentWindow === message.source)
        : message.source === window.parent;
    if (!allowedSource || message.data?.key !== messageKey) return;
    const event = message.data.event;
    // 只接受这条桥接链路支持的主题消息。
    if (!event || ![MANAGER_THEME_CHANGED, PREVIEW_THEME_READY].includes(event.type)) return;
    if (typeof event.from !== 'string' || !Array.isArray(event.args)) return;
    handler?.(event);
  };
  window.addEventListener('message', receive);

  return {
    channel,
    // Docs/示例卸载时清理消息监听与 channel 订阅，避免重复转发。
    dispose() {
      window.removeEventListener('message', receive);
      channel.removeAllListeners();
    },
  };
}
