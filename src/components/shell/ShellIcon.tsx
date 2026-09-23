import {
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  BellOutlined,
  BookOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileTextOutlined,
  IdcardOutlined,
  InboxOutlined,
  SettingOutlined,
  ShopOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { RouteIconName } from '../../config/routes';

const icons: Record<RouteIconName, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  products: <AppstoreOutlined />,
  stock: <InboxOutlined />,
  warehouse: <ApartmentOutlined />,
  transfer: <SwapOutlined />,
  purchase: <ShopOutlined />,
  supplier: <IdcardOutlined />,
  accounts: <BankOutlined />,
  journal: <BookOutlined />,
  invoice: <FileTextOutlined />,
  payment: <CreditCardOutlined />,
  expense: <DollarOutlined />,
  customer: <UserOutlined />,
  users: <TeamOutlined />,
  notifications: <BellOutlined />,
  audit: <AuditOutlined />,
  settings: <SettingOutlined />,
  profile: <UserOutlined />,
};

export function ShellIcon({ name }: { name: RouteIconName }) {
  return <>{icons[name]}</>;
}
