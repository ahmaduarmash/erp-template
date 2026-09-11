import { Alert, Avatar, Button, Form, Input, Tabs } from 'antd';
import { PageHeader } from '../../components/shell/PageHeader';
import { useWorkspace } from '../../data/WorkspaceProvider';
import { useFeedback } from '../../components/feedback';
import { MotionSurface } from '../../lib/motion';
export default function Profile() {
  const { profile, updateProfile } = useWorkspace();
  const feedback = useFeedback();
  return (
    <MotionSurface page>
      <PageHeader
        title="My profile"
        description="Manage your personal details and account security."
      />
      <div className="profile-layout">
        <section className="panel profile-card">
          <Avatar size={80} className="avatar">
            {profile.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </Avatar>
          <h2>{profile.name}</h2>
          <p className="muted">{profile.title}</p>
          <p className="small-label">{profile.email}</p>
        </section>
        <section className="panel p-6">
          <Tabs
            items={[
              {
                key: 'details',
                label: 'Personal details',
                children: (
                  <Form
                    layout="vertical"
                    initialValues={profile}
                    onFinish={(values) => {
                      updateProfile(values);
                      feedback.success('Profile updated');
                    }}
                  >
                    <Form.Item
                      name="name"
                      label="Full name"
                      rules={[{ required: true, whitespace: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label="Email address"
                      rules={[{ required: true, type: 'email' }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="title"
                      label="Job title"
                      rules={[{ required: true, whitespace: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                      Save profile
                    </Button>
                  </Form>
                ),
              },
              {
                key: 'security',
                label: 'Change password',
                children: (
                  <>
                    <Alert
                      showIcon
                      type="info"
                      message="Connect an identity provider to enable password changes"
                      description="The starter does not store passwords in browser storage. This form demonstrates validation only; it cannot change a real credential."
                      className="mb-5"
                    />
                    <Form
                      layout="vertical"
                      onFinish={() =>
                        feedback.info(
                          'Validation passed. Connect the password-change API to complete this action.',
                        )
                      }
                    >
                      <Form.Item
                        name="current"
                        label="Current password"
                        rules={[{ required: true }]}
                      >
                        <Input.Password autoComplete="current-password" />
                      </Form.Item>
                      <Form.Item
                        name="password"
                        label="New password"
                        rules={[{ required: true, min: 12, message: 'Use at least 12 characters' }]}
                      >
                        <Input.Password autoComplete="new-password" />
                      </Form.Item>
                      <Form.Item
                        name="confirm"
                        label="Confirm new password"
                        dependencies={['password']}
                        rules={[
                          { required: true },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              return !value || value === getFieldValue('password')
                                ? Promise.resolve()
                                : Promise.reject(new Error('Passwords must match'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password autoComplete="new-password" />
                      </Form.Item>
                      <Button htmlType="submit" type="primary">
                        Validate password form
                      </Button>
                    </Form>
                  </>
                ),
              },
            ]}
          />
        </section>
      </div>
    </MotionSurface>
  );
}
