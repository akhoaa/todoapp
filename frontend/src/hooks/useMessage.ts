import { App } from 'antd';

/**
 * Hook to use Antd message API with proper context
 * This resolves the "Static function can not consume context" warning
 */
export const useMessage = () => {
  const { message } = App.useApp();
  return message;
};
