import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { sampleImage } from '../../.storybook/testing/sample-image';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Badge } from './badge';
function Example({
  size = 'default',
  image = false,
  action = false,
}: {
  size?: 'default' | 'sm';
  image?: boolean;
  action?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <Card size={size}>
      {image && <img src={sampleImage} alt="UI 示例封面" className="h-40 w-full object-cover" />}
      <CardHeader>
        <CardTitle>组件库发布</CardTitle>
        <CardDescription>检查本次发布的文档与组件示例。</CardDescription>
        {action && (
          <CardAction>
            <Badge variant="secondary">预览</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <p>确认交互、主题和样式均符合预期后，即可继续发布。</p>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <span role="status">{saved ? '已确认' : '待确认'}</span>
        <Button size="sm" onClick={() => setSaved(true)}>
          确认
        </Button>
      </CardFooter>
    </Card>
  );
}
const meta = {
  title: 'Components/Card',
  component: Example,
  args: { size: 'default', image: false, action: false },
  argTypes: { size: { control: 'select', options: ['default', 'sm'] } },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '组合 CardHeader、CardTitle、CardDescription、CardContent 和 CardFooter。支持两种尺寸、封面和头部操作区。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '确认' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('已确认');
  },
};
export const Small: Story = { args: { size: 'sm' } };
export const WithImage: Story = { args: { image: true } };
export const WithAction: Story = { args: { action: true } };
