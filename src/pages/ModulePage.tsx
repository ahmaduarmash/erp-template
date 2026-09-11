import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Select,
  Tabs,
  Checkbox,
  type TableColumnsType,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getModule, type RecordData } from '../data/modules';
import { useWorkspace } from '../data/WorkspaceProvider';
import { PageHeader } from '../components/shell/PageHeader';
import { DataTable, StatusBadge } from '../components/data/DataTable';
import { CrudModal } from '../components/data/CrudModal';
import { CrudDrawer } from '../components/data/CrudDrawer';
import { useFeedback } from '../components/feedback';
import { MotionSurface } from '../lib/motion';
import { validateRecord } from '../lib/validation';
export default function ModulePage({ moduleKey }: { moduleKey: string }) {
  const def = getModule(moduleKey);
  const workspace = useWorkspace();
  const feedback = useFeedback();
  const rows = workspace.records[moduleKey];
  const [form] = Form.useForm();
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<RecordData | null>(null);
  const edit = useCallback(
    (row: RecordData) => {
      setEditing(row);
      form.setFieldsValue(row);
      setOpen(true);
    },
    [form],
  );
  const remove = useCallback(
    (ids: string[]) => {
      workspace.remove(moduleKey, ids);
      feedback.success(`${ids.length} record(s) deleted`);
    },
    [workspace.remove, moduleKey, feedback],
  );
  const columns = useMemo<TableColumnsType<RecordData>>(
    () => [
      ...def.fields
        .filter((f) => f.type !== 'textarea')
        .map((field) => ({
          key: field.key,
          dataIndex: field.key,
          title: field.label,
          shouldCellUpdate: (record: RecordData, previous: RecordData) =>
            record[field.key] !== previous[field.key],
          width: field.key === 'name' ? 240 : 160,
          sorter: (a: RecordData, b: RecordData) =>
            field.type === 'number'
              ? Number(a[field.key]) - Number(b[field.key])
              : String(a[field.key]).localeCompare(String(b[field.key])),
          ...(field.type === 'select'
            ? {
                filters: field.options!.map((v) => ({ text: v, value: v })),
                onFilter: (v: React.Key | boolean, row: RecordData) => row[field.key] === v,
              }
            : {}),
          render: (value: string | number) =>
            field.key === 'name' ? (
              <span className="record-name">{value}</span>
            ) : field.type === 'number' ? (
              Number(value).toLocaleString()
            ) : (
              value
            ),
        })),
      {
        key: 'status',
        dataIndex: 'status',
        title: 'Status',
        width: 140,
        filters: def.statuses.map((s) => ({ text: s, value: s })),
        onFilter: (v, row) => row.status === v,
        render: (status: string) => <StatusBadge status={status} />,
      },
    ],
    [def],
  );
  const create = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: def.statuses[0] });
    setOpen(true);
  };
  const submit = async () => {
    try {
      const values = await form.validateFields();
      const validationError = validateRecord(moduleKey, values, rows, editing?.id);
      if (validationError) {
        feedback.error(validationError);
        return;
      }
      workspace.save(moduleKey, { ...values, id: editing?.id || crypto.randomUUID() });
      setOpen(false);
      feedback.success(`${def.singular} ${editing ? 'updated' : 'created'}`);
    } catch {
      /* Form fields display validation errors. */
    }
  };
  const Shell =
    moduleKey === 'journal-entries' || moduleKey === 'purchase-orders' ? CrudDrawer : CrudModal;
  const table = (
    <DataTable
      rows={rows}
      columns={columns}
      name={moduleKey}
      onEdit={edit}
      onView={setView}
      onDelete={remove}
      searchPlaceholder={`Search ${def.title.toLowerCase()}…`}
    />
  );
  return (
    <MotionSurface page>
      <PageHeader
        title={def.title}
        group={def.group}
        description={def.description}
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={create}>
            New {def.singular}
          </Button>
        }
      />
      <div className="module-summary">
        <span>
          <strong>{rows.length}</strong> total records
        </span>
        <span>
          <strong>{rows.filter((r) => r.status === def.statuses[0]).length}</strong>{' '}
          {def.statuses[0].toLowerCase()}
        </span>
        <span className="muted">Local demo workspace</span>
      </div>
      {moduleKey === 'users' ? (
        <Tabs
          items={[
            { key: 'users', label: 'Team members', children: table },
            {
              key: 'roles',
              label: 'Roles & permissions',
              children: (
                <div className="panel p-6">
                  <Alert
                    type="info"
                    showIcon
                    message="Example permission configuration"
                    description="These settings are saved locally. Enforce permissions on your API before connecting production data."
                  />
                  <div className="permission-grid">
                    <strong>Role</strong>
                    <strong>Allowed actions</strong>
                    {Object.entries(workspace.roles).map(([role, permissions]) => (
                      <div className="permission-row" key={role}>
                        <strong>{role}</strong>
                        <Checkbox.Group
                          options={['View', 'Create', 'Edit', 'Delete', 'Export']}
                          value={permissions}
                          onChange={(v) => {
                            workspace.updateRole(role, v as string[]);
                            feedback.success('Permissions updated');
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
          ]}
        />
      ) : (
        table
      )}
      <Shell
        open={open}
        title={`${editing ? 'Edit' : 'New'} ${def.singular}`}
        onCancel={() => setOpen(false)}
        onSave={() => void submit()}
      >
        <Form form={form} layout="vertical" requiredMark="optional" className="crud-form">
          <div className="form-grid">
            {def.fields.map((field) => (
              <Form.Item
                key={field.key}
                name={field.key}
                label={field.label}
                rules={[
                  { required: field.required, message: `Enter ${field.label.toLowerCase()}` },
                  ...(field.type === 'email'
                    ? [{ type: 'email' as const, message: 'Enter a valid email' }]
                    : []),
                  ...(field.type !== 'number' && field.type !== 'select' && field.type !== 'date'
                    ? [{ whitespace: true, message: 'Cannot be blank' }]
                    : []),
                ]}
              >
                {field.type === 'number' ? (
                  <InputNumber
                    min={0}
                    precision={['quantity', 'reorder'].includes(field.key) ? 0 : 2}
                    style={{ width: '100%' }}
                  />
                ) : field.type === 'select' ? (
                  <Select options={field.options?.map((v) => ({ value: v, label: v }))} />
                ) : field.type === 'textarea' ? (
                  <Input.TextArea rows={3} />
                ) : (
                  <Input
                    type={
                      field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'
                    }
                  />
                )}
              </Form.Item>
            ))}
            <Form.Item label="Status" name="status" rules={[{ required: true }]}>
              <Select options={def.statuses.map((s) => ({ label: s, value: s }))} />
            </Form.Item>
          </div>
          {moduleKey === 'journal-entries' && (
            <Alert
              type="info"
              message="Two-line journal example. Debit and credit must balance. No ledger posting is performed."
            />
          )}
        </Form>
      </Shell>
      <CrudDrawer
        saveLabel="Edit record"
        open={!!view}
        title={view?.name || 'Record details'}
        onCancel={() => setView(null)}
        onSave={() => {
          if (view) {
            edit(view);
            setView(null);
          }
        }}
      >
        {view && (
          <Descriptions
            column={1}
            items={[...def.fields, { key: 'status', label: 'Status' }].map((f) => ({
              key: f.key,
              label: f.label,
              children: String(view[f.key] ?? '—'),
            }))}
          />
        )}
        <p className="muted mt-6">Choose Edit record to update these details.</p>
      </CrudDrawer>
    </MotionSurface>
  );
}
