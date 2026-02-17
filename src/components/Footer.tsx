import { Typography, Space, Divider } from 'antd';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} style={{
      padding: '40px 20px 100px',
      textAlign: 'center',
      background: '#f9f9f9',
      borderTop: '1px solid #f0f0f0'
    }}>
      <Space separator={<Divider orientation="vertical" />} style={{ marginBottom: '20px' }}>
        <Typography.Link href="#" style={{ color: '#666' }}>利用規約</Typography.Link>
        <Typography.Link href="#" style={{ color: '#666' }}>プライバシーポリシー</Typography.Link>
        <Typography.Link href="#" style={{ color: '#666' }}>お問い合わせ</Typography.Link>
      </Space>
      <div style={{ marginTop: '10px' }}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          &copy; 2026 AUREUM BEAUTY. 全著作権所有。
        </Typography.Text>
      </div>
    </footer>
  );
}
