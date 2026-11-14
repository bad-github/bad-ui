import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Questionnaire,
  QuestionnaireProgress,
  QuestionnaireItem,
  QuestionnaireTitle,
  QuestionnaireDescription,
  QuestionnaireChoices,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireInput,
  QuestionnaireError,
  QuestionnaireActions,
  QuestionnairePrevious,
  QuestionnaireSkip,
  QuestionnaireNext,
  QuestionnaireSubmit,
} from './questionnaire';
function Example({
  multiple = false,
  optional = false,
  disabledChoice = false,
  shortcuts = false,
  startWithText = false,
}: {
  multiple?: boolean;
  optional?: boolean;
  disabledChoice?: boolean;
  shortcuts?: boolean;
  startWithText?: boolean;
}) {
  const [result, setResult] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <Questionnaire
        defaultItem={startWithText ? 'project' : 'usage'}
        shortcuts={shortcuts ? 'letters' : undefined}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setResult(`用途：${data.getAll('usage').join('、') || '未填写'}；项目：${data.get('project') || '未填写'}`);
        }}
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="usage" multiple={multiple} required={!optional}>
          <QuestionnaireTitle>你准备如何使用组件库？</QuestionnaireTitle>
          <QuestionnaireDescription>
            {multiple ? '可以选择多个用途。' : '请选择一个主要用途。'}
          </QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="网站">
              网站<QuestionnaireChoiceDescription>构建网站和管理后台。</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="文档">
              文档<QuestionnaireChoiceDescription>展示组件和使用说明。</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="实验" disabled={disabledChoice}>
              实验
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError>请选择用途后继续。</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="project" required>
          <QuestionnaireTitle>项目叫什么名字？</QuestionnaireTitle>
          <QuestionnaireDescription>仅用于当前演示，不会发送到服务器。</QuestionnaireDescription>
          <QuestionnaireInput aria-label="项目名称" placeholder="请输入项目名称" />
          <QuestionnaireError>请填写项目名称。</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious>上一步</QuestionnairePrevious>
          <QuestionnaireSkip>跳过</QuestionnaireSkip>
          <QuestionnaireNext>下一步</QuestionnaireNext>
          <QuestionnaireSubmit>提交问卷</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
      <p role="status" className="text-sm">
        {result ? `已提交：${result}` : '尚未提交'}
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/Questionnaire',
  component: Example,
  args: { multiple: false, optional: false, disabledChoice: false, shortcuts: false, startWithText: false },
  render: (args) => <Example key={JSON.stringify(args)} {...args} />,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl min-w-0 p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '分步问卷，包含选择题、输入题、进度和前进、后退、跳过与提交操作。必填题不能跳过；multiple 启用多选，shortcuts 可启用选项快捷键。示例通过 FormData 读取结果，仅保存在本地。',
      },
      story: { height: 580 },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('radio', { name: /网站/ }));
    await userEvent.click(canvas.getByRole('button', { name: '下一步' }));
    await userEvent.type(await canvas.findByRole('textbox', { name: '项目名称' }), '演示项目');
    await userEvent.click(canvas.getByRole('button', { name: '提交问卷' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('已提交：用途：网站；项目：演示项目');
  },
};
export const MultipleChoice: Story = {
  args: { multiple: true },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const a = canvas.getByRole('checkbox', { name: /网站/ });
    const b = canvas.getByRole('checkbox', { name: /文档/ });
    await userEvent.click(a);
    await userEvent.click(b);
    await expect(a).toBeChecked();
    await expect(b).toBeChecked();
  },
};
export const TextInput: Story = { args: { startWithText: true } };
export const OptionalQuestion: Story = {
  args: { optional: true },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '跳过' }));
    await expect(await canvas.findByRole('textbox', { name: '项目名称' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '上一步' }));
    await expect(canvas.getByText('你准备如何使用组件库？')).toBeVisible();
    await expect(await canvas.findByRole('radio', { name: /网站/ })).not.toBeChecked();
  },
};
export const DisabledChoice: Story = { args: { disabledChoice: true } };
export const Shortcuts: Story = { args: { shortcuts: true } };
