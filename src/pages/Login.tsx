import { Button, Form, Input, Tag } from 'antd';
import { ArrowRightOutlined, SafetyOutlined } from '@ant-design/icons';
import { useTemplate } from '../theme/ThemeProvider';
import { Brand } from '../components/shell/Sidebar';
export default function Login({ onLogin }: { onLogin: (email: string) => void }) {
  const { config } = useTemplate();
  return (
    <main className="login-page">
      <section className="login-brand">
        <Brand />
        <div>
          <Tag>OPERATIONS, CONNECTED</Tag>
          <h1>{config.brand.tagline}</h1>
          <p>One workspace for your inventory, finances, and team.</p>
          <div className="login-feature">
            <SafetyOutlined />
            <span>
              Designed to adapt.
              <br />
              Built to become yours.
            </span>
          </div>
        </div>
        <span>Configurable workspace starter</span>
      </section>
      <section className="login-form">
        <div>
          <span className="eyebrow">WELCOME TO {config.brand.name.toUpperCase()}</span>
          <h2>Good to have you here.</h2>
          <p className="muted">Enter the demo workspace to explore the starter.</p>
          <Form
            layout="vertical"
            onFinish={(values: { email: string }) => onLogin(values.email)}
            initialValues={{ email: 'alex@example.com', password: 'demo-workspace' }}
          >
            <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
              <Input autoComplete="username" size="large" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, min: 8 }]}>
              <Input.Password autoComplete="current-password" size="large" />
            </Form.Item>
            <Button block size="large" type="primary" htmlType="submit">
              Enter demo <ArrowRightOutlined />
            </Button>
          </Form>
          <p className="login-disclaimer">
            Demo only. Any valid email and 8-character password are accepted. The adapter stores only
            demo session identity; replace it with your authentication provider before production use.
          </p>
        </div>
      </section>
    </main>
  );
}
