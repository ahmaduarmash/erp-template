import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="Page not found"
      subTitle="This page isn’t part of your workspace."
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          Back to overview
        </Button>
      }
    />
  );
}
